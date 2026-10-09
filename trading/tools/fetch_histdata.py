"""Download free 1-minute price history from HistData.com and save it as one clean file.

Usage:  python3 trading/tools/fetch_histdata.py GBPUSD 2025-10 2026-09
Output: trading/data/<SYMBOL>_M1.csv.gz with columns
        time_utc, open, high, low, close  (bid prices, one row per minute)

HistData's notes say its bars are in EST without daylight saving, but checking against
a UTC reference (Dukascopy) and the US stock-open spike at 09:30 New York time shows the
stamps actually follow New York local time WITH summer time. So we convert from
America/New_York to UTC (UTC-5 in winter, UTC-4 in summer). Symbols: GBPUSD, EURUSD, XAUUSD, NSXUSD (Nasdaq 100).
"""
import io, re, sys, time, zipfile, http.cookiejar, urllib.parse, urllib.request
from pathlib import Path
import pandas as pd

BASE = "https://www.histdata.com"
OUT = Path(__file__).resolve().parents[1] / "data"


def months(start, end):
    y, m = map(int, start.split("-")); ey, em = map(int, end.split("-"))
    while (y, m) <= (ey, em):
        yield y, m
        y, m = (y + 1, 1) if m == 12 else (y, m + 1)


def fetch_month(opener, sym, y, m):
    page = f"{BASE}/download-free-forex-historical-data/?/ascii/1-minute-bar-quotes/{sym.lower()}/{y}/{m}"
    html = opener.open(page, timeout=60).read().decode("utf-8", "ignore")
    tk = re.search(r'id="tk" value="([^"]+)"', html)
    if not tk:
        raise RuntimeError(f"no download token for {sym} {y}-{m:02d}")
    form = dict(tk=tk.group(1), date=str(y), datemonth=f"{y}{m:02d}",
                platform="ASCII", timeframe="M1", fxpair=sym)
    req = urllib.request.Request(f"{BASE}/get.php", data=urllib.parse.urlencode(form).encode(),
                                 headers={"Referer": page})
    zf = zipfile.ZipFile(io.BytesIO(opener.open(req, timeout=120).read()))
    name = next(n for n in zf.namelist() if n.endswith(".csv"))
    df = pd.read_csv(zf.open(name), sep=";", header=None,
                     names=["t", "open", "high", "low", "close", "vol"])
    local = pd.to_datetime(df["t"], format="%Y%m%d %H%M%S")
    df["time_utc"] = (local.dt.tz_localize("America/New_York", ambiguous=False,
                                           nonexistent="shift_forward")
                      .dt.tz_convert("UTC").dt.tz_localize(None))
    return df[["time_utc", "open", "high", "low", "close"]]


def main(sym, start, end):
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    parts = []
    for y, m in months(start, end):
        for attempt in range(4):
            try:
                df = fetch_month(opener, sym, y, m)
                print(f"{sym} {y}-{m:02d}: {len(df)} bars")
                parts.append(df)
                break
            except Exception as e:
                print(f"{sym} {y}-{m:02d}: attempt {attempt + 1} failed ({e})")
                time.sleep(2 ** (attempt + 1))
        time.sleep(1)
    data = pd.concat(parts).drop_duplicates("time_utc").sort_values("time_utc")
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"{sym}_M1.csv.gz"
    data.to_csv(path, index=False)
    print(f"saved {len(data)} bars, {data.time_utc.min()} -> {data.time_utc.max()} UTC, to {path}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
