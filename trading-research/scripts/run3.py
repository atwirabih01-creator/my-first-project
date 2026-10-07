# Round 3: every strategy x timeframe on each pair separately, 12 months (Oct-2025..Oct-2026).
# Qualify: avg R > 0 in BOTH halves (Oct-Mar winter, Apr-Oct summer), >= 40 trades. Rank by the worse half.
import sys, itertools, pickle, pandas as pd
from multiprocessing import Pool
from bt import Mkt, run, stats
SPLIT = pd.Timestamp("2026-04-01", tz="UTC")
NAMES = {"ASR": "Asian sweep reversal", "ABO": "London breakout (Asian box)", "ORB": "NY opening-range breakout",
         "TPB": "Trend pullback (EMA20 + 1H EMA50)", "LSR": "Key level sweep reversal", "NYF": "NY open fade",
         "BRT": "Breakout + retest (limit order)", "LDR": "NY draw to London high/low", "VWP": "VWAP pullback",
         "FVG": "Fair value gap retrace (limit)"}
P = itertools.product
def grid():
    g = []
    g += [("ASR", dict(tf=tf, win=w, rr=2, bias=b, maxstop=0.5)) for tf, w, b in P(["5min", "15min", "30min", "1h"], ["W1", "BOTH"], [False, True])]
    g += [("ASR", dict(tf=tf, win="W1", rr=3, bias=True, maxstop=0.5)) for tf in ["5min", "15min", "30min", "1h"]]
    g += [("ABO", dict(tf=tf, win="W1", rr=rr, bias=b, maxstop=0.6)) for tf, rr, b in P(["15min", "30min", "1h"], [2, 3], [False, True])]
    g += [("ABO", dict(tf="5min", win="W1", rr=2, bias=True, maxstop=0.6))]
    g += [("ORB", dict(or_min=om, tf=tf, rr=rr, bias=b, mid=True, maxstop=0.5)) for om, tf, rr, b in P([15, 30], ["5min", "15min"], [2, 3], [False, True])]
    g += [("TPB", dict(tf=tf, win=w, rr=rr, swing=True, maxstop=0.5)) for tf, w, rr in P(["5min", "15min", "30min", "1h"], ["W1", "W2"], [2, 3])]
    g += [("LSR", dict(tf=tf, win="W2", rr=rr, bias=b, level="london", maxstop=0.5)) for tf, rr, b in P(["5min", "15min", "30min"], [2, 3], [False, True])]
    g += [("LSR", dict(tf=tf, win="BOTH", rr=rr, bias=b, level="pd", maxstop=0.5)) for tf, rr, b in P(["15min", "30min", "1h"], [2, 3], [False, True])]
    g += [("NYF", dict(tf=tf, k=k, rr=rr, maxstop=0.5)) for tf, k, rr in P(["5min", "15min"], [0.2, 0.3], [2, 3])]
    g += [("BRT", dict(tf=tf, stop=s, rr=rr, bias=b, maxstop=0.6)) for tf, s, rr, b in P(["15min", "30min", "1h"], ["mid", "bar"], [2, 3], [False, True])]
    g += [("LDR", dict(tf=tf, rr=rr, maxstop=0.5)) for tf, rr in P(["5min", "15min", "30min"], [2, 3])]
    g += [("VWP", dict(tf=tf, win=w, rr=rr, anchor=a, maxstop=0.5)) for tf, w, rr, a in P(["5min", "15min", "30min"], ["W1", "W2"], [2, 3], ["day", "ny"])]
    g += [("FVG", dict(tf=tf, win=w, rr=rr, maxstop=0.5)) for tf, w, rr in P(["5min", "15min", "30min", "1h"], ["W1", "W2"], [2, 3])]
    return g

def work(name):
    m = Mkt(name); res = []
    for strat, p in grid():
        T = run(m, strat, p)
        a = T[T.time < SPLIT] if len(T) else T; b = T[T.time >= SPLIT] if len(T) else T
        res.append(dict(pair=name, strat=strat, params=p, H1=stats(a), H2=stats(b), ALL=stats(T), trades=T))
    return res

if __name__ == "__main__":
    OUT = sys.argv[1]; pairs = sys.argv[2:]
    with Pool(len(pairs)) as pool: allres = sum(pool.map(work, pairs), [])
    pickle.dump(allres, open(f"{OUT}/r3fix.pkl", "wb"))
    rows = []
    for r in allres:
        p = {k: v for k, v in r["params"].items() if k not in ("maxstop", "swing", "mid")}
        rows.append(dict(pair=r["pair"], strategy=NAMES[r["strat"]], strat=r["strat"], tf=p.get("tf"), params=str(p), n=r["ALL"].get("n", 0),
                         avgR=r["ALL"].get("avgR", 0), win=r["ALL"].get("win"), winter=r["H1"].get("avgR", 0), summer=r["H2"].get("avgR", 0),
                         n_w=r["H1"].get("n", 0), n_s=r["H2"].get("n", 0), PF=r["ALL"].get("PF"), ddR=r["ALL"].get("maxDD_R"), streak=r["ALL"].get("lose_streak")))
    D = pd.DataFrame(rows); D["worst_half"] = D[["winter", "summer"]].min(axis=1); D.to_csv(f"{OUT}/r3fix.csv", index=False)
    pd.set_option("display.width", 250); pd.set_option("display.max_colwidth", 90)
    for pair, g in D.groupby("pair"):
        print(f"\n################ {pair}: {len(g)} versions tested ################")
        best = g.loc[g.groupby(["strategy", "tf"]).worst_half.idxmax()]
        print("Best version per strategy x timeframe -> avg R per trade over 12 months (worse half in brackets)")
        piv = best.assign(cell=best.apply(lambda r: f"{r.avgR:+.2f} ({r.worst_half:+.2f}) n{r.n}", axis=1)).pivot(index="strategy", columns="tf", values="cell")
        print(piv.reindex(columns=["5min", "15min", "30min", "1h"]).fillna("-").to_string())
        q = g[(g.n >= 40) & (g.worst_half > 0)].sort_values("worst_half", ascending=False)
        print(f"\nQualified (positive in BOTH halves, >=40 trades): {len(q)}")
        print(q.head(10)[["strategy", "params", "n", "win", "avgR", "winter", "summer", "PF", "ddR", "streak"]].to_string(index=False))
