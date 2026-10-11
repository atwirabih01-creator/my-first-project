"""ORB study (Agent 1, 11 Oct 2026): shared loader + one-trade-per-day ORB simulator.

Design data ONLY: trading/data/<SYM>_M1.csv.gz (Jan 2019 - Sep 2026). Never reads trading/data/hidden/.
No clock fix (files are UTC). Day x minute matrix: row = trading day (17:00 NY -> 17:00 NY),
column = minutes since 17:00 NY (0..1439). NY 09:30 = column 990, the 15:59 NY bar = column 1379.
"""
import os, pickle
import numpy as np, pandas as pd, warnings
warnings.filterwarnings("ignore", category=RuntimeWarning)

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.abspath(os.path.join(HERE, "..", "..", "data"))
CACHE = os.environ.get("ORB_CACHE", "/tmp/claude-0/-home-user-my-first-project/1c8d33d7-d94d-5131-95fb-13a566ad2900/scratchpad/orbcache")

MARKETS = {  # symbol: (standard cost in price units, name)
    "GBPUSD": (0.00015, "GBPUSD"),
    "XAUUSD": (0.40, "Gold"),
    "NSXUSD": (2.0, "Nasdaq 100"),
    "EURUSD": (0.00012, "EURUSD"),
}
CLOSE_COL = 1379          # 15:59 NY bar; exit at its close
LAST_ENTRY_COL = 1320     # 15:00 NY


def load(sym):
    os.makedirs(CACHE, exist_ok=True)
    cp = os.path.join(CACHE, f"{sym}_orb.pkl")
    if os.path.exists(cp):
        return pickle.load(open(cp, "rb"))
    path = os.path.join(DATA, f"{sym}_M1.csv.gz")
    assert "hidden" not in path
    df = pd.read_csv(path, parse_dates=["time_utc"])
    assert df.time_utc.min() >= pd.Timestamp("2019-01-01")
    ny = df.time_utc.dt.tz_localize("UTC").dt.tz_convert("America/New_York").dt.tz_localize(None)
    shifted = ny + pd.Timedelta(hours=7)          # 17:00 NY -> 00:00 of the trading day
    tday = shifted.dt.normalize()
    wd = tday.dt.dayofweek
    keep = wd < 5                                  # drop weekend scraps (Fri after 17:00 NY / Sat)
    df, shifted, tday = df[keep], shifted[keep], tday[keep]
    col = ((shifted - tday).dt.total_seconds() // 60).astype(int).values
    days = np.sort(tday.unique())
    di = np.searchsorted(days, tday.values)
    nd = len(days)
    O = np.full((nd, 1440), np.nan); H = O.copy(); L = O.copy(); C = O.copy()
    O[di, col] = df.open.values; H[di, col] = df.high.values; L[di, col] = df.low.values; C[di, col] = df.close.values
    days = pd.DatetimeIndex(days)
    t = (days + pd.Timedelta(hours=12)).tz_localize("UTC")
    ldn_off = ((t.tz_convert("Europe/London").tz_localize(None) - t.tz_convert("America/New_York").tz_localize(None))
               .total_seconds() / 3600).round().astype(int).values
    ny_utc = ((t.tz_convert("America/New_York").tz_localize(None) - t.tz_localize(None)).total_seconds() / 3600).round().astype(int).values
    # daily range 18:00-15:59 NY, ATR14 of previous 14 days, previous day's 15:59 close
    with np.errstate(all="ignore"):
        dr = np.nanmax(H[:, 60:1380], 1) - np.nanmin(L[:, 60:1380], 1)
    atr = pd.Series(dr).shift(1).rolling(14, min_periods=10).mean().values
    lastc = np.full(nd, np.nan)
    for i in range(nd):
        v = np.flatnonzero(~np.isnan(C[i, :1380]))
        if len(v) and v[-1] >= 1300:
            lastc[i] = C[i, v[-1]]
    prevc = np.r_[np.nan, lastc[:-1]]
    prev2c = np.r_[np.nan, np.nan, lastc[:-2]]
    res = dict(sym=sym, days=days, O=O, H=H, L=L, C=C, ldn_off=ldn_off, ny_utc=ny_utc, atr=atr,
               prevc=prevc, prev2c=prev2c)
    pickle.dump(res, open(cp, "wb"), protocol=4)
    return res


def open_col(M, which):
    """per-day column of the session open"""
    n = len(M["days"])
    if which == "TKY":   # 09:00 Tokyo = 00:00 UTC
        return (7 + M["ny_utc"]) * 60
    if which in ("FRA", "LDN"):
        h = 7 if which == "FRA" else 8
        return ((h - M["ldn_off"] - 17) % 24) * 60
    if which == "NY8":
        return np.full(n, 15 * 60)
    if which == "NY930":
        return np.full(n, 16 * 60 + 30)
    raise ValueError(which)


OPEN_TIMES = {"TKY": "09:00 Tokyo (00:00 UTC)", "FRA": "07:00 London (08:00 Frankfurt)", "LDN": "08:00 London",
              "NY8": "08:00 New York", "NY930": "09:30 New York"}


def longest_hole(valid):
    idx = np.flatnonzero(valid)
    if len(idx) == 0:
        return 10 ** 6
    g = np.diff(np.r_[-1, idx, len(valid)]) - 1
    return g.max()


def gap_ok_days(M, a):
    """per day: no hole > 15 min from range start column a[i] to 15:59 NY"""
    C = M["C"]
    out = np.zeros(len(C), bool)
    for i in range(len(C)):
        out[i] = longest_hole(~np.isnan(C[i, a[i]:CLOSE_COL + 1])) <= 15
    return out


def run(M, cost, opn, length, target=None, entry="stop", stopm="opp", filt=None, hold_h=4, min_mult=10.0):
    """Simulate. target: None (hold to 15:59 NY) or R multiple. entry: stop|close5|dir. stopm: opp|mid|atr10.
    filt: None|narrow|wide|trend|gap|atrsmall|atrbig. Returns (trades DataFrame, skip counts)."""
    O, H, L, C = M["O"], M["H"], M["L"], M["C"]
    a_all = open_col(M, opn)
    key = (opn,)
    M.setdefault("_gap", {})
    if key not in M["_gap"]:
        M["_gap"][key] = gap_ok_days(M, a_all)
    ok = M["_gap"][key]
    nd = len(O)
    rows = []
    skips = dict(gappy=0, small=0, filter=0, nofill=0, other=0)
    # range sizes history (for narrow/wide)
    rngs = np.full(nd, np.nan)
    for i in range(nd):
        a = a_all[i]; b = a + length
        if ok[i]:
            with np.errstate(all="ignore"):
                rngs[i] = np.nanmax(H[i, a:b]) - np.nanmin(L[i, a:b])
    med20 = pd.Series(rngs).shift(1).rolling(20, min_periods=15).median().values
    for i in range(nd):
        if not ok[i]:
            skips["gappy"] += 1
            continue
        a = a_all[i]; b = a + length
        w = min(a + hold_h * 60, LAST_ENTRY_COL)
        RH = np.nanmax(H[i, a:b]); RL = np.nanmin(L[i, a:b]); rng = RH - RL
        atr = M["atr"][i]
        if not np.isfinite(rng) or rng <= 0:
            skips["other"] += 1; continue
        # planned risk
        if stopm == "opp":
            prisk = rng
        elif stopm == "mid":
            prisk = rng / 2
        else:
            if not np.isfinite(atr):
                skips["other"] += 1; continue
            prisk = 0.10 * atr
        if prisk < min_mult * cost:
            skips["small"] += 1; continue
        allow = (1, -1)
        if filt is not None:
            m = med20[i]; f_ok = True
            if filt == "narrow": f_ok = np.isfinite(m) and rng <= m
            elif filt == "wide": f_ok = np.isfinite(m) and rng > m
            elif filt == "trend":
                pc, p2 = M["prevc"][i], M["prev2c"][i]
                f_ok = np.isfinite(pc) and np.isfinite(p2) and pc != p2
                if f_ok: allow = (1,) if pc > p2 else (-1,)
            elif filt == "gap":
                pc = M["prevc"][i]
                f_ok = np.isfinite(pc) and np.isfinite(atr) and abs(O[i, a] - pc) <= 0.5 * atr if np.isfinite(O[i, a]) else False
            elif filt == "atrsmall": f_ok = np.isfinite(atr) and rng >= 0.10 * atr
            elif filt == "atrbig": f_ok = np.isfinite(atr) and rng <= 0.40 * atr
            if not f_ok:
                skips["filter"] += 1; continue
        # ---- entry
        side = 0; ecol = None; epx = None; ambig = False
        if entry == "stop":
            up = H[i, b:w] > RH if 1 in allow else np.zeros(w - b, bool)
            dn = L[i, b:w] < RL if -1 in allow else np.zeros(w - b, bool)
            ku = np.argmax(up) if up.any() else 10 ** 6
            kd = np.argmax(dn) if dn.any() else 10 ** 6
            if ku == kd == 10 ** 6:
                skips["nofill"] += 1; continue
            if ku == kd:
                ambig = True; side = 1; ecol = b + ku; epx = RH
            elif ku < kd:
                side = 1; ecol = b + ku; o = O[i, ecol]; epx = max(RH, o) if np.isfinite(o) else RH
            else:
                side = -1; ecol = b + kd; o = O[i, ecol]; epx = min(RL, o) if np.isfinite(o) else RL
            walk_from = ecol  # entry bar checked for stop
        elif entry == "close5":
            found = False
            for s in range(b, w - 4, 5):
                seg = C[i, s:s + 5]
                v = np.flatnonzero(~np.isnan(seg))
                if not len(v): continue
                cl = seg[v[-1]]
                if cl > RH and 1 in allow:
                    side = 1; found = True
                elif cl < RL and -1 in allow:
                    side = -1; found = True
                if found:
                    ecol = s + 4; epx = cl; break
            if not found:
                skips["nofill"] += 1; continue
            walk_from = ecol + 1
        elif entry == "dir":
            v = np.flatnonzero(~np.isnan(C[i, a:b]))
            o0 = O[i, a]; c0 = C[i, a + v[-1]]
            if not np.isfinite(o0) or c0 == o0:
                skips["nofill"] += 1; continue
            side = 1 if c0 > o0 else -1
            if side not in allow:
                skips["filter"] += 1; continue
            ecol = b - 1; epx = c0; walk_from = b
        # ---- stop / target
        if stopm == "opp":
            stop = RL if side > 0 else RH
        elif stopm == "mid":
            stop = (RH + RL) / 2
        else:
            stop = epx - side * 0.10 * atr
        risk = side * (epx - stop)
        if risk <= 0:
            skips["other"] += 1; continue
        tgt = epx + side * target * risk if target else None
        if ambig:
            xcol, xpx, why = ecol, stop, "ambig"
        else:
            hs = H[i, walk_from:CLOSE_COL + 1]; ls = L[i, walk_from:CLOSE_COL + 1]
            hitS = (ls <= stop) if side > 0 else (hs >= stop)
            js = np.argmax(hitS) if hitS.any() else 10 ** 6
            jt = 10 ** 6
            if tgt is not None:
                st = 1 if walk_from == ecol else 0  # target only after the entry bar
                hitT = (hs[st:] >= tgt) if side > 0 else (ls[st:] <= tgt)
                if hitT.any(): jt = np.argmax(hitT) + st
            if js <= jt and js < 10 ** 6:
                xcol = walk_from + js; o = O[i, xcol]
                xpx = stop
                if xcol > ecol and np.isfinite(o):
                    xpx = min(stop, o) if side > 0 else max(stop, o)
                why = "stop"
            elif jt < 10 ** 6:
                xcol = walk_from + jt; xpx = tgt; why = "target"
            else:
                v = np.flatnonzero(~np.isnan(C[i, :CLOSE_COL + 1]))
                xcol = v[-1]; xpx = C[i, xcol]; why = "close"
        gross = side * (xpx - epx)
        rows.append((M["days"][i], side, ecol, epx, stop, tgt if tgt is not None else np.nan, xcol, xpx, why,
                     risk, rng, gross / risk, (gross - cost) / risk, (gross - 2 * cost) / risk))
    T = pd.DataFrame(rows, columns=["day", "side", "ecol", "entry", "stop", "target", "xcol", "exit", "reason",
                                    "risk", "range", "R0", "R", "R2"])
    T["year"] = T.day.dt.year
    return T, skips


YEARS = list(range(2019, 2027))


def longest_losing_run(r):
    run = best = 0
    for x in r:
        run = run + 1 if x <= 0 else 0
        best = max(best, run)
    return best


def summary(T):
    """dict of headline metrics (standard cost unless stated)"""
    d = {}
    if len(T) == 0:
        return dict(n=0)
    yr = T.groupby("year").R.sum().reindex(YEARS, fill_value=0.0)
    d["n"] = len(T); d["per_year"] = len(T) / 7.75
    d["win"] = (T.R > 0).mean()
    d["R0"] = T.R0.sum(); d["R"] = T.R.sum(); d["R2"] = T.R2.sum()
    d["perTr"] = T.R.mean()
    d["posY"] = int((yr > 0).sum()); d["worstY"] = yr.min()
    d["long"] = T[T.side > 0].R.sum(); d["short"] = T[T.side < 0].R.sum()
    d["nlong"] = int((T.side > 0).sum()); d["nshort"] = int((T.side < 0).sum())
    d["lrun"] = longest_losing_run(T.R.values)
    d["noBest5"] = T.R.sort_values().iloc[:-5].sum() if len(T) > 5 else np.nan
    eq = T.R.cumsum().values
    d["maxDD"] = (eq - np.maximum.accumulate(np.r_[0, eq])[1:]).min()
    for y in YEARS:
        d[f"y{y}"] = yr[y]
    cnt = T.groupby("year").size().reindex(YEARS, fill_value=0)
    d["minTrY"] = cnt.min()
    # per-year trade count for the bar: full years 2019-2025 except 2023 (data holes); 2026 (Jan-Sep) scaled to 12 months
    d["minTrFull"] = min(min(cnt[y] for y in (2019, 2020, 2021, 2022, 2024, 2025)), cnt[2026] * 12 / 9)
    for y in YEARS:
        d[f"n{y}"] = cnt[y]
    return d


def bar_check(d):
    miss = []
    if d.get("n", 0) == 0:
        return ["no trades"]
    if d["posY"] < 6: miss.append(f"positive years {d['posY']}/8")
    if d["worstY"] < -8: miss.append(f"worst year {d['worstY']:+.1f}R")
    if d["R2"] <= 0: miss.append(f"double cost {d['R2']:+.1f}R")
    if d["long"] <= 0: miss.append(f"longs {d['long']:+.1f}R")
    if d["short"] <= 0: miss.append(f"shorts {d['short']:+.1f}R")
    if d["lrun"] > 8: miss.append(f"losing run {d['lrun']}")
    if d["perTr"] < 0.08: miss.append(f"R/trade {d['perTr']:+.3f}")
    if d["noBest5"] <= 0: miss.append(f"w/o best 5 {d['noBest5']:+.1f}R")
    if d["minTrFull"] < 40: miss.append(f"fewest trades in a year {d['minTrFull']:.0f} (avg {d['per_year']:.0f})")
    return miss


def year_table(T):
    rows = []
    for y in YEARS:
        g = T[T.year == y]
        rows.append(dict(year=y, n=len(g), win=f"{(g.R > 0).mean() * 100:.0f}%" if len(g) else "-",
                         R0=round(g.R0.sum(), 1), R=round(g.R.sum(), 1), R2=round(g.R2.sum(), 1),
                         long=round(g[g.side > 0].R.sum(), 1), short=round(g[g.side < 0].R.sum(), 1),
                         lrun=longest_losing_run(g.R.values)))
    return pd.DataFrame(rows).to_string(index=False)
