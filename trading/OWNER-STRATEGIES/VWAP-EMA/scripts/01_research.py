"""Research: how price behaves around the session-anchored average price (AP, VWAP stand-in) and EMAs.
Per market, per session anchor, per year. Design data 2019-2026 only."""
import sys, numpy as np, pandas as pd
from vwlib import *

SESS = {  # name: (anchor, check time NY-min or LON-min offset from anchor in minutes, close NY minute)
    "NASDAQ": {"NY0930": (("NY", 570), 15*60+55)},
    "XAUUSD": {"LON0800": (("LON", 480), 15*60+55), "NY0800": (("NY", 480), 15*60+55)},
    "GBPUSD": {"LON0800": (("LON", 480), 15*60+55), "NY0800": (("NY", 480), 15*60+55)},
    "EURUSD": {"LON0800": (("LON", 480), 15*60+55), "NY0800": (("NY", 480), 15*60+55)},
}
out = []
for mkt in sys.argv[1:] or SESS:
    df = load(mkt)
    for sname, (anchor, closem) in SESS[mkt].items():
        ap, sd = anchored_ap(df, anchor)
        bad = gappy_days(df, anchor[1], closem, anchor[0])
        b5 = bars(df, 5, ap, sd); b5["e9"] = ema(b5.close, 9); b5["e21"] = ema(b5.close, 21); b5["atr"] = atr(b5)
        b15 = bars(df, 15, ap, sd); b15["atr"] = atr(b15)
        tcol = "endlonm" if anchor[0] == "LON" else "endnym"
        rows = []
        for d, g in b5[b5.ap.notna()].groupby("day"):
            if d in bad: continue
            g = g[g.endnym <= closem]
            if len(g) < 24: continue
            # check points: 60 and 120 minutes after anchor
            rec = {"day": d, "year": d.year, "dow": d.dayofweek}
            sess_rng = g.high.max() - g.low.min(); rec["range"] = sess_rng
            rec["atr5"] = g.atr.median(); rec["crosses"] = int((np.sign(g.close - g.ap).diff().fillna(0) != 0).sum())
            last = g.close.iloc[-1]
            for off in (60, 120):
                h = g[g[tcol] == anchor[1] + off]
                if h.empty: continue
                h = h.iloc[0]
                side = np.sign(h.close - h.ap); al = 1 if (h.e9 > h.e21 and side > 0) else (-1 if (h.e9 < h.e21 and side < 0) else 0)
                rec[f"fwd{off}"] = side * (last - h.close) / sess_rng      # move to close in side direction, per session range
                rec[f"same{off}"] = int(np.sign(last - g.ap.iloc[-1]) == side)
                rec[f"al{off}"] = al
                rec[f"alfwd{off}"] = al * (last - h.close) / max(h.atr, 1e-9) if al else np.nan   # in 5m-ATR units
            rows.append(rec)
        r = pd.DataFrame(rows)
        for y, gy in r.groupby("year"):
            out.append({"market": mkt, "session": sname, "year": y, "days": len(gy),
                        "range_med": gy.range.median(), "atr5_med": gy.atr5.median(),
                        "cost_in_atr5": COST[mkt] / gy.atr5.median(),
                        "ap_crosses_per_day": gy.crosses.mean(),
                        "same_side_close_60": gy.same60.mean(), "same_side_close_120": gy.same120.mean(),
                        "fwd_to_close_60_pct_range": gy.fwd60.mean() * 100,
                        "aligned_days_60": (gy.al60 != 0).mean(),
                        "aligned_fwd_atr5_60": gy.alfwd60.mean(), "aligned_fwd_atr5_120": gy.alfwd120.mean()})
        print(mkt, sname, "skipped gappy days:", len(bad), flush=True)
res = pd.DataFrame(out)
pd.set_option("display.width", 250); pd.set_option("display.max_columns", 30)
print(res.round(3).to_string())
res.round(4).to_csv(f"../outputs/research_{'_'.join(sys.argv[1:]) or 'all'}.csv", index=False)
