"""Stage 3: combine one qualifying structural change with one qualifying filter (each improved >= 5 of 8 years in Stage 2
on the same structure). Output: out_s3.txt"""
import sys, os
import pandas as pd
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import orb_common as c
COMBOS = [("GBPUSD", "FRA", 60, None, dict(entry="close5", filt="wide")),
          ("GBPUSD", "FRA", 60, None, dict(entry="close5", filt="atrbig")),
          ("EURUSD", "FRA", 60, 1.0, dict(target=1.5, filt="wide")),
          ("EURUSD", "FRA", 60, 1.0, dict(target=1.5, filt="gap"))]
out, rows = [], []
for sym, opn, ln, tg, kw in COMBOS:
    cost, name = c.MARKETS[sym]; M = c.load(sym)
    args = dict(target=tg); args.update(kw)
    T, sk = c.run(M, cost, opn, ln, **args); d = c.summary(T); miss = c.bar_check(d)
    lab = f"{name} {opn}/{ln}m " + " + ".join(f"{k}={v}" for k, v in args.items())
    out.append(f"===== {lab}\n n={d['n']} ({d['per_year']:.0f}/yr) win {d['win']*100:.0f}% R0 {d['R0']:+.1f} R {d['R']:+.1f} R2 {d['R2']:+.1f} perTr {d['perTr']:+.3f} "
               f"posY {d['posY']} worst {d['worstY']:+.1f} L {d['long']:+.1f} S {d['short']:+.1f} run {d['lrun']} noB5 {d['noBest5']:+.1f}\n misses: {', '.join(miss) or 'NONE'}\n" + c.year_table(T))
    d.update(sym=sym, label=lab, nmiss=len(miss)); rows.append(d)
pd.DataFrame(rows).to_csv("out_s3.csv", index=False, float_format="%.3f")
open("out_s3.txt", "w").write("\n".join(out)); print("\n".join(out))
