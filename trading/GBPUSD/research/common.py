"""Shared loader for GBPUSD research (Agent 1).

HARD RULE: only the development period 2025-10-01 .. 2026-06-30 (inclusive) is used.
Anything from 2026-07-01 onward is dropped immediately after loading.
"""
import os
import pandas as pd
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "..", "data", "GBPUSD_M1.csv.gz")
DEV_START = pd.Timestamp("2025-10-01 00:00:00")
DEV_END_EXCL = pd.Timestamp("2026-07-01 00:00:00")  # hidden check period starts here
PIP = 0.0001


def load():
    df = pd.read_csv(DATA, parse_dates=["time_utc"])
    df = df[(df.time_utc >= DEV_START) & (df.time_utc < DEV_END_EXCL)].copy()  # filter FIRST
    assert df.time_utc.max() < DEV_END_EXCL
    utc = df.time_utc.dt.tz_localize("UTC")
    df["ny"] = utc.dt.tz_convert("America/New_York")
    df["ldn"] = utc.dt.tz_convert("Europe/London")
    df["doha"] = utc.dt.tz_convert("Asia/Qatar")
    # Trading day = the FX day that ends 17:00 New York time (standard FX rollover).
    # A bar at/after 17:00 NY belongs to the next calendar day.
    shifted = df["ny"] + pd.Timedelta(hours=7)
    df["tday"] = shifted.dt.tz_localize(None).dt.normalize()
    df["ldn_min"] = df["ldn"].dt.hour * 60 + df["ldn"].dt.minute
    df["ny_min"] = df["ny"].dt.hour * 60 + df["ny"].dt.minute
    # True once London's calendar date equals the trading day (i.e. from London midnight on).
    # The first ~2 hours of each trading day (17:00 NY -> London midnight) are still "yesterday" in London.
    df["ldn_today"] = df["ldn"].dt.tz_localize(None).dt.normalize() == df["tday"]
    df = df.reset_index(drop=True)
    # drop weekend stubs (Sunday-evening open belongs to Monday tday already)
    df = df[df.tday.dt.dayofweek < 5]
    # trading days that belong to July 2026 (e.g. bars after 17:00 NY on 30 Jun) are dropped too
    df = df[df.tday < DEV_END_EXCL]
    # mark incomplete days (holidays / data gaps / first partial day): excluded from statistics
    n = df.groupby("tday").time_utc.transform("size")
    df["complete"] = n >= 1300
    return df


def complete(df):
    return df[df.complete]


def ny_offset_hours(ts_ny):
    """Gap Doha - New York in hours (7 in US summer time, 8 in US winter time)."""
    return int(3 - ts_ny.utcoffset().total_seconds() / 3600)
