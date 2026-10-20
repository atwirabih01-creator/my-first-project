"""Round 5: wide random search on practice data, with a double check before the sealed exam.

Practice markets are split into two random halves. A version must score 80%+ wins with a
profit on BOTH halves, and 150+ trades in total, before it may use sealed exam B.
(Rules written down before any Round 5 result was seen.)
"""
import json, random, sys
import numpy as np
import pandas as pd
from agents import Version
import paper_lab as L, round4 as R4

SETUPS = [("pullback",), ("breakout",), ("shock",), ("pullback", "breakout"), ("pullback", "breakout", "shock")]


def random_version(i, rng):
    bar = rng.choice([1, 1, 4])
    ex = {"crash_guard": rng.choice([0.02, 0.03, 0.05])}
    kw = dict(setups=rng.choice(SETUPS), atlas_min_score=rng.choice([0.5, 0.6, 0.75, 0.9]),
              stop_atr=rng.choice([2.0, 2.5, 3.0, 4.0]), min_prob=rng.choice([0.80, 0.82, 0.85, 0.88]),
              allow_short=rng.choice([True, True, False]), knn_k=rng.choice([30, 60, 100]),
              sage_kind="knn", min_target_pct=0.010, bar_hours=bar,
              vol_z=rng.choice([1.5, 2.0, 2.5]), rsi_dip=rng.choice([30, 35, 40]))
    if bar == 4:
        kw.update(breakout_hours=30, max_stretch_atr=rng.choice([3.0, 6.0, 99.0]))
    if rng.random() < 0.5:                                  # trailing-stop exit
        kw.update(target_atr=6.0, max_hold=rng.choice([48, 72, 96]) // bar)
        ex.update(breakeven_atr=rng.choice([0.6, 0.8, 1.0]), trail_atr=rng.choice([0.8, 1.0, 1.3, 1.6]))
    else:                                                   # fixed profit target
        kw.update(target_atr=rng.choice([0.75, 1.0, 1.5]), max_hold=rng.choice([24, 48, 72]) // bar)
    if rng.random() < 0.6:
        ex["regime_wr"] = rng.choice([0.72, 0.75, 0.78, 0.80])
    return Version(f"V{61 + i:03d} search", **kw, extra=ex)


if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 60
    rng = random.Random(2026)
    versions = [random_version(i, rng) for i in range(n)]
    d, btc = R4.practice_markets()
    syms = sorted(d); random.Random(5).shuffle(syms)
    half = {s: (0 if k < len(syms) // 2 else 1) for k, s in enumerate(syms)}
    end = btc.index[-1]
    board = []
    for v in versions:
        try:
            ideas = L.build(d, btc, v)
            t = R4.walk(ideas, ideas[ideas.time >= R4.START], v, R4.START, end)
        except Exception as e:
            print(v.name, "error", e, flush=True); continue
        s = L.score(t)
        hs = [L.score(t[t.symbol.map(half) == h]) if len(t) else L.score(t) for h in (0, 1)]
        row = {"version": v.name, "settings": {**{k: getattr(v, k) for k in ["bar_hours", "setups", "atlas_min_score", "stop_atr",
               "target_atr", "max_hold", "min_prob", "allow_short", "knn_k", "vol_z", "rsi_dip", "max_stretch_atr"]}, **v.extra},
               "all": s, "half1": hs[0], "half2": hs[1]}
        row["double_check"] = bool(s["trades"] >= 150 and all(h["win_rate"] >= 0.80 and h["profit_factor"] > 1 for h in hs))
        board.append(row)
        print(f"{v.name} n={s['trades']:4d} win={s['win_rate']:.3f} pf={s['profit_factor']:5} | halves win "
              f"{hs[0]['win_rate']:.3f}/{hs[1]['win_rate']:.3f} pf {hs[0]['profit_factor']}/{hs[1]['profit_factor']}"
              f"{'  <-- PASSES DOUBLE CHECK' if row['double_check'] else ''}", flush=True)
    json.dump(board, open(L.OUT / "round5_search.json", "w"), indent=1, default=str)
    ok = [r for r in board if r["double_check"]]
    if not ok:
        print("\nNo version passed the double check; sealed exam B stays unused.")
        sys.exit()
    best = max(ok, key=lambda r: (min(r["half1"]["win_rate"], r["half2"]["win_rate"]), r["all"]["return_pct"]))
    v = [x for x in versions if x.name == best["version"]][0]
    t = R4.sealed_exam(v, "B")
    s = L.score(t); s["passed"] = bool(s["trades"] >= 100 and s["win_rate"] >= 0.80 and s["profit_factor"] > 1)
    t.to_csv(L.OUT / "round5_sealed_exam_trades.csv", index=False)
    json.dump({"picked": best, "sealed_exam_B": s}, open(L.OUT / "round5.json", "w"), indent=1, default=str)
    print(f"\nPICKED {best['version']} {best['settings']}\nSEALED EXAM (set B): {s}")
