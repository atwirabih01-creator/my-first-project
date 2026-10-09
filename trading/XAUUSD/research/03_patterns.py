"""Repeating behaviours: level sweeps (Asia / previous day), continuation vs reversal, 08:30/09:30/10:00 NY,
and 'does an earlier move predict a later move' scan. Per design year. Moves measured in x ATR14."""
from common import *
from levels import day_table

df = load("ALL")
days = day_table(df)
c = days[days.complete & days.prev_complete & days.atr14.notna()].copy()
G = {t: g for t, g in df[df.tday.isin(c.index)].groupby("tday")}


def px(g, m, field="open"):
    """price at NY minute m of the trading day's NY date (open of that bar)"""
    s = g[g.ny_today & (g.ny_min == m)]
    return s[field].iloc[0] if len(s) else np.nan


def last_before(g, m):
    s = g[g.ny_today & (g.ny_min < m)]
    return s.close.iloc[-1] if len(s) else np.nan


rows = []
for t, r in c.iterrows():
    g = G[t]
    tod = g.ny_today.values; N = g.ny_min.values
    hi, lo = g.high.values, g.low.values
    d = dict(tday=t, year=r.year, A=r.atr14)
    d["o"] = r.open
    for m in [180, 480, 510, 540, 570, 600, 660, 720, 780, 900]:
        d[f"p{m}"] = px(g, m)
    d["p960"] = last_before(g, 960)
    d["prev_ret"] = (r.pdc - days.open.shift(1).get(t, np.nan))
    # sweeps
    win = g.ldn_today.values & (g.ldn_min.values >= 420) & ~(tod & (N >= 720))    # 07:00 London -> 12:00 NY
    d["pdh_taken"] = (hi > r.pdh).any(); d["pdl_taken"] = (lo < r.pdl).any()
    d["close_above_pdh"] = r.close > r.pdh; d["close_below_pdl"] = r.close < r.pdl
    d["asia_h_taken"] = (hi[win] > r.ah).any(); d["asia_l_taken"] = (lo[win] < r.al).any()
    # first Asia break in window
    ih = np.argmax(hi[win] > r.ah) if d["asia_h_taken"] else 10**9
    il = np.argmax(lo[win] < r.al) if d["asia_l_taken"] else 10**9
    d["first"] = 0 if ih == il == 10**9 else (1 if ih < il else -1)
    if d["first"] != 0:
        idx = np.where(win)[0][min(ih, il)]
        mid = (r.ah + r.al) / 2
        after_h, after_l = hi[idx:], lo[idx:]
        d["back_mid"] = (after_l <= mid).any() if d["first"] == 1 else (after_h >= mid).any()
        d["opp_side"] = (after_l < r.al).any() if d["first"] == 1 else (after_h > r.ah).any()
        d["close_beyond"] = (r.close > r.ah) if d["first"] == 1 else (r.close < r.al)
        d["break_hour"] = g.ny.iloc[idx].hour
    rows.append(d)
D = pd.DataFrame(rows).set_index("tday")

print("=== Level behaviour (share of complete days)")
for y in ["Y1", "Y2"]:
    s = D[D.year == y]
    ph = s[s.pdh_taken]; pl = s[s.pdl_taken]
    f = s[s["first"] != 0]
    print(f"{y} (n={len(s)}): PDH traded {s.pdh_taken.mean()*100:.0f}%, PDL traded {s.pdl_taken.mean()*100:.0f}%, both {(s.pdh_taken&s.pdl_taken).mean()*100:.0f}% | "
          f"after PDH traded, day closes above PDH {ph.close_above_pdh.mean()*100:.0f}% | after PDL traded, closes below PDL {pl.close_below_pdl.mean()*100:.0f}%")
    print(f"     Asia (00-07 London) high taken 07:00 London-12:00 NY {s.asia_h_taken.mean()*100:.0f}%, low {s.asia_l_taken.mean()*100:.0f}%, both {(s.asia_h_taken&s.asia_l_taken).mean()*100:.0f}% | "
          f"first break: back to Asia middle {f.back_mid.astype(float).mean()*100:.0f}%, reaches opposite side {f.opp_side.astype(float).mean()*100:.0f}%, day closes beyond broken side {f.close_beyond.astype(float).mean()*100:.0f}%")
    print(f"     first Asia break hour (NY) distribution: {(f.break_hour.value_counts(normalize=True)*100).round(0).sort_index().to_dict()}")

# predictability scan
pairs = {
    "prev day (open->close) -> today day": (lambda x: x.prev_ret, lambda x: x.p960 - x.o),
    "overnight 18:00->08:00 NY -> 08:00-12:00": (lambda x: x.p480 - x.o, lambda x: x.p720 - x.p480),
    "overnight 18:00->08:00 NY -> 08:00-16:00": (lambda x: x.p480 - x.o, lambda x: x.p960 - x.p480),
    "Asia 18:00->03:00 NY -> London 03:00-08:00": (lambda x: x.p180 - x.o, lambda x: x.p480 - x.p180),
    "London 03:00->08:00 -> NY 08:00-12:00": (lambda x: x.p480 - x.p180, lambda x: x.p720 - x.p480),
    "08:00->08:30 -> 08:30-12:00": (lambda x: x.p510 - x.p480, lambda x: x.p720 - x.p510),
    "08:30->09:00 (data reaction) -> 09:00-12:00": (lambda x: x.p540 - x.p510, lambda x: x.p720 - x.p540),
    "08:00->09:30 -> 09:30-12:00": (lambda x: x.p570 - x.p480, lambda x: x.p720 - x.p570),
    "09:30->10:00 -> 10:00-12:00": (lambda x: x.p600 - x.p570, lambda x: x.p720 - x.p600),
    "08:00->10:00 -> 10:00-16:00": (lambda x: x.p600 - x.p480, lambda x: x.p960 - x.p600),
    "day open->10:00 -> 10:00-16:00": (lambda x: x.p600 - x.o, lambda x: x.p960 - x.p600),
    "day open->12:00 -> 12:00-16:00": (lambda x: x.p720 - x.o, lambda x: x.p960 - x.p720),
    "08:00->12:00 -> 12:00-16:00": (lambda x: x.p720 - x.p480, lambda x: x.p960 - x.p720),
    "day open->13:00 -> 13:00-16:00": (lambda x: x.p780 - x.o, lambda x: x.p960 - x.p780),
    "day open->15:00 -> 15:00-16:00": (lambda x: x.p900 - x.o, lambda x: x.p960 - x.p900),
}
print("\n=== Does an earlier move predict a later one? corr | follow rate | avg follow-through in $ and x ATR (sign of earlier move x later move)")
for name, (f1, f2) in pairs.items():
    out = []
    for y in ["Y1", "Y2"]:
        s = D[D.year == y]
        a, b = f1(s), f2(s)
        m = a.notna() & b.notna() & (a != 0)
        a, b, A = a[m], b[m], s.A[m]
        ft = np.sign(a) * b
        out.append(f"{y}: n{m.sum()} r={np.corrcoef(a, b)[0,1]:+.2f} follow {(ft > 0).mean()*100:.0f}% avg {ft.mean():+.2f}$ {(ft/A).mean():+.3f}xATR")
    print(f"{name:45s} | " + " | ".join(out))

# around the US clock times: absolute move and size in first 15/30 min vs other days
print("\n=== Around the US clock times: median range of the 30 min after, x ATR")
for y in ["Y1", "Y2"]:
    s = D[D.year == y]; vals = []
    for t0 in [480, 510, 570, 600]:
        rr = []
        for t in s.index:
            g = G[t]; w = g[g.ny_today & (g.ny_min >= t0) & (g.ny_min < t0 + 30)]
            if len(w): rr.append((w.high.max() - w.low.min()) / s.A[t])
        vals.append(f"{t0//60:02d}:{t0%60:02d} {np.median(rr):.3f}")
    print(y, " | ".join(vals))
D.to_csv("out_03_daily.csv")
