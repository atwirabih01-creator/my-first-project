"""Download Binance USD-M perpetual futures history (free monthly files): funding rates + 1h prices.

  python3 fetch_futures.py          # into data_futures/<PERP>_funding.pkl and <PERP>_1h.pkl
Perp names differ for cheap meme coins (1000PEPEUSDT = 1000 PEPE); the spot pair is in PAIRS.
"""
import io, sys, zipfile, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import pandas as pd

HERE = Path(__file__).parent
OUT = HERE / "data_futures"
BASE = "https://data.binance.vision/data/futures/um/monthly"
# perp symbol: (spot symbol, units of the coin per perp unit)
PAIRS = {"DOGEUSDT": ("DOGEUSDT", 1), "1000SHIBUSDT": ("SHIBUSDT", 1000), "1000PEPEUSDT": ("PEPEUSDT", 1000),
         "WIFUSDT": ("WIFUSDT", 1), "1000BONKUSDT": ("BONKUSDT", 1000), "1000FLOKIUSDT": ("FLOKIUSDT", 1000),
         "PENGUUSDT": ("PENGUUSDT", 1), "TRUMPUSDT": ("TRUMPUSDT", 1), "BOMEUSDT": ("BOMEUSDT", 1),
         "NEIROUSDT": ("NEIROUSDT", 1), "TURBOUSDT": ("TURBOUSDT", 1), "MEMEUSDT": ("MEMEUSDT", 1),
         "PEOPLEUSDT": ("PEOPLEUSDT", 1), "ORDIUSDT": ("ORDIUSDT", 1), "PNUTUSDT": ("PNUTUSDT", 1),
         "BTCUSDT": ("BTCUSDT", 1), "ETHUSDT": ("ETHUSDT", 1), "SOLUSDT": ("SOLUSDT", 1), "XRPUSDT": ("XRPUSDT", 1),
         "BNBUSDT": ("BNBUSDT", 1), "ADAUSDT": ("ADAUSDT", 1), "AVAXUSDT": ("AVAXUSDT", 1), "LINKUSDT": ("LINKUSDT", 1),
         "DOTUSDT": ("DOTUSDT", 1), "LTCUSDT": ("LTCUSDT", 1), "NEARUSDT": ("NEARUSDT", 1), "SUIUSDT": ("SUIUSDT", 1),
         "APTUSDT": ("APTUSDT", 1), "ARBUSDT": ("ARBUSDT", 1), "OPUSDT": ("OPUSDT", 1), "INJUSDT": ("INJUSDT", 1),
         "TIAUSDT": ("TIAUSDT", 1), "SEIUSDT": ("SEIUSDT", 1), "FETUSDT": ("FETUSDT", 1), "WLDUSDT": ("WLDUSDT", 1),
         "JUPUSDT": ("JUPUSDT", 1), "HBARUSDT": ("HBARUSDT", 1), "TRXUSDT": ("TRXUSDT", 1), "ENAUSDT": ("ENAUSDT", 1)}
MONTHS = [f"{y}-{m:02d}" for y in (2023, 2024, 2025, 2026) for m in range(1, 13)
          if "2023-10" <= f"{y}-{m:02d}" <= "2026-09"]


def get_zip(url):
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            z = zipfile.ZipFile(io.BytesIO(r.read()))
        return pd.read_csv(z.open(z.namelist()[0]), header=None)
    except Exception:
        return None


def one(perp):
    fund, kl = [], []
    for m in MONTHS:
        f = get_zip(f"{BASE}/fundingRate/{perp}/{perp}-fundingRate-{m}.zip")
        if f is not None:
            fund.append(f)
        k = get_zip(f"{BASE}/klines/{perp}/1h/{perp}-1h-{m}.zip")
        if k is not None:
            kl.append(k)
    if not fund or not kl:
        return perp, 0
    f = pd.concat(fund)
    f = f[pd.to_numeric(f[0], errors="coerce").notna()]               # drop header rows if present
    f = pd.DataFrame({"time": pd.to_datetime(f[0].astype("int64"), unit="ms", utc=True),
                      "rate": f[2].astype(float)}).set_index("time").sort_index()
    k = pd.concat(kl)
    k = k[pd.to_numeric(k[0], errors="coerce").notna()]
    k = pd.DataFrame({"time": pd.to_datetime(k[0].astype("int64"), unit="ms", utc=True),
                      "open": k[1].astype(float), "high": k[2].astype(float), "low": k[3].astype(float),
                      "close": k[4].astype(float), "quote_volume": k[7].astype(float)}).set_index("time").sort_index()
    f.to_pickle(OUT / f"{perp}_funding.pkl"); k.to_pickle(OUT / f"{perp}_1h.pkl")
    return perp, len(f)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    with ThreadPoolExecutor(8) as ex:
        for perp, n in ex.map(one, PAIRS):
            print(perp, n, flush=True)
