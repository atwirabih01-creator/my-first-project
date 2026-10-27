"""Download Binance USDT-M futures 'metrics' (5-minute open interest + long/short ratios), free public archive.

Columns per 5 minutes: open interest (coins and USD), top traders' long/short ratio (accounts and positions),
all traders' long/short account ratio, takers' buy/sell volume ratio.
Jan 2024 - Sep 2026, for the scanner coins that have a perpetual. Saved as data_metrics/<SPOT>.pkl
(indexed by time; RENDER/1000SATS have no mapped perp and are skipped).

  python3 fetch_metrics.py
"""
import io, zipfile, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import pandas as pd
from fetch_futures import PAIRS
from universe import MEMES, MAJORS

HERE = Path(__file__).parent
OUT = HERE / "data_metrics"
BASE = "https://data.binance.vision/data/futures/um/daily/metrics"
DAYS = pd.date_range("2024-01-01", "2026-09-30", freq="D")
PERP = {s: p for p, (s, _) in PAIRS.items()}


def day(perp, d):
    url = f"{BASE}/{perp}/{perp}-metrics-{d:%Y-%m-%d}.zip"
    for _ in range(3):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                z = zipfile.ZipFile(io.BytesIO(r.read()))
            return pd.read_csv(z.open(z.namelist()[0]))
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
        except Exception:
            pass
    return None


def one(spot):
    path = OUT / f"{spot}.pkl"
    if path.exists() or spot not in PERP:
        return spot, "skip"
    perp = PERP[spot]
    with ThreadPoolExecutor(12) as ex:
        parts = [p for p in ex.map(lambda d: day(perp, d), DAYS) if p is not None]
    if not parts:
        return spot, 0
    m = pd.concat(parts)
    m.index = pd.to_datetime(m.create_time, utc=True)
    m = m.drop(columns=["create_time", "symbol"]).apply(pd.to_numeric, errors="coerce")
    m = m[~m.index.duplicated()].sort_index()
    m.to_pickle(path)
    return spot, len(m)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for s in MEMES + MAJORS:
        print(*one(s), flush=True)
