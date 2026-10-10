"""
GBPUSD v3 "Quiet-Asia breakout": independent backtest by Agent 2 (round 3, 10 Oct 2026).

Written from the rules text in trading/GBPUSD/strategy.md (round-3 section) only.
Agent 1's code in round3/ was NOT imported or copied.

Usage:  python3 trading/GBPUSD/backtest/backtest_v3.py
Output (same folder):
  trades_v3.csv   one row per trade, design (2019 - Sep 2026) and hidden (2016 - 2018)
  days_v3.csv     one row per trading day with the reason it did or did not trade

How the rules are read (see feedback.md for the points that needed a choice):
  * Trading day = 17:00 New York -> 17:00 New York. Saturday/Sunday bars belong to Monday.
  * Asia box = 1-minute bars from 00:00 to 06:59 London time on the trading day's date.
  * Quiet test: Asia range < 0.7 x median Asia range of the previous 20 trading days. "Trading days" = earlier weekdays
    whose Asia box is complete (no hole > 15 min inside 00:00-06:59 London). Fewer than 20 such days = warm-up, no trade.
    (Alternative reading "only days valid under rule 11" is available as hist_mode="fullday"; see feedback.md.)
  * Orders live 07:00-11:59 London. Buy stop triggers when a bar's HIGH is above Asia High (strictly); fill = Asia High,
    or the bar's open if it opened above (gap). Sell stop mirror image. Both levels broken in the same bar = no trade.
  * Stop = other side of the box (at least 3 pips from the fill). Target = fill +/- 2 x (fill - stop).
  * Exits checked bar by bar from the bar AFTER the fill. In the fill bar itself only the stop is checked (cautious).
    Stop and target in the same bar = stop. A stop gapped through fills at the bar open (worse). The target fills at the target.
  * Forced close = close of the 15:59 New York bar (or the last bar before 16:00 NY if that bar is missing).
  * No-trade day: a hole > 15 min between 19:00 NY the evening before and 16:00 NY (edges included), or < 1,300 bars.
  * Costs: data are bid prices. A buy is filled at bid + cost (the whole 1.5-pip round-trip cost is charged once per trade);
    a sell exit (buy back) likewise. Result in R = (move in pips - cost) / (distance from fill to stop in pips).
    So a full stop-out costs slightly more than 1 R.
"""
from pathlib import Path
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]          # .../trading
OUT = Path(__file__).resolve().parent
PIP = 0.0001
COST_PIPS = 1.5
QUIET = 0.7
LOOKBACK = 20
RR = 2.0
MIN_STOP_PIPS = 3.0
MAX_HOLE_MIN = 15
MIN_BARS = 1300

FILES = {
    "hidden": ROOT / "data" / "hidden" / "GBPUSD_M1_2016-2018.csv.gz",
    "design": ROOT / "data" / "GBPUSD_M1.csv.gz",
}
END_DESIGN = pd.Timestamp("2026-09-30")


# ---------------------------------------------------------------- simple news labels (rule based, approximate)
FOMC = """2016-01-27 2016-03-16 2016-04-27 2016-06-15 2016-07-27 2016-09-21 2016-11-02 2016-12-14
2017-02-01 2017-03-15 2017-05-03 2017-06-14 2017-07-26 2017-09-20 2017-11-01 2017-12-13
2018-01-31 2018-03-21 2018-05-02 2018-06-13 2018-08-01 2018-09-26 2018-11-08 2018-12-19
2019-01-30 2019-03-20 2019-05-01 2019-06-19 2019-07-31 2019-09-18 2019-10-30 2019-12-11
2020-01-29 2020-03-03 2020-04-29 2020-06-10 2020-07-29 2020-09-16 2020-11-05 2020-12-16
2021-01-27 2021-03-17 2021-04-28 2021-06-16 2021-07-28 2021-09-22 2021-11-03 2021-12-15
2022-01-26 2022-03-16 2022-05-04 2022-06-15 2022-07-27 2022-09-21 2022-11-02 2022-12-14
2023-02-01 2023-03-22 2023-05-03 2023-06-14 2023-07-26 2023-09-20 2023-11-01 2023-12-13
2024-01-31 2024-03-20 2024-05-01 2024-06-12 2024-07-31 2024-09-18 2024-11-07 2024-12-18
2025-01-29 2025-03-19 2025-05-07 2025-06-18 2025-07-30 2025-09-17 2025-10-29 2025-12-10
2026-01-28 2026-03-18 2026-04-29 2026-06-17 2026-07-29 2026-09-16""".split()
FOMC = {pd.Timestamp(d).date() for d in FOMC}


def nfp_dates(y0=2015, y1=2026):
    """US jobs report: 3rd Friday after the Saturday ending the week that contains the 12th (BLS rule).
    New Year's Day -> one week later. Approximate (shutdown delays are not modelled)."""
    out = set()
    for y in range(y0, y1 + 1):
        for m in range(1, 13):
            d12 = pd.Timestamp(year=y, month=m, day=12)
            sat = d12 + pd.Timedelta(days=(5 - d12.weekday()) % 7)
            rel = sat + pd.Timedelta(days=20)
            if rel.month == 1 and rel.day == 1:
                rel += pd.Timedelta(days=7)
            out.add(rel.date())
    return out


NFP = nfp_dates()


def news_label(d):
    tags = []
    if d in NFP:
        tags.append("NFP")
    if d in FOMC:
        tags.append("FOMC")
    if d == pd.Timestamp("2016-06-24").date():
        tags.append("BREXIT-RESULT")
    if d == pd.Timestamp("2016-06-23").date():
        tags.append("BREXIT-VOTE")
    return "+".join(tags)


# ---------------------------------------------------------------- data
def load(period):
    df = pd.read_csv(FILES[period], parse_dates=["time_utc"])
    utc = df["time_utc"].dt.tz_localize("UTC")
    ny = utc.dt.tz_convert("America/New_York")
    ldn = utc.dt.tz_convert("Europe/London")
    df["ny"] = ny.dt.tz_localize(None)
    df["ldn"] = ldn.dt.tz_localize(None)
    df["doha"] = utc.dt.tz_convert("Asia/Qatar").dt.tz_localize(None)
    td = (df["ny"] + pd.Timedelta(hours=7)).dt.normalize()
    wd = td.dt.weekday
    td = td + pd.to_timedelta(np.where(wd == 5, 2, np.where(wd == 6, 1, 0)), unit="D")
    df["td"] = td
    if period == "design":
        df = df[df["td"] <= END_DESIGN]
    return df.reset_index(drop=True)


def has_hole(times, start, end):
    """True if there is a gap of more than MAX_HOLE_MIN minutes inside [start, end), edges included."""
    t = times[(times >= start) & (times < end)]
    if len(t) == 0:
        return True
    pts = np.concatenate([[start], t, [end - pd.Timedelta(minutes=1)]]).astype("datetime64[m]").astype(np.int64)
    return bool((np.diff(pts) > MAX_HOLE_MIN).any())


def run(period, cost_pips=COST_PIPS, hist_mode="box"):
    df = load(period)
    days, trades = [], []
    # Asia ranges of previous trading days used for the 20-day median.
    # hist_mode "box" (MAIN): every earlier weekday whose Asia box (00:00-06:59 London) is complete, holidays included
    #   (this is what a trader sees on a broker chart without data holes).
    # hist_mode "fullday" (alternative): only earlier days that are valid trading days under rule 11.
    # Agent 1 instead takes the previous 20 day-rows (min. 15 values) and also counts boxes that have data holes.
    hist = []
    for td, g in df.groupby("td", sort=True):
        d = td.date()
        ny = g["ny"].values
        ldn = g["ldn"]
        rec = {"day": d, "period": period, "weekday": td.day_name()[:3], "bars": len(g), "news": news_label(d)}
        # Asia box (London clock)
        l0 = pd.Timestamp(d)
        box = g[(ldn >= l0) & (ldn < l0 + pd.Timedelta(hours=7))]
        box_ok = len(box) > 0 and not has_hole(box["ldn"].values, l0, l0 + pd.Timedelta(hours=7))
        hi = box["high"].max() if len(box) else np.nan
        lo = box["low"].min() if len(box) else np.nan
        rng = (hi - lo) / PIP if box_ok else np.nan
        med = float(np.median(hist[-LOOKBACK:])) if len(hist) >= LOOKBACK else np.nan
        rec.update(asia_hi=hi, asia_lo=lo, asia_range_p=round(rng, 1) if box_ok else np.nan,
                   median20_p=round(med, 2) if med == med else np.nan)
        # day validity (rule 11)
        prev19 = pd.Timestamp(d) - pd.Timedelta(days=1) + pd.Timedelta(hours=19)
        ny16 = pd.Timestamp(d) + pd.Timedelta(hours=16)
        full_day = len(g) >= MIN_BARS and not has_hole(ny, prev19, ny16)
        if box_ok and (hist_mode == "box" or full_day):
            hist.append(rng)
        if len(g) < MIN_BARS:
            rec["status"] = "skip: fewer than 1,300 bars (holiday/short day)"
        elif has_hole(ny, prev19, ny16):
            rec["status"] = "skip: data hole > 15 min"
        elif med != med:
            rec["status"] = "skip: warm-up (fewer than 20 earlier days)"
        elif not rng < QUIET * med:
            rec["status"] = "no setup: Asia not quiet"
        else:
            rec["status"] = "setup"
        if rec["status"] != "setup":
            days.append(rec)
            continue
        # orders 07:00-11:59 London
        win = g[(ldn >= l0 + pd.Timedelta(hours=7)) & (ldn < l0 + pd.Timedelta(hours=12))]
        side = 0
        for i in range(len(win)):
            r = win.iloc[i]
            up, dn = r.high > hi, r.low < lo
            if up and dn:
                side = 9
                break
            if up or dn:
                side = 1 if up else -1
                fill = max(r.open, hi) if up else min(r.open, lo)
                fill_idx = win.index[i]
                break
        if side == 0:
            rec["status"] = "setup, no breakout by 11:59 London"
            days.append(rec)
            continue
        if side == 9:
            rec["status"] = "setup, both sides broken in the same minute"
            days.append(rec)
            continue
        stop = lo if side == 1 else hi
        if abs(fill - stop) < MIN_STOP_PIPS * PIP:
            stop = fill - side * MIN_STOP_PIPS * PIP
        risk = abs(fill - stop)
        target = fill + side * RR * risk
        # manage: fill bar (stop only), then following bars to the 15:59 NY bar
        after = g.loc[fill_idx:]
        after = after[after["ny"] < ny16]
        exit_px, exit_type, exit_time = None, None, None
        for j in range(len(after)):
            b = after.iloc[j]
            if side == 1:
                hit_stop = b.low <= stop
                hit_tgt = b.high >= target and j > 0
            else:
                hit_stop = b.high >= stop
                hit_tgt = b.low <= target and j > 0
            if hit_stop:
                exit_px = (min(b.open, stop) if side == 1 else max(b.open, stop)) if j > 0 else stop
                exit_type, exit_time = "stop", b
                break
            if hit_tgt:
                exit_px, exit_type, exit_time = target, "target", b
                break
        if exit_px is None:
            b = after.iloc[-1]
            exit_px, exit_type, exit_time = b.close, "15:59 NY close", b
        fb = g.loc[fill_idx]
        gross = side * (exit_px - fill) / PIP
        risk_p = risk / PIP
        R = (gross - cost_pips) / risk_p
        rec["status"] = "TRADE"
        days.append(rec)
        trades.append({
            "period": period, "date": d, "weekday": rec["weekday"],
            "direction": "LONG" if side == 1 else "SHORT",
            "fill_london": fb["ldn"].strftime("%H:%M"), "fill_ny": fb["ny"].strftime("%H:%M"),
            "fill_doha": fb["doha"].strftime("%H:%M"),
            "asia_high": hi, "asia_low": lo, "asia_range_p": round(rng, 1), "median20_p": round(med, 2),
            "ratio": round(rng / med, 3),
            "entry": round(fill, 5), "gapped_fill": bool(fill != (hi if side == 1 else lo)),
            "stop": round(stop, 5), "target": round(target, 5), "risk_p": round(risk_p, 1),
            "exit": round(exit_px, 5), "exit_type": exit_type,
            "exit_ny": exit_time["ny"].strftime("%H:%M"), "exit_doha": exit_time["doha"].strftime("%H:%M"),
            "gross_p": round(gross, 1), "R": round(R, 4), "news": rec["news"],
        })
    return pd.DataFrame(trades), pd.DataFrame(days)


if __name__ == "__main__":
    T, D = [], []
    for p in ["hidden", "design"]:
        t, d = run(p)
        T.append(t)
        D.append(d)
        print(p, len(t), "trades", round(t["R"].sum(), 2), "R")
    T = pd.concat(T, ignore_index=True)
    D = pd.concat(D, ignore_index=True)
    T.to_csv(OUT / "trades_v3.csv", index=False)
    D.to_csv(OUT / "days_v3.csv", index=False)
    print(D.groupby(["period", "status"]).size())
    # alternative reading of the 20-day median (only earlier days that are valid under rule 11)
    A = pd.concat([run(p, hist_mode="fullday")[0] for p in ["hidden", "design"]], ignore_index=True)
    A.to_csv(OUT / "trades_v3_alt_median.csv", index=False)
    print("alt median reading:", A.groupby("period")["R"].agg(["size", "sum"]))
