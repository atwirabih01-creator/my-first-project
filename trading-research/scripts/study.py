# Market behaviour study. All session times in UTC; Doha = UTC+3.
# Asia 00:00-06:00 UTC (03-09 Doha) | London 06:00-12:00 UTC (09-15 Doha) | NY 12:00-20:00 UTC (15-23 Doha)
# Owner windows: W1 06:00-09:00 UTC (09-12 Doha), W2 13:00-15:00 UTC (16-18 Doha)
import sys, numpy as np, pandas as pd
from common import load, PIP
def H(t): return pd.Timedelta(hours=t)
out=[]
for name in sys.argv[2:]:
    df=load(name); pip=PIP[name]
    rows=[]; prev=None
    for day,d in df.groupby(df.index.normalize()):
        if day.weekday()>=5 or len(d)<600: continue
        def seg(a,b): return d[(d.index>=day+H(a))&(d.index<day+H(b))]
        asia,w1,lon,ny,w2,full=seg(0,6),seg(6,9),seg(6,12),seg(12,20),seg(13,15),seg(0,21)
        if min(len(asia),len(w1),len(lon),len(ny),len(w2))<30: prev=None; continue
        ah,al=asia.h.max(),asia.l.min(); lh,ll=lon.h.max(),lon.l.min()
        r=dict(day=day,dow=day.day_name()[:3],asia=(ah-al)/pip,day_rng=(full.h.max()-full.l.min())/pip,
               lon_rng=(lh-ll)/pip,ny_rng=(ny.h.max()-ny.l.min())/pip,
               w1_hi=w1.h.max()>ah, w1_lo=w1.l.min()<al,
               lon_hi=lh>ah, lon_lo=ll<al,
               close=full.c.iloc[-1], open=asia.o.iloc[0], lon_open=lon.o.iloc[0], lon_close=lon.c.iloc[-1],
               ny_close=ny.c.iloc[-1], ah=ah, al=al, lh=lh, ll=ll,
               w2_lonhi=w2.h.max()>seg(6,13).h.max(), w2_lonlo=w2.l.min()<seg(6,13).l.min(),
               hi_hour=(full.h.idxmax()-day).seconds//3600+3, lo_hour=(full.l.idxmin()-day).seconds//3600+3)
        # Sweep & reverse: London takes Asia high then London closes back below Asia high (and vice versa)
        r["sweep_hi_rev"]= r["lon_hi"] and lon.c.iloc[-1]<ah
        r["sweep_lo_rev"]= r["lon_lo"] and lon.c.iloc[-1]>al
        # Judas: first Asia side taken in London, then day closes in opposite direction of that first sweep
        hi_t = lon.index[lon.h>ah][0] if r["lon_hi"] else None
        lo_t = lon.index[lon.l<al][0] if r["lon_lo"] else None
        first = None
        if hi_t is not None and (lo_t is None or hi_t<lo_t): first="hi"
        elif lo_t is not None: first="lo"
        r["first"]=first
        r["judas"]= (first=="hi" and r["close"]<lon.o.iloc[0]) or (first=="lo" and r["close"]>lon.o.iloc[0])
        if prev is not None:
            r["pdh_taken"]=full.h.max()>prev["h"]; r["pdl_taken"]=full.l.min()<prev["l"]
            r["pdh_rev"]=r["pdh_taken"] and r["close"]<prev["h"]; r["pdl_rev"]=r["pdl_taken"] and r["close"]>prev["l"]
        prev=dict(h=full.h.max(),l=full.l.min())
        # NY reverses London's direction?
        r["ny_rev_lon"]=np.sign(r["lon_close"]-r["lon_open"])!=np.sign(r["ny_close"]-r["lon_close"])
        rows.append(r)
    R=pd.DataFrame(rows)
    hourly=df.copy(); hourly["rng"]=(df.h-df.l)
    hr=resample_h=df.resample("1h").agg({"h":"max","l":"min"}).dropna(); hr["r"]=(hr.h-hr.l)/pip
    hr=hr[hr.index.weekday<5]; byh=hr.groupby((hr.index.hour+3)%24).r.mean()
    print(f"\n================ {name}  ({len(R)} trading days, {R.day.min().date()} -> {R.day.max().date()}) ================")
    print(f"Avg daily range {R.day_rng.mean():.0f} | Asia range {R.asia.mean():.0f} (median {R.asia.median():.0f}) | London {R.lon_rng.mean():.0f} | NY {R.ny_rng.mean():.0f}  [pips/points]")
    print(f"London (09-15 Doha) takes Asia HIGH {R.lon_hi.mean():.0%} | Asia LOW {R.lon_lo.mean():.0%} | BOTH {(R.lon_hi&R.lon_lo).mean():.0%} | neither {(~R.lon_hi&~R.lon_lo).mean():.0%}")
    print(f"Your 09-12 window takes Asia high {R.w1_hi.mean():.0%} | low {R.w1_lo.mean():.0%} | at least one {(R.w1_hi|R.w1_lo).mean():.0%}")
    print(f"After London sweeps Asia high, London closes back BELOW it: {R.sweep_hi_rev.sum()/max(R.lon_hi.sum(),1):.0%} | sweeps low & closes back ABOVE: {R.sweep_lo_rev.sum()/max(R.lon_lo.sum(),1):.0%}")
    print(f"Judas swing (first Asia side swept, day closes the other way vs London open): {R.judas.sum()/R['first'].notna().sum():.0%} of sweep days")
    print(f"Prev-day HIGH taken {R.pdh_taken.mean():.0%} (closes back below it {R.pdh_rev.sum()/max(R.pdh_taken.sum(),1):.0%}) | Prev-day LOW taken {R.pdl_taken.mean():.0%} (closes back above {R.pdl_rev.sum()/max(R.pdl_taken.sum(),1):.0%})")
    print(f"Your 16-18 window takes London high {R.w2_lonhi.mean():.0%} | London low {R.w2_lonlo.mean():.0%} | NY reverses London's direction {R.ny_rev_lon.mean():.0%}")
    print("Hour (Doha) when DAY HIGH forms:", R.hi_hour.value_counts(normalize=True).sort_index().round(2).to_dict())
    print("Hour (Doha) when DAY LOW forms: ", R.lo_hour.value_counts(normalize=True).sort_index().round(2).to_dict())
    print("Avg 1H range by Doha hour:", byh.round(0).astype(int).to_dict())
    print("Avg day range by weekday:", R.groupby("dow").day_rng.mean().reindex(["Mon","Tue","Wed","Thu","Fri"]).round(0).to_dict())
    R.to_csv(f"{sys.argv[1]}/study_{name}.csv",index=False)
