"""Robustness map for the momentum family (M1/M2), NOT used to pick the best cell.
Grid (declared before running): entry 07:00/08:00/09:00/10:00 NY x stop 0.35/0.5/0.75/1.0 x ATR14 x exit 12:00/16:00 NY = 32 cells.
Plus: M2 by quarter, by news day, by weekday."""
import io, contextlib
from sim import *
import importlib
ideas = importlib.import_module("05_ideas")
from news_calendar import EVENTS

def quiet(fn, *a, **k):
    with contextlib.redirect_stdout(io.StringIO()):
        return fn(*a, **k)

print("cell: entry, stop xATR, exit -> Y1 R (PF) | Y2 R (PF) | @0.80 Y1/Y2 | lrun | n")
for e in [420, 480, 540, 600]:
    for s in [0.35, 0.5, 0.75, 1.0]:
        for x in [720, 960]:
            T = quiet(ideas.run_momentum, e, stop_x=s, close_min=x); T["year"] = year_of(T.tday)
            a1, a2 = stats(T[T.year == "Y1"]), stats(T[T.year == "Y2"])
            b1, b2 = stats(T[T.year == "Y1"], 0.8), stats(T[T.year == "Y2"], 0.8)
            print(f"{e//60:02d}:00 {s:.2f} {x//60}:00 -> {a1['R']:+6.1f} ({a1['pf']:.2f}) | {a2['R']:+6.1f} ({a2['pf']:.2f}) | "
                  f"{b1['R']:+6.1f}/{b2['R']:+6.1f} | {max(a1['lrun'], a2['lrun'])} | {len(T)}")

T = quiet(ideas.run_momentum, 480); T["year"] = year_of(T.tday)
T["r"] = (T.gross - COST) / T.risk
print("\nM2 by quarter (R):", T.groupby(pd.to_datetime(T.tday).dt.to_period("Q")).r.sum().round(1).to_dict())
print("M2 by month (R):", T.groupby(pd.to_datetime(T.tday).dt.to_period("M")).r.sum().round(1).to_dict())
ev = {pd.Timestamp(d): lab for d, _, lab in EVENTS}
T["news"] = T.tday.map(lambda t: ev.get(t, "none"))
print("M2 by news type:", T.groupby(["news", "year"]).r.agg(["count", "sum"]).round(1).to_dict("index"))
print("M2 by weekday:", T.groupby([pd.to_datetime(T.tday).dt.dayofweek, "year"]).r.sum().round(1).to_dict())
# bootstrap
rng = np.random.default_rng(1)
bs = [rng.choice(T.r.values, len(T)).mean() for _ in range(5000)]
print(f"M2 bootstrap: avg {T.r.mean():+.3f}R, share of resamples <= 0: {(np.array(bs) <= 0).mean()*100:.1f}%")
