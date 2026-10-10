"""Stage-3 trade tests T1..T9 + k sensitivity. Output out_s3.txt"""
import numpy as np, pandas as pd, common3 as c, engine as e
from gold3 import *
from tradestats import summarize
A0, A1, W1 = lc(0), lc(7), lc(12)
asia = np.array([rng_hi_lo(i, A0[i], A1[i]) for i in range(n)])
ar = pd.Series(asia[:, 0] - asia[:, 1]); ratio = ar.values / ar.rolling(20, min_periods=15).median().shift(1).values
brk = {}
for i in range(n):
    if not complete[i] or np.isnan(ATR[i]) or np.isnan(asia[i, 0]): continue
    r = first_break(i, asia[i, 0], asia[i, 1], A1[i], W1[i])
    if r not in (None, "x"): brk[i] = r
def run(filt, k=0.5, rr=None, asia_stop=False):
    rows = []
    for i, (d, kk, ent) in brk.items():
        if not filt[i]: continue
        if asia_stop:
            stop = asia[i, 1] if d > 0 else asia[i, 0]; risk = abs(ent - stop)
            if risk < 8: continue
        else:
            risk = max(k * ATR[i], 8.0); stop = ent - d * risk
        tgt = ent + d * rr * risk if rr else None
        g, why, kx = e.sim(M, i, d, kk, ent, stop, tgt, X16)
        rows.append(dict(day=days[i].date(), side=d, entry=ent, risk=risk, gross=g, exit=why, atr=ATR[i]))
    return pd.DataFrame(rows)
allf = np.ones(n, bool); q20 = ATR5 / ATR < 1; q60 = ATR5 / ATR60 < 1; pr = drange.shift(1).values < ATR
out = []
tests = [("T1 asia-opposite stop, min 8", run(allf, asia_stop=True)), ("T2 0.5ATR all", run(allf)), ("T3 0.5ATR ATR5/20<1", run(q20)),
         ("T4 0.5ATR ATR5/60<1", run(q60)), ("T5 0.5ATR prevday<ATR", run(pr)), ("T6 T3 + 1R", run(q20, rr=1)), ("T7 T3 + 2R", run(q20, rr=2)),
         ("T8 0.5ATR busy Asia >1.3 (post-hoc)", run(ratio > 1.3))]
# T9 news 10:00 shock
m = C[:, ny(10, 14)] - O[:, ny(10)]; med = pd.Series(np.abs(m)).rolling(20, min_periods=15).median().shift(1).values
rows = []
for i in np.where(complete & (np.abs(m) > 3 * med) & ~np.isnan(ATR))[0]:
    d = int(np.sign(m[i])); ent = C[i, ny(10, 14)]; risk = max(.5 * ATR[i], 8); g, why, kx = e.sim(M, i, d, ny(10, 15), ent, ent - d * risk, None, X16)
    rows.append(dict(day=days[i].date(), side=d, entry=ent, risk=risk, gross=g, exit=why))
tests.append(("T9 10:00 shock follow", pd.DataFrame(rows)))
for nm, T in tests: out.append(summarize(T, nm)[0]); out.append("")
out.append("== sensitivity T3 k")
for k in [0.3, 0.4, 0.5, 0.75, 1.0]:
    txt, T, df = summarize(run(q20, k=k), f"T3 k={k}", show=False)
    out.append(txt.splitlines()[-1] + f" | ALL {df.iloc[-1].to_dict()}")
print("\n".join(out[-6:]))
open("out_s3.txt", "w").write("\n".join(out) + "\n")
