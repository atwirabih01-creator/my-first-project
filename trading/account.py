"""The team's $500 PAPER account (owner decision 27 Oct 2026). Places NO orders.

Only the team's own agreed plans count here (version HWK in journal/paper_trades.csv - the exact plan
Atlas, Hawk and Sage agreed on), in the order they closed. Sizing rule, fixed in advance:
  - risk 1% of the current balance per trade: if the stop is hit, the loss is about 1% of the account
  - position size = (1% of balance) / (distance to stop), never more than the whole balance (no leverage)
  - result_pct in the journal is already after 0.30% round-trip fees
Graduation from Phase 1 (team training) to Phase 2 (agents also work individually) - see
.claude/skills/desk-training/SKILL.md:
  >= 50 closed team trades, balance above $500, $1.20+ earned per $1 lost, biggest drop <= 10%,
  and >= 60 scored forecast calls with >= 60% right (calls.py).

  python3 account.py
"""
from pathlib import Path
import numpy as np
import pandas as pd

HERE = Path(__file__).parent
TRADES = HERE / "journal" / "paper_trades.csv"
START, RISK = 500.0, 0.01
GRAD = dict(trades=50, pf=1.2, dd=10.0, calls=60, call_hit=0.60)


def ledger():
    t = pd.read_csv(TRADES, keep_default_na=False, dtype=str)
    t = t[(t.version == "HWK") & (t.status == "closed")].copy()
    t["closed"] = pd.to_datetime(t.closed_utc)
    t = t.sort_values("closed")
    bal, rows = START, []
    for r in t.itertuples():
        stop_dist = abs(float(r.stop) / float(r.entry) - 1)
        size = min(bal * RISK / stop_dist, bal) if stop_dist > 0 else bal * 0.2
        pnl = size * float(r.result_pct) / 100
        bal += pnl
        rows.append({"closed": r.closed.strftime("%Y-%m-%d %H:%M"), "coin": r.symbol, "side": r.side,
                     "size_$": round(size, 2), "result_%": float(r.result_pct), "pnl_$": round(pnl, 2),
                     "balance_$": round(bal, 2)})
    return pd.DataFrame(rows)


def status():
    led = ledger()
    import calls
    c = calls.scored()
    n_calls, hit = len(c), (c.right.mean() if len(c) else 0.0)
    if len(led):
        eq = np.concatenate([[START], led["balance_$"].values])
        dd = float((1 - eq / np.maximum.accumulate(eq)).max() * 100)
        p = led["pnl_$"]
        pf = float(p[p > 0].sum() / -p[p <= 0].sum()) if (p <= 0).any() and p[p <= 0].sum() < 0 else 99.0
        wins = int((led["result_%"] > 0.10).sum())
    else:
        dd, pf, wins = 0.0, 0.0, 0
    bal = float(led["balance_$"].iloc[-1]) if len(led) else START
    print(led.to_string(index=False) if len(led) else "no closed team trades yet")
    print(f"\nTEAM ACCOUNT: ${bal:.2f} (started ${START:.0f})  trades {len(led)}  wins {wins}  "
          f"$ per $1 lost {pf:.2f}  biggest drop {dd:.1f}%")
    print(f"FORECAST CALLS: {n_calls} scored, {hit:.0%} right")
    checks = {f"{GRAD['trades']}+ trades": len(led) >= GRAD["trades"], "balance above $500": bal > START,
              f"$1.20+ per $1 lost": pf >= GRAD["pf"], "drop <= 10%": dd <= GRAD["dd"],
              f"{GRAD['calls']}+ calls at 60%+": n_calls >= GRAD["calls"] and hit >= GRAD["call_hit"]}
    print("GRADUATION:", "  ".join(f"[{'x' if ok else ' '}] {k}" for k, ok in checks.items()))
    print("GRADUATED=" + ("yes" if all(checks.values()) else "no"))


if __name__ == "__main__":
    status()
