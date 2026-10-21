"""Desk journal: records every paper trade the three agents agree on, and scores it from real prices.

Every agreed idea is recorded once (coin, side, entry price, the coin's typical 4-hour range "ATR"
measured on 4-hour bars that had finished before entry). Each desk version turns that idea into its
own trade (its own stop, target, hold time), so all versions are judged on exactly the same ideas.
Outcomes come from Binance hourly prices, pessimistically: in the entry hour only the stop counts,
in later hours the stop is checked before the target, and costs are 0.30% per trade.

  python3 desk_journal.py add SYMBOL long|short "atlas reason" "hawk plan" "sage reason" SETUP [STOP TARGET HOLD_H]
      SETUP decides which versions are recorded: only those the gate (gate.py) does not mark as known
      losers for this setup/side/coin group. STOP/TARGET/HOLD_H (prices, hours) add version "HWK" =
      Hawk's own exact plan (rejected if the stop or target is on the wrong side of the entry).
  python3 desk_journal.py limit SYMBOL long|short LOW HIGH EXPIRES_HOURS "atlas" "hawk" "sage" SETUP [STOP TARGET HOLD_H]
      Sage-approved "enter only if price reaches LOW-HIGH" plan; waits in journal/pending.csv and fills
      automatically (at the zone edge or the bar's open, whichever is realistic) on the next update.
  python3 desk_journal.py update      # fill waiting plans, close finished trades from real prices
  python3 desk_journal.py score       # scoreboard per version + pass check

One open idea per coin at a time (matches the backtests). A version's settings are copied onto each
trade row when it opens, so editing a version later never changes trades already recorded.
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
PENDING = HERE / "journal" / "pending.csv"
COST = 0.0015

# Desk versions: how far the stop and target sit (in 4-hour ATRs) and the longest hold (hours).
# Never change a version's numbers once it has trades — add a new version instead.
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
    # Added 21 Oct after Sage's first review: smaller losses, small quick targets, time exits.
    "D11": dict(stop=1.25, target=0.5, hold=12),
    "D12": dict(stop=1.0, target=0.75, hold=24),
    "D13": dict(stop=1.25, target=0.75, hold=12),
    "D14": dict(stop=1.25, target=None, hold=24, breakeven=0.5, trail=0.75),  # lock in early, then trail
}
WIN_MIN_PCT = 0.10           # a trade only counts as a win above +0.10% after fees (break-even exits are "flat")
MIN_TARGET_PCT = 0.015       # same minimum target as the backtests and the gate
TRADE_COLS = ["idea_id", "version", "opened_utc", "symbol", "side", "entry", "stop", "target", "hold_hours",
              "atr", "breakeven", "trail", "status", "closed_utc", "exit", "result_pct"]


def atr4h(symbol, before=None):
    """Typical 4-hour range from 4-hour bars that finished before `before` (default: now)."""
    before = pd.Timestamp(before) if before is not None else pd.Timestamp.now(tz="UTC")
    end = int(before.timestamp() * 1000)
    df = L.bars(F.fetch(symbol, end - 30 * 86400 * 1000, end), 4)
    df = df[df.index + pd.Timedelta(hours=4) <= before]
    pc = df.close.shift()
    tr = pd.concat([df.high - df.low, (df.high - pc).abs(), (df.low - pc).abs()], axis=1).max(axis=1)
    return float(tr.ewm(alpha=1 / 14, adjust=False).mean().iloc[-1])


def _read(path):
    return pd.read_csv(path, keep_default_na=False, dtype=str) if path.exists() else pd.DataFrame()


def open_symbols():
    t = _read(TRADES)
    return set(t[t.status == "open"].symbol) if len(t) else set()


def limit(symbol, side, low, high, expires_hours, atlas_reason, hawk_plan, sage_reason, setup="",
          hstop="", htarget="", hhold=""):
    now = pd.Timestamp.now(tz="UTC").floor("min")
    PENDING.parent.mkdir(exist_ok=True)
    new = not PENDING.exists()
    with open(PENDING, "a", newline="") as fh:
        w = csv.writer(fh)
        if new:
            w.writerow(["created_utc", "expires_utc", "symbol", "side", "low", "high", "setup", "atlas", "hawk", "sage",
                        "status", "hstop", "htarget", "hhold"])
        w.writerow([now, now + pd.Timedelta(hours=float(expires_hours)), symbol, side, float(low), float(high), setup,
                    atlas_reason, hawk_plan, sage_reason, "waiting", hstop, htarget, hhold])
    print(f"waiting: {side} {symbol} if price reaches {low}-{high} before {now + pd.Timedelta(hours=float(expires_hours))}")


def fill_pending():
    """Turn waiting plans into trades when real prices reached the zone."""
    pend = _read(PENDING)
    if not len(pend):
        return
    end = int(time.time() * 1000)
    for i in pend.index[pend.status == "waiting"]:
        r = pend.loc[i]
        try:
            created, expires = pd.Timestamp(r.created_utc), pd.Timestamp(r.expires_utc)
            lo, hi = float(r.low), float(r.high)
            bars = F.fetch(r.symbol, int(created.timestamp() * 1000), end).iloc[:-1]      # finished hours only
            bars = bars[(bars.index >= created.floor("h")) & (bars.index < expires)]
            hit = bars[(bars.low <= hi) & (bars.high >= lo)]
            if len(hit):
                t, o = hit.index[0], float(hit.open.iloc[0])
                px = min(max(o, lo), hi)        # opened inside the zone: the open; otherwise the zone edge reached
                hp = [x if x != "" else None for x in (r.hstop, r.htarget, r.hhold)]
                done = add(r.symbol, r.side, r.atlas, r.hawk, r.sage, r.setup, *hp, entry=px, when=t)
                pend.loc[i, "status"] = f"filled {t}" if done else f"skipped {t} (coin already has an open idea)"
            elif pd.Timestamp.now(tz="UTC") > expires:
                pend.loc[i, "status"] = "expired"
        except Exception as e:
            print(f"pending row {i} ({r.symbol}): will retry next update — {e}")
        pend.to_csv(PENDING, index=False)          # save after every row, so a later failure can't double-fill


def add(symbol, side, atlas_reason, hawk_plan, sage_reason, setup="", hstop=None, htarget=None, hhold=None,
        entry=None, when=None):
    """Record one agreed idea. `when` = start of the hour it was entered (fills); default: now."""
    if symbol in open_symbols():
        print(f"skipped: {symbol} already has an open idea (one at a time per coin)")
        return False
    opened = pd.Timestamp(when) if when is not None else pd.Timestamp.now(tz="UTC").floor("min")
    a = atr4h(symbol, before=opened)
    if entry is None:
        end = int(time.time() * 1000)
        entry = float(F.fetch(symbol, end - 3 * 3600 * 1000, end).close.iloc[-1])
    s = 1 if side == "long" else -1
    idea_id = f"{opened:%Y%m%d%H%M}-{symbol}-{side}"
    ideas = _read(IDEAS)
    if len(ideas) and idea_id in set(ideas.idea_id):
        print(f"skipped: {idea_id} already recorded"); return False
    IDEAS.parent.mkdir(exist_ok=True)
    with open(IDEAS, "a", newline="") as fh:
        w = csv.writer(fh)
        if not len(ideas):
            w.writerow(["idea_id", "opened_utc", "symbol", "side", "entry", "atr4h", "setup", "atlas", "hawk", "sage"])
        w.writerow([idea_id, opened, symbol, side, entry, a, setup, atlas_reason, hawk_plan, sage_reason])
    try:
        from gate import allowed
        ok = set(allowed(setup, side, symbol)) if setup else set(VERSIONS)
    except Exception:
        ok = set(VERSIONS)
    rows = []
    if hstop and htarget and hhold:                              # Hawk's own exact plan
        hs, ht = float(hstop), float(htarget)
        if s * (entry - hs) > 0 and s * (ht - entry) > 0:
            rows.append([idea_id, "HWK", opened, symbol, side, entry, hs, ht, int(float(hhold)), a, "", "",
                         "open", "", "", ""])
        else:
            print(f"HWK not recorded: stop {hs} / target {ht} are on the wrong side of entry {entry}")
    for name, p in VERSIONS.items():
        if name not in ok:
            continue                                             # known loser for this kind of trade
        if p["target"] and p["target"] * a / entry < MIN_TARGET_PCT:
            continue                                             # target too small to beat fees
        tgt = entry + s * p["target"] * a if p["target"] else ""
        rows.append([idea_id, name, opened, symbol, side, entry, entry - s * p["stop"] * a, tgt, p["hold"], a,
                     p.get("breakeven", ""), p.get("trail", ""), "open", "", "", ""])
    new = not TRADES.exists()
    with open(TRADES, "a", newline="") as fh:
        w = csv.writer(fh)
        if new:
            w.writerow(TRADE_COLS)
        w.writerows(rows)
    print(f"recorded {idea_id}: {side} {symbol} at {entry} (4h range {a / entry:.2%}); versions: "
          f"{', '.join(r[1] for r in rows) or 'none'}")
    return True


def resolve(row, bars):
    """Walk hourly bars from the entry hour; pessimistic rules (see module notes)."""
    s = 1 if row.side == "long" else -1
    e, stop = float(row.entry), float(row.stop)
    tgt = float(row.target) if row.target not in ("", None) else None
    a = float(row.atr) if row.get("atr", "") not in ("", None) else None
    be = float(row.breakeven) if row.get("breakeven", "") not in ("", None) else None
    tr = float(row.trail) if row.get("trail", "") not in ("", None) else None
    opened = pd.Timestamp(row.opened_utc)
    after = bars[bars.index >= opened.floor("h")]
    hold = int(float(row.hold_hours))
    best = e
    for k, (t, b) in enumerate(after.head(hold).iterrows()):
        if (b.low <= stop) if s > 0 else (b.high >= stop):
            gap = (b.open < stop) if s > 0 else (b.open > stop)
            return "closed", t + pd.Timedelta(hours=1), (b.open if gap and k > 0 else stop)
        if k == 0:
            continue                       # entry hour: we don't know if the high/low came before entry
        if tgt is not None and ((b.high >= tgt) if s > 0 else (b.low <= tgt)):
            return "closed", t + pd.Timedelta(hours=1), tgt
        best = max(best, b.high) if s > 0 else min(best, b.low)
        if be and a and s * (best - e) >= be * a:                 # takes effect from the next hour
            lock = e * (1 + s * 2.5 * COST)
            lock = (max if s > 0 else min)(lock, best - s * tr * a)
            stop = (max if s > 0 else min)(stop, lock)
    if len(after) >= hold:
        return "closed", after.index[hold - 1] + pd.Timedelta(hours=1), float(after.close.iloc[hold - 1])
    return "open", None, None


def update():
    fill_pending()
    t = _read(TRADES)
    if not len(t):
        print("no trades yet"); return
    open_ = t[t.status == "open"]
    end = int(time.time() * 1000)
    cache = {}
    for sym, g in open_.groupby("symbol"):                 # one download per coin, from its oldest open trade
        start = int(pd.to_datetime(g.opened_utc).min().timestamp() * 1000) - 3600 * 1000
        cache[sym] = F.fetch(sym, start, end).iloc[:-1]
    for i, r in open_.iterrows():
        status, when, px = resolve(r, cache[r.symbol])
        if status == "closed":
            s = 1 if r.side == "long" else -1
            t.loc[i, ["status", "closed_utc", "exit"]] = ["closed", str(when), str(px)]
            t.loc[i, "result_pct"] = str(round(100 * (s * (px / float(r.entry) - 1) - 2 * COST), 3))
    t.to_csv(TRADES, index=False)
    print(f"open trades checked: {len(open_)}, still open: {(t.status == 'open').sum()}")


def stats(r):
    """r = results as fractions, in closing order."""
    wins, losses = r[r > 0], r[r <= 0]
    won = r > WIN_MIN_PCT / 100
    eq = 10_000 * np.cumprod(1 + 0.10 * r.values) if len(r) else np.array([10_000.0])   # 10% of account per trade
    dd = float((1 - eq / np.maximum.accumulate(eq)).max() * 100)
    pf = float(wins.sum() / -losses.sum()) if len(losses) and losses.sum() else (99.0 if len(wins) else 0.0)
    return won, eq, dd, pf


def score():
    t = _read(TRADES)
    if not len(t):
        print("no trades yet"); return
    rows = []
    for v, g in t.groupby("version"):
        c = g[g.status == "closed"].sort_values("closed_utc")
        r = c.result_pct.astype(float) / 100
        won, eq, dd, pf = stats(r)
        first = r.head(100)                                   # the pass test judges the SAME first 100 trades
        w100, eq100, dd100, pf100 = stats(first)
        ok = bool(len(c) >= 100 and w100.sum() >= 80 and first.sum() > 0 and pf100 >= 1.2 and dd100 <= 10)
        rows.append({"version": v, "closed": len(c), "open": int((g.status == "open").sum()),
                     "wins": int(won.sum()), "win_rate": round(float(won.mean()), 3) if len(r) else None,
                     "profit_%": round(100 * (eq[-1] / 10_000 - 1), 2), "profit_per_$1_lost": round(pf, 2),
                     "biggest_drop_%": round(dd, 2), "PASSED": ok})
    print(pd.DataFrame(rows).to_string(index=False))
    print("Note: several versions are scored on the same ideas, so one passing can partly be luck; a pass is "
          "reported to the owner together with how many versions were running.")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "score"
    if cmd == "add":
        add(*sys.argv[2:])
    elif cmd == "limit":
        limit(*sys.argv[2:])
    elif cmd == "update":
        update()
    else:
        score()
