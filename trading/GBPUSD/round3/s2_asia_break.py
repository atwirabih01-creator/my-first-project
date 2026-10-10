"""Stage 2: London follow-through of the Asia-range break (T1..T5, declared in TESTS_DECLARED.md)."""
import sys, numpy as np, pandas as pd
import common3 as c, engine as e
G = c.load_matrix("GBPUSD"); days = G["days"]; off = G["ldn_off"]; P = c.PIP
END = pd.Timestamp("2026-09-30")
valid = c.gap_ok(G, c.col_ny(19), c.col_ny(16)) & (G["nbars"] >= 1300) & (days <= END)
lc = lambda h, m=0: c.col_ldn(h, m, off)
A0, A1, W1 = lc(0), lc(7), lc(12)
XC = c.col_ny(16)  # exit = close of 15:59 bar

rng = pd.Series(np.nanmax(G["H"], 1) - np.nanmin(G["L"], 1))
cl = pd.Series(np.array([G["C"][i][~np.isnan(G["C"][i])][-1] if (~np.isnan(G["C"][i])).any() else np.nan for i in range(len(days))]))
atr5 = rng.rolling(5).mean().shift(1); atr100 = rng.rolling(100).mean().shift(1)
er10 = (cl.shift(1) - cl.shift(11)).abs() / cl.diff().abs().rolling(10).sum().shift(1)
er_med = er10.rolling(250, min_periods=100).median()


def signals():
    out = []
    for i in range(len(days)):
        if not valid[i]: continue
        a0, a1, w1 = A0[i], A1[i], W1[i]
        aH = np.nanmax(G["H"][i, a0:a1]); aL = np.nanmin(G["L"][i, a0:a1])
        for k in range(a1, w1):
            h, l, o = G["H"][i, k], G["L"][i, k], G["O"][i, k]
            if np.isnan(h): continue
            up, dn = h > aH, l < aL
            if up and dn: break
            if up:
                out.append(dict(i=i, d=1, k=k, entry=max(aH, o), aH=aH, aL=aL)); break
            if dn:
                out.append(dict(i=i, d=-1, k=k, entry=min(aL, o), aH=aH, aL=aL)); break
    return out


def run(sigs, stopmode="opp", rr=None, mask=None):
    rows = []
    for s in sigs:
        i, d = s["i"], s["d"]
        if mask is not None and not mask[i]: continue
        if stopmode == "opp": stop = s["aL"] if d > 0 else s["aH"]
        elif stopmode == "mid": stop = (s["aH"] + s["aL"]) / 2
        risk = abs(s["entry"] - stop)
        if risk < 3 * P: continue
        tgt = s["entry"] + d * rr * risk if rr else None
        g, why, k = e.sim(G, i, d, s["k"], s["entry"], stop, tgt, XC)
        rows.append(dict(day=days[i], side=d, risk_p=risk / P, gross_p=g / P, why=why))
    return pd.DataFrame(rows)


if __name__ == "__main__":
    S = signals()
    out = []
    tests = [("T1 stop=opposite Asia side, exit 15:59 NY", run(S, "opp")),
             ("T2 stop=Asia middle, exit 15:59 NY", run(S, "mid")),
             ("T3 stop=opposite side, target 2R", run(S, "opp", 2.0)),
             ("T4 T1 + trending mood (ER10>=median)", run(S, "opp", mask=(er10 >= er_med).values)),
             ("T5 T1 + high vol (ATR5/ATR100>=1)", run(S, "opp", mask=(atr5 / atr100 >= 1).values))]
    for name, T in tests:
        for cost in (1.5, 3.0):
            txt, _ = e.stats(T, cost, name); out.append(txt)
        out.append("exits: " + T.why.value_counts().to_dict().__repr__())
    print("\n".join(out)); open("out_s2.txt", "w").write("\n".join(out))
