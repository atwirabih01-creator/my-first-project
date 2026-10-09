"""Shared loader for XAUUSD (gold) research (Agent 1).

HARD RULE: only the DESIGN period 2024-10-01 .. 2026-06-30 (inclusive) is used.
  - 2023-10-01 .. 2024-09-30 = hidden test A  -> dropped from every chunk as it is read
  - 2026-07-01 onward        = hidden test B  -> dropped from every chunk as it is read
Asserts check that nothing outside the design period survives.
The data clock is already correct UTC (trading/README.md): NO clock fix is applied here.

Environment variable XAU_PERIOD = Y1 | Y2 | ALL (default ALL):
  Y1 = design year 1, Oct 2024 - Sep 2025;  Y2 = design year 2, Oct 2025 - Jun 2026.
Prices are bid, in USD per ounce. Cost per round trip: 0.40 USD (stress test 0.80 USD).
"""
import os
import pandas as pd
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "..", "data", "XAUUSD_M1.csv.gz")
CACHE = os.environ.get("XAU_CACHE", "/tmp/claude-0/-home-user-my-first-project/1c8d33d7-d94d-5131-95fb-13a566ad2900/scratchpad/xau_design.pkl")
DESIGN_START = pd.Timestamp("2024-10-01 00:00:00")
DESIGN_END_EXCL = pd.Timestamp("2026-07-01 00:00:00")
Y2_START = pd.Timestamp("2025-10-01")
COST = 0.40
MIN_BARS = 1300  # a normal gold day has 1,380 one-minute bars (23 h; break 17:00-18:00 NY). US-holiday early closes have ~1,229; 24 Dec ~1,184


def year_of(tday):
    return np.where(pd.to_datetime(tday) < Y2_START, "Y1", "Y2")


def _read_design():
    parts = []
    for ch in pd.read_csv(DATA, parse_dates=["time_utc"], chunksize=200_000):
        ch = ch[(ch.time_utc >= DESIGN_START) & (ch.time_utc < DESIGN_END_EXCL)]  # filter FIRST
        if len(ch):
            parts.append(ch)
    df = pd.concat(parts, ignore_index=True)
    assert df.time_utc.min() >= DESIGN_START and df.time_utc.max() < DESIGN_END_EXCL, "hidden data leaked"
    return df


def load(period=None):
    period = period or os.environ.get("XAU_PERIOD", "ALL")
    if os.path.exists(CACHE):
        df = pd.read_pickle(CACHE)
    else:
        df = _read_design()
        try:
            df.to_pickle(CACHE)
        except Exception:
            pass
    assert df.time_utc.min() >= DESIGN_START and df.time_utc.max() < DESIGN_END_EXCL, "hidden data leaked"
    utc = df.time_utc.dt.tz_localize("UTC")
    df["ny"] = utc.dt.tz_convert("America/New_York")
    df["ldn"] = utc.dt.tz_convert("Europe/London")
    df["doha"] = utc.dt.tz_convert("Asia/Qatar")
    # Trading day = 17:00 New York -> 17:00 New York. A bar at/after 17:00 NY belongs to the next date.
    shifted = df["ny"] + pd.Timedelta(hours=7)
    df["tday"] = shifted.dt.tz_localize(None).dt.normalize()
    # Weekend bars (e.g. Sunday bars before 17:00 NY) belong to Monday's trading day.
    wd = df.tday.dt.dayofweek
    df.loc[wd == 5, "tday"] += pd.Timedelta(days=2)
    df.loc[wd == 6, "tday"] += pd.Timedelta(days=1)
    df["ldn_min"] = df["ldn"].dt.hour * 60 + df["ldn"].dt.minute
    df["ny_min"] = df["ny"].dt.hour * 60 + df["ny"].dt.minute
    df["ldn_today"] = df["ldn"].dt.tz_localize(None).dt.normalize() == df["tday"]
    df["ny_today"] = df["ny"].dt.tz_localize(None).dt.normalize() == df["tday"]
    df = df[(df.tday >= DESIGN_START) & (df.tday < DESIGN_END_EXCL)].reset_index(drop=True)
    n = df.groupby("tday").time_utc.transform("size")
    df["complete"] = n >= MIN_BARS
    df["year"] = year_of(df.tday)
    if period in ("Y1", "Y2"):
        df = df[df.year == period].reset_index(drop=True)
    assert df.tday.min() >= DESIGN_START and df.tday.max() < DESIGN_END_EXCL
    return df


def complete(df):
    return df[df.complete]
