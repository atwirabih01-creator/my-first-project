import time, numpy as np, pandas as pd, common3 as c
t=time.time()
for s in ["XAUUSD","EURUSD","NSXUSD"]:
    M=c.load_matrix(s); print(s, len(M["days"]), M["days"][0], M["days"][-1], time.time()-t)
M=c.load_matrix("XAUUSD")
d=pd.Series(M["nbars"],index=M["days"])
print(d.groupby(d.index.year).describe())
print((d<1300).groupby(d.index.year).sum())
