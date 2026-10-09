"""Repeating behaviours around the Asia range, previous-day high/low, London and NY opens."""
from common import *
from levels import day_table

df = load()
days = day_table(df)
cd = days[days.complete & days.pdh.notna()]
D = df[df.tday.isin(cd.index)]
print(f"days studied: {len(cd)}")
print(f"Asia range (00:00-07:00 London): avg {cd.arng.mean():.1f} median {cd.arng.median():.1f} pips; "
      f"25-75%: {cd.arng.quantile(.25):.1f}-{cd.arng.quantile(.75):.1f}")

res = []
for tday, g in D.groupby("tday"):
    d = cd.loc[tday]
    L, N = g.ldn_min.values, g.ny_min.values
    hi, lo, cl = g.high.values, g.low.values, g.close.values
    after = (L >= 420) & g.ldn_today.values  # from 07:00 London onward until 17:00 NY (end of tday)
    ldn = (L >= 420) & (L < 720)  # 07:00-12:00 London (Frankfurt + London morning)
    r = dict(tday=tday)
    r["ah_taken_ldn"] = (hi[ldn] > d.ah).any()
    r["al_taken_ldn"] = (lo[ldn] < d.al).any()
    r["ah_taken_day"] = (hi[after] > d.ah).any()
    r["al_taken_day"] = (lo[after] < d.al).any()
    r["pdh_taken"] = (hi > d.pdh).any(); r["pdl_taken"] = (lo < d.pdl).any()
    r["pdh_close_back"] = r["pdh_taken"] and d.close < d.pdh
    r["pdl_close_back"] = r["pdl_taken"] and d.close > d.pdl
    # first Asia break after 07:00 London
    idx = np.where(after & ((hi > d.ah) | (lo < d.al)))[0]
    if len(idx):
        i = idx[0]
        up = hi[i] > d.ah
        if hi[i] > d.ah and lo[i] < d.al:
            up = None
        r["first_break_side"] = {True: "high", False: "low", None: "both"}[up]
        r["first_break_ldn_min"] = L[i]
        if up is not None:
            lvl = d.ah if up else d.al
            mid = (d.ah + d.al) / 2
            rest = slice(i, None)
            # path after break: max extension beyond level, and whether price returned to mid / opposite side
            ext_path = (hi[rest] - lvl) if up else (lvl - lo[rest])
            back_mid = (lo[rest] <= mid) if up else (hi[rest] >= mid)
            back_opp = (lo[rest] <= d.al) if up else (hi[rest] >= d.ah)
            k_mid = np.argmax(back_mid) if back_mid.any() else None
            # max extension before returning to mid
            ext_before_mid = ext_path[: (k_mid if k_mid is not None else len(ext_path))].max() / PIP if (k_mid is None or k_mid > 0) else ext_path[0] / PIP
            r["ext_before_mid"] = ext_before_mid
            r["ret_mid"] = k_mid is not None
            r["ret_opp"] = back_opp.any()
            r["max_ext_day"] = ext_path.max() / PIP
            r["close_beyond"] = (d.close > lvl) if up else (d.close < lvl)
    # London morning direction vs NY
    if not np.isnan(d.ldn_open) and not np.isnan(d.ny8_open):
        r["ldn_move"] = (d.ny8_open - d.ldn_open) / PIP
        r["ny_move"] = (d.close - d.ny8_open) / PIP
    # first hour of London (08-09 London) vs rest of the day (09 London -> close)
    m9 = np.where(L == 540)[0]
    if len(m9) and not np.isnan(d.ldn_open):
        p9 = g.open.values[m9[0]]
        r["h1"] = (p9 - d.ldn_open) / PIP
        r["rest"] = (d.close - p9) / PIP
    # revisit of London open price after 10:00 London
    m = L >= 600
    r["ldn_open_revisit_after10"] = ((lo[m] <= d.ldn_open) & (hi[m] >= d.ldn_open)).any() if m.any() else np.nan
    res.append(r)
R = pd.DataFrame(res).set_index("tday")
n = len(R)
pct = lambda s: f"{s.sum()}/{len(s)} = {s.mean():.0%}"
print("\n== Asia range raids ==")
print("Asia high taken 07:00-12:00 London:", pct(R.ah_taken_ldn))
print("Asia low  taken 07:00-12:00 London:", pct(R.al_taken_ldn))
print("At least one side taken 07-12 London:", pct(R.ah_taken_ldn | R.al_taken_ldn))
print("Both sides taken 07-12 London:", pct(R.ah_taken_ldn & R.al_taken_ldn))
print("Both sides taken by 17:00 NY:", pct(R.ah_taken_day & R.al_taken_day))
print("Neither side taken all day:", pct(~R.ah_taken_day & ~R.al_taken_day))

fb = R.dropna(subset=["first_break_side"])
print("\nFirst break side:", fb.first_break_side.value_counts().to_dict())
fbt = fb.first_break_ldn_min
print("First break time (London clock): 07-08:", (fbt < 480).mean().round(2), " 08-09:", ((fbt >= 480) & (fbt < 540)).mean().round(2),
      " 09-12:", ((fbt >= 540) & (fbt < 720)).mean().round(2), " after 12:", (fbt >= 720).mean().round(2))
s = fb[fb.first_break_side != "both"]
print(f"\nAfter the FIRST Asia break (n={len(s)}):")
for x in [5, 10, 15, 20, 30]:
    print(f"  extension beyond level reached >= {x} pips before any return to Asia mid: {(s.ext_before_mid >= x).mean():.0%}")
print("  returned to Asia mid later in the day:", pct(s.ret_mid.astype(bool)))
print("  reached the OPPOSITE Asia side later in the day:", pct(s.ret_opp.astype(bool)))
print("  day closed beyond the broken level (true breakout):", pct(s.close_beyond.astype(bool)))
print("  median max extension in the day beyond broken level:", s.max_ext_day.median().round(1))
# fake-out: small extension (<10) then return to mid
fk = s[s.ext_before_mid < 10]
print(f"  'shallow break' (<10 pips beyond before returning to mid): {len(fk)}/{len(s)} = {len(fk)/len(s):.0%}; of those reached opposite side: {fk.ret_opp.astype(bool).mean():.0%}")

print("\n== Previous day high/low ==")
print("PDH taken:", pct(R.pdh_taken), "| of those, day closed back below PDH:", pct(R[R.pdh_taken].pdh_close_back))
print("PDL taken:", pct(R.pdl_taken), "| of those, day closed back above PDL:", pct(R[R.pdl_taken].pdl_close_back))
print("Both PDH and PDL taken (outside day):", pct(R.pdh_taken & R.pdl_taken))
print("Neither (inside day):", pct(~R.pdh_taken & ~R.pdl_taken))

print("\n== London morning vs New York ==")
x = R.dropna(subset=["ldn_move", "ny_move"])
same = np.sign(x.ldn_move) == np.sign(x.ny_move)
print("NY session (08:00 NY->17:00 NY) continued London's direction (08:00 London->08:00 NY):", pct(same))
big = x[x.ldn_move.abs() >= 30]
print("  when London moved >= 30 pips: continued", pct(np.sign(big.ldn_move) == np.sign(big.ny_move)),
      f"| avg NY move in London's direction {np.mean(np.sign(big.ldn_move) * big.ny_move):.1f} pips")

print("\n== London first hour (08-09 London) vs rest of day ==")
y = R.dropna(subset=["h1", "rest"])
print("Rest of day continued the first-hour direction:", pct(np.sign(y.h1) == np.sign(y.rest)))
yb = y[y.h1.abs() >= 15]
print("  when first hour moved >= 15 pips:", pct(np.sign(yb.h1) == np.sign(yb.rest)))
print("\nLondon 08:00 open price traded again after 10:00 London:", pct(R.ldn_open_revisit_after10.dropna().astype(bool)))
R.to_csv("out_03_daily.csv")
