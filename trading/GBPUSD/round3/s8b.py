import numpy as np, pandas as pd
exec(open("s8_catchup.py").read().split("res26, res27")[0])
for th in (2.5, 4, 6):
    for hz in (60, 180, None):
        rs = []
        for a in range(c.col_ny(3), c.col_ny(12), 15):
            g = GC[:, a + 14] - GC[:, a - 1]; e = EC[:, a + 14] - EC[:, a - 1]
            endc = (a + 14 + hz) if hz else c.col_ny(16) - 1
            endc = min(endc, c.col_ny(16) - 1)
            fw = GC[:, endc] - GC[:, a + 14]
            gm = pd.Series(np.abs(g)).rolling(20, min_periods=10).median().shift(1).values
            m = valid & (np.abs(g) > th * gm) & (np.sign(g) * e < 0.4 * np.abs(g)) & ~np.isnan(fw)
            rs.append(pd.DataFrame({"y": yrs[m], "r": -np.sign(g[m]) * fw[m] / P, "sz": np.abs(g[m]) / P}))
        R = pd.concat(rs); gy = R.groupby("y").r.mean()
        print(f"fade th={th} hz={hz}: N={len(R)} shock {R.sz.median():.0f}p avg={R.r.mean():+.2f}p yrs+={(gy>0).sum()}/8 " + " ".join(f"{v:+.1f}" for v in gy))
