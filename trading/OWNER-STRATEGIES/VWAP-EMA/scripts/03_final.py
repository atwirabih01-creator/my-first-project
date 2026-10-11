"""Final four picks: detailed stats, per-year long/short, news days, trade lists for the owner."""
import sys, os, importlib.util, numpy as np, pandas as pd
sys.path.insert(0, os.path.dirname(__file__))
from vwlib import *
spec = importlib.util.spec_from_file_location("bt", os.path.join(os.path.dirname(__file__), "02_backtest.py"))
bt = importlib.util.module_from_spec(spec); spec.loader.exec_module(bt)
sys.path.insert(0, os.path.join(ROOT, "trading", "EURUSD", "research"))
from news_calendar import EVENTS
news = {}
for d, hm, tz, lab in EVENTS:
    if lab in ("NFP", "US CPI", "FOMC"): news.setdefault(pd.Timestamp(d), []).append(lab)

PICKS = {"NASDAQ": ("NY0930", "R15E"), "XAUUSD": ("NY0800", "P15E1"), "GBPUSD": ("LON0800", "M15"), "EURUSD": ("LON0800", "M30")}
PRICE_DEC = {"NASDAQ": 2, "XAUUSD": 2, "GBPUSD": 5, "EURUSD": 5}
OUT = os.path.join(os.path.dirname(__file__), "..")
lines = []
for mkt in (sys.argv[1:] or PICKS):
    sess, vid = PICKS[mkt]
    t, sk = bt.run(mkt, sess, vid)
    s = bt.summarize(t, f"{mkt}_{sess}_{vid}", sk)
    eq = t.R_net.cumsum(); dd = (eq.cummax().clip(lower=0) - eq).max()
    py = t.pivot_table(index="year", columns="dir", values="R_net", aggfunc="sum").fillna(0)
    py["total_net"] = t.groupby("year").R_net.sum(); py["gross"] = t.groupby("year").R_gross.sum()
    py["net_2x"] = t.groupby("year").R_net2.sum(); py["trades"] = t.groupby("year").size()
    py["win%"] = t.groupby("year").R_net.apply(lambda r: (r > 0).mean() * 100)
    t["news"] = t.day.map(lambda d: "+".join(news.get(pd.Timestamp(d), [])) or "")
    cal = t[(t.day >= "2024-10-01") & (t.day <= "2026-06-30")]
    nw = cal.groupby(cal.news.ne("")).R_net.agg(["count", "sum", "mean"])
    t["dow"] = pd.to_datetime(t.day).dt.day_name()
    dow = t.groupby("dow").R_net.agg(["count", "sum", "mean"])
    why = t.groupby("why").R_net.agg(["count", "sum"])
    lines += [f"\n===== {mkt} {sess} {vid} =====", pd.Series(s).to_string(), f"max drawdown (R): {dd:.1f}",
              "per year (R with costs; long/short split):", py.round(2).to_string(),
              "Oct2024-Jun2026: news day (True) vs other days:", nw.round(3).to_string(),
              "day of week:", dow.round(3).to_string(), "exit reason:", why.round(2).to_string()]
    dec = PRICE_DEC[mkt]
    o = pd.DataFrame({"date": pd.to_datetime(t.day).dt.date, "direction": t.dir,
                      "entry_time_NY": pd.to_datetime(t.entry_ny).dt.strftime("%H:%M"),
                      "entry_time_Doha": pd.to_datetime(t.entry_doha).dt.strftime("%H:%M"),
                      "exit_time_NY": pd.to_datetime(t.exit_ny).dt.strftime("%H:%M"),
                      "exit_time_Doha": pd.to_datetime(t.exit_doha).dt.strftime("%H:%M"),
                      "entry_price": t.entry.round(dec), "stop_price": t.stop.round(dec),
                      "target_price": t.target.astype(float).round(dec), "exit_price": t.exit.round(dec),
                      "exit_reason": t.why, "R_before_cost": t.R_gross.round(3), "R_after_cost": t.R_net.round(3),
                      "R_double_cost": t.R_net2.round(3), "us_news_day": t.news})
    o.to_csv(os.path.join(OUT, f"trades_{mkt}.csv"), index=False)
    wk = t.assign(week=pd.to_datetime(t.day).dt.to_period("W-SUN").astype(str)).groupby("week").agg(
        trades=("R_net", "size"), R_before_cost=("R_gross", "sum"), R_after_cost=("R_net", "sum")).round(2)
    wk.to_csv(os.path.join(OUT, "outputs", f"weekly_{mkt}.csv"))
txt = "\n".join(lines); print(txt)
open(os.path.join(OUT, "outputs", f"final_stats_{'_'.join(sys.argv[1:]) or 'all'}.txt"), "w").write(txt)
