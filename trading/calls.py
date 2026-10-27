"""Daily forecast calls: the team's quick, scored practice (owner decision 27 Oct 2026). Places NO orders.

In each daily study session the team makes a few calls such as "BTC up over the next 24 hours", with a
reason. Each call is scored from real Binance prices when its time is up: right if the price moved the
called way. Many calls a week give fast feedback on the team's judgment, which trades alone are too rare for.

  python3 calls.py add BTCUSDT up 24 "reason"     # price at the latest hourly close is the start price
  python3 calls.py score                            # score calls whose time is up, print the record
"""
import csv, sys, time
from pathlib import Path
import pandas as pd
import fetch_data as F

HERE = Path(__file__).parent
CALLS = HERE / "journal" / "calls.csv"
COLS = ["made_utc", "symbol", "call", "hours", "start_price", "reason", "status", "end_price", "move_pct", "right"]


def _read():
    return pd.read_csv(CALLS, keep_default_na=False, dtype=str) if CALLS.exists() else pd.DataFrame(columns=COLS)


def add(symbol, call, hours, reason):
    assert call in ("up", "down"), "call must be up or down"
    end = int(time.time() * 1000)
    bars = F.fetch(symbol, end - 3 * 3600 * 1000, end)
    done = bars[bars.index + pd.Timedelta(hours=1) <= pd.Timestamp.now(tz="UTC")]
    t0, p0 = done.index[-1] + pd.Timedelta(hours=1), float(done.close.iloc[-1])    # close of last finished bar
    new = not CALLS.exists()
    with open(CALLS, "a", newline="") as fh:
        w = csv.writer(fh)
        if new:
            w.writerow(COLS)
        w.writerow([t0, symbol, call, int(hours), p0, reason, "open", "", "", ""])
    print(f"call recorded: {symbol} {call} over {hours}h from {p0} ({t0})")


def score():
    c = _read()
    now = pd.Timestamp.now(tz="UTC")
    for i in c.index[c.status == "open"]:
        r = c.loc[i]
        t_end = pd.Timestamp(r.made_utc) + pd.Timedelta(hours=int(r.hours))
        if t_end > now:
            continue
        s = int((t_end - pd.Timedelta(hours=2)).timestamp() * 1000)
        bars = F.fetch(r.symbol, s, int(t_end.timestamp() * 1000))
        bar = bars[bars.index == t_end - pd.Timedelta(hours=1)]          # the hourly bar that closes at t_end
        if not len(bar):
            continue
        p1 = float(bar.close.iloc[0])
        move = 100 * (p1 / float(r.start_price) - 1)
        right = (move > 0) if r.call == "up" else (move < 0)
        c.loc[i, ["status", "end_price", "move_pct", "right"]] = ["scored", str(p1), f"{move:.3f}", str(bool(right))]
    if len(c):
        c.to_csv(CALLS, index=False)
    sc = scored()
    print(f"forecast calls: {len(sc)} scored, {int(sc.right.sum()) if len(sc) else 0} right, "
          f"{int((c.status == 'open').sum()) if len(c) else 0} waiting")


def scored():
    c = _read()
    c = c[c.status == "scored"].copy() if len(c) else c
    c["right"] = c.right == "True" if len(c) else pd.Series(dtype=bool)
    return c


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "score"
    if cmd == "add":
        add(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5] if len(sys.argv) > 5 else "")
    else:
        score()
