"""Stage 1: core ORB grid, 60 variants per market (declared in TESTS_DECLARED.md). Output: out_s1_<SYM>.csv + out_s1.txt"""
import sys, os, itertools
import pandas as pd
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import orb_common as c

OPENS = ["TKY", "FRA", "LDN", "NY8", "NY930"]; LENS = [5, 15, 30, 60]; TGTS = [1.0, 2.0, None]
out = []
for sym, (cost, name) in c.MARKETS.items():
    M = c.load(sym)
    rows = []
    for opn, ln, tg in itertools.product(OPENS, LENS, TGTS):
        T, sk = c.run(M, cost, opn, ln, tg)
        d = c.summary(T)
        d.update(open=opn, len=ln, tgt=("EOD" if tg is None else f"{tg:g}R"), gappy=sk["gappy"], small=sk["small"])
        d["miss"] = len(c.bar_check(d)) if d["n"] else 9
        rows.append(d)
    df = pd.DataFrame(rows)
    df.to_csv(f"out_s1_{sym}.csv", index=False, float_format="%.3f")
    elig = df[df.per_year >= 40].sort_values(["posY", "R"], ascending=False)
    cols = ["open", "len", "tgt", "n", "win", "R0", "R", "R2", "perTr", "posY", "worstY", "long", "short", "lrun", "noBest5", "miss"] + [f"y{y}" for y in c.YEARS]
    out.append(f"===== {name} ({sym}), cost {cost}: all 60 variants sorted by (positive years, R with cost); eligible = >=40 trades/yr")
    out.append(df.sort_values(["posY", "R"], ascending=False)[cols].round(2).to_string(index=False))
    out.append(f"TOP 2 for Stage 2: " + "; ".join(f"{r.open}/{r.len}m/{r.tgt}" for r in elig.head(2).itertuples()))
    out.append(f"Variants with R>0 at standard cost: {(df.R > 0).sum()}/60; median R {df.R.median():+.1f}")
open("out_s1.txt", "w").write("\n".join(out))
print("\n".join(l for l in out if l.startswith(("=====", "TOP", "Variants"))))
