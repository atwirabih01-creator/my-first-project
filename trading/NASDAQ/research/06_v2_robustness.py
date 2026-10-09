"""06: robustness of the chosen variant V2 (fade |gap| > 0.5 ATR, stop 0.75 ATR, target = gap fill, close 15:59).
No new rule is chosen here: slices of the same trades, plus a neighbourhood check of the two numbers (gap threshold, stop size)
to see whether V2 sits on a smooth plateau or on a lucky spike."""
from importlib import import_module
v = import_module("05_variants")
from sim import *
from news_calendar import EVENTS, EARN
T = v.run("V2", v.VAR["V2"]); T["year"] = year_of(T.tday); T["r"] = (T.gross - COST) / T.risk
T = T.set_index("tday")
D = TRADE_DAYS
T["vol"] = np.where(D.loc[T.index, "atr_pct"] > 1.282, "volatile", "calm")
T["q"] = T.index.to_period("Q"); T["mo"] = T.index.to_period("M")
T["crash"] = (T.index >= "2025-03-01") & (T.index < "2025-06-01")
ev = {}
for d, hm, k in EVENTS: ev.setdefault(pd.Timestamp(d), k)
days = list(DAYS.index)
for k, ds in EARN.items():
    for d in ds:
        n = [x for x in days if x > pd.Timestamp(d)]
        if n: ev.setdefault(n[0], "EARN")
T["event"] = [ev.get(t, "normal") for t in T.index]
T["wd"] = T.index.dayofweek
def s(q): 
    st = stats(q.reset_index()); return pd.Series(dict(n=st["n"], win=st.get("win", 0), R=st["R"], pf=st.get("pf", 0)))
for col in ["year", "vol", "crash", "event", "wd", "q"]:
    print(f"\n=== V2 by {col}"); print(T.groupby(col).apply(s, include_groups=False).round(2).to_string())
print("\n=== V2 by year x direction x calm/volatile")
print(T.groupby(["year", "side", "vol"]).apply(s, include_groups=False).round(2).to_string())
print("\n=== V2 by month"); print(T.groupby("mo").r.agg(["size", "sum"]).round(1).T.to_string())
for y in ["Y1", "Y2"]:
    r = T[T.year == y].r.sort_values()
    print(f"{y}: without best 3 trades {r.iloc[:-3].sum():+.1f}R ; best single {r.iloc[-1]:+.2f}R ; worst {r.iloc[0]:+.2f}R")
print("\n=== Neighbourhood (total R at 2.0 cost, Y1 / Y2, n) for gap threshold x stop size; target = gap fill")
for th in [0.4, 0.5, 0.6]:
    line = []
    for st in [0.5, 0.75, 1.0]:
        X = v.run("n", dict(stop=st, tgt=True), th=th); X["year"] = year_of(X.tday)
        a, b = stats(X[X.year == "Y1"]), stats(X[X.year == "Y2"])
        line.append(f"stop {st}: {a['R']:+5.1f}/{b['R']:+5.1f} (n{a['n']}/{b['n']}, lrun {a['lrun']}/{b['lrun']})")
    print(f"gap>{th}: " + " | ".join(line))
T.reset_index().to_csv("out_06_V2_trades.csv", index=False)
