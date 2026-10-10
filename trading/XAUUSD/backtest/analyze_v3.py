"""
Analysis of XAUUSD v3 trades (Agent 2, round 3). Reads trades_v3.csv / days_v3.csv from backtest_v3.py.
Writes summary_v3.txt, weekly_v3.csv and weekly_v3_table.md.
    python3 trading/XAUUSD/backtest/analyze_v3.py
"""
import os, io, numpy as np, pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
tr = pd.read_csv(os.path.join(HERE, "trades_v3.csv"))
days = pd.read_csv(os.path.join(HERE, "days_v3.csv"))
tr["date"] = pd.to_datetime(tr["date"])
out = io.StringIO()


def p(*a):
    print(*a); print(*a, file=out)


def stats(r):
    r = np.asarray(r, float)
    n = len(r)
    if n == 0:
        return dict(n=0)
    w, l = r[r > 0], r[r <= 0]
    eq = np.cumsum(r); peak = np.maximum.accumulate(np.concatenate([[0], eq]))[1:]
    dd = (eq - peak).min()
    acct = np.cumprod(1 + 0.01 * r); apk = np.maximum.accumulate(np.concatenate([[1], acct]))[1:]
    ddp = ((acct - apk) / apk).min() * 100
    run = best = 0; runs3 = 0
    for x in r:
        if x <= 0:
            run += 1; best = max(best, run)
        else:
            runs3 += run >= 3; run = 0
    runs3 += run >= 3
    return dict(n=n, win=f"{len(w)/n*100:.0f}%", avgW=round(w.mean(), 2) if len(w) else 0, avgL=round(l.mean(), 2) if len(l) else 0,
                totR=round(r.sum(), 1), perTr=round(r.mean(), 3), PF=round(w.sum() / -l.sum(), 2) if l.sum() < 0 else np.inf,
                maxDD=round(dd, 1), ddPct=round(ddp, 1), lrun=best, runs3=runs3)


def table(groups, col="R"):
    rows = []
    for name, g in groups:
        s = stats(g[col]); s = {"group": name, **s}; rows.append(s)
    return pd.DataFrame(rows).to_string(index=False)


def boot(r, n=20000, seed=1):
    r = np.asarray(r, float)
    rng = np.random.default_rng(seed)
    m = rng.choice(r, size=(n, len(r)), replace=True).mean(1)
    return (m <= 0).mean() * 100


tr["period"] = np.where(tr.src == "hidden", "HIDDEN 2016-18", "design 2019-26")
H, D = tr[tr.src == "hidden"], tr[tr.src == "design"]

p("=== XAUUSD v3, Agent 2 independent backtest (cost 0.40 USD unless stated) ===")
p(table([(str(y), g) for y, g in tr.groupby("year")] + [("HIDDEN 2016-18", H), ("design 2019-26", D), ("ALL 2016-26", tr)]))

p("\n=== Cost stress (same trades, same 8 USD box) ===")
for col, c in [("R", "0.40"), ("R_2x", "0.80"), ("R_3x", "1.20")]:
    p(f"-- cost {c} USD")
    p(table([(str(y), g) for y, g in tr.groupby("year")] + [("HIDDEN", H), ("design", D), ("ALL", tr)], col))

p("\n=== Rule scaled to the cost (box >= 20 x cost), hidden / design / all ===")
for col, c in [("R_2x", 0.80), ("R_3x", 1.20)]:
    m = tr["box"] >= 20 * c
    p(f"cost {c}, box >= {20*c:.0f}: " + " | ".join(f"{nm} n={len(g[m.loc[g.index]])} {g.loc[m.loc[g.index], col].sum():+.1f}R" for nm, g in [("hidden", H), ("design", D), ("all", tr)]))

p("\n=== Long vs short ===")
p(table([(f"{pp} {d}", g) for (pp, d), g in tr.groupby(["period", "direction"])] + [(f"ALL {d}", g) for d, g in tr.groupby("direction")]))
p("long/short by year (R): " + "; ".join(f"{y}: L {g[g.direction=='long'].R.sum():+.1f} S {g[g.direction=='short'].R.sum():+.1f}" for y, g in tr.groupby("year")))

p("\n=== Weekday ===")
order = ["Mon", "Tue", "Wed", "Thu", "Fri"]
for nm, g0 in [("HIDDEN", H), ("design", D), ("ALL", tr)]:
    p(f"-- {nm}")
    p(table([(wd, g0[g0.weekday == wd]) for wd in order]))
p("ALL without Mon and Thu: " + str(stats(tr[~tr.weekday.isin(["Mon", "Thu"])].R)))
p("weekday R by year: ")
p(tr.pivot_table(index="year", columns="weekday", values="R", aggfunc="sum").reindex(columns=order).round(1).to_string())

p("\n=== Without the best 5 / best 10 trades ===")
for nm, g in [("HIDDEN", H), ("design", D), ("ALL", tr)]:
    s = g.R.sort_values(ascending=False)
    p(f"{nm}: total {s.sum():+.1f}R | without best 5 {s.iloc[5:].sum():+.1f}R | without best 10 {s.iloc[10:].sum():+.1f}R | best 5 = {', '.join(f'{x:+.2f}' for x in s.iloc[:5])}")

p("\n=== Bootstrap: chance the true average R per trade is zero or less (20,000 resamples) ===")
for nm, g in [("HIDDEN", H), ("design", D), ("ALL", tr)]:
    p(f"{nm}: {boot(g.R):.1f}%  (n={len(g)}, mean {g.R.mean():+.3f})")
p(f"HIDDEN at 0.80 USD: {boot(H.R_2x):.1f}%")

p("\n=== Exit types ===")
p(table([(f"{pp} {e}", g) for (pp, e), g in tr.groupby(["period", "exit_reason"])]))
p("entry gaps (filled beyond the box edge): " + str((tr.entry_gap == 'yes').sum()))

p("\n=== News-shock days (hindsight label: US 08:30/10:00/14:00 NY reaction > 3x normal) ===")
p(table([(f"{pp} news={n}", g) for (pp, n), g in tr.groupby(["period", "news_day"])]))

p("\n=== Oct 2022 - Sep 2023 window ===")
w = tr[(tr.date >= "2022-10-01") & (tr.date <= "2023-09-30")]
p(table([("Oct22-Sep23 @0.40", w)]))
p(table([("Oct22-Sep23 @0.80", w)], "R_2x"))

p("\n=== Hidden years by month ===")
hm = H.groupby(H.date.dt.to_period("M")).R.agg(["count", "sum"]).round(2)
p(hm.to_string())

p("\n=== Days and skips by year ===")
days["year"] = days["date"].str[:4]
p(pd.crosstab(days["year"], days["status"], margins=True).to_string())
p("median box (USD) on all checked days by year: " + str(days.groupby("year").box.median().round(1).to_dict()))
p("median risk (USD) on trades by year: " + str(tr.groupby("year").risk.median().round(1).to_dict()))

nf = os.path.join(HERE, "trades_v3_noclockfix.csv")
if os.path.exists(nf):
    t2 = pd.read_csv(nf); h2 = t2[t2.src == "hidden"]
    p("\n=== Hidden years WITHOUT the clock fix (raw file) ===")
    p(table([(str(y), g) for y, g in h2.groupby("year")] + [("HIDDEN raw", h2)]))

# ---------------- weekly table ----------------
tr["wk"] = tr.date - pd.to_timedelta(tr.date.dt.dayofweek, unit="D")
allw = pd.date_range("2015-12-28", "2026-09-28", freq="W-MON")
rows, run = [], 0.0
dd_ = pd.to_datetime(days["date"])
for wk in allw:
    g = tr[tr.wk == wk]
    dsel = days[(dd_ >= wk) & (dd_ < wk + pd.Timedelta(days=7))]
    if wk < pd.Timestamp("2016-01-04") and len(g) == 0:
        continue
    r = g.R.sum(); run += r
    src = "hidden" if wk.year <= 2018 and wk < pd.Timestamp("2018-12-31") else "design"
    notes = []
    if len(dsel) and (dsel.status == "skip_small_box").all():
        notes.append("all days box < 8 USD")
    elif (dsel.status == "skip_small_box").sum():
        notes.append(f"{(dsel.status=='skip_small_box').sum()} small-box days")
    gaps = dsel.status.isin(["skip_hole", "skip_thin_day"]).sum()
    if gaps:
        notes.append(f"{gaps} thin/gappy days skipped")
    if len(dsel) == 0:
        notes.append("no data")
    nn = g[g.news_day == "yes"]
    if len(nn):
        notes.append(f"news-shock days {nn.R.sum():+.1f}R")
    if len(g) and g.R.max() >= 3:
        notes.append(f"big winner {g.R.max():+.1f}R")
    rows.append(dict(week=f"{wk:%Y-%m-%d} to {wk + pd.Timedelta(days=4):%Y-%m-%d}", data=src, trades=len(g), wins=int((g.R > 0).sum()),
                     losses=int((g.R <= 0).sum()), win_rate=f"{(g.R > 0).mean()*100:.0f}%" if len(g) else "-",
                     result_R=round(r, 2), running_R=round(run, 2), notes="; ".join(notes)))
wkdf = pd.DataFrame(rows)
wkdf.to_csv(os.path.join(HERE, "weekly_v3.csv"), index=False)
md = ["| Week (Mon to Fri) | Data | Trades | Wins | Losses | Win rate | Result (R) | Running total (R) | Notes |",
      "|---|---|---|---|---|---|---|---|---|"]
for r in rows:
    md.append(f"| {r['week']} | {r['data']} | {r['trades']} | {r['wins']} | {r['losses']} | {r['win_rate']} | {r['result_R']:+.2f} | {r['running_R']:+.2f} | {r['notes']} |")
open(os.path.join(HERE, "weekly_v3_table.md"), "w").write("\n".join(md) + "\n")
traded = wkdf[wkdf.trades > 0]
p(f"\nweeks: {len(wkdf)}, with trades {len(traded)}, winning {(traded.result_R>0).sum()}, losing {(traded.result_R<=0).sum()}; "
  f"hidden weeks with trades {len(traded[traded.data=='hidden'])} (winning {(traded[traded.data=='hidden'].result_R>0).sum()})")
p("worst 5 weeks: " + "; ".join(f"{r.week[:10]} {r.result_R:+.2f}" for r in wkdf.nsmallest(5, 'result_R').itertuples()))
p("best 5 weeks: " + "; ".join(f"{r.week[:10]} {r.result_R:+.2f}" for r in wkdf.nlargest(5, 'result_R').itertuples()))
# longest flat stretch: longest time between equity highs
eq = tr.R.cumsum().values; dates = tr.date.values; best_gap = (0, None, None); hi_v, hi_d = -1e9, dates[0]
for e, d in zip(eq, dates):
    if e > hi_v:
        gap = (d - hi_d) / np.timedelta64(1, "D")
        if gap > best_gap[0]:
            best_gap = (gap, hi_d, d)
        hi_v, hi_d = e, d
p(f"longest time without a new equity high: {best_gap[0]:.0f} days ({pd.Timestamp(best_gap[1]):%Y-%m-%d} -> {pd.Timestamp(best_gap[2]):%Y-%m-%d})")
open(os.path.join(HERE, "summary_v3.txt"), "w").write(out.getvalue())
