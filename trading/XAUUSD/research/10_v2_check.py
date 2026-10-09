"""Round 2 (v2) checks on ALL design data Oct 2023 - Sep 2026, per period A / Y1 / Y2 / B.
Variants were written down BEFORE running (numbering continues from the 42 of round 1):
 V0   v1 replica (baseline; should match Agent 2: A 233 trades -0.21 R).
 V43  v1 + MINIMUM STOP from cost logic: skip the day if risk (entry to MID) < 20 x round-trip cost = 8.00 USD.
      Why 20x: then cost is at most 5% of the risk (0.05 R per trade), i.e. smaller than the measured pre-cost edge
      (+0.07..+0.13 R) in every period. Chosen once, not tuned. If the first close-beyond candle fails the minimum, NO trade
      that day (we do not wait for a later candle: same 'first break only' logic as v1).
 V44  V43 + symmetric TREND rule known before the day: trend = previous day's close vs the 50-day simple average of daily
      closes (days before today). Longs only when above, shorts only when below. Works the same in a falling market.
      Days without 50 days of history: no trade.
 V45  v1 with a WIDER stop from cost logic: stop at the OPPOSITE side of the Asia range (long: AL, short: AH), target 1R,
      plus the same 8 USD minimum stop. (Wider stops = smaller cost share; tests whether the edge survives a wider stop.)
Fill model: entry = bid close of the signal candle; stop/target on following 1-min bars; both in one bar = stop;
if a bar OPENS beyond the stop, the fill is that bar's open (loss can exceed 1R); forced close = close of last bar before 16:00 NY.
Thin day (< 1,300 bars): no trade that day and on the next trading day that has prices.
Costs: 0.40 USD and 0.80 USD per trade."""
import sys
from common import *

df = load("ALL")
nb = df.groupby("tday").size()
tdays = list(nb.index)
dclose = df.groupby("tday").close.last()
sma50 = dclose.rolling(50).mean()          # includes the day itself -> shift below so only past days are used
prev_close = dclose.shift(1); prev_sma = sma50.shift(1)


def run(min_stop=0.0, trend=False, stop_mode="mid"):
    rows = []
    for k, (t, g) in enumerate(df.groupby("tday")):
        if k == 0 or nb[t] < MIN_BARS or nb[tdays[k - 1]] < MIN_BARS: continue
        if trend and np.isnan(prev_sma[t]): continue
        L, N = g.ldn_min.values, g.ny_min.values
        lt, nt = g.ldn_today.values, g.ny_today.values
        o, h, l, c = g.open.values, g.high.values, g.low.values, g.close.values
        asia = lt & (L < 420)
        if asia.sum() < 300: continue
        AH, AL = h[asia].max(), l[asia].min(); MID = (AH + AL) / 2
        idx = np.where(lt & (L >= 420) & ~(nt & (N >= 720)))[0]
        key = L[idx] // 15
        for kk in np.unique(key):
            i = idx[key == kk][-1]
            side = 1 if c[i] > AH else -1 if c[i] < AL else 0
            if side == 0: continue
            entry = c[i]
            stop = MID if stop_mode == "mid" else (AL if side == 1 else AH)
            risk = abs(entry - stop)
            if risk < min_stop: break                                   # first break too small -> no trade today
            if trend and ((side == 1) != (prev_close[t] > prev_sma[t])): break
            target = entry + side * risk
            res = None; why = "time"; last = entry
            for j in range(i + 1, len(c)):
                if nt[j] and N[j] >= 960: break
                if side == 1:
                    if l[j] <= stop: res, why = min(o[j], stop) - entry, "stop"; break
                    if h[j] >= target: res, why = target - entry, "target"; break
                else:
                    if h[j] >= stop: res, why = entry - max(o[j], stop), "stop"; break
                    if l[j] <= target: res, why = entry - target, "target"; break
                last = c[j]
            if res is None: res = (last - entry) * side
            rows.append(dict(tday=t.date(), side=side, risk=risk, gross=res, why=why, price=entry))
            break
    T = pd.DataFrame(rows); T["per"] = year_of(pd.to_datetime(T.tday))
    return T


def st(s, cost):
    r = (s.gross - cost) / s.risk
    eq = r.cumsum(); run = best = 0
    for x in r:
        run = run + 1 if x <= 0 else 0; best = max(best, run)
    pf = r[r > 0].sum() / -r[r <= 0].sum()
    return len(r), (r > 0).mean() * 100, r.sum(), pf, (eq - eq.cummax()).min(), best


def report(name, T, out=sys.stdout):
    print(f"--- {name}", file=out)
    for p in ["A", "Y1", "Y2", "B", "ALL"]:
        s = T if p == "ALL" else T[T.per == p]
        a = st(s, COST); b = st(s, 2 * COST)
        print(f"  {p:3s}: n{a[0]:4d} win {a[1]:4.1f}% total {a[2]:+6.1f}R PF {a[3]:.2f} maxDD {a[4]:6.1f}R lrun {a[5]:2d} | "
              f"@0.80 {b[2]:+6.1f}R PF {b[3]:.2f} | gross {(s.gross/s.risk).sum():+6.1f}R | median stop {s.risk.median():5.1f}$", file=out)
    for sd, nm in [(1, "longs "), (-1, "shorts")]:
        print(f"  {nm}: " + " ".join(f"{p} {((T[(T.per==p)&(T.side==sd)].gross-COST)/T[(T.per==p)&(T.side==sd)].risk).sum():+.1f}R"
                                    f"(n{((T.per==p)&(T.side==sd)).sum()})" for p in ["A", "Y1", "Y2", "B"]), file=out)
    print(f"  exits: {T.why.value_counts().to_dict()}", file=out)


if __name__ == "__main__":
    which = sys.argv[1:] or ["V0", "V43", "V44", "V45"]
    cfg = {"V0": ("V0 v1 replica", {}), "V43": ("V43 v1 + min stop 8 USD", dict(min_stop=8.0)),
           "V44": ("V44 V43 + 50-day trend rule (both directions)", dict(min_stop=8.0, trend=True)),
           "V45": ("V45 stop at opposite Asia side, 1R, min stop 8 USD", dict(min_stop=8.0, stop_mode="opp"))}
    for v in which:
        name, kw = cfg[v]
        T = run(**kw); report(name, T)
        T.to_csv(f"out_10_{v}.csv", index=False)
