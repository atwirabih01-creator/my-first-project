"""EURUSD round-3 trade helpers (Agent 1)."""
from eu3 import *
import engine as e
GB = align("GBPUSD"); GC = ffill(GB["C"])
gb_ok = c.gap_ok(GB, c.col_ny(3), c.col_ny(10, 1)) & (GB["nbars"] >= 1300)
rng_v = rng.where(G["nbars"] >= 1300)
ATR20 = rng_v.rolling(20, min_periods=15).mean().shift(1).values
MIN_STOP = 2.4 * P

def divergence(t0=None, t1=None, qq=0.75):
    t0 = c.col_ny(3) if t0 is None else t0; t1 = c.col_ny(10) if t1 is None else t1
    r_ = pd.Series(np.log(px(t1) / px(t0)) - np.log(px(t1, GC) / px(t0, GC)))
    th = r_.abs().rolling(250, min_periods=100).quantile(qq).shift(1).values
    sig = (r_.abs().values > th) & gb_ok
    return np.where(sig, -np.sign(r_.values), 0), r_.values

def trade(i, d, k, entry, stop_dist, rr=None, xcol=None):
    xcol = end_col if xcol is None else xcol
    stop = entry - d * stop_dist; tgt = None if rr is None else entry + d * rr * stop_dist
    g, why, kx = e.sim(G, i, d, k, entry, stop, tgt, xcol)
    return dict(day=days[i].date(), side=int(d), entry=round(entry, 5), stop=round(stop, 5),
                target=(round(tgt, 5) if tgt is not None else None), risk_p=stop_dist / P, gross_p=g / P, exit=why, exit_col=int(kx))

def summarize(rows, label, quiet=False, cost=1.2):
    T = pd.DataFrame(rows)
    if len(T) == 0: return f"{label}: no trades", T
    txt1, T1 = e.stats(T, cost, label); txt2, T2 = e.stats(T, 2 * cost, label)
    r = T1.R.values; yp = (T1.groupby("y").R.sum() > 0).sum(); wy = T1.groupby("y").R.sum().min()
    run = best = 0
    for x in r:
        run = run + 1 if x <= 0 else 0; best = max(best, run)
    b5 = np.sort(r)[:-5].sum()
    lo = T1[T1.side > 0].R.sum(); sh = T1[T1.side < 0].R.sum()
    line = (f"{label:44s} n={len(T):4d} ({len(T)/7.75:3.0f}/yr) totR={r.sum():+6.1f} perTr={r.mean():+.3f} yrs+={yp}/8 worstYr={wy:+.1f} "
            f"L/S={lo:+.1f}/{sh:+.1f} x2cost={T2.R.sum():+.1f} noBest5={b5:+.1f} lrun={best}")
    return (line if quiet else txt1 + "\n" + txt2 + "\n" + line), T1
