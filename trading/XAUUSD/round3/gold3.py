"""Round-3 gold helpers (Agent 1): valid days, ATR, levels, first-break finder, cross-market alignment."""
import numpy as np, pandas as pd, common3 as c
END = pd.Timestamp("2026-09-30")
M = c.load_matrix("XAUUSD"); days = M["days"]; n = len(days); off = M["ldn_off"]; nyu = M["ny_utc"]
H, L, C, O = M["H"], M["L"], M["C"], M["O"]
YR = days.year.values
lc = lambda h, m=0: c.col_ldn(h, m, off)          # per-day column of London local time
ny = c.col_ny                                      # column of NY local time (scalar)
def utc(h, m=0):                                   # per-day column of UTC time
    return ((h + nyu - 17) % 24) * 60 + m
X16 = ny(16)                                       # exit = close of 15:59 NY bar -> column 15:59
CL = ny(15, 59)
complete = (M["nbars"] >= 1300) & c.gap_ok(M, ny(18), ny(16)) & (days <= END)   # gold reopens 18:00 NY
prev_complete = np.r_[False, complete[:-1]]
dh = np.nanmax(np.where(np.isnan(H[:, 60:1380]), -np.inf, H[:, 60:1380]), 1)
dl = np.nanmin(np.where(np.isnan(L[:, 60:1380]), np.inf, L[:, 60:1380]), 1)
dclose = C[:, CL]
drange = pd.Series(np.where(complete, dh - dl, np.nan))
ATR = drange.rolling(20, min_periods=10).mean().shift(1).values          # previous 20 full days
ATR5 = drange.rolling(5, min_periods=4).mean().shift(1).values
ATR60 = drange.rolling(60, min_periods=40).mean().shift(1).values

def rng_hi_lo(i, a, b):
    h = H[i, a:b]; l = L[i, a:b]
    if np.isnan(h).all(): return np.nan, np.nan
    return np.nanmax(h), np.nanmin(l)

def first_break(i, hi, lo, a, b):
    """first minute in [a,b) trading beyond hi (long) or lo (short). returns (d, k, entry) or None; 'x' if both same minute"""
    for k in range(a, b):
        h, l, o = H[i, k], L[i, k], O[i, k]
        if np.isnan(h): continue
        up, dn = h > hi, l < lo
        if up and dn: return "x"
        if up: return (1, k, max(hi, o))
        if dn: return (-1, k, min(lo, o))
    return None

def other(sym):
    """matrix of another market aligned to gold's trading days (rows), NaN where missing"""
    N = c.load_matrix(sym); idx = pd.Index(N["days"]).get_indexer(days)
    out = {}
    for k in "OHLC":
        A = np.full_like(H, np.nan); ok = idx >= 0; A[ok] = N[k][idx[ok]]; out[k] = A
    return out

def yearly(vals, mask, label):
    s = pd.Series(np.asarray(vals, float))[mask & ~np.isnan(vals)]
    g = s.groupby(YR[s.index])
    m = g.mean(); npos = int((m > 0).sum()); nneg = int((m < 0).sum())
    line = f"{label:58s} n={len(s):5d} mean={s.mean():+6.2f}%ATR  yrs+ {npos}/8 yrs- {nneg}/8 | " + \
           " ".join(f"{y%100:02d}:{v:+5.1f}({g.size()[y]})" for y, v in m.items())
    return line, s.mean(), npos
