"""EURUSD round-3 stage 4 (U1-U6). Output: out_s4.txt"""
from tr3 import *
O = []
k10 = c.col_ny(10)
def t2rows(qq=0.75, mode="skip", rr=None, only=None):
    sig, _ = divergence(qq=qq); rows = []
    for i in np.where((sig != 0) & valid & ~np.isnan(ATR20))[0]:
        d = int(sig[i]); ent = CF[i, k10 - 1]
        hi, lo = np.nanmax(G["H"][i, c.col_ny(3):k10]), np.nanmin(G["L"][i, c.col_ny(3):k10])
        sd = (hi + P - ent) if d < 0 else (ent - lo + P)
        reason = "ok" if 0.15 * ATR20[i] <= sd <= 0.6 * ATR20[i] else ("small" if sd < 0.15 * ATR20[i] else "big")
        if mode == "skip" and reason != "ok": continue
        if mode == "diag" and reason != only: continue
        if mode == "bound": sd = min(max(sd, 0.15 * ATR20[i]), 0.6 * ATR20[i])
        sd = max(sd, MIN_STOP)
        r = trade(i, d, k10, ent, sd, rr); r["why_stop"] = reason; rows.append(r)
    return rows
for lab, kw in (("U1 skipped: structural stop < 0.15 ATR", dict(mode="diag", only="small")),
                ("U1 skipped: structural stop > 0.6 ATR", dict(mode="diag", only="big"))):
    txt, _ = summarize(t2rows(**kw), lab, quiet=True); O.append(txt)
txt, T = summarize(t2rows(mode="bound"), "U2 T2b bounded structural stop"); O.append(txt); T.to_csv("t2b_trades.csv", index=False)
O.append("U2 by side per year (R): " + T.groupby(["y", "side"]).R.sum().unstack().round(1).to_string().replace("\n", " | "))
O.append("U2 by stop reason: " + T.groupby("why_stop").R.agg(["size", "sum", "mean"]).round(3).to_string().replace("\n", " | "))
O.append("== U3 sensitivity of T2b")
for qq in (0.7, 0.75, 0.8, 0.85):
    for rr in (None, 1.0, 2.0):
        txt, _ = summarize(t2rows(qq, "bound", rr), f"q {qq} target {rr}", quiet=True); O.append(txt)
# U4
T2 = pd.DataFrame(t2rows()); 
f = lambda h, m=0: c.col_ldn(h - 1, m, off)
a, b, x = f(14, 15), f(14, 30), f(18, 15)
m_ = px(b) - px(a); med = pd.Series(np.abs(m_)).rolling(20, min_periods=10).median().shift(1).values
rows = []
for i in np.where(valid & (np.abs(m_) > 3 * med) & ~np.isnan(ATR20))[0]:
    rows.append(trade(i, -int(np.sign(m_[i])), b[i], CF[i, b[i] - 1], max(0.3 * ATR20[i], MIN_STOP), None, min(x[i], end_col)))
both = pd.concat([T2, pd.DataFrame(rows)]).sort_values("day")
txt, _ = summarize(both.to_dict("records"), "U4 T2 + T7 together", quiet=True); O.append(txt)
# U5 / U6 fades of wide-box breaks
def fade_break(bH, bL, a_, b_, ratio, thr, lab):
    rows = []
    for i in np.where(valid & (ratio > thr) & ~np.isnan(ATR20))[0]:
        aa = np.broadcast_to(a_, (n,))[i]; bb = np.broadcast_to(b_, (n,))[i]
        for k in range(aa, bb):
            h, l, o = G["H"][i, k], G["L"][i, k], G["O"][i, k]
            if np.isnan(h): continue
            if h > bH[i] and l < bL[i]: break
            if h > bH[i] or l < bL[i]:
                d = -1 if h > bH[i] else 1; ent = bH[i] if d < 0 else bL[i]
                ent = max(ent, o) if d < 0 else min(ent, o)
                rows.append(trade(i, d, k, ent, max(0.3 * ATR20[i], MIN_STOP))); break
    txt, _ = summarize(rows, lab, quiet=True); O.append(txt)
aH, aL = hl(lcol(0), lcol(7)); ar_ = pd.Series(aH - aL); arr = (ar_ / ar_.rolling(20, min_periods=15).median().shift(1)).values
fade_break(aH, aL, lcol(7), lcol(12), arr, 1.3, "U5 fade London break of wide Asia box")
pH, pL = hl(c.col_ny(3), c.col_ny(8, 20)); pr = pd.Series(pH - pL); prr = (pr / pr.rolling(20, min_periods=15).median().shift(1)).values
fade_break(pH, pL, c.col_ny(8, 20), c.col_ny(12), prr, 1.2, "U6 fade break of wide pre-NY box")
print("\n".join(O)); open("out_s4.txt", "w").write("\n".join(O) + "\n")
