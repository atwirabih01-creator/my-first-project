"""Download hourly price history from Binance's public data service (no account needed)."""
import json, sys, time, urllib.request
from pathlib import Path
import pandas as pd

BASE = "https://data-api.binance.vision/api/v3/klines"
DATA = Path(__file__).parent / "data"

# Meme coins, large crypto, plus EUR/USD (EURUSDT) and gold (PAXG) as forex/CFD stand-ins.
SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT",
           "DOGEUSDT", "SHIBUSDT", "PEPEUSDT", "WIFUSDT", "BONKUSDT", "FLOKIUSDT",
           "EURUSDT", "PAXGUSDT"]
COLS = ["open_time", "open", "high", "low", "close", "volume", "close_time",
        "quote_volume", "trades", "taker_buy_base", "taker_buy_quote", "ignore"]


def fetch(symbol, start_ms, end_ms, interval="1h"):
    rows, cur = [], start_ms
    while cur < end_ms:
        url = f"{BASE}?symbol={symbol}&interval={interval}&startTime={cur}&limit=1000"
        for attempt in range(5):
            try:
                with urllib.request.urlopen(url, timeout=30) as r:
                    batch = json.load(r)
                break
            except Exception as e:
                time.sleep(2 ** attempt)
        else:
            raise RuntimeError(f"failed {symbol}")
        if not batch:
            break
        rows += batch
        cur = batch[-1][0] + 1
        time.sleep(0.1)
    df = pd.DataFrame(rows, columns=COLS).drop(columns="ignore")
    for c in COLS[1:6] + ["quote_volume", "taker_buy_base", "taker_buy_quote"]:
        df[c] = df[c].astype(float)
    df["time"] = pd.to_datetime(df["open_time"], unit="ms", utc=True)
    return df.set_index("time")[["open", "high", "low", "close", "volume", "quote_volume", "trades", "taker_buy_base"]]


if __name__ == "__main__":
    DATA.mkdir(exist_ok=True)
    end = int(time.time() * 1000)
    start = end - int(sys.argv[1] if len(sys.argv) > 1 else 3 * 365) * 86400 * 1000
    for s in SYMBOLS:
        df = fetch(s, start, end)
        df.to_pickle(DATA / f"{s}.pkl")
        print(s, len(df), df.index[0], df.index[-1], flush=True)
