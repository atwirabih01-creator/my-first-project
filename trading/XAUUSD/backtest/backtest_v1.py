"""
XAUUSD v1 "Go with London's break of the Asia range" -- independent backtest by Agent 2.

Written from the rules text in trading/XAUUSD/strategy.md only (no code from research/ is imported or copied).
Agent 1's news-date list (research/news_calendar.py) is re-typed here only to LABEL news days.

Usage:
    python3 trading/XAUUSD/backtest/backtest_v1.py            # full 36 months -> trades_v1.csv, summary_v1.txt, weekly_v1.csv
    python3 trading/XAUUSD/backtest/backtest_v1.py --design   # design-only data (Agent 1's view) -> trades_v1_designonly.csv

Rules as implemented (rule numbers from strategy.md):
  12. Trading day = 17:00 NY -> 17:00 NY: day label = date of (NY time + 7 h). Sunday-evening bars belong to Monday.
  11. Thin day: < 1,300 one-minute bars -> no trade that day AND the next trading day that has data.
      Asia period with < 300 bars -> skip.
   1. Asia high/low = max high / min low of 1-min bars opening 00:00..06:59 London on the day's date. MID = (AH+AL)/2.
   2. 15-min candles aligned to the clock, built from 1-min bars (open of first, max high, min low, close of last).
   3. Window = candles opening >= 07:00 London and closing <= 12:00 NY (same date).
   4. First candle whose CLOSE is strictly above AH (long) / strictly below AL (short).
   5. Entry = close of the signal candle (bid), at the candle's close time.
   6/7. Stop = MID, target = entry +/- (entry - MID). Never moved.
   10. Forced close = close of the last 1-min bar opening before 16:00 NY.
   Walk: 1-min bars from the signal candle close time. In each bar the stop is checked first (stop wins ties).
         If a bar OPENS beyond the stop (gap), the fill is the bar open (worse); target fills at target price.
   Costs: 0.40 USD per trade (also 0.80 USD), taken off the result. R = (USD result - cost) / |entry - stop|.
"""
import sys, os, numpy as np, pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "..", "data", "XAUUSD_M1.csv.gz")
COST, COST2 = 0.40, 0.80
DESIGN_ONLY = "--design" in sys.argv

PERIODS = [("A", "2023-10-01", "2024-09-30"), ("Y1", "2024-10-01", "2025-09-30"),
           ("Y2", "2025-10-01", "2026-06-30"), ("B", "2026-07-01", "2026-09-30")]

# ---------------- news labels (label only; not used for trading) ----------------
# Design period: copied (as data) from Agent 1's research/news_calendar.py.
D_NFP = ["2024-10-04", "2024-11-01", "2024-12-06", "2025-01-10", "2025-02-07", "2025-03-07", "2025-04-04", "2025-05-02",
         "2025-06-06", "2025-07-03", "2025-08-01", "2025-09-05", "2025-11-20", "2025-12-16", "2026-01-09", "2026-02-11",
         "2026-03-06", "2026-04-03", "2026-05-08", "2026-06-05"]
D_CPI = ["2024-10-10", "2024-11-13", "2024-12-11", "2025-01-15", "2025-02-12", "2025-03-12", "2025-04-10", "2025-05-13",
         "2025-06-11", "2025-07-15", "2025-08-12", "2025-09-11", "2025-10-24", "2025-12-18", "2026-01-13", "2026-02-13",
         "2026-03-11", "2026-04-10", "2026-05-12", "2026-06-10"]
D_PPI = ["2024-10-11", "2024-11-14", "2024-12-12", "2025-01-14", "2025-02-13", "2025-03-13", "2025-04-11", "2025-05-15",
         "2025-06-12", "2025-07-16", "2025-08-14", "2025-09-10", "2025-11-25", "2026-01-14", "2026-01-30", "2026-02-27",
         "2026-04-14", "2026-05-13", "2026-06-11"]
D_FOMC = ["2024-11-07", "2024-12-18", "2025-01-29", "2025-03-19", "2025-05-07", "2025-06-18", "2025-07-30", "2025-09-17",
          "2025-10-29", "2025-12-10", "2026-01-28", "2026-03-18", "2026-04-29", "2026-06-17"]
# Hidden test A (Oct 2023 - Sep 2024): Agent 2, from the published BLS release schedules and the Fed FOMC calendar.
A_NFP = ["2023-10-06", "2023-11-03", "2023-12-08", "2024-01-05", "2024-02-02", "2024-03-08", "2024-04-05", "2024-05-03",
         "2024-06-07", "2024-07-05", "2024-08-02", "2024-09-06"]
A_CPI = ["2023-10-12", "2023-11-14", "2023-12-12", "2024-01-11", "2024-02-13", "2024-03-12", "2024-04-10", "2024-05-15",
         "2024-06-12", "2024-07-11", "2024-08-14", "2024-09-11"]
A_PPI = ["2023-10-11", "2023-11-15", "2023-12-13", "2024-01-12", "2024-02-16", "2024-03-14", "2024-04-11", "2024-05-14",
         "2024-06-13", "2024-07-12", "2024-08-13", "2024-09-12"]
A_FOMC = ["2023-11-01", "2023-12-13", "2024-01-31", "2024-03-20", "2024-05-01", "2024-06-12", "2024-07-31", "2024-09-18"]
# Hidden test B (Jul - Sep 2026): from the 2026 schedules published in advance.
# Every hidden-period date was checked against the gold price: the 5-minute range at the release minute (08:30 / 14:00 NY)
# is 13-170 times the average 5-minute range of the hour before (normal day median about 5). Only PPI 2024-09-12 is weak (7.6).
B_NFP = ["2026-07-02", "2026-08-07", "2026-09-04"]
B_CPI = ["2026-07-14", "2026-08-12", "2026-09-11"]
B_PPI = ["2026-07-15", "2026-08-13", "2026-09-10"]
B_FOMC = ["2026-07-29", "2026-09-16"]
DOUBTFUL = set(D_PPI[12:]) | {"2024-09-12"}  # Agent 1 flagged post-Sep-2025 PPI as doubtful; 2024-09-12 weak price spike

EVENTS = {}
for lst, name in [(D_NFP + A_NFP + B_NFP, "NFP"), (D_CPI + A_CPI + B_CPI, "CPI"), (D_PPI + A_PPI + B_PPI, "PPI"),
                  (D_FOMC + A_FOMC + B_FOMC, "FOMC")]:
    for d in lst:
        EVENTS.setdefault(d, []).append(name)


def period_of(d):
    for p, a, b in PERIODS:
        if a <= d <= b:
            return p
    return None


# ---------------- load ----------------
df = pd.read_csv(DATA, parse_dates=["time_utc"])
utc = df["time_utc"].dt.tz_localize("UTC")
ny = utc.dt.tz_convert("America/New_York")
ld = utc.dt.tz_convert("Europe/London")
df["ny"] = ny.dt.tz_localize(None)
df["ld"] = ld.dt.tz_localize(None)
df["tday"] = (df["ny"] + pd.Timedelta(hours=7)).dt.date.astype(str)
if DESIGN_ONLY:  # reproduce Agent 1's view: data clipped to the design period (in UTC) before anything else
    df = df[(df["time_utc"] >= "2024-10-01") & (df["time_utc"] < "2026-07-01")].copy()

# ---------------- thin days ----------------
counts = df.groupby("tday").size()
days = list(counts.index)
thin = set(counts[counts < 1300].index)
skip = set(thin)
for i, d in enumerate(days[:-1]):
    if d in thin:
        skip.add(days[i + 1])

# ---------------- per-day simulation ----------------
rows = []
diag = {"days": 0, "skipped_thin": 0, "skipped_asia": 0, "no_signal": 0, "gap_fills": 0, "both_same_bar": 0}
for d, g in df.groupby("tday", sort=True):
    diag["days"] += 1
    if d in skip:
        diag["skipped_thin"] += 1
        continue
    date = pd.Timestamp(d)
    lt = g["ld"]
    asia = g[(lt >= date) & (lt < date + pd.Timedelta(hours=7))]
    if len(asia) < 300:
        diag["skipped_asia"] += 1
        continue
    ah, al = asia["high"].max(), asia["low"].min()
    mid = (ah + al) / 2
    # 15-min candles in the window
    win_start_ld = date + pd.Timedelta(hours=7)          # 07:00 London
    win_end_ny = date + pd.Timedelta(hours=12)           # 12:00 NY
    w = g[(lt >= win_start_ld) & (g["ny"] < win_end_ny)].copy()
    w["c_open_utc"] = w["time_utc"].dt.floor("15min")
    sig = None
    for c_open, c in w.groupby("c_open_utc", sort=True):
        c_open_ld = c["ld"].iloc[0].floor("15min")
        c_close_ny = c["ny"].iloc[0].floor("15min") + pd.Timedelta(minutes=15)
        if c_open_ld < win_start_ld or c_close_ny > win_end_ny:
            continue
        cl = c["close"].iloc[-1]
        if cl > ah:
            sig = ("long", c_open, cl, c_close_ny); break
        if cl < al:
            sig = ("short", c_open, cl, c_close_ny); break
    if sig is None:
        diag["no_signal"] += 1
        continue
    side, c_open, entry, c_close_ny = sig
    entry_utc = c_open + pd.Timedelta(minutes=15)
    risk = abs(entry - mid)
    target = entry + risk if side == "long" else entry - risk
    stop = mid
    forced_ny = date + pd.Timedelta(hours=16)
    walk = g[(g["time_utc"] >= entry_utc) & (g["ny"] < forced_ny)]
    exit_reason, exit_px, exit_t = None, None, None
    for t, o, hi, lo, cl, tny in zip(walk["time_utc"], walk["open"], walk["high"], walk["low"], walk["close"], walk["ny"]):
        if side == "long":
            hit_s, hit_t = lo <= stop, hi >= target
            if hit_s:
                exit_px = min(o, stop); diag["gap_fills"] += o < stop
        else:
            hit_s, hit_t = hi >= stop, lo <= target
            if hit_s:
                exit_px = max(o, stop); diag["gap_fills"] += o > stop
        if hit_s:
            diag["both_same_bar"] += bool(hit_t)
            exit_reason, exit_t = "stop", t; break
        if hit_t:
            exit_reason, exit_px, exit_t = "target", target, t; break
    if exit_reason is None:
        if len(walk) == 0:
            continue
        exit_reason, exit_px, exit_t = "16:00 close", walk["close"].iloc[-1], walk["time_utc"].iloc[-1] + pd.Timedelta(minutes=1)
    gross = (exit_px - entry) if side == "long" else (entry - exit_px)
    ev = EVENTS.get(d, [])
    def fmt(tutc, tz):
        return pd.Timestamp(tutc).tz_localize("UTC").tz_convert(tz).strftime("%H:%M")
    rows.append(dict(
        date=d, weekday=date.strftime("%a"),
        doha_entry=fmt(entry_utc, "Asia/Qatar"), ny_entry=fmt(entry_utc, "America/New_York"),
        london_entry=fmt(entry_utc, "Europe/London"),
        direction=side, entry=round(entry, 3), stop=round(stop, 3), target=round(target, 3),
        stop_usd=round(risk, 3), exit_reason=exit_reason,
        exit_ny=fmt(exit_t, "America/New_York"), exit_doha=fmt(exit_t, "Asia/Qatar"), exit_price=round(exit_px, 3),
        usd_after_cost=round(gross - COST, 3), R=round((gross - COST) / risk, 4),
        R_2x_cost=round((gross - COST2) / risk, 4),
        news_day="yes" if ev else "no", news_event="+".join(ev),
        news_doubtful="yes" if d in DOUBTFUL and ev == ["PPI"] else "no",
        asia_high=round(ah, 3), asia_low=round(al, 3), period=period_of(d)))

tr = pd.DataFrame(rows)
suffix = "_designonly" if DESIGN_ONLY else ""
tr.to_csv(os.path.join(HERE, f"trades_v1{suffix}.csv"), index=False)
print("diagnostics:", diag, "| thin days:", len(thin), "| skipped (thin + day after):", len(skip))
print("trades:", len(tr))
