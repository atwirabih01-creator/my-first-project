"""Signed (directional) average move per hour of the day, per year, and by weekday.
Tests the published 'home-hours' pattern (Breedon & Ranaldo 2013): a currency tends to weaken during its own
working hours. For EURUSD that would mean EURUSD drifts DOWN in European hours and UP in US hours.
Also checks the Monday-up / Wednesday-down day effect seen in 01_ranges."""
from common import *

df = complete(load("ALL"))
df["nyh"] = df.ny.dt.hour
h = df.groupby(["tday", "nyh"]).agg(o=("open", "first"), c=("close", "last"), year=("year", "first")).reset_index()
h["net"] = (h.c - h.o) / PIP
h["wd"] = h.tday.dt.dayofweek
print("Average SIGNED move per NY hour (pips; + = EUR up). t = mean/(sd/sqrt(n)). Doha = NY+7 summer / NY+8 winter")
for nyh, g in h.groupby("nyh"):
    s = []
    for y in ["Y1", "Y2"]:
        x = g[g.year == y].net
        s.append(f"{y} {x.mean():+5.2f} (t {x.mean()/x.std()*np.sqrt(len(x)):+4.1f}, up {np.mean(x>0):.0%})")
    print(f"NY {nyh:02d}:00 | " + " | ".join(s))
# blocks on local clocks
def block(name, mask):
    x = df[mask].groupby("tday").agg(o=("open", "first"), c=("close", "last"), year=("year", "first"))
    x["net"] = (x.c - x.o) / PIP
    out = []
    for y in ["Y1", "Y2"]:
        v = x[x.year == y].net
        out.append(f"{y} {v.mean():+5.2f} t {v.mean()/v.std()*np.sqrt(len(v)):+4.1f} up {np.mean(v>0):.0%} n={len(v)}")
    print(f"{name:40s} " + " | ".join(out))
    return x
L, N = df.ldn_min, df.ny_min
print("\nBlocks (signed net move, pips):")
block("Evening 17:00 NY-00:00 London", ~df.ldn_today)
block("Asia 00:00-07:00 London", df.ldn_today & (L < 420))
block("Europe 07:00 London-08:00 NY", df.ldn_today & (L >= 420) & (N < 480))
block("NY morning 08:00-12:00 NY", (N >= 480) & (N < 720))
block("NY afternoon 12:00-17:00 NY", (N >= 720) & (N < 1020))
block("Whole day", df.ny_min >= 0)
d = df.groupby("tday").agg(o=("open", "first"), c=("close", "last"), year=("year", "first"))
d["net"] = (d.c - d.o) / PIP; d["wd"] = d.index.dayofweek; d["q"] = d.index.to_period("Q")
print("\nWeekday signed net move (pips) per quarter, to see if Mon-up / Wed-down is steady:")
print(d.pivot_table(index="q", columns="wd", values="net", aggfunc="mean").round(1).to_string())
print("\nWeekday signed move, per block (pips, ALL design):")
for name, mask in [("evening", ~df.ldn_today), ("asia", df.ldn_today & (L < 420)), ("europe", df.ldn_today & (L >= 420) & (N < 480)),
                   ("ny am", (N >= 480) & (N < 720)), ("ny pm", (N >= 720) & (N < 1020))]:
    x = df[mask].groupby("tday").agg(o=("open", "first"), c=("close", "last"))
    x["net"] = (x.c - x.o) / PIP; x["wd"] = x.index.dayofweek; x["year"] = year_of(x.index)
    print(name, x.pivot_table(index="year", columns="wd", values="net", aggfunc="mean").round(1).to_dict("index"))
