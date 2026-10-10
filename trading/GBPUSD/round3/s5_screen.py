import numpy as np, pandas as pd
import common3 as c
G = c.load_matrix("GBPUSD"); days = G["days"]; P = c.PIP
END = pd.Timestamp("2026-09-30")
valid = c.gap_ok(G, c.col_ny(1), c.col_ny(16)) & (G["nbars"] >= 1300) & (days <= END)
yrs = days.year.values
H, L, C = G["H"], G["L"], G["C"]
CF = C.copy()
for i in range(len(CF)):
    r = CF[i]; mm = np.isnan(r)
    if mm.any():
        idx = np.where(~mm, np.arange(1440), 0); np.maximum.accumulate(idx, out=idx); CF[i] = r[idx]
# S23
out = []
for mode in (1, -1):
    rs = []
    for h in range(2, 14):
        a = c.col_ny(h); b = a + 60; f = b + 120
        mv = CF[:, b - 1] - CF[:, a - 1]
        med = pd.Series(np.abs(mv)).rolling(20, min_periods=10).median().shift(1).values
        big = valid & (np.abs(mv) > 2.5 * med)
        fw = CF[:, min(f, c.col_ny(16)) - 1] - CF[:, b - 1]
        rs.append(pd.DataFrame({"y": yrs[big], "r": mode * np.sign(mv[big]) * fw[big] / P}))
    D = pd.concat(rs); g = D.groupby("y").r.mean()
    out.append(f"S23 hour shock {'follow' if mode>0 else 'fade'}: N={len(D)} avg={D.r.mean():+.2f}p yrs+={(g>0).sum()}/8 " + " ".join(f"{v:+.1f}" for v in g))

# S24 round numbers
def touches(offset, X):
    res = []
    a, b = c.col_ny(3), c.col_ny(14)
    for i in range(len(days)):
        if not valid[i]: continue
        hi, lo, cf = H[i], L[i], CF[i]
        seen = set()
        for k in range(a, b):
            if np.isnan(hi[k]): continue
            # candidate levels inside this bar
            lv0 = np.floor((lo[k] - offset) / 0.0050) * 0.0050 + offset
            for lv in (lv0, lv0 + 0.0050):
                lv = round(lv, 5)
                if not (lo[k] <= lv <= hi[k]) or lv in seen: continue
                seen.add(lv)
                ref = cf[k - 61]
                if abs(ref - lv) < 15 * P: continue
                # did price touch lv during the 60 minutes before? then not first touch
                if np.nanmax(hi[k - 60:k]) >= lv and np.nanmin(lo[k - 60:k]) <= lv: continue
                d = 1 if ref < lv else -1  # approaching from below -> bounce = down
                # after the touch bar: which first, bounce X (against approach) or through X
                bounce = lv - d * X * P; thru = lv + d * X * P
                outc = 0
                for j in range(k + 1, c.col_ny(16)):
                    if np.isnan(hi[j]): continue
                    hb = (lo[j] <= bounce) if d > 0 else (hi[j] >= bounce)
                    ht = (hi[j] >= thru) if d > 0 else (lo[j] <= thru)
                    if hb and ht: outc = 0; break
                    if hb: outc = 1; break
                    if ht: outc = -1; break
                res.append((yrs[i], outc))
    return pd.DataFrame(res, columns=["y", "o"])
for X in (10, 15, 20):
    R = touches(0.0, X); K = touches(0.0025, X)
    fr = R[R.o != 0].groupby("y").o.apply(lambda s: (s > 0).mean()); fk = K[K.o != 0].groupby("y").o.apply(lambda s: (s > 0).mean())
    out.append(f"S24 X={X}: round 00/50 bounce-first rate {(R.o>0).sum()/(R.o!=0).sum():.1%} (N={len(R)}) | control 25/75 {(K.o>0).sum()/(K.o!=0).sum():.1%} (N={len(K)})")
    out.append("     by year round: " + " ".join(f"{y}:{v:.0%}" for y, v in fr.items()))
    out.append("     by year ctrl : " + " ".join(f"{y}:{v:.0%}" for y, v in fk.items()))
    out.append(f"     years round > control: {(fr > fk).sum()}/8")
print("\n".join(out)); open("out_s5.txt", "w").write("\n".join(out))
