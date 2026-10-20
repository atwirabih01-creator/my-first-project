"""Paper-trading lab: runs many versions of the 3-agent team on real price history.

History is split into three periods, oldest to newest:
  school   (first 50%) - Sage learns which setups tend to win
  tryouts  (next 25%)  - every version is paper-traded; the best one is picked here
  final exam (last 25%) - only the winning version runs, on data nobody has looked at,
                          and must make at least 100 paper trades
Costs: 0.15% per side (exchange fee + slippage), so 0.30% per round trip.
"""
import json, sys
from pathlib import Path
import numpy as np
import pandas as pd
from agents import Version, atlas, hawk, Sage, ema

HERE = Path(__file__).parent
DATA, OUT = HERE / "data", HERE / "results"
COST = 0.0015
START_CASH, STAKE = 10_000.0, 0.10      # each trade uses 10% of the paper account


def load():
    d = {p.stem: pd.read_pickle(p) for p in sorted(DATA.glob("*.pkl"))}
    return d, d["BTCUSDT"]


AGG = {"open": "first", "high": "max", "low": "min", "close": "last", "volume": "sum",
       "quote_volume": "sum", "trades": "sum", "taker_buy_base": "sum"}


def bars(df, hours):
    return df if hours == 1 else df.resample(f"{hours}h").agg(AGG).dropna()


def build(d, btc, v: Version):
    """Every bar where Atlas and Hawk agree becomes a trade idea, with its real outcome."""
    ideas = []
    btc = bars(btc, v.bar_hours)
    for sym, df in d.items():
        df = bars(df, v.bar_hours)
        a, h = atlas(df, btc, v), hawk(df, v)
        f = pd.concat([df, a, h], axis=1)
        f["stretch"] = (f["close"] - ema(f["close"], v.trend_fast)) / f["atr"]
        f["vol_pct"] = (f["atr"] / f["close"]).rolling(24 * 90 // v.bar_hours, min_periods=24 * 20 // v.bar_hours).rank(pct=True)
        f["dir"] = f["hawk_sig"]
        f["btc_7d"] = btc["close"].reindex(f.index).pct_change(168 // v.bar_hours)
        agree = (f["dir"] != 0) & (f["atlas_score"] * f["dir"] >= v.atlas_min_score)
        if v.need_btc_tide and sym != "BTCUSDT":
            agree &= f["tide"] == f["dir"]
        if not v.allow_short:
            agree &= f["dir"] > 0
        agree &= f["vol_pct"].notna()
        idx = np.flatnonzero(agree.values[:-1])
        o, hi, lo, cl = (f[k].values for k in ["open", "high", "low", "close"])
        at, dr = f["atr"].values, f["dir"].values
        for i in idx:
            e, s = o[i + 1], dr[i]
            if v.target_atr * at[i] / e < v.min_target_pct:
                continue
            stop, tgt = e - s * v.stop_atr * at[i], e + s * v.target_atr * at[i]
            be = v.extra.get("breakeven_atr")       # once this far in profit, stop moves to "fees covered"
            trail = v.extra.get("trail_atr")        # after that, the stop follows price this far behind
            best, armed = e, False
            exit_px, j_exit, why = None, None, "time"
            for j in range(i + 1, min(i + 1 + v.max_hold, len(o))):
                hit_stop = lo[j] <= stop if s > 0 else hi[j] >= stop
                hit_tgt = hi[j] >= tgt if s > 0 else lo[j] <= tgt
                if hit_stop:                       # if both happen in one bar, assume the worse one
                    gap = o[j] < stop if s > 0 else o[j] > stop
                    exit_px, j_exit, why = (o[j] if gap else stop), j, ("protect" if armed else "stop"); break
                if hit_tgt:
                    exit_px, j_exit, why = tgt, j, "target"; break
                best = max(best, hi[j]) if s > 0 else min(best, lo[j])
                if be and s * (best - e) >= be * at[i]:   # takes effect from the next bar only
                    lock = e * (1 + s * 2.5 * COST)
                    if trail:
                        lock = (max if s > 0 else min)(lock, best - s * trail * at[i])
                    stop = (max if s > 0 else min)(stop, lock)
                    armed = True
            if exit_px is None:
                j_exit = min(i + v.max_hold, len(o) - 1)
                exit_px = cl[j_exit]
            pnl = s * (exit_px / e - 1) - 2 * COST
            ideas.append({"symbol": sym, "time": f.index[i], "exit_time": f.index[j_exit],
                          "dir": int(s), "entry": e, "exit": exit_px, "why": why, "pnl": pnl,
                          **{k: f[k].iloc[i] for k in ["atlas_score", "btc_ret", "flow", "rel", "tide", "rsi",
                                                       "vol_z", "ret_z", "stretch", "vol_pct"]},
                          "hour": f.index[i].hour, "btc_7d": f["btc_7d"].iloc[i]})
    return pd.DataFrame(ideas).sort_values("time").reset_index(drop=True)


def trade(ideas, v: Version):
    """Paper-trades approved ideas: one open trade per market, a rest period after a loss."""
    busy_until, taken = {}, []
    for r in ideas.itertuples():
        if r.time < busy_until.get(r.symbol, pd.Timestamp.min.tz_localize("UTC")):
            continue
        taken.append(r._asdict())
        rest = pd.Timedelta(hours=v.cooldown * v.bar_hours if r.pnl <= 0 else 0)
        busy_until[r.symbol] = r.exit_time + rest
    return pd.DataFrame(taken)


def score(t):
    if len(t) == 0:
        return {"trades": 0, "win_rate": 0, "avg_win_pct": 0, "avg_loss_pct": 0, "profit_factor": 0,
                "return_pct": 0, "max_drawdown_pct": 0}
    eq = START_CASH * np.cumprod(1 + STAKE * t["pnl"].values)
    peak = np.maximum.accumulate(eq)
    wins, losses = t.pnl[t.pnl > 0], t.pnl[t.pnl <= 0]
    return {"trades": int(len(t)), "win_rate": round(float((t.pnl > 0).mean()), 4),
            "avg_win_pct": round(100 * wins.mean(), 2) if len(wins) else 0,
            "avg_loss_pct": round(100 * losses.mean(), 2) if len(losses) else 0,
            "profit_factor": round(float(wins.sum() / -losses.sum()), 2) if len(losses) and losses.sum() else 99,
            "return_pct": round(100 * (eq[-1] / START_CASH - 1), 2),
            "max_drawdown_pct": round(100 * float((1 - eq / peak).max()), 2)}


VERSIONS = [
    Version("V01 pullback even", setups=("pullback",), stop_atr=2.0, target_atr=2.0),
    Version("V02 pullback quick-profit", setups=("pullback",), stop_atr=2.5, target_atr=1.25),
    Version("V03 pullback scalp", setups=("pullback",), stop_atr=3.0, target_atr=1.0),
    Version("V04 breakout runner", setups=("breakout",), stop_atr=1.5, target_atr=3.0),
    Version("V05 breakout quick-profit", setups=("breakout",), stop_atr=2.0, target_atr=1.0),
    Version("V06 news-shock follow", setups=("shock",), stop_atr=2.0, target_atr=1.5, vol_z=1.5),
    Version("V07 all setups", setups=("pullback", "breakout", "shock"), stop_atr=2.5, target_atr=1.25),
    Version("V08 all setups + shorts", setups=("pullback", "breakout", "shock"), stop_atr=2.5,
            target_atr=1.25, allow_short=True),
    Version("V09 pullback scalp + shorts", setups=("pullback",), stop_atr=3.0, target_atr=1.0, allow_short=True),
    Version("V10 slow trend pullback", setups=("pullback",), trend_fast=100, trend_slow=400,
            stop_atr=2.5, target_atr=1.25, max_hold=72),
    Version("V11 strict researcher", setups=("pullback", "breakout"), atlas_min_score=0.75,
            stop_atr=3.0, target_atr=1.0),
    Version("V12 fast scalp", setups=("pullback", "breakout"), stop_atr=1.5, target_atr=0.75, max_hold=12),
]


def run(versions, min_tryout_trades=30):
    d, btc = load()
    t0, t1 = btc.index[0], btc.index[-1]
    cut1, cut2 = t0 + (t1 - t0) * 0.50, t0 + (t1 - t0) * 0.75
    board = []
    for v in versions:
        ideas = build(d, btc, v)
        school, tryout, exam = (ideas[ideas.time < cut1], ideas[(ideas.time >= cut1) & (ideas.time < cut2)],
                                ideas[ideas.time >= cut2])
        res = {"version": v.name, "ideas_school": len(school), "school_win_rate": round(float((school.pnl > 0).mean()), 3)}
        for label, part, study in [("tryout", tryout, school), ("exam", exam, pd.concat([school, tryout]))]:
            sage = Sage(v).fit(study, study.pnl > 0)
            p = sage.prob(part) if len(part) else np.array([])
            ok = part[(p >= v.min_prob) & sage.risk_ok(part).values] if len(part) else part
            t = trade(ok, v)
            res[label] = score(t)
            if len(part):
                res[label]["sage_avg_prob"] = round(float(p[(p >= v.min_prob)].mean()), 3) if (p >= v.min_prob).any() else None
            if label == "exam":
                exam_trades = t
            else:
                res["no_sage_" + label] = score(trade(part, v))
        res["_exam_trades"] = exam_trades
        board.append(res)
        print(f"{v.name:30s} tryout {res['tryout']}", flush=True)
    good = [r for r in board if r["tryout"]["trades"] >= min_tryout_trades and r["tryout"]["profit_factor"] > 1]
    best = max(good or board, key=lambda r: (r["tryout"]["win_rate"], r["tryout"]["return_pct"]))
    return board, best, (str(t0), str(cut1), str(cut2), str(t1))


if __name__ == "__main__":
    tag = sys.argv[1] if len(sys.argv) > 1 else "round1"
    board, best, cuts = run(VERSIONS)
    OUT.mkdir(exist_ok=True)
    best["_exam_trades"].to_csv(OUT / f"{tag}_exam_trades.csv", index=False)
    clean = [{k: v for k, v in r.items() if not k.startswith("_")} for r in board]
    json.dump({"periods": dict(zip(["start", "tryouts_start", "exam_start", "end"], cuts)),
               "versions": clean, "picked": best["version"]}, open(OUT / f"{tag}.json", "w"), indent=1, default=str)
    print("\nPICKED:", best["version"])
    print("FINAL EXAM:", best["exam"])
