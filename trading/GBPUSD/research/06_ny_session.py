"""New York session behaviour relative to the London session range and the London 4pm fix."""
from common import *
from levels import day_table

df = load()
days = day_table(df)
cd = days[days.complete & days.prev_complete & days.pdh.notna()]
D = df[df.tday.isin(cd.index)]
res = []
for tday, g in D.groupby("tday"):
    d = cd.loc[tday]
    g = g[g.ldn_today]
    L, N = g.ldn_min.values, g.ny_min.values
    hi, lo, op, cl = g.high.values, g.low.values, g.open.values, g.close.values
    ldn = (L >= 480) & (N < 480)            # 08:00 London -> 08:00 NY
    nyam = (N >= 480) & (N < 720)           # 08:00-12:00 NY
    if not ldn.any() or not nyam.any(): continue
    lh, ll = hi[ldn].max(), lo[ldn].min()
    i_ny = np.where(nyam)[0]
    r = dict(tday=tday, lrng=(lh - ll) / PIP)
    p8 = op[i_ny[0]]
    r["ldn_dir"] = np.sign(p8 - op[np.where(L >= 480)[0][0]])
    r["lh_taken"] = (hi[nyam] > lh).any(); r["ll_taken"] = (lo[nyam] < ll).any()
    # first London extreme taken in NY morning: then reversal to the London midpoint?
    k = np.where(nyam & ((hi > lh) | (lo < ll)))[0]
    if len(k):
        i = k[0]; up = hi[i] > lh
        lvl = lh if up else ll; mid = (lh + ll) / 2
        rest = slice(i, np.where(N < 1020)[0][-1] + 1)
        ext = ((hi[rest] - lvl) if up else (lvl - lo[rest])) / PIP
        bm = (lo[rest] <= mid) if up else (hi[rest] >= mid)
        r["ny_break_side"] = "high" if up else "low"
        r["ny_break_with_ldn_trend"] = (1 if up else -1) == r["ldn_dir"]
        r["ny_ext_max"] = ext.max()
        r["ny_back_mid"] = bm.any()
        r["close_beyond"] = (cl[rest][-1] > lvl) if up else (cl[rest][-1] < lvl)
    # London 4pm fix (16:00 London): move 08:00 NY -> fix, and fix -> 17:00 NY
    f = np.where(L == 960)[0]; e = np.where(N == 1019)[0]
    if len(f) and len(e):
        r["to_fix"] = (op[f[0]] - p8) / PIP; r["after_fix"] = (cl[e[0]] - op[f[0]]) / PIP
    res.append(r)
R = pd.DataFrame(res)
pct = lambda s: f"{int(s.sum())}/{len(s)} = {s.mean():.0%}"
print(f"London session (08:00 London-08:00 NY) range: median {R.lrng.median():.1f} pips")
print("NY morning (08-12 NY) takes London high:", pct(R.lh_taken), "| London low:", pct(R.ll_taken), "| either:", pct(R.lh_taken | R.ll_taken))
b = R.dropna(subset=["ny_break_side"])
print(f"After NY takes a London extreme (n={len(b)}): back to London mid by 17:00 NY {pct(b.ny_back_mid.astype(bool))}; "
      f"day closes beyond the level {pct(b.close_beyond.astype(bool))}; median max extension {b.ny_ext_max.median():.1f} pips")
for w, gg in b.groupby("ny_break_with_ldn_trend"):
    print(f"   break {'WITH' if w else 'AGAINST'} London's direction (n={len(gg)}): back to mid {gg.ny_back_mid.astype(bool).mean():.0%}, close beyond {gg.close_beyond.astype(bool).mean():.0%}, med ext {gg.ny_ext_max.median():.1f}")
x = R.dropna(subset=["to_fix"])
same = np.sign(x.to_fix) == np.sign(x.after_fix)
print("After the 16:00 London fix, NY afternoon continued the 08:00 NY->fix move:", pct(same))
bx = x[x.to_fix.abs() >= 30]
print("  when 08:00 NY->fix move >= 30 pips:", pct(np.sign(bx.to_fix) == np.sign(bx.after_fix)), f"avg after-fix move in that direction {np.mean(np.sign(bx.to_fix)*bx.after_fix):+.1f} pips")
