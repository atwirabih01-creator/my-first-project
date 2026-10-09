"""Agent 2 spot-check of Agent 1's round-2 variants, written independently from the rule descriptions
in research.md section 6 (no code from research/ imported or copied).

DESIGN PERIOD ONLY: rows outside 2024-10-01 .. 2026-06-30 UTC are dropped while the file is read.
Hidden test A (Oct 2023 - Sep 2024) and hidden test B (Jul 2026+) are never kept in memory.

Checks:
  V3 "planned v2" = v1 false break of PDH/PDL (08:00-11:00 NY, 15-min close back across, stop window extreme
     +/-2 pips, target 2R, forced close = close of 15:59 NY bar), only on days with ER5 < 0.5, stop widened to
     8 pips minimum.  ER5 = |close of day-1 - open of day-5| / (highest high - lowest low of days -5..-1),
     using the last 5 complete trading days before today.
  F4 NY opening-range breakout: range = high/low of 08:00-08:59 NY one-minute bars; first 15-min candle
     (opening 09:00..10:45 NY) that closes above the high -> long, below the low -> short; entry at that close;
     stop = other side of the range; target 2R; forced close at 16:00 NY (close of 15:59 bar).
Both: 1 trade per day, stop first if both hit in one minute, skip days whose own or previous day has
< 1,300 one-minute bars (strategy.md settled point 3). Costs 1.5 and 3.0 pips.
Run: python3 trading/GBPUSD/backtest/review_round2.py
"""
from pathlib import Path
import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
DATA = HERE.parents[1] / "data" / "GBPUSD_M1.csv.gz"
PIP = 1e-4
NY = "America/New_York"
START, END = pd.Timestamp("2024-10-01"), pd.Timestamp("2026-07-01")


def load():
    parts = []
    for ch in pd.read_csv(DATA, parse_dates=["time_utc"], chunksize=250_000):
        ch = ch[(ch.time_utc >= START) & (ch.time_utc < END)]
        if len(ch):
            parts.append(ch)
    df = pd.concat(parts, ignore_index=True).sort_values("time_utc")
    assert df.time_utc.min() >= START and df.time_utc.max() < END
    ny = df.time_utc.dt.tz_localize("UTC").dt.tz_convert(NY)
    df["ny"] = ny
    td = (ny + pd.Timedelta(hours=7)).dt.tz_localize(None).dt.normalize()
    wd = td.dt.weekday
    td = td + pd.to_timedelta(np.where(wd == 6, 1, np.where(wd == 5, 2, 0)), unit="D")
    df["tday"] = td
    df["nym"] = ny.dt.hour * 60 + ny.dt.minute
    return df


def walk(day, start_min, d, entry, stop, target):
    """Exit on 1-minute bars from start_min (NY minutes) to the 15:59 bar. Returns gross pips, reason."""
    p = day[(day.nym >= start_min) & (day.nym < 960) & (day.ny.dt.date == day.ny.iloc[-1].date())]
    for lo, hi in zip(p.low.values, p.high.values):
        if d == 1:
            if lo <= stop: return (stop - entry) / PIP, "stop"
            if hi >= target: return (target - entry) / PIP, "target"
        else:
            if hi >= stop: return (entry - stop) / PIP, "stop"
            if lo <= target: return (entry - target) / PIP, "target"
    return d * (p.close.values[-1] - entry) / PIP, "time"


def candles(day, m0, m1):
    w = day[(day.nym >= m0) & (day.nym < m1) & (day.ny.dt.date == day.ny.iloc[-1].date())]
    return w.groupby(w.nym // 15 * 15).agg(high=("high", "max"), low=("low", "min"), close=("close", "last"))


def main():
    df = load()
    groups = {k: g for k, g in df.groupby("tday")}
    days = sorted(groups)
    info = pd.DataFrame({"n": [len(groups[k]) for k in days],
                         "open": [groups[k].open.iloc[0] for k in days],
                         "close": [groups[k].close.iloc[-1] for k in days],
                         "hi": [groups[k].high.max() for k in days],
                         "lo": [groups[k].low.min() for k in days]}, index=days)
    info["ok"] = info.n >= 1300
    comp = info[info.ok]
    # ER5 from the 5 complete days before each day
    er5 = {}
    cidx = list(comp.index)
    for i, k in enumerate(cidx):
        if i >= 5:
            w = comp.iloc[i - 5:i]
            er5[k] = abs(w.close.iloc[-1] - w.open.iloc[0]) / (w.hi.max() - w.lo.min())
    rows_v3, rows_v0, rows_f4 = [], [], []
    for i in range(1, len(days)):
        k, prev = days[i], days[i - 1]
        if not (info.ok[k] and info.ok[prev]):
            continue
        day = groups[k]
        pdh, pdl = info.hi[prev], info.lo[prev]
        c = candles(day, 480, 660)
        if len(c) == 12:
            sh = sl = False; hh, ll = -np.inf, np.inf
            for m, b in c.iterrows():
                hh, ll = max(hh, b.high), min(ll, b.low)
                sh |= b.high > pdh; sl |= b.low < pdl
                sig = -1 if (sh and b.close < pdh) else (1 if (sl and b.close > pdl) else 0)
                if sig:
                    entry = b.close
                    stop = hh + 2 * PIP if sig == -1 else ll - 2 * PIP
                    for rows, minstop in ((rows_v0, 0), (rows_v3, 8)):
                        if rows is rows_v3 and not (er5.get(k, np.nan) < 0.5):
                            continue
                        st = stop
                        if abs(entry - st) < minstop * PIP:
                            st = entry - sig * minstop * PIP
                        risk = abs(entry - st)
                        g, why = walk(day, m + 15, sig, entry, st, entry + sig * 2 * risk)
                        rows.append(dict(tday=k, side=sig, risk=risk / PIP, gross=g, why=why))
                    break
        # F4 NY opening range breakout
        rng = day[(day.nym >= 480) & (day.nym < 540) & (day.ny.dt.date == day.ny.iloc[-1].date())]
        if len(rng) >= 50:
            H, L = rng.high.max(), rng.low.min()
            for m, b in candles(day, 540, 660).iterrows():
                sig = 1 if b.close > H else (-1 if b.close < L else 0)
                if sig:
                    entry = b.close; st = L if sig == 1 else H; risk = abs(entry - st)
                    g, why = walk(day, m + 15, sig, entry, st, entry + sig * 2 * risk)
                    rows_f4.append(dict(tday=k, side=sig, risk=risk / PIP, gross=g, why=why))
                    break
    out = []
    for name, rows in (("V0 v1 replica", rows_v0), ("V3 planned v2", rows_v3), ("F4 NY opening-range breakout", rows_f4)):
        T = pd.DataFrame(rows)
        T["year"] = np.where(T.tday < pd.Timestamp("2025-10-01"), "Y1", "Y2")
        T.to_csv(HERE / f"review_round2_{name.split()[0]}.csv", index=False)
        out.append(f"--- {name}")
        for cost in (1.5, 3.0):
            parts = []
            for y in ("Y1", "Y2", "ALL"):
                s = T if y == "ALL" else T[T.year == y]
                r = (s.gross - cost) / s.risk
                run = best = 0
                for x in r:
                    run = run + 1 if x <= 0 else 0; best = max(best, run)
                eq = r.cumsum()
                pf = r[r > 0].sum() / -r[r <= 0].sum()
                parts.append(f"{y}: n={len(r)} win={(r > 0).mean():.0%} {r.sum():+.1f}R PF={pf:.2f} "
                             f"DD={(eq - eq.cummax()).min():.1f} run={best}")
            out.append(f"  cost {cost}: " + " | ".join(parts))
    text = "\n".join(out)
    (HERE / "review_round2.txt").write_text(text + "\n")
    print(text)


if __name__ == "__main__":
    main()
