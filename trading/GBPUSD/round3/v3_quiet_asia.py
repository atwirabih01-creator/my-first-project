"""GBPUSD round-3 v3 "Quiet-Asia breakout" - exact rules as in strategy.md (round-3 section). Agent 1 quick check, design data only.
Outputs: v3_trades.csv, out_v3.txt"""
import numpy as np, pandas as pd
import common3 as c, engine as e
G = c.load_matrix("GBPUSD"); days = G["days"]; off = G["ldn_off"]; P = c.PIP
END = pd.Timestamp("2026-09-30")
lc = lambda h, m=0: c.col_ldn(h, m, off)
A0, A1, W1 = lc(0), lc(7), lc(12)
XC = c.col_ny(16)                      # exit = close of the 15:59 NY bar
QUIET, RR, MINSTOP = 0.7, 2.0, 3.0
n = len(days)
gap_ok = c.gap_ok(G, c.col_ny(19), c.col_ny(16))   # no hole > 15 min from 19:00 NY (eve) to 16:00 NY
valid = gap_ok & (G["nbars"] >= 1300) & (days <= END)
asia_hi = np.array([np.nanmax(G["H"][i, A0[i]:A1[i]]) if (~np.isnan(G["H"][i, A0[i]:A1[i]])).any() else np.nan for i in range(n)])
asia_lo = np.array([np.nanmin(G["L"][i, A0[i]:A1[i]]) if (~np.isnan(G["L"][i, A0[i]:A1[i]])).any() else np.nan for i in range(n)])
asia_rng = pd.Series(asia_hi - asia_lo)
asia_med20 = asia_rng.rolling(20, min_periods=15).median().shift(1).values   # previous 20 trading days
quiet = asia_rng.values < QUIET * asia_med20

rows = []; skipped = dict(gap=0, not_quiet=0, no_break=0, both_same_minute=0, small_stop=0)
for i in range(n):
    if days[i] > END: continue
    if not valid[i]: skipped["gap"] += 1; continue
    if not quiet[i]: skipped["not_quiet"] += 1; continue
    aH, aL = asia_hi[i], asia_lo[i]
    if (aH - aL) < MINSTOP * P: skipped["small_stop"] += 1; continue
    sig = None
    for k in range(A1[i], W1[i]):
        h, l, o = G["H"][i, k], G["L"][i, k], G["O"][i, k]
        if np.isnan(h): continue
        up, dn = h > aH, l < aL
        if up and dn: skipped["both_same_minute"] += 1; sig = "x"; break
        if up: sig = (1, k, max(aH, o)); break
        if dn: sig = (-1, k, min(aL, o)); break
    if sig is None: skipped["no_break"] += 1; continue
    if sig == "x": continue
    d, k, entry = sig
    stop = aL if d > 0 else aH
    risk = abs(entry - stop); tgt = entry + d * RR * risk
    g, why, kx = e.sim(G, i, d, k, entry, stop, tgt, XC)
    utc_entry = days[i] - pd.Timedelta(hours=7) + pd.Timedelta(minutes=int(k)) - pd.Timedelta(hours=int(G["ny_utc"][i]))
    rows.append(dict(day=days[i].date(), side=d, entry_ny_min=int(k), asia_hi=round(aH, 5), asia_lo=round(aL, 5),
                     asia_range_p=round((aH - aL) / P, 1), median20_p=round(asia_med20[i] / P, 1), entry=round(entry, 5),
                     stop=round(stop, 5), target=round(tgt, 5), risk_p=risk / P, gross_p=g / P, exit=why))
T = pd.DataFrame(rows)
# entry time label in New York local time
T["entry_ny"] = [f"{((17 * 60 + k) // 60) % 24:02d}:{k % 60:02d}" for k in T.entry_ny_min]
T["R"] = (T.gross_p - 1.5) / T.risk_p
T.to_csv("v3_trades.csv", index=False)
out = []
for cost in (1.5, 3.0):
    txt, TT = e.stats(T, cost, f"v3 quiet-Asia breakout"); out.append(txt)
out.append(f"skipped days: {skipped}")
out.append("exits: " + repr(T.exit.value_counts().to_dict()))
r = T.R.values
out.append(f"avg win {r[r>0].mean():+.2f}R, avg loss {r[r<=0].mean():+.2f}R, trades/yr {len(T)/7.75:.0f}")
rng_ = np.random.default_rng(1)
bs = np.array([rng_.choice(r, len(r)).mean() for _ in range(5000)])
out.append(f"bootstrap: chance true average <= 0: {(bs <= 0).mean():.1%}")
# 2023 note
print("\n".join(out)); open("out_v3.txt", "w").write("\n".join(out) + "\n")
