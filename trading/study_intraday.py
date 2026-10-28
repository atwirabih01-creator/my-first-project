"""History study: which setups on 1m / 5m / 30m / 1h charts win 70%+ of the time AND make a profit after fees?

Rules written BEFORE any result was seen (27 Oct 2026, owner goal: 70% wins, $1.20+ per $1 lost, drop <= 10%):
  Coins: the 40 scanner coins (16 meme coins + 24 big coins, universe.py).
  Periods: design = before 2026-01-01 (5m/30m/1h: 2024-2025; 1m: 2025), split into
           TRAIN (first ~2/3) and VALIDATE (last ~1/3). Sealed EXAM = Jan-Sep 2026, looked at once.
  Signal on a finished bar, entry at the NEXT bar's open (no peeking). Stop is checked before target
  inside a bar (pessimistic). One open trade per coin per setup.
  Costs - "futures": Binance USDT-M futures standard fees: market entry 0.05% + 0.01% slippage,
           target exit by limit order 0.02%, stop/time exit 0.05% + 0.02% slippage.
          - "spot": 0.15% per side (the old conservative desk cost), reported for comparison.
  Targets must be at least 0.30% of price (so fees never eat the win). A win = more than +0.10% after fees.
  Selection ("take only the highest-probability setups"): a model trained on TRAIN signals scores every
  signal; the cut-off is chosen on VALIDATE; the chosen setup + model is then run ONCE on the EXAM.

  python3 study_intraday.py design 5m      # grid on design data -> results/intraday_<tf>_design.json
"""
import itertools, json, sys, warnings
from pathlib import Path
import numpy as np
import pandas as pd
from numba import njit
from universe import MEMES, MAJORS

warnings.filterwarnings("ignore")
HERE = Path(__file__).parent
DATA = HERE / "data_intraday"
OUT = HERE / "results"
EXAM_START = pd.Timestamp("2026-01-01", tz="UTC")
VAL_START = {"1m": pd.Timestamp("2025-09-01", tz="UTC")}
VAL_DEFAULT = pd.Timestamp("2025-05-01", tz="UTC")
MIN_TARGET = 0.003
WIN_MIN = 0.001
COSTS = {"futures": dict(entry=0.0006, tgt=0.0002, stop=0.0007), "spot": dict(entry=0.0015, tgt=0.0015, stop=0.0015),
         # added 28 Oct 2026 (owner: "lower the fees"); base-tier published rates + the same slippage as above
         "hyperliquid": dict(entry=0.00055, tgt=0.00015, stop=0.00065),   # taker 0.045%, maker 0.015%
         "mexc": dict(entry=0.0003, tgt=0.0, stop=0.0004)}                 # app/web: taker 0.02%, maker 0%
import os
LIVE_COST = os.environ.get("DESK_COSTS", "futures")                       # cost set used by select/walkforward


def load(sym, tf):
    if tf == "1m":
        p = DATA / f"{sym}_1m.pkl"
        return pd.read_pickle(p) if p.exists() else None
    p = DATA / f"{sym}_5m.pkl"
    if not p.exists():
        return None
    df = pd.read_pickle(p)
    if tf == "5m":
        return df
    rule = {"30m": "30min", "1h": "1h"}[tf]
    return df.resample(rule).agg({"open": "first", "high": "max", "low": "min", "close": "last",
                                  "quote_volume": "sum", "taker_buy_quote": "sum"}).dropna()


def rsi(c, n):
    d = c.diff()
    up, dn = d.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean(), (-d.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    return 100 - 100 / (1 + up / dn.replace(0, np.nan))


def features(df, btc):
    c, h, l = df.close, df.high, df.low
    tr = pd.concat([h - l, (h - c.shift()).abs(), (l - c.shift()).abs()], axis=1).max(axis=1)
    f = pd.DataFrame(index=df.index)
    f["atr"] = tr.rolling(14).mean()
    e20, e50 = c.ewm(span=20, adjust=False).mean(), c.ewm(span=50, adjust=False).mean()
    e240, e600 = c.ewm(span=240, adjust=False).mean(), c.ewm(span=600, adjust=False).mean()
    f["e20"], f["e50"] = e20, e50
    f["z"] = (c - e20) / f.atr
    f["z50"] = (c - e50) / f.atr
    f["rsi14"], f["rsi3"] = rsi(c, 14), rsi(c, 3)
    f["trend"] = np.sign(e240 - e600)
    f["slope"] = (e240 / e240.shift(12) - 1) / (f.atr / c)
    f["atr_pct"] = f.atr / c
    f["atr_rel"] = f.atr_pct / f.atr_pct.rolling(2000, min_periods=200).median()
    f["vol_z"] = df.quote_volume / df.quote_volume.rolling(96, min_periods=24).mean()
    f["buy_share"] = df.taker_buy_quote.rolling(12).sum() / df.quote_volume.rolling(12).sum()
    for k in (1, 3, 12, 48):
        f[f"ret{k}"] = c / c.shift(k) - 1
    f["hi48"] = h.rolling(48).max().shift(1)
    f["lo48"] = l.rolling(48).min().shift(1)
    f["dist_hi"] = (f.hi48 - c) / f.atr
    f["dist_lo"] = (c - f.lo48) / f.atr
    f["hour"] = df.index.hour
    b = btc.reindex(df.index, method="ffill")
    f["btc_trend"], f["btc_ret12"], f["btc_z"] = b.trend, b.ret12, b.z
    return f


def btc_context(tf):
    df = load("BTCUSDT", tf)
    c = df.close
    tr = pd.concat([df.high - df.low, (df.high - c.shift()).abs(), (df.low - c.shift()).abs()], axis=1).max(axis=1)
    atr = tr.rolling(14).mean()
    return pd.DataFrame({"trend": np.sign(c.ewm(span=240, adjust=False).mean() - c.ewm(span=600, adjust=False).mean()),
                         "ret12": c / c.shift(12) - 1, "z": (c - c.ewm(span=20, adjust=False).mean()) / atr})


# ---- setup families: each returns +1 (long), -1 (short), 0 for every bar -------------------------------
def signals(df, f, family, p):
    c, l, h = df.close, df.low, df.high
    s = pd.Series(0, index=df.index)
    if family == "revert":                      # sharp stretch away from the 20-bar average snaps back
        k, flt = p
        lo, hi = f.z <= -k, f.z >= k
        if flt == "with":                         # only buy dips in an uptrend / sell rips in a downtrend
            lo, hi = lo & (f.trend > 0), hi & (f.trend < 0)
        s[lo], s[hi] = 1, -1
    elif family == "pullback":                  # trend continues after a calm pullback to the 20-bar average
        (rsi_band,) = p
        up = (f.trend > 0) & (f.slope > 0) & (l <= f.e20) & (c > f.e50) & f.rsi14.between(*rsi_band)
        dn = (f.trend < 0) & (f.slope < 0) & (h >= f.e20) & (c < f.e50) & f.rsi14.between(100 - rsi_band[1], 100 - rsi_band[0])
        s[up], s[dn] = 1, -1
    elif family == "breakout":                  # break of the 48-bar high/low on a volume surge, with the trend
        (vz,) = p
        up = (c > f.hi48) & (f.vol_z > vz) & (f.trend > 0)
        dn = (c < f.lo48) & (f.vol_z > vz) & (f.trend < 0)
        s[up], s[dn] = 1, -1
    elif family == "rsi3":                      # very short-term oversold inside an uptrend (and mirror)
        (lvl,) = p
        s[(f.rsi3 < lvl) & (f.trend > 0)] = 1
        s[(f.rsi3 > 100 - lvl) & (f.trend < 0)] = -1
    s[(f.atr.isna()) | (f.trend == 0)] = 0
    return s.values.astype(np.int8)


FAMILIES = [("revert", (k, flt)) for k in (2.0, 3.0) for flt in ("none", "with")] + \
           [("pullback", ((35, 50),)), ("pullback", ((40, 55),))] + \
           [("breakout", (vz,)) for vz in (2.0, 3.0)] + [("rsi3", (lvl,)) for lvl in (5, 10)]
EXITS = list(itertools.product([0.5, 0.75, 1.0], [1.0, 1.5, 2.0], [12, 36]))      # target ATR, stop ATR, hold bars


@njit(cache=True)
def simulate(o, h, l, c, sig, atr, T, S, H, min_tgt, ce, ct, cs):
    n = len(o)
    out_i = np.empty(n, np.int64); out_j = np.empty(n, np.int64); out_p = np.empty(n); out_g = np.empty(n)
    k, busy = 0, -1
    for i in range(n - 1):
        d = sig[i]
        if d == 0 or i < busy or atr[i] != atr[i]:
            continue
        e = o[i + 1]
        if T * atr[i] / e < min_tgt:
            continue
        tgt, stp = e + d * T * atr[i], e - d * S * atr[i]
        jend = min(i + H, n - 1)
        ex, cost, j = c[jend], cs, jend
        for jj in range(i + 1, jend + 1):
            if (d > 0 and l[jj] <= stp) or (d < 0 and h[jj] >= stp):
                ex = stp
                if jj > i + 1 and ((d > 0 and o[jj] < stp) or (d < 0 and o[jj] > stp)):
                    ex = o[jj]
                cost, j = cs, jj
                break
            if (d > 0 and h[jj] >= tgt) or (d < 0 and l[jj] <= tgt):
                ex, cost, j = tgt, ct, jj
                break
        g = d * (ex / e - 1)
        out_i[k], out_j[k], out_g[k], out_p[k] = i, j, g, g - ce - cost
        k += 1
        busy = j + 1
    return out_i[:k], out_j[:k], out_p[:k], out_g[:k]


def stats(p):
    if len(p) == 0:
        return {"trades": 0}
    lost = -p[p <= 0].sum()
    return {"trades": int(len(p)), "win_rate": round(float((p > WIN_MIN).mean()), 4),
            "pf": round(float(p[p > 0].sum() / lost), 3) if lost > 0 else 99.0,
            "avg_pct": round(float(100 * p.mean()), 4)}


def coin_frames(tf):
    btc = btc_context(tf)
    for sym in MEMES + MAJORS:
        df = load(sym, tf)
        if df is None or len(df) < 3000:
            continue
        yield sym, df, features(df, btc)


def design(tf):
    val0 = VAL_START.get(tf, VAL_DEFAULT)
    acc = {}                                         # (family, params, exit, cost) -> list of (period, pnl)
    for sym, df, f in coin_frames(tf):
        m = df.index < EXAM_START
        dfd, fd = df[m], f[m]
        o, h, l, c = (dfd[k].values for k in ("open", "high", "low", "close"))
        atr = fd.atr.values
        is_val = (dfd.index >= val0)
        for fam, p in FAMILIES:
            sig = signals(dfd, fd, fam, p)
            if not sig.any():
                continue
            for T, S, H in EXITS:
                for cname, cc in COSTS.items():
                    ii, jj, pnl, _ = simulate(o, h, l, c, sig, atr, T, S, H, MIN_TARGET, cc["entry"], cc["tgt"], cc["stop"])
                    key = (fam, str(p), T, S, H, cname)
                    a = acc.setdefault(key, {"train": [], "val": [], "meme_train": [], "meme_val": []})
                    v = is_val[ii]
                    a["train"].append(pnl[~v]); a["val"].append(pnl[v])
                    if sym in MEMES:
                        a["meme_train"].append(pnl[~v]); a["meme_val"].append(pnl[v])
        print(tf, sym, "done", flush=True)
    board = []
    for (fam, p, T, S, H, cname), a in acc.items():
        row = {"tf": tf, "family": fam, "params": p, "target_atr": T, "stop_atr": S, "hold_bars": H, "costs": cname}
        for part in ("train", "val", "meme_train", "meme_val"):
            row[part] = stats(np.concatenate(a[part]) if a[part] else np.array([]))
        board.append(row)
    json.dump(board, open(OUT / f"intraday_{tf}_design.json", "w"), indent=1)
    ok = [b for b in board if b["costs"] == "futures" and b["train"].get("trades", 0) >= 300]
    ok.sort(key=lambda b: (-(b["train"]["win_rate"] >= 0.7 and b["train"]["pf"] >= 1.2), -b["train"]["pf"]))
    for b in ok[:15]:
        print(b["family"], b["params"], b["target_atr"], b["stop_atr"], b["hold_bars"], "TRAIN", b["train"], "VAL", b["val"])


if __name__ == "__main__":
    if sys.argv[1] == "design":
        design(sys.argv[2])
