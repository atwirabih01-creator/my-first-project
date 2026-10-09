"""News days: verify each date by the jump at the release minute, then describe before / during / after, per year."""
from common import *
from levels import day_table
from news_calendar import EVENTS

df = load("ALL")
days = day_table(df)
cd = days[days.complete]
D = df.set_index("time_utc")
m1 = D[["open", "high", "low", "close", "tday"]]
idx = m1.index

def window(t, mins):
    return m1.loc[t: t + pd.Timedelta(minutes=mins - 1)]

base_cache = {}
def baseline(hm, tz, t_ev):
    key = (hm, tz)
    if key not in base_cache:
        vals = {}
        for td in cd.index:
            tt = pd.Timestamp(f"{td.date()} {hm}").tz_localize(tz).tz_convert("UTC").tz_localize(None)
            w = window(tt, 5)
            if len(w) >= 4: vals[tt] = (w.high.max() - w.low.min()) / PIP
        base_cache[key] = pd.Series(vals)
    s = base_cache[key]
    return s.drop(t_ev, errors="ignore").median()

ev = []
for d, hm, tz, lab in EVENTS:
    t = pd.Timestamp(f"{d} {hm}").tz_localize(tz).tz_convert("UTC").tz_localize(None)
    w5 = window(t, 5)
    if len(w5) == 0: ev.append(dict(date=d, label=lab, note="no data")); continue
    r5 = (w5.high.max() - w5.low.min()) / PIP
    base = baseline(hm, tz, t)
    pre = window(t - pd.Timedelta(minutes=60), 60)
    w60, w240 = window(t, 60), window(t, 240)
    p0 = w5.open.iloc[0]
    f15 = window(t, 15); d15 = np.sign(f15.close.iloc[-1] - p0)
    later = window(t + pd.Timedelta(minutes=15), 225)
    cont = float(np.sign(later.close.iloc[-1] - f15.close.iloc[-1]) == d15) if len(later) else np.nan
    tday = w5.tday.iloc[0]
    ev.append(dict(date=d, label=lab, r5=r5, base5=base, ratio=r5 / base, pre60=(pre.high.max() - pre.low.min()) / PIP,
                   r60=(w60.high.max() - w60.low.min()) / PIP, r240=(w240.high.max() - w240.low.min()) / PIP,
                   first15=(f15.close.iloc[-1] - p0) / PIP, cont_after15=cont, tday=tday,
                   day_rng=cd.rng.get(tday, np.nan), complete=bool(days.complete.get(tday, False))))
E = pd.DataFrame(ev)
E["year"] = year_of(pd.to_datetime(E.date))
pd.set_option("display.width", 220)
print("Per event (r5 = 5-min range from the release minute; base5 = median of the same 5 minutes on all other days; pips)")
print(E.drop(columns=["tday"]).round(2).to_string(index=False))
ok = E.ratio >= 2
# second check for small-reaction releases: is the listed date's jump at that minute the biggest of the 7 weekdays around it?
def rank_check(r):
    if pd.isna(r.ratio): return np.nan
    d0 = pd.Timestamp(r.date); hm, tz = [(h, z) for d, h, z, l in EVENTS if d == r.date and l == r.label][0]
    vals = {}
    for k in range(-5, 6):
        dd = d0 + pd.Timedelta(days=k)
        if dd.dayofweek >= 5: continue
        tt = pd.Timestamp(f"{dd.date()} {hm}").tz_localize(tz).tz_convert("UTC").tz_localize(None)
        w = window(tt, 5)
        if len(w) >= 4: vals[k] = (w.high.max() - w.low.min()) / PIP
    s = pd.Series(vals).sort_values(ascending=False)
    return list(s.index).index(0) + 1 if 0 in s.index else np.nan
E["rank_in_7"] = E.apply(rank_check, axis=1)
print(f"\nVerified (release-minute range >= 2x normal): {ok.sum()} of {E.ratio.notna().sum()}")
print("DOUBTFUL (< 2x or no data):")
print(E[~ok][["date", "label", "r5", "base5", "ratio", "rank_in_7", "complete"]].round(2).to_string(index=False))

V = E[E.complete.fillna(False).astype(bool)]
print("\nBy event type and year (medians, pips; cont = share where minutes 15-240 kept the first-15-minute direction):")
g = V.groupby(["label", "year"]).agg(n=("r5", "size"), jump5=("r5", "median"), normal5=("base5", "median"), ratio=("ratio", "median"),
                                     hour_before=("pre60", "median"), hour_after=("r60", "median"), four_h_after=("r240", "median"),
                                     day_range=("day_rng", "median"), cont=("cont_after15", "mean"))
print(g.round(2).to_string())

newsdays = set(V.tday)
cc = cd.copy(); cc["news"] = cc.index.isin(newsdays); cc["year"] = year_of(cc.index)
print("\nDaily range, news days vs other days (median pips):")
for y in ["Y1", "Y2"]:
    c = cc[cc.year == y]
    print(f"  {y}: news {c[c.news].rng.median():.1f} (n={c.news.sum()}) vs other {c[~c.news].rng.median():.1f} (n={(~c.news).sum()})")
us = set(V[V.label.isin(["NFP", "US CPI", "FOMC"])].tday); eu = set(V[V.label.isin(["ECB", "EZ flash CPI", "EZ flash PMI"])].tday)
for y in ["Y1", "Y2"]:
    c = cc[cc.year == y]
    print(f"  {y}: US-news days {c[c.index.isin(us)].rng.median():.1f} | euro-news days {c[c.index.isin(eu)].rng.median():.1f}")
E.to_csv("out_06_events.csv", index=False)
