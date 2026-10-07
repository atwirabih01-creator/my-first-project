# Full grid backtest. Pre-committed selection rule:
#   DESIGN period (in-sample)  = 2026-03-30 .. 2026-07-15
#   TEST period (out-of-sample) = 2026-07-16 .. 2026-10-06  (never used to choose)
#   Pick per pair the config with best design-period expectancy (avg R) among those with
#   >= 25 design trades and profit factor >= 1.3. Then report the untouched test period.
import sys, itertools, pickle, pandas as pd
from multiprocessing import Pool
from bt import Mkt, run, stats
SPLIT = pd.Timestamp("2026-07-16", tz="UTC")
OUT = sys.argv[1]

def grid():
    g = []
    for tf, win, rr, b in itertools.product(["5min", "15min", "30min"], ["W1", "BOTH"], [2, 3], [False, True]):
        g.append(("ASR", dict(tf=tf, win=win, rr=rr, bias=b, maxstop=0.5)))
    for tf, rr, b in itertools.product(["15min", "30min", "1h"], [2, 3], [False, True]):
        g.append(("ABO", dict(tf=tf, win="W1", rr=rr, bias=b, maxstop=0.6)))
    for om, tf, rr, b, mid in itertools.product([15, 30], ["5min", "15min"], [2, 3], [False, True], [False, True]):
        g.append(("ORB", dict(or_min=om, tf=tf, rr=rr, bias=b, mid=mid, maxstop=0.5)))
    for tf, win, rr in itertools.product(["5min", "15min", "30min"], ["W1", "W2", "BOTH"], [2, 3]):
        g.append(("TPB", dict(tf=tf, win=win, rr=rr, swing=True, maxstop=0.5)))
    for tf, rr, b in itertools.product(["5min", "15min"], [2, 3], [False, True]):
        g.append(("LSR", dict(tf=tf, win="W2", rr=rr, bias=b, level="london", maxstop=0.5)))
    for tf, rr, b in itertools.product(["15min", "30min", "1h"], [2, 3], [False, True]):
        g.append(("LSR", dict(tf=tf, win="BOTH", rr=rr, bias=b, level="pd", maxstop=0.5)))
    return g

def work(name):
    m = Mkt(name); res = []
    for strat, p in grid():
        T = run(m, strat, p)
        if len(T): T["pair"] = name
        isT = T[T.time < SPLIT] if len(T) else T; oosT = T[T.time >= SPLIT] if len(T) else T
        res.append(dict(pair=name, strat=strat, params=p, IS=stats(isT), OOS=stats(oosT), ALL=stats(T), trades=T))
    return res

if __name__ == "__main__":
    pairs = sys.argv[2:]
    with Pool(len(pairs)) as pool: allres = sum(pool.map(work, pairs), [])
    pickle.dump(allres, open(f"{OUT}/grid_{"_".join(pairs)}.pkl", "wb"))
    rows = []
    for r in allres:
        p = {k: v for k, v in r["params"].items() if k != "maxstop"}
        rows.append(dict(pair=r["pair"], strat=r["strat"], params=str(p),
                         IS_n=r["IS"].get("n", 0), IS_win=r["IS"].get("win"), IS_avgR=r["IS"].get("avgR"), IS_PF=r["IS"].get("PF"),
                         OOS_n=r["OOS"].get("n", 0), OOS_win=r["OOS"].get("win"), OOS_avgR=r["OOS"].get("avgR"), OOS_PF=r["OOS"].get("PF"),
                         ALL_totR=r["ALL"].get("totR"), ALL_dd=r["ALL"].get("maxDD_R")))
    D = pd.DataFrame(rows); D.to_csv(f"{OUT}/grid_{"_".join(pairs)}.csv", index=False)
    pd.set_option("display.width", 250); pd.set_option("display.max_colwidth", 80)
    for pair, g in D.groupby("pair"):
        print(f"\n===== {pair}: best strategy family (by design-period avg R) =====")
        print(g.sort_values("IS_avgR", ascending=False).groupby("strat").head(1).to_string(index=False))
        ok = g[(g.IS_n >= 25) & (g.IS_PF >= 1.3)].sort_values("IS_avgR", ascending=False)
        print(f"--- top 8 eligible configs ---"); print(ok.head(8).to_string(index=False))
