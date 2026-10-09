"""02: the 09:30 NY open. Gaps and gap fills; the first 5/15/30/60 minutes and whether the move continues; when RTH high/low is set."""
from levels import *
df = load(); T = day_table(df)
x = T[T.ok & T.prev_ok & T.atr_pct.notna() & T.o930.notna()].copy()
G = {t: g for t, g in df[df.tday.isin(x.index)].groupby("tday")}
rows = []
for t, r in x.iterrows():
    g = G[t]; nm = g.nymin.values; h, l, c, o = g.high.values, g.low.values, g.close.values, g.open.values
    rth = (nm >= 570) & (nm < 960)
    hh, ll, cc, mm = h[rth], l[rth], c[rth], nm[rth]
    e = dict(tday=t)
    gap = r.o930 - r.pdc; e["gap_pct"] = 100 * gap / r.pdc; e["gap_atr"] = e["gap_pct"] / r.atr_pct
    # gap fill: touch pdc during RTH, and by which time
    if gap > 0: touched = ll <= r.pdc
    elif gap < 0: touched = hh >= r.pdc
    else: touched = np.ones_like(ll, bool)
    e["fill_t"] = mm[touched.argmax()] if touched.any() else np.nan
    for k in [5, 15, 30, 60]:
        sel = mm < 570 + k
        e[f"r{k}"] = cc[sel][-1] - r.o930          # move of first k minutes
        e[f"hi{k}"] = hh[sel].max(); e[f"lo{k}"] = ll[sel].min(); e[f"c{k}"] = cc[sel][-1]
    e["c1600"] = r.c1600; e["o930"] = r.o930; e["atr_pct"] = r.atr_pct; e["pdc"] = r.pdc
    e["t_hi"] = mm[hh.argmax()]; e["t_lo"] = mm[ll.argmin()]
    e["rth_hi"] = hh.max(); e["rth_lo"] = ll.min()
    rows.append(e)
E = pd.DataFrame(rows).set_index("tday"); E["year"] = year_of(E.index)
E["atr_pts"] = E.atr_pct / 100 * E.o930
E.to_pickle("/tmp/claude-0/-home-user-my-first-project/1c8d33d7-d94d-5131-95fb-13a566ad2900/scratchpad/ndx_open.pkl")

print("=== 1. Gap at 09:30 NY (Doha 16:30 summer / 17:30 winter) vs previous 16:00 close. Size in % and in ATR units")
E["gsz"] = pd.cut(E.gap_atr.abs(), [0, 0.1, 0.25, 0.5, 5], labels=["<0.1ATR", "0.1-0.25", "0.25-0.5", ">0.5ATR"])
E["gdir"] = np.where(E.gap_pct > 0, "up", "down")
for y in ["Y1", "Y2"]:
    q = E[E.year == y]
    print(f"{y}: days {len(q)}, gap up {100*(q.gap_pct>0).mean():.0f}%, mean |gap| {q.gap_pct.abs().mean():.3f}% = {q.gap_atr.abs().mean():.2f} ATR")
f = E.groupby(["year", "gdir", "gsz"], observed=True).agg(n=("fill_t", "size"),
    fill_by_1000=("fill_t", lambda s: 100 * (s < 600).mean()), fill_by_1030=("fill_t", lambda s: 100 * (s < 630).mean()),
    fill_by_1200=("fill_t", lambda s: 100 * (s < 720).mean()), fill_by_1600=("fill_t", lambda s: 100 * s.notna().mean()))
print("gap fill = price touches previous 16:00 close during 09:30-16:00 (% of days)")
print(f.round(0).to_string())
# Gap direction vs RTH direction
print("\n=== 2. Does the RTH session go WITH the gap or AGAINST it? (RTH 09:30->16:00 return sign vs gap sign)")
E["rth"] = E.c1600 - E.o930
E["with_gap"] = np.sign(E.rth) == np.sign(E.gap_pct)
print(E.groupby(["year", "gdir", "gsz"], observed=True).agg(n=("rth", "size"), with_gap_pct=("with_gap", lambda s: 100 * s.mean()),
      rth_in_gapdir_atr=("rth", "mean")).assign(rth_in_gapdir_atr=lambda d: np.nan).drop(columns="rth_in_gapdir_atr").round(0).to_string())
E["rth_gd_atr"] = np.sign(E.gap_pct) * E.rth / E.atr_pts
print(E.groupby(["year", "gsz"], observed=True).rth_gd_atr.agg(["size", "mean", "median"]).round(3).to_string())

print("\n=== 3. Opening drive: does the first k minutes' direction continue to 16:00? (rest-of-day move, in ATR units, signed by first move)")
for k in [5, 15, 30, 60]:
    E[f"rest{k}"] = np.sign(E[f"r{k}"]) * (E.c1600 - E[f"c{k}"]) / E.atr_pts
    E[f"cont{k}"] = E[f"rest{k}"] > 0
    for y in ["Y1", "Y2"]:
        q = E[E.year == y]
        up, dn = q[q[f"r{k}"] > 0], q[q[f"r{k}"] < 0]
        print(f"first {k:2d} min {y}: continue {100*q[f'cont{k}'].mean():4.1f}% | mean rest-of-day {q[f'rest{k}'].mean():+.3f} ATR |"
              f" after UP start: n{len(up)} cont {100*up[f'cont{k}'].mean():4.1f}% mean {up[f'rest{k}'].mean():+.3f} | after DOWN start: n{len(dn)} cont {100*dn[f'cont{k}'].mean():4.1f}% mean {dn[f'rest{k}'].mean():+.3f}")
print("\n   same, only when the first 30 min moved strongly (|move| > 0.25 ATR)")
for y in ["Y1", "Y2"]:
    q = E[(E.year == y) & (E.r30.abs() / E.atr_pts > 0.25)]
    for s, nmx in [(1, "up"), (-1, "down")]:
        qq = q[np.sign(q.r30) == s]
        print(f"   {y} {nmx}: n{len(qq)} continue {100*qq.cont30.mean():.1f}% mean rest {qq.rest30.mean():+.3f} ATR")

print("\n=== 4. Opening range breakout (OR = first 30 / 60 min high-low). After OR ends, which side breaks first, and does price then reach +1 OR beyond the break before the other side?")
G2 = G
for k in [15, 30, 60]:
    res = []
    for t, e in E.iterrows():
        g = G2[t]; nm = g.nymin.values; h, l = g.high.values, g.low.values
        hi, lo = e[f"hi{k}"], e[f"lo{k}"]; orng = hi - lo
        sel = (nm >= 570 + k) & (nm < 960)
        hh, ll = h[sel], l[sel]
        bu = np.argmax(hh > hi) if (hh > hi).any() else 10**6; bd = np.argmax(ll < lo) if (ll < lo).any() else 10**6
        if bu == bd == 10**6: res.append((t, 0, np.nan, np.nan)); continue
        side = 1 if bu < bd else -1; j = min(bu, bd)
        if bu == bd: res.append((t, 9, np.nan, np.nan)); continue
        # after break: reach break + 1*OR (win) or back to opposite side (fail) first?
        tgt = hi + orng if side == 1 else lo - orng; stp = lo if side == 1 else hi
        out = 0
        for i in range(j, len(hh)):
            if side == 1:
                if ll[i] <= stp: out = -1; break
                if hh[i] >= tgt: out = 1; break
            else:
                if hh[i] >= stp: out = -1; break
                if ll[i] <= tgt: out = 1; break
        res.append((t, side, out, orng / e.atr_pts))
    R = pd.DataFrame(res, columns=["tday", "side", "out", "or_atr"]).set_index("tday"); R["year"] = year_of(R.index)
    R = R[R.side.isin([1, -1])]
    print(f"OR {k} min: OR size mean {R.or_atr.mean():.2f} ATR")
    print(R.groupby(["year", "side"]).out.agg(n="size", reach_1OR=lambda s: 100 * (s == 1).mean(), back_to_other_side=lambda s: 100 * (s == -1).mean(), neither=lambda s: 100 * (s == 0).mean()).round(1).to_string())

print("\n=== 5. When is the RTH high / low set? (% of days, by 30-min block, NY time)")
for y in ["Y1", "Y2"]:
    q = E[E.year == y]
    a = (q.t_hi // 30 * 30).value_counts(normalize=True).sort_index() * 100
    b = (q.t_lo // 30 * 30).value_counts(normalize=True).sort_index() * 100
    tb = pd.DataFrame({"high": a, "low": b}).fillna(0); tb.index = [f"{m//60:02d}:{m%60:02d}" for m in tb.index]
    print(y); print(tb.round(1).T.to_string())
