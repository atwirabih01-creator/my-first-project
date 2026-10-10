"""EURUSD round-3 stage 2 (D1-D9). Output: out_s2.txt"""
from eu3 import *
GB = align("GBPUSD"); GC = ffill(GB["C"])
gvalid = (GB["nbars"] >= 1300)
def resid(t0, t1):
    e_l = np.log(px(t1) / px(t0)); g_l = np.log(px(t1, GC) / px(t0, GC))
    return pd.Series(e_l - g_l)
res = resid(c.col_ny(3), c.col_ny(10))
q = lambda p: res.abs().rolling(250, min_periods=100).quantile(p).shift(1).values
a = res.abs().values
fwd = px(end_col) - px(c.col_ny(10))
sg = -np.sign(res.values)
print("== D1 dose-response by residual size (past-250-day quantile)")
for lo_, hi_ in ((0, .5), (.5, .75), (.75, .9), (.9, 1.01)):
    lo_v = q(lo_) if lo_ > 0 else np.zeros(n); hi_v = q(hi_) if hi_ < 1 else np.full(n, np.inf)
    report(f"D1 bucket {lo_}-{hi_}", sg, fwd, gvalid & (a >= lo_v) & (a < hi_v))
top = gvalid & (a > q(.75))
print("== D2 sides")
report("D2 EUR out-performed -> short EUR", sg, fwd, top & (res.values > 0))
report("D2 EUR under-performed -> long EUR", sg, fwd, top & (res.values < 0))
print("== D3 control: EUR's own big move faded")
em = pd.Series(px(c.col_ny(10)) - px(c.col_ny(3)))
eq = em.abs().rolling(250, min_periods=100).quantile(.75).shift(1).values
report("D3 fade EUR own top-quartile 03-10 move", -np.sign(em.values), fwd, em.abs().values > eq)
report("D3b S9 signal on days EUR's own move NOT top quartile", sg, fwd, top & ~(em.abs().values > eq))
report("D3c S9 signal on days EUR's own move IS top quartile", sg, fwd, top & (em.abs().values > eq))
print("== D4 through which leg (pips of each, signed in the fade direction)")
gf = px(end_col, GC) - px(c.col_ny(10), GC)
report("D4 GBPUSD 10-15:59 in the EUR-fade direction (if EUR should fall, GBP?)", sg, gf, top)
eg = np.log(px(end_col) / px(end_col, GC)) - np.log(px(c.col_ny(10)) / px(c.col_ny(10), GC))
report("D4 synthetic EURGBP 10-15:59 fade (in 1e-4 log units)", sg, eg, top)
print("== D5 timing variants")
for (t0, t1, t2, nm) in ((c.col_ny(2), c.col_ny(8), end_col, "02-08 fade 08-15:59"), (c.col_ny(3), c.col_ny(12), end_col, "03-12 fade 12-15:59"),
                          (c.col_ny(3), c.col_ny(10), c.col_ny(12), "03-10 fade 10-12")):
    r_ = resid(t0, t1); th = r_.abs().rolling(250, min_periods=100).quantile(.75).shift(1).values
    report(f"D5 {nm}", -np.sign(r_.values), px(t2) - px(t1), gvalid & (r_.abs().values > th))
print("== D6 share by 12:00 is D5 03-10 fade 10-12 vs S9 total")
print("== D7 Monday long, start after the reopen")
dow = pd.Series(days).dt.dayofweek.values
for st, nm in ((c.col_ny(19), "19:00 NY Sun"), (lcol(0), "00:00 London"), (c.col_ny(2), "02:00 NY")):
    for d_, dn in ((0, "Mon"), (1, "Tue"), (2, "Wed"), (3, "Thu"), (4, "Fri")):
        report(f"D7 {dn} long from {nm} -> 15:59", np.ones(n), px(end_col) - px(st), dow == d_)
report("D7 Mon long 17:00->19:00 NY (reopen window only)", np.ones(n), px(c.col_ny(19)) - px(1), dow == 0)
print("== D8 ECB-time shock fade, Thursday vs other")
fcol_ = lambda h, m=0: c.col_ldn(h - 1, m, off)
m_ = px(fcol_(14, 30)) - px(fcol_(14, 15)); med = pd.Series(np.abs(m_)).rolling(20, min_periods=10).median().shift(1).values
big = np.abs(m_) > 3 * med; fw = px(fcol_(18, 15)) - px(fcol_(14, 30))
report("D8 Thursday", -np.sign(m_), fw, big & (dow == 3))
report("D8 other days", -np.sign(m_), fw, big & (dow != 3))
print("== D9 S3 dose-response")
pH, pL = hl(c.col_ny(3), c.col_ny(8, 20)); pr = pd.Series(pH - pL); prr = (pr / pr.rolling(20, min_periods=15).median().shift(1)).values
pd_, pk = first_break(pH, pL, c.col_ny(8, 20), c.col_ny(12))
for lo_, hi_ in ((0, .5), (.5, .7), (.7, .9), (.9, 1.2), (1.2, 99)):
    report(f"D9 pre-NY ratio {lo_}-{hi_}", pd_, px(end_col) - np.where(pd_ > 0, pH, pL), (pd_ != 0) & (prr >= lo_) & (prr < hi_))
open("out_s2.txt", "w").write("\n".join(out) + "\n")
