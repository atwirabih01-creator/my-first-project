"""R0: per-year profile of gold 2019-2026 (design data). Scale, ATR, hourly ranges, session ranges, year move. Agent 1."""
import numpy as np, pandas as pd, common3 as c
M=c.load_matrix("XAUUSD"); days=M["days"]; n=len(days); off=M["ldn_off"]
END=pd.Timestamp("2026-09-30"); keep=(days<=END)
H,L,C,O=M["H"],M["L"],M["C"],M["O"]
dh=np.nanmax(H[:,60:1380],1); dl=np.nanmin(L[:,60:1380],1)
dc=C[:,c.col_ny(15,59)]
full=(M["nbars"]>=1300)&c.gap_ok(M,60,c.col_ny(16))
rng=pd.Series(np.where(full,dh-dl,np.nan))
atr=rng.rolling(20,min_periods=10).mean().shift(1)
yr=days.year
df=pd.DataFrame(dict(y=yr,rng=rng,atr=atr,px=dc,full=full))[keep]
g=df[df.full].groupby("y")
out=pd.DataFrame(dict(days=g.size(),px_med=g.px.median().round(0),rng_med=g.rng.median().round(1),
    rng_pct=(g.rng.median()/g.px.median()*100).round(2),cost_pct_rng=(0.40/g.rng.median()*100).round(2)))
first=df.groupby("y").px.first(); last=df.groupby("y").px.last()
out["year_move%"]=((last/first-1)*100).round(1)
print(out)
# hourly range as % of daily range, per NY hour, per year
rows={}
for hh in list(range(18,24))+list(range(0,16)):
    a=c.col_ny(hh); hr=np.nanmax(H[:,a:a+60],1)-np.nanmin(L[:,a:a+60],1)
    s=pd.Series(hr/rng.values)[keep&full]
    rows[f"{hh:02d}"]=s.groupby(yr[keep&full]).median().round(3)
print("\nmedian hour range / day range, by NY hour (rows) and year (cols)")
print(pd.DataFrame(rows).T)
# signed mean move per NY hour as % of ATR, per year (drift)
rows={}
for hh in list(range(18,24))+list(range(0,16)):
    a=c.col_ny(hh); mv=(C[:,a+59]-O[:,a])/atr.values*100
    s=pd.Series(mv)[keep&full]; rows[f"{hh:02d}"]=s.groupby(yr[keep&full]).mean().round(1)
print("\nmean signed move per NY hour, % of ATR20")
print(pd.DataFrame(rows).T)
