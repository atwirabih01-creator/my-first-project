"""Practice-data search around V48 (trailing stop) + V44 (strict Sage, style check). Exam stays sealed."""
import json, itertools
import round4 as R4
from agents import Version
B, G = R4.B, R4.G
vs = []
for be, tr, mp, rw in itertools.product([0.6, 0.8, 1.0], [0.8, 1.0, 1.3], [0.80, 0.85], [None, 0.78]):
    ex = {**G, "breakeven_atr": be, "trail_atr": tr}
    if rw: ex["regime_wr"] = rw
    vs.append(Version(f"T be{be} tr{tr} p{mp} rw{rw}", **{**B, "target_atr": 6.0, "max_hold": 72, "min_prob": mp}, extra=ex))
board, best = R4.practice(vs)
json.dump(board, open(R4.L.OUT / "grid4_practice.json", "w"), indent=1, default=str)
print("BEST", best)
