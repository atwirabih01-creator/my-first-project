# Round 2: market-derived rules. Pre-committed rule: qualify only if avg R > 0 in BOTH halves
# (design + test) with >= 40 trades overall; rank by the WORSE of the two halves (robustness first).
import sys, itertools, pickle, pandas as pd
from multiprocessing import Pool
from bt import Mkt, run, stats
SPLIT = pd.Timestamp("2026-07-16", tz="UTC")

def grid():
    g = []
    for tf, k, rr, be in itertools.product(["5min", "15min"], [0.2, 0.3, 0.4], [2, 3], [None, 1.0]):
        g.append(("NYF", dict(tf=tf, k=k, rr=rr, be=be, maxstop=0.5)))
    for tf, rr, b, be in itertools.product(["30min", "1h"], [2, 3], [False, True], [None, 1.0]):
        g.append(("ABO", dict(tf=tf, win="W1", rr=rr, bias=b, be=be, maxstop=0.6)))
    for tf, rr, be in itertools.product(["5min", "15min", "30min"], [2, 3], [None, 1.0]):
        g.append(("ASR", dict(tf=tf, win="W1", rr=rr, pdfade=True, be=be, maxstop=0.5)))
    for tf, dmin, win, rr, be in itertools.product(["15min", "30min"], [0.15, 0.25], ["W1", "W2", "BOTH"], [2, 3], [None, 1.0]):
        g.append(("TPB", dict(tf=tf, win=win, rr=rr, swing=True, dirmode="day", dmin=dmin, be=be, maxstop=0.5)))
    for om, tf, rr, b, be in itertools.product([15, 30], ["5min", "15min"], [2, 3], [False, True], [None, 1.0]):
        g.append(("ORB", dict(or_min=om, tf=tf, rr=rr, bias=b, mid=True, be=be, maxstop=0.5)))
    return g

def work(name):
    m = Mkt(name); res = []
    for strat, p in grid():
        T = run(m, strat, p)
        if len(T): T["pair"] = name
        a = T[T.time < SPLIT] if len(T) else T; b = T[T.time >= SPLIT] if len(T) else T
        res.append(dict(pair=name, strat=strat, params=p, IS=stats(a), OOS=stats(b), ALL=stats(T), trades=T))
    return res

if __name__ == "__main__":
    OUT = sys.argv[1]; pairs = sys.argv[2:]
    with Pool(len(pairs)) as pool: allres = sum(pool.map(work, pairs), [])
    pickle.dump(allres, open(f"{OUT}/r2_{'_'.join(pairs)}.pkl", "wb"))
    rows = []
    for r in allres:
        p = {k: v for k, v in r["params"].items() if k not in ("maxstop", "swing", "mid")}
        rows.append(dict(pair=r["pair"], strat=r["strat"], params=str(p), n=r["ALL"].get("n", 0),
                         IS_n=r["IS"].get("n", 0), IS_avgR=r["IS"].get("avgR", 0), IS_win=r["IS"].get("win"),
                         OOS_n=r["OOS"].get("n", 0), OOS_avgR=r["OOS"].get("avgR", 0), OOS_win=r["OOS"].get("win"),
                         PF=r["ALL"].get("PF"), totR=r["ALL"].get("totR"), ddR=r["ALL"].get("maxDD_R"), streak=r["ALL"].get("lose_streak")))
    D = pd.DataFrame(rows); D["worst_half"] = D[["IS_avgR", "OOS_avgR"]].min(axis=1)
    D.to_csv(f"{OUT}/r2_{'_'.join(pairs)}.csv", index=False)
    pd.set_option("display.width", 250); pd.set_option("display.max_colwidth", 95)
    for pair, g in D.groupby("pair"):
        q = g[(g.n >= 40) & (g.worst_half > 0)].sort_values("worst_half", ascending=False)
        print(f"\n===== {pair}: {len(q)} of {len(g)} rules profitable in BOTH halves =====")
        print(q.head(10).to_string(index=False))
        print("best per family:"); print(q.groupby("strat").head(1).to_string(index=False))
