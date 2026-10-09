"""Download free 1-minute price history from HistData.com and save it as one clean file.

Usage:  python3 trading/tools/fetch_histdata.py GBPUSD 2025-10 2026-09
Output: trading/data/<SYMBOL>_M1.csv.gz with columns
        time_utc, open, high, low, close  (bid prices, one row per minute)

HistData's notes say its bars are in EST without daylight saving. Checking against a UTC
reference (Dukascopy) shows the clock is actually "London time minus 5 hours": UTC-5 in
winter, UTC-4 during UK summer time. (It is NOT New York time: in the weeks when the US is
on summer time and the UK is not, e.g. mid-March, New York time would be 1 hour off.)
So: UTC = (stamp + 5 hours) read as London local time. Symbols: GBPUSD, EURUSD, XAUUSD, NSXUSD (Nasdaq 100).
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


_year_cache = {}


def fetch_month(opener, sym, y, m):
    """Recent years are offered month by month; older, complete years only as one yearly file."""
    page = f"{BASE}/download-free-forex-historical-data/?/ascii/1-minute-bar-quotes/{sym.lower()}/{y}/{m}"
    html = opener.open(page, timeout=60).read().decode("utf-8", "ignore")
    if re.search(r'id="tk" value="([^"]+)"', html):
        return _download(opener, sym, page, html, str(y), f"{y}{m:02d}")
    if (sym, y) not in _year_cache:
        page = f"{BASE}/download-free-forex-historical-data/?/ascii/1-minute-bar-quotes/{sym.lower()}/{y}"
        html = opener.open(page, timeout=60).read().decode("utf-8", "ignore")
        _year_cache[(sym, y)] = _download(opener, sym, page, html, str(y), str(y))
    df = _year_cache[(sym, y)]
    return df[(df.time_utc.dt.year == y) & (df.time_utc.dt.month == m)]


def _download(opener, sym, page, html, date, datemonth):
    tk = re.search(r'id="tk" value="([^"]+)"', html)
    if not tk:
        raise RuntimeError(f"no download token for {sym} {datemonth}")
    form = dict(tk=tk.group(1), date=date, datemonth=datemonth,
                platform="ASCII", timeframe="M1", fxpair=sym)
    req = urllib.request.Request(f"{BASE}/get.php", data=urllib.parse.urlencode(form).encode(),
                                 headers={"Referer": page})
    zf = zipfile.ZipFile(io.BytesIO(opener.open(req, timeout=120).read()))
    name = next(n for n in zf.namelist() if n.endswith(".csv"))
    df = pd.read_csv(zf.open(name), sep=";", header=None,
                     names=["t", "open", "high", "low", "close", "vol"])
    london = pd.to_datetime(df["t"], format="%Y%m%d %H%M%S") + pd.Timedelta(hours=5)
    df["time_utc"] = (london.dt.tz_localize("Europe/London", ambiguous=False,
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
        else:
            sys.exit(f"{sym} {y}-{m:02d} could not be downloaded; existing file left unchanged")
        time.sleep(1)
    data = pd.concat(parts).drop_duplicates("time_utc").sort_values("time_utc")
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"{sym}_M1.csv.gz"
    data.to_csv(path, index=False)
    print(f"saved {len(data)} bars, {data.time_utc.min()} -> {data.time_utc.max()} UTC, to {path}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
