"""
XAUUSD v3 "Follow London's break of an ACTIVE Asia box" -- independent backtest by Agent 2 (round 3).
Written from the rules text in trading/XAUUSD/strategy.md (round-3 section) only. Nothing from round3/ is imported or copied.

Data: hidden test 2016-2018 (data/hidden/XAUUSD_M1_2016-2018.csv.gz) + design file 2019 - Sep 2026 (data/XAUUSD_M1.csv.gz).

CLOCK FIX for the hidden file (found by Agent 2, 10 Oct 2026; switch off with --no-clockfix):
  In 2016-2018, in the 2-3 weeks a year when the US and UK clocks differ (mid-March, late Oct / early Nov), the hidden file is
  ONE HOUR LATE: the jobs-report (NFP) spike shows at 09:30 NY on 4 Nov 2016, 3 Nov 2017 and 2 Nov 2018 (08:30 NY on every other
  first Friday), and the daily break sits at 18:00-19:00 NY instead of 17:00-18:00 NY. This is what happens if the 2016-2018
  raw clock was New York local time but the downloader treated it as "London minus 5 hours". The fix rebuilds the raw clock
  (London time - 5 h) and reads it as New York time. Outside the mismatch weeks nothing changes. The design file is untouched.

Rules as implemented (v3 rule numbers):
  1  Trading day = 18:00 NY (previous evening) -> 17:00 NY; label = date of (NY time + 7 h). Sunday-evening bars belong to Monday.
  2  Asia High / Low = max high / min low of the 1-minute bars opening 00:00..06:59 London on the trading day's date. Box = High - Low.
  3  Trade only if box >= 8 USD.
  4  From the 07:00 London bar: buy stop at Asia High, sell stop at Asia Low. Long triggers when a bar's high > Asia High (strictly),
     short when a bar's low < Asia Low (strictly). Fill = the level, or the bar's open if the bar opens beyond the level (gap).
  5  First fill is the trade; the other order is cancelled. Both levels broken inside the same bar -> no trade.
  6  Stop = other side of the box. Risk = |fill - stop|. In the fill bar, if the stop is also touched -> stop first (loss).
     Later bars: stop hit when low <= stop (long) / high >= stop (short); a bar opening beyond the stop fills at its open.
  7  No target, no break-even, no partials.
  8  Orders expire after the 11:59 London bar.
  9  Forced close = close of the last 1-minute bar before 16:00 NY (normally 15:59).
  11 No-trade days: fewer than 1,300 bars in the trading day; a hole of more than 15 minutes between 18:00 NY (previous evening)
     and 16:00 NY (a gap of more than 16 minutes between bar times, counting 18:00 and 16:00 as the edges); fewer than 300 bars
     in the box period.
  12 One trade a day.
  Costs: round-trip cost taken off every trade (0.40 USD; also 0.80 and 1.20 USD as stress tests on the same trades).
         R = (USD result - cost) / risk. This is the same as "buys pay the spread" for a round trip.
  News label (hindsight, label only, NOT a filter): a "US news shock" day is one where |close 08:44 - close 08:29|,
         |close 10:14 - close 09:59| or |close 14:14 - close 13:59| (NY) is > 3x its median over the previous 20 trading days.

Usage:
  python3 trading/XAUUSD/backtest/backtest_v3.py                 -> trades_v3.csv, days_v3.csv
  python3 trading/XAUUSD/backtest/backtest_v3.py --no-clockfix   -> trades_v3_noclockfix.csv, days_v3_noclockfix.csv
"""
import sys, os
import numpy as np, pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "..", "data", "XAUUSD_M1.csv.gz")
HID = os.path.join(HERE, "..", "..", "data", "hidden", "XAUUSD_M1_2016-2018.csv.gz")
MIN_BOX = 8.0
COSTS = {"R": 0.40, "R_2x": 0.80, "R_3x": 1.20}
CLOCKFIX = "--no-clockfix" not in sys.argv
SUF = "" if CLOCKFIX else "_noclockfix"


def load():
    h = pd.read_csv(HID, parse_dates=["time_utc"])
    if CLOCKFIX:
        raw = h["time_utc"].dt.tz_localize("UTC").dt.tz_convert("Europe/London").dt.tz_localize(None) - pd.Timedelta(hours=5)
        fixed = raw.dt.tz_localize("America/New_York", ambiguous="NaT", nonexistent="NaT").dt.tz_convert("UTC").dt.tz_localize(None)
        moved = int((fixed != h["time_utc"]).sum())
        h["time_utc"] = fixed
        h = h.dropna(subset=["time_utc"])
        print(f"clock fix: {moved} hidden bars moved by 1 hour (mismatch weeks only)")
    h["src"] = "hidden"
    d = pd.read_csv(DATA, parse_dates=["time_utc"])
    d["src"] = "design"
    df = pd.concat([h, d]).drop_duplicates("time_utc").sort_values("time_utc").reset_index(drop=True)
    utc = df["time_utc"].dt.tz_localize("UTC")
    df["ny"] = utc.dt.tz_convert("America/New_York").dt.tz_localize(None)
    df["ld"] = utc.dt.tz_convert("Europe/London").dt.tz_localize(None)
    df["tday"] = (df["ny"] + pd.Timedelta(hours=7)).dt.normalize()
    return df


def fmt(t_utc, tz):
    return pd.Timestamp(t_utc).tz_localize("UTC").tz_convert(tz).strftime("%H:%M")


def main():
    df = load()
    # NFP clock check after the fix: minute of the biggest 1-minute range 07:00-10:59 NY on first Fridays 2016-2018
    hh = df[(df.src == "hidden") & (df.ny.dt.dayofweek == 4) & (df.ny.dt.day <= 7) & (df.ny.dt.hour.between(7, 10))].copy()
    hh["rng"] = hh.high - hh.low
    spikes = hh.loc[hh.groupby(hh.ny.dt.date)["rng"].idxmax(), "ny"].dt.strftime("%H:%M")
    print("first-Friday biggest-minute times (hidden):", spikes.value_counts().to_dict())
    print("hidden bars at 17:xx NY:", int(((df.src == "hidden") & (df.ny.dt.hour == 17)).sum()))

    days, trades = [], []
    shock_raw = []
    for d, g in df.groupby("tday", sort=True):
        ny = g["ny"].values
        ld = g["ld"].values
        o, hi, lo, cl = g["open"].values, g["high"].values, g["low"].values, g["close"].values
        tutc = g["time_utc"].values
        src = g["src"].iloc[0]
        date = pd.Timestamp(d)
        rec = dict(date=date.strftime("%Y-%m-%d"), weekday=date.strftime("%a"), src=src, bars=len(g))
        # news windows (label only)
        def win(a, b):
            ia = np.where(ny == np.datetime64(date + pd.Timedelta(a)))[0]
            ib = np.where(ny == np.datetime64(date + pd.Timedelta(b)))[0]
            return abs(cl[ib[0]] - cl[ia[0]]) if len(ia) and len(ib) else np.nan
        shock_raw.append((rec["date"], win("8h29min", "8h44min"), win("9h59min", "10h14min"), win("13h59min", "14h14min")))
        # rule 11
        start, end = np.datetime64(date - pd.Timedelta(hours=6)), np.datetime64(date + pd.Timedelta(hours=16))
        inside = ny[(ny >= start) & (ny < end)]
        edges = np.concatenate([[start - np.timedelta64(1, "m")], inside, [end]])
        maxhole = (np.diff(edges).max() / np.timedelta64(1, "m")) - 1 if len(edges) > 1 else 9999
        rec["max_hole_min"] = int(maxhole)
        if len(g) < 1300:
            rec["status"] = "skip_thin_day"; days.append(rec); continue
        if maxhole > 15:
            rec["status"] = "skip_hole"; days.append(rec); continue
        a0, a1 = np.datetime64(date), np.datetime64(date + pd.Timedelta(hours=7))
        am = (ld >= a0) & (ld < a1)
        if am.sum() < 300:
            rec["status"] = "skip_thin_box"; days.append(rec); continue
        ah, al = hi[am].max(), lo[am].min()
        box = ah - al
        rec.update(asia_high=round(ah, 3), asia_low=round(al, 3), box=round(box, 3))
        if box < MIN_BOX:
            rec["status"] = "skip_small_box"; days.append(rec); continue
        w1 = np.datetime64(date + pd.Timedelta(hours=12))
        idx = np.where((ld >= a1) & (ld < w1))[0]
        side, k, fill = None, None, None
        for i in idx:
            up, dn = hi[i] > ah, lo[i] < al
            if up and dn:
                side = "both"; k = i; break
            if up:
                side, k, fill = "long", i, max(o[i], ah); break
            if dn:
                side, k, fill = "short", i, min(o[i], al); break
        if side is None:
            rec["status"] = "no_break"; days.append(rec); continue
        if side == "both":
            rec["status"] = "both_same_minute"; days.append(rec); continue
        stop = al if side == "long" else ah
        risk = abs(fill - stop)
        fc = np.datetime64(date + pd.Timedelta(hours=16))
        exit_px, exit_t, reason = None, None, None
        # fill bar: stop first if touched
        if (side == "long" and lo[k] <= stop) or (side == "short" and hi[k] >= stop):
            exit_px, exit_t, reason = stop, tutc[k], "stop (fill minute)"
        else:
            j = k + 1
            last = None
            while j < len(g) and ny[j] < fc:
                last = j
                if side == "long" and lo[j] <= stop:
                    exit_px = min(o[j], stop); reason = "stop gap" if o[j] < stop else "stop"; exit_t = tutc[j]; break
                if side == "short" and hi[j] >= stop:
                    exit_px = max(o[j], stop); reason = "stop gap" if o[j] > stop else "stop"; exit_t = tutc[j]; break
                j += 1
            if reason is None:
                exit_px, exit_t, reason = cl[last], tutc[last] + np.timedelta64(1, "m"), "16:00 close"
        gross = (exit_px - fill) if side == "long" else (fill - exit_px)
        rec["status"] = "trade"; days.append(rec)
        t = dict(date=rec["date"], weekday=rec["weekday"], src=src, year=date.year,
                 doha_entry=fmt(tutc[k], "Asia/Qatar"), ny_entry=fmt(tutc[k], "America/New_York"),
                 london_entry=fmt(tutc[k], "Europe/London"), direction=side,
                 asia_high=round(ah, 3), asia_low=round(al, 3), box=round(box, 3),
                 entry=round(fill, 3), entry_gap="yes" if fill != (ah if side == "long" else al) else "no",
                 stop=round(stop, 3), target="none", risk=round(risk, 3), exit_reason=reason,
                 exit_doha=fmt(exit_t, "Asia/Qatar"), exit_ny=fmt(exit_t, "America/New_York"),
                 exit_price=round(exit_px, 3), gross_usd=round(gross, 3))
        for col, c in COSTS.items():
            t[col] = round((gross - c) / risk, 4)
        trades.append(t)

    days = pd.DataFrame(days)
    tr = pd.DataFrame(trades)
    # news-shock label (hindsight)
    sh = pd.DataFrame(shock_raw, columns=["date", "w0830", "w1000", "w1400"]).set_index("date")
    lab = pd.Series("", index=sh.index)
    for c, name in [("w0830", "08:30"), ("w1000", "10:00"), ("w1400", "14:00")]:
        med = sh[c].rolling(20, min_periods=10).median().shift(1)
        hit = sh[c] > 3 * med
        lab = lab.where(~hit, lab + np.where(lab == "", "", "+") + name)
    tr["news_shock"] = tr["date"].map(lab).fillna("")
    tr["news_day"] = np.where(tr["news_shock"] != "", "yes", "no")
    tr["notes"] = ("London open session; " + tr["weekday"] + "; " + np.where(tr["news_day"] == "yes", "US news shock " + tr["news_shock"] + " NY", "no US news shock")
                   + np.where(tr["src"] == "hidden", "; HIDDEN TEST", ""))
    tr.to_csv(os.path.join(HERE, f"trades_v3{SUF}.csv"), index=False)
    days.to_csv(os.path.join(HERE, f"days_v3{SUF}.csv"), index=False)
    days["year"] = days["date"].str[:4]
    print(pd.crosstab(days["year"], days["status"]).to_string())
    print("trades:", len(tr), "total R:", round(tr["R"].sum(), 2))


if __name__ == "__main__":
    main()
