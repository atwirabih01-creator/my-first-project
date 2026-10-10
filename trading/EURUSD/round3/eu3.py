"""EURUSD round-3 shared setup (Agent 1): loads design data, helpers px/hl/first_break/report. Imported by stage scripts."""
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
    return r, yrs[m], np.where(m)[0]

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

