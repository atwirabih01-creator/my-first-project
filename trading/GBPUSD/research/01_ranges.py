"""Average range by hour (NY local hour, with Doha equivalents), by session and by weekday."""
from common import *

df = complete(load())

# ---------- hourly (by New York local clock hour) ----------
df["nyh"] = df.ny.dt.hour
df["dst"] = df.ny.apply(lambda t: t.utcoffset().total_seconds() == -4 * 3600) if False else (df.ny.dt.strftime("%z") == "-0400")
h = df.groupby(["tday", "nyh"]).agg(o=("open", "first"), hi=("high", "max"), lo=("low", "min"), c=("close", "last")).reset_index()
h["rng"] = (h.hi - h.lo) / PIP
h["net"] = (h.c - h.o).abs() / PIP
hs = h.groupby("nyh").agg(avg_range=("rng", "mean"), med_range=("rng", "median"), avg_net=("net", "mean"))
hs["clean"] = hs.avg_net / hs.avg_range  # share of the hour's range that became net movement
print("HOURLY (New York local hour; Doha = NY+7 in US summer time, NY+8 in US winter time)")
for nyh, r in hs.iterrows():
    print(f"NY {nyh:02d}:00 | Doha {(nyh+7)%24:02d}:00 (summer) / {(nyh+8)%24:02d}:00 (winter) | avg {r.avg_range:5.1f} | med {r.med_range:5.1f} | avg net {r.avg_net:5.1f} | clean {r.clean:.2f}")

# ---------- sessions (defined on local clocks) ----------
L, N = df.ldn_min, df.ny_min
sessions = {
    "Asia (00:00-07:00 London)": (L >= 0) & (L < 420),
    "Frankfurt hour (07:00-08:00 London)": (L >= 420) & (L < 480),
    "London morning (08:00-12:00 London)": (L >= 480) & (L < 720),
    "London full (08:00-16:30 London)": (L >= 480) & (L < 990),
    "Overlap (08:00 NY - 16:00 London)": (N >= 480) & (L < 960),
    "NY full (08:00-17:00 NY)": (N >= 480) & (N < 1020),
    "NY afternoon (12:00-17:00 NY)": (N >= 720) & (N < 1020),
}
day = df.groupby("tday").agg(hi=("high", "max"), lo=("low", "min"))
day["rng"] = (day.hi - day.lo) / PIP
print("\nSESSIONS: avg / median range (pips), share of days the session made the day's high or low")
for name, m in sessions.items():
    s = df[m].groupby("tday").agg(hi=("high", "max"), lo=("low", "min"))
    s["rng"] = (s.hi - s.lo) / PIP
    j = s.join(day, rsuffix="_d")
    made_hi = (j.hi == j.hi_d).mean(); made_lo = (j.lo == j.lo_d).mean()
    print(f"{name:40s} avg {s.rng.mean():5.1f} med {s.rng.median():5.1f} | made day high {made_hi:.0%} | made day low {made_lo:.0%}")

print(f"\nDAILY range (17:00-17:00 NY): avg {day.rng.mean():.1f}, median {day.rng.median():.1f}, 25th pct {day.rng.quantile(.25):.1f}, 75th pct {day.rng.quantile(.75):.1f}, n={len(day)}")

# ---------- weekday ----------
day["wd"] = day.index.dayofweek
o = df.groupby("tday").agg(o=("open", "first"), c=("close", "last"))
day = day.join(o); day["net"] = (day.c - day.o).abs() / PIP
names = ["Mon", "Tue", "Wed", "Thu", "Fri"]
print("\nWEEKDAY: avg range, median range, avg net move, n")
for wd, g in day.groupby("wd"):
    print(f"{names[wd]} avg {g.rng.mean():5.1f} med {g.rng.median():5.1f} net {g.net.mean():5.1f} n={len(g)}")

# ---------- month (to see regime changes) ----------
day["m"] = day.index.to_period("M")
print("\nMONTH: avg daily range")
print(day.groupby("m").rng.agg(["mean", "median", "count"]).round(1).to_string())
