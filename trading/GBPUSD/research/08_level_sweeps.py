"""Same fixed trade template applied to different 'liquidity levels', to see whether ANY level gives
a sweep-and-reclaim edge. Template (fixed, not tuned): M15 bar on the London clock trades beyond the
level and CLOSES back on the other side -> enter at that close against the sweep; stop = sweep extreme
+2 pips; target = 2R; forced exit 12:00 NY; 1 trade per level type per day.
Window for signals: 07:00-12:00 London (for Asia/PD levels) and 08:00-11:00 NY (London levels).
Number of variants tried here is printed so the multiple-testing risk is visible."""
from common import *
from levels import day_table
import importlib
ic = importlib.import_module("05_idea_checks")

cd, D, COST = ic.cd, ic.D, ic.COST
news = ic.news

def sweep_level(level_fn, win, exit_ny=720, tf=15, rr=2.0, sides=("hi", "lo")):
    out = []
    for tday, g in D.groupby("tday"):
        d = cd.loc[tday]
        levels = level_fn(d, g)
        if levels is None: continue
        H, Lw = levels
        bars = ic.resample(g, tf)
        hh, ll = -1e9, 1e9; sh = sl = False
        for t, b in bars.iterrows():
            ok = win(t, tf)
            if ok == "stop": break
            if not ok: continue
            hh = max(hh, b.high); ll = min(ll, b.low)
            if "hi" in sides and H is not None and b.high > H: sh = True
            if "lo" in sides and Lw is not None and b.low < Lw: sl = True
            sig = None
            if sh and b.close < H: sig, stop = -1, hh + 2 * PIP
            elif sl and b.close > Lw: sig, stop = 1, ll - 2 * PIP
            if sig is None: continue
            entry = b.close; risk = abs(entry - stop) / PIP
            tp = entry + sig * rr * risk * PIP
            r, why = ic.run_trade(g, t + pd.Timedelta(minutes=tf), sig, entry, stop, tp, exit_ny)
            out.append(dict(tday=tday, side=sig, risk=risk, rr=rr, R=r - COST / risk, why=why, news=tday in news))
            break
    return pd.DataFrame(out)

ldn_win = lambda t, tf: "stop" if t.hour * 60 + t.minute + tf > 720 else (t.hour * 60 + t.minute >= 420)
def ny_win(t, tf):
    n = t.tz_convert("America/New_York"); m = n.hour * 60 + n.minute
    if n.hour >= 17 or m < 480: return False  # London-midnight start is still the previous NY evening
    return "stop" if m + tf > 660 else True

def asia(d, g): return d.ah, d.al
def pd_lv(d, g): return d.pdh, d.pdl
def both(d, g):  # level that is BOTH beyond Asia and previous-day: the further of the two
    return max(d.ah, d.pdh), min(d.al, d.pdl)
def ldn_lv(d, g):
    x = g[g.ldn_today & (g.ldn_min >= 480) & (g.ny_min < 480)]
    return (x.high.max(), x.low.min()) if len(x) else None

if __name__ == "__main__":
  tests = [("Asia H/L, London window", asia, ldn_win, 720), ("Prev-day H/L, London window", pd_lv, ldn_win, 720),
         ("Asia AND prev-day (outer level), London window", both, ldn_win, 720),
           ("London H/L, NY window 08-11 NY", ldn_lv, ny_win, 960), ("Prev-day H/L, NY window 08-11 NY", pd_lv, ny_win, 960)]
  for name, fn, w, ex in tests:
    T = sweep_level(fn, w, exit_ny=ex)
    ic.summary(name, T)
  print(f"\nvariants tried in this script: {len(tests)}")
