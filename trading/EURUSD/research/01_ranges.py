"""Ranges by hour (NY clock + Doha), by session, weekday, month; Y1 and Y2 side by side. Complete days only."""
from common import *

df = complete(load("ALL"))
df["nyh"] = df.ny.dt.hour
h = df.groupby(["tday", "nyh"]).agg(o=("open", "first"), hi=("high", "max"), lo=("low", "min"), c=("close", "last"), year=("year", "first")).reset_index()
h["rng"] = (h.hi - h.lo) / PIP
h["net"] = (h.c - h.o).abs() / PIP
print("HOURLY range (pips), by New York hour. Doha = NY+7 (US summer time) / NY+8 (US winter time)")
print("NY hour | Doha summer/winter | Y1 avg  Y1 med | Y2 avg  Y2 med | ALL avg | clean(net/range)")
for nyh, g in h.groupby("nyh"):
    y1, y2 = g[g.year == "Y1"], g[g.year == "Y2"]
    print(f"{nyh:02d}:00 | {(nyh+7)%24:02d}:00/{(nyh+8)%24:02d}:00 | {y1.rng.mean():5.1f} {y1.rng.median():5.1f} | {y2.rng.mean():5.1f} {y2.rng.median():5.1f} | {g.rng.mean():5.1f} | {g.net.mean()/g.rng.mean():.2f}")

L, N = df.ldn_min, df.ny_min
sessions = {
    "Asia 00:00-07:00 London": (L >= 0) & (L < 420) & df.ldn_today,
    "Frankfurt 07:00-08:00 London": (L >= 420) & (L < 480),
    "London morning 08:00-12:00 London": (L >= 480) & (L < 720),
    "London full 08:00-16:30 London": (L >= 480) & (L < 990),
    "Overlap 08:00 NY-16:00 London": (N >= 480) & (L < 960) & (N < 1020),
    "NY 08:00-17:00 NY": (N >= 480) & (N < 1020),
    "NY afternoon 12:00-17:00 NY": (N >= 720) & (N < 1020),
    "Evening 17:00 NY-00:00 London": ~df.ldn_today,
}
day = df.groupby("tday").agg(hi=("high", "max"), lo=("low", "min"), o=("open", "first"), c=("close", "last"), year=("year", "first"))
day["rng"] = (day.hi - day.lo) / PIP
print("\nSESSIONS: avg / median range (pips) and share of days the session made the day's high / low")
for name, m in sessions.items():
    s = df[m].groupby("tday").agg(hi=("high", "max"), lo=("low", "min"))
    s["rng"] = (s.hi - s.lo) / PIP
    j = s.join(day, rsuffix="_d")
    out = []
    for y in ["Y1", "Y2"]:
        jj = j[j.year == y]
        out.append(f"{y}: avg {jj.rng.mean():5.1f} med {jj.rng.median():5.1f} hi {np.mean(jj.hi == jj.hi_d):.0%} lo {np.mean(jj.lo == jj.lo_d):.0%}")
    print(f"{name:36s} " + " | ".join(out))
for y in ["Y1", "Y2"]:
    d = day[day.year == y]
    print(f"\nDAILY range {y}: avg {d.rng.mean():.1f} med {d.rng.median():.1f} p25 {d.rng.quantile(.25):.1f} p75 {d.rng.quantile(.75):.1f} n={len(d)} | first open {d.o.iloc[0]:.4f} last close {d.c.iloc[-1]:.4f} min {d.lo.min():.4f} max {d.hi.max():.4f}")
day["wd"] = day.index.dayofweek
day["net"] = (day.c - day.o).abs() / PIP
names = ["Mon", "Tue", "Wed", "Thu", "Fri"]
print("\nWEEKDAY median range (avg net |open-close|), Y1 | Y2, plus share of up days")
for wd, g in day.groupby("wd"):
    a, b = g[g.year == "Y1"], g[g.year == "Y2"]
    print(f"{names[wd]} Y1 med {a.rng.median():5.1f} net {a.net.mean():5.1f} up {np.mean(a.c > a.o):.0%} n={len(a)} | Y2 med {b.rng.median():5.1f} net {b.net.mean():5.1f} up {np.mean(b.c > b.o):.0%} n={len(b)}")
day["m"] = day.index.to_period("M")
print("\nMONTH: avg daily range, month net move (pips)")
mm = day.groupby("m").agg(avg=("rng", "mean"), o=("o", "first"), c=("c", "last"), n=("rng", "size"))
mm["net"] = (mm.c - mm.o) / PIP
print(mm[["avg", "net", "n", "c"]].round(1).to_string())
