# Builds trading-research/report.html (version 2) from result files.
import pandas as pd, numpy as np, os
from itertools import groupby
R = os.path.join(os.path.dirname(__file__), "..", "results")
OUT = "/home/user/my-first-project/trading-research/report.html"
PAIRS = ["XAUUSD", "NAS100", "GBPUSD", "GBPJPY"]
KEY = {"XAUUSD": "XAUUSD_FVG", "NAS100": "NAS100", "GBPUSD": "GBPUSD", "GBPJPY": "GBPJPY"}

a = pd.read_csv(f"{R}/r3_trades_12m.csv", parse_dates=["time"]); b = pd.read_csv(f"{R}/r3_trades_sealed2025.csv", parse_dates=["time"])
T = pd.concat([b, a]).sort_values("time")
weeks = pd.date_range("2025-03-31", "2026-10-05", freq="W-MON")
PER = {"Apr–Sep 2025 (sealed test 2)": ("2025-03-01", "2025-10-01"), "Oct 2025–Mar 2026": ("2025-10-01", "2026-04-01"), "Apr–Oct 2026": ("2026-04-01", "2026-11-01")}

def weekly(g):
    g = g.copy(); g["week"] = (g.time.dt.normalize() - pd.to_timedelta(g.time.dt.weekday, unit="D")).dt.tz_localize(None)
    W = g.groupby("week").R.agg(["size", "sum"]).reindex(weeks, fill_value=0); W.columns = ["trades", "pnl"]
    d = g.groupby(g.time.dt.normalize()).R.sum(); d.index = d.index.tz_localize(None)
    W["green"] = [int(((d.index >= w) & (d.index < w + pd.Timedelta(days=5)) & (d > 0)).sum()) for w in W.index]
    return W

def chart(W, lo, hi):
    w, h, pl, pb, pt = 900, 240, 44, 26, 12
    n = len(W); bw = (w - pl - 10) / n
    y = lambda v: pt + (hi - v) / (hi - lo) * (h - pt - pb)
    out = []
    for t in range(int(np.ceil(lo)), int(np.floor(hi)) + 1, 2):
        out.append(f'<line class="grid" x1="{pl}" x2="{w-6}" y1="{y(t):.1f}" y2="{y(t):.1f}"/><text class="ax" x="{pl-6}" y="{y(t)+4:.1f}" text-anchor="end">{t:+d}%</text>')
    out.append(f'<line class="zero-line" x1="{pl}" x2="{w-6}" y1="{y(0):.1f}" y2="{y(0):.1f}"/>')
    for i, (d, r) in enumerate(W.iterrows()):
        v = float(np.clip(r.pnl, lo, hi)); x = pl + i * bw + 1
        cls = "pos" if r.pnl > 0 else ("neg" if r.pnl < 0 else "zero")
        top, bot = (y(v), y(0)) if v >= 0 else (y(0), y(v))
        out.append(f'<rect class="{cls}" x="{x:.1f}" y="{top:.1f}" width="{max(bw-1.5,1):.1f}" height="{max(bot-top,1.5):.1f}"><title>Week of {d:%d %b %Y}: {r.pnl:+.2f}% ({int(r.trades)} trades)</title></rect>')
    for i, d in enumerate(W.index):
        if i % 8 == 0: out.append(f'<text class="ax" x="{pl+i*bw:.1f}" y="{h-7}">{d:%b %y}</text>')
    sx = pl + 26 * bw  # boundary between sealed 2025 and later data
    out.append(f'<line class="split" x1="{sx:.1f}" x2="{sx:.1f}" y1="{pt}" y2="{h-pb}"/><text class="ax" x="{sx+4:.1f}" y="{pt+10}">← sealed test 2 | 12 months →</text>')
    return f'<svg viewBox="0 0 {w} {h}" role="img" aria-label="Weekly profit and loss at 1% risk">{"".join(out)}</svg>'

def stats_block(g, W):
    eq = g.R.cumsum(); dd = (eq - eq.cummax()).min()
    streak = max((len(list(x)) for k, x in groupby(g.R <= 0) if k), default=0)
    per = "".join(f'<tr><td>{p}</td><td class="num">{len(s)}</td><td class="num {"g" if s.R.mean()>0 else "r"}">{s.R.mean():+.2f}R</td><td class="num">{s.R.sum():+.1f}%</td></tr>'
                  for p, (s0, e0) in PER.items() for s in [g[(g.time >= pd.Timestamp(s0, tz="UTC")) & (g.time < pd.Timestamp(e0, tz="UTC"))]])
    kv = (f'<div class="kv"><div><span class="k">18-month total</span><span class="v {"g" if g.R.sum()>0 else "r"}">{g.R.sum():+.1f}%</span></div>'
          f'<div><span class="k">Worst drawdown</span><span class="v r">{dd:.1f}%</span></div>'
          f'<div><span class="k">Trades / week</span><span class="v">{len(g)/len(W):.1f}</span></div>'
          f'<div><span class="k">Win rate</span><span class="v">{(g.R>0).mean():.0%}</span></div>'
          f'<div><span class="k">Green weeks</span><span class="v">{(W.pnl>0).sum()} / {len(W)}</span></div>'
          f'<div><span class="k">Losing run</span><span class="v">{streak}</span></div></div>')
    table = f'<div class="scroll"><table><tr><th>Period</th><th class="num">Trades</th><th class="num">Avg per trade</th><th class="num">Total at 1%</th></tr>{per}</table></div>'
    return kv + table

def week_rows(W):
    return "".join(f'<tr><td>{d:%d %b %Y}</td><td class="num">{int(r.trades)}</td><td class="num {"g" if r.pnl>0 else ("r" if r.pnl<0 else "")}">{r.pnl:+.2f}%</td><td class="num">{int(r.green)}</td></tr>' for d, r in W.iterrows())

def pivot(pair):
    D = pd.read_csv(f"{R}/r3fix.csv"); g = D[D.pair == pair].copy()
    g = g[g.n > 0]
    best = g.loc[g.groupby(["strategy", "tf"]).worst_half.idxmax()]
    tfs = ["5min", "15min", "30min", "1h"]
    rows = []
    for s in sorted(best.strategy.unique()):
        cells = []
        for tf in tfs:
            r = best[(best.strategy == s) & (best.tf == tf)]
            if len(r) == 0: cells.append('<td class="num muted">–</td>'); continue
            r = r.iloc[0]; ok = r.worst_half > 0 and r.n >= 40
            cls = "g" if ok else ("r" if r.avgR < 0 else "")
            cells.append(f'<td class="num {cls}" title="{r.n} trades; winter {r.winter:+.2f}R, summer {r.summer:+.2f}R">{r.avgR:+.2f}{" ✓" if ok else ""}</td>')
        rows.append(f"<tr><td>{s}</td>{''.join(cells)}</tr>")
    n = len(D[D.pair == pair]); q = int(((D.pair == pair) & (D.n >= 40) & (D.worst_half > 0)).sum())
    return (f'<p class="small muted">{n} versions tested on {pair}. Best version per cell, average R per trade over Oct 2025–Oct 2026, after costs. '
            f'✓ = profitable in both 6-month halves with 40+ trades ({q} versions). Hover a cell for details.</p>'
            f'<div class="scroll"><table><tr><th>Strategy</th><th class="num">5 min</th><th class="num">15 min</th><th class="num">30 min</th><th class="num">1 hour</th></tr>{"".join(rows)}</table></div>')

page = open(os.path.join(os.path.dirname(__file__), "report_template2.html")).read()
for p in PAIRS:
    g = T[T.pair == KEY[p]]; W = weekly(g)
    page = page.replace(f"{{{{STATS_{p}}}}}", stats_block(g, W)).replace(f"{{{{CHART_{p}}}}}", chart(W, -6, 7)) \
               .replace(f"{{{{WEEKS_{p}}}}}", week_rows(W)).replace(f"{{{{PIVOT_{p}}}}}", pivot(p))
assert "{{" not in page, page[page.index("{{"):page.index("{{")+40]
open(OUT, "w").write(page); print("ok", len(page))
