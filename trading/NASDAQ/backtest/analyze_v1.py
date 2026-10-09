"""Statistics for NASDAQ v1 (Agent 2). Reads trades_v1.csv (+ trades_v1_gapk0.4.csv, days_v1.csv) written by backtest_v1.py.
Writes summary_v1.txt and weekly_v1.csv.   Run: python3 trading/NASDAQ/backtest/analyze_v1.py"""
from pathlib import Path
import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
tr = pd.read_csv(HERE / "trades_v1.csv")
tr["date"] = pd.to_datetime(tr["date"])
days = pd.read_csv(HERE / "days_v1.csv")
out = []
P = lambda *a: out.append(" ".join(str(x) for x in a))
rng = np.random.default_rng(7)


def streaks(r):
    runs, cur = [], 0
    for v in r:
        if v <= 0:
            cur += 1
        else:
            if cur: runs.append(cur)
            cur = 0
    if cur: runs.append(cur)
    return (max(runs) if runs else 0), sum(1 for x in runs if x >= 3)


def stats(x, col="r"):
    r = x[col].values
    n = len(r)
    if n == 0:
        return None
    w, l = r[r > 0], r[r <= 0]
    eq = np.cumsum(r)
    dd_r = (np.maximum.accumulate(np.concatenate([[0], eq])) - np.concatenate([[0], eq])).max()
    bal = np.cumprod(np.concatenate([[1.0], 1 + 0.01 * r]))
    dd_pct = ((np.maximum.accumulate(bal) - bal) / np.maximum.accumulate(bal)).max() * 100
    ls, n3 = streaks(r)
    boot = rng.choice(r, size=(10000, n), replace=True).mean(axis=1)
    pf = w.sum() / -l.sum() if l.sum() < 0 else np.inf
    return dict(n=n, win=len(w) / n * 100, aw=w.mean() if len(w) else 0, al=l.mean() if len(l) else 0,
                tot=r.sum(), pf=pf, ddr=dd_r, ddp=dd_pct, ls=ls, n3=n3, pboot=(boot <= 0).mean() * 100,
                wo3=np.sort(r)[:-3].sum() if n > 3 else np.nan, avg=r.mean())


def row(name, s):
    if s is None:
        return f"| {name} | 0 | | | | | | | | | | |"
    return (f"| {name} | {s['n']} | {s['win']:.1f}% | {s['aw']:+.2f} / {s['al']:+.2f} | {s['tot']:+.2f} R | {s['pf']:.2f} | "
            f"-{s['ddr']:.1f} R (-{s['ddp']:.1f}%) | {s['ls']} | {s['n3']} | {s['pboot']:.0f}% | {s['wo3']:+.2f} R |")


PER = [("A (hidden)", tr.period == "A"), ("Y1", tr.period == "Y1"), ("Y2", tr.period == "Y2"),
       ("B (hidden)", tr.period == "B"), ("A + B hidden", tr.period.isin(["A", "B"])), ("All 36 months", tr.period.notna())]

P("# NASDAQ v1 - summary (Agent 2). Cost 2.0 points per trade unless stated.\n")
P("## Main table (2.0 points)")
P("| Period | Trades | Win rate | Avg win / loss | Total | PF | Max drawdown | Longest losing run | 3+ loss runs | Chance avg <= 0 | Without best 3 |")
P("|---|---|---|---|---|---|---|---|---|---|---|")
for name, m in PER:
    P(row(name, stats(tr[m])))

P("\n## Cost stress (total R; PF in brackets; longest losing run)")
P("| Period | 0.0 pts | 2.0 pts | 4.0 pts | 6.0 pts |")
P("|---|---|---|---|---|")
for name, m in PER:
    cells = []
    for c in ["r_0", "r_2", "r_4", "r_6"]:
        s = stats(tr[m], c)
        cells.append(f"{s['tot']:+.2f} (PF {s['pf']:.2f}, run {s['ls']})")
    P(f"| {name} | " + " | ".join(cells) + " |")

P("\n## Long (after gap down) vs short (after gap up), 2.0 pts")
P("| Period | Longs: n, win, total, PF | Shorts: n, win, total, PF | Longs at 4.0 | Shorts at 4.0 |")
P("|---|---|---|---|---|")
for name, m in PER:
    cells = []
    for dname in ["long", "short"]:
        s = stats(tr[m & (tr.direction == dname)])
        cells.append(f"{s['n']} tr, {s['win']:.0f}%, {s['tot']:+.2f} R, PF {s['pf']:.2f}" if s else "0")
    for dname in ["long", "short"]:
        s = stats(tr[m & (tr.direction == dname)], "r_4")
        cells.append(f"{s['tot']:+.2f} R" if s else "-")
    P(f"| {name} | " + " | ".join(cells) + " |")

P("\n## Exit types (2.0 pts)")
P("| Period | Target | Stop | 16:00 close |")
P("|---|---|---|---|")
for name, m in PER:
    cells = []
    for e in ["target", "stop", "close 15:59"]:
        x = tr[m & (tr.exit == e)]
        cells.append(f"{len(x)} ({len(x)/max(1,m.sum())*100:.0f}%), {x.r.sum():+.2f} R")
    P(f"| {name} | " + " | ".join(cells) + " |")
x = tr[tr.exit == "close 15:59"]
P(f"16:00 closes that were winners: {(x.r>0).sum()} of {len(x)}; average {x.r.mean():+.3f} R")
x = tr[tr.exit == "stop"]
P(f"Stops filled worse than the stop price (price jumped past): {(x.r < -1.03).sum()}; worst {x.r.min():+.3f} R")

P("\n## News vs normal days (2.0 pts)")
tr["newsflag"] = np.where(tr.news == "normal", "normal", "news")
P("| Period | Normal days | News days | of which NFP/CPI | of which EARN (day after big-tech earnings) |")
P("|---|---|---|---|---|")
for name, m in PER:
    cells = []
    for mm in [tr.newsflag == "normal", tr.newsflag == "news", tr.news.str.contains("NFP|CPI"), tr.news.str.contains("EARN")]:
        x = tr[m & mm]
        cells.append(f"{len(x)} tr, {x.r.sum():+.2f} R, win {np.mean(x.r>0)*100 if len(x) else 0:.0f}%")
    P(f"| {name} | " + " | ".join(cells) + " |")
P("By event type (all 36 months): " + ", ".join(
    f"{e} {tr[tr.news.str.contains(e)].shape[0]} tr {tr[tr.news.str.contains(e)].r.sum():+.2f} R" for e in ["NFP", "CPI", "PPI", "FOMC", "EARN"]))

P("\n## By month (2.0 pts): trades, total R  [longs R / shorts R]")
tr["month"] = tr.date.dt.to_period("M")
for p in ["A", "Y1", "Y2", "B"]:
    x = tr[tr.period == p]
    g = x.groupby("month")
    cells = []
    for mo, y in g:
        cells.append(f"{mo}: {len(y)} tr {y.r.sum():+.2f} [{y[y.direction=='long'].r.sum():+.1f}/{y[y.direction=='short'].r.sum():+.1f}]")
    nmon = g.r.sum()
    P(f"{p}: " + "; ".join(cells))
    P(f"   {p}: {(nmon>0).sum()} of {len(nmon)} months positive; best month {nmon.max():+.2f} R ({nmon.idxmax()}), worst {nmon.min():+.2f} R ({nmon.idxmin()}); total without best month {x.r.sum()-nmon.max():+.2f} R")

P("\n## By quarter (2.0 pts): total R [longs / shorts]")
tr["q"] = tr.date.dt.to_period("Q")
P("; ".join(f"{q}: {len(y)} tr {y.r.sum():+.2f} [{y[y.direction=='long'].r.sum():+.1f}/{y[y.direction=='short'].r.sum():+.1f}]" for q, y in tr.groupby("q")))

P("\n## By weekday (2.0 pts): total R per period")
for wd in ["Mon", "Tue", "Wed", "Thu", "Fri"]:
    P(f"{wd}: " + ", ".join(f"{p} {tr[(tr.period==p)&(tr.weekday==wd)].shape[0]} tr {tr[(tr.period==p)&(tr.weekday==wd)].r.sum():+.2f}" for p in ["A", "Y1", "Y2", "B"]))

P("\n## By gap size (gap / ATR), 2.0 pts, all 36 months and A")
tr["gbin"] = pd.cut(tr.gap_atr.abs(), [0.5, 0.75, 1.0, 1.5, 10])
for b, y in tr.groupby("gbin", observed=True):
    ya = y[y.period == "A"]
    P(f"{b}: all {len(y)} tr {y.r.sum():+.2f} R (win {np.mean(y.r>0)*100:.0f}%); A {len(ya)} tr {ya.r.sum():+.2f} R")

P("\n## Sensitivity: gap threshold 0.4 ATR instead of 0.5 (information only, not the rule)")
g4 = pd.read_csv(HERE / "trades_v1_gapk0.4.csv")
for p in ["A", "Y1", "Y2", "B"]:
    x = g4[g4.period == p]
    P(f"{p}: {len(x)} tr, win {np.mean(x.r>0)*100:.1f}%, {x.r.sum():+.2f} R at 2.0, {x.r_4.sum():+.2f} R at 4.0")
extra = g4[~g4.date.isin(tr.date.dt.strftime("%Y-%m-%d"))]
P("Extra trades with gaps 0.4-0.5 ATR: " + ", ".join(f"{p} {len(extra[extra.period==p])} tr {extra[extra.period==p].r.sum():+.2f} R" for p in ["A", "Y1", "Y2", "B"]))

P("\n## Days skipped / not traded")
P(days.groupby(["period", "status"]).size().to_string())
P(f"Hidden A warm-up: the file starts 1 Oct 2023 (Sunday evening); 2 Oct has no previous day and 3-13 Oct have fewer than 10 full sessions for the ATR -> first tradable day 16 Oct 2023 (10 trading days lost).")

# ---------------- weekly table ----------------
allw = pd.date_range("2023-10-02", "2026-09-28", freq="W-MON")
wk = []
tr["wk"] = tr.date - pd.to_timedelta(tr.date.dt.weekday, unit="D")
run = 0.0
for w in allw:
    x = tr[tr.wk == w]
    fri = w + pd.Timedelta(days=4)
    ds = str(w.date())
    per = next(p for p, a, b in [("A", "2023-10-01", "2024-09-30"), ("Y1", "2024-10-01", "2025-09-30"),
                                 ("Y2", "2025-10-01", "2026-06-30"), ("B", "2026-07-01", "2026-09-30")] if a <= str(fri.date()) and ds <= b)
    if str(w.date()) < "2024-10-01" <= str(fri.date()): per = "A/Y1"
    if str(w.date()) < "2025-10-01" <= str(fri.date()): per = "Y1/Y2"
    if str(w.date()) < "2026-07-01" <= str(fri.date()): per = "Y2/B"
    wins = int((x.r > 0).sum()); losses = int((x.r <= 0).sum())
    run += x.r.sum()
    notes = []
    for t in x.itertuples():
        tag = f"{t.date.strftime('%a')} {t.direction} {t.exit.replace('close 15:59','16:00 close')} {t.r:+.2f}"
        if t.news != "normal": tag += f" ({t.news})"
        notes.append(tag)
    dsk = days[(days.tday >= ds) & (days.tday <= str(fri.date()))]
    sk = dsk[dsk.status.str.contains("holiday|early|hole|no cash|warm|first", na=False)]
    if len(sk):
        def short(s):
            if s.startswith("previous day"): return "day after a skipped day"
            if "hole" in s: return "missing price data"
            if "no cash" in s: return "no price data"
            if "warm" in s: return "ATR warm-up"
            if "first day" in s: return "first day in file"
            return s.replace("not full: ", "")
        notes.append("skipped: " + ", ".join(sorted(set(short(s) for s in sk.status))))
    wk.append(dict(week=f"{w.strftime('%d %b %y')} - {fri.strftime('%d %b %y')}", period=per, trades=len(x), wins=wins,
                   losses=losses, winrate=f"{wins/len(x)*100:.0f}%" if len(x) else "-", result=round(x.r.sum(), 2),
                   running=round(run, 2), notes="; ".join(notes)))
wk = pd.DataFrame(wk)
wk.to_csv(HERE / "weekly_v1.csv", index=False)
traded = wk[wk.trades > 0]
P(f"\n## Weeks: {len(wk)} weeks, {len(traded)} with trades; positive {(traded.result>0).sum()}, negative {(traded.result<0).sum()}; "
  f"worst week {traded.result.min():+.2f} R, best {traded.result.max():+.2f} R")
for p in ["A", "Y1", "Y2", "B"]:
    t2 = traded[traded.period == p]
    P(f"   {p}: {len(t2)} traded weeks, {(t2.result>0).sum()} up, {(t2.result<0).sum()} down")

(HERE / "summary_v1.txt").write_text("\n".join(out) + "\n")
print("\n".join(out))
