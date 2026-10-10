import numpy as np, pandas as pd
import common3 as c, engine as e
import s2_asia_break as s2
G = s2.G; days = s2.days
ar = pd.Series([np.nan] * len(days))
for i in range(len(days)):
    a0, a1 = s2.A0[i], s2.A1[i]
    ar[i] = np.nanmax(G["H"][i, a0:a1]) - np.nanmin(G["L"][i, a0:a1])
med = ar.rolling(20, min_periods=15).median().shift(1)
S = s2.signals()
rows = []
for th in (0.6, 0.7, 0.8, 0.9, 1.0):
    q = (ar < th * med).values
    for rr in (1.5, 2.0, 2.5, 3.0, None):
        T = s2.run(S, "opp", rr, mask=q)
        T["R"] = (T.gross_p - 1.5) / T.risk_p; T["R3"] = (T.gross_p - 3) / T.risk_p
        y = T.groupby(pd.to_datetime(T.day).dt.year).R.sum()
        run = best = 0
        for x in T.R:
            run = run + 1 if x <= 0 else 0; best = max(best, run)
        rows.append(dict(th=th, rr=rr, n=len(T), totR=round(T.R.sum(), 1), perTr=round(T.R.mean(), 3), R3=round(T.R3.sum(), 1),
                         yrs_pos=int((y > 0).sum()), worst_yr=round(y.min(), 1), lrun=best))
print(pd.DataFrame(rows).to_string(index=False))
