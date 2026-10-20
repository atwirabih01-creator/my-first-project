"""Round 8: refine Round 7's two leads (P049 4h dip-buying, P069 spike-following with a trailing stop).
Same rules and double check as Round 7 (written in round7.py); the pick takes the LAST sealed exam, C."""
import itertools
from agents import Version
import round7 as R7

vs = []
for stop, tgt, hold, ev, k in itertools.product([1.5, 2.0, 2.5], [2.0, 3.0], [24, 48], [0.004, 0.006, 0.010], [60, 100]):
    vs.append(Version(f"Q{len(vs) + 1:03d} 4h dip s{stop} t{tgt} h{hold} ev{ev} k{k}", bar_hours=4, setups=("pullback",),
                      atlas_min_score=0.25, need_btc_tide=True, stop_atr=stop, target_atr=tgt, max_hold=hold,
                      allow_short=True, sage_kind="knn_ev", knn_k=k, vol_z=1.5, rsi_dip=30, breakout_hours=30,
                      max_stretch_atr=99.0, min_target_pct=0.015, extra={"crash_guard": 0.05, "min_ev": ev}))
for stop, trail, be, ev in itertools.product([1.0, 1.5], [1.5, 2.0, 3.0], [1.0, 1.5], [-1.0, 0.002, 0.004]):
    vs.append(Version(f"Q{len(vs) + 1:03d} spike trail s{stop} tr{trail} be{be} ev{ev}", setups=("shock",),
                      atlas_min_score=0.5, need_btc_tide=True, stop_atr=stop, target_atr=10.0, max_hold=96,
                      allow_short=True, sage_kind="knn_ev", knn_k=100, vol_z=1.5, rsi_dip=30, max_stretch_atr=3.0,
                      min_target_pct=0.015, extra={"crash_guard": 0.03, "min_ev": ev, "breakeven_atr": be, "trail_atr": trail}))

if __name__ == "__main__":
    R7.search(vs, "C", "round8")
