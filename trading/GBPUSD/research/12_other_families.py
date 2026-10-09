"""Round 2: other simple, well-known idea families, ONE fixed setting each (no tuning), per design year.
F1 Asia false break in London (fade, M15 close back inside, stop beyond extreme +2, target 2R, exit 12:00 NY)
F2 Asia breakout in London (M15 close outside, stop Asia middle, target 2R, exit 12:00 NY)
F3 London opening-range breakout: range 08:00-09:00 London; first M15 close outside until 12:00 London;
   stop other side of the range; target 2R; exit 12:00 NY
F4 NY opening-range breakout: range 08:00-09:00 NY; first M15 close outside until 11:00 NY;
   stop other side of the range; target 2R; exit 16:00 NY"""
import importlib
from common import *
ic = importlib.import_module("05_idea_checks")
v2 = importlib.import_module("11_v2_check")


def to_v2(T, cost_used=1.5):
    # convert 05-style (R after 1.5 cost) into gross pips for v2.report
    T = T.copy(); T["gross"] = T.R * T.risk + cost_used; T["year"] = year_of(T.tday); return T


def orb(clock, r0, r1, sig_end, exit_ny, rr=2.0):
    out = []
    for tday, d in v2.cd.iterrows():
        g = v2.G[tday]; g = g[g.ldn_today]
        col = "ldn" if clock == "L" else "ny"
        x = g.set_index(col)[["open", "high", "low", "close"]]
        mins = x.index.hour * 60 + x.index.minute
        rng = x[(mins >= r0) & (mins < r1)]
        if len(rng) < 50: continue
        H, L = rng.high.max(), rng.low.min()
        bars = x[(mins >= r1) & (mins < 17 * 60)].resample("15min").agg({"open": "first", "high": "max", "low": "min", "close": "last"}).dropna()
        for t, b in bars.iterrows():
            m = t.hour * 60 + t.minute
            if m + 15 > sig_end or m < r1: break
            sig = 1 if b.close > H else (-1 if b.close < L else None)
            if sig is None: continue
            entry = b.close; stop = L if sig == 1 else H
            risk = abs(entry - stop)
            tt = (t + pd.Timedelta(minutes=15)).tz_convert("America/New_York")
            pnl, why = v2.walk(g, tt, sig, entry, stop, entry + sig * rr * risk, exit_ny)
            out.append(dict(tday=tday, side=sig, risk=risk / PIP, gross=pnl / PIP, why=why))
            break
    T = pd.DataFrame(out); T["year"] = year_of(T.tday); return T


if __name__ == "__main__":
    import sys
    if "F4" in sys.argv:
        v2.report("F4 NY opening-range breakout", orb("N", 480, 540, 660, 960)); sys.exit()
    v2.report("F1 Asia false break, London, 2R", to_v2(ic.sweep_reversal(15, "2R")))
    v2.report("F2 Asia breakout, London, 2R", to_v2(ic.breakout(15, rr=2.0)))
    v2.report("F3 London opening-range breakout", orb("L", 480, 540, 720, 720))
    v2.report("F4 NY opening-range breakout", orb("N", 480, 540, 660, 960))
