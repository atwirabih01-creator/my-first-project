"""Gold round-3 v3 "Follow the active-Asia London break" - exact rules as in strategy.md (round-3 section). Agent 1 quick check.
Design data only (2019-01 .. 2026-09). Outputs: v3_trades.csv, out_v3.txt"""
import numpy as np, pandas as pd, common3 as c
from gold3 import M, days, n, H, L, C, O, lc, ny, complete
from tradestats import summarize
FLOOR, COST = 8.0, 0.40
A0, A1, W1 = lc(0), lc(7), lc(12)
XC = ny(16)                                           # forced close = close of the 15:59 NY bar
rows = []; skip = dict(incomplete=0, thin_asia=0, small_box=0, no_break=0, both_same_minute=0)
for i in range(n):
    if not complete[i]: skip["incomplete"] += 1; continue
    a0, a1 = A0[i], A1[i]
    if (~np.isnan(C[i, a0:a1])).sum() < 300: skip["thin_asia"] += 1; continue
    aH, aL = np.nanmax(H[i, a0:a1]), np.nanmin(L[i, a0:a1])
    if aH - aL < FLOOR: skip["small_box"] += 1; continue   # the stop would be < 8 USD in both directions
    sig = None
    for k in range(a1, W1[i]):
        h, l, o = H[i, k], L[i, k], O[i, k]
        if np.isnan(h): continue
        if h > aH and l < aL: sig = "x"; break
        if h > aH: sig = (1, k, max(aH, o)); break
        if l < aL: sig = (-1, k, min(aL, o)); break
    if sig is None: skip["no_break"] += 1; continue
    if sig == "x": skip["both_same_minute"] += 1; continue
    d, k, ent = sig
    stop = aL if d > 0 else aH; risk = abs(ent - stop)
    if risk < FLOOR: skip["small_box"] += 1; continue      # (gap fill beyond the level can only make risk larger)
    exitp, why = None, "close"
    for j in range(k, XC):
        h, l, o, cl = H[i, j], L[i, j], O[i, j], C[i, j]
        if np.isnan(cl): continue
        if j > k and ((d > 0 and o <= stop) or (d < 0 and o >= stop)): exitp, why = o, "stop_gap"; break
        if (d > 0 and l <= stop) or (d < 0 and h >= stop): exitp, why = stop, "stop"; break
        last = cl
    if exitp is None: exitp = last
    ny_t = f"{(17 * 60 + k) // 60 % 24:02d}:{k % 60:02d}"
    rows.append(dict(day=days[i].date(), side=d, entry_time_ny=ny_t, asia_high=round(aH, 2), asia_low=round(aL, 2), entry=round(ent, 2),
                     stop=round(stop, 2), risk=round(risk, 2), exit=round(exitp, 2), exit_type=why, gross=d * (exitp - ent)))
T = pd.DataFrame(rows)
out = []
for cost in (0.40, 0.80):
    txt, TT, df = summarize(T, "v3", cost, show=False); out.append(txt)
    if cost == 0.40: T["R"] = TT.R.round(4)
T.to_csv("v3_trades.csv", index=False)
r = T.R.values; eq = np.cumsum(r)
out.append(f"skipped days: {skip}")
out.append(f"exits: {T.exit_type.value_counts().to_dict()} | avg win {r[r>0].mean():+.2f}R avg loss {r[r<=0].mean():+.2f}R | median risk by year: "
           + " ".join(f"{y}:{v:.1f}" for y, v in T.groupby(pd.to_datetime(T.day).dt.year).risk.median().items()))
out.append(f"overall max drawdown {(eq - np.maximum.accumulate(np.r_[0, eq])[1:]).min():.1f}R | entries by NY hour: "
           + str(T.entry_time_ny.str[:2].value_counts().sort_index().to_dict()))
rng_ = np.random.default_rng(1); bs = np.array([rng_.choice(r, len(r)).mean() for _ in range(5000)])
out.append(f"bootstrap chance true average <= 0: {(bs <= 0).mean():.1%}")
w = T[(pd.to_datetime(T.day) >= "2022-10-01") & (pd.to_datetime(T.day) <= "2023-09-30")]
out.append(f"Oct 2022 - Sep 2023: {len(w)} trades {w.R.sum():+.1f}R")
print("\n".join(out)); open("out_v3.txt", "w").write("\n".join(out) + "\n")
