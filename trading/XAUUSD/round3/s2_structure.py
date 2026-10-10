"""Stage-2 structure checks S21..S26. Output out_s2.txt"""
import numpy as np, pandas as pd, common3 as c
from gold3 import *
out = []
def P(line): out.append(line); print(line)
def rec(vals, mask, label): P(yearly(vals, mask, label)[0])
A0, A1, W1 = lc(0), lc(7), lc(12)
asia = np.array([rng_hi_lo(i, A0[i], A1[i]) for i in range(n)])
ar = pd.Series(asia[:, 0] - asia[:, 1]); ratio = ar.values / ar.rolling(20, min_periods=15).median().shift(1).values
s0 = np.full(n, np.nan); s0d = np.zeros(n); s0noon = np.full(n, np.nan)
for i in range(n):
    if not complete[i] or np.isnan(ATR[i]) or np.isnan(asia[i, 0]): continue
    r = first_break(i, asia[i, 0], asia[i, 1], A1[i], W1[i])
    if r is None or r == "x": continue
    d, k, e = r; s0[i] = d * (C[i, CL] - e) / ATR[i] * 100; s0d[i] = d; s0noon[i] = d * (C[i, ny(11, 59)] - e) / ATR[i] * 100
ok = ~np.isnan(s0); vr = ATR5 / ATR60; q = vr < 1
P("== S21 dose-response ATR5/ATR60")
for a, b in [(0, .8), (.8, .9), (.9, 1.0), (1.0, 1.1), (1.1, 1.25), (1.25, 9)]:
    rec(s0, ok & (vr >= a) & (vr < b), f"S21 vr {a}-{b}")
P("== S22 2x2")
for qa in [True, False]:
    for ra in [True, False]:
        rec(s0, ok & (q == qa) & ((ratio < 1) == ra) & ~np.isnan(vr), f"S22 vr<1={qa} asia ratio<1={ra}")
P("== S23 long / short")
for nm, m in [("S0 all", ok), ("S0 vr<1", ok & q)]:
    rec(s0, m & (s0d > 0), f"S23 {nm} LONG"); rec(s0, m & (s0d < 0), f"S23 {nm} SHORT")
P("== S24 generality")
pre = np.array([rng_hi_lo(i, ny(3), ny(8, 20)) for i in range(n)])
s3 = np.full(n, np.nan); s2 = np.full(n, np.nan)
for i in range(1, n):
    if not complete[i] or np.isnan(ATR[i]): continue
    if not np.isnan(pre[i, 0]):
        r = first_break(i, pre[i, 0], pre[i, 1], ny(8, 20), ny(12))
        if r not in (None, "x"): d, k, e = r; s3[i] = d * (C[i, CL] - e) / ATR[i] * 100
    if complete[i-1]:
        hi, lo = dh[i-1], dl[i-1]; h0, l0 = rng_hi_lo(i, 60, ny(3))
        if not (h0 > hi or l0 < lo):
            r = first_break(i, hi, lo, ny(3), ny(12))
            if r not in (None, "x"): d, k, e = r; s2[i] = d * (C[i, CL] - e) / ATR[i] * 100
for nm, v in [("pre-NY range break", s3), ("PDH/PDL break 03-12", s2)]:
    rec(v, ~np.isnan(v) & ~np.isnan(vr), f"S24 {nm} all"); rec(v, ~np.isnan(v) & q, f"S24 {nm} vr<1"); rec(v, ~np.isnan(v) & (vr >= 1), f"S24 {nm} vr>=1")
P("== S25 other compression measures on S0")
ATR5_20 = ATR5 / ATR
rec(s0, ok & (ATR5_20 < 1), "S25 ATR5/ATR20<1"); rec(s0, ok & (ATR5_20 >= 1), "     ATR5/ATR20>=1")
pr = drange.shift(1).values
rec(s0, ok & (pr < ATR), "S25 prev-day range < ATR20"); rec(s0, ok & (pr >= ATR), "     prev-day range >= ATR20")
nr4 = (drange.shift(1) <= drange.shift(1).rolling(4).min()).values
rec(s0, ok & nr4, "S25 NR4 prev day"); rec(s0, ok & ~nr4, "     not NR4")
P("== S26 stability")
hy = np.array([f"{d.year}{'a' if d.month<=6 else 'b'}" for d in days])
s = pd.Series(s0)[ok & q]; P("S26 S0 vr<1 by half-year mean %ATR (n): " + " ".join(f"{k}:{v:+.1f}({c_})" for k, v, c_ in zip(s.groupby(hy[s.index]).mean().index, s.groupby(hy[s.index]).mean().values, s.groupby(hy[s.index]).size().values)))
P(f"S26 S0 vr<1: mean to 11:59 NY {np.nanmean(s0noon[ok & q]):+.2f}%ATR vs to 15:59 {np.nanmean(s0[ok & q]):+.2f}%ATR")
P(f"S26 S0 all : mean to 11:59 NY {np.nanmean(s0noon[ok]):+.2f}%ATR vs to 15:59 {np.nanmean(s0[ok]):+.2f}%ATR")
open("out_s2.txt", "w").write("\n".join(out) + "\n")
