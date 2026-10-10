"""Stage 6: round-number push-through profile. Builds the touch list once, then simulates a grid."""
import numpy as np, pandas as pd, pickle, os
import common3 as c, engine as e
G = c.load_matrix("GBPUSD"); days = G["days"]; P = c.PIP
END = pd.Timestamp("2026-09-30")
valid = c.gap_ok(G, c.col_ny(1), c.col_ny(16)) & (G["nbars"] >= 1300) & (days <= END)
yrs = days.year.values
H, L, C = G["H"], G["L"], G["C"]
XC = c.col_ny(16)


def touch_list(offset, step=0.0050, t0=(3, 0), t1=(14, 0), away=15, look=60):
    CF = C
    res = []
    a, b = c.col_ny(*t0), c.col_ny(*t1)
    for i in range(len(days)):
        if not valid[i]: continue
        hi, lo = H[i], L[i]
        seen = set()
        for k in range(a, b):
            if np.isnan(hi[k]): continue
            lv0 = np.floor((lo[k] - offset) / step) * step + offset
            for lv in (lv0, lv0 + step):
                lv = round(lv, 5)
                if not (lo[k] <= lv <= hi[k]) or lv in seen: continue
                seen.add(lv)
                w = C[i, k - look - 1:k - look + 4]; w = w[~np.isnan(w)]
                if not len(w): continue
                ref = w[0]
                if abs(ref - lv) < away * P: continue
                if np.nanmax(hi[k - look:k]) >= lv and np.nanmin(lo[k - look:k]) <= lv: continue
                d = 1 if ref < lv else -1
                o = G["O"][i, k]
                entry = lv if (d > 0 and o <= lv) or (d < 0 and o >= lv) else o  # gap through -> open
                res.append(dict(i=i, k=k, d=d, lv=lv, entry=entry))
    return res


def simulate(tl, S, T):
    rows = []
    for t in tl:
        i, k, d, en = t["i"], t["k"], t["d"], t["entry"]
        stop = en - d * S * P; tgt = en + d * T * S * P if T else None
        # entry bar: count stop if the bar (after the touch) also reached the stop -> conservative
        g, why, kk = e.sim(G, i, d, k, en, stop, tgt, XC)
        rows.append(dict(day=days[i], side=d, risk_p=S, gross_p=g / P, why=why, k=k))
    return pd.DataFrame(rows)


if __name__ == "__main__":
    cp = os.path.join(c.CACHE, "touch_lists.pkl")
    if os.path.exists(cp): TR, TK = pickle.load(open(cp, "rb"))
    else:
        TR, TK = touch_list(0.0), touch_list(0.0025); pickle.dump((TR, TK), open(cp, "wb"))
    out = [f"touches: round {len(TR)}, control {len(TK)}"]
    for S in (10, 15, 20, 25):
        for T in (1, 2, None):
            a = simulate(TR, S, T); b = simulate(TK, S, T)
            a["R"] = (a.gross_p - 1.5) / S; b["R"] = (b.gross_p - 1.5) / S
            ya = a.groupby(pd.to_datetime(a.day).dt.year).R.mean(); yb = b.groupby(pd.to_datetime(b.day).dt.year).R.mean()
            gya = a.groupby(pd.to_datetime(a.day).dt.year).gross_p.mean()
            out.append(f"S={S:2d} T={str(T):4s} round: {a.R.mean():+.3f}R/tr gross {a.gross_p.mean():+.2f}p yrs+={(ya>0).sum()}/8 | "
                       f"control: {b.R.mean():+.3f}R gross {b.gross_p.mean():+.2f}p | round>control yrs {(ya>yb).sum()}/8 | "
                       + " ".join(f"{v:+.2f}" for v in ya))
            print(out[-1], flush=True)
    open("out_s6.txt", "w").write("\n".join(out))
