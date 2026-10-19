"""Round 2: lessons from Round 1 applied (bigger charts, fee-aware targets, smarter Sage)."""
import json
from agents import Version
import paper_lab as L

S = ("pullback", "breakout", "shock")
R2 = [
    Version("V13 4h shock follow", bar_hours=4, setups=("shock",), stop_atr=2.0, target_atr=1.5, max_hold=18, vol_z=1.5, min_target_pct=0.012),
    Version("V14 4h breakout runner", bar_hours=4, setups=("breakout",), breakout_hours=30, stop_atr=1.5, target_atr=3.0, max_hold=30, min_target_pct=0.012),
    Version("V15 4h all, quick profit", bar_hours=4, setups=S, breakout_hours=30, stop_atr=2.5, target_atr=1.25, max_hold=18, min_target_pct=0.012),
    Version("V16 4h all + shorts, similar-trades Sage", bar_hours=4, setups=S, breakout_hours=30, stop_atr=2.5, target_atr=1.25, max_hold=18, allow_short=True, min_target_pct=0.012, sage_kind="knn"),
    Version("V17 4h strict researcher, similar-trades Sage", bar_hours=4, setups=S, breakout_hours=30, atlas_min_score=0.75, stop_atr=3.0, target_atr=1.0, max_hold=18, allow_short=True, min_target_pct=0.012, sage_kind="knn"),
    Version("V18 1h all + shorts, fee-aware, similar-trades Sage", setups=S, stop_atr=3.0, target_atr=1.0, allow_short=True, min_target_pct=0.012, sage_kind="knn"),
    Version("V19 1h strict researcher + shorts, similar-trades Sage", setups=S, atlas_min_score=0.75, stop_atr=3.0, target_atr=1.0, allow_short=True, min_target_pct=0.010, sage_kind="knn"),
    Version("V20 1h shock + breakout, similar-trades Sage", setups=("shock", "breakout"), stop_atr=2.5, target_atr=1.25, allow_short=True, min_target_pct=0.012, sage_kind="knn", vol_z=1.5),
    Version("V21 4h all + shorts, Sage 75%", bar_hours=4, setups=S, breakout_hours=30, stop_atr=2.5, target_atr=1.25, max_hold=18, allow_short=True, min_target_pct=0.012, sage_kind="knn", min_prob=0.75),
    Version("V22 4h wide stop scalp + shorts", bar_hours=4, setups=S, breakout_hours=30, stop_atr=3.5, target_atr=1.0, max_hold=24, allow_short=True, min_target_pct=0.012, sage_kind="knn"),
    Version("V23 4h no-tide + shorts", bar_hours=4, setups=S, breakout_hours=30, need_btc_tide=False, stop_atr=2.5, target_atr=1.25, max_hold=18, allow_short=True, min_target_pct=0.012, sage_kind="knn"),
    Version("V24 4h logit Sage + shorts", bar_hours=4, setups=S, breakout_hours=30, stop_atr=3.0, target_atr=1.0, max_hold=18, allow_short=True, min_target_pct=0.012),
]

if __name__ == "__main__":
    board, best, cuts = L.run(R2)
    best["_exam_trades"].to_csv(L.OUT / "round2_exam_trades.csv", index=False)
    clean = [{k: v for k, v in r.items() if not k.startswith("_")} for r in board]
    json.dump({"periods": cuts, "versions": clean, "picked": best["version"]}, open(L.OUT / "round2.json", "w"), indent=1, default=str)
    for r in clean:
        n = r["no_sage_tryout"]
        print(f"{r['version'][:44]:44s} raw: n={n['trades']} win={n['win_rate']} pf={n['profit_factor']}")
    print("\nPICKED:", best["version"])
