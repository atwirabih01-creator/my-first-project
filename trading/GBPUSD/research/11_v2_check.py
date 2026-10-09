"""Round 2 quick check of the false-break family on the 21 design months, per design year.
Settled points (same as strategy.md v2): weekend bars belong to Monday (common.py); skip a day whose previous
trading day is incomplete (holiday / data gap); forced close at the CLOSE of the last 1-minute bar before 16:00 NY.
Mood condition (decided BEFORE looking at any result): ER5 = |net move of the last 5 full days| / (their high-low range);
'range-bound' if ER5 < 0.5. Minimum stop (cost realism, decided in advance): 8 pips.
Fill model: enter at the close of the 15-min signal candle; stop/target checked on following 1-min bars;
if both are inside one 1-min bar the stop counts first."""
from common import *
from levels import day_table
import sys

df = load()
days = day_table(df)
hi5 = days.hi.rolling(5).max().shift(1); lo5 = days.lo.rolling(5).min().shift(1)
days["er5"] = (days.close.shift(1) - days.open.shift(5)).abs() / (hi5 - lo5)
cd = days[days.complete & days.prev_complete & days.pdh.notna()]
news = set(pd.read_csv("out_04_events.csv", parse_dates=["tday"]).tday.dropna())
G = {t: g for t, g in df[df.tday.isin(cd.index)].groupby("tday")}


def m15(g):
    x = g.set_index("ny")[["open", "high", "low", "close"]]
    return x.resample("15min", label="left", closed="left").agg({"open": "first", "high": "max", "low": "min", "close": "last"}).dropna()


def walk(g, t_from, side, entry, stop, target, exit_ny=960):
    a = g[(g.ny >= t_from)]
    a = a[~((a.ny_min >= 17 * 60))]  # stay inside this trading day
    for lo_, hi_, cl, nm in zip(a.low.values, a.high.values, a.close.values, a.ny_min.values):
        if nm >= exit_ny: break
        if side == 1:
            if lo_ <= stop: return stop - entry, "stop"
            if hi_ >= target: return target - entry, "target"
        else:
            if hi_ >= stop: return entry - stop, "stop"
            if lo_ <= target: return entry - target, "target"
        last = cl
    return (last - entry) * side, "time"


def false_break(levels="pd", win=(480, 660), rr=2.0, mood=None, min_stop=0.0, exit_ny=960):
    out = []
    for tday, d in cd.iterrows():
        if mood == "range" and not (d.er5 < 0.5): continue
        if mood == "trend" and not (d.er5 >= 0.5): continue
        g = G[tday]
        H, L = (d.pdh, d.pdl) if levels == "pd" else (d.ah, d.al)
        bars = m15(g[g.ldn_today])
        hh, ll = -1e9, 1e9; sh = sl = False
        for t, b in bars.iterrows():
            m = t.hour * 60 + t.minute
            if m < win[0] or t.hour >= 17: continue
            if m + 15 > win[1]: break
            hh = max(hh, b.high); ll = min(ll, b.low)
            sh |= b.high > H; sl |= b.low < L
            sig = None
            if sh and b.close < H: sig, stop = -1, hh + 2 * PIP
            elif sl and b.close > L: sig, stop = 1, ll - 2 * PIP
            if sig is None: continue
            entry = b.close
            if abs(entry - stop) < min_stop * PIP: stop = entry - sig * min_stop * PIP
            risk = abs(entry - stop)
            pnl, why = walk(g, t + pd.Timedelta(minutes=15), sig, entry, stop, entry + sig * rr * risk, exit_ny)
            out.append(dict(tday=tday, side=sig, risk=risk / PIP, gross=pnl / PIP, why=why, news=tday in news, er5=d.er5))
            break
    T = pd.DataFrame(out)
    T["year"] = year_of(T.tday)
    return T


def longest_losing_run(r):
    best = cur = 0
    for x in r:
        cur = cur + 1 if x <= 0 else 0
        best = max(best, cur)
    return best


def report(name, T, costs=(1.5, 3.0)):
    print(f"--- {name}")
    for c in costs:
        R = (T.gross - c) / T.risk
        parts = []
        for y in ["Y1", "Y2", "ALL"]:
            r = R if y == "ALL" else R[T.year == y]
            if len(r) == 0: parts.append(f"{y}: none"); continue
            w = r > 0; pf = r[w].sum() / -r[~w].sum()
            eq = r.cumsum(); dd = (eq - eq.cummax()).min()
            parts.append(f"{y}: n={len(r)} win={w.mean():.0%} {r.sum():+.1f}R PF={pf:.2f} DD={dd:.1f} run={longest_losing_run(r)}")
        print(f"  cost {c}: " + " | ".join(parts))


if __name__ == "__main__":
    variants = [("V0 v1 replica (PDH/PDL, NY 08-11)", dict()),
                ("V1 + mood: range-bound only (ER5<0.5)", dict(mood="range")),
                ("V2 + min stop 8 pips", dict(min_stop=8)),
                ("V3 = V1 + V2 (pre-registered v2 candidate)", dict(mood="range", min_stop=8))]
    for name, kw in variants:
        T = false_break(**kw); report(name, T)
        T.to_csv(f"out_11_{name.split()[0]}.csv", index=False)
