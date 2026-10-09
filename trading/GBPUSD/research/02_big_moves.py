"""Where do the big intraday moves start, and what happens just before them?
Part A: top-25% range days -> when/where the main leg started.
Part B: all directional legs >= 50 pips (zigzag with 25-pip reversal) -> start hour + context."""
from common import *
from levels import day_table

df = load()
days = day_table(df)
cd = days[days.complete & days.prev_complete & days.pdh.notna()].copy()
utc2 = lambda t, tz: t.tz_localize("UTC").tz_convert(tz)

def ctx(t_start, d, side):
    """side='low' if the leg starts from a low (up move) else 'high'."""
    tl = utc2(t_start, "Europe/London"); tn = utc2(t_start, "America/New_York")
    Lm = tl.hour * 60 + tl.minute; Nm = tn.hour * 60 + tn.minute
    ldn_today = tl.normalize().tz_localize(None) == d.name
    if ldn_today and Lm < 420: sess = "Asia"
    elif not ldn_today: sess = "Evening/pre-Asia"
    elif Lm < 480: sess = "Frankfurt 07-08 Ldn"
    elif Nm < 480 and Lm < 720: sess = "London morning"
    elif Nm < 480: sess = "London midday (12:00 Ldn-08:00 NY)"
    elif Nm < 720: sess = "NY morning 08-12 NY"
    else: sess = "NY afternoon"
    price = d.lo_leg if side == "low" else d.hi_leg
    sweeps = []
    after_asia = ldn_today and Lm >= 420
    if side == "low":
        if after_asia and price < d.al: sweeps.append("Asia low swept")
        if price < d.pdl: sweeps.append("PDL swept")
    else:
        if after_asia and price > d.ah: sweeps.append("Asia high swept")
        if price > d.pdh: sweeps.append("PDH swept")
    return sess, sweeps, Nm

thr = cd.rng.quantile(0.75)
big = cd[cd.rng >= thr].copy()
print(f"Part A: top-25% days: range >= {thr:.1f} pips, n={len(big)}; avg range {big.rng.mean():.1f}")
print("Big days by weekday:", big.index.dayofweek.value_counts().sort_index().to_dict(), "(0=Mon)")
out = []
for tday, d in big.iterrows():
    up = d.close > d.open
    t_start = d.t_lo if up else d.t_hi
    d = d.copy(); d["lo_leg"] = d.lo; d["hi_leg"] = d.hi
    sess, sw, Nm = ctx(t_start, d, "low" if up else "high")
    t_end = d.t_hi if up else d.t_lo
    trend_close = abs(d.close - d.open) / PIP / d.rng
    out.append(dict(tday=tday, up=up, sess=sess, sweeps=";".join(sw) or "none", start_ny=f"{Nm//60:02d}:{Nm%60:02d}",
                    trendiness=trend_close))
O = pd.DataFrame(out)
print("Direction up:", f"{O.up.mean():.0%}")
print("Main leg start session:\n", O.sess.value_counts().to_string())
print("Context at the leg's starting extreme:\n", O.sweeps.value_counts().to_string())
print(f"Big-day close-to-open as share of range (trendiness): median {O.trendiness.median():.2f}")
small = cd[cd.rng < thr]
print(f"Other days trendiness: median {(abs(small.close-small.open)/PIP/small.rng).median():.2f}")
# Asia range before big days
print(f"Asia range on big days: median {big.arng.median():.1f} vs other days {small.arng.median():.1f}")
# previous-day range before big days
days["prev_rng"] = days.rng.shift(1)
print(f"Previous-day range before big days: median {days.loc[big.index,'prev_rng'].median():.1f} vs other days {days.loc[small.index,'prev_rng'].median():.1f}")

# -------- Part B: zigzag legs --------
REV = 25 * PIP; MINLEG = 50
legs = []
for tday, g in df[df.tday.isin(cd.index)].groupby("tday"):
    hi, lo, t = g.high.values, g.low.values, g.time_utc.values
    # simple zigzag on 1-minute highs/lows, restarted each trading day (day trading only)
    direction = 0; ext_i = 0; piv_i = 0
    hi_i, lo_i = 0, 0
    for i in range(1, len(g)):
        if direction >= 0 and hi[i] >= hi[hi_i]: hi_i = i
        if direction <= 0 and lo[i] <= lo[lo_i]: lo_i = i
        if direction == 0:
            if hi[hi_i] - lo[lo_i] >= REV:
                direction = 1 if hi_i > lo_i else -1
                piv_i = lo_i if direction == 1 else hi_i
                if direction == 1: lo_i = i
                else: hi_i = i
        elif direction == 1:
            if hi[hi_i] - lo[i] >= REV and i > hi_i:
                legs.append((tday, t[piv_i], t[hi_i], (hi[hi_i] - lo[piv_i]) / PIP, 1, lo[piv_i]))
                direction = -1; piv_i = hi_i; lo_i = i
        else:
            if hi[i] - lo[lo_i] >= REV and i > lo_i:
                legs.append((tday, t[piv_i], t[lo_i], (hi[piv_i] - lo[lo_i]) / PIP, -1, hi[piv_i]))
                direction = 1; piv_i = lo_i; hi_i = i
    # final open leg at day end
    if direction == 1: legs.append((tday, t[piv_i], t[hi_i], (hi[hi_i] - lo[piv_i]) / PIP, 1, lo[piv_i]))
    elif direction == -1: legs.append((tday, t[piv_i], t[lo_i], (hi[piv_i] - lo[lo_i]) / PIP, -1, hi[piv_i]))
Lg = pd.DataFrame(legs, columns=["tday", "t0", "t1", "pips", "dir", "p0"])
Lg = Lg[Lg.pips >= MINLEG]
print(f"\nPart B: legs >= {MINLEG} pips (25-pip reversal zigzag): n={len(Lg)}, on {Lg.tday.nunique()} of {len(cd)} days; median size {Lg.pips.median():.1f}")
rows = []
for _, l in Lg.iterrows():
    d = cd.loc[l.tday].copy(); d["lo_leg"] = l.p0; d["hi_leg"] = l.p0
    sess, sw, Nm = ctx(pd.Timestamp(l.t0), d, "low" if l.dir == 1 else "high")
    dur = (pd.Timestamp(l.t1) - pd.Timestamp(l.t0)).total_seconds() / 60
    rows.append(dict(sess=sess, sweeps=";".join(sw) or "none", nyh=Nm // 60, dur=dur, pips=l.pips))
B = pd.DataFrame(rows)
print("Leg start session:\n", B.sess.value_counts().to_string())
print("Leg start hour (NY clock; Doha = +7 summer / +8 winter):\n", B.nyh.value_counts().sort_index().to_string())
print("Context at leg start:\n", B.sweeps.value_counts().to_string())
print(f"Median leg duration {B.dur.median():.0f} min")
