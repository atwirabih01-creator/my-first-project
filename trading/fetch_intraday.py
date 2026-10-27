"""Download intraday spot history (1m and 5m bars) from Binance's public monthly archive.

  5m: Jan 2024 - Sep 2026      1m: Jan 2025 - Sep 2026      (40 scanner coins, universe.py)
Saved as data_intraday/<SYMBOL>_<interval>.pkl. Study split (fixed before any result):
  design = everything before 2026-01-01, sealed exam = Jan-Sep 2026, live = from Oct 2026.

  python3 fetch_intraday.py
"""
import io, sys, zipfile, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import pandas as pd
from universe import MEMES, MAJORS

HERE = Path(__file__).parent
OUT = HERE / "data_intraday"
BASE = "https://data.binance.vision/data/spot/monthly/klines"
MONTHS = {"5m": [f"{y}-{m:02d}" for y in (2024, 2025, 2026) for m in range(1, 13) if (y, m) <= (2026, 9)],
          "1m": [f"{y}-{m:02d}" for y in (2025, 2026) for m in range(1, 13) if (y, m) <= (2026, 9)]}


def get(sym, iv, m):
    url = f"{BASE}/{sym}/{iv}/{sym}-{iv}-{m}.zip"
    for _ in range(3):
        try:
            with urllib.request.urlopen(url, timeout=120) as r:
                z = zipfile.ZipFile(io.BytesIO(r.read()))
            return pd.read_csv(z.open(z.namelist()[0]), header=None, usecols=[0, 1, 2, 3, 4, 7, 10])
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
        except Exception:
            pass
    return None


def one(job):
    sym, iv = job
    path = OUT / f"{sym}_{iv}.pkl"
    if path.exists():
        return sym, iv, "cached"
    parts = [p for p in (get(sym, iv, m) for m in MONTHS[iv]) if p is not None]
    if not parts:
        return sym, iv, 0
    k = pd.concat(parts)
    k = k[pd.to_numeric(k[0], errors="coerce").notna()]
    t = k[0].astype("int64")
    t = t.where(t < 1e14, t // 1000)                  # archive switched to microseconds in 2025
    df = pd.DataFrame({"open": k[1].astype(float).values, "high": k[2].astype(float).values,
                       "low": k[3].astype(float).values, "close": k[4].astype(float).values,
                       "quote_volume": k[7].astype(float).values, "taker_buy_quote": k[10].astype(float).values},
                      index=pd.to_datetime(t.values, unit="ms", utc=True))
    df = df[~df.index.duplicated()].sort_index()
    df.to_pickle(path)
    return sym, iv, len(df)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    ivs = sys.argv[1:] or ["5m", "1m"]
    jobs = [(s, iv) for iv in ivs for s in MEMES + MAJORS]
    with ThreadPoolExecutor(8) as ex:
        for sym, iv, n in ex.map(one, jobs):
            print(sym, iv, n, flush=True)
