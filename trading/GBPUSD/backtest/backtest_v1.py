"""GBPUSD strategy v1 backtest (Agent 2, Backtest & Performance Manager).

Written independently from the rules text in trading/GBPUSD/strategy.md (v1).
No code from trading/GBPUSD/research/ is imported or copied; only the list of
news DATES in research/news_calendar.py is read, to label news days.

Run:   python3 trading/GBPUSD/backtest/backtest_v1.py            (main 12 months, clock fixed)

       python3 trading/GBPUSD/backtest/backtest_v1.py prior      (extra year Oct 2024-Sep 2025, clock fixed)
Output (same folder): trades_v1[_tag].csv, summary_v1[_tag].txt, weekly_v1.csv (main run only)

CLOCK FIX (data cleaning, not a rule change): the HistData file is converted to UTC as if its stamps
were New York time with US summer time. That is right most of the year, but in the weeks when the
US is already/still on summer time and the UK is not (about 2 Mar-end Mar and late Oct-early Nov),
the stamps are one hour EARLY. Proof in the main file: FOMC 18 Mar 2026 (14:00 NY) shows its spike at
13:00; BoE 19 Mar 2026 (08:00 NY) at 07:00; the Sunday open shows 16:00 NY instead of 17:00 only in
exactly those weeks. Fix: add 1 hour to every bar when New York is on summer time and London is not.

How each rule is coded (rule numbers from strategy.md):
 1  Trading day = 17:00 NY -> 17:00 NY. Day label = NY date of (time + 7h), so Sunday 17:00 NY
    belongs to Monday. Any bars stamped Sat/Sun are merged into Monday (only happens without the clock fix).
    PDH/PDL = high/low of the previous trading day. If that day has fewer than 700 one-minute bars
    (25 Dec holiday stub, 25 Sep 2026 feed gap), the day is skipped: its true high/low is unknown.
 2  15-minute candles built from 1-minute bid bars, aligned to the NY clock.
 3  Window = the 12 candles opening 08:00..10:45 NY. Day skipped if any of the 12 candles is missing.
 4/5 Setup and confirmation exactly as written; short checked first.
 6  Entry = close of the confirmation candle (bid), at the candle's close time.
 7  Stop = highest high (short) / lowest low (long) of window candles so far, +/- 2 pips.
 8  Target = 2 x (entry-to-stop distance).
 10 One trade per day max.
 11 Forced close at 16:00 NY = close of the 15:59 NY one-minute bar.
 Exit walk on 1-minute bars starting with the first minute after entry. If stop and target are
 both touched in one minute, the stop counts. If a minute OPENS beyond the stop (gap), the fill is
 at that open (worse than the stop); the target is always filled at the target price, never better.
 Cost: 1.5 pips per trade, subtracted from every result. R = (pips won - 1.5) / stop size in pips.
"""
from pathlib import Path
import ast
import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]                      # trading/
DATA = ROOT / "data" / "GBPUSD_M1.csv.gz"
NEWS_FILE = ROOT / "GBPUSD" / "research" / "news_calendar.py"

PIP = 0.0001
COST = 1.5 * PIP
STOP_BUFFER = 2 * PIP
RR = 2.0
MIN_PREV_BARS = 700            # a normal day has ~1,380-1,440 one-minute bars
DEV_END = pd.Timestamp("2026-06-30").date()
HIDDEN_START = pd.Timestamp("2026-07-01").date()
NY, DOHA = "America/New_York", "Asia/Qatar"


# ---------------------------------------------------------------- news dates
def dev_news_dates():
    """Read the date strings from Agent 1's EVENTS list without executing his code."""
    tree = ast.parse(NEWS_FILE.read_text())
    dates = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.ListComp):
            # [(d, "08:30", tz, "NFP") for d in [...]]
            label = node.elt.elts[3].value
            for c in node.generators[0].iter.elts:
                dates.setdefault(c.value, []).append(label)
    return dates


# Hidden period (Jul-Sep 2026) is NOT in Agent 1's list. Candidate dates below are Agent 2's own,
# from the public release schedules as remembered; each one is kept only if the price data shows
# a real release spike (5-minute range from the release minute >= 2x the normal for that minute).
HIDDEN_CANDIDATES = [
    *[(d, "08:30", NY, "NFP") for d in ["2026-07-02", "2026-08-07", "2026-09-04"]],
    *[(d, "08:30", NY, "US CPI") for d in ["2026-07-14", "2026-08-12", "2026-09-11", "2026-09-10"]],
    *[(d, "14:00", NY, "FOMC") for d in ["2026-07-29", "2026-09-16"]],
    *[(d, "12:00", "Europe/London", "BoE") for d in ["2026-07-30", "2026-08-06", "2026-09-17"]],
    *[(d, "07:00", "Europe/London", "UK CPI") for d in ["2026-07-15", "2026-08-19", "2026-09-16"]],
]


def spike_ratio(m1, d, hhmm, tz):
    """5-min range starting at the release minute, divided by the median of the same 5 minutes on other weekdays."""
    t = pd.Timestamp(f"{d} {hhmm}").tz_localize(tz).tz_convert("UTC").tz_localize(None)
    seg = m1.loc[t:t + pd.Timedelta(minutes=4)]
    if seg.empty:
        return np.nan
    rng = seg.high.max() - seg.low.min()
    ref = []
    for k in range(1, 21):
        tt = pd.Timestamp(f"{d} {hhmm}") - pd.Timedelta(days=k)
        if tt.weekday() >= 5:
            continue
        tu = tt.tz_localize(tz).tz_convert("UTC").tz_localize(None)
        s = m1.loc[tu:tu + pd.Timedelta(minutes=4)]
        if not s.empty:
            ref.append(s.high.max() - s.low.min())
    return rng / np.median(ref) if ref else np.nan


# ---------------------------------------------------------------- load
def load(path=DATA, fix_clock=False):
    # The data files themselves are now clock-corrected (see trading/tools/fetch_histdata.py),
    # so fix_clock must stay False; True would shift the mismatch weeks a second time.
    df = pd.read_csv(path, parse_dates=["time_utc"])
    if fix_clock:
        u = df["time_utc"].dt.tz_localize("UTC")
        ny_summer = u.dt.tz_convert(NY).apply(lambda x: x.utcoffset()) == pd.Timedelta(hours=-4)
        uk_summer = u.dt.tz_convert("Europe/London").apply(lambda x: x.utcoffset()) == pd.Timedelta(hours=1)
        mismatch = ny_summer & ~uk_summer
        df.loc[mismatch, "time_utc"] = df.loc[mismatch, "time_utc"] + pd.Timedelta(hours=1)
    df = df.sort_values("time_utc").drop_duplicates("time_utc").set_index("time_utc")
    ny = df.index.tz_localize("UTC").tz_convert(NY)
    df["ny"] = ny
    td = pd.Series(ny + pd.Timedelta(hours=7), index=df.index).dt.normalize().dt.tz_localize(None)
    # The feed sometimes opens on Sunday at 16:00 NY (one hour before 17:00). Those few bars are
    # part of the week's first session, so they are merged into Monday's trading day (rule 1).
    wd = td.dt.weekday
    td = td + pd.to_timedelta(np.where(wd == 6, 1, np.where(wd == 5, 2, 0)), unit="D")
    df["tday"] = td.dt.date.values
    return df


def run(path=DATA, fix_clock=False, label_news=True):
    m1 = load(path, fix_clock)
    news = dev_news_dates() if label_news else {}
    hidden_news_check = []
    for d, hhmm, tz, lab in (HIDDEN_CANDIDATES if label_news else []):
        r = spike_ratio(m1, d, hhmm, tz)
        hidden_news_check.append((d, lab, r))
        if r >= 2.0:
            news.setdefault(d, []).append(lab)

    daily = m1.groupby("tday").agg(high=("high", "max"), low=("low", "min"), n=("open", "size"))
    tdays = list(daily.index)

    # 15-minute candles on the NY clock, window only (08:00-10:45 opens) + exit data per day
    trades, skipped = [], []
    ny_col = m1["ny"]
    for i in range(1, len(tdays)):
        day, prev = tdays[i], tdays[i - 1]
        pdh, pdl = daily.loc[prev, "high"], daily.loc[prev, "low"]
        dm = m1[m1["tday"] == day]
        if daily.loc[prev, "n"] < MIN_PREV_BARS:
            # Previous day's data is incomplete (holiday stub or feed gap): its true high/low is unknown.
            skipped.append((day, f"previous day {prev} has only {daily.loc[prev, 'n']} one-minute bars"))
            continue
        if dm.empty:
            continue
        nyd = dm["ny"]
        w_start = pd.Timestamp(f"{day} 08:00").tz_localize(NY)
        w_end = pd.Timestamp(f"{day} 11:00").tz_localize(NY)
        f_close = pd.Timestamp(f"{day} 16:00").tz_localize(NY)
        w = dm[(nyd >= w_start) & (nyd < w_end)]
        if w.empty:
            skipped.append((day, "no window data"))
            continue
        bucket = w["ny"].dt.floor("15min")
        c15 = w.groupby(bucket).agg(open=("open", "first"), high=("high", "max"),
                                    low=("low", "min"), close=("close", "last"))
        if len(c15) < 12:
            skipped.append((day, f"only {len(c15)} of 12 window candles"))
            continue

        short_setup = long_setup = False
        hh, ll = -np.inf, np.inf
        sig = None
        for t, c in c15.iterrows():
            hh, ll = max(hh, c.high), min(ll, c.low)
            if c.high > pdh:
                short_setup = True
            if c.low < pdl:
                long_setup = True
            if short_setup and c.close < pdh:
                sig = ("short", t, c.close, hh + STOP_BUFFER)
                break
            if long_setup and c.close > pdl:
                sig = ("long", t, c.close, ll - STOP_BUFFER)
                break
        if sig is None:
            continue

        side, ct, entry, stop = sig
        entry_time = ct + pd.Timedelta(minutes=15)
        risk = abs(entry - stop)
        d = 1 if side == "long" else -1
        target = entry + d * RR * risk
        path = dm[(nyd >= entry_time) & (nyd < f_close)]
        exit_px = exit_t = reason = None
        for t, b in path.iterrows():
            if d == -1:
                if b.high >= stop:
                    exit_px, reason = (max(b.open, stop), "stop")
                elif b.low <= target:
                    exit_px, reason = (target, "target")
            else:
                if b.low <= stop:
                    exit_px, reason = (min(b.open, stop), "stop")
                elif b.high >= target:
                    exit_px, reason = (target, "target")
            if reason:
                exit_t = b["ny"]
                break
        if reason is None:
            if len(path) and path["ny"].iloc[-1] >= f_close - pd.Timedelta(minutes=30):
                exit_px, exit_t, reason = path["close"].iloc[-1], f_close, "16:00 close"
            elif len(path):
                exit_px, exit_t, reason = path["close"].iloc[-1], path["ny"].iloc[-1], "end of data"
            else:
                exit_px, exit_t, reason = entry, entry_time, "no data after entry"
        pips = d * (exit_px - entry) / PIP
        R = (pips - COST / PIP) / (risk / PIP)
        nlab = news.get(str(day), [])
        trades.append(dict(
            date=str(day),
            weekday=pd.Timestamp(day).day_name()[:3],
            doha_entry=entry_time.tz_convert(DOHA).strftime("%H:%M"),
            ny_entry=entry_time.strftime("%H:%M"),
            direction=side,
            entry=round(entry, 5), stop=round(stop, 5), target=round(target, 5),
            stop_pips=round(risk / PIP, 1),
            exit_reason=reason,
            exit_ny=exit_t.strftime("%H:%M"),
            exit_doha=exit_t.tz_convert(DOHA).strftime("%H:%M"),
            exit_price=round(exit_px, 5),
            pips_after_cost=round(pips - COST / PIP, 1),
            R=round(R, 3),
            news_day=("yes" if nlab else "no") if label_news else "not labelled",
            news_event="+".join(nlab),
            pdh=round(pdh, 5), pdl=round(pdl, 5),
            period=("dev" if day <= DEV_END else "hidden") if label_news else "prior",
        ))
    return pd.DataFrame(trades), skipped, hidden_news_check, tdays


# ---------------------------------------------------------------- stats
def stats(t):
    if len(t) == 0:
        return dict(n=0)
    r = t["R"].values
    wins, losses = r[r > 0], r[r <= 0]
    cum = np.cumsum(r)
    peak = np.maximum.accumulate(np.concatenate([[0], cum]))[1:]
    dd_r = (cum - peak).min()
    eq = np.cumprod(1 + 0.01 * r)
    eqp = np.maximum.accumulate(np.concatenate([[1], eq]))[1:]
    dd_pct = ((eq / eqp) - 1).min() * 100
    streak = best = 0
    streaks = []
    for x in r:
        if x <= 0:
            streak += 1
        else:
            if streak:
                streaks.append(streak)
            streak = 0
        best = max(best, streak)
    if streak:
        streaks.append(streak)
    return dict(
        n=len(r), win_rate=100 * len(wins) / len(r),
        avg_win=wins.mean() if len(wins) else 0, avg_loss=losses.mean() if len(losses) else 0,
        total_R=r.sum(), avg_R=r.mean(),
        pf=wins.sum() / -losses.sum() if losses.sum() < 0 else np.inf,
        max_dd_R=min(dd_r, 0), max_dd_pct=min(dd_pct, 0),
        longest_losing=best, streaks_3plus=sum(s >= 3 for s in streaks),
        account_pct=(eq[-1] - 1) * 100,
    )


def fmt(s):
    if s.get("n", 0) == 0:
        return "no trades"
    return (f"trades {s['n']:3d} | win {s['win_rate']:4.1f}% | avg win {s['avg_win']:+.2f}R "
            f"avg loss {s['avg_loss']:+.2f}R | total {s['total_R']:+6.2f}R (avg {s['avg_R']:+.3f}) | "
            f"PF {s['pf']:.2f} | max DD {s['max_dd_R']:.2f}R / {s['max_dd_pct']:.1f}% | "
            f"longest losing run {s['longest_losing']} | 3+ loss runs {s['streaks_3plus']} | "
            f"account {s['account_pct']:+.1f}%")


def brk(t, col):
    out = []
    for k, g in t.groupby(col, sort=True):
        s = stats(g)
        out.append(f"    {str(k):<14} n={s['n']:3d} win={s['win_rate']:5.1f}% total={s['total_R']:+6.2f}R "
                   f"avg={s['avg_R']:+.3f}R PF={s['pf']:.2f}")
    return "\n".join(out)


def main(tag=""):
    if tag == "prior":
        t, skipped, hn, tdays = run(ROOT / "data" / "extra" / "GBPUSD_M1_2024-10_2025-09.csv.gz", False, False)
    else:
        t, skipped, hn, tdays = run(DATA, False, True)
    sfx = f"_{tag}" if tag else ""
    t.to_csv(HERE / f"trades_v1{sfx}.csv", index=False)
    t["month"] = t["date"].str[:7]
    t["stop_band"] = pd.cut(t["stop_pips"], [0, 8, 15, 1e9], labels=["a) <=8p", "b) 8-15p", "c) >15p"])
    lines = [f"GBPUSD v1 backtest (Agent 2) [{tag or 'main, clock fixed'}]. Cost 1.5 pips/trade. R after costs.", ""]
    lines.append("Skipped days (missing window data): " + ", ".join(f"{d} ({w})" for d, w in skipped))
    lines.append("Hidden-period news candidates (spike ratio; kept if >= 2.0): " +
                 ", ".join(f"{d} {l} {r:.1f}x" for d, l, r in hn))
    lines.append("")
    groups = ([("PRIOR YEAR 2024-10-01..2025-09-30", t)] if tag == "prior" else
              [("DEVELOPMENT 2025-10-01..2026-06-30", t[t.period == "dev"]),
               ("HIDDEN 2026-07-01..2026-09-30", t[t.period == "hidden"]),
               ("FULL 12 MONTHS", t)])
    for name, g in groups:
        lines.append(f"=== {name}")
        lines.append("  " + fmt(stats(g)))
        lines.append("  exits: " + str(g["exit_reason"].value_counts().to_dict()))
        lines.append(f"  median stop {g['stop_pips'].median():.1f} pips, smallest {g['stop_pips'].min():.1f}, largest {g['stop_pips'].max():.1f}")
        for col, lab in [("direction", "long/short"), ("news_day", "news day"), ("month", "month"),
                         ("exit_reason", "exit type"),
                         ("stop_band", "stop size"), ("weekday", "weekday"), ("ny_entry", "NY entry time")]:
            lines.append(f"  by {lab}:")
            lines.append(brk(g, col))
        lines.append("")
    if tag == "prior":
        r = t["R"].values
        boot = np.random.default_rng(1).choice(r, size=(20000, len(r)), replace=True).mean(axis=1)
        lines.append(f"chance true average <= 0: {100 * (boot <= 0).mean():.1f}%")
        (HERE / f"summary_v1{sfx}.txt").write_text("\n".join(lines) + "\n")
        print("\n".join(lines))
        return
    # weekly table (Mon-Fri), every week in the data, including weeks with no trades
    all_days = pd.to_datetime(pd.Series([str(d) for d in tdays]))
    t["dt"] = pd.to_datetime(t["date"])
    weeks = sorted(set((all_days - pd.to_timedelta(all_days.dt.weekday, unit="D")).dt.date))
    rows, run_tot = [], 0.0
    for wk in weeks:
        wk = pd.Timestamp(wk)
        g = t[(t.dt >= wk) & (t.dt <= wk + pd.Timedelta(days=4))]
        tot = g["R"].sum()
        run_tot += tot
        notes = []
        for _, x in g.iterrows():
            if x.news_day == "yes":
                notes.append(f"{x.weekday} news ({x.news_event}) {x.R:+.2f}R")
        if (g["R"] <= -0.9).sum() >= 2:
            notes.append(f"{(g['R'] <= 0).sum()} losses")
        per = "dev" if wk.date() <= DEV_END else "hidden"
        if wk.date() <= DEV_END < (wk + pd.Timedelta(days=4)).date():
            per = "dev/hidden"
        rows.append(dict(week=f"{wk:%d %b %Y} - {wk + pd.Timedelta(days=4):%d %b %Y}", period=per,
                         trades=len(g), wins=int((g.R > 0).sum()), losses=int((g.R <= 0).sum()),
                         win_rate=(f"{100 * (g.R > 0).mean():.0f}%" if len(g) else "-"),
                         result_R=round(tot, 2), running_R=round(run_tot, 2), notes="; ".join(notes)))
    pd.DataFrame(rows).to_csv(HERE / f"weekly_v1{sfx}.csv", index=False)
    wk = pd.DataFrame(rows)
    lines.append(f"Weeks: {len(wk)}, losing weeks {(wk.result_R < 0).sum()}, flat/no-trade weeks {(wk.result_R == 0).sum()}, "
                 f"winning weeks {(wk.result_R > 0).sum()}")
    # robustness: bootstrap chance the true average is <= 0, higher costs, without the best trades
    rng = np.random.default_rng(1)
    lines.append("")
    lines.append("Robustness checks:")
    for name, g in [("dev", t[t.period == "dev"]), ("hidden", t[t.period == "hidden"]), ("full", t)]:
        r = g["R"].values
        boot = rng.choice(r, size=(20000, len(r)), replace=True).mean(axis=1)
        risk = g["stop_pips"].values
        extra = {c: ((r * risk) - (c - 1.5)) / risk for c in (2.0, 3.0)}
        best3 = np.sort(r)[:-3].sum()
        lines.append(f"  {name:6s} chance true average <= 0: {100 * (boot <= 0).mean():4.1f}% | "
                     f"total at 2.0 pip cost {extra[2.0].sum():+.2f}R, at 3.0 pip cost {extra[3.0].sum():+.2f}R | "
                     f"without best 3 trades {best3:+.2f}R")
    seq = "".join("W" if x > 0 else "L" for x in t["R"])
    lines.append("  win/loss sequence (full): " + seq)
    (HERE / f"summary_v1{sfx}.txt").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    import sys
    main(sys.argv[1] if len(sys.argv) > 1 else "")
