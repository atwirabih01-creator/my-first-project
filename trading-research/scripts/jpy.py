import itertools, pandas as pd
from bt import Mkt, run, stats
SPLIT=pd.Timestamp("2026-07-16",tz="UTC"); m=Mkt("GBPJPY"); rows=[]
cfgs=[("TPB",dict(tf=tf,win="W1",rr=rr,swing=True,dirmode="pdfade",maxstop=0.5)) for tf,rr in itertools.product(["5min","15min","30min"],[2,3])]
cfgs+=[("ABO",dict(tf=tf,win="W1",rr=rr,pdfade=True,maxstop=0.6)) for tf,rr in itertools.product(["15min","30min","1h"],[2,3])]
for s,p in cfgs:
    T=run(m,s,p); a,b=stats(T[T.time<SPLIT]),stats(T[T.time>=SPLIT])
    rows.append(dict(strat=s,tf=p["tf"],rr=p["rr"],n=len(T),IS=a.get("avgR"),OOS=b.get("avgR"),IS_win=a.get("win"),OOS_win=b.get("win")))
print(pd.DataFrame(rows).to_string(index=False))
