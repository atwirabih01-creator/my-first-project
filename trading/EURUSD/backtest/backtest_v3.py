"""EURUSD v3 "Euro-only move fade" - independent backtest by Agent 2 (Backtest & Performance Manager), round 3, 10 Oct 2026.

Written from the rules text in trading/EURUSD/strategy.md (round-3 section) only. Agent 1's round3/ code is NOT imported or copied.

Run:  python3 trading/EURUSD/backtest/backtest_v3.py            -> both periods, cost 1.2 pips, 75th percentile (the rule)
      python3 trading/EURUSD/backtest/backtest_v3.py --pct=65   -> side-check only (Agent 1's backup idea), never graded
Outputs next to this script: trades_v3[_p65].csv, days_v3[_p65].csv, late_v3.csv (entry 1 minute late).

The two periods are run separately, each with its own warm-up (no data carried from one file to the other):
  H = hidden test 2016-2018 (data/hidden/*_2016-2018.csv.gz), opened for the first time here.  D = design 2019 - Sep 2026.
No clock correction is applied (README: files are already in verified UTC).

How the rules are turned into code (my reading; see feedback.md for the points I had to interpret):
- Trading day = 17:00 NY -> 17:00 NY (UTC -> New York by time-zone conversion, then +7 h gives the trading date).
- ATR20 = mean of (high-low) of EURUSD over the previous 20 trading days that have >= 1,300 one-minute bars.
- Gap list = the previous 250 trading days in the data file (Mon-Fri trading dates with any bars); a day's gap counts if
  E0, E1, G0, G1 exist (a bar within 15 min before 02:59 / 09:59 NY). Threshold = 75th percentile (numpy linear) of |gap|
  over the gaps found in those 250 days; at least 100 gaps needed. (First version used "the last 250 gap values"; after
  the Feb-Jul 2023 data hole that reached back into 2022 and dropped 7 trades. The rule text says "past 250 trading days",
  so this literal reading is used. Only the design data is affected; 2016-2018 has no long holes.)
- Gap = (E1/E0 - 1) - (G1/G0 - 1), as the rules text says (Agent 1 used logs: practically the same).
- E0/G0 = close of the 02:59 NY bar, E1/G1 = close of the 09:59 NY bar (last bar at or before that minute, max 15 min old).
- Morning High/Low = EURUSD 03:00-09:59 NY bars. Gap > Threshold -> SELL, Gap < -Threshold -> BUY.
- SELL stop = Morning High + 1 pip, BUY stop = Morning Low - 1 pip. Stop distance from E1 must be within [0.15, 0.60] x ATR20
  and >= 2.4 pips.
- Entry = E1 (close of 09:59 bar). Bid data; the round-trip cost (1.2 pips) is subtracted from every trade, which is the
  same as "buys fill at the ask" plus a small slippage. R = (direction x (exit - E1) - cost) / stop distance.
  So a full stop-out costs -(1 + cost/stop distance) R, slightly more than 1R.
- Walk the 1-minute bars 10:00 .. 15:59 NY. Stop touched (bid high >= stop for a sell, bid low <= stop for a buy) -> exit at
  the stop price (or at the bar's open if the bar opened beyond the stop). Else exit at the close of the 15:59 NY bar.
  A stop in the 15:59 bar counts as a stop (stop before forced close).
- No-trade days: EURUSD hole > 15 min (missing minutes) between 19:00 NY previous evening and 16:00 NY; GBPUSD hole > 15 min
  between 03:00 and 10:00 NY; either pair < 1,300 bars that trading day.
- News label (label only, never used to decide): "US 08:30 shock" = EURUSD |08:29 -> 08:44 NY move| > 3 x median of the same
  window over the previous 20 days (no 10-year news calendar is connected).
"""
import sys
from pathlib import Path
import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
DATA = HERE.parents[1] / "data"
PIP = 0.0001
COST = 1.2 * PIP
PCT = 75.0
for a in sys.argv:
    if a.startswith("--pct="):
        PCT = float(a.split("=")[1])
SUFFIX = "" if PCT == 75.0 else f"_p{PCT:g}"
LOOKBACK, MIN_HIST = 250, 100
ATR_N, FULL_BARS = 20, 1300
MAX_MISS = 15
STOP_MIN_K, STOP_MAX_K, MIN_STOP = 0.15, 0.60, 2.4 * PIP

PERIODS = {
    "H": ("hidden/EURUSD_M1_2016-2018.csv.gz", "hidden/GBPUSD_M1_2016-2018.csv.gz"),
    "D": ("EURUSD_M1.csv.gz", "GBPUSD_M1.csv.gz"),
}

# shifted clock: m = minute of day of (NY time + 7 h); 17:00 NY = 0
M_E0, M_E1 = 599, 1019            # 02:59 NY, 09:59 NY
M_MORN0, M_MORN1 = 600, 1019      # 03:00 .. 09:59 NY
M_TR0, M_TR1 = 1020, 1379         # 10:00 .. 15:59 NY
M_EH0, M_EH1 = 120, 1379          # EUR hole check 19:00 NY prev .. 16:00 NY
M_N0, M_N1 = 929, 944             # 08:29 / 08:44 NY (news label)


def load(fn):
    df = pd.read_csv(DATA / fn, parse_dates=["time_utc"])
    ny = df["time_utc"].dt.tz_localize("UTC").dt.tz_convert("America/New_York").dt.tz_localize(None)
    sh = ny + pd.Timedelta(hours=7)
    df["tday"] = sh.dt.date
    df["m"] = (sh.dt.hour * 60 + sh.dt.minute).astype(int)
    return df


def max_missing(m, a, b):
    mm = m[(m >= a) & (m <= b)]
    seq = np.concatenate([[a - 1], mm, [b + 1]])
    return int((np.diff(seq) - 1).max())


def last_close_at(m, c, t):
    idx = np.searchsorted(m, t, side="right") - 1
    if idx < 0 or m[idx] < t - MAX_MISS:
        return None
    return c[idx]


def day_facts(df):
    out = {}
    for d, g in df.groupby("tday", sort=True):
        out[d] = dict(m=g["m"].values, o=g["open"].values, h=g["high"].values, l=g["low"].values, c=g["close"].values)
    return out


def ny_stamp(d, m):
    """trading date + shifted minute -> (NY timestamp, Doha timestamp)"""
    t = pd.Timestamp(d) + pd.Timedelta(minutes=int(m)) - pd.Timedelta(hours=7)
    tz = t.tz_localize("America/New_York", ambiguous=False, nonexistent="shift_forward")
    return tz, tz.tz_convert("Asia/Qatar")


def run_period(pname):
    fe, fg = PERIODS[pname]
    E = day_facts(load(fe))
    G = day_facts(load(fg))
    days = sorted(set(E) | set(G))
    days = [d for d in days if pd.Timestamp(d).weekday() < 5]
    gaps_hist, rng_hist, news_hist = [], [], []
    trades, late, recs = [], [], []
    for d in days:
        e, g = E.get(d), G.get(d)
        rec = {"tday": str(d), "period": pname, "status": None}
        recs.append(rec)
        # ---- values known before today ----
        win = [x for x in gaps_hist[-LOOKBACK:] if x is not None]   # past 250 trading days (days in the file)
        thr = np.percentile(np.abs(win), PCT) if len(win) >= MIN_HIST else None
        atr = np.mean(rng_hist[-ATR_N:]) if len(rng_hist) >= ATR_N else None
        news_med = np.median(news_hist[-20:]) if len(news_hist) >= 10 else None
        # ---- today's facts ----
        gap = None
        if e is not None and g is not None:
            E0, E1 = last_close_at(e["m"], e["c"], M_E0), last_close_at(e["m"], e["c"], M_E1)
            G0, G1 = last_close_at(g["m"], g["c"], M_E0), last_close_at(g["m"], g["c"], M_E1)
            if None not in (E0, E1, G0, G1):
                gap = (E1 / E0 - 1) - (G1 / G0 - 1)
        nb_e = 0 if e is None else len(e["m"])
        nb_g = 0 if g is None else len(g["m"])
        n0 = n1 = None
        if e is not None:
            n0, n1 = last_close_at(e["m"], e["c"], M_N0), last_close_at(e["m"], e["c"], M_N1)
        nmove = abs(n1 - n0) if (n0 is not None and n1 is not None) else None
        news = bool(nmove is not None and news_med is not None and news_med > 0 and nmove > 3 * news_med)
        rec.update(bars_eur=nb_e, bars_gbp=nb_g, threshold_pct=None if thr is None else thr * 100,
                   gap_pct=None if gap is None else gap * 100, atr_pips=None if atr is None else atr / PIP)
        # ---- decide ----
        status = None
        if nb_e < FULL_BARS or nb_g < FULL_BARS:
            status = "thin day (< 1,300 bars)"
        elif max_missing(e["m"], M_EH0, M_EH1) > MAX_MISS:
            status = "EURUSD data hole 19:00-16:00 NY"
        elif max_missing(g["m"], M_MORN0, M_MORN1) > MAX_MISS:
            status = "GBPUSD data hole 03:00-10:00 NY"
        elif thr is None:
            status = "warm-up: fewer than 100 past gap values"
        elif atr is None:
            status = "warm-up: ATR20"
        elif gap is None:
            status = "missing 02:59/09:59 price"
        elif abs(gap) <= thr:
            status = "gap not above threshold"
        else:
            side = -1 if gap > 0 else 1
            mm = (e["m"] >= M_MORN0) & (e["m"] <= M_MORN1)
            mh, ml = e["h"][mm].max(), e["l"][mm].min()
            stop = mh + PIP if side == -1 else ml - PIP
            dist = abs(E1 - stop)
            if dist < STOP_MIN_K * atr:
                status = "not stalled (stop < 0.15 x ATR)"
            elif dist > STOP_MAX_K * atr:
                status = "already given back (stop > 0.6 x ATR)"
            elif dist < MIN_STOP:
                status = "stop under 2.4 pips"
            else:
                status = "TRADE"
                t = walk(d, e, side, E1, stop, dist, M_TR0)
                ent_ny, ent_doha = ny_stamp(d, M_TR0)
                t.update(date=str(d), period=pname, year=pd.Timestamp(d).year, weekday=pd.Timestamp(d).day_name()[:3],
                         entry_ny=ent_ny.strftime("%H:%M"), entry_doha=ent_doha.strftime("%H:%M"),
                         us_summer_time=bool(ent_ny.dst().total_seconds() > 0),
                         direction="long" if side == 1 else "short", E0=E0, E1=E1, G0=G0, G1=G1,
                         eur_move_pct=(E1 / E0 - 1) * 100, gbp_move_pct=(G1 / G0 - 1) * 100, gap_pct=gap * 100,
                         threshold_pct=thr * 100, atr20_pips=atr / PIP, morning_high=mh, morning_low=ml,
                         entry=E1, stop=stop, target="none", stop_pips=dist / PIP,
                         stop_atr=dist / atr, news="US 08:30 shock" if news else "normal",
                         session="NY morning->close (Europe's last hours)")
                trades.append(t)
                # entry 1 minute late: same decision, filled at the close of the 10:00 NY bar
                k = np.searchsorted(e["m"], M_TR0)
                if k < len(e["m"]) and e["m"][k] == M_TR0:
                    hit = e["h"][k] >= stop if side == -1 else e["l"][k] <= stop
                    if not hit:
                        en2 = e["c"][k]
                        d2 = abs(en2 - stop)
                        if d2 >= MIN_STOP:
                            t2 = walk(d, e, side, en2, stop, d2, M_TR0 + 1)
                            t2.update(date=str(d), period=pname, year=pd.Timestamp(d).year,
                                      direction="long" if side == 1 else "short")
                            late.append(t2)
        rec["status"] = status
        # ---- update histories (after today's decision; used from tomorrow on) ----
        gaps_hist.append(gap)   # None when the gap cannot be measured that day (still counts as a trading day)
        if nb_e >= FULL_BARS:
            rng_hist.append(e["h"].max() - e["l"].min())
        if nmove is not None:
            news_hist.append(nmove)
    return trades, late, recs


def walk(d, e, side, entry, stop, dist, m_from):
    sel = (e["m"] >= m_from) & (e["m"] <= M_TR1)
    m, o, h, l, c = e["m"][sel], e["o"][sel], e["h"][sel], e["l"][sel], e["c"][sel]
    why, px, mx = None, None, None
    for i in range(len(m)):
        if (side == -1 and h[i] >= stop) or (side == 1 and l[i] <= stop):
            why = "stop"
            gapped = (side == -1 and o[i] > stop) or (side == 1 and o[i] < stop)
            px, mx = (o[i] if gapped else stop), m[i]
            break
    if why is None:
        why, px, mx = "close 16:00", c[-1], m[-1] + 1
    gross = side * (px - entry)
    ex_ny, ex_doha = ny_stamp(d, mx)
    r = {"exit": why, "exit_price": px, "exit_ny": ex_ny.strftime("%H:%M"), "exit_doha": ex_doha.strftime("%H:%M"),
         "gross_pips": gross / PIP}
    for cp in (0.0, 1.2, 2.4):
        r[f"r_{cp:g}"] = (gross - cp * PIP) / dist
    r["R"] = r["r_1.2"]
    return r


def main():
    allt, alll, allr = [], [], []
    for p in ("H", "D"):
        t, l, r = run_period(p)
        allt += t; alll += l; allr += r
        tt = pd.DataFrame(t)
        print(p, len(tt), "trades", round(tt.R.sum(), 2) if len(tt) else 0, "R")
    cols = ["date", "period", "year", "weekday", "entry_doha", "entry_ny", "us_summer_time", "direction", "E0", "E1", "G0", "G1",
            "eur_move_pct", "gbp_move_pct", "gap_pct", "threshold_pct", "atr20_pips", "morning_high", "morning_low",
            "entry", "stop", "target", "stop_pips", "stop_atr", "exit", "exit_price", "exit_doha", "exit_ny", "gross_pips",
            "r_0", "r_1.2", "r_2.4", "R", "news", "session"]
    pd.DataFrame(allt)[cols].to_csv(HERE / f"trades_v3{SUFFIX}.csv", index=False, float_format="%.6g")
    pd.DataFrame(allr).to_csv(HERE / f"days_v3{SUFFIX}.csv", index=False, float_format="%.5g")
    if not SUFFIX:
        pd.DataFrame(alll).to_csv(HERE / "late_v3.csv", index=False, float_format="%.6g")
    dd = pd.DataFrame(allr)
    print(dd.groupby(["period", "status"]).size().to_string())


if __name__ == "__main__":
    main()
