"""Market-flush bounce: buy coins during MARKET-WIDE crashes (forced selling across crypto), not lone crashes.

Found on design data (crash_bounce.py): lone crashes kept falling (67% wins, PF 0.81) but crashes
shared by 11+ coins in the same 4 hours bounced (84% wins, PF 1.68). This file tests that idea
causally - a coin is only bought if, at ITS signal hour, at least K coins (counting itself) had
already signalled during the previous 4 hours. No peeking at coins that crash later.

Rules written before the exam (23 Oct 2026):
  Design: Oct 2023 - Dec 2025.  Sealed exam: Jan - Oct 2026, one look.
  Sizing: 3% of the account per coin, at most MAXN coins per flush (so a flush risks <= 30%).
  Pass (owner's goal): 100+ exam trades, 80%+ wins, profit after costs, PF >= 1.2, biggest drop <= 10%.
  Pick rule: among design settings with 80%+ wins, PF >= 1.2, drop <= 10% and 150+ trades,
  the one with the highest PF.

  python3 flush_bounce.py design
  python3 flush_bounce.py exam NAME
"""
import itertools, json, sys, warnings
import numpy as np
import pandas as pd
import crash_bounce as C

warnings.filterwarnings("ignore")
STAKE = 0.03


def candidates(d, m, up, t, s, h, period):
    """All lone-or-not crash trades (one open per coin), with their signal hour."""
    return C.run(d, (m, up, t, s, h), period).sort_values("time")


def flush_filter(tr, k, maxn):
    """Keep a trade only if >= k coins had signalled in the 4h up to and including its signal hour."""
    times = tr.time.values
    keep, per_event = [], {}
    j0 = 0
    for i, r in enumerate(tr.itertuples()):
        while times[j0] < times[i] - np.timedelta64(4, "h"):
            j0 += 1
        crowd = i - j0 + 1                                  # signals so far in the window (causal)
        ev = (r.time - pd.Timedelta(hours=4)).floor("4h")
        if crowd >= k and per_event.get(ev, 0) < maxn:
            per_event[ev] = per_event.get(ev, 0) + 1
            keep.append(r.Index)
    return tr.loc[keep].sort_values("exit_time")


def score(t):
    if not len(t):
        return {"trades": 0}
    r = t.pnl.values
    eq = np.cumprod(1 + STAKE * r)
    dd = float((1 - eq / np.maximum.accumulate(eq)).max() * 100)
    pf = float(r[r > 0].sum() / -r[r <= 0].sum()) if (r <= 0).any() else 99.0
    months = t.assign(m=t.exit_time.dt.to_period("M")).groupby("m").pnl.sum()
    events = t.time.dt.floor("4h").nunique()
    return {"trades": len(r), "events": int(events), "win_rate": round(float((r > 0.001).mean()), 4),
            "profit_factor": round(pf, 3), "return_pct": round(100 * (eq[-1] - 1), 2), "max_drawdown_pct": round(dd, 2),
            "avg_win_pct": round(100 * r[r > 0.001].mean(), 2), "avg_loss_pct": round(100 * r[r <= 0.001].mean(), 2),
            "profitable_months": f"{int((months > 0).sum())}/{len(months)}"}


GRID = list(itertools.product([4, 5], [False], [0.75, 1.0, 1.5], [5, 8], [12, 24], [5, 8, 11], [5, 10]))


def name(p):
    return f"FLUSH m{p[0]} t{p[2]} s{p[3]} h{p[4]} k{p[5]} max{p[6]}"


def evaluate(d, p, period):
    m, up, t, s, h, k, maxn = p
    return flush_filter(candidates(d, m, up, t, s, h, period), k, maxn)


if __name__ == "__main__":
    d = C.load_all()
    if sys.argv[1] == "design":
        board = []
        for p in GRID:
            sc = score(evaluate(d, p, "design")); sc["name"] = name(p); board.append(sc)
        json.dump(board, open(C.OUT / "flush_design.json", "w"), indent=1)
        ok = [b for b in board if b["trades"] >= 150 and b["win_rate"] >= 0.8 and b["profit_factor"] >= 1.2
              and b["max_drawdown_pct"] <= 10]
        for b in sorted(board, key=lambda b: -b.get("profit_factor", 0))[:12]:
            print(b)
        print("\nQUALIFYING:", len(ok))
        if ok:
            best = max(ok, key=lambda b: b["profit_factor"]); print("PICK:", best["name"])
    else:
        p = [g for g in GRID if name(g) == " ".join(sys.argv[2:])][0]
        t = evaluate(d, p, "exam")
        sc = score(t); sc["name"] = name(p)
        sc["passed"] = bool(sc["trades"] >= 100 and sc["win_rate"] >= 0.8 and sc["profit_factor"] >= 1.2
                            and sc["return_pct"] > 0 and sc["max_drawdown_pct"] <= 10)
        t.to_csv(C.OUT / "flush_exam_trades.csv", index=False)
        json.dump(sc, open(C.OUT / "flush_exam.json", "w"), indent=1)
        print(sc)
