"""Round 1 idea tests for gold. ALL variants below were written down BEFORE any of them was run.
Fill model / costs: see sim.py. Results per design year, at 0.40 and 0.80 USD cost.

M1  Intraday momentum 10:00 NY: direction = sign(close of 09:59 NY bar - day open (18:00 NY)). Enter at that close.
    Stop 0.5 x ATR14. No target. Forced close 16:00 NY (close of 15:59 bar). 1 trade/day.
M2  Overnight trend into NY: direction = sign(close of 07:59 NY bar - day open). Enter at that close.
    Stop 0.5 x ATR14. No target. Forced close 16:00 NY.
A1  Asia breakout continuation: first 15-min candle (07:00 London -> 12:00 NY) that CLOSES beyond the Asia range
    (00:00-07:00 London). Enter at close in the break direction. Stop = Asia middle. Target 2R. Forced close 16:00 NY.
A2  Asia false break (GBPUSD F1 on gold): a 15-min candle in 07:00-12:00 London trades beyond an Asia side and closes back
    inside -> enter the other way; stop = extreme since 07:00 London +/- 0.02 x ATR; target 2R; forced close 16:00 NY.
P1  Previous-day false break in NY (GBPUSD v1 on gold): 15-min candles 08:00-11:00 NY; wick beyond PDH/PDL then close
    back inside -> fade; stop = window extreme +/- 0.02 x ATR; target 2R; forced close 16:00 NY.
O1  NY opening-range breakout: range = 08:00-09:00 NY high/low. First 5-min candle that closes beyond it (09:00-12:00 NY)
    -> enter in the break direction. Stop = opposite side of the range. Target 1R. Forced close 16:00 NY.
O2  Same as O1 but the range is 09:30-10:00 NY (US stock open), signals 10:00-12:00 NY.
"""
import sys
from sim import *

ALL_LINES = []


def run_momentum(sig_min, stop_x=0.5, target_r=None, close_min=960, name=""):
    out = []
    for t, r in TRADE_DAYS.iterrows():
        d = G[t]; nm = d["nymin"]
        i = np.where(nm == sig_min - 1)[0]
        if not len(i): continue
        i = i[0]; entry = d["c"][i]
        side = 1 if entry > r.open else -1 if entry < r.open else 0
        if side == 0: continue
        risk = stop_x * r.atr14
        stop = entry - side * risk
        tgt = entry + side * target_r * risk if target_r else None
        g, why = walk(d, i + 1, side, entry, stop, tgt, close_min)
        out.append(dict(tday=t, side=side, risk=risk, gross=g, why=why))
    return report(name, pd.DataFrame(out))


def run_asia_break(name):
    out = []
    for t, r in TRADE_DAYS.iterrows():
        d = G[t]; nm = d["nymin"]
        mask = d["ldn_today"] & (d["ldnmin"] >= 420) & ~((nm >= 720))
        for (i, o, h, l, c, m) in bars(d, 15, mask & (nm >= 0)) if False else _bars15_ldn(d, mask):
            side = 1 if c > r.ah else -1 if c < r.al else 0
            if side == 0: continue
            mid = (r.ah + r.al) / 2; risk = abs(c - mid)
            if risk <= 0: break
            g, why = walk(d, i + 1, side, c, mid, c + side * 2 * risk)
            out.append(dict(tday=t, side=side, risk=risk, gross=g, why=why)); break
    return report(name, pd.DataFrame(out))


def _bars15_ldn(d, mask):
    """15-min candles on the London clock for bars in mask (London-clock alignment = NY alignment for 15 min)."""
    idx = np.where(mask)[0]; out = []
    if not len(idx): return out
    key = (d["ldnmin"][idx] // 15) + np.where(d["nymin"][idx] >= 0, 0, 0)
    # keys can repeat only across midnight; mask is within one London date so they are unique
    for k in np.unique(key):
        ii = idx[key == k]
        out.append((ii[-1], d["o"][ii[0]], d["h"][ii].max(), d["l"][ii].min(), d["c"][ii[-1]], int(k * 15)))
    return out


def run_asia_false(name):
    out = []
    for t, r in TRADE_DAYS.iterrows():
        d = G[t]
        mask = d["ldn_today"] & (d["ldnmin"] >= 420) & (d["ldnmin"] < 720)
        hh, ll = -1e18, 1e18; sh = sl = False
        for (i, o, h, l, c, m) in _bars15_ldn(d, mask):
            hh = max(hh, h); ll = min(ll, l); sh |= h > r.ah; sl |= l < r.al
            sig = None
            if sh and c < r.ah: sig, stop = -1, hh + 0.02 * r.atr14
            elif sl and c > r.al: sig, stop = 1, ll - 0.02 * r.atr14
            if sig is None: continue
            risk = abs(c - stop)
            g, why = walk(d, i + 1, sig, c, stop, c + sig * 2 * risk)
            out.append(dict(tday=t, side=sig, risk=risk, gross=g, why=why)); break
    return report(name, pd.DataFrame(out))


def run_pd_false(name):
    out = []
    for t, r in TRADE_DAYS.iterrows():
        d = G[t]; nm = d["nymin"]
        hh, ll = -1e18, 1e18; sh = sl = False
        for (i, o, h, l, c, m) in bars(d, 15, (nm >= 480) & (nm < 660)):
            hh = max(hh, h); ll = min(ll, l); sh |= h > r.pdh; sl |= l < r.pdl
            sig = None
            if sh and c < r.pdh: sig, stop = -1, hh + 0.02 * r.atr14
            elif sl and c > r.pdl: sig, stop = 1, ll - 0.02 * r.atr14
            if sig is None: continue
            risk = abs(c - stop)
            g, why = walk(d, i + 1, sig, c, stop, c + sig * 2 * risk)
            out.append(dict(tday=t, side=sig, risk=risk, gross=g, why=why)); break
    return report(name, pd.DataFrame(out))


def run_orb(name, r0, r1, sig_end=720, target_r=1.0):
    out = []
    for t, r in TRADE_DAYS.iterrows():
        d = G[t]; nm = d["nymin"]
        rm = (nm >= r0) & (nm < r1)
        if rm.sum() < (r1 - r0) * 0.8: continue
        H, L = d["h"][rm].max(), d["l"][rm].min()
        for (i, o, h, l, c, m) in bars(d, 5, (nm >= r1) & (nm < sig_end)):
            side = 1 if c > H else -1 if c < L else 0
            if side == 0: continue
            stop = L if side == 1 else H; risk = abs(c - stop)
            g, why = walk(d, i + 1, side, c, stop, c + side * target_r * risk)
            out.append(dict(tday=t, side=side, risk=risk, gross=g, why=why)); break
    return report(name, pd.DataFrame(out))


if __name__ == "__main__":
    run_momentum(600, name="M1 momentum at 10:00 NY, stop 0.5 ATR, exit 16:00")
    run_momentum(480, name="M2 overnight trend at 08:00 NY, stop 0.5 ATR, exit 16:00")
    run_asia_break("A1 Asia breakout continuation, stop Asia middle, 2R")
    run_asia_false("A2 Asia false break in London, 2R")
    run_pd_false("P1 PDH/PDL false break 08-11 NY, 2R")
    run_orb("O1 NY ORB 08:00-09:00, 1R", 480, 540)
    run_orb("O2 NY ORB 09:30-10:00, 1R", 570, 600)
