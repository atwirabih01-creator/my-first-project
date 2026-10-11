"""Final four ORB versions (picked by the declared rule): trade lists + full diagnostics. Output: trades_<MARKET>.csv, out_final.txt"""
import sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import orb_common as c

FINAL = {
    "GBPUSD": dict(opn="FRA", length=60, target=None, filt="wide", label="GBPUSD: Frankfurt/London-early 60-min ORB, wide range only, hold to 16:00 NY"),
    "XAUUSD": dict(opn="FRA", length=15, target=1.5, label="Gold: Frankfurt/London-early 15-min ORB, target 1.5R"),
    "NSXUSD": dict(opn="NY930", length=30, target=1.0, label="Nasdaq 100: NY cash-open 30-min ORB, target 1R"),
    "EURUSD": dict(opn="NY930", length=5, target=None, label="EURUSD: NY cash-open 5-min ORB (range >= 12 pips), hold to 16:00 NY"),
}
FILE = {"GBPUSD": "GBPUSD", "XAUUSD": "XAUUSD", "NSXUSD": "NASDAQ", "EURUSD": "EURUSD"}


def col_to_ny(day, col):
    t = pd.Timestamp(day) - pd.Timedelta(hours=7) + pd.Timedelta(minutes=int(col))
    return t.tz_localize("America/New_York")


def news_tags():
    """Data-detected US release days (descriptive only, found afterwards): 08:30 NY 1-min range > 4x the 08:00-08:29 median
    on EURUSD; same for 14:00 NY (FOMC-type)."""
    M = c.load("EURUSD"); H, L = M["H"], M["L"]; r = H - L
    tag = {}
    for nm, col in (("0830", 15 * 60 + 30), ("1400", 21 * 60)):
        base = np.nanmedian(r[:, col - 30:col], 1); spike = np.nanmax(r[:, col:col + 2], 1)
        tag[nm] = pd.Series(spike > 4 * base, index=M["days"])
    return tag


out = []
tags = news_tags()
for sym, cfg in FINAL.items():
    cost, name = c.MARKETS[sym]; M = c.load(sym)
    kw = {k: v for k, v in cfg.items() if k not in ("opn", "length", "label")}
    T, sk = c.run(M, cost, cfg["opn"], cfg["length"], **kw)
    d = c.summary(T); miss = c.bar_check(d)
    out.append(f"\n################ {cfg['label']}  (cost {cost})")
    out.append(f"days skipped: {sk}")
    out.append(f"trades {d['n']} ({d['per_year']:.0f}/yr), win {d['win']*100:.1f}%, R before cost {d['R0']:+.1f}, with cost {d['R']:+.1f}, "
               f"double cost {d['R2']:+.1f}, per trade {d['perTr']:+.3f}, longs {d['nlong']} {d['long']:+.1f}R, shorts {d['nshort']} {d['short']:+.1f}R, "
               f"longest losing run {d['lrun']}, without best 5 {d['noBest5']:+.1f}, worst drop {d['maxDD']:+.1f}R, positive years {d['posY']}/8")
    out.append("bar points missed: " + (", ".join(miss) or "NONE"))
    out.append(c.year_table(T))
    out.append("exit reasons: " + ", ".join(f"{k} {len(g)} ({g.R.sum():+.1f}R)" for k, g in T.groupby("reason")))
    wd = T.day.dt.dayofweek
    out.append("weekday R: " + ", ".join(f"{n} {T[wd == i].R.sum():+.1f} ({(wd == i).sum()})" for i, n in enumerate(["Mon", "Tue", "Wed", "Thu", "Fri"])))
    mo = T.groupby(T.day.dt.to_period("M")).R.sum()
    out.append(f"months positive: {(mo > 0).sum()}/{len(mo)}")
    for nm in ("0830", "1400"):
        f = T.day.map(tags[nm]).fillna(False).astype(bool)
        out.append(f"US {nm} NY release-spike days (found afterwards): {f.sum()} trades {T[f].R.sum():+.1f}R ({T[f].R.mean():+.3f}/tr); "
                   f"other days {(~f).sum()} trades {T[~f].R.sum():+.1f}R ({T[~f].R.mean():+.3f}/tr)")
    out.append(f"median risk: {T.risk.median():.5g}; cost as share of risk: median {np.median(cost / T.risk) * 100:.1f}%")
    # trade list
    rows = []
    for r in T.itertuples():
        en = col_to_ny(r.day, r.ecol); ex = col_to_ny(r.day, r.xcol + (1 if r.reason == "close" else 0))
        rows.append(dict(date=pd.Timestamp(r.day).date(), direction="BUY" if r.side > 0 else "SELL",
                         entry_time_NY=en.strftime("%Y-%m-%d %H:%M"), entry_time_Doha=en.tz_convert("Asia/Qatar").strftime("%Y-%m-%d %H:%M"),
                         entry_price=round(r.entry, 5), stop=round(r.stop, 5), target=("" if np.isnan(r.target) else round(r.target, 5)),
                         exit_time_NY=ex.strftime("%Y-%m-%d %H:%M"), exit_time_Doha=ex.tz_convert("Asia/Qatar").strftime("%Y-%m-%d %H:%M"),
                         exit_price=round(r.exit, 5), exit_reason=r.reason, range_size=round(r.range, 5), risk=round(r.risk, 5),
                         R_before_cost=round(r.R0, 3), R_after_cost=round(r.R, 3), R_double_cost=round(r.R2, 3)))
    pd.DataFrame(rows).to_csv(f"trades_{FILE[sym]}.csv", index=False)
    # spot check: first 2 trades, raw bars around entry/exit
    for r in list(T.itertuples())[:2]:
        i = np.flatnonzero(M["days"] == r.day)[0]
        a = c.open_col(M, cfg["opn"])[i]
        out.append(f"  spot-check {pd.Timestamp(r.day).date()}: range cols {a}-{a + cfg['length'] - 1} high {np.nanmax(M['H'][i, a:a + cfg['length']]):.5g} "
                   f"low {np.nanmin(M['L'][i, a:a + cfg['length']]):.5g}; entry bar {col_to_ny(r.day, r.ecol).strftime('%H:%M')} NY "
                   f"H {M['H'][i, r.ecol]:.5g} L {M['L'][i, r.ecol]:.5g} -> {r.side:+d} @ {r.entry:.5g}; exit {r.reason} @ {r.exit:.5g} "
                   f"bar {col_to_ny(r.day, r.xcol).strftime('%H:%M')} NY H {M['H'][i, r.xcol]:.5g} L {M['L'][i, r.xcol]:.5g}")
open("out_final.txt", "w").write("\n".join(out)); print("\n".join(out))
