"""Shared loader for GBPUSD research (Agent 1).

HARD RULE (round 2): only the DESIGN period 2024-10-01 .. 2026-06-30 (inclusive) is used.
  - 2023-10-01 .. 2024-09-30 = hidden test A  -> never kept in memory
  - 2026-07-01 onward        = hidden test B  -> never kept in memory
The file is read in chunks and every chunk is filtered at once, so hidden rows are dropped
immediately on reading. Asserts check that nothing outside the design period survives.
The data clock is already correct UTC (README): NO clock fix is applied here.

Optional environment variable GBP_PERIOD = Y1 | Y2 | ALL (default ALL):
  Y1 = design year 1, Oct 2024 - Sep 2025;  Y2 = design year 2, Oct 2025 - Jun 2026.
"""
import os
import pandas as pd
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "..", "data", "GBPUSD_M1.csv.gz")
DESIGN_START = pd.Timestamp("2024-10-01 00:00:00")
DESIGN_END_EXCL = pd.Timestamp("2026-07-01 00:00:00")
Y2_START = pd.Timestamp("2025-10-01")
PIP = 0.0001


def year_of(tday):
    return np.where(pd.to_datetime(tday) < Y2_START, "Y1", "Y2")


def load(period=None):
    period = period or os.environ.get("GBP_PERIOD", "ALL")
    parts = []
    for ch in pd.read_csv(DATA, parse_dates=["time_utc"], chunksize=200_000):
        ch = ch[(ch.time_utc >= DESIGN_START) & (ch.time_utc < DESIGN_END_EXCL)]  # filter FIRST
        if len(ch): parts.append(ch)
    df = pd.concat(parts, ignore_index=True)
    assert df.time_utc.min() >= DESIGN_START and df.time_utc.max() < DESIGN_END_EXCL, "hidden data leaked"
    utc = df.time_utc.dt.tz_localize("UTC")
    df["ny"] = utc.dt.tz_convert("America/New_York")
    df["ldn"] = utc.dt.tz_convert("Europe/London")
    df["doha"] = utc.dt.tz_convert("Asia/Qatar")
    # Trading day = the FX day 17:00 New York -> 17:00 New York. A bar at/after 17:00 NY belongs to the next date.
    shifted = df["ny"] + pd.Timedelta(hours=7)
    df["tday"] = shifted.dt.tz_localize(None).dt.normalize()
    # Weekend bars (e.g. Sunday bars before 17:00 NY) belong to Monday's trading day.
    wd = df.tday.dt.dayofweek
    df.loc[wd == 5, "tday"] += pd.Timedelta(days=2)
    df.loc[wd == 6, "tday"] += pd.Timedelta(days=1)
    df["ldn_min"] = df["ldn"].dt.hour * 60 + df["ldn"].dt.minute
    df["ny_min"] = df["ny"].dt.hour * 60 + df["ny"].dt.minute
    # True once London's calendar date equals the trading day (from London midnight on).
    df["ldn_today"] = df["ldn"].dt.tz_localize(None).dt.normalize() == df["tday"]
    df = df[(df.tday >= DESIGN_START) & (df.tday < DESIGN_END_EXCL)].reset_index(drop=True)
    # incomplete days (holidays / data gaps / partial first day): excluded from statistics and from trading
    n = df.groupby("tday").time_utc.transform("size")
    df["complete"] = n >= 1300
    df["year"] = year_of(df.tday)
    if period in ("Y1", "Y2"):
        df = df[df.year == period].reset_index(drop=True)
    assert df.tday.min() >= DESIGN_START and df.tday.max() < DESIGN_END_EXCL
    return df


def complete(df):
    return df[df.complete]
