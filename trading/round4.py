"""Rounds 4-6: new ideas, judged with month-by-month learning, then ONE sealed exam per round.

Practice data: the 28 markets already used (13 original + 15 fresh) plus 44 extra markets
(data_practice/), judged Oct 2024 - Oct 2026 (Sage studies everything before each month).
Each round's pick is chosen on practice data only, then takes its sealed exam on a set of
15 markets nobody has looked at (round 4 -> set A, 5 -> B, 6 -> C).

Pass (written down before any exam is run): 100+ trades, 80%+ wins, and a profit after costs.
Usage:  python3 round4.py 4     (or 5, 6)
"""
import json, sys
import numpy as np
import pandas as pd
from agents import Version, Sage
import paper_lab as L, round3 as R

S = ("pullback", "breakout", "shock")
B = dict(setups=S, atlas_min_score=0.75, stop_atr=3.0, target_atr=1.0, min_target_pct=0.010,
         sage_kind="knn", allow_short=True)
G = {"crash_guard": 0.03}

# Round 4 first draft (V37-V48) and a 36-setting grid (grid4.py) were tried on the smaller practice set;
# the trailing-stop family worked best. Round 4's final line-up:
T = {**B, "target_atr": 6.0, "max_hold": 72}
TR = {**G, "breakeven_atr": 0.8, "trail_atr": 0.8}
ROUNDS = {
    4: [
        Version("V49 trailing + style check", **T, extra={**TR, "regime_wr": 0.78}),
        Version("V50 trailing 1.0 + style check", **T, extra={**TR, "trail_atr": 1.0, "regime_wr": 0.78}),
        Version("V51 trailing 1.3 + style check", **T, extra={**TR, "trail_atr": 1.3, "regime_wr": 0.78}),
        Version("V52 trailing, Sage 85%", **{**T, "min_prob": 0.85}, extra=TR),
        Version("V53 trailing (V48)", **T, extra=TR),
        Version("V54 trailing, Sage 82% + loose style check", **{**T, "min_prob": 0.82}, extra={**TR, "regime_wr": 0.76}),
        Version("V55 trailing, later break-even + style check", **T, extra={**TR, "breakeven_atr": 0.9, "regime_wr": 0.78}),
        Version("V56 V32 + style check, Sage 85% (V44)", **{**B, "min_prob": 0.85}, extra={**G, "regime_wr": 0.80}),
        Version("V57 V32, Sage 85% (V43)", **{**B, "min_prob": 0.85}, extra=G),
        Version("V58 trailing + style check, buy-only", **{**T, "allow_short": False}, extra={**TR, "regime_wr": 0.78}),
        Version("V59 trailing + style check, wider Sage memory", **{**T, "knn_k": 100}, extra={**TR, "regime_wr": 0.78}),
        Version("V60 trailing + style check, looser researcher", **{**T, "atlas_min_score": 0.6}, extra={**TR, "regime_wr": 0.78}),
    ],
}


def style_working(pool, judged, n=50):
    """Win rate of the last n finished ideas (all markets) before each judged idea: is this style working right now?"""
    p = pool.sort_values("exit_time")
    t = p.exit_time.values
    cw = np.r_[0, np.cumsum((p.pnl > 0).values)]
    k = np.searchsorted(t, judged.time.values, side="left")
    lo = np.maximum(k - n, 0)
    return np.where(k >= n, (cw[k] - cw[lo]) / np.maximum(k - lo, 1), np.nan)


def walk(pool, judged, v, start, end):
    if v.extra.get("short_only"):
        judged = judged[judged.dir < 0]
    if "regime_wr" in v.extra:
        rw = style_working(pool, judged)
        judged = judged[np.nan_to_num(rw) >= v.extra["regime_wr"]]
    return R.walk(pool, judged, v, start, end)


START = pd.Timestamp("2024-10-20", tz="UTC")


def practice_markets():
    d, btc = L.load()
    d.update(R.load_dir(L.HERE / "data_fresh"))
    d.update(R.load_dir(L.HERE / "data_practice"))
    return d, btc


def practice(versions):
    d, btc = practice_markets()
    end = btc.index[-1]
    board = []
    for v in versions:
        ideas = L.build(d, btc, v)
        t = walk(ideas, ideas[ideas.time >= START], v, START, end)
        s = L.score(t); s["version"] = v.name; board.append(s)
        print(f"{v.name:44s} n={s['trades']:4d} win={s['win_rate']:.3f} pf={s['profit_factor']} ret={s['return_pct']}", flush=True)
    good = [r for r in board if r["trades"] >= 100 and r["profit_factor"] > 1]
    best = max(good, key=lambda r: (r["win_rate"], r["return_pct"])) if good else None
    return board, best


def sealed_exam(v, holdout):
    d, btc = practice_markets()
    new = R.load_dir(L.HERE / f"data_holdout_{holdout}")
    pool = pd.concat([L.build(d, btc, v), L.build(new, btc, v)])
    judged = pool[pool.symbol.isin(new) & (pool.time >= START)]
    return walk(pool, judged, v, START, btc.index[-1])


if __name__ == "__main__":
    rnd = int(sys.argv[1]); holdout = {4: "A", 5: "B", 6: "C"}[rnd]
    board, best = practice(ROUNDS[rnd])
    rec = {"round": rnd, "practice": board, "picked": best and best["version"]}
    if best:
        v = [x for x in ROUNDS[rnd] if x.name == best["version"]][0]
        t = sealed_exam(v, holdout)
        s = L.score(t)
        s["passed"] = bool(s["trades"] >= 100 and s["win_rate"] >= 0.80 and s["profit_factor"] > 1)
        rec["sealed_exam"] = {"set": holdout, **s}
        t.to_csv(L.OUT / f"round{rnd}_sealed_exam_trades.csv", index=False)
        print(f"\nPICKED {best['version']}\nSEALED EXAM (set {holdout}): {s}")
    else:
        print("\nNo version qualified on practice data (needs 100+ trades and a profit); sealed exam not used.")
    json.dump(rec, open(L.OUT / f"round{rnd}.json", "w"), indent=1, default=str)
