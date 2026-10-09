"""Shared loader for EURUSD research (Agent 1). Adapted from trading/GBPUSD/research/common.py (copied, not imported).

HARD RULE: only the DESIGN period 2024-10-01 .. 2026-06-30 (inclusive) is used.
  - 2023-10-01 .. 2024-09-30 = hidden test A  -> dropped chunk by chunk while reading, never kept
  - 2026-07-01 onward        = hidden test B  -> dropped chunk by chunk while reading, never kept
  - trading/data/hidden/     = never opened
Asserts stop the run if any bar outside the design period survives.
The data clock is already correct UTC (README): NO clock fix is applied.

Environment variable EUR_PERIOD = Y1 | Y2 | ALL (default ALL):
  Y1 = Oct 2024 - Sep 2025;  Y2 = Oct 2025 - Jun 2026.
A cache of the design rows (already filtered) is kept in EUR_CACHE (default: none) to speed up re-runs.
"""
import os
import pandas as pd
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "..", "data", "EURUSD_M1.csv.gz")
DESIGN_START = pd.Timestamp("2024-10-01 00:00:00")
DESIGN_END_EXCL = pd.Timestamp("2026-07-01 00:00:00")
Y2_START = pd.Timestamp("2025-10-01")
PIP = 0.0001
COST = 0.00012  # 1.2 pips round trip (README)


def year_of(tday):
    return np.where(pd.to_datetime(tday) < Y2_START, "Y1", "Y2")


def _read_design():
    cache = os.environ.get("EUR_CACHE")
    if cache and os.path.exists(cache):
        df = pd.read_pickle(cache)
    else:
        parts = []
        for ch in pd.read_csv(DATA, parse_dates=["time_utc"], chunksize=200_000):
            ch = ch[(ch.time_utc >= DESIGN_START) & (ch.time_utc < DESIGN_END_EXCL)]  # filter FIRST
            if len(ch): parts.append(ch)
        df = pd.concat(parts, ignore_index=True)
        if cache: df.to_pickle(cache)
    assert df.time_utc.min() >= DESIGN_START and df.time_utc.max() < DESIGN_END_EXCL, "hidden data leaked"
    return df


def load(period=None):
    period = period or os.environ.get("EUR_PERIOD", "ALL")
    df = _read_design()
    utc = df.time_utc.dt.tz_localize("UTC")
    df["ny"] = utc.dt.tz_convert("America/New_York")
    df["ldn"] = utc.dt.tz_convert("Europe/London")
    df["doha"] = utc.dt.tz_convert("Asia/Qatar")
    # Trading day = 17:00 New York -> 17:00 New York. A bar at/after 17:00 NY belongs to the next date.
    shifted = df["ny"] + pd.Timedelta(hours=7)
    df["tday"] = shifted.dt.tz_localize(None).dt.normalize()
    # Weekend bars (Sunday bars before 17:00 NY, any Saturday bars) belong to Monday's trading day.
    wd = df.tday.dt.dayofweek
    df.loc[wd == 5, "tday"] += pd.Timedelta(days=2)
    df.loc[wd == 6, "tday"] += pd.Timedelta(days=1)
    df["ldn_min"] = df["ldn"].dt.hour * 60 + df["ldn"].dt.minute
    df["ny_min"] = df["ny"].dt.hour * 60 + df["ny"].dt.minute
    df["ldn_today"] = df["ldn"].dt.tz_localize(None).dt.normalize() == df["tday"]
    df = df[(df.tday >= DESIGN_START) & (df.tday < DESIGN_END_EXCL)].reset_index(drop=True)
    n = df.groupby("tday").time_utc.transform("size")
    df["nbars"] = n
    df["complete"] = n >= 1300
    df["year"] = year_of(df.tday)
    if period in ("Y1", "Y2"):
        df = df[df.year == period].reset_index(drop=True)
    assert df.tday.min() >= DESIGN_START and df.tday.max() < DESIGN_END_EXCL
    assert df.time_utc.min() >= DESIGN_START and df.time_utc.max() < DESIGN_END_EXCL
    return df


def complete(df):
    return df[df.complete]


def max_gap_minutes(g, ny_from, ny_to):
    """largest gap (minutes) between consecutive bars inside [ny_from, ny_to) NY minutes, incl. window edges."""
    m = g.ny_min.values
    m = np.sort(m[(m >= ny_from) & (m < ny_to)])
    if len(m) == 0: return 9999
    pts = np.concatenate([[ny_from - 1], m, [ny_to]])
    return int(np.diff(pts).max() - 1)
