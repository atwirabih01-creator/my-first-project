"""EURUSD round-3 stage-1 screening of pre-declared tests S0..S22 (TESTS_DECLARED.md). Output: out_s1.txt"""
import numpy as np, pandas as pd
import common3 as c
SYM = "EURUSD"
G = c.load_matrix(SYM); days = G["days"]; END = pd.Timestamp("2026-09-30")
yrs = days.year.values; P = c.PIP; n = len(days); off = G["ldn_off"]

def ffill(a):
    m = np.isnan(a); idx = np.where(~m, np.arange(a.shape[1]), 0)
    np.maximum.accumulate(idx, axis=1, out=idx)
    return a[np.arange(a.shape[0])[:, None], idx]

def align(sym):
    M = c.load_matrix(sym); pos = pd.Index(M["days"]).get_indexer(days); out = {}
    for k in "OHLC":
        arr = np.full((n, 1440), np.nan); ok = pos >= 0; arr[ok] = M[k][pos[ok]]; out[k] = arr
    out["nbars"] = np.where(pos >= 0, M["nbars"][pos], 0)
    return out

CF = ffill(G["C"])
def px(col, CFm=None):
    CFm = CF if CFm is None else CFm
    col = np.broadcast_to(np.asarray(col), (n,))
    return CFm[np.arange(n), col - 1]
lcol = lambda h, m=0: c.col_ldn(h, m, off)
fcol = lambda h, m=0: c.col_ldn(h - 1, m, off)   # Frankfurt = London + 1 h all year
def hl(a, b, M=G):
    a = np.broadcast_to(np.asarray(a), (n,)); b = np.broadcast_to(np.asarray(b), (n,))
    hi = np.full(n, np.nan); lo = hi.copy()
    for aa, bb in set(zip(a, b)):
        s = (a == aa) & (b == bb)
        with np.errstate(all="ignore"):
            import warnings; warnings.simplefilter("ignore")
            hi[s] = np.nanmax(M["H"][s, aa:bb], axis=1); lo[s] = np.nanmin(M["L"][s, aa:bb], axis=1)
    return hi, lo

valid = c.gap_ok(G, c.col_ny(19), c.col_ny(16)) & (G["nbars"] >= 1300) & (days <= END)
valid_prev = np.r_[False, valid[:-1]]
dH = np.nanmax(G["H"], 1); dL = np.nanmin(G["L"], 1); dC = CF[:, c.col_ny(16)]
rng = pd.Series(dH - dL)
atr5 = rng.rolling(5).mean().shift(1); atr20 = rng.rolling(20).mean().shift(1); atr60 = rng.rolling(60).mean().shift(1)
cl = pd.Series(dC)
er10 = (cl.shift(1) - cl.shift(11)).abs() / cl.diff().abs().rolling(10).sum().shift(1)
er_med = er10.rolling(250, min_periods=100).median()
out = []
def report(name, sig, move, mask):
    sig = np.asarray(sig, float)
    m = mask & valid & ~np.isnan(move) & (sig != 0) & ~np.isnan(sig)
    r = sig[m] * move[m] / P
    g = pd.DataFrame({"y": yrs[m], "r": r}).groupby("y").r.agg(["size", "mean"])
    pos = (g["mean"] > 0).sum()
    ok = "PASS" if (pos >= 6 and r.mean() >= 2) else ""
    line = f"{name:60s} N={m.sum():5d} avg={r.mean():+6.2f}p yrs+={pos}/{len(g)} {ok:4s} " + " ".join(f"{y%100}:{v:+.1f}({n_})" for y, (n_, v) in g.iterrows())
    print(line); out.append(line)

end_col = c.col_ny(16)
def first_break(hi, lo, a, b, M=G):
    a = np.broadcast_to(np.asarray(a), (n,)); b = np.broadcast_to(np.asarray(b), (n,))
    d = np.zeros(n); k = np.full(n, -1)
    for i in range(n):
        if np.isnan(hi[i]) or np.isnan(lo[i]): continue
        h = M["H"][i, a[i]:b[i]]; l = M["L"][i, a[i]:b[i]]
        up = np.where(h > hi[i])[0]; dn = np.where(l < lo[i])[0]
        fu = up[0] if len(up) else 10**6; fd = dn[0] if len(dn) else 10**6
        if fu == fd: continue
        if fu < fd: d[i] = 1; k[i] = a[i] + fu
        else: d[i] = -1; k[i] = a[i] + fd
    return d, k

# ---- Asia box and London break (orders from 07:00 London) ----
aH, aL = hl(lcol(0), lcol(7))
asia_r = pd.Series(aH - aL); ar = (asia_r / asia_r.rolling(20, min_periods=15).median().shift(1)).values
bd, bk = first_break(aH, aL, lcol(7), lcol(12))
lvl = np.where(bd > 0, aH, aL); mv = px(end_col) - lvl; has = bd != 0
print("== EURUSD stage 1; avg = signed pips before cost ==")
report("S0 follow first London break of Asia box", bd, mv, has)
report("S1 quiet Asia (<0.7x med) follow", bd, mv, has & (ar < 0.7))
for lo_, hi_ in ((0, .6), (.6, .8), (.8, 1.), (1., 1.3), (1.3, 99)):
    report(f"   S1 bucket {lo_}-{hi_}", bd, mv, has & (ar >= lo_) & (ar < hi_))
r520 = (atr5 / atr20).values
report("S2 ATR5/ATR20<1 follow", bd, mv, has & (r520 < 1))
report("   S2 other half (>=1) follow", bd, mv, has & (r520 >= 1))
# S3 quiet pre-NY range
pH, pL = hl(c.col_ny(3), c.col_ny(8, 20)); pr = pd.Series(pH - pL); prr = (pr / pr.rolling(20, min_periods=15).median().shift(1)).values
pd_, pk = first_break(pH, pL, c.col_ny(8, 20), c.col_ny(12))
report("S3 quiet pre-NY (<0.7x) follow break 08:20-12 NY", pd_, px(end_col) - np.where(pd_ > 0, pH, pL), (pd_ != 0) & (prr < 0.7))
report("   S3 all days follow", pd_, px(end_col) - np.where(pd_ > 0, pH, pL), (pd_ != 0))
# S4 quiet previous day -> PDH/PDL break 03-12 NY
pdh = pd.Series(dH).shift(1).values; pdl = pd.Series(dL).shift(1).values
qprev = (rng / rng.rolling(20).median().shift(1)).shift(1).values < 0.7
p03 = px(c.col_ny(3)); inside = (p03 < pdh) & (p03 > pdl)
qd, qk = first_break(pdh, pdl, c.col_ny(3), c.col_ny(12))
report("S4 quiet prev day, follow PDH/PDL break 03-12 NY", qd, px(end_col) - np.where(qd > 0, pdh, pdl), (qd != 0) & qprev & inside & valid_prev)
# S5 dual squeeze with GBPUSD
GB = align("GBPUSD")
gH, gL = hl(lcol(0), lcol(7), GB); gr = pd.Series(gH - gL); grr = (gr / gr.rolling(20, min_periods=15).median().shift(1)).values
report("S5 EUR AND GBP Asia quiet (<0.7x) follow EUR break", bd, mv, has & (ar < 0.7) & (grr < 0.7))
report("   S5 EUR quiet, GBP not quiet", bd, mv, has & (ar < 0.7) & (grr >= 0.7))
# S6/S7 mood
mood = (er10 >= er_med).values; okm = ~np.isnan(er_med.values)
report("S6 ER10 mood switch", np.where(mood, bd, -bd), mv, has & okm)
report("   S6a trending follow", bd, mv, has & mood)
report("   S6b ranging fade", -bd, mv, has & ~mood & okm)
r560 = (atr5 / atr60).values
report("S7 ATR5/ATR60 switch (>=1 follow, <1 fade)", np.where(r560 >= 1, bd, -bd), mv, has & ~np.isnan(r560))
report("   S7a vol rising follow", bd, mv, has & (r560 >= 1))
report("   S7b vol falling fade", -bd, mv, has & (r560 < 1))
# cross market
GC = ffill(GB["C"]); X = align("XAUUSD"); XC = ffill(X["C"]); N = align("NSXUSD"); NC = ffill(N["C"])
g28 = px(c.col_ny(8), GC) - px(c.col_ny(2), GC)
report("S8 GBP 02-08 NY -> EUR 08-11 follow", np.sign(g28), px(c.col_ny(11)) - px(c.col_ny(8)), ~np.isnan(g28))
e_l = np.log(px(c.col_ny(10)) / px(c.col_ny(3))); g_l = np.log(px(c.col_ny(10), GC) / px(c.col_ny(3), GC))
res = pd.Series(e_l - g_l); thr = res.abs().rolling(250, min_periods=100).quantile(0.75).shift(1)
report("S9 EUR-GBP residual top quartile -> fade EUR 10-15:59", -np.sign(res.values), px(end_col) - px(c.col_ny(10)), (res.abs() > thr).values)
xg = px(c.col_ny(8), XC) - px(c.col_ny(3), XC)
report("S10 gold 03-08 -> EUR 08-11 follow", np.sign(xg), px(c.col_ny(11)) - px(c.col_ny(8)), ~np.isnan(xg))
nx = px(c.col_ny(10, 30), NC) - px(c.col_ny(9, 30), NC)
report("S11 Nasdaq 09:30-10:30 -> EUR 10:30-15:59 follow", np.sign(nx), px(end_col) - px(c.col_ny(10, 30)), ~np.isnan(nx))
gbd, gbk = first_break(gH, gL, lcol(7), lcol(12), GB)
eur_inside = (gbd != 0) & ((bk < 0) | (bk > gbk))
ent = np.array([CF[i, gbk[i]] if gbk[i] >= 0 else np.nan for i in range(n)])
report("S12 GBP breaks Asia first, EUR still inside -> EUR follows", gbd, px(end_col) - ent, eur_inside)
# news shocks
def shock(t0, t1, t_end, name, fade_only=False):
    m_ = px(t1) - px(t0); med = pd.Series(np.abs(m_)).rolling(20, min_periods=10).median().shift(1).values
    big = np.abs(m_) > 3 * med; fw = px(t_end) - px(t1)
    if not fade_only: report(f"{name} follow", np.sign(m_), fw, big)
    report(f"{name} fade", -np.sign(m_), fw, big)
shock(c.col_ny(8, 30), c.col_ny(8, 45), c.col_ny(11), "S13 08:30 shock ->11:00")
shock(c.col_ny(8, 30), c.col_ny(8, 45), end_col, "S13 08:30 shock ->15:59")
shock(c.col_ny(10), c.col_ny(10, 15), end_col, "S14 10:00 shock ->15:59")
shock(c.col_ny(14), c.col_ny(14, 15), end_col, "S15 14:00 shock ->15:59")
shock(fcol(14, 15), fcol(14, 30), fcol(18, 15), "S16 14:15 Frankfurt (ECB) shock ->18:15 Fra", fade_only=True)
# time of day
fix_in = px(lcol(16)) - px(lcol(15)); one = np.ones(n, bool)
report("S17 fade 15-16 London move -> 15:59 NY", -np.sign(fix_in), px(end_col) - px(lcol(16)), one)
dser = pd.Series(days); last_td = (dser.dt.month != dser.shift(-1).dt.month).values
report("S18 month-end fade fix move", -np.sign(fix_in), px(end_col) - px(lcol(16)), last_td)
report("S19 NY lunch reversal fade 08-12", -np.sign(px(c.col_ny(12)) - px(c.col_ny(8))), px(end_col) - px(c.col_ny(12)), one)
dow = dser.dt.dayofweek.values
report("S20 Wed+Fri short 12:00-15:59 NY", -np.ones(n), px(end_col) - px(c.col_ny(12)), np.isin(dow, [2, 4]))
report("   S20 Wed only", -np.ones(n), px(end_col) - px(c.col_ny(12)), dow == 2)
report("   S20 Fri only", -np.ones(n), px(end_col) - px(c.col_ny(12)), dow == 4)
report("S21 Monday long 17:00->15:59", np.ones(n), px(end_col) - px(1), dow == 0)
report("S21 Wednesday short 17:00->15:59", -np.ones(n), px(end_col) - px(1), dow == 2)
report("S22 intraday momentum 17->10 then 10->15:59", np.sign(px(c.col_ny(10)) - px(1)), px(end_col) - px(c.col_ny(10)), one)
open("out_s1.txt", "w").write("\n".join(out) + "\n")
