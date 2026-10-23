"""New strategy family: buy the bounce after a sudden crash (forced selling usually snaps back part-way).

Rules written BEFORE any result was seen (22 Oct 2026):
  Design period: Oct 2023 - Dec 2025.  Sealed exam: Jan 2026 - Oct 2026 (one look only).
  Pass (owner's goal): 100+ exam trades, 80%+ wins, profit after 0.30% costs, PF >= 1.2,
  biggest drop <= 10% (10% of the account per trade).

Signal (hourly bars, decided on a finished bar, entry at the next bar's open):
  - the last 4 hours fell more than M x the coin's normal 4-hour move (std over the past 30 days)
  - hourly volume at least 2x its 7-day average (it really was a flush, not a slow drift)
  - optional: the coin is still in a long-term uptrend (above its 200-bar 4-hour average)
Exit: target T x the hourly ATR above entry, stop S x ATR below, or after H hours.

  python3 crash_bounce.py design     # grid search on the design period
  python3 crash_bounce.py exam NAME  # the ONE sealed exam for the chosen settings
"""
import itertools, json, sys, warnings
from pathlib import Path
import numpy as np
import pandas as pd
import paper_lab as L, round3 as R
from agents import atr, ema

warnings.filterwarnings("ignore")
HERE = Path(__file__).parent
OUT = HERE / "results"
COST = 0.0015
SPLIT = pd.Timestamp("2026-01-01", tz="UTC")
FOLDERS = ["data", "data_fresh", "data_practice", "data_holdout_A", "data_holdout_B", "data_holdout_C"]
STABLE = {"EURUSDT", "PAXGUSDT"}


def load_all():
    d = {}
    for f in FOLDERS:
        d.update(R.load_dir(HERE / f))
    return {k: v for k, v in d.items() if k not in STABLE}


def signals(df, m, uptrend):
    c = df.close
    r4 = c.pct_change(4)
    sd = r4.rolling(24 * 30, min_periods=24 * 10).std()
    vz = df.quote_volume / df.quote_volume.rolling(24 * 7, min_periods=48).mean()
    sig = (r4 < -m * sd) & (vz > 2)
    if uptrend:
        sig &= c > ema(c, 800)                      # 200 four-hour bars ~ 800 hours
    a = atr(df, 24)
    return sig.fillna(False).values, a.values


def simulate(df, sig, a, t, s, h):
    o, hi, lo, cl = (df[k].values for k in ["open", "high", "low", "close"])
    idx, out, busy = np.flatnonzero(sig[:-1]), [], -1
    n = len(o)
    for i in idx:
        if i < busy or np.isnan(a[i]):
            continue
        e = o[i + 1]
        tgt, stop = e + t * a[i], e - s * a[i]
        exit_px, j_end = None, min(i + h, n - 1)
        for j in range(i + 1, j_end + 1):
            if lo[j] <= stop:
                exit_px = o[j] if (o[j] < stop and j > i + 1) else stop; break
            if j > i + 1 and hi[j] >= tgt:
                exit_px = tgt; break
        if exit_px is None:
            exit_px, j = cl[j_end], j_end
        out.append((df.index[i], df.index[j], exit_px / e - 1 - 2 * COST))
        busy = j + 1                                 # one open trade per coin
    return out


def run(d, params, period):
    m, up, t, s, h = params
    rows = []
    for sym, df in d.items():
        sig, a = signals(df, m, up)
        for opened, closed, pnl in simulate(df, sig, a, t, s, h):
            if (period == "design" and opened < SPLIT) or (period == "exam" and opened >= SPLIT):
                rows.append((sym, opened, closed, pnl))
    t_ = pd.DataFrame(rows, columns=["symbol", "time", "exit_time", "pnl"]).sort_values("exit_time")
    return t_


def score(t):
    if not len(t):
        return {"trades": 0}
    r = t.pnl.values
    eq = np.cumprod(1 + 0.10 * r)
    dd = float((1 - eq / np.maximum.accumulate(eq)).max() * 100)
    w, l = r[r > 0.001], r[r <= 0.001]
    pf = float(r[r > 0].sum() / -r[r <= 0].sum()) if (r <= 0).any() else 99.0
    months = t.assign(m=t.exit_time.dt.to_period("M")).groupby("m").pnl.sum()
    return {"trades": len(r), "win_rate": round(len(w) / len(r), 4), "profit_factor": round(pf, 3),
            "return_pct": round(100 * (eq[-1] - 1), 2), "max_drawdown_pct": round(dd, 2),
            "avg_win_pct": round(100 * w.mean(), 2) if len(w) else 0, "avg_loss_pct": round(100 * l.mean(), 2) if len(l) else 0,
            "profitable_months": f"{int((months > 0).sum())}/{len(months)}"}


GRID = list(itertools.product([3, 4, 5], [False, True], [1.0, 1.5, 2.0], [3, 5, 8], [6, 12, 24]))


def name(p):
    return f"CB m{p[0]} up{int(p[1])} t{p[2]} s{p[3]} h{p[4]}"


if __name__ == "__main__":
    mode = sys.argv[1]
    d = load_all()
    if mode == "design":
        board = []
        for p in GRID:
            sc = score(run(d, p, "design")); sc["name"] = name(p); board.append(sc)
        board.sort(key=lambda x: (-(x.get("win_rate", 0) >= 0.8 and x.get("profit_factor", 0) >= 1.2), -x.get("profit_factor", 0)))
        json.dump(board, open(OUT / "crash_bounce_design.json", "w"), indent=1)
        for b in board[:25]:
            print(b)
    else:
        p = [g for g in GRID if name(g) == " ".join(sys.argv[2:])][0]
        t = run(d, p, "exam")
        sc = score(t); sc["name"] = name(p)
        sc["passed"] = bool(sc["trades"] >= 100 and sc["win_rate"] >= 0.8 and sc["profit_factor"] >= 1.2
                            and sc["return_pct"] > 0 and sc["max_drawdown_pct"] <= 10)
        t.to_csv(OUT / "crash_bounce_exam_trades.csv", index=False)
        json.dump(sc, open(OUT / "crash_bounce_exam.json", "w"), indent=1)
        print(sc)
