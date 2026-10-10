import numpy as np, pandas as pd
import common3 as c
import s2_asia_break as s2
G = s2.G; days = s2.days; P = c.PIP; off = G["ldn_off"]
E = c.load_matrix("EURUSD"); pos = pd.Index(E["days"]).get_indexer(days)
N = c.load_matrix("NSXUSD"); posn = pd.Index(N["days"]).get_indexer(days)
yrs = days.year.values
S = s2.signals()
rows = []
for s in S:
    i = s["i"]; j = pos[i]
    if j < 0: continue
    a0, a1 = s2.A0[i], s2.A1[i]
    eH = np.nanmax(E["H"][j, a0:a1]); eL = np.nanmin(E["L"][j, a0:a1])
    k = s["k"]
    eh = np.nanmax(E["H"][j, a1:k + 1]); el = np.nanmin(E["L"][j, a1:k + 1])
    conf = (eh > eH) if s["d"] > 0 else (el < eL)
    opp = (el < eL) if s["d"] > 0 else (eh > eH)
    Cg = G["C"][i]; endp = Cg[c.col_ny(15, 59)]
    if np.isnan(endp): endp = np.nanmean(Cg[c.col_ny(15, 50):c.col_ny(16)])
    rows.append(dict(y=yrs[i], d=s["d"], mv=s["d"] * (endp - s["entry"]) / P, conf=conf, opp=opp))
D = pd.DataFrame(rows)
for name, m in [("all", D.mv == D.mv), ("EUR confirms", D.conf), ("EUR not yet", ~D.conf & ~D.opp), ("EUR broke opposite", D.opp)]:
    g = D[m].groupby("y").mv.mean()
    print(f"S20 {name:20s} N={m.sum():4d} avg={D[m].mv.mean():+5.2f}p yrs+={(g>0).sum()}/8 " + " ".join(f"{v:+.1f}" for v in g))

# month-end
CF = G["C"].copy()
for i in range(len(CF)):
    r = CF[i]; mm = np.isnan(r)
    if mm.any():
        idx = np.where(~mm, np.arange(1440), 0); np.maximum.accumulate(idx, out=idx); CF[i] = r[idx]
px = lambda col: CF[np.arange(len(days)), np.broadcast_to(np.asarray(col), (len(days),)) - 1]
lc = lambda h, m=0: c.col_ldn(h, m, off)
ds = pd.Series(days)
last = (ds.dt.month != ds.shift(-1).dt.month).values & (days <= pd.Timestamp("2026-09-30"))
NC = np.full(len(days), np.nan)
for i in range(len(days)):
    j = posn[i]
    if j >= 0:
        v = N["C"][j][~np.isnan(N["C"][j])]
        NC[i] = v[-1] if len(v) else np.nan
ncs = pd.Series(NC).ffill()
# month-to-date Nasdaq move: last close of previous month -> close of previous day
mon = ds.dt.to_period("M")
prev_month_close = ncs.groupby(mon).transform("first").shift(0)  # approx: first day close
first_idx = ds.groupby(mon).transform("idxmin")
ref = ncs.shift(1).values[first_idx.values]  # close of the day before the month's first day
mtd = ncs.shift(1).values - ref
pre = px(lc(16)) - px(lc(15))
sig = -np.sign(mtd)
m = last & ~np.isnan(mtd) & s2.valid
r = sig[m] * pre[m] / P
g = pd.Series(r).groupby(yrs[m]).mean()
print(f"S21 month-end into fix, against Nasdaq MTD N={m.sum()} avg={r.mean():+.2f}p yrs+={(g>0).sum()}/8 " + " ".join(f"{v:+.1f}" for v in g))
print("    (same, how often USD move into the fix agrees):", f"{(r > 0).mean():.0%}")
