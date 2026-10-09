"""Where do big gold moves come from? Big days (top 25% by range/ATR) and all swings >= 0.5 x ATR. Per design year."""
from common import *
from levels import day_table

df = load("ALL")
days = day_table(df)
c = days[days.complete & days.prev_complete & days.atr14.notna()].copy()
c["xatr"] = c.rng / c.atr14
c["trend"] = (c.close - c.open).abs() / c.rng
cut = c.xatr.quantile(0.75)
c["big"] = c.xatr >= cut
G = {t: g for t, g in df[df.tday.isin(c.index)].groupby("tday")}


def bucket(ts, tday):
    nyd = ts.tz_localize(None).normalize()
    m = ts.hour * 60 + ts.minute
    if nyd < tday: return "evening 18-24 NY"
    if m < 180: return "Asia late 00-03 NY"
    if m < 480: return "London 03-08 NY"
    if m < 720: return "NY morning 08-12"
    return "NY afternoon 12-17"


print(f"Big day = range >= {cut:.2f} x ATR14 (top 25% of days over 21 months)")
for y in ["Y1", "Y2"]:
    s = c[c.year == y]; b = s[s.big]
    print(f"\n--- {y}: big days {len(b)} of {len(s)}; up {(b.close > b.open).mean()*100:.0f}%; trend ratio big {b.trend.mean():.2f} vs other {s[~s.big].trend.mean():.2f}")
    starts = []
    for t, r in b.iterrows():
        up = r.close > r.open
        ts = r.t_lo if up else r.t_hi
        starts.append(bucket(ts, t))
    print("  starting extreme (low of up day / high of down day) set in:", pd.Series(starts).value_counts().to_dict())
    # precursors
    prev_x = s.xatr.shift(1)
    print(f"  previous day xATR: big {prev_x[s.big].mean():.2f} vs other {prev_x[~s.big].mean():.2f}")
    ar = (s.ah - s.al) / s.atr14
    print(f"  Asia range xATR:   big {ar[s.big].mean():.2f} vs other {ar[~s.big].mean():.2f}")
    print(f"  weekday of big days: {b.index.dayofweek.value_counts().sort_index().to_dict()} (0=Mon)")

# swings: zigzag on 1-min closes with reversal 0.25 x ATR, keep moves >= 0.5 x ATR, inside one trading day
print("\n=== All intraday swings >= 0.5 x ATR (zigzag, reversal 0.25 x ATR)")
for y in ["Y1", "Y2"]:
    rows = []
    for t, r in c[c.year == y].iterrows():
        g = G[t]; p = g.close.values; ny = g.ny; A = r.atr14
        ext_i = 0; d = 0; piv = 0
        hi_i = lo_i = 0
        piv_list = [0]
        for i in range(1, len(p)):
            if p[i] > p[hi_i]: hi_i = i
            if p[i] < p[lo_i]: lo_i = i
            if d >= 0 and p[hi_i] - p[i] >= 0.25 * A and hi_i > piv_list[-1]:
                if d == 0 or True:
                    piv_list.append(hi_i); d = -1; lo_i = i
            elif d <= 0 and p[i] - p[lo_i] >= 0.25 * A and lo_i > piv_list[-1]:
                piv_list.append(lo_i); d = 1; hi_i = i
        piv_list.append(len(p) - 1)
        for a, b_ in zip(piv_list[:-1], piv_list[1:]):
            mv = p[b_] - p[a]
            if abs(mv) >= 0.5 * A:
                ts = ny.iloc[a]; px = g.close.values[a]
                swept = (g.high.values[:a + 1].max() > r.pdh) if mv < 0 else (g.low.values[:a + 1].min() < r.pdl)
                rows.append(dict(start=bucket(ts, t), hour=ts.hour, size=abs(mv) / A, mins=b_ - a, up=mv > 0, swept_pd=swept))
    R = pd.DataFrame(rows)
    print(f"{y}: {len(R)} swings, median {R['size'].median():.2f} x ATR, median {R.mins.median():.0f} min, up {R.up.mean()*100:.0f}%")
    print("   start window share:", (R.start.value_counts(normalize=True) * 100).round(0).to_dict())
    print("   start NY hour top:", (R.hour.value_counts(normalize=True) * 100).round(1).sort_values(ascending=False).head(8).to_dict())
    print(f"   started after taking PDH (down swings) / PDL (up swings) earlier that day: {R.swept_pd.mean()*100:.0f}%")
