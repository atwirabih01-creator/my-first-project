"""News days: verify each date by the price spike at the release minute, then compare news days with normal days."""
from common import *
from levels import day_table
from news_calendar import EVENTS

df = load()
days = day_table(df)
cd = days[days.complete & days.pdh.notna()]
D = df[df.tday.isin(cd.index)].set_index("time_utc")
m1 = D[["open", "high", "low", "close"]]

def window(ts_utc, mins):
    w = m1.loc[ts_utc: ts_utc + pd.Timedelta(minutes=mins - 1)]
    return w

ev = []
for d, hm, tz, lab in EVENTS:
    t_loc = pd.Timestamp(f"{d} {hm}").tz_localize(tz)
    t = t_loc.tz_convert("UTC").tz_localize(None)
    w5 = window(t, 5); pre = window(t - pd.Timedelta(minutes=60), 60)
    if len(w5) == 0: continue
    r5 = (w5.high.max() - w5.low.min()) / PIP
    # baseline: same 5 minutes (same local clock) on all other days
    same = []
    for td in cd.index:
        tt = pd.Timestamp(f"{td.date()} {hm}").tz_localize(tz).tz_convert("UTC").tz_localize(None)
        if tt == t: continue
        ww = window(tt, 5)
        if len(ww): same.append((ww.high.max() - ww.low.min()) / PIP)
    base = np.median(same)
    w60 = window(t, 60); w240 = window(t, 240)
    p0 = w5.open.iloc[0]
    move60 = (w60.close.iloc[-1] - p0) / PIP
    first15 = window(t, 15); dir15 = np.sign(first15.close.iloc[-1] - p0)
    later = window(t + pd.Timedelta(minutes=15), 225)
    cont = np.sign(later.close.iloc[-1] - first15.close.iloc[-1]) == dir15 if len(later) else np.nan
    tday = D.loc[t:t].tday.iloc[0] if t in D.index else pd.NaT
    ev.append(dict(date=d, label=lab, r5=r5, base5=base, ratio=r5 / base, pre60=(pre.high.max() - pre.low.min()) / PIP,
                   r60=(w60.high.max() - w60.low.min()) / PIP, r240=(w240.high.max() - w240.low.min()) / PIP,
                   move60=move60, cont_after15=cont, tday=tday))
E = pd.DataFrame(ev)
pd.set_option("display.width", 200)
print("Per event (r5 = 5-min range from release minute; base5 = median same 5 minutes on other days):")
print(E.drop(columns="tday").round(1).to_string(index=False))
print("\nVerification: events with release-minute range >= 2x normal:", (E.ratio >= 2).sum(), "of", len(E))

print("\nBy event type (medians, pips):")
g = E.groupby("label").agg(n=("r5", "size"), r5=("r5", "median"), base5=("base5", "median"), pre60=("pre60", "median"),
                            r60=("r60", "median"), r240=("r240", "median"), abs_move60=("move60", lambda s: s.abs().median()),
                            cont_after15=("cont_after15", "mean"))
print(g.round(2).to_string())

news_days = set(E.tday.dropna())
cd = cd.copy(); cd["news"] = cd.index.isin(news_days)
print(f"\nDaily range: news days median {cd[cd.news].rng.median():.1f} (n={cd.news.sum()}) vs normal days {cd[~cd.news].rng.median():.1f} (n={(~cd.news).sum()})")
for lab in E.label.unique():
    dd = set(E[E.label == lab].tday.dropna())
    print(f"  {lab:7s} days median range {cd[cd.index.isin(dd)].rng.median():.1f}")
E.to_csv("out_04_events.csv", index=False)
