# Which simple conditions predict the next 1-4 hours? Checked separately in design and test periods.
import sys, numpy as np, pandas as pd
from common import load
SPLIT=pd.Timestamp("2026-07-16",tz="UTC")
for name in sys.argv[1:]:
    m=load(name); m=m[m.index.weekday<5]
    d=m.resample("1D").agg({"o":"first","h":"max","l":"min","c":"last"}).dropna()
    adr=(d.h-d.l).rolling(10).mean().shift(1)
    c15=m.c.resample("15min").last().ffill()
    h1=m.c.resample("1h").last().dropna(); e50=h1.ewm(span=50,adjust=False).mean()
    rows=[]
    for day in d.index:
        A=adr.get(day)
        if not A==A: continue
        asia=m[(m.index>=day)&(m.index<day+pd.Timedelta(hours=6))]
        if len(asia)<200: continue
        ah,al,ao=asia.h.max(),asia.l.min(),asia.o.iloc[0]
        prev=d.loc[:day].iloc[-2] if len(d.loc[:day])>1 else None
        for hh in [6,6.5,7,7.5,8,8.5,9,13,13.5,14,14.5,15]:
            t=day+pd.Timedelta(hours=hh)
            if t not in c15.index: continue
            p=c15.loc[t]
            try:
                f2=c15.loc[t+pd.Timedelta(hours=2)]; f4=c15.loc[t+pd.Timedelta(hours=4)]
                p1=c15.loc[t-pd.Timedelta(hours=1)]; p3=c15.loc[t-pd.Timedelta(hours=3)]
            except KeyError: continue
            hk=h1[h1.index+pd.Timedelta(hours=1)<=t]; ek=e50[e50.index+pd.Timedelta(hours=1)<=t]
            bias=np.sign(hk.iloc[-1]-ek.iloc[-1]) if len(hk)>60 else 0
            so_far=m[(m.index>=day)&(m.index<t)]
            rows.append(dict(t=t,hh=hh,f2=(f2-p)/A,f4=(f4-p)/A,mom1=np.sign(p-p1),mom3=np.sign(p-p3),
                 day_dir=np.sign(p-ao),bias=bias,asia_pos=1 if p>ah else (-1 if p<al else 0),
                 prevday=np.sign(prev.c-prev.o) if prev is not None else 0,
                 swept=(1 if so_far.h.max()>ah and t.hour>=6 else 0)-(1 if so_far.l.min()<al and t.hour>=6 else 0)))
    X=pd.DataFrame(rows); X["per"]=np.where(X.t<SPLIT,"design","test")
    print(f"\n######## {name}: avg move over next 4h in % of daily range, when feature=+1 minus when -1 (positive=continuation) ########")
    out=[]
    for feat in ["mom1","mom3","day_dir","bias","asia_pos","prevday","swept"]:
        for win,hs in [("09-12 Doha",[6,6.5,7,7.5,8,8.5,9]),("16-18 Doha",[13,13.5,14,14.5,15])]:
            r={"feature":feat,"window":win}
            for per in ["design","test"]:
                s=X[(X.per==per)&X.hh.isin(hs)]
                up=s[s[feat]==1].f4; dn=s[s[feat]==-1].f4
                r[per]=round(100*(up.mean()-dn.mean()),1); r[per+"_n"]=len(up)+len(dn)
                # consistency: fraction where move followed the feature
                z=s[s[feat]!=0]; r[per+"_hit"]=round(((np.sign(z.f4)==z[feat])).mean(),2)
            out.append(r)
    print(pd.DataFrame(out).to_string(index=False))
