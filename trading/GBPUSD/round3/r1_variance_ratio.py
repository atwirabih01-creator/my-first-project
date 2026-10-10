"""Research R1: where is GBPUSD mean-reverting vs trending, by time of day, per year?
Variance ratio VR = Var(60-min move) / (4 * Var(15-min move)) inside each 4-hour NY block (VR<1 = mean-reverting, >1 = trending).
Also lag-1 autocorrelation of 15-minute moves inside each block."""
import numpy as np, pandas as pd
import common3 as c
G = c.load_matrix("GBPUSD"); days = G["days"]
valid = c.gap_ok(G, 0, 1439) & (G["nbars"] >= 1300) & (days <= pd.Timestamp("2026-09-30"))
CF = G["C"].copy()
# ffill
for i in range(len(CF)):
    r = CF[i]; m = np.isnan(r)
    if m.any():
        idx = np.where(~m, np.arange(1440), 0); np.maximum.accumulate(idx, out=idx); CF[i] = r[idx]
yrs = days.year.values
blocks = [(19, 23), (23, 3), (3, 7), (7, 11), (11, 16)]
rows = []
for (h0, h1) in blocks:
    a = c.col_ny(h0); b = c.col_ny(h1) + 1  # include the price at the block end
    p15 = CF[:, a - 1:b:15]; p60 = CF[:, a - 1:b:60]  # price at start of each block (close of previous minute), endpoints included
    r15 = np.diff(p15, axis=1); r60 = np.diff(p60, axis=1)
    for y in sorted(set(yrs)):
        m = valid & (yrs == y)
        x15 = r15[m]; x60 = r60[m]
        vr = np.nanmean(x60**2) / (4 * np.nanmean(x15**2))
        ac = np.nanmean([np.corrcoef(x15[:, :-1].ravel(), x15[:, 1:].ravel())[0, 1]])
        rows.append(dict(block=f"{h0:02d}-{h1:02d} NY", y=y, VR=round(vr, 3), ac15=round(ac, 3)))
df = pd.DataFrame(rows)
print(df.pivot(index="block", columns="y", values="VR").to_string())
print(df.pivot(index="block", columns="y", values="ac15").to_string())
