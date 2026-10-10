import numpy as np, pandas as pd
import common3 as c
G = c.load_matrix("GBPUSD"); days = G["days"]; P = c.PIP
END = pd.Timestamp("2026-09-30")
valid = c.gap_ok(G, 60, c.col_ny(16)) & (G["nbars"] >= 1300) & (days <= END)
yrs = days.year.values; n = len(days)
H, L, C = G["H"], G["L"], G["C"]
CF = C.copy()
for i in range(n):
    r = CF[i]; mm = np.isnan(r)
    if mm.any():
        idx = np.where(~mm, np.arange(1440), 0); np.maximum.accumulate(idx, out=idx); CF[i] = r[idx]
# full-day range uses 18:00 NY -> 15:59 NY to avoid the rollover hour
fr = np.nanmax(H[:, 60:c.col_ny(16)], 1) - np.nanmin(L[:, 60:c.col_ny(16)], 1)
atr = pd.Series(np.where(valid, fr, np.nan)).rolling(20, min_periods=15).mean().shift(1).values
out = []
for tn, t in [("08:00 NY", c.col_ny(8)), ("10:00 NY", c.col_ny(10))]:
    hi = np.nanmax(H[:, 60:t], 1); lo = np.nanmin(L[:, 60:t], 1)
    p = CF[:, t - 1]; loc = (p - lo) / (hi - lo); ratio = (hi - lo) / atr
    sig = np.where(loc >= 0.75, 1, np.where(loc <= 0.25, -1, 0))
    fw = CF[:, c.col_ny(16) - 1] - p
    for lo_b, hi_b in [(0, .5), (.5, .8), (.8, 1.1), (1.1, 9)]:
        m = valid & (sig != 0) & (ratio >= lo_b) & (ratio < hi_b) & ~np.isnan(atr)
        r = sig[m] * fw[m] / P; g = pd.Series(r).groupby(yrs[m]).mean()
        out.append(f"S28 {tn} ratio {lo_b}-{hi_b}: N={m.sum():4d} follow avg={r.mean():+5.2f}p yrs+={(g>0).sum()}/8 " + " ".join(f"{v:+.1f}" for v in g))
print("\n".join(out)); open("out_s9.txt", "w").write("\n".join(out))
