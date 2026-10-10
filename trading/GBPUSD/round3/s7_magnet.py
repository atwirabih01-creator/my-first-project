import numpy as np, pandas as pd
import common3 as c
G = c.load_matrix("GBPUSD"); days = G["days"]; P = c.PIP; off = G["ldn_off"]
END = pd.Timestamp("2026-09-30")
valid = c.gap_ok(G, c.col_ny(18), c.col_ny(16)) & (G["nbars"] >= 1300) & (days <= END)
vprev = np.r_[False, valid[:-1]]
yrs = days.year.values
H, L, C = G["H"], G["L"], G["C"]
CF = C.copy()
for i in range(len(CF)):
    r = CF[i]; mm = np.isnan(r)
    if mm.any():
        idx = np.where(~mm, np.arange(1440), 0); np.maximum.accumulate(idx, out=idx); CF[i] = r[idx]
n = len(days); ar = np.arange(n)
lc = lambda h, m=0: c.col_ldn(h, m, off)
aH = np.array([np.nanmax(H[i, lc(0)[i]:lc(7)[i]]) for i in range(n)]); aL = np.array([np.nanmin(L[i, lc(0)[i]:lc(7)[i]]) for i in range(n)])
refs = {"R1 London 08:00 open": CF[ar, lc(8) - 1], "R2 NY midnight open": CF[:, c.col_ny(0) - 1], "R3 day open 17:00 NY": CF[:, 0],
        "R4 Asia middle": (aH + aL) / 2, "R5 previous close": np.r_[np.nan, CF[:-1, 1439 - 1]]}
out = []
for tname, tcol in [("08:00 NY", c.col_ny(8)), ("10:00 NY", c.col_ny(10))]:
    for rn, ref in refs.items():
        res = []
        for i in range(n):
            if not (valid[i] and vprev[i]) or np.isnan(ref[i]): continue
            p = CF[i, tcol - 1]; D = p - ref[i]
            if abs(D) < 15 * P: continue
            far = p + D  # another D away
            o = 0
            for j in range(tcol, c.col_ny(16)):
                if np.isnan(H[i, j]): continue
                hit_ref = (L[i, j] <= ref[i]) if D > 0 else (H[i, j] >= ref[i])
                hit_far = (H[i, j] >= far) if D > 0 else (L[i, j] <= far)
                if hit_ref and hit_far: break
                if hit_ref: o = 1; break
                if hit_far: o = -1; break
            if o: res.append((yrs[i], o > 0))
        D_ = pd.DataFrame(res, columns=["y", "w"]); g = D_.groupby("y").w.mean()
        out.append(f"{tname} {rn:22s} N={len(D_):4d} reach-ref-first {D_.w.mean():.1%}  yrs>53%: {(g>0.53).sum()}/8  " + " ".join(f"{v:.0%}" for v in g))
print("\n".join(out)); open("out_s7.txt", "w").write("\n".join(out))
