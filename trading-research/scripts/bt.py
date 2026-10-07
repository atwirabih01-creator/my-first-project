# Backtest engine. Times UTC (Doha = UTC+3). Entries only inside owner windows.
import numpy as np, pandas as pd
from common import load, resample, COST, us_dst, SPREAD
H=lambda t: pd.Timedelta(hours=t)
WIN={"W1":(6,9),"W2":(13,15),"BOTH":None}
MINSTOP={"GBPUSD":0.0008,"GBPJPY":0.12,"XAUUSD":2.0,"NAS100":15.0}

class Mkt:
    def __init__(s,name):
        s.name=name; s.m1=load(name); s.cost=COST[name]; s.spr=SPREAD[name]
        s.t=s.m1.index.values; s.h=s.m1.h.values; s.l=s.m1.l.values; s.c=s.m1.c.values
        s.tf={tf:resample(s.m1,tf) for tf in ["5min","15min","30min","1h"]}
        h1=s.tf["1h"]; s.ema50_1h=h1.c.ewm(span=50,adjust=False).mean()
        d=resample(s.m1[s.m1.index.weekday<5],"1D"); s.adr=(d.h-d.l).rolling(10).mean().shift(1)
        s.days=sorted(set(s.m1.index.normalize()[s.m1.index.weekday<5]))
    def sim(s,t_entry,dr,e,sl,tp,maxh=4,be=None,limit=False):
        i=np.searchsorted(s.t,np.datetime64(t_entry.tz_convert(None)))
        j=np.searchsorted(s.t,np.datetime64((t_entry+H(maxh)).tz_convert(None)))
        h,l,c=s.h[i:j],s.l[i:j],s.c[i:j]
        if len(h)==0: return None
        risk=abs(e-sl)
        if dr>0: hs=np.nonzero(l<=sl)[0]; ht=np.nonzero(h>=tp)[0]
        else:    hs=np.nonzero(h+s.spr>=sl)[0]; ht=np.nonzero(l+s.spr<=tp)[0]   # shorts exit on the ASK
        if limit and len(ht) and ht[0]==0: ht=ht[1:]   # no target credit inside the fill minute
        ks=hs[0] if len(hs) else 10**9; kt=ht[0] if len(ht) else 10**9
        if be is not None:  # move stop to entry once price reaches be*R
            lvl=e+dr*be*risk; hb=np.nonzero((h>=lvl) if dr>0 else (l<=lvl))[0]
            kb=hb[0] if len(hb) else 10**9
            if kb<ks and kb<kt:
                hs2=np.nonzero((l[kb+1:]<=e) if dr>0 else (h[kb+1:]>=e))[0]
                ks=kb+1+hs2[0] if len(hs2) else 10**9
                if ks<10**9 and ks<=kt: return dict(R=-s.cost/risk, mins=int(ks), exit="BE")
        if ks<=kt and ks<10**9: return dict(R=-1-s.cost/risk, mins=int(ks), exit="SL")
        if kt<10**9: return dict(R=abs(tp-e)/risk-s.cost/risk, mins=int(kt), exit="TP")
        return dict(R=(c[-1]-e)*dr/risk-s.cost/risk, mins=len(c), exit="TIME")

def in_win(ts,day,win):
    ws=[WIN["W1"],WIN["W2"]] if win=="BOTH" else [WIN[win]]
    return any(day+H(a)<ts<=day+H(b) for a,b in ws)

def bias(m,ts):
    """1H trend: last CLOSED 1H candle above a rising EMA50 = +1, below a falling EMA50 = -1, else 0."""
    if not hasattr(m,"_b"):
        h1=m.tf["1h"]; e=m.ema50_1h
        up=(h1.c>e)&(e>e.shift(5)); dn=(h1.c<e)&(e<e.shift(5))
        m._bt=(h1.index+H(1)).values; m._bv=np.where(up,1,np.where(dn,-1,0))
        m._b=True
    k=np.searchsorted(m._bt,np.datetime64(ts.tz_convert(None)),side="right")-1
    return int(m._bv[k]) if k>=50 else 0

def mk(m,ts,dr,e,sl,rr,p):
    risk=abs(e-sl)
    if risk<MINSTOP[m.name]: sl=e-dr*MINSTOP[m.name]; risk=MINSTOP[m.name]
    adr=m.adr.asof(ts.normalize())
    if p.get("maxstop") and (adr!=adr or risk>p["maxstop"]*adr): return None
    return dict(time=ts,dir=dr,entry=e,sl=sl,tp=e+dr*rr*risk,risk=risk)

def bars(m,tf,day,a,b):
    x=m.tf[tf]; x=x[(x.index>=day+H(a))&(x.index<day+H(b))]; return x

# ---------------- strategies: each yields at most p['maxday'] signals per day ----------------
def prev_dir(m,day):
    if not hasattr(m,"_pd"):
        d=resample(m.m1[m.m1.index.weekday<5],"1D"); m._pd=np.sign(d.c-d.o).shift(1)
    v=m._pd.get(day); return 0 if v is None or v!=v else int(v)

def day_open(m,day):
    x=m.m1[(m.m1.index>=day)&(m.m1.index<day+H(1))]; return x.o.iloc[0] if len(x) else None

def asia_sweep_reversal(m,day,p):
    """Asian range liquidity sweep -> close back inside -> reverse (London/Judas)."""
    asia=bars(m,"5min",day,0,6)
    if len(asia)<40: return []
    ah,al=asia.h.max(),asia.l.min(); tfm=pd.Timedelta(p["tf"]); out=[]
    swept_hi=swept_lo=None
    for ts,b in bars(m,p["tf"],day,6,15).iterrows():
        ct=ts+tfm
        if b.h>ah: swept_hi=max(swept_hi or b.h,b.h)
        if b.l<al: swept_lo=min(swept_lo or b.l,b.l)
        if not in_win(ct,day,p["win"]): continue
        if p.get("pdfade"):
            pdr=prev_dir(m,day)
            if pdr!=1: swept_hi=None
            if pdr!=-1: swept_lo=None
        if swept_hi and b.c<ah and b.c<b.o:
            if p.get("bias") and bias(m,ct)==1: swept_hi=None; continue
            t=mk(m,ct,-1,b.c,swept_hi+p.get("buf",0)*(ah-al),p["rr"],p)
            if t: out.append(t)
            break
        if swept_lo and b.c>al and b.c>b.o:
            if p.get("bias") and bias(m,ct)==-1: swept_lo=None; continue
            t=mk(m,ct,1,b.c,swept_lo-p.get("buf",0)*(ah-al),p["rr"],p)
            if t: out.append(t)
            break
    return out

def asia_breakout(m,day,p):
    """Classic London breakout of the Asian range, stop at range middle."""
    asia=bars(m,"5min",day,0,6)
    if len(asia)<40: return []
    ah,al=asia.h.max(),asia.l.min(); mid=(ah+al)/2; tfm=pd.Timedelta(p["tf"])
    for ts,b in bars(m,p["tf"],day,6,15).iterrows():
        ct=ts+tfm
        if not in_win(ct,day,p["win"]): continue
        if b.c>ah:
            if p.get("pdfade") and prev_dir(m,day)!=-1: return []
            if p.get("bias") and bias(m,ct)==-1: return []
            t=mk(m,ct,1,b.c,mid,p["rr"],p); return [t] if t else []
        if b.c<al:
            if p.get("pdfade") and prev_dir(m,day)!=1: return []
            if p.get("bias") and bias(m,ct)==1: return []
            t=mk(m,ct,-1,b.c,mid,p["rr"],p); return [t] if t else []
    return []

def ny_orb(m,day,p):
    """New York opening-range breakout. OR = 13:30 UTC + or_min (16:30 Doha)."""
    ny=13.5 if us_dst(day) else 14.5
    o=bars(m,"5min",day,ny,ny+p["or_min"]/60)
    if len(o)<p["or_min"]//5: return []
    oh,ol=o.h.max(),o.l.min(); tfm=pd.Timedelta(p["tf"])
    for ts,b in bars(m,p["tf"],day,ny+p["or_min"]/60,15).iterrows():
        ct=ts+tfm
        if ct>day+H(15): break
        if b.c>oh:
            if p.get("bias") and bias(m,ct)==-1: return []
            sl=(oh+ol)/2 if p.get("mid") else ol
            t=mk(m,ct,1,b.c,sl,p["rr"],p); return [t] if t else []
        if b.c<ol:
            if p.get("bias") and bias(m,ct)==1: return []
            sl=(oh+ol)/2 if p.get("mid") else oh
            t=mk(m,ct,-1,b.c,sl,p["rr"],p); return [t] if t else []
    return []

def trend_pullback(m,day,p):
    """1H EMA50 trend + entry-TF pullback to EMA20 then close back in trend."""
    x=m.tf[p["tf"]]; tfm=pd.Timedelta(p["tf"])
    e20=x.c.ewm(span=20,adjust=False).mean()
    seg=x[(x.index>=day+H(5))&(x.index<day+H(15))]
    for ts,b in seg.iterrows():
        ct=ts+tfm
        if not in_win(ct,day,p["win"]): continue
        if p.get("dirmode")=="day":
            do=day_open(m,day); adr=m.adr.asof(day)
            mv=(b.c-do)/adr if (do is not None and adr==adr) else 0
            bi=1 if mv>=p.get("dmin",0.2) else (-1 if mv<=-p.get("dmin",0.2) else 0)
        elif p.get("dirmode")=="pdfade": bi=-prev_dir(m,day)
        else: bi=bias(m,ct)
        if bi==0: continue
        e=e20.loc[ts]; prev=x.loc[:ts].iloc[-7:-1]
        if bi==1 and b.l<=e and b.c>e and b.c>b.o:
            t=mk(m,ct,1,b.c,min(b.l,prev.l.min()) if p.get("swing") else b.l,p["rr"],p); return [t] if t else []
        if bi==-1 and b.h>=e and b.c<e and b.c<b.o:
            t=mk(m,ct,-1,b.c,max(b.h,prev.h.max()) if p.get("swing") else b.h,p["rr"],p); return [t] if t else []
    return []

def level_sweep_reversal(m,day,p):
    """Sweep of a key level (London range in NY window, or previous-day high/low) then close back inside."""
    tfm=pd.Timedelta(p["tf"])
    if p["level"]=="london":
        ref=bars(m,"5min",day,6,13)
        if len(ref)<40: return []
        hi,lo=ref.h.max(),ref.l.min(); a,b_=13,15
    else:
        pd_=m.m1[(m.m1.index<day)&(m.m1.index>=day-pd.Timedelta(days=4))]; pd_=pd_[pd_.index.weekday<5]
        if len(pd_)<300: return []
        last=pd_.index.normalize()[-1]; pdd=pd_[pd_.index.normalize()==last]
        hi,lo=pdd.h.max(),pdd.l.min(); a,b_=0,15
    sh=sl_=None
    for ts,b in bars(m,p["tf"],day,a,b_).iterrows():
        ct=ts+tfm
        if b.h>hi: sh=max(sh or b.h,b.h)
        if b.l<lo: sl_=min(sl_ or b.l,b.l)
        if not in_win(ct,day,p["win"]): continue
        if sh and b.c<hi and b.c<b.o:
            if p.get("bias") and bias(m,ct)==1: sh=None; continue
            t=mk(m,ct,-1,b.c,sh,p["rr"],p); return [t] if t else []
        if sl_ and b.c>lo and b.c>b.o:
            if p.get("bias") and bias(m,ct)==-1: sl_=None; continue
            t=mk(m,ct,1,b.c,sl_,p["rr"],p); return [t] if t else []
    return []

def ny_fade(m,day,p):
    """Fade an extended 3-hour move at the New York open once a reversal candle prints."""
    x=m.tf[p["tf"]]; tfm=pd.Timedelta(p["tf"]); adr=m.adr.asof(day)
    if adr!=adr: return []
    for ts,b in x[(x.index>=day+H(12))&(x.index<day+H(16))].iterrows():
        ct=ts+tfm
        if p.get("nyanchor") and not us_dst(day):
            if not (day+H(14)<ct<=day+H(16)): continue
        elif not in_win(ct,day,"W2"): continue
        past=m.m1[(m.m1.index>=ct-H(3))&(m.m1.index<ct)]
        if len(past)<120: continue
        mv=(b.c-past.o.iloc[0])/adr; prevb=x.loc[:ts].iloc[-2]
        recent=m.m1[(m.m1.index>=ct-H(1))&(m.m1.index<ct)]
        if mv>=p["k"] and b.c<b.o and b.c<prevb.l:        # up-move exhausted -> short
            t=mk(m,ct,-1,b.c,recent.h.max(),p["rr"],p); return [t] if t else []
        if mv<=-p["k"] and b.c>b.o and b.c>prevb.h:       # down-move exhausted -> long
            t=mk(m,ct,1,b.c,recent.l.min(),p["rr"],p); return [t] if t else []
    return []

STRATS={"NYF":ny_fade,"ASR":asia_sweep_reversal,"ABO":asia_breakout,"ORB":ny_orb,"TPB":trend_pullback,"LSR":level_sweep_reversal}

def run(m,strat,p):
    rows=[]
    for day in m.days:
        for t in STRATS[strat](m,day,p):
            r=m.sim(t["time"],t["dir"],t["entry"],t["sl"],t["tp"],p.get("maxh",4),p.get("be"),t.get("limit",False))
            if r: rows.append({**t,**r})
    return pd.DataFrame(rows)

def stats(T):
    if len(T)==0: return dict(n=0)
    R=T.R; eq=R.cumsum(); dd=(eq-eq.cummax()).min()
    return dict(n=len(T),win=round((R>0).mean(),2),avgR=round(R.mean(),3),totR=round(R.sum(),1),
                PF=round(R[R>0].sum()/max(-R[R<0].sum(),1e-9),2),maxDD_R=round(dd,1),
                lose_streak=int(max((len(list(g)) for k,g in __import__("itertools").groupby(R<=0) if k),default=0)))

# ======================= Round 3 strategies (pair-specific / additional proven setups) =======================
from zoneinfo import ZoneInfo
_LON=ZoneInfo("Europe/London")
def lon_session(m,day):
    a=pd.Timestamp(day.year,day.month,day.day,8,tzinfo=_LON).tz_convert("UTC")
    b=pd.Timestamp(day.year,day.month,day.day,12,tzinfo=_LON).tz_convert("UTC")
    return m.m1[(m.m1.index>=a)&(m.m1.index<b)], b

def breakout_retest(m,day,p):
    """First close outside the Asian box (in 1H trend if bias) -> LIMIT order back at the box edge (retest).
    Stop: box middle (stop='mid') or beyond the breakout candle (stop='bar'). Limit valid until window end."""
    asia=bars(m,"5min",day,0,6)
    if len(asia)<40: return []
    ah,al=asia.h.max(),asia.l.min(); mid=(ah+al)/2; tfm=pd.Timedelta(p["tf"])
    for ts,b in bars(m,p["tf"],day,6,9).iterrows():
        ct=ts+tfm
        if not in_win(ct,day,"W1"): continue
        dr=1 if b.c>ah else (-1 if b.c<al else 0)
        if dr==0: continue
        if p.get("bias") and bias(m,ct)!=dr: return []
        e=ah if dr==1 else al
        sl=mid if p.get("stop","mid")=="mid" else (b.l if dr==1 else b.h)
        if (e-sl)*dr<=0: return []
        # wait for the limit to fill before 09:00 UTC (12:00 Doha)
        x=m.m1[(m.m1.index>=ct)&(m.m1.index<day+H(9))]
        hit=x.index[(x.l+m.spr<=e) if dr==1 else (x.h>=e)]
        if len(hit)==0: return []
        t=mk(m,hit[0],dr,e,sl,p["rr"],p)
        if t: t["limit"]=True
        return [t] if t else []
    return []

def london_draw(m,day,p):
    """NY window: trade toward the untaken London high/low (NY takes them ~70% of days), in 1H-trend direction,
    entry on a pullback candle, only if the London extreme is at least rr x risk away."""
    L,lend=lon_session(m,day)
    if len(L)<100: return []
    lh,ll=L.h.max(),L.l.min(); x=m.tf[p["tf"]]; tfm=pd.Timedelta(p["tf"]); e20=x.c.ewm(span=20,adjust=False).mean()
    for ts,b in x[(x.index>=lend)&(x.index<day+H(15))].iterrows():
        ct=ts+tfm
        if not in_win(ct,day,"W2"): continue
        so_far=m.m1[(m.m1.index>=lend)&(m.m1.index<ct)]
        bi=bias(m,ct)
        if bi==1 and so_far.h.max()<lh and b.l<=e20.loc[ts] and b.c>e20.loc[ts] and b.c>b.o:
            sl=x.loc[:ts].iloc[-6:].l.min(); r=b.c-sl
            if r>0 and (lh-b.c)>=p["rr"]*r:
                t=mk(m,ct,1,b.c,sl,p["rr"],p); return [t] if t else []
        if bi==-1 and so_far.l.min()>ll and b.h>=e20.loc[ts] and b.c<e20.loc[ts] and b.c<b.o:
            sl=x.loc[:ts].iloc[-6:].h.max(); r=sl-b.c
            if r>0 and (b.c-ll)>=p["rr"]*r:
                t=mk(m,ct,-1,b.c,sl,p["rr"],p); return [t] if t else []
    return []

def vwap_pullback(m,day,p):
    """Session VWAP trend pullback. VWAP anchored at 00:00 UTC (FX/gold) or NY cash open (anchor='ny')."""
    if p.get("anchor")=="ny":
        a=day+H(13.5 if us_dst(day) else 14.5)
    else: a=day
    s=m.m1[(m.m1.index>=a)&(m.m1.index<day+H(16))]
    if len(s)<30: return []
    tp_=(s.h+s.l+s.c)/3; vw=(tp_*s.v).cumsum()/s.v.cumsum().replace(0,np.nan)
    x=m.tf[p["tf"]]; tfm=pd.Timedelta(p["tf"])
    for ts,b in x[(x.index>=a)&(x.index<day+H(15))].iterrows():
        ct=ts+tfm
        if not in_win(ct,day,p["win"]): continue
        v=vw[vw.index<ct]
        if len(v)<10: continue
        v=v.iloc[-1]; bi=bias(m,ct) if p.get("bias") else 0
        prev=x.loc[:ts].iloc[-7:-1]
        if b.l<=v<b.c and b.c>b.o and (bi>=0) and (prev.c>v).mean()>=0.6:
            t=mk(m,ct,1,b.c,min(b.l,prev.l.min()),p["rr"],p); return [t] if t else []
        if b.h>=v>b.c and b.c<b.o and (bi<=0) and (prev.c<v).mean()>=0.6:
            t=mk(m,ct,-1,b.c,max(b.h,prev.h.max()),p["rr"],p); return [t] if t else []
    return []

def fvg_retrace(m,day,p):
    """Fair value gap (3-candle imbalance) in the 1H-trend direction -> LIMIT at the gap middle, stop beyond candle 1."""
    x=m.tf[p["tf"]]; tfm=pd.Timedelta(p["tf"])
    seg=x[(x.index>=day+H(5))&(x.index<day+H(16))]
    idx=list(seg.index); cands=[]
    for i in range(2,len(idx)):
        c1,c2,c3=seg.iloc[i-2],seg.iloc[i-1],seg.iloc[i]; ct=idx[i]+tfm
        if not in_win(ct,day,p["win"]): continue
        bi=bias(m,ct)
        if bi==1 and c3.l>c1.h and c2.c>c2.o:
            e=(c3.l+c1.h)/2; sl=c1.l; dr=1
        elif bi==-1 and c3.h<c1.l and c2.c<c2.o:
            e=(c3.h+c1.l)/2; sl=c1.h; dr=-1
        else: continue
        wins=[WIN["W1"],WIN["W2"]] if p["win"]=="BOTH" else [WIN[p["win"]]]
        wend=max(day+H(bb) for aa,bb in wins if day+H(aa)<ct<=day+H(bb))
        end=min(ct+H(1),wend+pd.Timedelta(minutes=1))
        y=m.m1[(m.m1.index>=ct)&(m.m1.index<end)]
        hit=y.index[(y.l+m.spr<=e) if dr==1 else (y.h>=e)]
        if len(hit): cands.append((hit[0],dr,e,sl))
    if not cands: return []
    f,dr,e,sl=min(cands,key=lambda z:z[0])
    t=mk(m,f,dr,e,sl,p["rr"],p)
    if t: t["limit"]=True
    return [t] if t else []

STRATS.update({"BRT":breakout_retest,"LDR":london_draw,"VWP":vwap_pullback,"FVG":fvg_retrace})
