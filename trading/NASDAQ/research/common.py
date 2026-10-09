"""Shared loader for NASDAQ 100 research (Agent 1).

DATA RULE (trading/README.md + team leader brief): design data = 2024-10-01 .. 2026-06-30 ONLY.
Hidden test A (Oct 2023 - Sep 2024) and hidden test B (Jul 2026 on) are filtered out chunk by chunk right after
reading, before anything is computed, and an assert checks it. trading/data/hidden/ is never opened.
The data clock is already correct UTC: NO clock fix here.
Y1 = Oct 2024 - Sep 2025, Y2 = Oct 2025 - Jun 2026. Env NDX_PERIOD = Y1 | Y2 | ALL (default ALL).
Prices are bid index points (Nasdaq 100 CFD). Cost per round trip: 2.0 points (stress 4.0).
"""
import os
import pandas as pd
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "..", "data", "NSXUSD_M1.csv.gz")
CACHE = os.environ.get("NDX_CACHE", "/tmp/claude-0/-home-user-my-first-project/1c8d33d7-d94d-5131-95fb-13a566ad2900/scratchpad/ndx_design.pkl")
DESIGN_START, DESIGN_END_EXCL = pd.Timestamp("2024-10-01"), pd.Timestamp("2026-07-01")
assert "hidden" not in os.path.normpath(DATA).split(os.sep)
Y2_START = pd.Timestamp("2025-10-01")
COST = 2.0
MIN_BARS = 1250  # normal day ~1,320 bars; used only as a coarse flag, the real check is the RTH gap rule


def year_of(tday):
    t = pd.to_datetime(tday)
    return np.where(t < Y2_START, "Y1", "Y2")


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
    period = period or os.environ.get("NDX_PERIOD", "ALL")
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
    df["doha"] = utc.dt.tz_convert("Asia/Qatar")
    # Trading day = 18:00 NY (re-open after the daily break) -> 17:00 NY. Bars at/after 17:00 NY belong to next date.
    shifted = df["ny"] + pd.Timedelta(hours=7)
    df["tday"] = shifted.dt.tz_localize(None).dt.normalize()
    wd = df.tday.dt.dayofweek
    df.loc[wd == 5, "tday"] += pd.Timedelta(days=2)
    df.loc[wd == 6, "tday"] += pd.Timedelta(days=1)
    df["ny_min"] = df["ny"].dt.hour * 60 + df["ny"].dt.minute
    df["ny_today"] = df["ny"].dt.tz_localize(None).dt.normalize() == df["tday"]
    df["nymin"] = np.where(df.ny_today, df.ny_min, -1)  # -1 = evening session before NY midnight
    df = df[(df.tday >= DESIGN_START) & (df.tday < DESIGN_END_EXCL)].reset_index(drop=True)
    df["year"] = year_of(df.tday)
    if period in ("Y1", "Y2"):
        df = df[df.year == period].reset_index(drop=True)
    assert df.tday.min() >= DESIGN_START and df.tday.max() < DESIGN_END_EXCL
    return df
