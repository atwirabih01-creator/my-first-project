"""Desk journal: records every paper trade the three agents agree on, and scores it from real prices.

Every agreed idea is recorded once (coin, side, price, the coin's typical 4-hour range "ATR").
Each of the 10 desk versions turns that idea into its own trade (its own stop, target, hold time),
so all versions are judged on exactly the same ideas. Outcomes are worked out from Binance hourly
prices: stop first if both are touched in the same hour, 0.30% costs per trade.

  python3 desk_journal.py add SYMBOL long|short "atlas reason" "hawk plan" "sage reason" [setup]
  python3 desk_journal.py update      # close finished trades from real prices
  python3 desk_journal.py score       # scoreboard per version + pass check
"""
import csv, sys, time
from pathlib import Path
import numpy as np
import pandas as pd
import fetch_data as F
import paper_lab as L

HERE = Path(__file__).parent
IDEAS = HERE / "journal" / "ideas.csv"
TRADES = HERE / "journal" / "paper_trades.csv"
COST = 0.0015

# The 10 desk versions: how far the stop and target sit (in 4-hour ATRs) and the longest hold.
VERSIONS = {
    "D01": dict(stop=2.0, target=1.0, hold=48),
    "D02": dict(stop=2.0, target=0.75, hold=48),
    "D03": dict(stop=2.5, target=1.0, hold=72),
    "D04": dict(stop=1.5, target=0.75, hold=24),
    "D05": dict(stop=2.0, target=1.5, hold=72),
    "D06": dict(stop=1.5, target=1.0, hold=48),
    "D07": dict(stop=1.5, target=0.5, hold=24),
    "D08": dict(stop=3.0, target=1.25, hold=96),
    "D09": dict(stop=2.0, target=None, hold=72, breakeven=1.0, trail=1.0),   # trailing stop, no fixed target
    "D10": dict(stop=2.0, target=2.0, hold=96),
}
MIN_TARGET_PCT = 0.01        # a version skips an idea if its target is under 1% (fees would eat it)


def atr4h(symbol):
    end = int(time.time() * 1000)
    df = L.bars(F.fetch(symbol, end - 30 * 86400 * 1000, end), 4).iloc[:-1]
    pc = df.close.shift()
    tr = pd.concat([df.high - df.low, (df.high - pc).abs(), (df.low - pc).abs()], axis=1).max(axis=1)
    return float(tr.ewm(alpha=1 / 14, adjust=False).mean().iloc[-1]), float(df.close.iloc[-1])


def add(symbol, side, atlas_reason, hawk_plan, sage_reason, setup=""):
    a, _ = atr4h(symbol)
    end = int(time.time() * 1000)
    entry = float(F.fetch(symbol, end - 3 * 3600 * 1000, end).close.iloc[-1])
    now = pd.Timestamp.now(tz="UTC").floor("min")
    s = 1 if side == "long" else -1
    IDEAS.parent.mkdir(exist_ok=True)
    new = not IDEAS.exists()
    idea_id = f"{now:%Y%m%d%H%M}-{symbol}"
    with open(IDEAS, "a", newline="") as fh:
        w = csv.writer(fh)
        if new:
            w.writerow(["idea_id", "opened_utc", "symbol", "side", "entry", "atr4h", "setup", "atlas", "hawk", "sage"])
        w.writerow([idea_id, now, symbol, side, entry, a, setup, atlas_reason, hawk_plan, sage_reason])
    new = not TRADES.exists()
    with open(TRADES, "a", newline="") as fh:
        w = csv.writer(fh)
        if new:
            w.writerow(["idea_id", "version", "opened_utc", "symbol", "side", "entry", "stop", "target",
                        "hold_hours", "status", "closed_utc", "exit", "result_pct"])
        for name, p in VERSIONS.items():
            tgt = entry + s * p["target"] * a if p["target"] else ""
            if p["target"] and p["target"] * a / entry < MIN_TARGET_PCT:
                continue
            w.writerow([idea_id, name, now, symbol, side, entry, entry - s * p["stop"] * a, tgt, p["hold"],
                        "open", "", "", ""])
    print(f"recorded {idea_id}: {side} {symbol} at {entry} (4h range {a / entry:.2%})")


def resolve(row, p, bars):
    """Walk the hourly bars after entry; same pessimistic rules as the backtests."""
    s = 1 if row.side == "long" else -1
    e, stop = float(row.entry), float(row.stop)
    tgt = float(row.target) if row.target == row.target and row.target != "" else None
    a = abs(e - stop) / p["stop"]
    best, armed = e, False
    after = bars[bars.index > pd.Timestamp(row.opened_utc)]
    for t, b in after.head(p["hold"]).iterrows():
        if (b.low <= stop) if s > 0 else (b.high >= stop):
            px = b.open if ((b.open < stop) if s > 0 else (b.open > stop)) else stop
            return "closed", t, px
        if tgt is not None and ((b.high >= tgt) if s > 0 else (b.low <= tgt)):
            return "closed", t, tgt
        best = max(best, b.high) if s > 0 else min(best, b.low)
        if p.get("breakeven") and s * (best - e) >= p["breakeven"] * a:
            lock = e * (1 + s * 2.5 * COST)
            lock = (max if s > 0 else min)(lock, best - s * p["trail"] * a)
            stop = (max if s > 0 else min)(stop, lock)
            armed = True
    if len(after) >= p["hold"]:
        return "closed", after.index[p["hold"] - 1], float(after.close.iloc[p["hold"] - 1])
    return "open", None, None


def update():
    if not TRADES.exists():
        print("no trades yet"); return
    t = pd.read_csv(TRADES, dtype={"target": object, "closed_utc": object, "exit": object, "result_pct": object})
    open_ = t[t.status == "open"]
    end = int(time.time() * 1000)
    cache = {}
    for i, r in open_.iterrows():
        if r.symbol not in cache:
            start = int(pd.Timestamp(r.opened_utc).timestamp() * 1000) - 3600 * 1000
            cache[r.symbol] = F.fetch(r.symbol, min(start, end - 5 * 86400 * 1000), end).iloc[:-1]
        status, when, px = resolve(r, VERSIONS[r.version], cache[r.symbol])
        if status == "closed":
            s = 1 if r.side == "long" else -1
            t.loc[i, ["status", "closed_utc", "exit"]] = ["closed", str(when), px]
            t.loc[i, "result_pct"] = round(100 * (s * (px / float(r.entry) - 1) - 2 * COST), 3)
    t.to_csv(TRADES, index=False)
    print(f"open trades checked: {len(open_)}, still open: {(t.status == 'open').sum()}")


def score():
    if not TRADES.exists():
        print("no trades yet"); return
    t = pd.read_csv(TRADES)
    rows = []
    for v, g in t.groupby("version"):
        c = g[g.status == "closed"].sort_values("closed_utc")
        r = c.result_pct.astype(float) / 100
        wins, losses = r[r > 0], r[r <= 0]
        eq = 10_000 * np.cumprod(1 + 0.10 * r.values) if len(r) else np.array([10_000.0])
        dd = float((1 - eq / np.maximum.accumulate(eq)).max() * 100)
        pf = float(wins.sum() / -losses.sum()) if len(losses) and losses.sum() else (99.0 if len(wins) else 0.0)
        ok = len(c) >= 100 and (r.head(100) > 0).sum() >= 80 and r.sum() > 0 and pf >= 1.2 and dd <= 10
        rows.append({"version": v, "closed": len(c), "open": int((g.status == "open").sum()),
                     "wins": int((r > 0).sum()), "win_rate": round(float((r > 0).mean()), 3) if len(r) else None,
                     "profit_%": round(100 * (eq[-1] / 10_000 - 1), 2), "profit_per_$1_lost": round(pf, 2),
                     "biggest_drop_%": round(dd, 2), "PASSED": ok})
    print(pd.DataFrame(rows).to_string(index=False))


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "score"
    if cmd == "add":
        add(*sys.argv[2:])
    elif cmd == "update":
        update()
    else:
        score()
