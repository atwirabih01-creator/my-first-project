"""Calm vs volatile and trending vs ranging stretches, with measures known BEFORE the day starts:
  ER5  = |net move of the last 5 full days| / (their high-low range).  ER5 >= 0.5 -> 'trending', else 'ranging' (same cut as GBPUSD).
  VOLR = average daily range of the last 5 days / average of the last 60 days. VOLR >= 1 -> 'volatile', else 'calm'.
For each regime and year: daily range, first-Asia-break true-breakout rate, PDH/PDL close-back rate, NY-continues-London,
and the NY-afternoon drift on Wed/Fri vs other days."""
from common import *
from levels import day_table
os.environ["EUR_PERIOD"] = "ALL"
df = load("ALL")
days = day_table(df)
days["er5"] = (days.close.shift(1) - days.open.shift(5)).abs() / (days.hi.rolling(5).max().shift(1) - days.lo.rolling(5).min().shift(1))
days["volr"] = days.rng.rolling(5).mean().shift(1) / days.rng.rolling(60, min_periods=20).mean().shift(1)
P = pd.concat([pd.read_csv(f"out_03_daily_{y}.csv", parse_dates=["tday"]) for y in ["Y1", "Y2"]]).set_index("tday")
cd = days[days.complete & days.prev_complete].join(P, how="inner")
N = df.ny_min
pm = df[(N >= 720) & (N < 960)].groupby("tday").agg(o=("open", "first"), c=("close", "last"))
cd["pm"] = ((pm.c - pm.o) / PIP).reindex(cd.index)
cd["wd"] = cd.index.dayofweek
cd["year"] = year_of(cd.index)
cd["trend"] = np.where(cd.er5 >= 0.5, "trending", "ranging")
cd["vol"] = np.where(cd.volr >= 1, "volatile", "calm")
cd = cd[cd.volr.notna() & cd.er5.notna()]
def show(by):
    rows = []
    for (y, k), g in cd.groupby(["year", by]):
        fb = g[g.first_break_side.isin(["high", "low"])]
        pdh = g[g.pdh_taken.astype(bool)]; pdl = g[g.pdl_taken.astype(bool)]
        cont = (np.sign(g.ldn_move) == np.sign(g.ny_move))
        wf = g[g.wd.isin([2, 4])].pm; oth = g[~g.wd.isin([2, 4])].pm
        rows.append(dict(year=y, regime=k, days=len(g), med_range=g.rng.median(), asia_true_break=fb.close_beyond.astype(float).mean(),
                         pdh_close_back=pdh.pdh_close_back.astype(float).mean(), pdl_close_back=pdl.pdl_close_back.astype(float).mean(),
                         ny_cont_london=cont.mean(), wed_fri_pm=wf.mean(), other_pm=oth.mean()))
    print(pd.DataFrame(rows).round(2).to_string(index=False))
print("Trending vs ranging (ER5):"); show("trend")
print("\nCalm vs volatile (VOLR):"); show("vol")
cd[["er5", "volr", "trend", "vol", "year"]].to_csv("out_08_regimes.csv")
