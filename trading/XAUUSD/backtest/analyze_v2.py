"""Statistics for XAUUSD v2 from signals_v2.csv / trades_v2.csv -> summary_v2.txt and weekly_v2.csv (Agent 2).
Cost scenarios use the same signal days: R = (gross USD - cost) / risk, trades kept only if risk >= minimum stop."""
import os, numpy as np, pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sig = pd.read_csv(os.path.join(HERE, "signals_v2.csv"))
def scen(cost, mn):
    t = sig[sig.stop_usd >= mn].copy()
    t["R"] = (t.gross_usd - cost) / t.stop_usd
    return t.reset_index(drop=True)
tr = scen(0.40, 8.0)
tr["R_2x_cost"] = (tr.gross_usd - 0.80) / tr.stop_usd
tr["month"] = tr["date"].str[:7]
tr["ld_hour"] = tr["london_entry"].str[:2]
tr["ny_hour"] = tr["ny_entry"].str[:2]
out = []
P = lambda *a: out.append(" ".join(str(x) for x in a))
ORDER = ["C", "A", "Y1", "Y2", "B"]
rng = np.random.default_rng(12345)


def streaks(r):
    runs, cur = [], 0
    for x in r:
        if x <= 0:
            cur += 1
        else:
            if cur: runs.append(cur)
            cur = 0
    if cur: runs.append(cur)
    return (max(runs) if runs else 0), sum(1 for x in runs if x >= 3), sum(1 for x in runs if x >= 5)


def dd(r):
    eq = np.concatenate([[0], np.cumsum(r)])
    ddr = (eq - np.maximum.accumulate(eq)).min()
    bal = np.concatenate([[1.0], np.cumprod(1 + 0.01 * np.asarray(r))])
    ddp = (bal / np.maximum.accumulate(bal) - 1).min() * 100
    return ddr, ddp


def stats(s, col="R"):
    r = s[col].values
    if len(r) == 0:
        return dict(n=0)
    w, l = r[r > 0], r[r <= 0]
    mx, s3, s5 = streaks(r)
    ddr, ddp = dd(r)
    boot = rng.choice(r, size=(10000, len(r)), replace=True).mean(axis=1)
    best3 = np.sort(r)[:-3].sum() if len(r) > 3 else np.nan
    return dict(n=len(r), win=100 * len(w) / len(r), avgW=w.mean() if len(w) else 0, avgL=l.mean() if len(l) else 0,
                tot=r.sum(), avg=r.mean(), pf=w.sum() / -l.sum() if l.sum() < 0 else np.inf, ddr=ddr, ddp=ddp,
                maxrun=mx, s3=s3, s5=s5, p0=(boot <= 0).mean() * 100, xbest3=best3)


def line(name, s, col="R"):
    st = stats(s, col)
    if st["n"] == 0:
        P(f"{name:<28} n 0"); return st
    P(f"{name:<28} n {st['n']:>3} | win {st['win']:5.1f}% | avgW {st['avgW']:+.2f} avgL {st['avgL']:+.2f} | total {st['tot']:+7.2f}R "
      f"| avg {st['avg']:+.3f} | PF {st['pf']:.2f} | maxDD {st['ddr']:6.2f}R ({st['ddp']:5.1f}%) | run {st['maxrun']} "
      f"| 3+ runs {st['s3']} | 5+ runs {st['s5']} | P(avg<=0) {st['p0']:4.1f}% | w/o best3 {st['xbest3']:+.2f}R")
    return st


def groups_of(t):
    return [(p, t[t.period == p]) for p in ORDER] + [("Design A..B (36 m)", t[t.period != "C"]), ("ALL 48 months", t)]
for title, cost, mn in [("0.40 USD cost, 8 USD min stop (the v2 rules)", 0.40, 8), ("0.80 USD cost, 8 USD min stop (same rules, double cost)", 0.80, 8),
                        ("0.80 USD cost, 16 USD min stop (rule scaled: 20 x cost)", 0.80, 16),
                        ("1.20 USD cost, 24 USD min stop (rule scaled: 20 x cost)", 1.20, 24),
                        ("1.20 USD cost, 8 USD min stop (same rules, triple cost)", 1.20, 8),
                        ("0.00 USD cost, 8 USD min stop (before costs)", 0.0, 8)]:
    P(f"\n=== {title} ===")
    for n, s_ in groups_of(scen(cost, mn)): line(n, s_)

P("\n=== exits ===")
P(pd.crosstab(tr.period, tr.exit_reason).reindex(ORDER).to_string())
P("\n=== wins counted as R>0 ===")

for label, key in [("direction", "direction"), ("news day", "news_day"), ("London entry hour", "ld_hour"),
                   ("NY entry hour", "ny_hour"), ("weekday", "weekday")]:
    P(f"\n=== by {label} (per period: n / win% / total R) ===")
    for v in sorted(tr[key].dropna().unique()):
        cells = []
        for p in ORDER + ["ALL"]:
            s = tr[(tr[key] == v) & ((tr.period == p) if p != "ALL" else True)]
            cells.append(f"{p}: {len(s):>3} / {100*(s.R>0).mean() if len(s) else 0:4.0f}% / {s.R.sum():+6.1f}")
        P(f"{str(v):<6} " + " | ".join(cells))

P("\n=== by news event (all periods) ===")
for ev, s in tr[tr.news_day == "yes"].groupby("news_event"):
    P(f"{ev:<10} n {len(s):>3} win {100*(s.R>0).mean():4.0f}% total {s.R.sum():+6.1f}")

tr["stop_bucket"] = pd.cut(tr.stop_usd, [0, 12, 16, 24, 40, 1e9], labels=["8-12", "12-16", "16-24", "24-40", "40+"])
P("\n=== by stop size USD (per period: n / win% / total R) ===")
for v in tr.stop_bucket.cat.categories:
    cells = []
    for p in ORDER + ["ALL"]:
        s = tr[(tr.stop_bucket == v) & ((tr.period == p) if p != "ALL" else True)]
        cells.append(f"{p}: {len(s):>3} / {100*(s.R>0).mean() if len(s) else 0:4.0f}% / {s.R.sum():+6.1f}")
    P(f"{v:<6} " + " | ".join(cells))
# stop size relative to price (gold doubled over 3 years)
tr["stop_pct"] = tr.stop_usd / tr.entry * 100
P("\n=== by stop size as % of price ===")
for lo, hi in [(0, 0.5), (0.5, 0.8), (0.8, 1.2), (1.2, 99)]:
    cells = []
    for p in ORDER + ["ALL"]:
        s = tr[(tr.stop_pct >= lo) & (tr.stop_pct < hi) & ((tr.period == p) if p != "ALL" else True)]
        cells.append(f"{p}: {len(s):>3} / {100*(s.R>0).mean() if len(s) else 0:4.0f}% / {s.R.sum():+6.1f}")
    P(f"{lo}-{hi}% " + " | ".join(cells))

P("\n=== by month ===")
m = tr.groupby("month").agg(period=("period", "first"), n=("R", "size"), win=("R", lambda r: 100 * (r > 0).mean()),
                            R=("R", "sum"), R2=("R_2x_cost", "sum"))
m["cum"] = m.R.cumsum()
P(m.round(2).to_string())
P("\nlosing months per period:", {p: f"{(m[m.period==p].R<0).sum()} of {(m.period==p).sum()}" for p in ORDER})
P("best month share of total, per period:",
  {p: f"{m[m.period==p].R.max():+.1f} of {m[m.period==p].R.sum():+.1f}" for p in ORDER})

P("\n=== top / bottom trades ===")
P(tr.nlargest(5, "R")[["date", "period", "direction", "R", "exit_reason"]].to_string(index=False))
P("\n=== forced-close (16:00 NY) trades: share and result ===")
for p in ORDER:
    s_ = tr[tr.period == p]; fc = s_[s_.exit_reason == "16:00 close"]
    P(f"{p}: {len(fc)} of {len(s_)} ({100*len(fc)/max(len(s_),1):.0f}%), total {fc.R.sum():+.1f}R, won {100*(fc.R>0).mean() if len(fc) else 0:.0f}%")
P("\n=== C: data gap check (days with missing hours are skipped by the thin-day rule) ===")
P(tr[tr.period=="C"].groupby("month").size().to_string())

# --- weekly (Mon-Fri) table over all trading days, including weeks with no trade ---
all_days = pd.date_range("2022-10-03", "2026-09-30", freq="B")
wk = pd.DataFrame({"date": all_days})
wk["monday"] = wk.date - pd.to_timedelta(wk.date.dt.weekday, unit="D")
t = tr.copy(); t["d"] = pd.to_datetime(t.date)
t["monday"] = t.d - pd.to_timedelta(t.d.dt.weekday, unit="D")
rows = []
for mon in sorted(wk.monday.unique()):
    s = t[t.monday == mon]
    fri = mon + pd.Timedelta(days=4)
    per = sorted(set(s.period), key=ORDER.index) if len(s) else []
    if not per:
        per = sorted({p for p, a, b in [("C", "2022-10-01", "2023-09-30"), ("A", "2023-10-01", "2024-09-30"), ("Y1", "2024-10-01", "2025-09-30"),
                                        ("Y2", "2025-10-01", "2026-06-30"), ("B", "2026-07-01", "2026-09-30")]
                      for d in pd.date_range(mon, fri) if a <= str(d.date()) <= b}, key=ORDER.index)
    notes = []
    news = s[s.news_day == "yes"]
    if len(news): notes.append("news: " + ", ".join(f"{r.news_event} {r.R:+.1f}" for r in news.itertuples()))
    tc = s[s.exit_reason == "16:00 close"]
    if len(tc): notes.append(f"{len(tc)} closed at 16:00 NY")
    if pd.Timestamp("2023-02-20") <= mon <= pd.Timestamp("2023-07-28"): notes.append("C data gap: most days skipped")
    rows.append(dict(week=f"{mon:%d %b %Y} – {fri:%d %b %Y}", monday=mon.date(), period="/".join(per),
                     trades=len(s), wins=int((s.R > 0).sum()), losses=int((s.R <= 0).sum()), R=s.R.sum(),
                     notes="; ".join(notes)))
W = pd.DataFrame(rows)
W["cum"] = W.R.cumsum()
W.to_csv(os.path.join(HERE, "weekly_v2.csv"), index=False)
P("\n=== weeks ===")
for p in ORDER:
    s = W[W.period.str.contains(p)]
    P(f"{p}: weeks {len(s)}, losing weeks {(s.R<0).sum()}, flat {(s.R==0).sum()}, worst week {s.R.min():+.2f}R, best {s.R.max():+.2f}R")
P(f"ALL: weeks {len(W)}, losing {(W.R<0).sum()}, worst 4-week stretch {W.R.rolling(4).sum().min():+.2f}R, "
  f"worst 13-week stretch {W.R.rolling(13).sum().min():+.2f}R")

open(os.path.join(HERE, "summary_v2.txt"), "w").write("\n".join(out) + "\n")
print("\n".join(out))
