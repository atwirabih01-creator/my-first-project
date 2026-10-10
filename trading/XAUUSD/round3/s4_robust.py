"""Stage-4 robustness of T1. Output out_s4.txt; trades of T1 in t1_trades.csv"""
import numpy as np, pandas as pd, common3 as c, engine as e
from gold3 import *
from tradestats import summarize
A0, A1, W1 = lc(0), lc(7), lc(12)
asia = np.array([rng_hi_lo(i, A0[i], A1[i]) for i in range(n)])
brk = {}
for i in range(n):
    if not complete[i] or np.isnan(ATR[i]) or np.isnan(asia[i, 0]): continue
    r = first_break(i, asia[i, 0], asia[i, 1], A1[i], W1[i])
    if r not in (None, "x"): brk[i] = r
def run(filt=None, floor=8.0, rr=None, xcol=X16, relfloor=None):
    rows = []
    for i, (d, kk, ent) in brk.items():
        if filt is not None and not filt[i]: continue
        if relfloor is not None and (asia[i, 0] - asia[i, 1]) < relfloor * ATR[i]: continue
        stop = asia[i, 1] if d > 0 else asia[i, 0]; risk = abs(ent - stop)
        if risk < floor: continue
        tgt = ent + d * rr * risk if rr else None
        g, why, kx = e.sim(M, i, d, kk, ent, stop, tgt, xcol)
        rows.append(dict(day=days[i].date(), side=d, entry_col=kk, entry=ent, stop=stop, risk=risk, gross=g, exit=why,
                         atr=ATR[i], asia_rel=(asia[i, 0] - asia[i, 1]) / ATR[i], i=i))
    return pd.DataFrame(rows)
out = []
def S(T, nm, cost=0.40, full=False):
    txt, TT, df = summarize(T, nm, cost, show=False)
    out.append(txt if full else txt.splitlines()[0] + "\n" + txt.splitlines()[-1] + f"\n   ALL: {df.iloc[-1].to_dict()}")
    return TT
T1 = run(); TT = S(T1, "T1 base", full=True); TT.to_csv("t1_trades.csv", index=False)
out.append("== U1 by Asia range / ATR20")
for a, b in [(0, .3), (.3, .45), (.45, .6), (.6, 9)]:
    g = TT[(TT.asia_rel >= a) & (TT.asia_rel < b)]
    out.append(f"U1 {a}-{b}: n={len(g)} R/tr {g.R.mean():+.3f} tot {g.R.sum():+.1f} | by year: " +
               " ".join(f"{y%100}:{v:+.1f}({k})" for (y, v), k in zip(g.groupby('y').R.sum().items(), g.groupby('y').size())))
out.append("== U2 floors"); S(run(floor=12), "U2 floor 12"); S(run(floor=16), "U2 floor 16")
out.append("== U3 targets")
for rr in (1, 2, 3): S(run(rr=rr), f"U3 target {rr}R")
out.append("== U4 Oct2022-Sep2023")
w = TT[(pd.to_datetime(TT.day) >= "2022-10-01") & (pd.to_datetime(TT.day) <= "2023-09-30")]
out.append(f"U4 n={len(w)} totR {w.R.sum():+.1f} R/tr {w.R.mean():+.3f} win {(w.R>0).mean():.0%}; at 0.80: {((w.gross-0.8)/w.risk).sum():+.1f}; longs {w[w.side>0].R.sum():+.1f} shorts {w[w.side<0].R.sum():+.1f}")
out.append("   by month: " + " ".join(f"{k}:{v:+.1f}({c_})" for k, v, c_ in zip(*[w.groupby(pd.to_datetime(w.day).dt.strftime('%y-%m')).R.sum().index,
           w.groupby(pd.to_datetime(w.day).dt.strftime('%y-%m')).R.sum().values, w.groupby(pd.to_datetime(w.day).dt.strftime('%y-%m')).size().values])))
out.append("== U5"); S(run(filt=ATR5 / ATR < 1), "U5 T1 + ATR5/ATR20<1")
out.append("== U6"); S(run(floor=16), "U6 double cost floor 16", cost=0.80)
out.append("== U7"); S(run(xcol=ny(12)), "U7 exit 11:59 NY")
out.append("== U8 news / weekday / side by year")
news = np.zeros(n, bool)
for a in (ny(8, 30), ny(10), ny(14)):
    m = C[:, a + 14] - O[:, a]; med = pd.Series(np.abs(m)).rolling(20, min_periods=15).median().shift(1).values
    news |= np.abs(m) > 3 * med
TT["news"] = news[TT.i.values]
for f in (True, False):
    g = TT[TT.news == f]; out.append(f"U8 news-shock day={f}: n={len(g)} tot {g.R.sum():+.1f} R/tr {g.R.mean():+.3f} yrs+ {(g.groupby('y').R.sum()>0).sum()}/8")
TT["wd"] = pd.to_datetime(TT.day).dt.day_name().str[:3]
out.append("U8 weekday: " + " ".join(f"{k}:{v:+.1f}({c_})" for k, v, c_ in zip(TT.groupby('wd').R.sum().index, TT.groupby('wd').R.sum().values, TT.groupby('wd').size().values)))
for s_, nm in ((1, "LONG"), (-1, "SHORT")):
    g = TT[TT.side == s_]; out.append(f"U8 {nm} by year: " + " ".join(f"{y%100}:{v:+.1f}({k})" for (y, v), k in zip(g.groupby('y').R.sum().items(), g.groupby('y').size())))
out.append("== U9"); S(run(relfloor=0.3), "U9 Asia >= 0.3 ATR20 and >= 8 USD", full=True)
print("\n".join(out)); open("out_s4.txt", "w").write("\n".join(out) + "\n")
