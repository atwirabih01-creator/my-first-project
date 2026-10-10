import numpy as np, pandas as pd, common3 as c, engine as e
from gold3 import *
from tradestats import summarize
A0, A1, W1 = lc(0), lc(7), lc(12)
asia = np.array([rng_hi_lo(i, A0[i], A1[i]) for i in range(n)])
bd = np.zeros(n); bk = np.zeros(n, int)
for i in range(n):
    if not complete[i] or np.isnan(ATR[i]) or np.isnan(asia[i, 0]): continue
    r = first_break(i, asia[i, 0], asia[i, 1], A1[i], W1[i])
    if r not in (None, "x"): bd[i], bk[i] = r[0], r[1]
first = np.full(n, -1); sdir = np.zeros(n)
for a in (ny(14), ny(10), ny(8, 30)):          # reverse order so the earliest shock wins
    m = C[:, a + 14] - O[:, a]; med = pd.Series(np.abs(m)).rolling(20, min_periods=15).median().shift(1).values
    s = complete & (np.abs(m) > 3 * med); first[s] = a; sdir[s] = np.sign(m[s])
sel = (first >= 0) & (bd != 0) & (bk < first)
agree = sdir == bd
out = []
g = pd.Series(agree[sel]).groupby(YR[sel])
out.append("V1 share shock same way as London break: " + " ".join(f"{y%100}:{v:.0%}({k})" for (y, v), k in zip(g.mean().items(), g.size())) + f" | ALL {agree[sel].mean():.1%} n={sel.sum()}")
for nm, m_ in (("V2 agree -> follow", sel & agree), ("V2 against -> follow shock", sel & ~agree)):
    rows = []
    for i in np.where(m_)[0]:
        a = first[i]; d = int(sdir[i]); ent = C[i, a + 14]; risk = max(.5 * ATR[i], 8)
        gg, why, kx = e.sim(M, i, d, a + 15, ent, ent - d * risk, None, X16)
        rows.append(dict(day=days[i].date(), side=d, risk=risk, gross=gg))
    txt, T, df = summarize(pd.DataFrame(rows), nm, show=False); out.append(txt)
print("\n".join(out)); open("out_s5.txt", "w").write("\n".join(out) + "\n")
