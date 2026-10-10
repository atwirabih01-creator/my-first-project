"""EURUSD round-3 v3 'Euro-only move fade' - exact rules as in strategy.md (round-3 section). Agent 1 quick check, design data only.
Outputs: v3_trades.csv, out_v3.txt (includes stage-6 checks X1-X5)."""
from tr3 import *
QQ, LO_B, HI_B = 0.75, 0.15, 0.6
t0, t1 = c.col_ny(3), c.col_ny(10)
def build(delay=0):
    sig, res = divergence(t0, t1, QQ)
    rows = []; skip = dict(no_signal=0, gap=0, still_at_extreme=0, already_reversed=0)
    for i in range(n):
        if days[i] > END or np.isnan(ATR20[i]): continue
        if sig[i] == 0: skip["no_signal"] += 1; continue
        if not valid[i]: skip["gap"] += 1; continue
        d = int(sig[i]); ent = CF[i, t1 - 1 + delay]
        hi, lo = np.nanmax(G["H"][i, t0:t1]), np.nanmin(G["L"][i, t0:t1])
        sd0 = (hi + P - ent) if d < 0 else (ent - lo + P)   # stall test at the actual entry price
        if sd0 < LO_B * ATR20[i]: skip["still_at_extreme"] += 1; continue
        if sd0 > HI_B * ATR20[i]: skip["already_reversed"] += 1; continue
        stop = hi + P if d < 0 else lo - P
        sd = abs(ent - stop)
        r = trade(i, d, t1 + delay, ent, sd)
        r.update(eur_move_pct=round(100 * (px(t1)[i] / px(t0)[i] - 1), 3), gbp_move_pct=round(100 * (px(t1, GC)[i] / px(t0, GC)[i] - 1), 3),
                 gap_pct=round(100 * res[i], 3), atr20_p=round(ATR20[i] / P, 1), morning_high=round(hi, 5), morning_low=round(lo, 5))
        rows.append(r)
    return rows, skip
rows, skip = build()
txt, T = summarize(rows, "v3 euro-only move fade"); O = [txt, f"skips: {skip}"]
T.to_csv("v3_trades.csv", index=False)
r = T.R.values
O.append(f"exits {T.exit.value_counts().to_dict()}; avg win {r[r>0].mean():+.2f}R avg loss {r[r<=0].mean():+.2f}R; PF {r[r>0].sum()/-r[r<=0].sum():.2f}")
O.append("median stop pips by year: " + T.groupby("y").risk_p.median().round(1).to_dict().__repr__())
O.append("trades by year: " + T.groupby("y").size().to_dict().__repr__())
X1r, _ = build(1); txt, X1T = summarize(X1r, "X1 entry 1 minute late (checks at that price)", quiet=True); O.append(txt)
O.append(f"X1 in pips per trade after 1.2 cost: on time {(T.gross_p-1.2).mean():+.2f} p, 1 min late {(X1T.gross_p-1.2).mean():+.2f} p")
T["half"] = T.y.astype(str) + np.where(pd.to_datetime(T.day).dt.month <= 6, "a", "b")
h = T.groupby("half").R.sum().round(1); O.append(f"X2 halves positive {int((h>0).sum())}/{len(h)}: " + h.to_dict().__repr__())
eq = np.cumsum(r); O.append(f"max drawdown (trade by trade) {(eq - np.maximum.accumulate(np.r_[0, eq])[1:]).min():.1f} R")
rng_ = np.random.default_rng(1); bs = np.array([rng_.choice(r, len(r)).mean() for _ in range(5000)])
O.append(f"X3 bootstrap chance true average <= 0: {(bs <= 0).mean():.1%}")
_, res = divergence(t0, t1, QQ)
thr = pd.Series(res).abs().rolling(250, min_periods=100).quantile(QQ).shift(1)
O.append("X4 threshold (gap, % ) median by year: " + (100 * thr.groupby(days.year).median()).round(3).to_dict().__repr__())
O.append("longs/shorts by year:\n" + T.groupby(["y", "side"]).R.sum().unstack().round(1).to_string())
print("\n".join(O)); open("out_v3.txt", "w").write("\n".join(O) + "\n")
