"""Round 3: month-by-month "walk-forward" paper trading, then a fresh final exam on 15 new markets.

Walk-forward = at the start of every month Sage re-studies every trade that had fully
finished before that day, then judges that month's ideas. This is how it would run live.
Versions are compared on the original 13 markets (Apr 2025 - Oct 2026).
The winner then trades 15 markets the team has never seen, over the same months.
"""
import json, sys
from pathlib import Path
import numpy as np
import pandas as pd
from agents import Version, Sage
import paper_lab as L

S = ("pullback", "breakout", "shock")
base = dict(setups=S, atlas_min_score=0.75, stop_atr=3.0, target_atr=1.0, min_target_pct=0.010, sage_kind="knn")
R3 = [
    Version("V25 V19 buy-only", **base),
    Version("V26 V19 buy-only + crash guard", **base, extra={"crash_guard": 0.03}),
    Version("V27 buy-only + crash guard, Sage 85%", **base, min_prob=0.85, extra={"crash_guard": 0.03}),
    Version("V28 buy-only + crash guard, pullback only", **{**base, "setups": ("pullback",)}, extra={"crash_guard": 0.03}),
    Version("V29 buy-only + crash guard, target 0.8 ATR", **{**base, "target_atr": 0.8}, extra={"crash_guard": 0.03}),
    Version("V30 buy-only + crash guard, stop 2.5", **{**base, "stop_atr": 2.5}, extra={"crash_guard": 0.03}),
    Version("V31 buy-only + crash guard, wider Sage memory", **base, knn_k=150, extra={"crash_guard": 0.03}),
    Version("V32 buy+sell, crash guard both ways", **base, allow_short=True, extra={"crash_guard": 0.03}),
    Version("V33 buy-only + crash guard, no tide rule", **base, need_btc_tide=False, extra={"crash_guard": 0.03}),
    Version("V34 buy-only + crash guard, hold 24h", **base, max_hold=24, extra={"crash_guard": 0.03}),
    Version("V35 buy-only, tight crash guard 2%", **base, extra={"crash_guard": 0.02}),
    Version("V36 buy-only + crash guard, researcher 0.6", **{**base, "atlas_min_score": 0.6}, extra={"crash_guard": 0.03}),
]


def walk(study_pool, judged, v, start, end):
    approved = []
    months = pd.date_range(start.normalize().replace(day=1), end, freq="MS")
    for m0, m1 in zip(months, list(months[1:]) + [end + pd.Timedelta(hours=1)]):
        part = judged[(judged.time >= max(m0, start)) & (judged.time < m1)]
        if part.empty:
            continue
        past = study_pool[study_pool.exit_time < m0]
        sage = Sage(v).fit(past, past.pnl > 0)
        approved.append(part[sage.approve(part)])
    ok = pd.concat(approved) if approved else judged.iloc[:0]
    return L.trade(ok.sort_values("time"), v)


def load_dir(folder):
    return {p.stem: pd.read_pickle(p) for p in sorted(Path(folder).glob("*.pkl"))}


if __name__ == "__main__":
    d, btc = L.load()
    start = pd.Timestamp("2025-04-20 09:30", tz="UTC"); end = btc.index[-1]
    board = []
    for v in R3:
        ideas = L.build(d, btc, v)
        t = walk(ideas, ideas[ideas.time >= start], v, start, end)
        s = L.score(t); s["version"] = v.name; board.append(s)
        print(f"{v.name:46s} {s}", flush=True)
    good = [r for r in board if r["trades"] >= 100 and r["profit_factor"] > 1]
    best = max(good or board, key=lambda r: (r["win_rate"], r["return_pct"]))
    print("\nPICKED:", best["version"])
    json.dump({"walk_forward_13_markets": board, "picked": best["version"]}, open(L.OUT / "round3.json", "w"), indent=1, default=str)
