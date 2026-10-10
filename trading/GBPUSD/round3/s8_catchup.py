import numpy as np, pandas as pd
import common3 as c
G = c.load_matrix("GBPUSD"); days = G["days"]; P = c.PIP
E = c.load_matrix("EURUSD"); pos = pd.Index(E["days"]).get_indexer(days)
END = pd.Timestamp("2026-09-30")
valid = c.gap_ok(G, c.col_ny(2), c.col_ny(14)) & (G["nbars"] >= 1300) & (days <= END) & (pos >= 0)
yrs = days.year.values
def ff(C):
    CF = C.copy()
    for i in range(len(CF)):
        r = CF[i]; mm = np.isnan(r)
        if mm.any():
            idx = np.where(~mm, np.arange(1440), 0); np.maximum.accumulate(idx, out=idx); CF[i] = r[idx]
    return CF
GC = ff(G["C"]); EC = np.full_like(GC, np.nan); EC[pos >= 0] = ff(E["C"][pos[pos >= 0]])
res26, res27 = [], []
for a in range(c.col_ny(3), c.col_ny(12), 15):
    g = GC[:, a + 14] - GC[:, a - 1]; e = EC[:, a + 14] - EC[:, a - 1]
    fw = GC[:, a + 74] - GC[:, a + 14]
    gm = pd.Series(np.abs(g)).rolling(20, min_periods=10).median().shift(1).values
    em = pd.Series(np.abs(e)).rolling(20, min_periods=10).median().shift(1).values
    m26 = valid & (np.abs(e) > 2.5 * em) & (np.sign(g) * g < 0.4 * np.abs(e)) & ~np.isnan(fw)
    # (GBP moved less than 40% of EUR's move in EUR's direction)
    m26 = valid & (np.abs(e) > 2.5 * em) & (np.sign(e) * g < 0.4 * np.abs(e)) & ~np.isnan(fw)
    res26.append(pd.DataFrame({"y": yrs[m26], "r": np.sign(e[m26]) * fw[m26] / P}))
    m27 = valid & (np.abs(g) > 2.5 * gm) & (np.sign(g) * e < 0.4 * np.abs(g)) & ~np.isnan(fw)
    res27.append(pd.DataFrame({"y": yrs[m27], "r": np.sign(g[m27]) * fw[m27] / P}))
for name, R in [("S26 GBP catches up with EUR shock (follow EUR)", pd.concat(res26)), ("S27 pound-only shock, follow", pd.concat(res27))]:
    g = R.groupby("y").r.mean()
    print(f"{name}: N={len(R)} avg={R.r.mean():+.2f}p yrs+={(g>0).sum()}/8 " + " ".join(f"{v:+.1f}({n})" for v, n in zip(g, R.groupby('y').size())))
