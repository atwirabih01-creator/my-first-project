"""One row per trading day for NASDAQ research: RTH (09:30-16:00 NY) levels, overnight levels, data-quality flags."""
from common import *

# US stock-market holidays and 13:00 NY early closes inside the design period (NYSE/Nasdaq published calendars).
HOLIDAYS = ["2024-11-28", "2024-12-25", "2025-01-01", "2025-01-09", "2025-01-20", "2025-02-17", "2025-04-18",
            "2025-05-26", "2025-06-19", "2025-07-04", "2025-09-01", "2025-11-27", "2025-12-25", "2026-01-01",
            "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19"]
EARLY_CLOSE = ["2024-11-29", "2024-12-24", "2025-07-03", "2025-11-28", "2025-12-24"]
HOL = set(pd.to_datetime(HOLIDAYS)); EARLY = set(pd.to_datetime(EARLY_CLOSE))


def max_gap(mins, a, b):
    """largest gap (minutes) between bars inside NY minutes [a, b), incl. edges."""
    m = np.sort(mins[(mins >= a) & (mins < b)])
    if not len(m): return b - a
    pts = np.concatenate([[a - 1], m, [b]])
    return int(np.diff(pts).max() - 1)


def _at(vals, mins, m):
    i = np.where(mins == m)[0]
    return vals[i[0]] if len(i) else np.nan


def day_table(df):
    rows = []; prev = None
    for tday, g in df.groupby("tday"):
        nm = g.nymin.values; o, h, l, c = g.open.values, g.high.values, g.low.values, g.close.values
        r = dict(tday=tday, nbars=len(g))
        r["holiday"] = tday in HOL; r["early"] = tday in EARLY
        r["gap_rth"] = max_gap(nm, 570, 960)          # 09:30-16:00 NY
        r["gap_am"] = max_gap(nm, 540, 720)            # 09:00-12:00 NY
        rth = (nm >= 570) & (nm < 960)
        on = (nm < 570)                                # 18:00 NY prev evening -> 09:29 NY
        f930 = np.where((nm >= 570) & (nm < 575))[0]
        r["o930"] = o[f930[0]] if len(f930) else np.nan
        r["rth_hi"] = h[rth].max() if rth.any() else np.nan
        r["rth_lo"] = l[rth].min() if rth.any() else np.nan
        last = np.where(rth)[0]
        r["c1600"] = c[last[-1]] if len(last) else np.nan
        r["on_hi"] = h[on].max() if on.any() else np.nan
        r["on_lo"] = l[on].min() if on.any() else np.nan
        r["on_open"] = o[0]
        r["c929"] = c[np.where(on)[0][-1]] if on.any() else np.nan
        for m in [600, 630, 660, 720, 840, 900]:
            r[f"o{m}"] = _at(o, nm, m)
        r["day_hi"] = h.max(); r["day_lo"] = l.min()
        r["pdc"] = prev["c1600"] if prev is not None else np.nan
        r["pdh"] = prev["rth_hi"] if prev is not None else np.nan
        r["pdl"] = prev["rth_lo"] if prev is not None else np.nan
        r["prev_ok"] = (prev is not None and not prev["holiday"] and prev["gap_rth"] <= 15 and not prev["early"])
        rows.append(r); prev = r
    t = pd.DataFrame(rows).set_index("tday")
    t["ok"] = (~t.holiday) & (~t.early) & (t.gap_rth <= 15)
    t["rth_rng_pct"] = 100 * (t.rth_hi - t.rth_lo) / t.o930
    # ATR (in %) = mean RTH range % of the previous 14 good days, known before the day starts
    rr = t.rth_rng_pct.where(t.ok)
    t["atr_pct"] = rr.shift(1).rolling(20, min_periods=10).apply(lambda x: np.nanmean(x[-14:]) if np.isfinite(x[-14:]).sum() >= 10 else np.nan, raw=True)
    t["year"] = year_of(t.index)
    return t
