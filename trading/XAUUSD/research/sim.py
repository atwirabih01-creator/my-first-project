"""Shared quick-check engine (Agent 1). Fill model (same as GBPUSD and Agent 2):
- enter at the CLOSE of the signal bar; stop/target checked on the following 1-minute bars;
- if stop and target are both inside one 1-minute bar, the STOP counts;
- forced close = CLOSE of the last 1-minute bar before the close time (NY clock);
- cost per trade 0.40 USD (and 0.80 USD stress), charged on every trade; result in R = (pnl - cost) / risk.
Only complete days whose previous trading day is also complete, with ATR14 known, are traded."""
from common import *
from levels import day_table

_df = load("ALL")
DAYS = day_table(_df)
TRADE_DAYS = DAYS[DAYS.complete & DAYS.prev_complete & DAYS.atr14.notna()]
G = {}
for t, g in _df[_df.tday.isin(TRADE_DAYS.index)].groupby("tday"):
    G[t] = dict(ny=g.ny.values, nymin=np.where(g.ny_today.values, g.ny_min.values, -1),  # -1 = evening before NY midnight
                ldn_today=g.ldn_today.values, ldnmin=g.ldn_min.values,
                o=g.open.values, h=g.high.values, l=g.low.values, c=g.close.values)


def walk(d, i0, side, entry, stop, target, close_min=960):
    """walk 1-min bars from index i0 (first bar AFTER the entry bar)."""
    h, l, c, nm = d["h"], d["l"], d["c"], d["nymin"]
    last = entry
    for i in range(i0, len(c)):
        if nm[i] >= close_min: break
        if side == 1:
            if l[i] <= stop: return stop - entry, "stop"
            if target is not None and h[i] >= target: return target - entry, "target"
        else:
            if h[i] >= stop: return entry - stop, "stop"
            if target is not None and l[i] <= target: return entry - target, "target"
        last = c[i]
    return (last - entry) * side, "time"


def bars(d, minutes, start_mask):
    """aggregate 1-min bars into N-minute bars (clock-aligned on NY time) for indices where start_mask is true.
    returns list of (last_index, open, high, low, close, ny_minute_of_bar_start)"""
    nm = d["nymin"]; out = []
    idx = np.where(start_mask)[0]
    if not len(idx): return out
    key = nm[idx] // minutes
    for k in np.unique(key):
        ii = idx[key == k]
        out.append((ii[-1], d["o"][ii[0]], d["h"][ii].max(), d["l"][ii].min(), d["c"][ii[-1]], int(k * minutes)))
    return out


def stats(T, cost=COST):
    if not len(T): return dict(n=0)
    r = (T.gross - cost) / T.risk
    eq = r.cumsum(); dd = (eq - eq.cummax()).min()
    run = best = 0
    for x in r:
        run = run + 1 if x <= 0 else 0; best = max(best, run)
    pf = r[r > 0].sum() / -r[r <= 0].sum() if (r <= 0).any() else np.inf
    return dict(n=len(r), win=(r > 0).mean() * 100, R=r.sum(), avg=r.mean(), pf=pf, dd=dd, lrun=best)


def report(name, T, file=None):
    T = T.copy(); T["year"] = year_of(T.tday)
    lines = [f"--- {name}"]
    for y in ["Y1", "Y2", "ALL"]:
        s = T if y == "ALL" else T[T.year == y]
        a, b = stats(s), stats(s, 2 * COST)
        if a["n"] == 0: lines.append(f"  {y}: no trades"); continue
        lines.append(f"  {y}: n{a['n']:4d} win {a['win']:4.1f}% total {a['R']:+7.1f}R avg {a['avg']:+.3f}R PF {a['pf']:.2f} "
                     f"maxDD {a['dd']:6.1f}R lrun {a['lrun']:2d} | @0.80: {b['R']:+7.1f}R PF {b['pf']:.2f}")
    if len(T):
        for sd, nmx in [(1, "longs"), (-1, "shorts")]:
            s = T[T.side == sd]
            lines.append(f"  {nmx}: " + " ".join(f"{y} n{stats(s[s.year==y])['n']} {stats(s[s.year==y]).get('R',0):+.1f}R" for y in ["Y1", "Y2"]))
        lines.append(f"  exits: {T.why.value_counts().to_dict()}")
    print("\n".join(lines), file=file)
    return T
