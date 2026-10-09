"""Quick, UN-optimised sanity checks of the candidate ideas on the development data only.
NOT a backtest for decision making (that is Agent 2's job). Each idea is run with ONE pre-chosen
setting plus at most one alternative, to see if there is any edge at all after costs.
Fill model: signal on a closed bar -> enter at that bar's close. Stop/target checked on later
1-minute bars; if stop and target are both inside one 1-minute bar, the STOP is assumed first.
Cost: 1.5 pips per round trip, charged on every trade (README)."""
from common import *
from levels import day_table
import sys

COST = 1.5
df = load()
days = day_table(df)
cd = days[days.complete & days.prev_complete & days.pdh.notna()]
D = df[df.tday.isin(cd.index)]
news = set(pd.read_csv("out_04_events.csv", parse_dates=["tday"]).tday.dropna())


def resample(g, tf):
    # bars on the London clock, only from London midnight on
    x = g[g.ldn_today].set_index("ldn")[["open", "high", "low", "close"]]
    return x.resample(f"{tf}min", label="left", closed="left").agg({"open": "first", "high": "max", "low": "min", "close": "last"}).dropna()


def run_trade(g1, t_entry_ldn, side, entry, stop, target, t_exit_ny_min, be_at_r=None):
    """g1 = 1-min bars of the day. Walk forward from the bar after entry. Returns R result (before costs) and exit reason."""
    risk = abs(entry - stop)
    after = g1[(g1.ldn >= t_entry_ldn)]
    st = stop
    for _, b in after.iterrows():
        if b.ny_min >= t_exit_ny_min and b.ldn_today:
            return (b.open - entry) / risk * side, "time"
        if side == 1:
            if b.low <= st: return (st - entry) / risk, "stop" if st == stop else "be"
            if b.high >= target: return (target - entry) / risk, "target"
            if be_at_r and b.high >= entry + be_at_r * risk: st = max(st, entry)
        else:
            if b.high >= st: return (entry - st) / risk, "stop" if st == stop else "be"
            if b.low <= target: return (entry - target) / risk, "target"
            if be_at_r and b.low <= entry - be_at_r * risk: st = min(st, entry)
    b = after.iloc[-1]
    return (b.close - entry) / risk * side, "eod"


def sweep_reversal(tf=15, tgt="opposite", win_end_ldn=12 * 60, exit_ny=12 * 60, min_stop=0, buffer=2):
    out = []
    for tday, g in D.groupby("tday"):
        d = cd.loc[tday]
        bars = resample(g, tf)
        bars = bars[(bars.index.hour * 60 + bars.index.minute >= 420)]
        hh, ll = -1e9, 1e9; swept_hi = swept_lo = False
        for t, b in bars.iterrows():
            lm = t.hour * 60 + t.minute
            if lm + tf > win_end_ldn: break
            hh = max(hh, b.high); ll = min(ll, b.low)
            if b.high > d.ah: swept_hi = True
            if b.low < d.al: swept_lo = True
            sig = None
            if swept_hi and b.close < d.ah and b.close > d.al:
                sig = -1; stop = hh + buffer * PIP; tp = d.al
            elif swept_lo and b.close > d.al and b.close < d.ah:
                sig = 1; stop = ll - buffer * PIP; tp = d.ah
            if sig is None: continue
            entry = b.close
            risk = abs(entry - stop) / PIP
            if risk < min_stop:
                stop = entry - sig * min_stop * PIP; risk = min_stop
            if tgt == "2R": tp = entry + sig * 2 * risk * PIP
            t_in = t + pd.Timedelta(minutes=tf)
            r, why = run_trade(g, t_in, sig, entry, stop, tp, exit_ny)
            rr_planned = abs(tp - entry) / PIP / risk
            out.append(dict(tday=tday, side=sig, risk=risk, rr=rr_planned, R=r - COST / risk, why=why, news=tday in news))
            break  # max 1 trade per day
    return pd.DataFrame(out)


def breakout(tf=15, win_end_ldn=12 * 60, exit_ny=12 * 60, rr=2.0):
    out = []
    for tday, g in D.groupby("tday"):
        d = cd.loc[tday]
        bars = resample(g, tf)
        bars = bars[(bars.index.hour * 60 + bars.index.minute >= 420)]
        mid = (d.ah + d.al) / 2
        for t, b in bars.iterrows():
            lm = t.hour * 60 + t.minute
            if lm + tf > win_end_ldn: break
            sig = 1 if b.close > d.ah else (-1 if b.close < d.al else None)
            if sig is None: continue
            entry = b.close; stop = mid; risk = abs(entry - stop) / PIP
            tp = entry + sig * rr * risk * PIP
            r, why = run_trade(g, t + pd.Timedelta(minutes=tf), sig, entry, stop, tp, exit_ny)
            out.append(dict(tday=tday, side=sig, risk=risk, rr=rr, R=r - COST / risk, why=why, news=tday in news))
            break
    return pd.DataFrame(out)


def summary(name, T):
    if len(T) == 0: print(name, "no trades"); return
    w = T.R > 0
    pf = T.R[w].sum() / -T.R[~w].sum() if (~w).any() else np.inf
    eq = T.R.cumsum(); dd = (eq - eq.cummax()).min()
    h1 = T[T.tday < "2025-10-01"].R; h2 = T[T.tday >= "2025-10-01"].R
    print(f"{name:55s} n={len(T):3d} win={w.mean():.0%} avgR={T.R.mean():+.3f} totR={T.R.sum():+6.1f} PF={pf:.2f} maxDD={dd:.1f}R "
          f"| Y1 {h1.sum():+.1f}R (n={len(h1)}) Y2 {h2.sum():+.1f}R (n={len(h2)}) | news {T[T.news].R.sum():+.1f}R n={T.news.sum()} "
          f"| med stop {T.risk.median():.1f}p")


if __name__ == "__main__":
    A = sweep_reversal(15, "opposite"); summary("A sweep-reversal M15, TP opposite Asia side", A)
    A2 = sweep_reversal(15, "2R"); summary("A sweep-reversal M15, TP 2R", A2)
    A3 = sweep_reversal(5, "opposite"); summary("A sweep-reversal M5, TP opposite Asia side", A3)
    A4 = sweep_reversal(15, "opposite", min_stop=10); summary("A sweep-reversal M15, TP opposite, min stop 10p", A4)
    print("A exits:", A.why.value_counts().to_dict(), "| planned RR median", round(A.rr.median(), 2))
    B = breakout(15, rr=2.0); summary("B Asia breakout M15, stop Asia mid, TP 2R", B)
    B2 = breakout(15, rr=1.0); summary("B Asia breakout M15, stop Asia mid, TP 1R", B2)
    A.to_csv("out_05_A.csv", index=False); B.to_csv("out_05_B.csv", index=False)
