"""Asia-breakout continuation family. Variants declared BEFORE running (A1 is the baseline from 05_ideas.py):
A1a  same entry/stop as A1, no target: hold to the 16:00 NY forced close (captures 'day closes beyond the broken side').
A1b  same as A1, target 1R (higher win rate -> shorter losing runs?).
A1c  same as A1, but signals only 07:00-12:00 LONDON (the London session that does the breaking; NY-hour breaks skipped).
"""
import io, contextlib
from sim import *


def asia_break(name, target_r=2.0, sig_end_ldn=None):
    out = []
    for t, r in TRADE_DAYS.iterrows():
        d = G[t]; nm = d["nymin"]
        mask = d["ldn_today"] & (d["ldnmin"] >= 420) & ~(nm >= 720)
        if sig_end_ldn: mask &= d["ldnmin"] < sig_end_ldn
        idx = np.where(mask)[0]
        if not len(idx): continue
        key = d["ldnmin"][idx] // 15
        for k in np.unique(key):
            ii = idx[key == k]; i = ii[-1]; c = d["c"][i]
            side = 1 if c > r.ah else -1 if c < r.al else 0
            if side == 0: continue
            mid = (r.ah + r.al) / 2; risk = abs(c - mid)
            tgt = c + side * target_r * risk if target_r else None
            g, why = walk(d, i + 1, side, c, mid, tgt)
            out.append(dict(tday=t, side=side, risk=risk, gross=g, why=why, hour=int(nm[i] // 60) if nm[i] >= 0 else -1,
                            xr=risk / r.atr14)); break
    return report(name, pd.DataFrame(out))


if __name__ == "__main__":
    T = asia_break("A1 baseline (2R)")
    T["r"] = (T.gross - COST) / T.risk
    print("   A1 by quarter:", T.groupby(pd.to_datetime(T.tday).dt.to_period("Q")).r.sum().round(1).to_dict())
    print("   A1 by signal NY hour:", T.groupby(["hour", "year"]).r.sum().round(1).to_dict())
    print("   A1 risk in x ATR: median", round(T.xr.median(), 3))
    asia_break("A1a no target, hold to 16:00 NY", target_r=None)
    asia_break("A1b target 1R", target_r=1.0)
    asia_break("A1c London-only signals 07:00-12:00 London", sig_end_ldn=720)
