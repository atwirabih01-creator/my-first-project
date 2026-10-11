"""Shared helpers for the owner's VWAP + EMA study (Agent 1).
Design data only: trading/data/<SYMBOL>_M1.csv.gz (2019-01 .. 2026-09). Never touches data/hidden/.
VWAP stand-in: our minute data has NO volume, so 'AP' = session-anchored running average of the
typical price (H+L+C)/3 of every 1-minute bar since the anchor, each minute weighted equally.
Band: AP +/- k * running standard deviation of the typical price around AP.
"""
import os, numpy as np, pandas as pd

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
DATA = os.path.join(ROOT, "trading", "data")
SYMS = {"GBPUSD": "GBPUSD", "XAUUSD": "XAUUSD", "NASDAQ": "NSXUSD", "EURUSD": "EURUSD"}
COST = {"GBPUSD": 0.00015, "EURUSD": 0.00012, "XAUUSD": 0.40, "NASDAQ": 2.0}

_cache = {}
def load(market):
    if market in _cache: return _cache[market]
    p = os.path.join(DATA, f"{SYMS[market]}_M1.csv.gz")
    assert "hidden" not in p
    df = pd.read_csv(p, parse_dates=["time_utc"])
    df = df[(df.time_utc >= "2019-01-01") & (df.time_utc < "2026-10-01")].reset_index(drop=True)
    u = df.time_utc.dt.tz_localize("UTC")
    df["ny"] = u.dt.tz_convert("America/New_York").dt.tz_localize(None)
    df["lon"] = u.dt.tz_convert("Europe/London").dt.tz_localize(None)
    df["doha"] = u.dt.tz_convert("Asia/Qatar").dt.tz_localize(None)
    df["day"] = df.ny.dt.normalize()
    df["nym"] = df.ny.dt.hour * 60 + df.ny.dt.minute          # minute of NY day (bar START)
    df["lonm"] = df.lon.dt.hour * 60 + df.lon.dt.minute
    df["tp"] = (df.high + df.low + df.close) / 3
    _cache[market] = df
    return df

def anchored_ap(df, anchor):
    """anchor = ('NY', minute) or ('LON', minute). Returns ap, sd arrays (NaN before anchor on that NY day)."""
    tz, m = anchor
    after = (df.nym >= m) if tz == "NY" else (df.lonm >= m) & (df.lon.dt.normalize() == df.day)
    # FX days start 17:00 NY of previous evening in NY-date terms they belong to the same NY date; fine.
    tp = df.tp.where(after)
    g = after.groupby(df.day)
    cnt = after.astype(int).groupby(df.day).cumsum()
    s1 = tp.fillna(0).groupby(df.day).cumsum()
    s2 = (tp.fillna(0) ** 2).groupby(df.day).cumsum()
    ap = (s1 / cnt).where(after)
    var = (s2 / cnt - ap ** 2).clip(lower=0)
    return ap.values, np.sqrt(var).values

def gappy_days(df, start_m, end_m, tz_start="NY", maxgap=15):
    """Return set of NY days with a gap > maxgap minutes between session start and end_m (NY minutes),
    or missing coverage at the edges. start given in tz_start local minutes."""
    bad = set()
    for d, g in df.groupby("day", sort=False):
        sel = ((g.lonm >= start_m) & (g.lon.dt.normalize() == d)) if tz_start == "LON" else (g.nym >= start_m)
        sel &= g.nym < end_m
        t = g.ny[sel]
        if len(t) < 30:
            if d.dayofweek < 5: bad.add(d)
            continue
        mins = (t.values.astype("datetime64[m]").astype(np.int64))
        first = g.lonm[sel].iloc[0] if tz_start == "LON" else g.nym[sel].iloc[0]
        if first - start_m > maxgap or end_m - (g.nym[sel].iloc[-1] + 1) > maxgap or np.diff(mins).max(initial=0) > maxgap:
            bad.add(d)
    return bad

def bars(df, n, ap, sd):
    """Clock-aligned n-minute bars in NY local time, plus AP/sd at each bar's last minute."""
    key = df.ny.dt.floor(f"{n}min")
    x = pd.DataFrame({"k": key, "open": df.open, "high": df.high, "low": df.low, "close": df.close,
                      "ap": ap, "sd": sd, "row": np.arange(len(df)), "day": df.day,
                      "nym": df.nym, "lonm": df.lonm})
    b = x.groupby("k", sort=True).agg(open=("open", "first"), high=("high", "max"), low=("low", "min"),
                                      close=("close", "last"), ap=("ap", "last"), sd=("sd", "last"),
                                      lastrow=("row", "last"), day=("day", "first"),
                                      endnym=("nym", "last"), endlonm=("lonm", "last"))
    b["endnym"] += 1; b["endlonm"] += 1        # bar END time = last minute start + 1
    return b.reset_index()

def ema(x, n): return pd.Series(x).ewm(span=n, adjust=False).mean().values
def atr(b, n=14):
    pc = b.close.shift(1)
    tr = np.maximum(b.high - b.low, np.maximum((b.high - pc).abs(), (b.low - pc).abs()))
    return tr.ewm(alpha=1 / n, adjust=False).mean().values
