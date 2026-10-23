"""Download 3 years of Binance funding history for every perp that has a Binance spot pair (funding only).
  python3 fetch_funding_all.py PAIRS_JSON      -> data_futures_all/<PERP>_funding.pkl
"""
import json, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import pandas as pd
from fetch_futures import get_zip, MONTHS, BASE

OUT = Path(__file__).parent / "data_futures_all"


def one(perp):
    if (OUT / f"{perp}_funding.pkl").exists():
        return perp, -1
    parts = [f for m in MONTHS if (f := get_zip(f"{BASE}/fundingRate/{perp}/{perp}-fundingRate-{m}.zip")) is not None]
    if not parts:
        return perp, 0
    f = pd.concat(parts)
    f = f[pd.to_numeric(f[0], errors="coerce").notna()]
    s = pd.DataFrame({"time": pd.to_datetime(f[0].astype("int64"), unit="ms", utc=True), "rate": f[2].astype(float)})
    s.set_index("time").sort_index().to_pickle(OUT / f"{perp}_funding.pkl")
    return perp, len(s)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    pairs = json.load(open(sys.argv[1]))
    with ThreadPoolExecutor(16) as ex:
        for perp, n in ex.map(one, pairs):
            print(perp, n, flush=True)
