"""Stage 3 screening (see TESTS_DECLARED.md)."""
import numpy as np, pandas as pd
import common3 as c
G = c.load_matrix("GBPUSD"); days = G["days"]; P = c.PIP
END = pd.Timestamp("2026-09-30")
valid = c.gap_ok(G, 60, 1439) & (G["nbars"] >= 1300) & (days <= END)
yrs = days.year.values
CF = G["C"].copy()
for i in range(len(CF)):
    r = CF[i]; m = np.isnan(r)
    if m.any():
        idx = np.where(~m, np.arange(1440), 0); np.maximum.accumulate(idx, out=idx); CF[i] = r[idx]
px = lambda col: CF[:, col - 1]
o = px(c.col_ny(19)); cl = px(c.col_ny(16))   # day reference: 19:00 NY (after rollover noise) to 15:59 NY
dH = np.nanmax(G["H"][:, 120:1380], 1); dL = np.nanmin(G["L"][:, 120:1380], 1)
rng = pd.Series(dH - dL); atr20 = rng.rolling(20).mean().shift(1).values
prev = lambda a: np.r_[np.nan, a[:-1]]
vprev = np.r_[False, valid[:-1]]
mvd = cl - o
P1 = np.sign(prev(mvd))
loc = (prev(cl) - prev(dL)) / prev(dH - dL)
P2 = np.where(loc > 2 / 3, 1, np.where(loc < 1 / 3, -1, 0))
cls = pd.Series(cl)
P3 = np.sign((cls.shift(1) - cls.shift(6)).values)
P4 = np.sign((cls.shift(1) - cls.shift(21)).values)
P5 = np.where(prev(rng.values) > 1.5 * prev(atr20), P1, 0)
T = {"Asia 19-02": px(c.col_ny(2)) - px(c.col_ny(19)), "London 02-08": px(c.col_ny(8)) - px(c.col_ny(2)),
     "NYam 08-12": px(c.col_ny(12)) - px(c.col_ny(8)), "NYpm 12-16": px(c.col_ny(16)) - px(c.col_ny(12))}
out = []
def rep(name, sig, mv, mask):
    m = mask & valid & vprev & ~np.isnan(sig) & (sig != 0) & ~np.isnan(mv)
    r = sig[m] * mv[m] / P
    g = pd.Series(r).groupby(yrs[m]).mean()
    out.append(f"{name:40s} N={m.sum():5d} avg={r.mean():+5.2f}p yrs+={(g>0).sum()}/8 " + " ".join(f"{v:+.1f}" for v in g))
for pn, s in [("P1 prev dir (follow)", P1), ("P2 prev close location (follow)", P2), ("P3 5d move (follow)", P3),
              ("P4 20d move (follow)", P4), ("P5 big prev day (follow)", P5)]:
    for tn, mv in T.items():
        rep(f"{pn} -> {tn}", s.astype(float), mv, np.ones(len(days), bool))
wd = days.dayofweek.values
for d, dn in enumerate(["Mon", "Tue", "Wed", "Thu", "Fri"]):
    for tn, mv in T.items():
        rep(f"P6 {dn} long -> {tn}", np.ones(len(days)), mv, wd == d)
# P7 weekend gap: Monday rows only: Friday close = previous day's 16:59 NY close; Monday first price = first non-nan open
fri_close = prev(G["C"][:, 1439]) if False else prev(CF[:, 1439])
first_o = np.array([G["O"][i][~np.isnan(G["O"][i])][0] if (~np.isnan(G["O"][i])).any() else np.nan for i in range(len(days))])
gap = first_o - fri_close
mon = wd == 0
rep("P7 weekend gap fade (gap>=3p) -> 02:00 Mon", -np.sign(gap), px(c.col_ny(2)) - first_o, mon & (np.abs(gap) >= 3 * P))
print("\n".join(out)); open("out_s3.txt", "w").write("\n".join(out))
