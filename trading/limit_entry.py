"""Limit-order entry test (rule fixed before running, 27 Oct 2026).
Same approved 30m breakout trades (walkforward_30m_withbtc_trades.csv, monthly-learning picks).
Instead of buying/selling at the next bar's open (taker 0.06%), place a LIMIT order at the signal bar's close,
valid for 2 bars; it fills only if price trades THROUGH it (0.02% beyond) - honest about queue position.
Fees: maker 0.02% entry, 0.02% target, stop 0.05% + 0.02% slippage. Stop/target distances from the signal ATR,
measured from the fill price; hold limit counted from the signal bar as before. Simulated on 5-minute bars.
Pass: account ($500, 0.75% risk) 100+ trades, 70%+ wins, $1.20+ per $1 lost, drop <= 10%.
"""
import numpy as np, pandas as pd, study_intraday as S, select_intraday as X
t = pd.read_csv(S.OUT / "walkforward_30m_withbtc_trades.csv", parse_dates=["t_in", "t_out"]).drop_duplicates(["sym", "t_in"])
rows = []
for sym, g in t.groupby("sym"):
    d30 = S.load(sym, "30m"); f = S.features(d30, S.btc_context("30m")); d5 = S.load(sym, "5m")
    o, h, l, c = (d5[k].values for k in ("open", "high", "low", "close")); idx = d5.index
    for r in g.itertuples():
        i = d30.index.get_loc(r.t_in) - 1; atr = f.atr.iloc[i]; px = d30.close.iloc[i]
        T, St, H = [float(x[1:]) for x in r.setup.split()[-3:]]; d = int(r.dir)
        lim = px; k0 = idx.searchsorted(r.t_in); kexp = idx.searchsorted(r.t_in + pd.Timedelta(minutes=60))
        fill = None
        for k in range(k0, min(kexp, len(o))):
            if (d > 0 and l[k] <= lim * (1 - 0.0002)) or (d < 0 and h[k] >= lim * (1 + 0.0002)):
                fill = k; break
        if fill is None:
            continue
        e = lim; tgt, stp = e + d * T * atr, e - d * St * atr
        end = min(idx.searchsorted(r.t_in + pd.Timedelta(minutes=30 * int(H))) - 1, len(o) - 1)
        ex, cost, j = c[end], 0.0007, end
        for jj in range(fill, end + 1):
            # fill bar: the order filled somewhere inside it, so only the part after the fill is unknown -> stop first
            if (d > 0 and l[jj] <= stp) or (d < 0 and h[jj] >= stp):
                ex = o[jj] if (jj > fill and ((d > 0 and o[jj] < stp) or (d < 0 and o[jj] > stp))) else stp; cost = 0.0007; j = jj; break
            if jj > fill and ((d > 0 and h[jj] >= tgt) or (d < 0 and l[jj] <= tgt)):
                ex, cost, j = tgt, 0.0002, jj; break
        pnl = d * (ex / e - 1) - 0.0002 - cost
        rows.append({"sym": sym, "t_in": idx[fill], "t_out": idx[j], "pnl": pnl, "stop_pct": St * atr / e, "prob": r.prob})
x = pd.DataFrame(rows)
print("orders placed", len(t), "filled", len(x), f"({len(x)/len(t):.0%})")
print("all fills", S.stats(x.pnl.values))
for name, q in [("2025 May-Dec", x[x.t_in < S.EXAM_START]), ("2026 Jan-Sep", x[x.t_in >= S.EXAM_START]), ("all", x)]:
    print(name, X.account(q, risk=0.0075, bar=pd.Timedelta(minutes=5)))
