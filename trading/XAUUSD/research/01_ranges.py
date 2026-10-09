"""When does gold move? Hour ranges ($, %, x ATR), sessions, weekdays, months. Per design year."""
from common import *
from levels import day_table

df = load("ALL")
days = day_table(df)
ok = days[days.complete & days.atr14.notna()].index
df = df[df.tday.isin(ok)].copy()
df["hr"] = df.ny.dt.hour
df["atr"] = df.tday.map(days.atr14)
h = df.groupby(["tday", "hr"]).agg(hi=("high", "max"), lo=("low", "min"), op=("open", "first"), cl=("close", "last"), atr=("atr", "first"))
h["rng"] = h.hi - h.lo; h["pct"] = 100 * h.rng / h.op; h["xatr"] = h.rng / h.atr
h["clean"] = (h.cl - h.op).abs() / h.rng.replace(0, np.nan)
h["year"] = year_of(h.index.get_level_values(0))


def doha(nyh):
    return f"{(nyh+7)%24:02d}/{(nyh+8)%24:02d}"


print("=== Range by New York hour (complete days, ATR known). $ = dollars, % of price, xATR = share of the 14-day avg daily range")
print("NY hr | Doha sum/win | Y1 avg$ | Y1 med$ | Y1 % | Y1 xATR | Y2 avg$ | Y2 med$ | Y2 % | Y2 xATR | clean Y1/Y2")
for hr in [18, 19, 20, 21, 22, 23] + list(range(0, 17)):
    s = h.xs(hr, level=1)
    a, b = s[s.year == "Y1"], s[s.year == "Y2"]
    print(f"{hr:02d}:00 | {doha(hr)} | {a.rng.mean():6.2f} | {a.rng.median():6.2f} | {a.pct.mean():.3f} | {a.xatr.mean():.3f} | "
          f"{b.rng.mean():6.2f} | {b.rng.median():6.2f} | {b.pct.mean():.3f} | {b.xatr.mean():.3f} | {a.clean.mean():.2f}/{b.clean.mean():.2f}")

# sessions (local clocks)
def sess(name, mask_fn):
    out = {}
    for y in ["Y1", "Y2"]:
        sub = df[(df.year == y) & mask_fn(df)]
        g = sub.groupby("tday").agg(hi=("high", "max"), lo=("low", "min"))
        g = g.join(days[["hi", "lo", "atr14", "open"]], rsuffix="_d")
        rng = g.hi - g.lo
        out[y] = (rng.mean(), rng.median(), (100 * rng / g.open).mean(), (rng / g.atr14).mean(),
                  (g.hi == g.hi_d).mean() * 100, (g.lo == g.lo_d).mean() * 100)
    print(f"{name:42s} | " + " | ".join(f"{y}: avg {v[0]:6.2f} med {v[1]:6.2f} {v[2]:.2f}% {v[3]:.2f}xATR dayHi {v[4]:3.0f}% dayLo {v[5]:3.0f}%" for y, v in out.items()))

print("\n=== Sessions (range, share of days the session made the day's high / low)")
sess("Evening 18:00-00:00 NY (day open)", lambda d: ~d.ny_today)
sess("Asia 00:00-07:00 London", lambda d: d.ldn_today & (d.ldn_min < 420))
sess("London open hour 07:00-08:00 London", lambda d: d.ldn_today & (d.ldn_min >= 420) & (d.ldn_min < 480))
sess("London morning 08:00-12:00 London", lambda d: d.ldn_today & (d.ldn_min >= 480) & (d.ldn_min < 720))
sess("Pre-NY 12:00 London - 08:00 NY", lambda d: d.ldn_today & (d.ldn_min >= 720) & d.ny_today & (d.ny_min < 480))
sess("NY morning 08:00-12:00 NY", lambda d: d.ny_today & (d.ny_min >= 480) & (d.ny_min < 720))
sess("NY 08:00-11:00 NY", lambda d: d.ny_today & (d.ny_min >= 480) & (d.ny_min < 660))
sess("NY afternoon 12:00-17:00 NY", lambda d: d.ny_today & (d.ny_min >= 720))
sess("Whole NY day 08:00-17:00 NY", lambda d: d.ny_today & (d.ny_min >= 480))

c = days.loc[ok]
print("\n=== Whole day")
for y in ["Y1", "Y2"]:
    s = c[c.year == y]
    print(f"{y}: days {len(s)}, range avg ${s.rng.mean():.2f} med ${s.rng.median():.2f}, avg {s.rng_pct.mean():.2f}% of price, "
          f"price {s.open.iloc[0]:.0f} -> {s.close.iloc[-1]:.0f}, up days {(s.close > s.open).mean()*100:.0f}%, "
          f"avg open-to-close {(s.close - s.open).mean():+.2f} $ ({(100*(s.close/s.open-1)).mean():+.3f}%)")

print("\n=== Weekday: median range as xATR and %, up-day share")
c = c.assign(wd=c.index.dayofweek, xatr=c.rng / c.atr14, up=c.close > c.open)
for y in ["Y1", "Y2"]:
    s = c[c.year == y]
    print(y, " | ".join(f"{['Mon','Tue','Wed','Thu','Fri'][w]}: n{(s.wd==w).sum()} {s[s.wd==w].xatr.median():.2f}xATR {s[s.wd==w].rng_pct.median():.2f}% up{s[s.wd==w].up.mean()*100:.0f}%" for w in range(5)))

print("\n=== Month: avg range $ and %")
m = c.groupby(c.index.to_period("M")).agg(rng=("rng", "mean"), pct=("rng_pct", "mean"), o=("open", "first"), cl=("close", "last"))
for p, r in m.iterrows():
    print(f"{p}: ${r.rng:6.2f}  {r.pct:.2f}%  open {r.o:7.1f} close {r.cl:7.1f}")
