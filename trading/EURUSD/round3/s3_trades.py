"""EURUSD round-3 stage 3 trade tests T1-T7 + sensitivity. Output: out_s3.txt"""
from tr3 import *
O = []
sig, res = divergence()
k10 = c.col_ny(10)
def t1rows(k_stop=0.3, rr=None, xcol=None, sig_=sig, structural=False):
    rows = []
    for i in np.where((sig_ != 0) & valid & ~np.isnan(ATR20))[0]:
        d = int(sig_[i]); ent = CF[i, k10 - 1]
        if structural:
            hi, lo = np.nanmax(G["H"][i, c.col_ny(3):k10]), np.nanmin(G["L"][i, c.col_ny(3):k10])
            sd = (hi + P - ent) if d < 0 else (ent - lo + P)
            if sd < 0.15 * ATR20[i] or sd > 0.6 * ATR20[i]: continue
        else:
            sd = max(k_stop * ATR20[i], MIN_STOP)
        rows.append(trade(i, d, k10, ent, sd, rr, xcol))
    return rows
for lab, kw in (("T1 S9 fade, 0.3ATR stop, no target", {}), ("T2 structural stop", dict(structural=True)),
                ("T3 0.3ATR, 1R", dict(rr=1.0)), ("T4 0.3ATR, exit 12:00 NY", dict(xcol=c.col_ny(12))), ("T5 0.3ATR, 2R", dict(rr=2.0))):
    txt, T = summarize(t1rows(**kw), lab); O.append(txt); print(txt)
    if lab.startswith("T1"): T.to_csv("t1_trades.csv", index=False)
# T6 NY squeeze
pH, pL = hl(c.col_ny(3), c.col_ny(8, 20)); pr = pd.Series(pH - pL); prr = (pr / pr.rolling(20, min_periods=15).median().shift(1)).values
rows = []
for i in np.where(valid & (prr < 0.7))[0]:
    if pH[i] - pL[i] < MIN_STOP: continue
    s_ = None
    for k in range(c.col_ny(8, 20), c.col_ny(12)):
        h, l, o = G["H"][i, k], G["L"][i, k], G["O"][i, k]
        if np.isnan(h): continue
        if h > pH[i] and l < pL[i]: s_ = "x"; break
        if h > pH[i]: s_ = (1, k, max(pH[i], o)); break
        if l < pL[i]: s_ = (-1, k, min(pL[i], o)); break
    if s_ is None or s_ == "x": continue
    d, k, ent = s_; stopp = pL[i] if d > 0 else pH[i]
    rows.append(trade(i, d, k, ent, abs(ent - stopp), 2.0))
txt, T = summarize(rows, "T6 NY pre-open squeeze breakout 2R"); O.append(txt); print(txt)
# T7 14:15 Frankfurt shock fade
f = lambda h, m=0: c.col_ldn(h - 1, m, off)
a, b, x = f(14, 15), f(14, 30), f(18, 15)
m_ = px(b) - px(a); med = pd.Series(np.abs(m_)).rolling(20, min_periods=10).median().shift(1).values
rows = []
for i in np.where(valid & (np.abs(m_) > 3 * med) & ~np.isnan(ATR20))[0]:
    d = -int(np.sign(m_[i])); ent = CF[i, b[i] - 1]
    rows.append(trade(i, d, b[i], ent, max(0.3 * ATR20[i], MIN_STOP), None, min(x[i], end_col)))
txt, T = summarize(rows, "T7 14:15 Frankfurt shock fade"); O.append(txt); print(txt)
O.append("\n== Sensitivity of T1 (not for picking)")
for ks in (0.2, 0.3, 0.4, 0.5):
    for rr in (None, 1.0, 2.0):
        txt, _ = summarize(t1rows(ks, rr), f"stop {ks} ATR, target {rr}", quiet=True); O.append(txt)
for qq in (0.7, 0.75, 0.8, 0.85):
    s2_, _ = divergence(qq=qq)
    txt, _ = summarize(t1rows(sig_=s2_), f"quantile {qq}", quiet=True); O.append(txt)
print("\n".join(O[-17:]))
open("out_s3.txt", "w").write("\n".join(O) + "\n")
