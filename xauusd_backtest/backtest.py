"""
XAUUSD London / New York box strategy backtest (5-minute candles).

All times below are New York time. The data file is in UTC and is converted.

Rules (as agreed with the owner):
  London
    - Asian range = highest / lowest price 20:00-00:00 (evening before).
    - From 02:00 price must sweep (trade beyond) the Asian high or low.
      Sweep high -> look for sells. Sweep low -> look for buys.
    - Box = 03:00-04:00 candles (highest / lowest wick).
    - From 04:00, wait for a candle to CLOSE beyond the box on the side
      opposite the sweep (sweep high -> close below box low).
    - Fibonacci from the top of the breakout move (never above the box) to the
      furthest point reached after the break. Enter when a candle wicks into
      the 0.5 level or deeper and closes back out of the zone.
    - Stop at the other side of the box (its highest / lowest wick). Target = other side of Asia.
    - Cancelled if price closes beyond both sides of the box before entry.
    - Must enter before 09:30, otherwise move to the New York setup.
  New York (only if no London trade that day)
    - Box = 09:30-10:30. First close beyond the box sets direction.
    - Same Fibonacci entry, stop and cancel rules.
    - Target = nearest untouched liquidity (swing point, Asian / London /
      previous-day high or low) that is at least 1x the risk away.
  One trade per day maximum.
"""
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).parent
COST = 0.30          # spread + commission in dollars per ounce, round trip
FIB_ENTRY = 0.5      # wick must reach at least this retracement
MIN_RALLY = 0.0      # move after the break must be at least this many box-heights before a pullback counts
BREAK_BODY = 0.5     # break candle: body must be at least this share of the whole candle (clear full-body close)
BREAK_DIST = 0.15    # break candle must close beyond the box by at least this share of the box height
MIN_IMPULSE = 3      # candles after the break that push to a new low (sell) / high (buy) before a pullback counts


def load(path):
    df = pd.read_csv(path, header=None, names=["t", "o", "h", "l", "c", "v"])
    t = pd.to_datetime(df["t"]).dt.tz_localize("UTC").dt.tz_convert("America/New_York")
    df["t"] = t.dt.tz_localize(None)
    return df.reset_index(drop=True)


class Data:
    def __init__(self, df):
        self.t = df["t"].values.astype("datetime64[m]")
        self.o, self.h, self.l, self.c = (df[k].values for k in "ohlc")

    def idx(self, ts):
        return int(np.searchsorted(self.t, np.datetime64(ts, "m")))


def find_setup(d, mode, box_start, box_end, scan_from, deadline, asia_hi, asia_lo):
    """Return dict describing the entry, or a dict with 'reason' if no trade."""
    b0, b1 = d.idx(box_start), d.idx(box_end)
    if b1 - b0 < 10:
        return {"reason": "missing data"}
    box_hi, box_lo = d.h[b0:b1].max(), d.l[b0:b1].min()
    i, end = d.idx(scan_from), d.idx(deadline)
    sweep = None            # 'high' or 'low' (London only)
    broke_up = broke_dn = False
    direction = None        # +1 buy, -1 sell
    brk = None
    for k in range(i, end):
        if mode == "london" and sweep is None:
            if d.h[k] > asia_hi:
                sweep = "high"
            elif d.l[k] < asia_lo:
                sweep = "low"
        if d.t[k] < np.datetime64(box_end, "m"):
            continue
        if d.c[k] > box_hi:
            broke_up = True
        if d.c[k] < box_lo:
            broke_dn = True
        if broke_up and broke_dn:
            return {"reason": "box broken both sides"}
        if direction is None:
            if mode == "london":
                if sweep == "high" and d.c[k] < box_lo:
                    direction = -1
                elif sweep == "low" and d.c[k] > box_hi:
                    direction = 1
            else:
                if d.c[k] < box_lo:
                    direction = -1
                elif d.c[k] > box_hi:
                    direction = 1
            if direction is not None:
                rng = d.h[k] - d.l[k]
                body = (d.c[k] - d.o[k]) * direction
                edge = box_lo if direction == -1 else box_hi
                beyond = (d.c[k] - edge) * direction
                if rng <= 0 or body < BREAK_BODY * rng or beyond < BREAK_DIST * (box_hi - box_lo):
                    return {"reason": "break candle not a clear full-body close"}
                brk = k
                impulse = 0
                s = d.idx(box_end)
                if direction == -1:
                    anchor = min(d.h[s:k + 1].max(), box_hi)   # top of the move
                    extreme = d.l[k]
                else:
                    anchor = max(d.l[s:k + 1].min(), box_lo)
                    extreme = d.h[k]
            continue
        # bias is set: track the move and look for the pullback rejection
        enough = impulse >= MIN_IMPULSE
        impulse += (d.l[k] < extreme) if direction == -1 else (d.h[k] > extreme)
        if direction == -1:
            lvl = extreme + FIB_ENTRY * (anchor - extreme)
            if d.c[k] > anchor:
                return {"reason": "pullback went past the start of the move"}
            if d.h[k] >= lvl and d.c[k] < lvl and d.l[k] >= extreme and enough \
                    and anchor - extreme >= MIN_RALLY * (box_hi - box_lo):
                return dict(entry_i=k, direction=-1, entry=d.c[k], stop=box_hi,
                            box_hi=box_hi, box_lo=box_lo, anchor=anchor,
                            extreme=extreme, sweep=sweep, break_i=brk)
            extreme = min(extreme, d.l[k])
        else:
            lvl = extreme - FIB_ENTRY * (extreme - anchor)
            if d.c[k] < anchor:
                return {"reason": "pullback went past the start of the move"}
            if d.l[k] <= lvl and d.c[k] > lvl and d.h[k] <= extreme and enough \
                    and extreme - anchor >= MIN_RALLY * (box_hi - box_lo):
                return dict(entry_i=k, direction=1, entry=d.c[k], stop=box_lo,
                            box_hi=box_hi, box_lo=box_lo, anchor=anchor,
                            extreme=extreme, sweep=sweep, break_i=brk)
            extreme = max(extreme, d.h[k])
    if mode == "london" and sweep is None:
        return {"reason": "no sweep of Asian range"}
    if direction is None:
        return {"reason": "no valid box break"}
    return {"reason": "no pullback entry before deadline"}


def liquidity_target(d, s, day_start_i, levels):
    """Nearest untouched liquidity at least 1R away (New York target)."""
    k, dirn, entry = s["entry_i"], s["direction"], s["entry"]
    risk = abs(entry - s["stop"])
    cands = list(levels)
    # swing points (2 candles each side) from the start of the trading day
    for j in range(day_start_i + 2, k - 2):
        if dirn == -1 and d.l[j] < d.l[j - 2:j].min() and d.l[j] < d.l[j + 1:j + 3].min():
            cands.append((d.l[j], j))
        if dirn == 1 and d.h[j] > d.h[j - 2:j].max() and d.h[j] > d.h[j + 1:j + 3].max():
            cands.append((d.h[j], j))
    best = None
    for price, j in cands:
        if dirn == -1:
            if price > entry - risk or d.l[j + 1:k + 1].min(initial=np.inf) < price:
                continue
            if best is None or price > best:
                best = price
        else:
            if price < entry + risk or d.h[j + 1:k + 1].max(initial=-np.inf) > price:
                continue
            if best is None or price < best:
                best = price
    return best


def simulate(d, s, target, exit_by):
    k, dirn, entry, stop = s["entry_i"], s["direction"], s["entry"], s["stop"]
    end = d.idx(exit_by)
    for j in range(k + 1, min(end, len(d.c))):
        hit_stop = d.h[j] >= stop if dirn == -1 else d.l[j] <= stop
        hit_tgt = d.l[j] <= target if dirn == -1 else d.h[j] >= target
        if hit_stop:                           # same-candle tie counts as a loss
            return j, stop, "stop"
        if hit_tgt:
            return j, target, "target"
    j = min(end, len(d.c)) - 1
    return j, d.c[j], "time exit"


def run(df, ny_target_mode="liquidity"):
    d = Data(df)
    days = pd.to_datetime(df["t"]).dt.normalize().unique()
    trades, skipped = [], []
    for day in days:
        day = pd.Timestamp(day)
        if day.weekday() >= 5:
            continue
        prev = day - pd.Timedelta(days=3 if day.weekday() == 0 else 1)
        a0, a1 = d.idx(day - pd.Timedelta(hours=4)), d.idx(day)
        if a1 - a0 < 30:
            skipped.append((day.date(), "london", "missing Asian data"))
            continue
        asia_hi, asia_lo = d.h[a0:a1].max(), d.l[a0:a1].min()
        friday = day.weekday() == 4

        s = find_setup(d, "london", day + pd.Timedelta(hours=3), day + pd.Timedelta(hours=4),
                       day + pd.Timedelta(hours=2), day + pd.Timedelta(hours=9, minutes=30),
                       asia_hi, asia_lo)
        session = "London"
        if "reason" in s:
            skipped.append((day.date(), "london", s["reason"]))
        else:
            target = asia_lo if s["direction"] == -1 else asia_hi
            if (s["direction"] == -1 and s["entry"] <= target) or \
               (s["direction"] == 1 and s["entry"] >= target):
                skipped.append((day.date(), "london", "target already reached at entry"))
                s = {"reason": "x"}
            else:
                exit_by = day + pd.Timedelta(hours=17)

        if "reason" in s:
            session = "New York"
            s = find_setup(d, "ny", day + pd.Timedelta(hours=9, minutes=30),
                           day + pd.Timedelta(hours=10, minutes=30),
                           day + pd.Timedelta(hours=9, minutes=30),
                           day + pd.Timedelta(hours=16, minutes=55), asia_hi, asia_lo)
            if "reason" in s:
                skipped.append((day.date(), "ny", s["reason"]))
                continue
            risk = abs(s["entry"] - s["stop"])
            if ny_target_mode == "2R":
                target = s["entry"] + s["direction"] * 2 * risk
            else:
                lon0, lon1 = d.idx(day + pd.Timedelta(hours=2)), d.idx(day + pd.Timedelta(hours=9, minutes=30))
                p0, p1 = d.idx(prev), d.idx(prev + pd.Timedelta(hours=17))
                lv = []
                if p1 > p0:
                    lv += [(d.h[p0:p1].max(), p1 - 1), (d.l[p0:p1].min(), p1 - 1)]
                lv += [(asia_hi, a1 - 1), (asia_lo, a1 - 1)]
                if lon1 > lon0:
                    lv += [(d.h[lon0:lon1].max(), lon1 - 1), (d.l[lon0:lon1].min(), lon1 - 1)]
                target = liquidity_target(d, s, d.idx(day - pd.Timedelta(hours=4)), lv)
                if target is None:
                    skipped.append((day.date(), "ny", "no liquidity target at least 1R away"))
                    continue
            exit_by = day + pd.Timedelta(hours=17) if friday else day + pd.Timedelta(days=1, hours=2)

        j, px, how = simulate(d, s, target, exit_by)
        risk = abs(s["entry"] - s["stop"])
        pnl = (px - s["entry"]) * s["direction"] - COST
        trades.append(dict(
            date=day.date(), session=session,
            side="BUY" if s["direction"] == 1 else "SELL",
            entry_time=pd.Timestamp(d.t[s["entry_i"]]), entry=round(s["entry"], 3),
            stop=round(s["stop"], 3), target=round(target, 3),
            planned_rr=round(abs(target - s["entry"]) / risk, 2),
            exit_time=pd.Timestamp(d.t[j]), exit=round(px, 3), result=how,
            risk_usd_per_oz=round(risk, 2), R=round(pnl / risk, 3),
            box_hi=round(s["box_hi"], 3), box_lo=round(s["box_lo"], 3),
            asia_hi=round(asia_hi, 3), asia_lo=round(asia_lo, 3),
            fib_start=round(s["anchor"], 3), fib_end=round(s["extreme"], 3),
            break_time=pd.Timestamp(d.t[s["break_i"]]), sweep=s["sweep"],
        ))
    return pd.DataFrame(trades), pd.DataFrame(skipped, columns=["date", "session", "reason"])


def equity(trades, risk_pct, start=10_000):
    bal, curve = start, []
    for r in trades["R"]:
        bal *= 1 + risk_pct / 100 * r
        curve.append(bal)
    return np.array(curve)


def stats(tr, label):
    if tr.empty:
        return {"label": label, "trades": 0}
    r = tr["R"].values
    cum = np.cumsum(r)
    dd = (np.maximum.accumulate(np.concatenate([[0], cum]))[1:] - cum).max()
    streak = cur = 0
    for x in r:
        cur = cur + 1 if x < 0 else 0
        streak = max(streak, cur)
    out = {"label": label, "trades": len(r), "win_rate_%": round((r > 0).mean() * 100, 1),
           "avg_R": round(r.mean(), 3), "total_R": round(r.sum(), 1),
           "profit_factor": round(r[r > 0].sum() / -r[r < 0].sum(), 2) if (r < 0).any() else np.inf,
           "max_drawdown_R": round(dd, 1), "longest_losing_streak": streak,
           "avg_planned_rr": round(tr["planned_rr"].mean(), 2)}
    for p in (1.0, 1.5):
        eq = equity(tr, p)
        peak = np.maximum.accumulate(np.concatenate([[10_000], eq]))[1:]
        out[f"end_balance_{p}%"] = round(eq[-1])
        out[f"max_dd_{p}%"] = round(((peak - eq) / peak).max() * 100, 1)
    return out


if __name__ == "__main__":
    df = load(HERE / "XAUUSD_M5.csv")
    out = HERE / "results"
    out.mkdir(exist_ok=True)
    summary = []
    for mode in ("liquidity", "2R"):
        tr, sk = run(df, mode)
        tag = "" if mode == "liquidity" else "_ny2R"
        tr.to_csv(out / f"trades{tag}.csv", index=False)
        if mode == "liquidity":
            sk.to_csv(out / "no_trade_days.csv", index=False)
            summary += [stats(tr, "ALL (NY target = liquidity)"),
                        stats(tr[tr.session == "London"], "London only"),
                        stats(tr[tr.session == "New York"], "New York only (liquidity target)")]
            main, main_sk = tr, sk
        else:
            summary += [stats(tr, "ALL (NY target = fixed 2R)"),
                        stats(tr[tr.session == "New York"], "New York only (2R target)")]
    s = pd.DataFrame(summary)
    s.to_csv(out / "summary.csv", index=False)
    pd.set_option("display.width", 250)
    print(s.T.to_string())
    main["month"] = pd.to_datetime(main["date"]).dt.to_period("M")
    print(main.groupby("month")["R"].agg(["count", "sum"]).round(1).to_string())
    print(main.result.value_counts().to_string())
    print(main_sk.groupby(["session", "reason"]).size().to_string())
