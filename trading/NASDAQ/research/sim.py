"""Quick-check engine for NASDAQ (Agent 1). Same fill model as GBPUSD/XAUUSD and Agent 2:
- enter at the CLOSE of the signal bar; stop/target checked on the following 1-minute bars;
- if stop and target are both inside one 1-minute bar, the STOP counts;
- forced close = CLOSE of the last 1-minute bar before the close time (15:59 bar for a 16:00 NY close);
- cost 2.0 index points per trade (stress 4.0), charged on every trade; R = (pnl - cost) / risk.
Tradeable day: full cash session (no holiday / early close, no data gap > 15 min 09:30-16:00 NY), previous trading day also
a full cash session (its 16:00 close is needed), ATR known."""
from levels import *
_df = load("ALL")
DAYS = day_table(_df)
TRADE_DAYS = DAYS[DAYS.ok & DAYS.prev_ok & DAYS.atr_pct.notna() & DAYS.o930.notna()]
G = {}
for t, g in _df[_df.tday.isin(TRADE_DAYS.index)].groupby("tday"):
    G[t] = dict(nymin=g.nymin.values, o=g.open.values, h=g.high.values, l=g.low.values, c=g.close.values)


def walk(d, i0, side, entry, stop, target, close_min=960):
    h, l, c, nm = d["h"], d["l"], d["c"], d["nymin"]
    last = entry
    for i in range(i0, len(c)):
        if nm[i] >= close_min: break
        if side == 1:
            if l[i] <= stop: return stop - entry, "stop", i
            if target is not None and h[i] >= target: return target - entry, "target", i
        else:
            if h[i] >= stop: return entry - stop, "stop", i
            if target is not None and l[i] <= target: return entry - target, "target", i
        last = c[i]
    return (last - entry) * side, "time", i


def bars(d, minutes, a, b):
    """clock-aligned N-minute candles from NY minute a to b: list of (last_idx, o, h, l, c, start_min)"""
    nm = d["nymin"]; out = []
    idx = np.where((nm >= a) & (nm < b))[0]
    key = nm[idx] // minutes
    for k in np.unique(key):
        ii = idx[key == k]
        out.append((ii[-1], d["o"][ii[0]], d["h"][ii].max(), d["l"][ii].min(), d["c"][ii[-1]], int(k * minutes)))
    return out


def stats(T, cost=COST):
    if not len(T): return dict(n=0, R=0.0)
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
        a, b, z = stats(s), stats(s, 2 * COST), stats(s, 0.0)
        if a["n"] == 0: lines.append(f"  {y}: no trades"); continue
        lines.append(f"  {y}: n{a['n']:4d} win {a['win']:4.1f}% total {a['R']:+6.1f}R avg {a['avg']:+.3f}R PF {a['pf']:.2f} "
                     f"maxDD {a['dd']:5.1f}R lrun {a['lrun']:2d} | cost0: {z['R']:+6.1f}R | cost4: {b['R']:+6.1f}R PF {b['pf']:.2f}")
    for sd, nmx in [(1, "longs"), (-1, "shorts")]:
        s = T[T.side == sd]
        lines.append(f"  {nmx}: " + " | ".join(f"{y} n{stats(s[s.year==y])['n']} {stats(s[s.year==y])['R']:+.1f}R (cost4 {stats(s[s.year==y], 2*COST)['R']:+.1f})" for y in ["Y1", "Y2"]))
    lines.append(f"  exits: {T.why.value_counts().to_dict()} | median risk {T.risk.median():.0f} pts, min {T.risk.min():.0f}")
    print("\n".join(lines), file=file)
    return T
