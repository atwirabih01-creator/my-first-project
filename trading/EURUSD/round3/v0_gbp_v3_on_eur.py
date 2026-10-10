"""Stage 0: GBPUSD round-3 v3 'Quiet-Asia breakout' applied UNCHANGED to EURUSD (cost 1.2 pips). Agent 1, design data only.
V0 = threshold 0.7 (as written). V0b = thresholds 0.6..1.0 (descriptive only). Output: out_v0.txt, v0_trades.csv"""
import numpy as np, pandas as pd
import common3 as c, engine as e
SYM = "EURUSD"
G = c.load_matrix(SYM); days = G["days"]; off = G["ldn_off"]; P = c.PIP
END = pd.Timestamp("2026-09-30")
lc = lambda h, m=0: c.col_ldn(h, m, off)
A0, A1, W1 = lc(0), lc(7), lc(12)
XC = c.col_ny(16)
RR, MINSTOP = 2.0, 3.0
n = len(days)
gap_ok = c.gap_ok(G, c.col_ny(19), c.col_ny(16))
valid = gap_ok & (G["nbars"] >= 1300) & (days <= END)
asia_hi = np.array([np.nanmax(G["H"][i, A0[i]:A1[i]]) if (~np.isnan(G["H"][i, A0[i]:A1[i]])).any() else np.nan for i in range(n)])
asia_lo = np.array([np.nanmin(G["L"][i, A0[i]:A1[i]]) if (~np.isnan(G["L"][i, A0[i]:A1[i]])).any() else np.nan for i in range(n)])
asia_rng = pd.Series(asia_hi - asia_lo)
asia_med20 = asia_rng.rolling(20, min_periods=15).median().shift(1).values

def run(QUIET):
    quiet = asia_rng.values < QUIET * asia_med20
    rows = []; sk = dict(gap=0, not_quiet=0, no_break=0, both=0, small=0)
    for i in range(n):
        if days[i] > END: continue
        if not valid[i]: sk["gap"] += 1; continue
        if not quiet[i]: sk["not_quiet"] += 1; continue
        aH, aL = asia_hi[i], asia_lo[i]
        if (aH - aL) < MINSTOP * P: sk["small"] += 1; continue
        sig = None
        for k in range(A1[i], W1[i]):
            h, l, o = G["H"][i, k], G["L"][i, k], G["O"][i, k]
            if np.isnan(h): continue
            up, dn = h > aH, l < aL
            if up and dn: sk["both"] += 1; sig = "x"; break
            if up: sig = (1, k, max(aH, o)); break
            if dn: sig = (-1, k, min(aL, o)); break
        if sig is None: sk["no_break"] += 1; continue
        if sig == "x": continue
        d, k, entry = sig
        stop = aL if d > 0 else aH
        risk = abs(entry - stop); tgt = entry + d * RR * risk
        g, why, kx = e.sim(G, i, d, k, entry, stop, tgt, XC)
        rows.append(dict(day=days[i].date(), side=d, entry_ny_min=int(k), asia_range_p=round((aH - aL) / P, 1),
                         median20_p=round(asia_med20[i] / P, 1), entry=round(entry, 5), stop=round(stop, 5), target=round(tgt, 5),
                         risk_p=risk / P, gross_p=g / P, exit=why))
    return pd.DataFrame(rows), sk

out = []
T, sk = run(0.7)
T["R"] = (T.gross_p - 1.2) / T.risk_p
T.to_csv("v0_trades.csv", index=False)
for cost in (1.2, 2.4):
    txt, _ = e.stats(T, cost, "V0 = GBPUSD v3 unchanged on EURUSD"); out.append(txt)
out.append(f"skipped: {sk}; exits {T.exit.value_counts().to_dict()}; trades/yr {len(T)/7.75:.0f}")
out.append("\nV0b dose-response (descriptive): threshold -> trades, total R, R/trade, years positive")
for q in (0.6, 0.7, 0.8, 0.9, 1.0, 99):
    t, _ = run(q); t["R"] = (t.gross_p - 1.2) / t.risk_p
    yp = (t.groupby(pd.to_datetime(t.day).dt.year).R.sum() > 0).sum()
    out.append(f"  <{q}: n={len(t)} totR={t.R.sum():+.1f} perTr={t.R.mean():+.3f} yrs+={yp}/8")
print("\n".join(out)); open("out_v0.txt", "w").write("\n".join(out) + "\n")
