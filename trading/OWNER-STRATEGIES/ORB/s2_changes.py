"""Stage 2: one change at a time on each market's top-2 Stage-1 structures (declared). Output: out_s2.txt, out_s2.csv"""
import sys, os
import pandas as pd
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import orb_common as c

TOP = {"GBPUSD": [("LDN", 15, 1.0), ("FRA", 60, None)],
       "XAUUSD": [("LDN", 30, None), ("FRA", 15, 1.0)],
       "NSXUSD": [("LDN", 60, None), ("NY930", 30, 1.0)],
       "EURUSD": [("FRA", 60, 1.0), ("FRA", 60, None)]}
CHANGES = [("base", {}), ("close5", dict(entry="close5")), ("dir", dict(entry="dir")), ("mid", dict(stopm="mid")),
           ("atr10", dict(stopm="atr10")), ("t1.5", dict(target=1.5)), ("narrow", dict(filt="narrow")),
           ("wide", dict(filt="wide")), ("trend", dict(filt="trend")), ("gap", dict(filt="gap")),
           ("atrsmall", dict(filt="atrsmall")), ("atrbig", dict(filt="atrbig"))]
out, rows = [], []
for sym, tops in TOP.items():
    cost, name = c.MARKETS[sym]; M = c.load(sym)
    for opn, ln, tg in tops:
        base = None
        out.append(f"===== {name}: {opn} {ln}m target {'EOD' if tg is None else f'{tg:g}R'}")
        for lab, kw in CHANGES:
            args = dict(target=tg); args.update(kw)
            T, sk = c.run(M, cost, opn, ln, **args)
            d = c.summary(T)
            yr = [d.get(f"y{y}", 0) for y in c.YEARS]
            if lab == "base": base = yr
            better = sum(a > b + 1e-9 for a, b in zip(yr, base))
            miss = c.bar_check(d)
            d.update(sym=sym, struct=f"{opn}/{ln}/{'EOD' if tg is None else tg}", change=lab, yrs_better=better, nmiss=len(miss))
            rows.append(d)
            out.append(f"{lab:9s} n={d['n']:4d} ({d['per_year']:.0f}/yr) win {d['win']*100:.0f}% R0 {d['R0']:+7.1f} R {d['R']:+7.1f} R2 {d['R2']:+7.1f} "
                       f"perTr {d['perTr']:+.3f} posY {d['posY']} worst {d['worstY']:+.1f} L {d['long']:+.1f} S {d['short']:+.1f} "
                       f"run {d['lrun']} noB5 {d['noBest5']:+.1f} | better yrs {better}/8 | years " + " ".join(f"{v:+.1f}" for v in yr)
                       + f" | misses: {', '.join(miss) or 'NONE'}")
pd.DataFrame(rows).to_csv("out_s2.csv", index=False, float_format="%.3f")
open("out_s2.txt", "w").write("\n".join(out)); print("\n".join(out))
