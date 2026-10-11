"""Independent spot check: rebuild bars/AP/EMA with pandas resample and re-verify random trades of the Nasdaq and gold picks."""
import pandas as pd, numpy as np, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
def prep(sym):
    d = pd.read_csv(f"{ROOT}/trading/data/{sym}_M1.csv.gz", parse_dates=["time_utc"])
    d = d[d.time_utc >= "2018-12-01"]
    d.index = d.time_utc.dt.tz_localize("UTC").dt.tz_convert("America/New_York").dt.tz_localize(None)
    return d
for mkt, sym, anchor, kind, seed in [("NASDAQ", "NSXUSD", "09:30", "R", 1), ("XAUUSD", "XAUUSD", "08:00", "P", 2)]:
    d = prep(sym)
    b = d.resample("15min").agg({"open": "first", "high": "max", "low": "min", "close": "last"}).dropna()
    b["ef"] = b.close.ewm(span=20, adjust=False).mean(); b["es"] = b.close.ewm(span=50, adjust=False).mean()
    tr = pd.read_csv(f"{ROOT}/trading/OWNER-STRATEGIES/VWAP-EMA/trades_{mkt}.csv")
    for _, t in tr.sample(4, random_state=seed).iterrows():
        day = pd.Timestamp(t.date); et = day + pd.Timedelta(t.entry_time_NY + ":00")
        m = d[(d.index >= day + pd.Timedelta(anchor + ":00")) & (d.index < et)]
        ap = ((m.high + m.low + m.close) / 3).mean()
        bar = b.loc[et - pd.Timedelta("15min")]; i = b.index.get_loc(et - pd.Timedelta("15min"))
        s = 1 if t.direction == "long" else -1
        if kind == "R":
            prev = b.iloc[i - 3:i]
            aps = [((d[(d.index >= day + pd.Timedelta(anchor + ":00")) & (d.index < k + pd.Timedelta("15min"))][["high", "low", "close"]].mean(axis=1)).mean()) for k in prev.index]
            ok = s * (bar.close - ap) > 0 and s * (bar.close - bar.ef) > 0 and s * (bar.ef - bar.es) > 0 and all(s * (c - a) < 0 for c, a in zip(prev.close, aps))
        else:
            p = b.iloc[i - 1]
            ok = s * (bar.close - ap) > 0 and s * (bar.ef - bar.es) > 0 and s * (p.ef - p.es) > 0 and s * (bar.close - bar.ef) > 0 \
                 and s * (p.ef - (p.low if s == 1 else p.high)) >= 0 and s * (bar.close - (p.high if s == 1 else p.low)) > 0
        print(mkt, t.date, t.direction, t.entry_time_NY, "entry", t.entry_price, "recalc close", round(bar.close, 2),
              "AP", round(ap, 2), "conditions OK:", ok)
