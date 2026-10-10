"""Round-3 shared loader (Agent 1). Design data only: trading/data/<SYM>_M1.csv.gz (2019-01 .. 2026-09).
NEVER reads trading/data/hidden/. No clock fix (data is UTC).
Builds a day x minute matrix: row = trading day (17:00 NY -> 17:00 NY), column = minute since 17:00 NY (0..1439).
NY 08:00 = column 15*60 = 900. Missing minutes are NaN.
London offset per day (London minus NY, in hours: 5 normally, 4 in the US/UK mismatch weeks) is stored too,
so London clock times can be converted to the column index exactly.
"""
import os, pickle
import numpy as np, pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.abspath(os.path.join(HERE, "..", "..", "data"))
CACHE = os.environ.get("R3_CACHE", "/tmp/claude-0/-home-user-my-first-project/1c8d33d7-d94d-5131-95fb-13a566ad2900/scratchpad/cache")
PIP = 0.0001
COST = 1.2 * PIP


def col_ny(h, m=0):
    """column index of the minute starting at NY local h:m (trading day starts 17:00 NY previous evening)"""
    return ((h - 17) % 24) * 60 + m


def load_matrix(sym="GBPUSD"):
    os.makedirs(CACHE, exist_ok=True)
    cp = os.path.join(CACHE, f"{sym}_mat.pkl")
    if os.path.exists(cp):
        return pickle.load(open(cp, "rb"))
    path = os.path.join(DATA, f"{sym}_M1.csv.gz")
    assert "hidden" not in path
    df = pd.read_csv(path, parse_dates=["time_utc"])
    assert df.time_utc.min() >= pd.Timestamp("2019-01-01")
    utc = df.time_utc.dt.tz_localize("UTC")
    ny = utc.dt.tz_convert("America/New_York")
    nyn = ny.dt.tz_localize(None)
    shifted = nyn + pd.Timedelta(hours=7)
    tday = shifted.dt.normalize()
    wd = tday.dt.dayofweek
    tday = tday.where(wd != 5, tday + pd.Timedelta(days=2))
    tday = tday.where(wd != 6, tday + pd.Timedelta(days=1))
    # column = minutes since 17:00 NY of previous day; weekend bars (before Sunday 17:00) -> clip to 0
    col = ((shifted - shifted.dt.normalize()).dt.total_seconds() // 60).astype(int)
    col = col.where(wd < 5, 0)
    days = np.sort(tday.unique())
    di = np.searchsorted(days, tday.values)
    nd = len(days)
    O = np.full((nd, 1440), np.nan); H = O.copy(); L = O.copy(); C = O.copy()
    # keep last bar if duplicates at col 0 for weekend; for weekend bars aggregate crudely: we just let later overwrite
    O[di, col] = df.open.values; H[di, col] = df.high.values; L[di, col] = df.low.values; C[di, col] = df.close.values
    nbars = np.bincount(di, minlength=nd)
    days = pd.DatetimeIndex(days)
    # London - NY offset (hours) at 12:00 UTC of the trading day
    t = (days + pd.Timedelta(hours=12)).tz_localize("UTC")
    off = ((t.tz_convert("Europe/London").tz_localize(None) - t.tz_convert("America/New_York").tz_localize(None))
           .total_seconds() / 3600).astype(int).values
    nyoff = ((t.tz_convert("America/New_York").tz_localize(None) - t.tz_localize(None)).total_seconds() / 3600).astype(int).values
    res = dict(days=days, O=O, H=H, L=L, C=C, nbars=nbars, ldn_off=off, ny_utc=nyoff)
    pickle.dump(res, open(cp, "wb"), protocol=4)
    return res


def col_ldn(h, m, ldn_off):
    """column index (array, per day) of London local time h:m"""
    nyh = h - ldn_off  # NY hour
    return ((nyh - 17) % 24) * 60 + m


def max_gap(row_valid, a, b):
    """largest run of missing minutes in columns [a, b)"""
    v = row_valid[a:b]
    if v.all():
        return 0
    best = cur = 0
    for x in v:
        cur = 0 if x else cur + 1
        best = max(best, cur)
    return best


def gap_ok(M, a, b, limit=15):
    """per-day boolean: no gap > limit minutes inside columns [a,b) (a,b scalars)"""
    v = ~np.isnan(M["C"][:, a:b])
    out = np.ones(len(v), bool)
    for i in range(len(v)):
        if not v[i].all():
            out[i] = max_gap(v[i], 0, b - a) <= limit
    return out
