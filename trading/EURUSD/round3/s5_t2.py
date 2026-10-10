"""EURUSD round-3 stage 5 (W1-W7). Output: out_s5.txt"""
from tr3 import *
O = []
def t2(t0h=3, t1h=10, qq=0.75, lo_b=0.15, hi_b=0.6, rr=None):
    t0, t1 = c.col_ny(t0h), c.col_ny(t1h)
    sig, res = divergence(t0, t1, qq)
    okg = c.gap_ok(GB, t0, t1 + 1) & (GB["nbars"] >= 1300)
    rows = []
    for i in np.where((sig != 0) & valid & okg & ~np.isnan(ATR20))[0]:
        d = int(sig[i]); ent = CF[i, t1 - 1]
        hi, lo = np.nanmax(G["H"][i, t0:t1]), np.nanmin(G["L"][i, t0:t1])
        sd = (hi + P - ent) if d < 0 else (ent - lo + P)
        if sd < lo_b * ATR20[i] or sd > hi_b * ATR20[i] or sd < MIN_STOP: continue
        r = trade(i, d, t1, ent, sd, rr); r["entry_h"] = t1h; r["resid"] = res[i]; rows.append(r)
    return rows
O.append("== W1 quantile")
for qq in (0.6, 0.65, 0.7, 0.75, 0.8, 0.85):
    O.append(summarize(t2(qq=qq), f"W1 q {qq}", quiet=True)[0])
O.append("== W2 stall lower bound x upper bound")
for lb in (0.1, 0.15, 0.2, 0.25):
    for hb in (0.5, 0.6, 0.8, 99):
        O.append(summarize(t2(lo_b=lb, hi_b=hb), f"W2 lo {lb} hi {hb}", quiet=True)[0])
O.append("== W3-W5 checkpoints")
r8 = t2(2, 8); O.append(summarize(r8, "W3 02->08, enter 08:00", quiet=True)[0])
r10 = t2()
d8 = {r["day"] for r in r8}
comb = r8 + [r for r in r10 if r["day"] not in d8]
O.append(summarize(comb, "W4 08:00 + 10:00 checkpoints", quiet=True)[0])
O.append(summarize(t2(3, 12), "W5 03->12, enter 12:00", quiet=True)[0])
O.append("== W6 targets")
for rr in (1.0, 2.0):
    O.append(summarize(t2(rr=rr), f"W6 target {rr}R", quiet=True)[0])
O.append("== W7 weekday / news (T2 trades)")
T = pd.DataFrame(r10); T["R"] = (T.gross_p - 1.2) / T.risk_p
T["dow"] = pd.to_datetime(T.day).dt.dayofweek
O.append("by weekday: " + T.groupby("dow").R.agg(["size", "sum"]).round(1).to_string().replace("\n", " | "))
shock = np.zeros(n, bool)
for a_ in (c.col_ny(8, 30), c.col_ny(10)):
    m_ = px(a_ + 15) - px(a_); med = pd.Series(np.abs(m_)).rolling(20, min_periods=10).median().shift(1).values
    shock |= np.abs(m_) > 3 * med
sd_ = {days[i].date() for i in np.where(shock)[0]}
T["news"] = T.day.isin(sd_)
O.append("by US-shock day (08:30 or 10:00 NY): " + T.groupby("news").R.agg(["size", "sum", "mean"]).round(3).to_string().replace("\n", " | "))
print("\n".join(O)); open("out_s5.txt", "w").write("\n".join(O) + "\n")
