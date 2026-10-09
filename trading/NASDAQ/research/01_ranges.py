"""01: when does the Nasdaq move? Range per NY hour (and Doha), sessions, overnight vs RTH, weekday, calm/volatile. Y1 and Y2 separately."""
from levels import *
df = load(); T = day_table(df)
good = T[T.ok].index
d = df[df.tday.isin(good) & (df.nymin >= 0) | (df.tday.isin(good) & (df.nymin < 0))].copy()
d["hr"] = d.ny.dt.hour
d["half"] = (d.ny.dt.minute >= 30).astype(int)
# hourly range in % of price (NY clock hour), per day
g = d.groupby(["tday", "hr"]).agg(h=("high", "max"), l=("low", "min"), o=("open", "first"), n=("open", "size"))
g = g[g.n >= 45]
g["rp"] = 100 * (g.h - g.l) / g.o
g = g.reset_index(); g["year"] = year_of(g.tday)
print("=== 1. Average range per clock hour, % of price (good days only). Doha = NY+7 (US summer) / NY+8 (US winter)")
p = g.pivot_table(index="hr", columns="year", values="rp", aggfunc="mean")
p["ratio_vs_median_hr_Y1"] = p.Y1 / p.Y1.median(); p["ratio_vs_median_hr_Y2"] = p.Y2 / p.Y2.median()
p.index = [f"NY {h:02d}:00 | Doha {(h+7)%24:02d}:00 sum / {(h+8)%24:02d}:00 win" for h in p.index]
print(p.round(3).to_string())
# half-hour around the open
print("\n=== 2. Range per 30-min block 08:00-16:30 NY, % of price")
d2 = d[(d.nymin >= 480) & (d.nymin < 990)].copy(); d2["blk"] = d2.nymin // 30 * 30
b = d2.groupby(["tday", "blk"]).agg(h=("high", "max"), l=("low", "min"), o=("open", "first")).reset_index()
b["rp"] = 100 * (b.h - b.l) / b.o; b["year"] = year_of(b.tday)
pb = b.pivot_table(index="blk", columns="year", values="rp", aggfunc="mean")
pb.index = [f"NY {m//60:02d}:{m%60:02d}" for m in pb.index]
print(pb.round(3).to_string())
# sessions
print("\n=== 3. Sessions (NY clock): average range % and share of the full day's range")
S = {"Asia 18:00-03:00": (-1, 180), "London 03:00-08:00": (180, 480), "Pre-open 08:00-09:30": (480, 570),
     "RTH first hour 09:30-10:30": (570, 630), "RTH 10:30-12:00": (630, 720), "Lunch 12:00-14:00": (720, 840),
     "Afternoon 14:00-16:00": (840, 960), "After 16:00-17:00": (960, 1020), "Full RTH 09:30-16:00": (570, 960),
     "Overnight 18:00-09:30": (-1, 570)}
out = []
for nmz, (a, bb) in S.items():
    m = (d.nymin >= a) & (d.nymin < bb) if a >= 0 else ((d.nymin < bb))
    s = d[m].groupby("tday").agg(h=("high", "max"), l=("low", "min"), o=("open", "first"))
    s["rp"] = 100 * (s.h - s.l) / s.o; s = s.join(T[["day_hi", "day_lo"]])
    s["share"] = (s.h - s.l) / (s.day_hi - s.day_lo)
    s["year"] = year_of(s.index)
    for y in ["Y1", "Y2"]:
        q = s[s.year == y]; out.append((nmz, y, q.rp.mean(), q.share.mean()))
o = pd.DataFrame(out, columns=["session", "year", "range_pct", "share_of_day_range"]).pivot(index="session", columns="year")
print(o.round(3).to_string())
# overnight vs RTH contribution to close-to-close
print("\n=== 4. Where does the daily move happen? prev 16:00 close -> 09:30 open (overnight) vs 09:30 -> 16:00 (RTH)")
x = T[T.ok & T.prev_ok].copy()
x["on_ret"] = 100 * (x.o930 / x.pdc - 1); x["rth_ret"] = 100 * (x.c1600 / x.o930 - 1)
for y in ["Y1", "Y2"]:
    q = x[x.year == y]
    vo, vr = q.on_ret.var(), q.rth_ret.var()
    print(f"{y}: days {len(q)} | mean overnight {q.on_ret.mean():+.3f}% (sum {q.on_ret.sum():+.1f}%), mean RTH {q.rth_ret.mean():+.3f}% (sum {q.rth_ret.sum():+.1f}%)"
          f" | abs size overnight {q.on_ret.abs().mean():.3f}% vs RTH {q.rth_ret.abs().mean():.3f}% | variance share overnight {vo/(vo+vr)*100:.0f}%"
          f" | corr(overnight, RTH) {q.on_ret.corr(q.rth_ret):+.3f} | up RTH days {100*(q.rth_ret>0).mean():.1f}%")
print("\n=== 5. Weekday: RTH range %, RTH return mean, % up (RTH open->close)")
x["wd"] = x.index.dayofweek
print(x.groupby(["year", "wd"]).agg(n=("rth_ret", "size"), rng=("rth_rng_pct", "mean"), ret=("rth_ret", "mean"), up=("rth_ret", lambda s: 100 * (s > 0).mean()),
                                    on=("on_ret", "mean")).round(3).to_string())
print("\n=== 6. Calm vs volatile (ATR% = mean RTH range % of the prior 14 good days; split at the design-period median)")
med = x.atr_pct.median(); print(f"median ATR% = {med:.3f}")
x["vol"] = np.where(x.atr_pct > med, "volatile", "calm")
print(x.groupby(["year", "vol"]).agg(n=("rth_ret", "size"), rng=("rth_rng_pct", "mean"), ret=("rth_ret", "mean"), up=("rth_ret", lambda s: 100 * (s > 0).mean())).round(3).to_string())
print("\n=== 7. Monthly: RTH range %, sum of RTH returns, sum of overnight returns")
x["mo"] = x.index.to_period("M")
print(x.groupby("mo").agg(n=("rth_ret", "size"), rng=("rth_rng_pct", "mean"), atr=("atr_pct", "mean"), rth=("rth_ret", "sum"), on=("on_ret", "sum")).round(2).to_string())
