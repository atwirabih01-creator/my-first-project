"""The gate: which setup + side + desk version combinations are KNOWN LOSERS on our coins.

The backtest's only job now is to block known losers (owner-approved 21 Oct 2026); the agents'
judgment is proven forward on the paper scoreboard. Refresh weekly:
  python3 gate.py          # writes journal/gate.json (takes a few minutes)
A combination is BLOCKED when, over the last 3 years on the scanner's coins (meme coins and big
coins judged separately), it earned less than $1.05 per $1 lost after fees, or has under 30 trades.
The gate's numbers are in-sample screening (built on the same history), not evidence of an edge.
"""
import json, warnings
from pathlib import Path
import pandas as pd
import paper_lab as L, round3 as R
from check_setup import SETUPS, desk_versions, ensure_data, FOLDERS
from universe import MEMES, MAJORS

warnings.filterwarnings("ignore")
GATE = Path(__file__).parent / "journal" / "gate.json"


def build_gate():
    ensure_data(MEMES + MAJORS)
    d = {}
    for f in FOLDERS:
        d.update(R.load_dir(L.HERE / f))
    btc = d["BTCUSDT"]
    d = {k: v for k, v in d.items() if k in MEMES + MAJORS}
    table = {}
    for setup in SETUPS:
        for v in desk_versions(setup, "both"):
            ideas = L.build(d, btc, v)
            for group, syms in [("meme", MEMES), ("major", MAJORS)]:
                for side, s in [("long", 1), ("short", -1)]:
                    t = L.trade(ideas[ideas.symbol.isin(syms) & (ideas.dir == s)], v)
                    sc = L.score(t)
                    pnl = t.pnl if len(t) else pd.Series(dtype=float)
                    lost = -pnl[pnl <= 0].sum()
                    pf = float(pnl[pnl > 0].sum() / lost) if lost > 0 else (99.0 if len(pnl) else 0.0)
                    key = f"{setup}|{side}|{group}|{v.name}"
                    table[key] = {"trades": sc["trades"], "win_rate": sc["win_rate"], "profit_factor": round(pf, 3),
                                  "blocked": bool(sc["trades"] < 30 or pf < 1.05)}
        print(setup, "done", flush=True)
    GATE.parent.mkdir(exist_ok=True)
    GATE.write_text(json.dumps({"built_utc": str(pd.Timestamp.now(tz="UTC")), "table": table}, indent=1))
    ok = {k: x for k, x in table.items() if not x["blocked"]}
    print(f"{len(ok)} of {len(table)} combinations are NOT known losers:")
    for k, x in sorted(ok.items(), key=lambda kv: -kv[1]["profit_factor"]):
        print(f"  {k:32s} trades {x['trades']:4d}  wins {x['win_rate']:.0%}  $/1 lost {x['profit_factor']}")


def allowed(setup, side, symbol):
    """Desk versions that are not known losers for this kind of candidate."""
    if not GATE.exists():
        return []
    table = json.loads(GATE.read_text())["table"]
    group = "meme" if symbol in MEMES else "major"
    return [k.split("|")[3] for k, x in table.items()
            if k.startswith(f"{setup}|{side}|{group}|") and not x["blocked"]]


if __name__ == "__main__":
    build_gate()
