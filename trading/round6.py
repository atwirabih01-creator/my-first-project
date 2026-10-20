"""Round 6 (last agreed round): search around Round 5's best lead V079 ("news-shock follow",
quick small target). Same double check as Round 5; the pick takes sealed exam C."""
import itertools
from agents import Version
import round5 as R5

vs = []
for n, (stop, tgt, mp, hold, vz) in enumerate(itertools.product([2.5, 3.0, 4.0], [0.5, 0.75, 1.0], [0.82, 0.86], [24, 72], [1.5, 2.0])):
    vs.append(Version(f"V{121 + n} shock s{stop} t{tgt} p{mp} h{hold} vz{vz}", setups=("shock",), atlas_min_score=0.5,
                      stop_atr=stop, target_atr=tgt, max_hold=hold, min_prob=mp, allow_short=True, knn_k=100, vol_z=vz,
                      rsi_dip=35, sage_kind="knn", min_target_pct=0.010, extra={"crash_guard": 0.02}))

if __name__ == "__main__":
    R5.search(vs, "C", "round6")
