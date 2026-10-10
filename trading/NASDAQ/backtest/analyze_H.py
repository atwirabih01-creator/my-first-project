"""NASDAQ v1: hidden period H (2016-2018) results, and all unseen data combined (H + C + A + B). Agent 2, 10 Oct 2026.
Reads hidden_H/trades_v1.csv (run_hidden_H.py) and trades_v1_withC.csv (earlier run with C, A, Y1, Y2, B).
Writes summary_v1_H.txt and weekly_v1_H_table.md."""
from pathlib import Path
import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
h = pd.read_csv(HERE / "hidden_H" / "trades_v1.csv")
o = pd.read_csv(HERE / "trades_v1_withC.csv")
tr = pd.concat([h, o], ignore_index=True)
tr["date"] = pd.to_datetime(tr["date"]); tr["year"] = tr.date.dt.year
tr = tr.sort_values("date").reset_index(drop=True)
days = pd.read_csv(HERE / "hidden_H" / "days_v1.csv")
out = []; P = out.append


def stats(r, seed=7):
    r = np.asarray(r, float); n = len(r)
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
    boot = np.random.default_rng(seed).choice(r, size=(10000, n), replace=True).mean(axis=1)
    return dict(n=n, win=len(w)/n*100, aw=w.mean() if len(w) else 0, al=l.mean() if len(l) else 0, tot=r.sum(),
                pf=w.sum()/-l.sum() if l.sum() < 0 else np.inf, ddr=(np.maximum.accumulate(eq)-eq).max(),
                ddp=((np.maximum.accumulate(bal)-bal)/np.maximum.accumulate(bal)).max()*100,
                ls=max(runs) if runs else 0, n3=sum(x >= 3 for x in runs), pb=(boot <= 0).mean()*100,
                wo3=np.sort(r)[:-3].sum() if n > 3 else np.nan, avg=r.mean())


H = tr.period == "H"
GROUPS = [("H 2016", H & (tr.year == 2016)), ("H 2017", H & (tr.year == 2017)), ("H 2018", H & (tr.year == 2018)),
          ("**H all (2016-2018)**", H), ("C (Oct 21 - Sep 23)", tr.period == "C"), ("A (Oct 23 - Sep 24)", tr.period == "A"),
          ("B (Jul - Sep 26)", tr.period == "B"), ("Unseen before this round C + A + B", tr.period.isin(["C", "A", "B"])),
          ("**All unseen H + C + A + B**", tr.period.isin(["H", "C", "A", "B"])), ("Design Y1 + Y2", tr.period.isin(["Y1", "Y2"])),
          ("Everything (8 periods, ~8 years)", tr.period.notna())]
P("| Period | Trades | Win | Avg win / loss | Total | R per trade | PF | Max drop | Longest losing run | 3+ runs | Chance avg <= 0 | Without best 3 |")
P("|---|---|---|---|---|---|---|---|---|---|---|---|")
for nm, m in GROUPS:
    s = stats(tr[m].r)
    P(f"| {nm} | {s['n']} | {s['win']:.1f}% | {s['aw']:+.2f} / {s['al']:+.2f} | {s['tot']:+.2f} R | {s['avg']:+.3f} | {s['pf']:.2f} | "
      f"-{s['ddr']:.1f} R (-{s['ddp']:.1f}%) | {s['ls']} | {s['n3']} | {s['pb']:.0f}% | {s['wo3']:+.2f} R |")
P("\nCost stress, total R (R per trade): 0 / 2 / 4 / 6 points")
for nm, m in GROUPS:
    P(f"{nm}: " + " / ".join(f"{tr[m][c].sum():+.2f} ({tr[m][c].mean():+.3f})" for c in ["r_0", "r_2", "r_4", "r_6"]))
P("\nLong vs short (2.0 pts; and at 4.0)")
for nm, m in GROUPS:
    cells = []
    for d in ["long", "short"]:
        x = tr[m & (tr.direction == d)]; s = stats(x.r)
        cells.append(f"{d}s {s['n']} tr, {s['win']:.0f}% won, {s['tot']:+.2f} R ({s['avg']:+.3f}/tr; 4.0: {x.r_4.sum():+.2f})" if s else f"{d}s 0")
    P(f"{nm}: " + " | ".join(cells))
P("\nExit types (2.0 pts)")
for nm, m in GROUPS:
    P(f"{nm}: " + "; ".join(f"{e} {len(tr[m & (tr.exit == e)])} ({len(tr[m & (tr.exit == e)])/m.sum()*100:.0f}%) {tr[m & (tr.exit == e)].r.sum():+.2f} R"
                            for e in ["target", "stop", "close 15:59"]))
x = tr[H]
P("\nH weekday: " + ", ".join(f"{d} {len(x[x.weekday==d])} {x[x.weekday==d].r.sum():+.2f}" for d in ["Mon", "Tue", "Wed", "Thu", "Fri"]))
P("H best 3 trades: " + ", ".join(f"{d:%Y-%m-%d} {v:+.2f}" for d, v in x.nlargest(3, "r")[["date", "r"]].values))
P("H risk (stop) points: median %.1f, min %.1f, max %.1f" % (x.risk_pts.median(), x.risk_pts.min(), x.risk_pts.max()))
x["q"] = x.date.dt.to_period("Q").astype(str)
P("H by quarter (trades, R): " + ", ".join(f"{k} {len(g)} {g.r.sum():+.2f}" for k, g in x.groupby("q")))
P("H days by status:\n" + days.status.str.replace(r"\d+ min", "N min", regex=True).str.replace(r"\(\d+ full sessions of \d+\)", "", regex=True)
  .value_counts().to_string())
sk = days[days.status == "stop under 40 points"]
P("H 'stop under 40 points' skips by year: " + sk.tday.str[:4].value_counts().sort_index().to_dict().__repr__())

txt = "\n".join(out)
open(HERE / "summary_v1_H.txt", "w").write(txt + "\n")
print(txt)

# weekly rows for H (Mon-Fri weeks, Jan 2016 - Dec 2018), running total starts at 0 in Jan 2016
x = tr[H].copy()
x["wk"] = x.date - pd.to_timedelta(x.date.dt.weekday, unit="D")
md = ["| Week | Period | Trades | Wins | Losses | Win rate | Result (R) | Running total H (R) | Notes |", "|---|---|---|---|---|---|---|---|---|"]
run = 0.0
for w in pd.date_range("2016-01-04", "2018-12-31", freq="W-MON"):
    g = x[x.wk == w]; r = g.r.values; run += r.sum()
    notes = " ".join(f"{a}{'L' if b == 'long' else 'S'}{c:+.2f}({e.split()[0]})" for a, b, c, e in zip(g.weekday, g.direction, g.r, g.exit))
    md.append(f"| {w:%d %b %Y} - {(w + pd.Timedelta(days=4)):%d %b} | H | {len(r)} | {(r > 0).sum()} | {(r <= 0).sum()} | "
              f"{(f'{(r > 0).mean()*100:.0f}%') if len(r) else '-'} | {(f'{r.sum():+.2f}') if len(r) else '0'} | {run:+.2f} | {notes} |")
open(HERE / "weekly_v1_H_table.md", "w").write("\n".join(md) + "\n")
