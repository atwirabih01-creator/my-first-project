"""Quick check of XAUUSD strategy v1 ("London breakout of the Asia range, 1R"), written from strategy.md rules only.
Design data only (common.py). Does NOT need ATR (so it trades from the first usable day in Oct 2024).
Writes out_09_trades.csv. Costs 0.40 USD and 0.80 USD per trade."""
from common import *
from news_calendar import EVENTS

df = load("ALL")
nb = df.groupby("tday").size()
tdays = list(nb.index)
ev = {pd.Timestamp(d): lab for d, _, lab in EVENTS}
rows = []
for k, (t, g) in enumerate(df.groupby("tday")):
    if k == 0 or nb[t] < MIN_BARS or nb[tdays[k - 1]] < MIN_BARS:
        continue                                                     # rule 11: day or previous day too thin
    L, N = g.ldn_min.values, g.ny_min.values
    ldn_today, ny_today = g.ldn_today.values, g.ny_today.values
    h, l, c = g.high.values, g.low.values, g.close.values
    asia = ldn_today & (L < 420)                                     # rule 1: 00:00-06:59 London
    if asia.sum() < 300: continue
    AH, AL = h[asia].max(), l[asia].min(); MID = (AH + AL) / 2
    win = ldn_today & (L >= 420) & ~(ny_today & (N >= 720))          # rule 3: 07:00 London -> 12:00 NY
    idx = np.where(win)[0]
    key = L[idx] // 15                                              # 15-min candles on the clock
    for kk in np.unique(key):
        i = idx[key == kk][-1]                                       # last 1-min bar of the candle -> candle close
        side = 1 if c[i] > AH else -1 if c[i] < AL else 0             # rule 4
        if side == 0: continue
        entry = c[i]; stop = MID; risk = abs(entry - stop); target = entry + side * risk   # rules 5-7
        res, why, last, t_exit = None, "time", entry, None
        for j in range(i + 1, len(c)):
            if ny_today[j] and N[j] >= 960: break                     # rule 10: forced close 16:00 NY
            if side == 1:
                if l[j] <= stop: res, why = stop - entry, "stop"; break
                if h[j] >= target: res, why = target - entry, "target"; break
            else:
                if h[j] >= stop: res, why = entry - stop, "stop"; break
                if l[j] <= target: res, why = entry - target, "target"; break
            last = c[j]; t_exit = j
        if res is None: res = (last - entry) * side
        rows.append(dict(tday=t.date(), side="long" if side == 1 else "short", entry_ny=g.ny.iloc[i].strftime("%H:%M"),
                         entry_doha=g.doha.iloc[i].strftime("%H:%M"), asia_hi=AH, asia_lo=AL, entry=entry, stop=stop,
                         target=target, risk_usd=risk, exit=why, gross_usd=res, news=ev.get(t, ""),
                         R=(res - COST) / risk, R_2x=(res - 2 * COST) / risk))
        break                                                        # rule 9: max 1 trade per day
T = pd.DataFrame(rows); T["year"] = year_of(pd.to_datetime(T.tday))
T.to_csv("out_09_trades.csv", index=False)


def st(r):
    eq = r.cumsum(); run = best = 0
    for x in r:
        run = run + 1 if x <= 0 else 0; best = max(best, run)
    return (f"n {len(r):3d} | win {(r>0).mean()*100:4.1f}% | total {r.sum():+6.1f}R | avg {r.mean():+.3f}R | "
            f"PF {r[r>0].sum()/-r[r<=0].sum():.2f} | maxDD {(eq-eq.cummax()).min():.1f}R | longest losing run {best}")


for y in ["Y1", "Y2", "ALL"]:
    s = T if y == "ALL" else T[T.year == y]
    print(f"{y:3s} @0.40: {st(s.R)}")
    print(f"{y:3s} @0.80: {st(s.R_2x)}")
for y in ["Y1", "Y2"]:
    s = T[T.year == y]
    print(f"{y} longs {st(s[s.side=='long'].R)}\n{y} shorts {st(s[s.side=='short'].R)}")
    print(f"{y} news days {st(s[s.news!=''].R)}\n{y} normal days {st(s[s.news==''].R)}")
print("exits:", T.groupby(["year", "exit"]).size().to_dict())
print("trades per month avg:", round(len(T) / 21, 1), "| days with no signal:", "see count of usable days")
