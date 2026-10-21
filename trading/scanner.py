"""Cheap scanner: checks ~40 liquid coins (meme coins first) and lists real candidates for the agents.

Runs in seconds and needs no AI. The three agents only meet when this finds something.
  python3 scanner.py            # scan now; appends to journal/candidates.csv, writes journal/latest_scan.json

Situations it looks for (on finished 4-hour bars, plus 1-hour bars for spikes):
  hold     - uptrend (or downtrend), price dipped to its 20-bar 4h average and closed back on the trend side
  dip      - the coded dip setup (RSI dip then recovery) is firing
  breakout - new 4h high/low on a volume burst
  spike    - sudden 1h move on huge volume
Only coins with real trading volume, only in the direction of the overall market (Bitcoin's tide).
"""
import json, time, warnings
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import numpy as np
import pandas as pd
import fetch_data as F
import paper_lab as L
from agents import atlas, hawk, ema, rsi, atr
from check_setup import version
from gate import allowed

warnings.filterwarnings("ignore")
HERE = Path(__file__).parent
OUT = HERE / "journal" / "candidates.csv"
LATEST = HERE / "journal" / "latest_scan.json"

from universe import MEMES, MAJORS
MIN_DAILY_VOLUME = 5e6          # dollars traded in the last 24h


def get(sym):
    end = int(time.time() * 1000)
    try:
        return sym, F.fetch(sym, end - 60 * 86400 * 1000, end).iloc[:-1]      # drop the hour still forming
    except Exception:
        return sym, None


def scan():
    with ThreadPoolExecutor(8) as ex:
        data = {s: d for s, d in ex.map(get, MEMES + MAJORS) if d is not None and len(d) > 500}
    btc1 = data["BTCUSDT"]
    btc4 = L.bars(btc1, 4)
    tide = 1 if btc4.close.iloc[-1] > ema(btc4.close, 50).iloc[-1] else -1     # overall market direction
    now = pd.Timestamp.now(tz="UTC").floor("min")
    rows = []
    for sym, d1 in data.items():
        if d1.quote_volume.iloc[-24:].sum() < MIN_DAILY_VOLUME:
            continue
        d4 = L.bars(d1, 4)
        if len(d4) and d4.index[-1] + pd.Timedelta(hours=4) > d1.index[-1] + pd.Timedelta(hours=1):
            d4 = d4.iloc[:-1]                                   # use only finished 4-hour bars
        c = d4.close
        e20, e50, a4, r4 = ema(c, 20), ema(c, 50), atr(d4), rsi(c)
        trend = 1 if (c.iloc[-1] > e50.iloc[-1] and e20.iloc[-1] > e50.iloc[-1]) else (
            -1 if (c.iloc[-1] < e50.iloc[-1] and e20.iloc[-1] < e50.iloc[-1]) else 0)
        found = []
        # hold: touched the 20-bar average within the last 2 bars and closed back on the trend side
        if trend:
            touched = ((d4.low.iloc[-2:] <= e20.iloc[-2:] + 0.3 * a4.iloc[-2:]).any() if trend > 0
                       else (d4.high.iloc[-2:] >= e20.iloc[-2:] - 0.3 * a4.iloc[-2:]).any())
            back = (c.iloc[-1] > e20.iloc[-1]) if trend > 0 else (c.iloc[-1] < e20.iloc[-1])
            if touched and back and 38 <= r4.iloc[-1] <= 62:
                found.append(("hold", trend))
        for setup in ["dip", "breakout"]:
            v = version(setup, "both")
            h = hawk(d4, v).hawk_sig.iloc[-1]
            if h:
                found.append((setup, int(h)))
        v = version("spike", "both")
        h = hawk(d1, v).hawk_sig.iloc[-1]
        if h:
            found.append(("spike", int(h)))
        flow = d1.taker_buy_base.iloc[-24:].sum() / d1.volume.iloc[-24:].sum()
        for situation, side in found:
            if sym != "BTCUSDT" and side != tide:
                continue                                        # don't fight the whole market
            versions = allowed(situation, "long" if side > 0 else "short", sym)
            if not versions:
                continue                                        # this kind of trade is a known loser
            rows.append({"scanned_utc": now, "bar_utc": d4.index[-1], "symbol": sym, "meme": sym in MEMES,
                         "side": "long" if side > 0 else "short", "situation": situation,
                         "price": float(c.iloc[-1]), "atr4h_pct": round(float(a4.iloc[-1] / c.iloc[-1] * 100), 2),
                         "trend": trend, "rsi4h": round(float(r4.iloc[-1]), 1), "buy_share_24h": round(float(flow), 3),
                         "vol24h_musd": round(float(d1.quote_volume.iloc[-24:].sum() / 1e6), 1),
                         "versions_allowed": " ".join(versions)})
    out = pd.DataFrame(rows)
    OUT.parent.mkdir(exist_ok=True)
    if len(out):
        out.to_csv(OUT, mode="a", header=not OUT.exists(), index=False)
    summary = {"scanned_utc": str(now), "coins_checked": len(data), "market_tide": "up" if tide > 0 else "down",
               "candidates": out.to_dict("records") if len(out) else []}
    LATEST.write_text(json.dumps(summary, indent=1, default=str))
    print(f"scanned {len(data)} coins, market tide {'up' if tide > 0 else 'down'}, candidates: {len(out)}")
    if len(out):
        print(out[["symbol", "side", "situation", "price", "atr4h_pct", "rsi4h", "buy_share_24h"]].to_string(index=False))


if __name__ == "__main__":
    scan()
