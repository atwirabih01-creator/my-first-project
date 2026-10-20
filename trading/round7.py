"""Round 7: owner's NEW goal - make money after fees, with losses kept small (see CLAUDE.md).

Rules (written down before any Round 7 result was seen):
  Double check on practice data (72 markets, Oct 2024 - Oct 2026, two random halves):
    150+ trades in total; on EACH half profit factor >= 1.2 and a profit;
    overall average loss <= 1.5 x average win; biggest drop <= 10%.
  Sealed exam B (59 never-seen markets) pass:
    100+ trades, profit factor >= 1.2 and a profit, average loss <= 1.5 x average win,
    biggest drop <= 10%.
"""
import json, random, sys
from agents import Version
import paper_lab as L, round4 as R4

SETUPS = [("breakout",), ("shock",), ("pullback",), ("breakout", "shock"), ("pullback", "breakout", "shock")]


def profit_version(i, rng):
    bar = rng.choice([1, 1, 4])
    ex = {"crash_guard": rng.choice([0.03, 0.05, 0.10]), "min_ev": rng.choice([-1.0, 0.002, 0.004, 0.006])}
    kw = dict(setups=rng.choice(SETUPS), atlas_min_score=rng.choice([0.25, 0.5, 0.75]),
              need_btc_tide=rng.choice([True, False]), stop_atr=rng.choice([1.0, 1.5, 2.0]),
              allow_short=rng.choice([True, False]), sage_kind="knn_ev", knn_k=rng.choice([60, 100, 200]),
              min_target_pct=0.015, bar_hours=bar, vol_z=rng.choice([1.5, 2.0, 2.5]),
              rsi_dip=rng.choice([30, 35, 40]), max_stretch_atr=rng.choice([3.0, 6.0, 99.0]),
              max_hold=rng.choice([48, 96, 168]) // bar)
    if bar == 4:
        kw["breakout_hours"] = rng.choice([30, 60])
    else:
        kw["breakout_hours"] = rng.choice([48, 96, 168])
    if rng.random() < 0.5:                                   # ride the move with a trailing stop
        kw["target_atr"] = 10.0
        ex.update(breakeven_atr=rng.choice([1.0, 1.5]), trail_atr=rng.choice([1.5, 2.0, 3.0]))
    else:                                                    # fixed profit target, 2-4x the risk
        kw["target_atr"] = rng.choice([2.0, 3.0, 4.0])
    return Version(f"P{i + 1:03d}", **kw, extra=ex)


def ok_shape(s):
    return s["avg_loss_pct"] != 0 and -s["avg_loss_pct"] <= 1.5 * s["avg_win_pct"] and s["max_drawdown_pct"] <= 10


def exam_pass(s):
    return bool(s["trades"] >= 100 and s["profit_factor"] >= 1.2 and s["return_pct"] > 0 and ok_shape(s))


def search(versions, exam_set, tag):
    d, btc = R4.practice_markets()
    syms = sorted(d); random.Random(5).shuffle(syms)
    half = {s: (0 if k < len(syms) // 2 else 1) for k, s in enumerate(syms)}
    board = []
    for v in versions:
        try:
            ideas = L.build(d, btc, v)
            t = R4.walk(ideas, ideas[ideas.time >= R4.START], v, R4.START, btc.index[-1])
        except Exception as e:
            print(v.name, "error", e, flush=True); continue
        s = L.score(t)
        hs = [L.score(t[t.symbol.map(half) == h]) if len(t) else L.score(t) for h in (0, 1)]
        dc = bool(s["trades"] >= 150 and ok_shape(s) and all(h["profit_factor"] >= 1.2 and h["return_pct"] > 0 for h in hs))
        board.append({"version": v.name, "settings": {**{k: getattr(v, k) for k in ["bar_hours", "setups", "atlas_min_score",
                      "need_btc_tide", "stop_atr", "target_atr", "max_hold", "allow_short", "knn_k", "vol_z", "rsi_dip",
                      "breakout_hours", "max_stretch_atr"]}, **v.extra}, "all": s, "half1": hs[0], "half2": hs[1], "double_check": dc})
        print(f"{v.name} n={s['trades']:4d} win={s['win_rate']:.3f} pf={s['profit_factor']:5} ret={s['return_pct']:6} "
              f"dd={s['max_drawdown_pct']:5} win/loss={s['avg_win_pct']}/{s['avg_loss_pct']} | halves pf "
              f"{hs[0]['profit_factor']}/{hs[1]['profit_factor']}{'  <-- PASSES DOUBLE CHECK' if dc else ''}", flush=True)
    json.dump(board, open(L.OUT / f"{tag}_search.json", "w"), indent=1, default=str)
    good = [r for r in board if r["double_check"]]
    if not good:
        print(f"\nNo version passed the double check; sealed exam {exam_set} stays unused.")
        return
    best = max(good, key=lambda r: (min(r["half1"]["profit_factor"], r["half2"]["profit_factor"]), r["all"]["return_pct"]))
    v = [x for x in versions if x.name == best["version"]][0]
    t = R4.sealed_exam(v, exam_set)
    s = L.score(t); s["passed"] = exam_pass(s)
    t.to_csv(L.OUT / f"{tag}_sealed_exam_trades.csv", index=False)
    json.dump({"picked": best, f"sealed_exam_{exam_set}": s}, open(L.OUT / f"{tag}.json", "w"), indent=1, default=str)
    print(f"\nPICKED {best['version']} {best['settings']}\nSEALED EXAM (set {exam_set}): {s}")


if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 80
    rng = random.Random(77)
    search([profit_version(i, rng) for i in range(n)], "B", "round7")
