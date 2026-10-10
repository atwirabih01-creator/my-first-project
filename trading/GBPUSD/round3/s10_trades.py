import numpy as np, pandas as pd
import common3 as c, engine as e
import s2_asia_break as s2
G = s2.G; days = s2.days; P = c.PIP; off = G["ldn_off"]
S = s2.signals()
ar = pd.Series([np.nan] * len(days))
for i in range(len(days)):
    a0, a1 = s2.A0[i], s2.A1[i]
    ar[i] = np.nanmax(G["H"][i, a0:a1]) - np.nanmin(G["L"][i, a0:a1])
med = ar.rolling(20, min_periods=15).median().shift(1)
quiet = (ar < 0.7 * med).values
out = []
for name, T in [("T6 quiet Asia breakout, stop other side, 15:59 exit", s2.run(S, "opp", mask=quiet)),
                ("T7 quiet Asia breakout, 2R target", s2.run(S, "opp", 2.0, mask=quiet))]:
    for cost in (1.5, 3.0):
        txt, _ = e.stats(T, cost, name); out.append(txt)
# T8 month-end
lc = lambda h, m=0: c.col_ldn(h, m, off)
ds = pd.Series(days)
last = (ds.dt.month != ds.shift(-1).dt.month).values & s2.valid
rows = []
for i in np.where(last)[0]:
    a, b = lc(15)[i], lc(16)[i]
    Cg = G["C"][i]; seg = Cg[a - 1:b]; seg = seg[~np.isnan(seg)]
    if len(seg) < 30: continue
    p0, p1 = seg[0], seg[-1]
    mv = p1 - p0
    if abs(mv) < 5 * P: continue
    d = -1 if mv > 0 else 1
    ext = np.nanmax(G["H"][i, a:b]) if d < 0 else np.nanmin(G["L"][i, a:b])
    stop = ext - d * 3 * P
    if abs(p1 - stop) < 10 * P: stop = p1 - d * 10 * P
    g, why, k = e.sim(G, i, d, b, p1, stop, None, c.col_ny(16))
    rows.append(dict(day=days[i], side=d, risk_p=abs(p1 - stop) / P, gross_p=g / P, why=why))
T8 = pd.DataFrame(rows)
for cost in (1.5, 3.0):
    txt, _ = e.stats(T8, cost, "T8 month-end fix reversal"); out.append(txt)
out.append("T8 exits: " + repr(T8.why.value_counts().to_dict()))
print("\n".join(out)); open("out_s10.txt", "w").write("\n".join(out))
