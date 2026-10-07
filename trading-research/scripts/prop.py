# Prop-firm portfolio simulation: 1% risk per trade, daily stop, overall 5% limit.
import numpy as np, pandas as pd

def portfolio(trades, max_day_loss_R=2.0, max_trades_day=3, max_open=2, risk_pct=1.0):
    """trades: DataFrame with time, mins, R, pair. Applies rules chronologically.
    Daily stop: once realised day loss reaches max_day_loss_R no new trades.
    Worst case open risk is also capped (max_open) so the 3% daily rule can never be breached."""
    T = trades.sort_values("time").copy()
    T["exit_time"] = T.time + pd.to_timedelta(T.mins, unit="m")
    keep = []; day_state = {}; open_ = []
    for i, t in T.iterrows():
        d = t.time.normalize()
        st = day_state.setdefault(d, {"pnl": 0.0, "n": 0, "closed": []})
        # realise trades closed before this entry
        open_ = [o for o in open_ if o[0] > t.time]
        realised = sum(r for (et, r, dd) in st["closed"] if dd == d and et <= t.time)
        if realised <= -max_day_loss_R or st["n"] >= max_trades_day: continue
        # worst case: realised + all open stop out + this one must stay above -3R
        if len(open_) >= max_open or realised - 1.15 * (len(open_) + 1) < -3.0 / risk_pct: continue
        keep.append(i); st["n"] += 1
        st["closed"].append((t.exit_time, t.R, d)); open_.append((t.exit_time, t.R))
    return T.loc[keep]

def report(T, risk_pct=1.0):
    T = T.copy(); T["pct"] = T.R * risk_pct
    T["day"] = T.time.dt.normalize(); T["week"] = (T.day - pd.to_timedelta(T.day.dt.weekday, unit="D")).dt.tz_localize(None)
    daily = T.groupby("day").pct.sum()
    weekly = T.groupby("week").agg(trades=("pct", "size"), pnl_pct=("pct", "sum"),
                                   green_days=("day", lambda s: int((daily.loc[s.unique()] > 0).sum())),
                                   red_days=("day", lambda s: int((daily.loc[s.unique()] < 0).sum())))
    eq = T.pct.cumsum(); dd = (eq - eq.cummax()).min()
    return daily, weekly, dict(trades=len(T), total_pct=round(T.pct.sum(), 1), worst_day=round(daily.min(), 2),
                               best_day=round(daily.max(), 2), max_dd_pct=round(dd, 2),
                               green_day_rate=round((daily > 0).mean(), 2),
                               avg_green_days_wk=round(weekly.green_days.mean(), 2))

def monte_carlo(daily, n=20000, days=40, target=8.0, limit=-5.0, seed=1):
    """Resample real trading days: chance of hitting +target% before -limit% (trailing from start balance)."""
    rng = np.random.default_rng(seed); v = daily.values; win = lose = 0
    for _ in range(n):
        eq = 0.0
        for x in rng.choice(v, days):
            eq += x
            if eq <= limit: lose += 1; break
            if eq >= target: win += 1; break
    return dict(pass_pct=round(100 * win / n, 1), breach_pct=round(100 * lose / n, 1), unfinished_pct=round(100 * (n - win - lose) / n, 1))
