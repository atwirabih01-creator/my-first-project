"""Build one row per trading day with the key levels and timings used by the studies."""
from common import *


def day_table(df):
    """df = output of load() (all days, incl. incomplete, so previous-day levels exist)."""
    rows = []
    prev = None
    for tday, g in df.groupby("tday"):
        L, N = g.ldn_min.values, g.ny_min.values
        hi, lo = g.high.values, g.low.values
        r = dict(tday=tday, complete=bool(g.complete.iloc[0]))
        r["open"] = g.open.iloc[0]; r["close"] = g.close.iloc[-1]
        r["hi"] = hi.max(); r["lo"] = lo.min()
        r["t_hi"] = g.time_utc.iloc[hi.argmax()]; r["t_lo"] = g.time_utc.iloc[lo.argmin()]
        asia = (L >= 0) & (L < 420)
        # asia must not include the previous evening's 17:00+ NY bars when London is after midnight: tday starts 17:00 NY,
        # London midnight is 19:00/20:00 NY, so 00:00-07:00 London lies inside this tday. Good.
        r["ah"] = hi[asia].max() if asia.any() else np.nan
        r["al"] = lo[asia].min() if asia.any() else np.nan
        lo_open = np.where(L == 480)[0]
        r["ldn_open"] = g.open.values[lo_open[0]] if len(lo_open) else np.nan
        ny_open = np.where(N == 480)[0]
        r["ny8_open"] = g.open.values[ny_open[0]] if len(ny_open) else np.nan
        noon_ldn = np.where(L == 720)[0]
        r["ldn12"] = g.open.values[noon_ldn[0]] if len(noon_ldn) else np.nan
        r["pdh"] = prev["hi"] if prev is not None else np.nan
        r["pdl"] = prev["lo"] if prev is not None else np.nan
        # previous trading day must be a full day (not a holiday / data gap), otherwise PDH/PDL are not real
        r["prev_complete"] = bool(prev["complete"]) if prev is not None else False
        rows.append(r)
        prev = r
    t = pd.DataFrame(rows).set_index("tday")
    t["rng"] = (t.hi - t.lo) / PIP
    t["arng"] = (t.ah - t.al) / PIP
    return t
