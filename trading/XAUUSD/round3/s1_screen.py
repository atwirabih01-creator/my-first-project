"""Stage-1 screens S0..S20 (see TESTS_DECLARED.md). Output out_s1.txt. Units: % of ATR20."""
import numpy as np, pandas as pd, common3 as c
from gold3 import *
out = []
def P(line): out.append(line); print(line)
def rec(vals, mask, label): P(yearly(vals, mask, label)[0])

A0, A1, W1 = lc(0), lc(7), lc(12)
asia = np.array([rng_hi_lo(i, A0[i], A1[i]) for i in range(n)])
ar = pd.Series(asia[:, 0] - asia[:, 1]); armed = ar.rolling(20, min_periods=15).median().shift(1).values
ratio = ar.values / armed
# S0 base: first London break of Asia range
s0 = np.full(n, np.nan); s0dir = np.zeros(n)
for i in range(n):
    if not complete[i] or np.isnan(ATR[i]) or np.isnan(asia[i, 0]): continue
    r = first_break(i, asia[i, 0], asia[i, 1], A1[i], W1[i])
    if r is None or r == "x": continue
    d, k, e = r; s0[i] = d * (C[i, CL] - e) / ATR[i] * 100; s0dir[i] = d
ok = ~np.isnan(s0)
P("== Family 1: squeeze"); rec(s0, ok, "S0 follow London break of Asia, all days")
rec(s0, ok & (ratio < 0.7), "S1 S0 if Asia range < 0.7 x 20d median")
for lo_, hi_ in [(0, .6), (.6, .8), (.8, 1.0), (1.0, 1.3), (1.3, 99)]:
    rec(s0, ok & (ratio >= lo_) & (ratio < hi_), f"   S1 bucket ratio {lo_}-{hi_}")
# S2 quiet previous day -> follow break of previous day H/L 03:00-12:00 NY
pr = drange.shift(1).values; prmed = drange.rolling(20, min_periods=15).median().shift(2).values
s2 = np.full(n, np.nan)
for i in range(1, n):
    if not (complete[i] and complete[i-1]) or np.isnan(ATR[i]): continue
    if not pr[i] < 0.7 * prmed[i]: continue
    # level must not already be broken before 03:00 NY
    hi, lo = dh[i-1], dl[i-1]; h0, l0 = rng_hi_lo(i, 60, ny(3))
    if h0 > hi or l0 < lo: continue
    r = first_break(i, hi, lo, ny(3), ny(12))
    if r is None or r == "x": continue
    d, k, e = r; s2[i] = d * (C[i, CL] - e) / ATR[i] * 100
rec(s2, ~np.isnan(s2), "S2 quiet prev day (<0.7 med), follow break of PDH/PDL 03-12 NY")
# S3 quiet pre-NY range 03:00-08:19
pre = np.array([rng_hi_lo(i, ny(3), ny(8, 20)) for i in range(n)])
prg = pd.Series(pre[:, 0] - pre[:, 1]); prgmed = prg.rolling(20, min_periods=15).median().shift(1).values
s3 = np.full(n, np.nan); s3all = np.full(n, np.nan)
for i in range(n):
    if not complete[i] or np.isnan(ATR[i]) or np.isnan(pre[i, 0]): continue
    r = first_break(i, pre[i, 0], pre[i, 1], ny(8, 20), ny(12))
    if r is None or r == "x": continue
    d, k, e = r; v = d * (C[i, CL] - e) / ATR[i] * 100; s3all[i] = v
    if prg[i] < 0.7 * prgmed[i]: s3[i] = v
rec(s3all, ~np.isnan(s3all), "   S3 base: follow break of 03:00-08:19 NY range, all days")
rec(s3, ~np.isnan(s3), "S3 quiet pre-NY range (<0.7 med) follow break 08:20-12 NY")

P("== Family 2: mood switch on S0")
cl = pd.Series(np.where(complete, dclose, np.nan)).ffill()
er = (cl - cl.shift(10)).abs() / cl.diff().abs().rolling(10).sum()
er = er.shift(1); ermed = er.rolling(250, min_periods=120).median().values; er = er.values
fol = er >= ermed
rec(np.where(fol, s0, -s0), ok & ~np.isnan(ermed), "S4 ER10 switch (follow if trending, fade if not)")
rec(s0, ok & fol, "   S4a follow part (trending)"); rec(-s0, ok & ~fol & ~np.isnan(ermed), "   S4b fade part (not trending)")
tr = np.sign((cl.shift(1) - cl.shift(21)).values)
rec(np.where(s0dir == tr, s0, -s0), ok, "S5 trend switch (follow with-trend breaks, fade counter)")
rec(s0, ok & (s0dir == tr), "   S5a with-trend breaks, follow"); rec(-s0, ok & (s0dir == -tr), "   S5b counter-trend breaks, fade")
vr = ATR5 / ATR60
rec(np.where(vr >= 1, s0, -s0), ok & ~np.isnan(vr), "S6 vol switch (ATR5/ATR60>=1 follow, else fade)")
rec(s0, ok & (vr >= 1), "   S6a vol rising, follow"); rec(-s0, ok & (vr < 1), "   S6b vol falling, fade")

P("== Family 3: cross-market")
E = other("EURUSD"); N = other("NSXUSD")
def mv(X, i, a, b): return X["C"][i, b - 1] - X["O"][i, a]
s7 = np.full(n, np.nan); s9 = np.full(n, np.nan)
gx, ex = np.full(n, np.nan), np.full(n, np.nan)
for i in range(n):
    if not complete[i] or np.isnan(ATR[i]): continue
    e = mv(E, i, ny(3), ny(8))
    if not np.isnan(e) and e != 0: s7[i] = np.sign(e) * (C[i, ny(10, 59)] - O[i, ny(8)]) / ATR[i] * 100
    g = mv(M, i, ny(2), ny(8)) / O[i, ny(2)]; ee = mv(E, i, ny(2), ny(8)) / E["O"][i, ny(2)]
    gx[i], ex[i] = g, ee
    nx = mv(N, i, ny(9, 30), ny(10, 30))
    if not np.isnan(nx) and nx != 0: s9[i] = -np.sign(nx) * (C[i, CL] - O[i, ny(10, 30)]) / ATR[i] * 100
rec(s7, ~np.isnan(s7), "S7 EURUSD 03-08 NY sign -> gold 08-11 NY")
# S8 residual
gs, es = pd.Series(gx), pd.Series(ex)
cov = (gs * es).rolling(250, min_periods=120).mean() - gs.rolling(250, min_periods=120).mean() * es.rolling(250, min_periods=120).mean()
beta = (cov / es.rolling(250, min_periods=120).var(ddof=0)).shift(1)
res = gs - beta * es
q1 = res.rolling(250, min_periods=120).quantile(.25).shift(1); q3 = res.rolling(250, min_periods=120).quantile(.75).shift(1)
fwd = np.array([(C[i, CL] - O[i, ny(8)]) / ATR[i] * 100 if complete[i] else np.nan for i in range(n)])
s8 = np.where(res > q3, -fwd, np.where(res < q1, fwd, np.nan))
rec(s8, ~np.isnan(s8), "S8 gold-vs-dollar residual extreme quartile, fade 08-15:59")
P(f"   (median beta gold vs EUR: {np.nanmedian(beta):.2f})")
rec(s9, ~np.isnan(s9), "S9 Nasdaq 09:30-10:30 down -> gold up 10:30-15:59")
# S10 EUR 15-min shock, gold lagging
blocks = [ny(3) + 15 * j for j in range(36)]
def bmove(X, a): return X["C"][:, a + 14] - X["O"][:, a]
s10 = []
s10m = []
for a in blocks:
    em = bmove(E, a); gm = bmove(M, a)
    emed = pd.Series(np.abs(em)).rolling(20, min_periods=15).median().shift(1).values
    gmed = pd.Series(np.abs(gm)).rolling(20, min_periods=15).median().shift(1).values
    ez = em / emed; gz = gm / gmed
    sel = complete & (np.abs(ez) > 2.5) & (np.sign(ez) * gz < 0.4 * np.abs(ez)) & ~np.isnan(ATR)
    for i in np.where(sel)[0]:
        f = C[i, a + 74] - C[i, a + 14]
        if np.isnan(f): continue
        s10.append((i, np.sign(ez[i]) * f / ATR[i] * 100))
v = np.full(n, np.nan); tmp = pd.DataFrame(s10, columns=["i", "v"]).groupby("i").v.mean(); v[tmp.index] = tmp.values
rec(v, ~np.isnan(v), "S10 EUR 15m shock, gold lagging -> gold catch-up 60m (day avg)")

P("== Family 4: news shocks (price-defined)")
def shock(a, b_exit_list, name):
    m = (C[:, a + 14] - O[:, a]); med = pd.Series(np.abs(m)).rolling(20, min_periods=15).median().shift(1).values
    sel = complete & (np.abs(m) > 3 * med) & ~np.isnan(ATR)
    for bx in b_exit_list:
        f = np.sign(m) * (C[:, bx] - C[:, a + 14]) / ATR * 100
        rec(f, sel, f"{name} follow -> col {bx} ({(bx//60+17)%24:02d}:{bx%60:02d} NY)")
shock(ny(8, 30), [ny(10, 59), CL], "S11 08:30 shock")
shock(ny(10), [CL], "S12 10:00 shock")
shock(ny(14), [CL], "S13 14:00 shock")

P("== Family 5: time of day / calendar")
rows = np.arange(n)
def colv(X, cols): return X[rows, cols]
am = colv(C, lc(10, 29)) - colv(O, lc(10)); amf = -np.sign(am) * (colv(C, lc(11, 59)) - colv(C, lc(10, 29))) / ATR * 100
rec(amf, complete & (am != 0), "S14 London AM fix: fade 10:00-10:30 Ldn move to 12:00 Ldn")
pm = colv(C, lc(14, 59)) - colv(O, lc(14)); pmf = -np.sign(pm) * (C[:, CL] - colv(C, lc(14, 59))) / ATR * 100
rec(pmf, complete & (pm != 0), "S15 London PM fix: fade 14:00-15:00 Ldn move to 15:59 NY")
cx = C[:, ny(8, 49)] - O[:, ny(8, 20)]; s16 = np.sign(cx) * (C[:, ny(10, 59)] - C[:, ny(8, 49)]) / ATR * 100
rec(s16, complete & (cx != 0), "S16 COMEX open 08:20-08:50 follow to 11:00 NY")
sh = colv(C, utc(3, 29)) - colv(O, utc(1)); s17 = np.sign(sh) * (colv(C, lc(11, 59)) - colv(O, lc(7))) / ATR * 100
rec(s17, complete & (sh != 0), "S17 Shanghai morning move -> London 07-12 follow")
dser = pd.Series(days); last = (dser.dt.month != dser.shift(-1).dt.month).values
me = C[:, ny(9, 59)] - O[:, ny(8)]; s18 = -np.sign(me) * (C[:, CL] - C[:, ny(9, 59)]) / ATR * 100
rec(s18, complete & last & (me != 0), "S18 month-end fade 08-10 NY move to 15:59")
for nm, a, b in [("Asia 18:00-02:00", ny(18), ny(2)), ("Asia excl. 18:00 hour 19:00-02:00", ny(19), ny(2)),
                 ("London 02:00-08:20", ny(2), ny(8, 20)), ("NY 08:20-15:59", ny(8, 20), ny(16))]:
    rec((C[:, b - 1] - O[:, a]) / ATR * 100, complete, f"S19 drift {nm}")
im = C[:, ny(11, 59)] - O[:, ny(18)]; s20 = np.sign(im) * (C[:, CL] - C[:, ny(11, 59)]) / ATR * 100
rec(s20, complete & (im != 0), "S20 intraday momentum 18:00-12:00 -> 12:00-15:59")
open("out_s1.txt", "w").write("\n".join(out) + "\n")
