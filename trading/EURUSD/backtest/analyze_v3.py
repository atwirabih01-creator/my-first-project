"""Agent 2: summary statistics for EURUSD v3 (reads trades_v3.csv, late_v3.csv, trades_v3_p65.csv if present).
Writes summary_v3.txt, weekly_v3.csv and weekly_v3_table.md next to this script."""
from pathlib import Path
import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
T = pd.read_csv(HERE / "trades_v3.csv")
L = pd.read_csv(HERE / "late_v3.csv")
out = []


def runs(r):
    best = cur = 0; n3 = 0
    for x in r:
        if x <= 0:
            cur += 1
        else:
            if cur >= 3: n3 += 1
            cur = 0
        best = max(best, cur)
    if cur >= 3: n3 += 1
    return best, n3


def stats(r):
    r = np.asarray(r, float)
    if len(r) == 0:
        return dict(n=0)
    eq = np.cumsum(r); peak = np.maximum.accumulate(np.r_[0, eq])[1:]
    bal = np.cumprod(1 + 0.01 * r); bpk = np.maximum.accumulate(np.r_[1, bal])[1:]
    w, l = r[r > 0], r[r <= 0]
    lr, n3 = runs(r)
    return dict(n=len(r), win=len(w) / len(r) * 100, aw=w.mean() if len(w) else 0, al=l.mean() if len(l) else 0,
                tot=r.sum(), avg=r.mean(), pf=w.sum() / -l.sum() if l.sum() < 0 else np.inf,
                dd=(eq - peak).min(), ddp=((bal / bpk) - 1).min() * 100, lrun=lr, n3=n3)


def boot(r, n=10000, seed=7):
    r = np.asarray(r, float)
    if len(r) < 2: return np.nan
    rng = np.random.default_rng(seed)
    m = rng.choice(r, (n, len(r))).mean(axis=1)
    return (m <= 0).mean() * 100


def row(name, r):
    s = stats(r)
    if s["n"] == 0:
        return f"| {name} | 0 | | | | | | | | | |"
    return (f"| {name} | {s['n']} | {s['win']:.1f}% | {s['aw']:+.2f} / {s['al']:+.2f} | {s['tot']:+.2f} R | {s['avg']:+.3f} | "
            f"{s['pf']:.2f} | {s['dd']:.1f} R ({s['ddp']:.1f}%) | {s['lrun']} | {s['n3']} | {boot(r):.0f}% |")


HDR = "| Period | Trades | Win | Avg win / loss | Total | R per trade | PF | Max drop | Longest losing run | 3+ runs | Chance avg <= 0 |\n|---|---|---|---|---|---|---|---|---|---|---|"
H, D = T[T.period == "H"], T[T.period == "D"]
groups = [(str(y), T[T.year == y]) for y in sorted(T.year.unique())]
out.append("## Per year (cost 1.2 pips)\n" + HDR)
for name, x in groups:
    out.append(row(name + (" (hidden)" if name < "2019" else ""), x.R))
out.append(row("**HIDDEN 2016-2018**", H.R)); out.append(row("Design 2019-2026", D.R)); out.append(row("All", T.R))

out.append("\n## Cost stress: total R (R per trade) at 0 / 1.2 / 2.4 pips")
for name, x in [("Hidden", H), ("Design", D), ("All", T)] + groups:
    out.append(f"{name}: " + " / ".join(f"{x[c].sum():+.2f} ({x[c].mean():+.3f})" for c in ["r_0", "r_1.2", "r_2.4"]))
for c in ["r_1.2", "r_2.4"]:
    for nm, x in [("Hidden", H), ("Design", D)]:
        yy = x.groupby("year")[c].sum()
        out.append(f"{nm} years positive at {c[2:]} pips: {(yy > 0).sum()} of {len(yy)}  " + ", ".join(f"{k} {v:+.1f}" for k, v in yy.items()))
out.append(f"Hidden longest losing run at 2.4 pips: {stats(H['r_2.4'])['lrun']}; max drop {stats(H['r_2.4'])['dd']:.1f} R")

out.append("\n## Long vs short")
for nm, x in [("Hidden", H), ("Design", D), ("All", T)]:
    s = []
    for dr in ["long", "short"]:
        z = x[x.direction == dr]; st = stats(z.R)
        s.append(f"{dr}s {st['n']} tr, {st.get('win',0):.0f}% won, {st.get('tot',0):+.2f} R ({st.get('avg',0):+.3f}/tr; 2.4 pips {z['r_2.4'].sum():+.2f})")
    out.append(f"{nm}: " + " | ".join(s))
out.append("Per year longs / shorts (R): " + ", ".join(
    f"{y} {T[(T.year==y)&(T.direction=='long')].R.sum():+.1f}/{T[(T.year==y)&(T.direction=='short')].R.sum():+.1f}" for y in sorted(T.year.unique())))

out.append("\n## Weekday (trades, total R)")
for nm, x in [("Hidden", H), ("Design", D)]:
    out.append(f"{nm}: " + ", ".join(f"{d} {len(x[x.weekday==d])} {x[x.weekday==d].R.sum():+.2f}" for d in ["Mon", "Tue", "Wed", "Thu", "Fri"]))

out.append("\n## Without the best trades")
for nm, x in [("Hidden", H), ("Design", D), ("All", T)]:
    r = np.sort(x.R.values)
    out.append(f"{nm}: total {r.sum():+.2f}; without best 3 {r[:-3].sum():+.2f}; without best 5 {r[:-5].sum():+.2f}; best 5 = {', '.join(f'{v:+.2f}' for v in r[-5:][::-1])}")

out.append("\n## Exit types")
for nm, x in [("Hidden", H), ("Design", D)]:
    out.append(f"{nm}: " + "; ".join(f"{e} {len(g)} ({len(g)/len(x)*100:.0f}%) {g.R.sum():+.2f} R" for e, g in x.groupby("exit")))
    out.append(f"   stop size pips: median {x.stop_pips.median():.1f}, min {x.stop_pips.min():.1f}, max {x.stop_pips.max():.1f}; avg gross pips {x.gross_pips.mean():+.2f}")

out.append("\n## Entry 1 minute late (same 10:00 decision, filled at the close of the 10:00 NY bar; skipped if stop already hit in that bar)")
for nm, p in [("Hidden", "H"), ("Design", "D")]:
    x = L[L.period == p]; base = T[T.period == p]
    out.append(f"{nm}: {len(x)} trades (of {len(base)}), {x.R.sum():+.2f} R ({x.R.mean():+.3f}/tr) vs on time {base.R.sum():+.2f} R; "
               f"years: " + ", ".join(f"{k} {v:+.1f}" for k, v in x.groupby('year').R.sum().items()))

out.append("\n## News label (US 08:30 price shock days; label only)")
for nm, x in [("Hidden", H), ("Design", D)]:
    out.append(f"{nm}: " + "; ".join(f"{k} {len(g)} tr {g.R.sum():+.2f} R ({g.R.mean():+.3f})" for k, g in x.groupby("news")))

out.append("\n## US summer vs winter time")
for nm, x in [("Hidden", H), ("Design", D)]:
    out.append(f"{nm}: " + "; ".join(f"{'summer' if k else 'winter'} {len(g)} tr {g.R.sum():+.2f} R" for k, g in x.groupby("us_summer_time")))

T["month"] = T.date.str[:7]
out.append("\n## Hidden by month (trades, R)")
hm = T[T.period == "H"].groupby("month").R.agg(["size", "sum"])
out.append(", ".join(f"{k} {int(v['size'])} {v['sum']:+.1f}" for k, v in hm.iterrows()))
out.append(f"Hidden months positive: {(hm['sum']>0).sum()} of {len(hm)}")
T["half"] = T.year.astype(str) + np.where(T.date.str[5:7].astype(int) <= 6, "a", "b")
hh = T.groupby("half").R.sum()
out.append("Half-years: " + ", ".join(f"{k} {v:+.1f}" for k, v in hh.items()) + f"  -> positive {(hh>0).sum()} of {len(hh)}")

p65 = HERE / "trades_v3_p65.csv"
if p65.exists():
    P = pd.read_csv(p65)
    out.append("\n## SIDE-CHECK ONLY (not graded): 65th-percentile threshold (Agent 1's backup idea 1)\n" + HDR)
    for y in sorted(P.year.unique()):
        out.append(row(str(y), P[P.year == y].R))
    out.append(row("Hidden 2016-2018", P[P.period == "H"].R)); out.append(row("Design", P[P.period == "D"].R))
    ph = P[P.period == "H"]
    out.append(f"65th hidden at 2.4 pips: {ph['r_2.4'].sum():+.2f}; longs {ph[ph.direction=='long'].R.sum():+.2f} shorts {ph[ph.direction=='short'].R.sum():+.2f}")

txt = "\n".join(out)
open(HERE / "summary_v3.txt", "w").write(txt + "\n")
print(txt)

# ---- weekly table: one row per week (Monday start), Jan 2016 .. Sep 2026 ----
T["d"] = pd.to_datetime(T.date)
T["wk"] = T.d - pd.to_timedelta(T.d.dt.weekday, unit="D")
weeks = pd.date_range("2016-01-04", "2026-09-28", freq="W-MON")
rows, run = [], 0.0
for w in weeks:
    x = T[T.wk == w]
    r = x.R.values
    run += r.sum()
    per = "hidden" if w.year <= 2018 else "design"
    notes = []
    if w < pd.Timestamp("2016-05-23"): notes.append("warm-up (no trades possible)")
    if pd.Timestamp("2018-12-31") <= w < pd.Timestamp("2019-04-01"): notes.append("warm-up (no trades possible)")
    if pd.Timestamp("2023-02-01") <= w < pd.Timestamp("2023-08-01"): notes.append("data holes")
    if len(x):
        notes.append(" ".join(f"{a[:3]}{'L' if b=='long' else 'S'}{c:+.2f}" for a, b, c in zip(x.weekday, x.direction, x.R)))
    rows.append(dict(week=f"{w:%d %b %Y} - {(w + pd.Timedelta(days=4)):%d %b}", data=per, trades=len(r), wins=int((r > 0).sum()),
                     losses=int((r <= 0).sum()), win_rate=f"{(r>0).mean()*100:.0f}%" if len(r) else "-",
                     result=round(r.sum(), 2), running=round(run, 2), notes="; ".join(notes)))
W = pd.DataFrame(rows)
W.to_csv(HERE / "weekly_v3.csv", index=False)
md = ["| Week (Mon - Fri) | Data | Trades | Wins | Losses | Win rate | Result (R) | Running total (R) | Notes |", "|---|---|---|---|---|---|---|---|---|"]
for _, r in W.iterrows():
    res = f"{r.result:+.2f}" if r.trades else "0"
    md.append(f"| {r.week} | {r.data} | {r.trades} | {r.wins} | {r.losses} | {r.win_rate} | {res} | {r.running:+.2f} | {r.notes} |")
open(HERE / "weekly_v3_table.md", "w").write("\n".join(md) + "\n")
