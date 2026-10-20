"""Desk: the three agents look at the latest live prices and vote. PAPER ONLY - places no orders.

Usage:  python3 live_desk.py [version]     (default: Q051, the Round 8 pick)
Each run appends every idea and each agent's vote to results/desk_log.csv.
"""
import json, sys, time
import numpy as np
import pandas as pd
import fetch_data as F
import paper_lab as L, round3 as R, round8 as R8
from agents import atlas, hawk, ema, Sage

pick = sys.argv[1] if len(sys.argv) > 1 else "Q051"
v = [x for x in R.R3 + R8.vs if x.name.startswith(pick)][0]
d, btc_hist = L.load()
for folder in ["data_fresh", "data_practice", "data_holdout_A", "data_holdout_B", "data_holdout_C"]:
    d.update(R.load_dir(L.HERE / folder))
past = L.build(d, btc_hist, v)
sage = Sage(v).fit(past, past.pnl > 0)                       # Sage studies every finished paper trade

end = int(time.time() * 1000); start = end - 150 * 86400 * 1000
live = {}
for s in d:
    try:
        live[s] = L.bars(F.fetch(s, start, end), v.bar_hours)
    except Exception as e:
        print("skip", s, e)
btc = live["BTCUSDT"]
rows = []
for sym, df in live.items():
    df = df.iloc[:-1]                                          # ignore the bar that is still forming
    if len(df) < 250:
        continue
    f = pd.concat([df, atlas(df, btc, v), hawk(df, v)], axis=1)
    f["stretch"] = (f["close"] - ema(f["close"], v.trend_fast)) / f["atr"]
    f["vol_pct"] = (f["atr"] / f["close"]).rank(pct=True)
    last = f.iloc[-1]
    side = int(last.hawk_sig)
    row = {"checked_at": pd.Timestamp.now(tz="UTC").floor("min"), "symbol": sym, "price": last.close,
           "atlas_score": round(last.atlas_score, 2), "hawk": {1: "BUY", -1: "SELL", 0: "wait"}[side]}
    if side:
        x = f.iloc[[-1]].assign(dir=side)
        atlas_yes = last.atlas_score * side >= v.atlas_min_score and (not v.need_btc_tide or sym == "BTCUSDT" or last.tide == side)
        p = float(sage.expected(x)[0] if v.sage_kind == "knn_ev" else sage.prob(x)[0])
        row.update({"atlas": "yes" if atlas_yes else "no", "sage_score": round(p, 4),
                    "sage": "yes" if bool(sage.approve(x)[0]) else "no",
                    "stop": round(last.close - side * v.stop_atr * last.atr, 8),
                    "target": round(last.close + side * v.target_atr * last.atr, 8)})
        row["TEAM_DECISION"] = "PAPER TRADE" if row["atlas"] == row["sage"] == "yes" else "no trade"
    else:
        row["TEAM_DECISION"] = "no trade"
    rows.append(row)

out = pd.DataFrame(rows)
print(f"Desk version: {pick}\n")
print(out.to_string(index=False))
log = L.OUT / "desk_log.csv"
out.to_csv(log, mode="a", header=not log.exists(), index=False)
