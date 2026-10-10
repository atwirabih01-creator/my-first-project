"""Paper-trading journal for the owner's graded strategies. NO ORDERS ARE EVER PLACED.

After each US close it reads that day's live 1-minute prices from Hyperliquid's free public data
(the same xyz:XYZ100 Nasdaq 100 and xyz:GOLD markets the Liquid / Co-Invest connector trades),
applies the written rules exactly, and records the simulated trade (or the reason for no trade)
in trading/paper/journal.csv.

Strategies (rules: trading/NASDAQ/FINAL-STRATEGY.md and trading/XAUUSD/FINAL-STRATEGY.md):
  NASDAQ  "Fade the big opening gap" (v1, grade B)
  GOLD    "Follow London's break of the Asia box" (v3, grade B)

Usage:
  python3 trading/paper/paper_trader.py run              # process today and any missed recent weekdays (New York date)
  python3 trading/paper/paper_trader.py run --date 2026-10-12
  python3 trading/paper/paper_trader.py weekly           # write trading/paper/weekly-report.md
  python3 trading/paper/paper_trader.py validate         # replay Sep 2026 from the backtest data and compare with Agent 2
"""
import csv
import json
import sys
import time
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
JOURNAL = HERE / "journal.csv"
NY, LON, DOHA = "America/New_York", "Europe/London", "Asia/Qatar"

# Same costs as the backtests (so paper results are comparable). Real platform fees may differ:
# the journal also shows R after an ASSUMED platform fee of 0.05% of the position value per side.
COST = {"NASDAQ": 2.0, "GOLD": 0.40}
FEE_PER_SIDE = 0.0005

# US stock-market calendar (NYSE published calendar). Check yearly.
HOLIDAYS = {
    "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19", "2026-07-03", "2026-09-07",
    "2026-11-26", "2026-12-25",
    "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31", "2027-06-18", "2027-07-05", "2027-09-06",
    "2027-11-25", "2027-12-24",
}
EARLY_CLOSES = {"2025-11-28", "2025-12-24", "2026-11-27", "2026-12-24", "2027-11-26"}
GOLD_SKIP = HOLIDAYS | EARLY_CLOSES | {"2026-12-31", "2027-12-31"}  # holidays and short days (gold rules 3.2)

COLS = ["market", "date_ny", "status", "reason", "direction", "entry_time_ny", "entry_time_doha", "entry", "stop",
        "target", "risk", "exit_time_ny", "exit_time_doha", "exit", "exit_type", "R", "R_after_est_fees", "notes"]


# ---------------------------------------------------------------- data
def fetch_candles(coin, interval, start_utc, end_utc):
    """Hyperliquid public candle snapshot (max ~5000 most recent candles per interval)."""
    body = {"type": "candleSnapshot", "req": {"coin": coin, "interval": interval,
                                              "startTime": int(start_utc.timestamp() * 1000),
                                              "endTime": int(end_utc.timestamp() * 1000)}}
    for attempt in range(4):
        try:
            req = urllib.request.Request("https://api.hyperliquid.xyz/info", data=json.dumps(body).encode(),
                                         headers={"Content-Type": "application/json"})
            rows = json.loads(urllib.request.urlopen(req, timeout=30).read())
            break
        except Exception:
            time.sleep(2 ** (attempt + 1))
    else:
        raise RuntimeError(f"could not fetch {coin} {interval}")
    df = pd.DataFrame(rows)
    if df.empty:
        return pd.DataFrame(columns=["time_utc", "open", "high", "low", "close"])
    df["time_utc"] = pd.to_datetime(df["t"], unit="ms")
    for c, k in (("open", "o"), ("high", "h"), ("low", "l"), ("close", "c")):
        df[c] = df[k].astype(float)
    return df[["time_utc", "open", "high", "low", "close"]].sort_values("time_utc").reset_index(drop=True)


def local(df, tz):
    out = df.copy()
    out["t"] = out.time_utc.dt.tz_localize("UTC").dt.tz_convert(tz)
    return out


def fmt(ts):
    if ts is None:
        return "", ""
    ts = pd.Timestamp(ts).tz_convert("UTC") if pd.Timestamp(ts).tzinfo else pd.Timestamp(ts).tz_localize("UTC")
    return ts.tz_convert(NY).strftime("%H:%M"), ts.tz_convert(DOHA).strftime("%H:%M")


def max_hole_minutes(times):
    if len(times) < 2:
        return 10 ** 6
    return (pd.Series(sorted(times)).diff().max().total_seconds()) / 60


def us_full_day(d):
    s = d.isoformat()
    return d.weekday() < 5 and s not in HOLIDAYS and s not in EARLY_CLOSES


def prev_weekday(d):
    d -= timedelta(days=1)
    while d.weekday() >= 5 or d.isoformat() in HOLIDAYS:
        d -= timedelta(days=1)
    return d


# ---------------------------------------------------------------- NASDAQ v1 "Fade the big opening gap"
def session_stats(m1_ny, d):
    """09:30-15:59 NY stats for date d from 1-minute bars (NY-localized). None if incomplete (>15 min hole)."""
    s = m1_ny[(m1_ny.t.dt.date == d) & (m1_ny.t.dt.hour * 60 + m1_ny.t.dt.minute >= 570)
              & (m1_ny.t.dt.hour * 60 + m1_ny.t.dt.minute < 960)]
    if s.empty or s.t.iloc[0].strftime("%H:%M") != "09:30" or s.t.iloc[-1].strftime("%H:%M") != "15:59" \
            or max_hole_minutes(s.t) > 15:
        return None
    return {"O": s.open.iloc[0], "H": s.high.max(), "L": s.low.min(), "C": s.close.iloc[-1], "bars": s}


def nasdaq_atr_pct(day_stats, d):
    """Average (H-L)/O*100 over the last 14 full trading days before d; needs >= 10 good days."""
    days, good, k = [], 0, d
    while len(days) < 14:
        k = prev_weekday(k)
        if k.isoformat() in EARLY_CLOSES:
            days.append(None)
            continue
        days.append(day_stats(k))
    good = [x for x in days if x is not None]
    if len(good) < 10:
        return None
    return sum((x["H"] - x["L"]) / x["O"] * 100 for x in good) / len(good)


def nasdaq_day(d, today_stats, prev_stats, atr_pct):
    row = {"market": "NASDAQ", "date_ny": d.isoformat()}
    if not us_full_day(d):
        return {**row, "status": "no trade", "reason": "US holiday / half day / weekend"}
    pd_ = prev_weekday(d)
    if pd_.isoformat() in EARLY_CLOSES:
        return {**row, "status": "no trade", "reason": "day after a half day"}
    if today_stats is None or prev_stats is None:
        return {**row, "status": "no trade", "reason": "price data hole (>15 min) today or previous day"}
    if atr_pct is None:
        return {**row, "status": "no trade", "reason": "fewer than 10 good days for ATR"}
    PC, O, bars = prev_stats["C"], today_stats["O"], today_stats["bars"]
    atr = atr_pct * O / 100
    gap = O - PC
    note = f"PC {PC:.1f}, open {O:.1f}, gap {gap:+.1f}, ATR {atr:.1f} ({atr_pct:.2f}%)"
    if abs(gap) <= 0.5 * atr:
        return {**row, "status": "no trade", "reason": "gap not bigger than 0.5 x ATR", "notes": note}
    direction = -1 if gap > 0 else 1  # gap up -> short, gap down -> long
    first5 = bars.iloc[:5]
    if (direction == -1 and first5.low.min() <= PC) or (direction == 1 and first5.high.max() >= PC):
        return {**row, "status": "no trade", "reason": "first 5-minute candle already touched PC", "notes": note}
    entry = first5.close.iloc[-1]
    stop_dist = 0.75 * atr
    if stop_dist < 40:
        return {**row, "status": "no trade", "reason": "stop under 40 points", "notes": note}
    stop, target = entry - direction * stop_dist, PC
    exit_px, exit_t, exit_type = None, None, None
    for _, b in bars.iloc[5:].iterrows():
        if direction == 1:
            if b.open <= stop:
                exit_px, exit_t, exit_type = b.open, b.t, "stop (gapped)"
            elif b.low <= stop:
                exit_px, exit_t, exit_type = stop, b.t, "stop"
            elif b.high >= target:
                exit_px, exit_t, exit_type = target, b.t, "target"
        else:
            if b.open >= stop:
                exit_px, exit_t, exit_type = b.open, b.t, "stop (gapped)"
            elif b.high >= stop:
                exit_px, exit_t, exit_type = stop, b.t, "stop"
            elif b.low <= target:
                exit_px, exit_t, exit_type = target, b.t, "target"
        if exit_px is not None:
            break
    if exit_px is None:
        exit_px, exit_t, exit_type = bars.close.iloc[-1], bars.t.iloc[-1], "15:59 close"
    pts = (exit_px - entry) * direction - COST["NASDAQ"]
    R = pts / stop_dist
    R_fee = (pts + COST["NASDAQ"] - FEE_PER_SIDE * (entry + exit_px)) / stop_dist
    en_ny, en_doha = fmt(bars.t.iloc[4] + pd.Timedelta(minutes=1))
    ex_ny, ex_doha = fmt(exit_t + pd.Timedelta(minutes=1))
    return {**row, "status": "trade", "direction": "LONG" if direction == 1 else "SHORT",
            "entry_time_ny": en_ny, "entry_time_doha": en_doha, "entry": round(entry, 2), "stop": round(stop, 2),
            "target": round(target, 2), "risk": round(stop_dist, 2), "exit_time_ny": ex_ny, "exit_time_doha": ex_doha,
            "exit": round(exit_px, 2), "exit_type": exit_type, "R": round(R, 3), "R_after_est_fees": round(R_fee, 3),
            "notes": note}


# ---------------------------------------------------------------- GOLD v3 "Follow London's break of the Asia box"
def gold_day(d, m1):
    """d = the trading date (London/NY date of the morning). m1 = 1-minute bars covering d (UTC)."""
    row = {"market": "GOLD", "date_ny": d.isoformat()}
    if d.weekday() >= 5 or d.isoformat() in GOLD_SKIP:
        return {**row, "status": "no trade", "reason": "weekend / holiday / short day"}
    lon = local(m1, LON)
    mins = lon.t.dt.hour * 60 + lon.t.dt.minute
    box = lon[(lon.t.dt.date == d) & (mins < 7 * 60)]
    ny = local(m1, NY)
    reopen = pd.Timestamp(datetime.combine(d - timedelta(days=1), datetime.min.time())).tz_localize(NY) + pd.Timedelta(hours=18)
    if d.weekday() == 0:
        reopen -= pd.Timedelta(days=2)
    since = ny[(ny.t >= reopen) & (lon.t < pd.Timestamp(datetime.combine(d, datetime.min.time())).tz_localize(LON) + pd.Timedelta(hours=12))]
    if box.empty or max_hole_minutes(pd.concat([since.t])) > 15:
        return {**row, "status": "no trade", "reason": "price data hole (>15 min) since 18:00 New York"}
    hi, lo = box.high.max(), box.low.min()
    size = hi - lo
    note = f"box {lo:.2f}-{hi:.2f} ({size:.2f} USD)"
    if size < 8:
        return {**row, "status": "no trade", "reason": "box under 8 USD", "notes": note}
    window = lon[(lon.t.dt.date == d) & (mins >= 7 * 60) & (mins < 12 * 60)]
    fill = None
    for i, b in window.iterrows():
        up, dn = b.high >= hi, b.low <= lo
        if up and dn:
            return {**row, "status": "no trade", "reason": "both box sides broken in the same minute", "notes": note}
        if up or dn:
            direction = 1 if up else -1
            entry = max(hi, b.open) if up else min(lo, b.open)
            fill = (i, b.t, direction, entry)
            break
    if fill is None:
        return {**row, "status": "no trade", "reason": "no breakout by 11:59 London", "notes": note}
    i, t_fill, direction, entry = fill
    stop = lo if direction == 1 else hi
    close_t = pd.Timestamp(datetime.combine(d, datetime.min.time())).tz_localize(NY) + pd.Timedelta(hours=15, minutes=59)
    after = ny[(ny.t > t_fill.tz_convert(NY)) & (ny.t <= close_t)]
    exit_px, exit_t, exit_type = None, None, None
    for _, b in after.iterrows():
        if direction == 1 and b.open <= stop:
            exit_px, exit_t, exit_type = b.open, b.t, "stop (gapped)"
        elif direction == 1 and b.low <= stop:
            exit_px, exit_t, exit_type = stop, b.t, "stop"
        elif direction == -1 and b.open >= stop:
            exit_px, exit_t, exit_type = b.open, b.t, "stop (gapped)"
        elif direction == -1 and b.high >= stop:
            exit_px, exit_t, exit_type = stop, b.t, "stop"
        if exit_px is not None:
            break
    if exit_px is None:
        if after.empty or after.t.iloc[-1].strftime("%H:%M") != "15:59":
            return {**row, "status": "pending", "reason": "day not finished / 15:59 NY bar missing", "notes": note}
        exit_px, exit_t, exit_type = after.close.iloc[-1], after.t.iloc[-1], "16:00 NY close"
    usd = (exit_px - entry) * direction - COST["GOLD"]
    R = usd / size
    R_fee = (usd + COST["GOLD"] - FEE_PER_SIDE * (entry + exit_px)) / size
    en_ny, en_doha = fmt(t_fill)
    ex_ny, ex_doha = fmt(exit_t + pd.Timedelta(minutes=1) if exit_type.startswith("16:00") else exit_t)
    return {**row, "status": "trade", "direction": "LONG" if direction == 1 else "SHORT",
            "entry_time_ny": en_ny, "entry_time_doha": en_doha, "entry": round(entry, 2), "stop": round(stop, 2),
            "target": "", "risk": round(size, 2), "exit_time_ny": ex_ny, "exit_time_doha": ex_doha,
            "exit": round(exit_px, 2), "exit_type": exit_type, "R": round(R, 3), "R_after_est_fees": round(R_fee, 3),
            "notes": note}


# ---------------------------------------------------------------- live run
def live_nasdaq(d):
    end = pd.Timestamp(datetime.combine(d, datetime.min.time())).tz_localize(NY) + pd.Timedelta(hours=16, minutes=5)
    m1 = local(fetch_candles("xyz:XYZ100", "1m", end - pd.Timedelta(days=4), end), NY)
    m15 = local(fetch_candles("xyz:XYZ100", "15m", end - pd.Timedelta(days=45), end), NY)

    def stats15(k):
        s = m15[(m15.t.dt.date == k) & (m15.t.dt.hour * 60 + m15.t.dt.minute >= 570)
                & (m15.t.dt.hour * 60 + m15.t.dt.minute < 960)]
        if len(s) != 26:
            return None
        return {"O": s.open.iloc[0], "H": s.high.max(), "L": s.low.min()}

    return nasdaq_day(d, session_stats(m1, d), session_stats(m1, prev_weekday(d)), nasdaq_atr_pct(stats15, d))


def live_gold(d):
    end = pd.Timestamp(datetime.combine(d, datetime.min.time())).tz_localize(NY) + pd.Timedelta(hours=16, minutes=5)
    m1 = fetch_candles("xyz:GOLD", "1m", end - pd.Timedelta(days=3), end)
    return gold_day(d, m1)


def read_journal():
    if not JOURNAL.exists():
        return pd.DataFrame(columns=COLS)
    return pd.read_csv(JOURNAL, dtype=str).fillna("")


def write_rows(rows):
    j = read_journal()
    new = pd.DataFrame([{c: r.get(c, "") for c in COLS} for r in rows])
    keep = j[~(j.market + j.date_ny).isin(new.market + new.date_ny)]
    out = pd.concat([keep, new]).sort_values(["date_ny", "market"])
    out.to_csv(JOURNAL, index=False, quoting=csv.QUOTE_MINIMAL)


def run(dates):
    now_ny = pd.Timestamp.now(tz=NY)
    rows = []
    done = read_journal()
    final = set((done[done.status != "pending"].market + done[done.status != "pending"].date_ny))
    for d in dates:
        close = pd.Timestamp(datetime.combine(d, datetime.min.time())).tz_localize(NY) + pd.Timedelta(hours=16, minutes=1)
        if now_ny < close:
            print(f"{d}: US session not finished yet, skipped")
            continue
        for market, fn in (("NASDAQ", live_nasdaq), ("GOLD", live_gold)):
            if market + d.isoformat() in final:
                continue
            try:
                r = fn(d)
            except Exception as e:  # never stop the journal because one fetch failed
                r = {"market": market, "date_ny": d.isoformat(), "status": "pending", "reason": f"data error: {e}"}
            rows.append(r)
            print(market, d, r["status"], r.get("reason", ""), r.get("direction", ""), r.get("R", ""))
    if rows:
        write_rows(rows)


# ---------------------------------------------------------------- weekly report
def weekly():
    j = read_journal()
    lines = ["# Paper-trading journal: weekly report", "",
             "Simulated trades only, no orders were placed. Rules exactly as in each market's FINAL-STRATEGY.md.",
             "Prices: Hyperliquid xyz:XYZ100 (Nasdaq 100) and xyz:GOLD, 1-minute candles. R = the 1% risked per trade.",
             "Costs as in the backtests (Nasdaq 2.0 points, gold 0.40 USD). 'After est. fees' assumes 0.05% of the position",
             "value per side (an assumption).", ""]
    t = j[j.status == "trade"].copy()
    if t.empty:
        lines += ["No trades recorded yet.", ""]
    else:
        t["R"] = t.R.astype(float)
        t["Rf"] = t.R_after_est_fees.astype(float)
        t["week"] = pd.to_datetime(t.date_ny).dt.to_period("W-SUN").astype(str)
        for market, expect in (("NASDAQ", "+0.04 to +0.08 R per trade, about 1 trade every 4 days"),
                               ("GOLD", "about +0.02 (unseen years) to +0.09 R per trade (2019-26), most weekdays")):
            x = t[t.market == market]
            lines += [f"## {market}", "", f"Backtest expectation: {expect}.", ""]
            if x.empty:
                lines += ["No trades yet.", ""]
                continue
            lines += ["| Week | Trades | Wins | Losses | Result (R) | Running total (R) | After est. fees (R) |",
                      "|---|---|---|---|---|---|---|"]
            run_tot = 0.0
            for wk, g in x.groupby("week"):
                run_tot += g.R.sum()
                lines.append(f"| {wk} | {len(g)} | {(g.R > 0).sum()} | {(g.R <= 0).sum()} | {g.R.sum():+.2f} | "
                             f"{run_tot:+.2f} | {g.Rf.sum():+.2f} |")
            lines += ["", f"Total: {len(x)} trades, {(x.R > 0).mean() * 100:.0f}% winners, {x.R.sum():+.2f} R "
                          f"({x.R.mean():+.3f} R per trade); after est. fees {x.Rf.sum():+.2f} R.", ""]
            lines += ["Trades:", "", "| Date | Direction | Entry (Doha) | Entry | Stop | Exit (Doha) | Exit | How it ended | R |",
                      "|---|---|---|---|---|---|---|---|---|"]
            for _, r in x.iterrows():
                lines.append(f"| {r.date_ny} | {r.direction} | {r.entry_time_doha} | {r.entry} | {r.stop} | "
                             f"{r.exit_time_doha} | {r.exit} | {r.exit_type} | {float(r.R):+.2f} |")
            lines.append("")
    nt = j[j.status != "trade"]
    if not nt.empty:
        lines += ["## Days without a trade", "", "| Date | Market | Reason |", "|---|---|---|"]
        for _, r in nt.iterrows():
            lines.append(f"| {r.date_ny} | {r.market} | {r.reason} |")
    (HERE / "weekly-report.md").write_text("\n".join(lines) + "\n")
    print("wrote", HERE / "weekly-report.md")


# ---------------------------------------------------------------- validation against the backtests
def validate():
    """Replay Sep 2026 on the backtest data file and compare with Agent 2's trade lists."""
    ok = True
    m = pd.read_csv(ROOT / "trading/data/NSXUSD_M1.csv.gz", parse_dates=["time_utc"])
    m = m[m.time_utc >= "2026-07-01"]
    mny = local(m, NY)
    cache = {}

    def st(k):
        if k not in cache:
            cache[k] = session_stats(mny, k)
        return cache[k]

    bt = pd.read_csv(ROOT / "trading/NASDAQ/backtest/trades_v1.csv")
    bt = bt[bt.date.astype(str).str.startswith("2026-09")]
    days = pd.bdate_range("2026-09-01", "2026-09-30")
    mine = []
    for d in days:
        d = d.date()
        r = nasdaq_day(d, st(d), st(prev_weekday(d)), nasdaq_atr_pct(st, d))
        if r["status"] == "trade":
            mine.append((d.isoformat(), r["direction"], round(float(r["R"]), 2)))
    theirs = [(str(r.date), str(r.direction).upper(), round(float(r.r), 2)) for _, r in bt.iterrows()]
    print("NASDAQ Sep 2026  paper engine:", mine)
    print("NASDAQ Sep 2026  Agent 2     :", theirs)
    ok &= [x[:2] for x in mine] == [x[:2] for x in theirs]

    g = pd.read_csv(ROOT / "trading/data/XAUUSD_M1.csv.gz", parse_dates=["time_utc"])
    g = g[g.time_utc >= "2026-08-25"]
    gb = pd.read_csv(ROOT / "trading/XAUUSD/backtest/trades_v3.csv")
    gb = gb[gb.date.astype(str).str.startswith("2026-09")]
    mine = []
    for d in pd.bdate_range("2026-09-01", "2026-09-30"):
        d = d.date()
        r = gold_day(d, g)
        if r["status"] == "trade":
            mine.append((d.isoformat(), r["direction"], round(float(r["R"]), 2)))
    theirs = [(str(r.date), str(r.direction).upper(), round(float(r.R), 2)) for _, r in gb.iterrows()]
    print("GOLD   Sep 2026  paper engine:", mine)
    print("GOLD   Sep 2026  Agent 2     :", theirs)
    ok &= [x[:2] for x in mine] == [x[:2] for x in theirs]
    print("MATCH" if ok else "MISMATCH")
    return ok


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "run"
    if cmd == "run":
        if "--date" in sys.argv:
            ds = [date.fromisoformat(sys.argv[sys.argv.index("--date") + 1])]
        else:
            today = pd.Timestamp.now(tz=NY).date()
            ds = [today - timedelta(days=k) for k in (3, 2, 1, 0)]
            ds = [d for d in ds if d.weekday() < 5]
        run(ds)
    elif cmd == "weekly":
        weekly()
    elif cmd == "validate":
        sys.exit(0 if validate() else 1)
