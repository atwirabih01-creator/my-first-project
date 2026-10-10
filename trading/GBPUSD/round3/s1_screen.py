"""Stage-1 screening of pre-declared tests S1..S19 (see TESTS_DECLARED.md). Output: out_s1.txt"""
import numpy as np, pandas as pd
import common3 as c

G = c.load_matrix("GBPUSD")
days = G["days"]
END = pd.Timestamp("2026-09-30")
keep_days = days <= END
yrs = days.year.values
P = c.PIP


def ffill(a):
    a = a.copy()
    m = np.isnan(a)
    idx = np.where(~m, np.arange(a.shape[1]), 0)
    np.maximum.accumulate(idx, axis=1, out=idx)
    out = a[np.arange(a.shape[0])[:, None], idx]
    return out


def align(sym):
    M = c.load_matrix(sym)
    pos = pd.Index(M["days"]).get_indexer(days)
    out = {}
    for k in "OHLC":
        arr = np.full((len(days), 1440), np.nan)
        ok = pos >= 0
        arr[ok] = M[k][pos[ok]]
        out[k] = arr
    return out


CF = ffill(G["C"])
off = G["ldn_off"]


def px(col):
    """price at the START of minute col (= last close before it). col scalar or per-day array"""
    col = np.broadcast_to(np.asarray(col), (len(days),))
    return CF[np.arange(len(days)), col - 1]


def lcol(h, m=0):
    return c.col_ldn(h, m, off)


def hl(a, b):
    """high/low over [a,b) per day; a,b per-day arrays or scalars"""
    a = np.broadcast_to(np.asarray(a), (len(days),)); b = np.broadcast_to(np.asarray(b), (len(days),))
    hi = np.full(len(days), np.nan); lo = hi.copy()
    for aa, bb in set(zip(a, b)):
        s = (a == aa) & (b == bb)
        hi[s] = np.nanmax(G["H"][s, aa:bb], axis=1); lo[s] = np.nanmin(G["L"][s, aa:bb], axis=1)
    return hi, lo


# validity: no gap > 15 min from 19:00 NY (Asia) to 16:00 NY, and full day
valid = c.gap_ok(G, c.col_ny(19), c.col_ny(16)) & (G["nbars"] >= 1300) & keep_days
# daily stats
dH = np.nanmax(G["H"], 1); dL = np.nanmin(G["L"], 1); dC = CF[:, -1]
rng = pd.Series(dH - dL)
atr5 = rng.rolling(5).mean().shift(1); atr100 = rng.rolling(100).mean().shift(1)
cl = pd.Series(dC)
er10 = (cl.shift(1) - cl.shift(11)).abs() / cl.diff().abs().rolling(10).sum().shift(1)
er_med = er10.rolling(250, min_periods=100).median()
valid_prev = np.r_[False, valid[:-1]]

out = []
def report(name, sig, move, mask):
    """sig = +1/-1 predicted direction, move = forward move in price; prints per-year avg signed pips"""
    m = mask & valid & ~np.isnan(move) & (sig != 0)
    r = sig[m] * move[m] / P
    df = pd.DataFrame({"y": yrs[m], "r": r})
    g = df.groupby("y").r.agg(["size", "mean"])
    pos = (g["mean"] > 0).sum()
    line = f"{name:58s} N={m.sum():5d} avg={r.mean():+6.2f}p  yrs+={pos}/{len(g)}  " + " ".join(
        f"{y}:{v:+.1f}({n})" for y, (n, v) in g.iterrows())
    print(line); out.append(line)
    return g

# ---------- Asia range and first London break ----------
a0, a1 = lcol(0), lcol(7)
aH, aL = hl(a0, a1)
asia_r = pd.Series(aH - aL)
asia_med = asia_r.rolling(20).median().shift(1)
b0, b1 = lcol(8), lcol(12)
end_col = c.col_ny(15, 59) + 1  # close of 15:59 bar = price at start of 16:00
brk_dir = np.zeros(len(days)); brk_col = np.full(len(days), -1)
for i in range(len(days)):
    if not valid[i]: continue
    h = G["H"][i, b0[i]:b1[i]]; l = G["L"][i, b0[i]:b1[i]]
    up = np.where(h > aH[i])[0]; dn = np.where(l < aL[i])[0]
    fu = up[0] if len(up) else 10**6; fd = dn[0] if len(dn) else 10**6
    if fu == fd: continue
    if fu < fd: brk_dir[i] = 1; brk_col[i] = b0[i] + fu
    else: brk_dir[i] = -1; brk_col[i] = b0[i] + fd
lvl = np.where(brk_dir > 0, aH, aL)
mv_brk = px(end_col) - lvl
has = brk_dir != 0
print("== Stage 1 screening; avg = average signed move in pips (before cost) ==")
report("S0 baseline: follow first London break of Asia range", brk_dir, mv_brk, has)
mood = (er10 >= er_med).values
report("S1 ER10 mood: follow if trending, fade if ranging", np.where(mood, brk_dir, -brk_dir), mv_brk, has & ~np.isnan(er_med.values))
report("   S1a trending days only, follow", brk_dir, mv_brk, has & mood)
report("   S1b ranging days only, fade", -brk_dir, mv_brk, has & ~mood & ~np.isnan(er_med.values))
vr = (atr5 / atr100).values
report("S2 ATR5/ATR100 mood", np.where(vr >= 1, brk_dir, -brk_dir), mv_brk, has & ~np.isnan(vr))
report("   S2a high vol follow", brk_dir, mv_brk, has & (vr >= 1))
report("   S2b low vol fade", -brk_dir, mv_brk, has & (vr < 1))
ar = (asia_r / asia_med).values
report("S3 Asia-range mood", np.where(ar >= 1, brk_dir, -brk_dir), mv_brk, has & ~np.isnan(ar))
report("   S3a wide Asia follow", brk_dir, mv_brk, has & (ar >= 1))
report("   S3b narrow Asia fade", -brk_dir, mv_brk, has & (ar < 1))
report("S8 quiet Asia (<0.7x median) follow", brk_dir, mv_brk, has & (ar < 0.7))

# ---------- cross market ----------
E = align("EURUSD"); X = align("XAUUSD"); N = align("NSXUSD")
def pxm(Mx, col):
    cfm = ffill(Mx["C"])
    return cfm[:, col - 1]
EC = ffill(E["C"]); XC = ffill(X["C"]); NC = ffill(N["C"])
def pc(Cf, col): return Cf[:, col - 1]
g_l = np.log(px(c.col_ny(10)) / px(c.col_ny(3))); e_l = np.log(pc(EC, c.col_ny(10)) / pc(EC, c.col_ny(3)))
resid = pd.Series(g_l - e_l)
thr = resid.abs().rolling(250, min_periods=100).quantile(0.75).shift(1)
big = (resid.abs() > thr).values
fwd = px(end_col) - px(c.col_ny(10))
report("S4 GBP-EUR residual 03-10 NY top quartile -> fade", -np.sign(resid.values), fwd, big)
report("   S4x all days, fade residual", -np.sign(resid.values), fwd, ~np.isnan(resid.values))
nsx = pc(NC, c.col_ny(9, 30)) - pc(NC, c.col_ny(3))
report("S5 Nasdaq 03-09:30 -> GBP 09:30-15:59 follow", np.sign(nsx), px(end_col) - px(c.col_ny(9, 30)), ~np.isnan(nsx))
gold = pc(XC, c.col_ny(8)) - pc(XC, c.col_ny(3))
report("S6 Gold 03-08 -> GBP 08-11 follow", np.sign(gold), px(c.col_ny(11)) - px(c.col_ny(8)), ~np.isnan(gold))
eur = pc(EC, c.col_ny(8)) - pc(EC, c.col_ny(2))
report("S7 EUR 02-08 -> GBP 08-11 follow", np.sign(eur), px(c.col_ny(11)) - px(c.col_ny(8)), ~np.isnan(eur))

# ---------- NR7 ----------
nr7 = (rng <= rng.rolling(7).min()).shift(1).fillna(False).values
pdh = pd.Series(dH).shift(1).values; pdl = pd.Series(dL).shift(1).values
s0, s1_ = c.col_ny(3), c.col_ny(12)
nd = np.zeros(len(days)); nlv = np.full(len(days), np.nan)
for i in range(1, len(days)):
    if not (valid[i] and valid_prev[i] and nr7[i]): continue
    h = G["H"][i, s0:s1_]; l = G["L"][i, s0:s1_]
    # skip if price already outside the previous-day range at 03:00
    p0 = px(s0)[i]
    if p0 > pdh[i] or p0 < pdl[i]: continue
    up = np.where(h > pdh[i])[0]; dn = np.where(l < pdl[i])[0]
    fu = up[0] if len(up) else 10**6; fd = dn[0] if len(dn) else 10**6
    if fu == fd: continue
    nd[i] = 1 if fu < fd else -1; nlv[i] = pdh[i] if fu < fd else pdl[i]
report("S9 NR7 previous day, follow first PDH/PDL break 03-12 NY", nd, px(end_col) - nlv, nd != 0)

# ---------- news shocks (calendar-free) ----------
def shock(t0, t1, t_end, name):
    mv = px(t1) - px(t0)
    s = pd.Series(np.abs(mv))
    med = s.rolling(20, min_periods=10).median().shift(1).values
    big = np.abs(mv) > 3 * med
    fw = px(t_end) - px(t1)
    report(f"{name} follow", np.sign(mv), fw, big)
    report(f"{name} (shock days count by yr shown) fade", -np.sign(mv), fw, big)
shock(c.col_ny(8, 30), c.col_ny(8, 45), c.col_ny(11), "S10 08:30NY shock, 08:45->11:00")
shock(c.col_ny(8, 30), c.col_ny(8, 45), end_col, "S10 08:30NY shock, 08:45->15:59")
shock(lcol(7), lcol(7, 15), lcol(12), "S11 07:00LDN shock, 07:15->12:00 LDN")
shock(lcol(12), lcol(12, 15), end_col, "S12 12:00LDN shock, 12:15->15:59 NY")
shock(c.col_ny(14), c.col_ny(14, 15), end_col, "S13 14:00NY shock, 14:15->15:59")

# ---------- time of day ----------
fix_in = px(lcol(16)) - px(lcol(15))
report("S14 fade move into 4pm London fix (15-16 LDN) -> 15:59 NY", -np.sign(fix_in), px(end_col) - px(lcol(16)), np.ones(len(days), bool))
dser = pd.Series(days)
last_td = (dser.dt.month != dser.shift(-1).dt.month).values
report("S15 month-end: fade 15-16 LDN move into fix", -np.sign(fix_in), px(end_col) - px(lcol(16)), last_td)
early = px(c.col_ny(10)) - px(1)
report("S17 intraday momentum 17:00->10:00 then 10->15:59 follow", np.sign(early), px(end_col) - px(c.col_ny(10)), np.ones(len(days), bool))
morning = px(c.col_ny(12)) - px(c.col_ny(8))
report("S19 NY lunch reversal: fade 08-12 move, 12->15:59", -np.sign(morning), px(end_col) - px(c.col_ny(12)), np.ones(len(days), bool))
# S18 Friday: week move from Monday's first price to Fri 10:00
wk = dser.dt.to_period("W").values
first_px = pd.Series(px(1)).groupby(wk).transform("first").values
fri = (dser.dt.dayofweek == 4).values
report("S18 Friday: fade week-so-far, 10:00->15:59", -np.sign(px(c.col_ny(10)) - first_px), px(end_col) - px(c.col_ny(10)), fri)

# S16 hourly drift
print("\nS16 average signed move per NY hour (pips, long-only), per year")
rows = []
for h in list(range(17, 24)) + list(range(0, 16)):
    a = c.col_ny(h); b = a + 60
    mv = (px(b if b < 1440 else 1439) - px(a if a > 0 else 1)) / P
    m = valid & ~np.isnan(mv)
    g = pd.Series(mv[m]).groupby(yrs[m]).mean()
    rows.append([f"{h:02d}:00"] + list(g.round(2)) + [round(mv[m].mean(), 2), int((g > 0).sum())])
t = pd.DataFrame(rows, columns=["NY hour"] + [str(y) for y in g.index] + ["all", "yrs+"])
print(t.to_string(index=False)); out.append(t.to_string(index=False))
open("out_s1.txt", "w").write("\n".join(out) + "\n")
