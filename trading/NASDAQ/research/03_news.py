"""03: news days. (1) check every release date in the prices; (2) how the Nasdaq behaves on each event type vs normal days.
08:30 NY releases land BEFORE the cash open, so their effect shows in the 09:30 gap. FOMC 14:00 NY lands in the afternoon.
Earnings (after the close) show in the NEXT day's gap."""
from levels import *
from news_calendar import EVENTS, EARN
df = load(); T = day_table(df)
E = pd.read_pickle("/tmp/claude-0/-home-user-my-first-project/1c8d33d7-d94d-5131-95fb-13a566ad2900/scratchpad/ndx_open.pkl")
G = {t: g for t, g in df.groupby("tday")}
# 5-min abs move starting at a NY minute, as % of price
def mv(t, m):
    g = G.get(pd.Timestamp(t));
    if g is None: return np.nan
    nm = g.nymin.values; s = (nm >= m) & (nm < m + 5)
    if not s.any(): return np.nan
    return 100 * (g.high.values[s].max() - g.low.values[s].min()) / g.open.values[s][0]
base = {}
for m in [510, 840]:
    vals = [mv(t, m) for t in T.index if T.loc[t, "ok"]]
    base[m] = np.nanmedian(vals)
print(f"=== 1. Date check: 5-min range from the release minute vs the median of ALL days at that minute (08:30: {base[510]:.3f}%, 14:00: {base[840]:.3f}%)")
rows = []
for d, hm, kind in EVENTS:
    m = 510 if hm == "08:30" else 840
    x = mv(d, m); rows.append((d, kind, x, x / base[m]))
R = pd.DataFrame(rows, columns=["date", "event", "move5", "x_normal"])
print(R.groupby("event").x_normal.describe()[["count", "min", "50%", "max"]].round(2).to_string())
print("doubtful (release-minute move < 1.5x normal, or no data):")
print(R[(R.x_normal < 1.5) | R.x_normal.isna()].round(3).to_string(index=False))
# earnings: next trading day's absolute gap
days = list(T.index)
def nxt(d):
    d = pd.Timestamp(d); later = [x for x in days if x > d]; return later[0] if later else None
er = []
for k, ds in EARN.items():
    for d in ds:
        n = nxt(d)
        if n is not None and n in E.index: er.append((k, d, n, E.loc[n, "gap_pct"], E.loc[n, "gap_atr"]))
ER = pd.DataFrame(er, columns=["co", "report", "reaction_day", "gap_pct", "gap_atr"])
print("\n=== 2. Earnings reaction days (next morning): |gap| in ATR units vs all days (mean |gap| all days = %.2f ATR)" % E.gap_atr.abs().mean())
print(ER.groupby("co").gap_atr.apply(lambda s: s.abs().mean()).round(2).to_string())
print(ER.round(2).to_string(index=False))

# behaviour per event type
tag = pd.Series("normal", index=E.index, dtype=object)
for d, hm, kind in EVENTS:
    t = pd.Timestamp(d)
    if t in tag.index: tag[t] = kind if tag[t] == "normal" else tag[t] + "+" + kind
for n in ER.reaction_day.unique():
    if n in tag.index: tag[n] = "EARN" if tag[n] == "normal" else tag[n] + "+EARN"
E["event"] = tag.str.replace(r"US PPI\+|\+US PPI", "", regex=True)
E["rth_rng_atr"] = (E.rth_hi - E.rth_lo) / E.atr_pts
E["fill"] = E.fill_t.notna()
E["big_gap"] = E.gap_atr.abs() > 0.5
E["rth_gd_atr"] = np.sign(E.gap_pct) * (E.c1600 - E.o930) / E.atr_pts
E["first30_atr"] = E.r30 / E.atr_pts
E["rest30_cont"] = np.sign(E.r30) * (E.c1600 - E.c30) / E.atr_pts
print("\n=== 3. Behaviour by event type (RTH 09:30-16:00 NY). range and moves in ATR units")
print(E.groupby(["year", "event"]).agg(n=("gap_pct", "size"), abs_gap=("gap_atr", lambda s: s.abs().mean()), big_gap_pct=("big_gap", lambda s: 100 * s.mean()),
      rth_range=("rth_rng_atr", "mean"), gap_filled=("fill", lambda s: 100 * s.mean()), rth_vs_gap=("rth_gd_atr", "mean"),
      first30_abs=("first30_atr", lambda s: s.abs().mean()), rest_after30=("rest30_cont", "mean")).round(2).to_string())
# FOMC: afternoon range
print("\n=== 4. FOMC days: 14:00-16:00 NY range (Doha 21:00-23:00 summer / 22:00-00:00 winter) vs other days, % of price")
fom = [pd.Timestamp(d) for d, hm, k in EVENTS if k == "FOMC"]
aft = df[(df.nymin >= 840) & (df.nymin < 960)].groupby("tday").agg(h=("high", "max"), l=("low", "min"), o=("open", "first"))
aft["rp"] = 100 * (aft.h - aft.l) / aft.o; aft = aft[aft.index.isin(T[T.ok].index)]
aft["fomc"] = aft.index.isin(fom); aft["year"] = year_of(aft.index)
print(aft.groupby(["year", "fomc"]).rp.agg(["size", "mean", "median"]).round(3).to_string())
# pre-release: 08:00-08:30 vs normal ; post: 08:30-09:30
print("\n=== 5. 08:30 release days: range 08:00-08:29, 08:30-09:29, 09:30-10:29 (% of price) vs non-release days")
def rng(a, b):
    s = df[(df.nymin >= a) & (df.nymin < b)].groupby("tday").agg(h=("high", "max"), l=("low", "min"), o=("open", "first"))
    return 100 * (s.h - s.l) / s.o
Z = pd.DataFrame({"pre_0800": rng(480, 510), "post_0830": rng(510, 570), "open_hour": rng(570, 630)})
Z = Z[Z.index.isin(T[T.ok].index)]
k830 = {}
for d, hm, k in EVENTS:
    if hm == "08:30": k830.setdefault(pd.Timestamp(d), k)
Z["ev"] = [k830.get(t, "none") for t in Z.index]; Z["year"] = year_of(Z.index)
print(Z.groupby(["year", "ev"]).agg(["mean"]).round(3).to_string())
E.to_pickle("/tmp/claude-0/-home-user-my-first-project/1c8d33d7-d94d-5131-95fb-13a566ad2900/scratchpad/ndx_open_ev.pkl")
