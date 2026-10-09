"""NASDAQ v1 on hidden period C (Oct 2021 - Sep 2023) joined to the main file (Agent 2).
Reads trades_v1_withC.csv / days_v1_withC.csv (python3 backtest_v1.py --with-c). Writes summary_v1_withC.txt."""
from pathlib import Path
import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
tr = pd.read_csv(HERE / "trades_v1_withC.csv"); tr["date"] = pd.to_datetime(tr["date"])
days = pd.read_csv(HERE / "days_v1_withC.csv")
rng = np.random.default_rng(7)
out = []; P = out.append


def stats(r):
    r = np.asarray(r); n = len(r)
    if n == 0: return None
    w, l = r[r > 0], r[r <= 0]
    eq = np.concatenate([[0], np.cumsum(r)])
    bal = np.cumprod(np.concatenate([[1.0], 1 + 0.01 * r]))
    runs, cur = [], 0
    for v in r:
        if v <= 0: cur += 1
        else:
            if cur: runs.append(cur)
            cur = 0
    if cur: runs.append(cur)
    boot = rng.choice(r, size=(10000, n), replace=True).mean(axis=1)
    return dict(n=n, win=len(w)/n*100, aw=w.mean() if len(w) else 0, al=l.mean() if len(l) else 0, tot=r.sum(),
                pf=w.sum()/-l.sum() if l.sum() < 0 else np.inf, ddr=(np.maximum.accumulate(eq)-eq).max(),
                ddp=((np.maximum.accumulate(bal)-bal)/np.maximum.accumulate(bal)).max()*100,
                ls=max(runs) if runs else 0, n3=sum(x >= 3 for x in runs), pb=(boot <= 0).mean()*100,
                wo3=np.sort(r)[:-3].sum() if n > 3 else np.nan, avg=r.mean())


GROUPS = [("C all (Oct 21 - Sep 23)", tr.period == "C"),
          ("C1 Oct 21 - Dec 22 (bear)", (tr.period == "C") & (tr.date < "2023-01-01")),
          ("C2 2023 (Jan + Aug-Sep)", (tr.period == "C") & (tr.date >= "2023-01-01")),
          ("A (joined run)", tr.period == "A"), ("Y1", tr.period == "Y1"), ("Y2", tr.period == "Y2"), ("B", tr.period == "B"),
          ("Unseen C + A + B", tr.period.isin(["C", "A", "B"])), ("Design Y1 + Y2", tr.period.isin(["Y1", "Y2"])),
          ("All 5 years", tr.period.notna())]
P("| Period | Trades | Win | Avg win / loss | Total | Avg/trade | PF | Max DD | Longest losing run | 3+ runs | Chance avg <= 0 | Without best 3 |")
P("|---|---|---|---|---|---|---|---|---|---|---|---|")
for nm, m in GROUPS:
    s = stats(tr[m].r)
    P(f"| {nm} | {s['n']} | {s['win']:.1f}% | {s['aw']:+.2f} / {s['al']:+.2f} | {s['tot']:+.2f} R | {s['avg']:+.3f} | {s['pf']:.2f} | "
      f"-{s['ddr']:.1f} R (-{s['ddp']:.1f}%) | {s['ls']} | {s['n3']} | {s['pb']:.0f}% | {s['wo3']:+.2f} R |")
P("\nCost stress (total R): 0 / 2 / 4 / 6 points")
for nm, m in GROUPS:
    P(f"{nm}: " + " / ".join(f"{tr[m][c].sum():+.2f}" for c in ["r_0", "r_2", "r_4", "r_6"]))
P("\nLong vs short (2.0 pts; and at 4.0)")
for nm, m in GROUPS:
    cells = []
    for d in ["long", "short"]:
        x = tr[m & (tr.direction == d)]; s = stats(x.r)
        cells.append(f"{d}s {s['n']} tr, {s['win']:.0f}% won, {s['tot']:+.2f} R (PF {s['pf']:.2f}; 4.0: {x.r_4.sum():+.2f})" if s else f"{d}s 0")
    P(f"{nm}: " + " | ".join(cells))
P("\nExit types (2.0 pts)")
for nm, m in GROUPS:
    P(f"{nm}: " + "; ".join(f"{e} {len(tr[m & (tr.exit == e)])} ({len(tr[m & (tr.exit == e)])/m.sum()*100:.0f}%) {tr[m & (tr.exit == e)].r.sum():+.2f} R"
                            for e in ["target", "stop", "close 15:59"]))
P("\nC by month: trades, R [longs/shorts]")
c = tr[tr.period == "C"].copy(); c["mo"] = c.date.dt.to_period("M")
mon = c.groupby("mo").r.sum()
P("; ".join(f"{mo}: {len(y)} {y.r.sum():+.2f} [{y[y.direction=='long'].r.sum():+.1f}/{y[y.direction=='short'].r.sum():+.1f}]" for mo, y in c.groupby("mo")))
P(f"C: {(mon>0).sum()} of {len(mon)} months positive; best {mon.max():+.2f} ({mon.idxmax()}), worst {mon.min():+.2f} ({mon.idxmin()}); without best month {c.r.sum()-mon.max():+.2f}")
u = tr[tr.period.isin(["C", "A", "B"])].copy(); u["mo"] = u.date.dt.to_period("M"); um = u.groupby("mo").r.sum()
P(f"Unseen C+A+B: {(um>0).sum()} of {len(um)} months positive; without best month {u.r.sum()-um.max():+.2f}; without best 3 months {u.r.sum()-um.nlargest(3).sum():+.2f}")
P("\nC by quarter: " + "; ".join(f"{q}: {len(y)} {y.r.sum():+.2f}" for q, y in c.groupby(c.date.dt.to_period('Q'))))
P("\nEARN days (day after big-tech earnings): " + ", ".join(f"{p} {len(tr[(tr.period==p)&tr.news.str.contains('EARN')])} tr {tr[(tr.period==p)&tr.news.str.contains('EARN')].r.sum():+.2f}" for p in ["C","A","Y1","Y2","B"]))
P("\nC days by status:")
dc = days[days.period == "C"].copy()
dc["st"] = dc.status.str.replace(r"\(.*", "", regex=True).str.replace(r"\d+ min", "N min", regex=True).str.replace(r"warm-up.*", "warm-up", regex=True)
P(dc.st.value_counts().to_string())
P(f"Data-hole days by month: " + ", ".join(f"{m} {n}" for m, n in dc[dc.status.str.contains('hole|no cash', na=False)].groupby(dc.tday.str[:7]).size().items()))
(HERE / "summary_v1_withC.txt").write_text("\n".join(out) + "\n")
print("\n".join(out))

# ---------------- weekly table, Oct 2021 - Sep 2026 (C + A + Y1 + Y2 + B) ----------------
PERS = [("C", "2021-10-01", "2023-09-30"), ("A", "2023-10-01", "2024-09-30"), ("Y1", "2024-10-01", "2025-09-30"),
        ("Y2", "2025-10-01", "2026-06-30"), ("B", "2026-07-01", "2026-09-30")]


def short(s):
    if s.startswith("previous day"): return "day after a skipped day"
    if "hole" in s: return "missing price data"
    if "no cash" in s: return "no price data"
    if "warm" in s: return "ATR warm-up"
    if "first day" in s: return "first day in file"
    return s.replace("not full: ", "")


tr["wk"] = tr.date - pd.to_timedelta(tr.date.dt.weekday, unit="D")
rows, run = [], 0.0
for w in pd.date_range("2021-09-27", "2026-09-28", freq="W-MON"):
    fri = w + pd.Timedelta(days=4); a, b = str(w.date()), str(fri.date())
    ps = [p for p, s, e in PERS if s <= b and a <= e]
    x = tr[tr.wk == w]; run += x.r.sum()
    notes = []
    for t in x.itertuples():
        tag = f"{t.date.strftime('%a')} {t.direction} {t.exit.replace('close 15:59', '16:00 close')} {t.r:+.2f}"
        if t.news != "normal": tag += f" ({t.news})"
        notes.append(tag)
    sk = days[(days.tday >= a) & (days.tday <= b) & days.status.str.contains("holiday|early|hole|no cash|warm|first", na=False)]
    if len(sk): notes.append("skipped: " + ", ".join(sorted(set(short(s) for s in sk.status))) + f" ({len(sk)} d)")
    wins, losses = int((x.r > 0).sum()), int((x.r <= 0).sum())
    rows.append(dict(week=f"{w.strftime('%d %b %y')} - {fri.strftime('%d %b %y')}", period="/".join(ps), trades=len(x), wins=wins,
                     losses=losses, winrate=f"{wins/len(x)*100:.0f}%" if len(x) else "-", result=round(x.r.sum(), 2),
                     running=round(run, 2), notes="; ".join(notes)))
wk = pd.DataFrame(rows); wk.to_csv(HERE / "weekly_v1_withC.csv", index=False)
L = ["| Week (Mon - Fri) | Period | Trades | Wins | Losses | Win rate | Result (R) | Running total (R) | Notes |", "|---|---|---|---|---|---|---|---|---|"]
for r in wk.itertuples():
    L.append(f"| {r.week} | {r.period} | {r.trades} | {r.wins} | {r.losses} | {r.winrate} | {f'{r.result:+.2f}' if r.trades else '0'} | {r.running:+.2f} | {r.notes} |")
(HERE / "weekly_v1_withC_table.md").write_text("\n".join(L) + "\n")
t2 = wk[wk.trades > 0]
print(f"weeks {len(wk)}, traded {len(t2)}, up {(t2.result>0).sum()}, down {(t2.result<0).sum()}")
for p in ["C", "A", "Y1", "Y2", "B"]:
    q = t2[t2.period == p]; print(p, len(q), (q.result > 0).sum(), (q.result < 0).sum())
