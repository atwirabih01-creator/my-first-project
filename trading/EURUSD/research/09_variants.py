"""Pre-declared rule variants (decided BEFORE running this file; see research.md section 8 for the list and why).
  V0  GBPUSD v1 replica on EURUSD: NY 08:00-11:00 15-min false break of PDH/PDL, stop past the extreme (+0.2 pip),
      target 2R, forced close at the 15:59 NY bar close, min stop 2.4 pips (20x cost). Tests whether GBPUSD's idea carries over.
  V1  Wednesday + Friday NY-afternoon short: sell at the open of the 12:00 NY bar, stop = entry + 0.25 x ADR20,
      no target, exit at the close of the 15:59 NY bar.  (ADR20 = average high-low of the previous 20 full trading days.)
  V2  Same as V1 with stop = 0.40 x ADR20 (stop-size robustness check, not a pick-the-best).
  V3  (declared after V0-V2, from research finding: PDH/PDL breaks lean toward CONTINUATION in both years)
      NY 08:00-11:00 15-min candle CLOSES above PDH -> long / below PDL -> short (first one only), entry at its close,
      stop = 0.25 x ADR20 (same stop rule as V1, no new parameter), target 2R, forced close at the 15:59 NY bar close.
Fill model: market entry at the stated price; stop checked on every following 1-minute bar (bid data; a stop for a short
is hit when the bar HIGH reaches the stop, cost added on top). Costs 1.2 pips per trade (and 2.4 as the double-cost test).
Days skipped: incomplete days (<1300 bars), the day after one, days with a gap > 15 min inside the hours the rule uses."""
from common import *
from levels import day_table
import sys

df = load("ALL")
days = day_table(df)
days["adr20"] = days.rng.where(days.complete).rolling(20, min_periods=20).mean().shift(1) * PIP  # price units
G = {t: g.reset_index(drop=True) for t, g in df.groupby("tday")}
STOP_PAD = 0.2 * PIP


def ok_day(tday, ny_from, ny_to):
    d = days.loc[tday]
    if not (d.complete and d.prev_complete): return False
    return max_gap_minutes(G[tday], ny_from, ny_to) <= 15


def walk(g, i0, side, entry, stop, target=None, exit_min=959):
    """from bar index i0 (inclusive) to the bar whose NY minute is exit_min (inclusive, exit at its close)."""
    last = entry
    for lo_, hi_, cl, nm in zip(g.low.values[i0:], g.high.values[i0:], g.close.values[i0:], g.ny_min.values[i0:]):
        if nm > exit_min or nm >= 1020 or nm < 0: break
        if side == 1:
            if lo_ <= stop: return stop - entry, "stop"
            if target is not None and hi_ >= target: return target - entry, "target"
        else:
            if hi_ >= stop: return entry - stop, "stop"
            if target is not None and lo_ <= target: return entry - target, "target"
        last = cl
        if nm == exit_min: break
    return (last - entry) * side, "time"


def v0():
    out = []
    for tday, d in days.iterrows():
        if pd.isna(d.pdh) or not ok_day(tday, 480, 960): continue
        g = G[tday]; gt = g[g.ldn_today & (g.ny_min >= 480) & (g.ny_min < 660)]
        x = gt.set_index("ny")[["open", "high", "low", "close"]].resample("15min", label="left", closed="left").agg(
            {"open": "first", "high": "max", "low": "min", "close": "last"}).dropna()
        hh, ll = -1e9, 1e9; sh = sl = False
        for t, b in x.iterrows():
            hh = max(hh, b.high); ll = min(ll, b.low)
            sh |= b.high > d.pdh; sl |= b.low < d.pdl
            sig = None
            if sh and b.close < d.pdh: sig, stop = -1, hh + STOP_PAD
            elif sl and b.close > d.pdl: sig, stop = 1, ll - STOP_PAD
            if sig is None: continue
            entry = b.close
            if abs(entry - stop) < 2.4 * PIP: stop = entry - sig * 2.4 * PIP
            risk = abs(entry - stop)
            m_next = t.hour * 60 + t.minute + 15
            i0 = int(np.where(g.ldn_today.values & (g.ny_min.values >= m_next) & (g.ny_min.values < 1020))[0][0])
            pnl, why = walk(g, i0, sig, entry, stop, entry + sig * 2 * risk)
            out.append(dict(tday=tday, side=sig, risk=risk, gross=pnl, why=why)); break
    return pd.DataFrame(out)


def wedfri(k):
    out = []
    for tday, d in days.iterrows():
        if tday.dayofweek not in (2, 4) or pd.isna(d.adr20) or not ok_day(tday, 720, 960): continue
        g = G[tday]
        i = np.where(g.ldn_today.values & (g.ny_min.values == 720))[0]
        if not len(i): continue
        i0 = int(i[0]); entry = g.open.values[i0]; risk = max(k * d.adr20, 2.4 * PIP)
        pnl, why = walk(g, i0, -1, entry, entry + risk)
        out.append(dict(tday=tday, side=-1, risk=risk, gross=pnl, why=why))
    return pd.DataFrame(out)


def v3():
    out = []
    for tday, d in days.iterrows():
        if pd.isna(d.pdh) or pd.isna(d.adr20) or not ok_day(tday, 480, 960): continue
        g = G[tday]; gt = g[g.ldn_today & (g.ny_min >= 480) & (g.ny_min < 660)]
        x = gt.set_index("ny")[["open", "high", "low", "close"]].resample("15min", label="left", closed="left").agg(
            {"open": "first", "high": "max", "low": "min", "close": "last"}).dropna()
        for t, b in x.iterrows():
            sig = 1 if b.close > d.pdh else (-1 if b.close < d.pdl else None)
            if sig is None: continue
            entry = b.close; risk = max(0.25 * d.adr20, 2.4 * PIP); stop = entry - sig * risk
            m_next = t.hour * 60 + t.minute + 15
            i0 = int(np.where(g.ldn_today.values & (g.ny_min.values >= m_next) & (g.ny_min.values < 1020))[0][0])
            pnl, why = walk(g, i0, sig, entry, stop, entry + sig * 2 * risk)
            out.append(dict(tday=tday, side=sig, risk=risk, gross=pnl, why=why)); break
    return pd.DataFrame(out)


def llr(r):
    b = c = 0
    for x in r:
        c = c + 1 if x <= 0 else 0; b = max(b, c)
    return b


def stats(r):
    if len(r) == 0: return "none"
    w = r > 0; pf = r[w].sum() / -r[~w].sum() if (~w).any() else np.inf
    eq = r.cumsum(); dd = (eq - eq.cummax()).min()
    wb3 = r.sort_values().iloc[:-3].sum() if len(r) > 3 else np.nan
    return f"n={len(r):3d} win={w.mean():.0%} tot={r.sum():+6.1f}R avg={r.mean():+.3f}R PF={pf:.2f} DD={dd:5.1f} run={llr(r)} w/o best3={wb3:+.1f}"


def report(name, T):
    T = T.copy(); T["year"] = year_of(T.tday)
    print(f"=== {name}")
    for c in (1.2, 2.4):
        T["R"] = (T.gross - c * PIP) / T.risk
        for y in ["Y1", "Y2"]:
            t = T[T.year == y]
            print(f"  cost {c} {y}: {stats(t.R)}")
            if c == 1.2:
                for s, lab in [(1, "long "), (-1, "short")]:
                    tt = t[t.side == s]
                    if len(tt): print(f"        {lab}: {stats(tt.R)}")
    T["R"] = (T.gross - 1.2 * PIP) / T.risk
    print("  exits:", T.groupby("why").R.agg(["size", "sum"]).round(1).to_dict("index"), "| median stop pips", round(T.risk.median() / PIP, 1))
    return T


if __name__ == "__main__":
    which = sys.argv[1:] or ["V0", "V1", "V2", "V3"]
    if "V0" in which: report("V0 GBPUSD v1 replica (PDH/PDL NY false break)", v0()).to_csv("out_09_V0.csv", index=False)
    if "V1" in which: report("V1 Wed+Fri NY-afternoon short, stop 0.25 ADR20", wedfri(0.25)).to_csv("out_09_V1.csv", index=False)
    if "V2" in which: report("V2 Wed+Fri NY-afternoon short, stop 0.40 ADR20", wedfri(0.40)).to_csv("out_09_V2.csv", index=False)
    if "V3" in which: report("V3 PDH/PDL breakout continuation (NY 08-11, 15-min close beyond), 2R", v3()).to_csv("out_09_V3.csv", index=False)
