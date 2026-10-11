"""Backtest of the pre-declared VWAP(AP) + EMA variants (see ../TESTS_DECLARED.md).
Usage: python3 02_backtest.py MARKET [variant-id ...]   -> outputs/summary_<MARKET>.csv, outputs/trades/<variant>.csv"""
import sys, os, numpy as np, pandas as pd
from vwlib import *

SESSIONS = {"NY0930": (("NY", 570), ("NY", 600, 870)),
            "LON0800": (("LON", 480), ("LON", 510, 720)),
            "NY0800": (("NY", 480), ("NY", 510, 720)),
            "LONNY": (("LON", 480), ("MIX", 510, 720))}
MKT_SESS = {"NASDAQ": ["NY0930"], "XAUUSD": ["LON0800", "NY0800"], "GBPUSD": ["LON0800", "NY0800"], "EURUSD": ["LON0800", "NY0800"]}
VARIANTS = {  # id: (structure, bar minutes, fast, slow, target)
    "P5": ("P", 5, 9, 21, 2.0), "P15": ("P", 15, 20, 50, 2.0), "P15E": ("P", 15, 20, 50, None),
    "R5": ("R", 5, 9, 21, 2.0), "R15": ("R", 15, 20, 50, 2.0),
    "M5": ("M", 5, 9, 21, "AP"), "M15": ("M", 15, 20, 50, "AP"),
    # round 2
    "R15E": ("R", 15, 20, 50, None), "R30": ("R", 30, 20, 50, 2.0), "P15E1": ("P", 15, 20, 50, None, 1),
    "P30E": ("P", 30, 20, 50, None), "M30": ("M", 30, 20, 50, "AP")}
CLOSE_M = 15 * 60 + 55          # forced close: close of the minute starting 15:54 NY
MINSTOP, MAXSTOP, FLAT, BANDK, REWMIN = 1.0, 4.0, 0.25, 2.0, 1.0

def signals(b, struct, fast, slow, win):
    """Return DataFrame of candidate signals: bar index, dir, stop, target-kind."""
    ef, es = ema(b.close, fast), ema(b.close, slow); a = atr(b)
    o, h, l, c, ap, sd = (b[k].values for k in ["open", "high", "low", "close", "ap", "sd"])
    day = b.day.values; same1 = np.r_[False, day[1:] == day[:-1]]
    tz, w0, w1 = win
    if tz == "MIX": inwin = (b.endlonm.values >= w0) & (b.endnym.values <= w1)
    else:
        tend = (b.endlonm if tz == "LON" else b.endnym).values
        inwin = (tend >= w0) & (tend <= w1)
    inwin = inwin & ~np.isnan(ap) & (b.endnym.values <= CLOSE_M)
    sh = lambda x, k=1: np.r_[np.full(k, np.nan), x[:-k]]
    out = []
    if struct == "P":
        L = (ef > es) & (sh(ef) > sh(es)) & (c > ap) & (c > ef) & (sh(l) <= sh(ef)) & (c > sh(h)) & same1
        S = (ef < es) & (sh(ef) < sh(es)) & (c < ap) & (c < ef) & (sh(h) >= sh(ef)) & (c < sh(l)) & same1
        stopL, stopS = np.minimum(l, sh(l)), np.maximum(h, sh(h))
    elif struct == "R":
        same3 = same1 & sh(same1.astype(float)).astype(bool) & sh(same1.astype(float), 2).astype(bool) & sh(same1.astype(float), 3).astype(bool)
        below = lambda k: sh(c, k) < sh(ap, k)
        above = lambda k: sh(c, k) > sh(ap, k)
        L = (c > ap) & (c > ef) & (ef > es) & below(1) & below(2) & below(3) & same3
        S = (c < ap) & (c < ef) & (ef < es) & above(1) & above(2) & above(3) & same3
        stopL = np.minimum.reduce([l, sh(l), sh(l, 2), sh(l, 3)]); stopS = np.maximum.reduce([h, sh(h), sh(h, 2), sh(h, 3)])
    else:
        same2 = same1 & sh(same1.astype(float)).astype(bool)
        flat = np.abs(ef - es) < FLAT * a
        L = flat & (sh(l) < sh(ap) - BANDK * sh(sd)) & (c > ap - BANDK * sd) & (c > o) & same2
        S = flat & (sh(h) > sh(ap) + BANDK * sh(sd)) & (c < ap + BANDK * sd) & (c < o) & same2
        stopL = np.minimum.reduce([l, sh(l), sh(l, 2)]); stopS = np.maximum.reduce([h, sh(h), sh(h, 2)])
    for d, M, st in ((1, L, stopL), (-1, S, stopS)):
        idx = np.where(M & inwin)[0]
        for i in idx:
            out.append((i, d, st[i], a[i], ap[i]))
    s = pd.DataFrame(out, columns=["i", "dir", "stop", "atr", "ap"]).sort_values("i")
    return s

def run(market, sess, vid, df=None, cache={}):
    df = load(market) if df is None else df
    anchor, win = SESSIONS[sess]
    struct, n, fast, slow, tgt, *mx = VARIANTS[vid]; maxtr = mx[0] if mx else 2
    key = (market, sess)
    if key not in cache:
        ap, sd = anchored_ap(df, anchor)
        cache[key] = (ap, sd, gappy_days(df, anchor[1], CLOSE_M, anchor[0]), {})
    ap, sd, bad, bcache = cache[key]
    if n not in bcache: bcache[n] = bars(df, n, ap, sd)
    b = bcache[n]
    sig = signals(b, struct, fast, slow, win)
    H, Lo, C, O = df.high.values, df.low.values, df.close.values, df.open.values
    nym, dayv = df.nym.values, df.day.values
    cost = COST[market]
    trades = []
    sig["day"] = b.day.values[sig.i.values]
    for d, g in sig.groupby("day", sort=True):
        if d in bad: continue
        free_from, ntr = -1, 0
        for r in g.itertuples():
            if ntr >= maxtr: break
            br = b.iloc[r.i]
            if br.lastrow < free_from: continue
            entry = br.close; risk = (entry - r.stop) * r.dir
            if risk > MAXSTOP * r.atr or not np.isfinite(risk): continue
            if risk < MINSTOP * r.atr: risk = MINSTOP * r.atr
            stop = entry - r.dir * risk
            if tgt == "AP":
                rew = (r.ap - entry) * r.dir
                if rew < REWMIN * risk: continue
                target = r.ap
            elif tgt is None: target = None
            else: target = entry + r.dir * tgt * risk
            s0 = br.lastrow + 1
            # last row of the day with NY start minute < 15:55
            e = s0
            while e < len(df) and dayv[e] == d and nym[e] < CLOSE_M: e += 1
            e -= 1
            if e < s0: continue
            hh, ll = H[s0:e + 1], Lo[s0:e + 1]
            if r.dir == 1:
                hs = np.where(ll <= stop)[0]; ht = np.where(hh >= target)[0] if target is not None else np.array([], int)
            else:
                hs = np.where(hh >= stop)[0]; ht = np.where(ll <= target)[0] if target is not None else np.array([], int)
            ks = hs[0] if len(hs) else 10**9; kt = ht[0] if len(ht) else 10**9
            if ks <= kt and ks < 10**9:
                k = s0 + ks; op = O[k]
                px = min(op, stop) if r.dir == 1 else max(op, stop); why = "stop"
            elif kt < 10**9:
                k = s0 + kt; px = target; why = "target"
            else:
                k = e; px = C[e]; why = "close"
            R = (px - entry) * r.dir / risk
            trades.append({"variant": f"{market}_{sess}_{vid}", "day": d, "dir": "long" if r.dir == 1 else "short",
                           "entry_row": s0, "exit_row": k, "entry": entry, "stop": stop, "target": target,
                           "exit": px, "why": why, "risk": risk, "R_gross": R, "R_net": R - cost / risk,
                           "R_net2": R - 2 * cost / risk})
            ntr += 1; free_from = k + 1
    t = pd.DataFrame(trades)
    if len(t):
        t["entry_ny"] = df.ny.values[t.entry_row]; t["exit_ny"] = df.ny.values[t.exit_row] + np.timedelta64(1, "m")
        t["entry_doha"] = df.doha.values[t.entry_row]; t["exit_doha"] = df.doha.values[t.exit_row] + np.timedelta64(1, "m")
        t["year"] = pd.to_datetime(t.day).dt.year
    return t, len([x for x in bad if x.dayofweek < 5])

def longest_lose(r):
    m = cur = 0
    for x in r:
        cur = cur + 1 if x < 0 else 0; m = max(m, cur)
    return m

def summarize(t, name, skipped):
    yrs = range(2019, 2027)
    s = {"variant": name, "skipped_days": skipped, "trades": len(t)}
    if not len(t): return s
    s.update({"win%": round((t.R_net > 0).mean() * 100, 1), "R_gross": t.R_gross.sum(), "R_net": t.R_net.sum(),
              "R_net2x": t.R_net2.sum(), "R/tr_net": t.R_net.mean(), "long_R": t[t.dir == "long"].R_net.sum(),
              "short_R": t[t.dir == "short"].R_net.sum(), "n_long": (t.dir == "long").sum(),
              "lose_run": longest_lose(t.R_net.values),
              "R_no_best5": t.R_net.sum() - t.R_net.nlargest(5).sum(), "trades/yr": len(t) / 7.75})
    py = t.groupby("year").R_net.sum()
    for y in yrs: s[str(y)] = py.get(y, 0.0)
    s["pos_years"] = int(sum(py.get(y, 0) > 0 for y in yrs)); s["worst_year"] = min(py.get(y, 0) for y in yrs)
    bars_ = [s["pos_years"] >= 6, s["worst_year"] >= -8, s["R_net2x"] > 0, s["long_R"] > 0 and s["short_R"] > 0,
             s["lose_run"] <= 8, s["R/tr_net"] >= 0.08, s["R_no_best5"] > 0, s["trades/yr"] >= 40]
    s["bar_pts"] = int(sum(bars_)); s["missed"] = ",".join(str(k + 1) for k, ok in enumerate(bars_) if not ok)
    return s

if __name__ == "__main__":
    market = sys.argv[1]; args = sys.argv[2:]
    os.makedirs("../outputs/trades", exist_ok=True)
    rows = []
    pairs = [a.split(":") for a in args] if args else [(s_, v) for s_ in MKT_SESS[market] for v in list(VARIANTS)[:7]]
    for sess, vid in pairs:
        if True:
            t, sk = run(market, sess, vid)
            name = f"{market}_{sess}_{vid}"
            if len(t): t.to_csv(f"../outputs/trades/{name}.csv", index=False)
            rows.append(summarize(t, name, sk)); print(name, len(t), flush=True)
    S = pd.DataFrame(rows)
    S.round(3).to_csv(f"../outputs/summary_{market}{'_round2' if args else ''}.csv", index=False)
    pd.set_option("display.width", 300); pd.set_option("display.max_columns", 40)
    print(S.round(2).to_string())
