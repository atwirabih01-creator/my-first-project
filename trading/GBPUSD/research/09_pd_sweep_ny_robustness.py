"""Robustness of the best-looking candidate (previous-day high/low false break in the NY morning).
The base setting (M15, 2R, signals 08:00-11:00 NY, exit 16:00 NY) was fixed BEFORE this check
(it is the same template as in 08_level_sweeps.py). Here we only look at neighbours, to see whether
the result is a lucky knife-edge. We do NOT pick the best neighbour."""
from common import *
import importlib
ic = importlib.import_module("05_idea_checks")
ls = importlib.import_module("08_level_sweeps")

def ny_win_end(end):
    def w(t, tf):
        n = t.tz_convert("America/New_York"); m = n.hour * 60 + n.minute
        if n.hour >= 17 or m < 480: return False
        return "stop" if m + tf > end else True
    return w

base = ls.sweep_level(ls.pd_lv, ny_win_end(660), exit_ny=960, tf=15, rr=2.0)
ic.summary("BASE M15 2R window 08-11 NY exit 16:00 NY", base)
print("exits:", base.why.value_counts().to_dict())
base["m"] = base.tday.dt.to_period("M")
print(base.groupby("m").R.agg(["size", "sum"]).round(1).T.to_string())
print("by side:", base.groupby("side").R.agg(["size", "sum"]).round(1).to_dict())
print("non-news only:", round(base[~base.news].R.sum(), 1), "R on", (~base.news).sum())
print("\nNeighbours (one change at a time):")
for name, kw, end in [("tf M5", dict(tf=5), 660), ("tf M30", dict(tf=30), 660), ("RR 1.5", dict(rr=1.5), 660),
                      ("RR 3", dict(rr=3.0), 660), ("window to 12:00 NY", {}, 720), ("window to 10:00 NY", {}, 600),
                      ("exit 12:00 NY", dict(exit_ny=720), 660)]:
    k = dict(tf=15, rr=2.0, exit_ny=960); k.update(kw)
    T = ls.sweep_level(ls.pd_lv, ny_win_end(end), **k)
    ic.summary("  " + name, T)
base.to_csv("out_09_base_trades.csv", index=False)
