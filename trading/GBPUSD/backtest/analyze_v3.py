"""
Analysis of GBPUSD v3 trades (Agent 2, round 3). Run backtest_v3.py first.
Usage: python3 trading/GBPUSD/backtest/analyze_v3.py
Writes: summary_v3.txt, weekly_v3.csv, weekly_v3_table.md
"""
from pathlib import Path
import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
T = pd.read_csv(HERE / "trades_v3.csv", parse_dates=["date"])
D = pd.read_csv(HERE / "days_v3.csv", parse_dates=["day"])
A1 = pd.read_csv(HERE.parent / "round3" / "v3_trades.csv", parse_dates=["day"])
ALT = pd.read_csv(HERE / "trades_v3_alt_median.csv", parse_dates=["date"])
T = T.sort_values("date").reset_index(drop=True)
T["year"] = T.date.dt.year
T["R3"] = (T.gross_p - 3.0) / T.risk_p           # double cost
out = []
P = lambda *a: out.append(" ".join(str(x) for x in a))


def runs(r):
    best = cur = 0
    n3 = 0
    for x in r:
        if x <= 0:
            cur += 1
        else:
            if cur >= 3:
                n3 += 1
            cur = 0
        best = max(best, cur)
    if cur >= 3:
        n3 += 1
    return best, n3


def stats(r):
    r = np.asarray(r, float)
    if len(r) == 0:
        return dict(n=0)
    eq = np.concatenate([[0], np.cumsum(r)])
    dd = (eq - np.maximum.accumulate(eq)).min()
    eqp = np.concatenate([[1], np.cumprod(1 + 0.01 * r)])
    ddp = ((eqp / np.maximum.accumulate(eqp)) - 1).min() * 100
    w, l = r[r > 0], r[r <= 0]
    lr, n3 = runs(r)
    return dict(n=len(r), win=100 * len(w) / len(r), avgw=w.mean() if len(w) else 0, avgl=l.mean() if len(l) else 0,
                tot=r.sum(), per=r.mean(), pf=w.sum() / -l.sum() if l.sum() < 0 else np.inf, dd=dd, ddp=ddp, lrun=lr, n3=n3)


HDR = f"{'':28s} {'n':>4s} {'win%':>5s} {'avgW':>5s} {'avgL':>6s} {'totR':>7s} {'R/tr':>7s} {'PF':>5s} {'maxDD':>6s} {'DD%':>6s} {'lrun':>4s} {'3+runs':>6s}"


def line(name, r):
    s = stats(r)
    if s["n"] == 0:
        return f"{name:28s}    0"
    return (f"{name:28s} {s['n']:4d} {s['win']:5.1f} {s['avgw']:+5.2f} {s['avgl']:+6.2f} {s['tot']:+7.2f} {s['per']:+7.3f} "
            f"{s['pf']:5.2f} {s['dd']:6.2f} {s['ddp']:6.1f} {s['lrun']:4d} {s['n3']:6d}")


H = T[T.period == "hidden"]
G = T[T.period == "design"]
for cost, col in [("1.5 pips (normal)", "R"), ("3.0 pips (double)", "R3")]:
    P(f"\n=== Per year and per period, cost {cost} ===")
    P(HDR)
    for y in range(2016, 2027):
        P(line(str(y) + (" hidden" if y <= 2018 else " design"), T[T.year == y][col]))
    P(line("HIDDEN 2016-2018", H[col]))
    P(line("DESIGN 2019-Sep 2026", G[col]))
    P(line("ALL 2016-Sep 2026", T[col]))

P("\n=== Long vs short ===")
P(HDR)
for per, df in [("hidden", H), ("design", G), ("all", T)]:
    for side in ["LONG", "SHORT"]:
        P(line(f"{per} {side}", df[df.direction == side].R))
        P(line(f"{per} {side} @3pips", df[df.direction == side].R3))

P("\n=== By weekday ===")
P(HDR)
for per, df in [("hidden", H), ("design", G), ("all", T)]:
    for wd in ["Mon", "Tue", "Wed", "Thu", "Fri"]:
        P(line(f"{per} {wd}", df[df.weekday == wd].R))
    P(line(f"{per} all except Wed", df[df.weekday != "Wed"].R))
P("hidden per year, Wednesday vs other days (total R):")
for y in [2016, 2017, 2018]:
    x = H[H.year == y]
    P(f"  {y}: Wed {x[x.weekday == 'Wed'].R.sum():+.2f} ({(x.weekday == 'Wed').sum()} tr), other days {x[x.weekday != 'Wed'].R.sum():+.2f}")

P("\n=== Without the best trades ===")
for per, df in [("hidden", H), ("design", G), ("all", T)]:
    r = df.R.sort_values(ascending=False)
    P(f"{per}: total {r.sum():+.2f} | without best 5 {r.iloc[5:].sum():+.2f} | without best 10 {r.iloc[10:].sum():+.2f} | best 5 = "
      + ", ".join(f"{x:+.2f}" for x in r.iloc[:5]))
for y in [2016, 2017, 2018]:
    r = H[H.year == y].R.sort_values(ascending=False)
    P(f"  {y}: total {r.sum():+.2f}, without best 3 {r.iloc[3:].sum():+.2f}, without best 5 {r.iloc[5:].sum():+.2f}")

P("\n=== Bootstrap (10,000 resamples of the trades): chance the true average is zero or less ===")
rng = np.random.default_rng(1)
for per, df in [("hidden", H), ("design", G), ("all", T)]:
    for col in ["R", "R3"]:
        r = df[col].values
        bs = rng.choice(r, (10000, len(r))).mean(1)
        P(f"{per} {col:2s}: mean {r.mean():+.3f}, 90% range {np.percentile(bs, 5):+.3f} .. {np.percentile(bs, 95):+.3f}, "
          f"P(mean<=0) = {(bs <= 0).mean():.1%}")

P("\n=== Exit types ===")
for per, df in [("hidden", H), ("design", G), ("all", T)]:
    g = df.groupby("exit_type").R.agg(["size", "sum", "mean"])
    P(f"{per}:\n{g.round(2).to_string()}")

P("\n=== Fill times (London clock) and gapped fills ===")
T["fill_hour_ldn"] = T.fill_london.str[:2] + ":00 London"
for per, df in [("hidden", T[T.period == "hidden"]), ("design", T[T.period == "design"]), ("all", T)]:
    g = df.groupby("fill_hour_ldn").R.agg(["size", "sum", "mean"])
    P(f"{per}:\n{g.round(2).to_string()}")
    first15 = (df.fill_london <= "07:14").mean()
    P(f"  share filled 07:00-07:14 London: {first15:.0%}; first-minute (07:00) fills: {(df.fill_london == '07:00').sum()}; "
      f"gapped fills (worse than the level): {df.gapped_fill.sum()}")

P("\n=== Risk (stop distance) in pips ===")
for per, df in [("hidden", H), ("design", G)]:
    P(f"{per}: median {df.risk_p.median():.1f}, min {df.risk_p.min():.1f}, max {df.risk_p.max():.1f}; "
      f"cost share at 1.5 pips = {(1.5 / df.risk_p).mean():.3f} R per trade")

P("\n=== Quietness (Asia range / median) buckets: does 'quieter = better' hold on hidden data? ===")
T["qb"] = pd.cut(T.ratio, [0, 0.5, 0.6, 0.7], labels=["<0.5", "0.5-0.6", "0.6-0.7"])
for per, df in [("hidden", T[T.period == "hidden"]), ("design", T[T.period == "design"])]:
    P(f"{per}:\n{df.groupby('qb', observed=True).R.agg(['size', 'sum', 'mean']).round(3).to_string()}")

P("\n=== News days (NFP = US jobs report, FOMC = US rate decision; rule-based dates, approximate) ===")
T["isnews"] = T.news.fillna("").str.contains("NFP|FOMC")
for per, df in [("hidden", T[T.period == "hidden"]), ("design", T[T.period == "design"]), ("all", T)]:
    P(line(f"{per} NFP/FOMC days", df[df.isnews].R))
    P(line(f"{per} normal days", df[~df.isnews].R))

P("\n=== Brexit vote (23 Jun 2016, result overnight into 24 Jun) ===")
b = D[(D.day >= "2016-06-20") & (D.day <= "2016-07-01")][["day", "weekday", "asia_range_p", "median20_p", "status"]]
P(b.to_string(index=False))
bt = T[(T.date >= "2016-06-23") & (T.date <= "2016-07-31")]
P("Trades 23 Jun - 31 Jul 2016:")
P(bt[["date", "weekday", "direction", "fill_london", "risk_p", "exit_type", "R"]].to_string(index=False))
P(f"Hidden without 23 Jun - 31 Jul 2016: {H[~H.date.between('2016-06-23', '2016-07-31')].R.sum():+.2f} R "
  f"({(~H.date.between('2016-06-23', '2016-07-31')).sum()} trades)")
P(f"Hidden 2016 without 23 Jun - 31 Jul 2016: {H[(H.year == 2016) & ~H.date.between('2016-06-23', '2016-07-31')].R.sum():+.2f} R")
fc = D[D.day.between("2016-10-06", "2016-10-10")][["day", "asia_range_p", "median20_p", "status"]]
P("Pound flash crash (7 Oct 2016, during Asia):")
P(fc.to_string(index=False))

P("\n=== Months and quarters ===")
T["month"] = T.date.dt.to_period("M")
T["q"] = T.date.dt.to_period("Q")
for per in ["hidden", "design"]:
    m = T[T.period == per].groupby("month").R.sum()
    q = T[T.period == per].groupby("q").R.sum()
    P(f"{per}: months positive {(m > 0).sum()} of {len(m)} (months with trades); worst month {m.idxmin()} {m.min():+.2f}; "
      f"best {m.idxmax()} {m.max():+.2f}")
    P(f"{per}: quarters positive {(q > 0).sum()} of {len(q)}; worst 3 quarters: "
      + ", ".join(f"{k} {v:+.2f}" for k, v in q.nsmallest(3).items()))
P("Hidden by quarter: " + ", ".join(f"{k} {v:+.1f}" for k, v in T[T.period == 'hidden'].groupby('q').R.sum().items()))

P("\n=== Losing runs (all trades in date order) ===")
for per, df in [("hidden", H), ("design", G), ("all", T)]:
    r = df.R.values
    lens, cur = [], 0
    for x in r:
        if x <= 0:
            cur += 1
        else:
            if cur:
                lens.append(cur)
            cur = 0
    if cur:
        lens.append(cur)
    vc = pd.Series(lens).value_counts().sort_index()
    P(f"{per}: run lengths {dict(vc)}")

P("\n=== Consistency with Agent 1 (design, round3/v3_trades.csv) ===")
A1["date"] = A1.day
m = A1.merge(G, on="date", how="outer", indicator=True)
both = m[m._merge == "both"]
P(f"Agent 1: {len(A1)} trades {A1.R.sum():+.2f} R | Agent 2: {len(G)} trades {G.R.sum():+.2f} R")
P(f"Same days: {len(both)}; same direction: {(both.side == both.direction.map({'LONG': 1, 'SHORT': -1})).sum()}; "
  f"largest R difference on same days: {(both.R_x - both.R_y).abs().max():.5f}")
P("Only Agent 1: " + ", ".join(f"{r.date.date()} ({r.R_x:+.2f})" for r in m[m._merge == 'left_only'].itertuples()))
P("Only Agent 2: " + ", ".join(f"{r.date.date()} ({r.R_y:+.2f})" for r in m[m._merge == 'right_only'].itertuples()))
for per in ["hidden", "design"]:
    a = ALT[ALT.period == per]
    P(f"Alternative median reading (only rule-11-valid days count): {per} {len(a)} trades {a.R.sum():+.2f} R")

# ---------------------------------------------------------------- weekly table
D["week"] = D.day - pd.to_timedelta(D.day.dt.weekday, unit="D")
T["week"] = T.date - pd.to_timedelta(T.date.dt.weekday, unit="D")
weeks = pd.date_range(pd.Timestamp("2016-01-04"), pd.Timestamp("2026-09-28"), freq="W-MON")
rows, run_tot = [], 0.0
SPECIAL = {"2016-06-24": "BREXIT result Fri 24 Jun: Asia box 1,654 pips, no trade",
           "2016-10-07": "pound flash crash Fri 7 Oct (in Asia): box 584 pips, no trade"}
short = {"skip: fewer than 1,300 bars (holiday/short day)": "holiday/short day",
         "skip: data hole > 15 min": "data hole", "skip: warm-up (fewer than 20 earlier days)": "warm-up",
         "setup, both sides broken in the same minute": "both sides broken same minute",
         "setup, no breakout by 11:59 London": "quiet night, no breakout"}
for w in weeks:
    t = T[T.week == w].sort_values("date")
    d = D[D.week == w]
    res = t.R.sum()
    run_tot += res
    wins, losses = int((t.R > 0).sum()), int((t.R <= 0).sum())
    notes = []
    for r in t.itertuples():
        ex = {"stop": "stop", "target": "target", "15:59 NY close": "15:59 close"}[r.exit_type]
        tag = f" ({r.news})" if isinstance(r.news, str) and r.news else ""
        notes.append(f"{r.weekday} {r.direction.lower()} {ex} {r.R:+.2f}{tag}")
    sk = d[d.status.isin(short)].status.map(short).value_counts()
    if len(sk):
        notes.append("skipped: " + ", ".join(f"{k} ({v} d)" for k, v in sk.items()))
    if len(d) == 0:
        notes.append("no data")
    for day, txt in SPECIAL.items():
        if w <= pd.Timestamp(day) <= w + pd.Timedelta(days=4):
            notes.append(txt)
    period = "hidden" if w.year <= 2018 else "design"
    if w == pd.Timestamp("2018-12-31"):
        period = "hidden/design"
    rows.append(dict(week=f"{w:%d %b %y} - {(w + pd.Timedelta(days=4)):%d %b %y}", period=period, trades=len(t), wins=wins,
                     losses=losses, win_rate=f"{100 * wins / len(t):.0f}%" if len(t) else "-",
                     result=round(res, 2), running=round(run_tot, 2), notes="; ".join(notes)))
W = pd.DataFrame(rows)
W.to_csv(HERE / "weekly_v3.csv", index=False)
md = ["| Week (Mon - Fri) | Period | Trades | Wins | Losses | Win rate | Result (R) | Running total (R) | Notes |",
      "|---|---|---|---|---|---|---|---|---|"]
for r in W.itertuples():
    res = f"{r.result:+.2f}" if r.trades else "0"
    md.append(f"| {r.week} | {r.period} | {r.trades} | {r.wins} | {r.losses} | {r.win_rate} | {res} | {r.running:+.2f} | {r.notes} |")
(HERE / "weekly_v3_table.md").write_text("\n".join(md) + "\n")
wk = W[W.trades > 0]
P(f"\nWeeks with trades: {len(wk)}; positive {(wk.result > 0).sum()}, negative {(wk.result < 0).sum()}; "
  f"worst week {wk.result.min():+.2f}, best {wk.result.max():+.2f}")
for per in ["hidden", "design"]:
    x = W[(W.period == per) & (W.trades > 0)]
    P(f"  {per}: weeks with trades {len(x)}, positive {(x.result > 0).sum()}, negative {(x.result < 0).sum()}")
(HERE / "summary_v3.txt").write_text("\n".join(out) + "\n")
print("\n".join(out))
