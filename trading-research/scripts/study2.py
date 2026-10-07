# Step 2: session-by-session behaviour per pair, 12 months, checked in two 6-month halves.
# Sessions in each city's local time (handles summer/winter):
#   ASIA   00:00-06:00 UTC (03:00-09:00 Doha, Tokyo has no clock change)
#   LONDON 08:00-12:00 London time  (10-14 Doha summer, 11-15 Doha winter)
#   NY     08:00-12:00 New York time (15-19 Doha summer, 16-20 Doha winter)
import sys, numpy as np, pandas as pd
from zoneinfo import ZoneInfo
from common import load
LON, NY = ZoneInfo("Europe/London"), ZoneInfo("America/New_York")
SPLIT = pd.Timestamp("2026-04-01", tz="UTC")

def at(day, h, tz):
    return pd.Timestamp(day.year, day.month, day.day, h, tzinfo=tz).tz_convert("UTC")

def analyse(name):
    m = load(name); m = m[m.index.weekday < 5]
    days = sorted(set(m.index.normalize())); rows = []; prev = None
    for day in days:
        d = m[(m.index >= day) & (m.index < day + pd.Timedelta(hours=21))]
        if len(d) < 600: continue
        seg = lambda a, b: d[(d.index >= a) & (d.index < b)]
        A = seg(day, day + pd.Timedelta(hours=6)); L = seg(at(day, 8, LON), at(day, 12, LON)); N = seg(at(day, 8, NY), at(day, 12, NY))
        if min(len(A), len(L), len(N)) < 100: prev = d; continue
        ah, al = A.h.max(), A.l.min(); lh, ll = L.h.max(), L.l.min(); nh, nl = N.h.max(), N.l.min()
        dh, dl, do, dc = d.h.max(), d.l.min(), d.o.iloc[0], d.c.iloc[-1]
        sgn = lambda x: 1 if x > 0 else -1
        r = dict(day=day, adr=dh - dl, asia_rng=(ah - al), lon_rng=(lh - ll), ny_rng=(nh - nl))
        # ASIA
        if prev is not None:
            ph, pl = prev.h.max(), prev.l.min(); pdir = sgn(prev.c.iloc[-1] - prev.o.iloc[0])
            r.update(asia_pdh=ah > ph, asia_pdl=al < pl, day_pdh=dh > ph, day_pdl=dl < pl,
                     day_vs_prev=sgn(dc - do) == pdir)
            first = None
            for nm, S in [("Asia", A), ("London", L), ("NY", N)]:
                if first is None and (S.h.max() > ph or S.l.min() < pl): first = nm
            r["pd_first"] = first or "none/later"
        r["asia_dir_eq_day"] = sgn(A.c.iloc[-1] - A.o.iloc[0]) == sgn(dc - do)
        # LONDON vs Asia box
        hi_t = L.index[L.h > ah][0] if lh > ah else None; lo_t = L.index[L.l < al][0] if ll < al else None
        r.update(lon_take_ah=lh > ah, lon_take_al=ll < al, lon_both=(lh > ah) and (ll < al), lon_none=(lh <= ah) and (ll >= al))
        if hi_t is not None or lo_t is not None:
            up_first = lo_t is None or (hi_t is not None and hi_t < lo_t)
            lc = L.c.iloc[-1]
            r["lon_first_up"] = up_first
            # continuation = London closes beyond the side it broke first; reversal = closes back inside/other side
            r["lon_cont"] = (lc > ah) if up_first else (lc < al)
            r["lon_rev_inside"] = (lc < ah) if up_first else (lc > al)
            r["day_follows_first_break"] = (dc > (ah + al) / 2) if up_first else (dc < (ah + al) / 2)
        r["lon_dir_eq_day"] = sgn(L.c.iloc[-1] - L.o.iloc[0]) == sgn(dc - do)
        r["lon_makes_hi_or_lo"] = (lh == dh) or (ll == dl)
        # NY vs London
        r.update(ny_take_lh=nh > lh, ny_take_ll=nl < ll)
        r["ny_cont_lon"] = sgn(N.c.iloc[-1] - N.o.iloc[0]) == sgn(L.c.iloc[-1] - L.o.iloc[0])
        r["ny_makes_hi_or_lo"] = (nh == dh) or (nl == dl)
        r["hi_session"] = "Asia" if A.h.max() == dh else ("London" if lh == dh else ("NY" if nh == dh else "other"))
        r["lo_session"] = "Asia" if A.l.min() == dl else ("London" if ll == dl else ("NY" if nl == dl else "other"))
        r["dow"] = day.day_name()[:3]
        rows.append(r); prev = d
    return pd.DataFrame(rows)

LABELS = [
 ("asia_pdh", "Asia takes previous-day HIGH"), ("asia_pdl", "Asia takes previous-day LOW"),
 ("asia_dir_eq_day", "Asia direction = day direction"),
 ("lon_take_ah", "London takes Asia HIGH"), ("lon_take_al", "London takes Asia LOW"), ("lon_both", "London takes BOTH sides"), ("lon_none", "London stays inside Asia box"),
 ("lon_first_up", "London's first break is UP"),
 ("lon_cont", "After 1st break, London closes beyond it (continuation)"), ("lon_rev_inside", "After 1st break, London closes back inside (sweep & reverse)"),
 ("day_follows_first_break", "Day closes on the side of London's 1st break"),
 ("lon_dir_eq_day", "London direction = day direction"), ("lon_makes_hi_or_lo", "London makes the day's high or low"),
 ("ny_take_lh", "NY takes London HIGH"), ("ny_take_ll", "NY takes London LOW"),
 ("ny_cont_lon", "NY continues London's direction"), ("ny_makes_hi_or_lo", "NY makes the day's high or low"),
 ("day_pdh", "Day takes previous-day HIGH"), ("day_pdl", "Day takes previous-day LOW"), ("day_vs_prev", "Day closes same direction as yesterday"),
]

if __name__ == "__main__":
    out = sys.argv[1]
    for name in sys.argv[2:]:
        R = analyse(name); R.to_csv(f"{out}/study2_{name}.csv", index=False)
        a, b = R[R.day < SPLIT], R[R.day >= SPLIT]
        print(f"\n################ {name}: {len(R)} days ({R.day.min().date()} -> {R.day.max().date()}) ################")
        print(f"Avg range: day {R.adr.mean():.5g} | Asia {R.asia_rng.mean():.5g} | London {R.lon_rng.mean():.5g} | NY {R.ny_rng.mean():.5g}")
        print(f"{'fact':62s} {'12m':>5s} {'Oct-Mar':>8s} {'Apr-Oct':>8s}  repeats?")
        for k, lab in LABELS:
            if k not in R: continue
            f = lambda X: X[k].dropna().astype(float).mean()
            v, va, vb = f(R), f(a), f(b)
            rep = "YES" if abs(va - vb) <= 0.08 and (min(va, vb) >= 0.60 or max(va, vb) <= 0.40) else ""
            print(f"{lab:62s} {v:5.0%} {va:8.0%} {vb:8.0%}  {rep}")
        for col, lab in [("hi_session", "Day HIGH made in"), ("lo_session", "Day LOW made in"), ("pd_first", "Prev-day high/low first taken in")]:
            print(lab + ":", R[col].value_counts(normalize=True).round(2).to_dict())
        print("Avg day range by weekday:", R.groupby("dow").adr.mean().reindex(["Mon", "Tue", "Wed", "Thu", "Fri"]).round(4 if R.adr.mean() < 5 else 1).to_dict())
