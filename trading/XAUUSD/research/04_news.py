"""News days for gold: verify each date in the prices, then measure the reaction per event type and design year."""
from common import *
from levels import day_table
from news_calendar import EVENTS

df = load("ALL")
days = day_table(df)
ok = days[days.complete & days.prev_complete & days.atr14.notna()]
G = {t: g.set_index("ny_min") for t, g in df[df.tday.isin(ok.index)].groupby("tday") if True}
G = {t: g[g.ny_today] for t, g in G.items()}

ev_days = set(pd.Timestamp(d) for d, _, _ in EVENTS)


def rng(g, a, b):
    w = g.loc[(g.index >= a) & (g.index < b)]
    return (w.high.max() - w.low.min()) if len(w) else np.nan


rows = []
for d, tm, lab in EVENTS:
    t = pd.Timestamp(d); m = int(tm[:2]) * 60 + int(tm[3:])
    if t not in G:
        rows.append(dict(tday=t, event=lab, status="day not usable (holiday/gap/ATR)")); continue
    g = G[t]; A = ok.atr14[t]
    yr = year_of(t)
    normal = [rng(G[x], m, m + 5) / ok.atr14[x] for x in G if x not in ev_days and x.dayofweek == t.dayofweek and year_of(x) == yr]
    norm = np.nanmedian(normal) * A   # normal 5-min range at this minute, same weekday, same design year, scaled to today's ATR
    j5 = rng(g, m, m + 5)
    p0 = g.loc[m - 1].close if (m - 1) in g.index else np.nan
    p15 = g.loc[m + 14].close if (m + 14) in g.index else np.nan
    end = min(m + 240, 16 * 60 + 59)
    pe = g.loc[g.index < end].close.iloc[-1]
    first = p15 - p0
    rows.append(dict(tday=t, event=lab, year=year_of(t), A=A, jump5=j5, normal5=norm, ratio=j5 / norm,
                     pre60=rng(g, m - 60, m) / A, post240=rng(g, m, m + 240) / A, day=ok.rng[t] / A,
                     first15=first / A, follow=np.sign(first) * (pe - p15) / A,
                     status="ok" if j5 / norm >= 2 else "DOUBTFUL"))
E = pd.DataFrame(rows)
E.to_csv("out_04_events.csv", index=False)
print("=== Date check: 5-min range at release vs median of same weekday/minute on non-event days of the same design year (in x ATR, so the price level does not matter)")
print(f"{(E.status=='ok').sum()} of {len(E)} events show a jump >= 2x normal.")
print(E[E.status != "ok"][["tday", "event", "ratio", "status"]].to_string())

okE = E[E.status.isin(["ok", "DOUBTFUL"])]  # all usable scheduled dates (selecting only big reactions would bias the numbers)
nd = ok[~ok.index.isin(ev_days)]
print("\n=== Reaction per event (ALL usable scheduled dates, incl. weak-reaction ones), medians. x = share of ATR14")
for lab in ["NFP", "US CPI", "US PPI", "FOMC"]:
    for y in ["Y1", "Y2"]:
        s = okE[(okE.event == lab) & (okE.year == y)]
        if not len(s): continue
        print(f"{lab:7s} {y}: n{len(s):2d} | 5-min jump ${s.jump5.median():6.2f} ({(s.jump5/s.A).median():.3f}x) vs normal ${s.normal5.median():.2f} | "
              f"hour before {s.pre60.median():.2f}x | 4h after {s.post240.median():.2f}x | day {s.day.median():.2f}x | "
              f"first-15-min move continues to +4h: {(s.follow > 0).sum()}/{len(s)} (avg {s.follow.mean():+.3f}x)")
for y in ["Y1", "Y2"]:
    a = okE[okE.year == y].tday.unique(); 
    print(f"{y}: day range median, event days {(ok.rng/ok.atr14)[ok.index.isin(a)].median():.2f}x vs non-event days {(nd.rng/nd.atr14)[nd.year==y].median():.2f}x")
# normal pre-release hour (07:30-08:30 and 13:00-14:00) on non-event days
for y in ["Y1", "Y2"]:
    s = [rng(G[x], 450, 510) / ok.atr14[x] for x in nd[nd.year == y].index]
    s2 = [rng(G[x], 780, 840) / ok.atr14[x] for x in nd[nd.year == y].index]
    print(f"{y}: normal 07:30-08:30 NY range {np.nanmedian(s):.2f}x ; normal 13:00-14:00 NY range {np.nanmedian(s2):.2f}x")
