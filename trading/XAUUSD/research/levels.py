"""One row per trading day with the key levels and timings used by the studies (XAUUSD)."""
from common import *


def _price_at(vals, mins, m):
    i = np.where(mins == m)[0]
    return vals[i[0]] if len(i) else np.nan


def day_table(df):
    """df = output of load() (all days, incl. incomplete, so previous-day levels exist)."""
    rows = []
    prev = None
    for tday, g in df.groupby("tday"):
        L, N = g.ldn_min.values, g.ny_min.values
        today = g.ny_today.values
        hi, lo, op, cl = g.high.values, g.low.values, g.open.values, g.close.values
        r = dict(tday=tday, complete=bool(g.complete.iloc[0]), nbars=len(g))
        r["open"] = op[0]; r["close"] = cl[-1]
        r["hi"] = hi.max(); r["lo"] = lo.min()
        r["i_hi"] = int(hi.argmax()); r["i_lo"] = int(lo.argmin())
        r["t_hi"] = g.ny.iloc[r["i_hi"]]; r["t_lo"] = g.ny.iloc[r["i_lo"]]
        asia = g.ldn_today.values & (L < 420)            # 00:00-07:00 London
        r["ah"] = hi[asia].max() if asia.any() else np.nan
        r["al"] = lo[asia].min() if asia.any() else np.nan
        pre = ~today | (N < 480)                          # day open (18:00 NY) -> 08:00 NY
        r["oh"] = hi[pre].max(); r["ol"] = lo[pre].min()
        r["ldn_open"] = _price_at(op, np.where(g.ldn_today.values, L, -1), 480)
        for m, k in [(480, "ny0800"), (510, "ny0830"), (570, "ny0930"), (600, "ny1000"), (660, "ny1100"), (720, "ny1200")]:
            r[k] = _price_at(op, np.where(today, N, -1), m)
        last_before_16 = np.where(today & (N < 960))[0]
        r["ny1600"] = cl[last_before_16[-1]] if len(last_before_16) else np.nan
        r["pdh"] = prev["hi"] if prev is not None else np.nan
        r["pdl"] = prev["lo"] if prev is not None else np.nan
        r["pdc"] = prev["close"] if prev is not None else np.nan
        r["prev_complete"] = bool(prev["complete"]) if prev is not None else False
        rows.append(r)
        prev = r
    t = pd.DataFrame(rows).set_index("tday")
    t["rng"] = t.hi - t.lo
    t["rng_pct"] = 100 * t.rng / t.open
    # ATR14 = average range of the previous 14 complete days (known before the day starts)
    rc = t.rng.where(t.complete)
    t["atr14"] = rc.shift(1).rolling(14, min_periods=10).mean()
    t["year"] = year_of(t.index)
    return t
