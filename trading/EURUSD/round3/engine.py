"""Trade simulator + statistics for round 3 (Agent 1)."""
import numpy as np, pandas as pd
import common3 as c
P = c.PIP


def sim(M, i, d, ecol, entry, stop, target, xcol, be_at=None):
    """one trade on day i, direction d (+1/-1), entered during minute ecol at price entry.
    Walk minutes ecol..xcol-1. Exit at close of minute xcol-1 if nothing hit. Returns (gross_price_move, reason, exit_col)."""
    H = M["H"][i]; L = M["L"][i]; C = M["C"][i]
    last = entry
    for k in range(ecol, xcol):
        h, l, cl = H[k], L[k], C[k]
        if np.isnan(cl):
            continue
        if d > 0:
            if l <= stop: return stop - entry, "stop", k
            if target is not None and not np.isnan(target) and h >= target: return target - entry, "target", k
        else:
            if h >= stop: return entry - stop, "stop", k
            if target is not None and not np.isnan(target) and l <= target: return entry - target, "target", k
        last = cl
    return d * (last - entry), "close", xcol - 1


def stats(T, cost=1.2, label=""):
    """T: DataFrame with columns day, side, risk_p (pips), gross_p (pips). returns text"""
    T = T.copy()
    T["R"] = (T.gross_p - cost) / T.risk_p
    T["y"] = pd.to_datetime(T.day).dt.year
    lines = [f"--- {label}  (cost {cost} pips)"]
    rows = []
    for y, g in T.groupby("y"):
        rows.append(_one(g, str(y)))
    rows.append(_one(T, "ALL"))
    df = pd.DataFrame(rows)
    lines.append(df.to_string(index=False))
    lo = T[T.side > 0].R; sh = T[T.side < 0].R
    best5 = T.R.sort_values().iloc[:-5].sum() if len(T) > 5 else np.nan
    lines.append(f"longs {len(lo)} {lo.sum():+.1f}R ({lo.mean():+.3f}/tr) | shorts {len(sh)} {sh.sum():+.1f}R ({sh.mean():+.3f}/tr) | "
                 f"without best 5: {best5:+.1f}R | median risk {T.risk_p.median():.1f} p | min risk {T.risk_p.min():.1f} p")
    return "\n".join(lines), T


def _one(g, name):
    r = g.R.values
    eq = np.cumsum(r); dd = (eq - np.maximum.accumulate(np.r_[0, eq])[1:]).min() if len(r) else 0
    run = best = 0
    for x in r:
        run = run + 1 if x <= 0 else 0; best = max(best, run)
    pf = r[r > 0].sum() / -r[r <= 0].sum() if (r <= 0).any() else np.inf
    return dict(period=name, n=len(r), win=f"{(r > 0).mean() * 100:.0f}%", totR=round(r.sum(), 1), perTr=round(r.mean(), 3),
                PF=round(pf, 2), maxDD=round(dd, 1), lrun=best)
