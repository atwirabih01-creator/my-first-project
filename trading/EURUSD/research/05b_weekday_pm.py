"""Follow-up on 05: NY afternoon (12:00-17:00 NY) signed move by weekday, by quarter, without FOMC days; Monday Asia."""
from common import *
from news_calendar import EVENTS
df = complete(load("ALL"))
fomc = {pd.Timestamp(d) for d, hm, tz, lab in EVENTS if lab == "FOMC"}
N, L = df.ny_min, df.ldn_min
def blk(mask):
    x = df[mask].groupby("tday").agg(o=("open", "first"), c=("close", "last"))
    x["net"] = (x.c - x.o) / PIP; x["wd"] = x.index.dayofweek; x["year"] = year_of(x.index); x["q"] = x.index.to_period("Q")
    return x
pm = blk((N >= 720) & (N < 1020))
pm_nf = pm[~pm.index.isin(fomc)]
print("NY afternoon 12:00-17:00 NY (Doha 19:00-24:00 summer / 20:00-01:00 winter), signed pips, FOMC days removed:")
for wd in range(5):
    s = []
    for y in ["Y1", "Y2"]:
        v = pm_nf[(pm_nf.wd == wd) & (pm_nf.year == y)].net
        s.append(f"{y} mean {v.mean():+5.1f} median {v.median():+5.1f} t {v.mean()/v.std()*np.sqrt(len(v)):+4.1f} down {np.mean(v<0):.0%} n={len(v)}")
    print(["Mon", "Tue", "Wed", "Thu", "Fri"][wd], " | ".join(s))
print("\nWednesday pm by quarter (FOMC removed):", pm_nf[pm_nf.wd == 2].groupby("q").net.agg(["mean", "count"]).round(1).to_dict("index"))
print("Friday pm by quarter:", pm_nf[pm_nf.wd == 4].groupby("q").net.agg(["mean", "count"]).round(1).to_dict("index"))
w = pm_nf[pm_nf.wd == 2].net
print(f"Wednesday pm: sum {w.sum():+.0f} pips, without best 3 days for a short (3 biggest down days removed): {w.sort_values().iloc[3:].sum():+.0f}")
asia = blk(df.ldn_today & (L < 420))
for y in ["Y1", "Y2"]:
    v = asia[(asia.wd == 0) & (asia.year == y)].net
    print(f"Monday Asia {y}: mean {v.mean():+.1f} t {v.mean()/v.std()*np.sqrt(len(v)):+.1f} up {np.mean(v>0):.0%}")
# same, but stopping at 16:00 NY (avoids the bid-price drop as spreads widen into the 17:00 NY rollover)
pm16 = blk((N >= 720) & (N < 960)); pm16 = pm16[~pm16.index.isin(fomc)]
print("\nNY 12:00-16:00 NY only (FOMC removed):")
for wd in range(5):
    print(["Mon", "Tue", "Wed", "Thu", "Fri"][wd], " | ".join(f"{y} {pm16[(pm16.wd==wd)&(pm16.year==y)].net.mean():+5.1f}" for y in ["Y1", "Y2"]))
