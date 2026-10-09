"""NASDAQ 100 v1 "Fade the big opening gap" - independent backtest by Agent 2 (Backtest & Performance Manager).

Written from the rules text in trading/NASDAQ/strategy.md only (Agent 1's code in research/ is NOT imported or copied).
Agent 1's news / earnings dates are copied as DATA, and are used only to label days.

Run:  python3 trading/NASDAQ/backtest/backtest_v1.py            (full 36-month file)
      python3 trading/NASDAQ/backtest/backtest_v1.py --design   (design period only, as Agent 1 had it)
Outputs (next to this script): trades_v1.csv (or trades_v1_designonly.csv), days_v1.csv (every day and why it was / was not traded).

How the test works, in short:
- Times: UTC -> New York local time by time-zone conversion (US summer time automatic). Trading day = 18:00 NY to 17:00 NY.
- A day is "full" if it is not a US stock-market holiday / early close and has no hole of more than 15 minutes in 09:30-16:00 NY.
- Prices are bid. Cost 2.0 index points per trade is subtracted from the result (stress: 4.0 and 6.0).
- The trade is walked minute by minute from 09:35 to 15:59 NY. Stop and target in the same minute -> stop counts.
  If a minute opens beyond the stop, the fill is that minute's open (worse than the stop). Target fills exactly at PC.
"""
import sys
from pathlib import Path
import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
DATA = HERE.parents[1] / "data" / "NSXUSD_M1.csv.gz"
DESIGN_ONLY = "--design" in sys.argv
# --gapk=0.4 : sensitivity check only (writes trades_v1_gapk0.4.csv); the v1 rule is 0.5
GAPK_ARG = [a.split("=")[1] for a in sys.argv if a.startswith("--gapk=")]

COST = 2.0
STRESS = [0.0, 2.0, 4.0, 6.0]
GAP_K, STOP_K, MIN_STOP = 0.5, 0.75, 40.0
if GAPK_ARG:
    GAP_K = float(GAPK_ARG[0])
ATR_N, ATR_MIN = 14, 10
MAX_HOLE = 15  # minutes

PERIODS = [("A", "2023-10-01", "2024-09-30"), ("Y1", "2024-10-01", "2025-09-30"),
           ("Y2", "2025-10-01", "2026-06-30"), ("B", "2026-07-01", "2026-09-30")]

# ---------------- US stock-market calendar (NYSE / Nasdaq published calendars) ----------------
HOLIDAYS = {
    # 2023-24
    "2023-11-23", "2023-12-25", "2024-01-01", "2024-01-15", "2024-02-19", "2024-03-29", "2024-05-27", "2024-06-19",
    "2024-07-04", "2024-09-02",
    # 2024-25 (same as strategy.md)
    "2024-11-28", "2024-12-25", "2025-01-01", "2025-01-09", "2025-01-20", "2025-02-17", "2025-04-18", "2025-05-26",
    "2025-06-19", "2025-07-04", "2025-09-01",
    # 2025-26 (same as strategy.md) + hidden B
    "2025-11-27", "2025-12-25", "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19",
    "2026-07-03", "2026-09-07",
}
EARLY_CLOSES = {"2023-11-24", "2024-07-03", "2024-11-29", "2024-12-24", "2025-07-03", "2025-11-28", "2025-12-24"}

# ---------------- labels only (never used to decide a trade) ----------------
NFP = ["2023-10-06", "2023-11-03", "2023-12-08", "2024-01-05", "2024-02-02", "2024-03-08", "2024-04-05", "2024-05-03",
       "2024-06-07", "2024-07-05", "2024-08-02", "2024-09-06",
       # design: copied as data from Agent 1's news_calendar.py
       "2024-10-04", "2024-11-01", "2024-12-06", "2025-01-10", "2025-02-07", "2025-03-07", "2025-04-04", "2025-05-02",
       "2025-06-06", "2025-07-03", "2025-08-01", "2025-09-05", "2025-11-20", "2025-12-16", "2026-01-09", "2026-02-11",
       "2026-03-06", "2026-04-03", "2026-05-08", "2026-06-05",
       "2026-07-02", "2026-08-07", "2026-09-04"]
CPI = ["2023-10-12", "2023-11-14", "2023-12-12", "2024-01-11", "2024-02-13", "2024-03-12", "2024-04-10", "2024-05-15",
       "2024-06-12", "2024-07-11", "2024-08-14", "2024-09-11",
       "2024-10-10", "2024-11-13", "2024-12-11", "2025-01-15", "2025-02-12", "2025-03-12", "2025-04-10", "2025-05-13",
       "2025-06-11", "2025-07-15", "2025-08-12", "2025-09-11", "2025-10-24", "2025-12-18", "2026-01-13", "2026-02-13",
       "2026-03-11", "2026-04-10", "2026-05-12", "2026-06-10",
       "2026-07-14", "2026-08-12", "2026-09-11"]
PPI = ["2023-10-11", "2023-11-15", "2023-12-13", "2024-01-12", "2024-02-16", "2024-03-14", "2024-04-11", "2024-05-14",
       "2024-06-13", "2024-07-12", "2024-08-13", "2024-09-12",
       "2024-10-11", "2024-11-14", "2024-12-12", "2025-01-14", "2025-02-13", "2025-03-13", "2025-04-11", "2025-05-15",
       "2025-06-12", "2025-07-16", "2025-08-14", "2025-09-10", "2025-11-25", "2026-01-14", "2026-01-30", "2026-02-27",
       "2026-04-14", "2026-05-13", "2026-06-11",
       "2026-07-15", "2026-08-13", "2026-09-10"]
FOMC = ["2023-11-01", "2023-12-13", "2024-01-31", "2024-03-20", "2024-05-01", "2024-06-12", "2024-07-31", "2024-09-18",
        "2024-11-07", "2024-12-18", "2025-01-29", "2025-03-19", "2025-05-07", "2025-06-18", "2025-07-30", "2025-09-17",
        "2025-10-29", "2025-12-10", "2026-01-28", "2026-03-18", "2026-04-29", "2026-06-17",
        "2026-07-29", "2026-09-16"]
# Big-tech earnings, all after the 16:00 close (Alpha Vantage EARNINGS "reportedDate", post-market). The reaction is the
# NEXT trading day's gap, so that next day is labelled EARN. Hidden A and B dates fetched by Agent 2 on 9 Oct 2026.
EARN_REPORTED = {
    "NVDA": ["2023-11-21", "2024-02-21", "2024-05-22", "2024-08-28", "2024-11-20", "2025-02-26", "2025-05-28",
             "2025-08-27", "2025-11-19", "2026-02-25", "2026-05-20", "2026-08-26"],
    "AAPL": ["2023-11-02", "2024-02-01", "2024-05-02", "2024-08-01", "2024-10-31", "2025-01-30", "2025-05-01",
             "2025-07-31", "2025-10-30", "2026-01-29", "2026-04-30", "2026-07-30"],
    "MSFT": ["2023-10-24", "2024-01-30", "2024-04-25", "2024-07-30", "2024-10-30", "2025-01-29", "2025-04-30",
             "2025-07-30", "2025-10-29", "2026-01-28", "2026-04-29", "2026-07-29"],
    "GOOGL": ["2023-10-24", "2024-01-30", "2024-04-25", "2024-07-23", "2024-10-29", "2025-02-04", "2025-04-24",
              "2025-07-23", "2025-10-29", "2026-02-04", "2026-04-29", "2026-07-22"],
}


def period_of(d):
    s = str(d)
    for p, a, b in PERIODS:
        if a <= s <= b:
            return p
    return None


def main():
    df = pd.read_csv(DATA, parse_dates=["time_utc"])
    if DESIGN_ONLY:
        df = df[(df["time_utc"] >= "2024-10-01") & (df["time_utc"] < "2026-07-01")].copy()
    ny = df["time_utc"].dt.tz_localize("UTC").dt.tz_convert("America/New_York")
    df["ny"] = ny
    df["tday"] = (ny.dt.tz_localize(None) + pd.Timedelta(hours=6)).dt.date  # 18:00 NY starts the next trading day
    df["mnt"] = ny.dt.hour * 60 + ny.dt.minute
    tdays = sorted(df["tday"].unique())
    groups = dict(tuple(df.groupby("tday")))

    # ---- per-day facts ----
    info = {}
    for d in tdays:
        g = groups[d]
        cash = g[(g["mnt"] >= 570) & (g["mnt"] < 960) & (g["ny"].dt.date == d)]
        reason = None
        ds = str(d)
        if ds in HOLIDAYS:
            reason = "US holiday"
        elif ds in EARLY_CLOSES:
            reason = "early close"
        elif len(cash) == 0:
            reason = "no cash-session bars"
        else:
            m = np.concatenate([[569], cash["mnt"].values, [960]])
            hole = int((np.diff(m) - 1).max())
            if hole > MAX_HOLE:
                reason = f"data hole {hole} min in 09:30-16:00"
        r = {"full": reason is None, "reason": reason}
        if len(cash):
            r.update(open=cash["open"].iloc[0], hi=cash["high"].max(), lo=cash["low"].min(),
                     close=cash["close"].iloc[-1])
            r["rng_pct"] = (r["hi"] - r["lo"]) / r["open"] * 100
        info[d] = r

    earn_days = set()
    for lst in EARN_REPORTED.values():
        for rd in lst:
            nxt = [t for t in tdays if str(t) > rd]
            if nxt:
                earn_days.add(str(nxt[0]))

    def label(ds):
        tags = []
        if ds in NFP: tags.append("NFP")
        if ds in CPI: tags.append("CPI")
        if ds in PPI: tags.append("PPI")
        if ds in FOMC: tags.append("FOMC")
        if ds in earn_days: tags.append("EARN")
        return "+".join(tags) if tags else "normal"

    trades, days = [], []
    for i, d in enumerate(tdays):
        ds = str(d)
        rec = {"tday": ds, "period": period_of(d), "status": None}
        days.append(rec)
        if i == 0:
            rec["status"] = "first day in file (no previous day)"; continue
        if not info[d]["full"]:
            rec["status"] = "not full: " + info[d]["reason"]; continue
        prev = tdays[i - 1]
        if not info[prev]["full"]:
            rec["status"] = "previous day not full (" + info[prev]["reason"] + ")"; continue
        window = tdays[max(0, i - ATR_N):i]
        fulls = [w for w in window if info[w]["full"]]
        if len(fulls) < ATR_MIN:
            rec["status"] = f"ATR warm-up ({len(fulls)} full sessions of {len(window)})"; continue
        atr_pct = float(np.mean([info[w]["rng_pct"] for w in fulls]))
        g = groups[d]
        pg = groups[prev]
        pcash = pg[(pg["mnt"] < 960) & (pg["ny"].dt.date == prev)]
        PC = pcash["close"].iloc[-1]
        first = g[(g["mnt"] >= 570) & (g["mnt"] < 575) & (g["ny"].dt.date == d)]
        if len(first) == 0:
            rec["status"] = "no 09:30 candle"; continue
        O = first["open"].iloc[0]
        atr = atr_pct * O / 100
        gap = O - PC
        rec.update(gap=gap, atr=atr, gap_atr=gap / atr)
        if abs(gap) <= GAP_K * atr:
            rec["status"] = "gap too small"; continue
        side = -1 if gap > 0 else 1
        if (side == -1 and first["low"].min() <= PC) or (side == 1 and first["high"].max() >= PC):
            rec["status"] = "filled in first 5 min"; continue
        entry = first["close"].iloc[-1]
        risk = STOP_K * atr
        if risk < MIN_STOP:
            rec["status"] = "stop under 40 points"; continue
        stop = entry - side * risk
        walk = g[(g["mnt"] >= 575) & (g["mnt"] < 960) & (g["ny"].dt.date == d)]
        why, exit_px, exit_t = None, None, None
        for row in walk.itertuples():
            if side == -1:
                hit_s, hit_t = row.high >= stop, row.low <= PC
            else:
                hit_s, hit_t = row.low <= stop, row.high >= PC
            if hit_s:
                why = "stop"
                exit_px = row.open if (side == -1 and row.open > stop) or (side == 1 and row.open < stop) else stop
                exit_t = row.ny; break
            if hit_t:
                why, exit_px, exit_t = "target", PC, row.ny; break
        if why is None:
            last = walk.iloc[-1]
            why, exit_px, exit_t = "close 15:59", last["close"], last["ny"]
        gross = side * (exit_px - entry)
        ent_ny = first["ny"].iloc[-1] + pd.Timedelta(minutes=1)
        t = {"date": ds, "period": period_of(d), "weekday": pd.Timestamp(d).day_name()[:3],
             "entry_ny": ent_ny.strftime("%H:%M"), "entry_doha": ent_ny.tz_convert("Asia/Qatar").strftime("%H:%M"),
             "us_summer_time": bool(ent_ny.dst().total_seconds() > 0),
             "direction": "long" if side == 1 else "short", "prev_close": round(PC, 3), "open_0930": round(O, 3),
             "gap_pts": round(gap, 2), "atr_pts": round(atr, 2), "gap_atr": round(gap / atr, 3),
             "entry": round(entry, 3), "stop": round(stop, 3), "target": round(PC, 3), "risk_pts": round(risk, 2),
             "exit": why, "exit_price": round(exit_px, 3),
             "exit_ny": exit_t.strftime("%H:%M") if why != "close 15:59" else "16:00",
             "exit_doha": (exit_t + pd.Timedelta(minutes=1 if why == "close 15:59" else 0)).tz_convert("Asia/Qatar").strftime("%H:%M"),
             "gross_pts": round(gross, 3)}
        for c in STRESS:
            t[f"r_{c:g}"] = (gross - c) / risk
        t["r"] = t[f"r_{COST:g}"]
        t["news"] = label(ds)
        trades.append(t)
        rec["status"] = "TRADE"

    tr = pd.DataFrame(trades)
    dd = pd.DataFrame(days)
    suffix = ("_designonly" if DESIGN_ONLY else "") + (f"_gapk{GAP_K:g}" if GAPK_ARG else "")
    tr.to_csv(HERE / f"trades_v1{suffix}.csv", index=False, float_format="%.5f")
    dd.to_csv(HERE / f"days_v1{suffix}.csv", index=False, float_format="%.4f")
    for p in ["A", "Y1", "Y2", "B"]:
        x = tr[tr.period == p]
        if len(x):
            print(f"{p}: {len(x)} trades, win {np.mean(x.r > 0)*100:.1f}%, total {x.r.sum():+.2f} R")
    print(dd.groupby(["period", "status"]).size().to_string())


if __name__ == "__main__":
    main()
