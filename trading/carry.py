"""New strategy family: FUNDING CARRY (market-neutral).

Buy the coin on the spot market AND bet against it by the same amount on the perpetual futures
market. Price moves mostly cancel out; the position collects the "funding" fee that futures buyers
pay to futures sellers every few hours when the market is crowded long (common with meme coins).

Rules written BEFORE any result was seen (22 Oct 2026):
  Design period: Oct 2023 - Dec 2025.  Sealed exam: Jan 2026 - Sep 2026 (one look only).
  Pass (owner's goal): 100+ exam trades, 80%+ wins, profit after costs, PF >= 1.2, biggest drop <= 10%.
Costs per round trip: 0.30% of the position (spot buy+sell 0.10% each, futures 0.05% each),
plus real price slippage between the two markets (the "basis") from actual hourly prices.

Entry: at a funding time, when the average of the last K funding payments, as a yearly rate, is at
least ENTER. Exit: when that average falls below EXIT, or after MAX_DAYS.
A trade is a win if it earns more than +0.10% of the position after all costs.

  python3 carry.py design      # grid search, design period only
  python3 carry.py exam NAME   # the ONE sealed exam
"""
import itertools, json, sys, warnings
from pathlib import Path
import numpy as np
import pandas as pd
import round3 as R
from fetch_futures import PAIRS

warnings.filterwarnings("ignore")
HERE = Path(__file__).parent
FUT = HERE / "data_futures"
OUT = HERE / "results"
COST = 0.0030
SPLIT = pd.Timestamp("2026-01-01", tz="UTC")
FOLDERS = ["data", "data_fresh", "data_practice", "data_holdout_A", "data_holdout_B", "data_holdout_C"]


def load():
    spot = {}
    for f in FOLDERS:
        spot.update(R.load_dir(HERE / f))
    out = {}
    for perp, (s, mult) in PAIRS.items():
        fp, kp = FUT / f"{perp}_funding.pkl", FUT / f"{perp}_1h.pkl"
        if not (fp.exists() and kp.exists() and s in spot):
            continue
        fund = pd.read_pickle(fp)
        fund.index = fund.index.floor("h")
        fund = fund[~fund.index.duplicated()]
        px = pd.DataFrame({"perp": pd.read_pickle(kp).close, "spot": spot[s].close * mult}).dropna()
        out[perp] = (fund.rate, px)
    return out


def periods_per_year(rate):
    gap = rate.index.to_series().diff().dt.total_seconds().median() / 3600
    return 24 * 365 / gap


def trades(rate, px, k, enter, exit_, max_days, stop=None, research=False):
    ppy = periods_per_year(rate)
    avg = rate.rolling(k).mean() * ppy                       # yearly rate, known at that funding time
    if research:   # research rule set: last 3 prints all >= 0.03%/8h; exit after 2 prints < 0.005%/8h
        per8 = rate * (ppy / (365 * 3))                      # rate scaled to an 8-hour period
        avg = pd.Series(np.where(per8.rolling(3).min() >= 0.0003, 1.0, 0.0), index=rate.index)
        low2 = (per8 < 0.00005).rolling(2).sum() >= 2
        enter, exit_ = 0.5, None
    times = rate.index.intersection(px.index)
    rows, pos = [], None
    for t in times:
        if pos is None:
            if avg.get(t, np.nan) >= enter:
                pos = {"t0": t, "spot0": px.spot[t], "perp0": px.perp[t], "fund": 0.0}
            continue
        pos["fund"] += rate[t]                               # short futures receives positive funding
        held = (t - pos["t0"]).total_seconds() / 86400
        spot_ret = px.spot[t] / pos["spot0"] - 1
        perp_ret = px.perp[t] / pos["perp0"] - 1
        pnl = pos["fund"] + spot_ret - perp_ret - COST          # value of both legs right now
        cooled = bool(low2[t]) if research else avg[t] < exit_
        if cooled or held >= max_days or (stop is not None and pnl <= -stop):
            rows.append((pos["t0"], t, pnl, pos["fund"], spot_ret - perp_ret))
            pos = None
    return rows


def run(d, params, period):
    k, enter, exit_, max_days = params[:4]
    stop = params[4] if len(params) > 4 else None
    research = len(params) > 5 and params[5]
    rows = []
    for perp, (rate, px) in d.items():
        for t0, t1, pnl, fund, basis in trades(rate, px, k, enter, exit_, max_days, stop, research):
            if (period == "design" and t0 < SPLIT) or (period == "exam" and t0 >= SPLIT):
                rows.append((perp, t0, t1, pnl, fund, basis))
    return pd.DataFrame(rows, columns=["symbol", "time", "exit_time", "pnl", "funding", "basis"]).sort_values("exit_time")


def score(t):
    if not len(t):
        return {"trades": 0}
    r = t.pnl.values
    eq = np.cumprod(1 + 0.10 * r)
    dd = float((1 - eq / np.maximum.accumulate(eq)).max() * 100)
    w = r > 0.001
    pf = float(r[r > 0].sum() / -r[r <= 0].sum()) if (r <= 0).any() and r[r <= 0].sum() < 0 else 99.0
    months = t.assign(m=t.exit_time.dt.to_period("M")).groupby("m").pnl.sum()
    return {"trades": len(r), "win_rate": round(float(w.mean()), 4), "profit_factor": round(pf, 3),
            "return_pct": round(100 * (eq[-1] - 1), 2), "max_drawdown_pct": round(dd, 2),
            "avg_trade_pct": round(100 * r.mean(), 3), "worst_trade_pct": round(100 * r.min(), 2),
            "avg_days": round(float((t.exit_time - t.time).dt.total_seconds().mean() / 86400), 1),
            "profitable_months": f"{int((months > 0).sum())}/{len(months)}"}


GRID = list(itertools.product([3, 9], [0.10, 0.20, 0.40], [0.0, 0.05], [7, 14, 30]))
GRID += [(3, 0, 0, md, st, True) for md in (7, 14) for st in (None, 0.015)]          # the research's rule set
GRID += [(k, e, x, md, 0.015) for k in (3, 9) for e in (0.20, 0.40) for x in (0.0, 0.05) for md in (14, 30)]


def name(p):
    if len(p) > 5 and p[5]:
        return f"CARRY research max{p[3]} stop{p[4]}"
    return f"CARRY k{p[0]} in{p[1]} out{p[2]} max{p[3]}" + (f" stop{p[4]}" if len(p) > 4 else "")


if __name__ == "__main__":
    d = load()
    print(f"{len(d)} coins with spot + futures history")
    if sys.argv[1] == "design":
        board = []
        for p in GRID:
            sc = score(run(d, p, "design")); sc["name"] = name(p); board.append(sc)
            print(sc, flush=True)
        json.dump(board, open(OUT / "carry_design.json", "w"), indent=1)
    else:
        p = [g for g in GRID if name(g) == " ".join(sys.argv[2:])][0]
        t = run(d, p, "exam")
        sc = score(t); sc["name"] = name(p)
        sc["passed"] = bool(sc["trades"] >= 100 and sc["win_rate"] >= 0.8 and sc["profit_factor"] >= 1.2
                            and sc["return_pct"] > 0 and sc["max_drawdown_pct"] <= 10)
        t.to_csv(OUT / "carry_exam_trades.csv", index=False)
        json.dump(sc, open(OUT / "carry_exam.json", "w"), indent=1)
        print(sc)
