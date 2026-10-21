"""Step 3 tool: backtest one setup on one coin, its meme-coin peers and the whole market.

Usage:
  python3 check_setup.py SYMBOL SETUP [--side long|short|both] [--live]
    SYMBOL  e.g. PEPEUSDT
    SETUP   dip      - buy/sell the dip on 4-hour charts (Q051 style)
            spike    - follow a sudden volume spike, trailing stop (P069 style)
            breakout - new 4-hour high/low on volume, target 3x the risk
  --live    also say whether the setup is firing on the latest finished bar

It reports, for the coin, its meme peers and all coins: number of past trades, wins,
profit after fees, profit per $1 lost, how many months were profitable (consistency),
the share of profit from the 5 best trades, and the biggest drop.
"""
import argparse, time, warnings
warnings.filterwarnings("ignore")
import numpy as np
import pandas as pd
from agents import Version, atlas, hawk
import paper_lab as L, round3 as R

FOLDERS = ["data", "data_fresh", "data_practice", "data_holdout_A", "data_holdout_B", "data_holdout_C"]
MEMES = {"DOGEUSDT", "SHIBUSDT", "PEPEUSDT", "WIFUSDT", "BONKUSDT", "FLOKIUSDT", "BOMEUSDT", "NEIROUSDT",
         "TURBOUSDT", "PENGUUSDT", "TRUMPUSDT", "MEMEUSDT", "PEOPLEUSDT", "1000SATSUSDT", "ORDIUSDT",
         "1000CATUSDT", "1MBABYDOGEUSDT", "BANANAS31USDT", "ACTUSDT", "PNUTUSDT", "MOODENGUSDT", "DOGSUSDT",
         "NOTUSDT", "HMSTRUSDT", "CATIUSDT", "BRETTUSDT", "POPCATUSDT", "MEWUSDT", "GOATUSDT"}

SETUPS = {
    "dip": dict(bar_hours=4, setups=("pullback",), atlas_min_score=0.25, stop_atr=2.5, target_atr=2.0, max_hold=24,
                breakout_hours=30, max_stretch_atr=99.0, rsi_dip=30, extra={"crash_guard": 0.05}),
    "spike": dict(setups=("shock",), atlas_min_score=0.5, stop_atr=1.0, target_atr=10.0, max_hold=96, vol_z=1.5,
                  extra={"crash_guard": 0.03, "breakeven_atr": 1.5, "trail_atr": 2.0}),
    "breakout": dict(bar_hours=4, setups=("breakout",), atlas_min_score=0.5, stop_atr=1.5, target_atr=4.5, max_hold=42,
                     breakout_hours=30, max_stretch_atr=99.0, extra={"crash_guard": 0.05}),
}


def version(setup, side):
    v = Version(f"check {setup}", allow_short=side != "long", min_target_pct=0.015, **SETUPS[setup])
    if side == "short":
        v.extra["short_only"] = True
    return v


def stats(t):
    if t.empty:
        return {"trades": 0}
    s = L.score(t)
    m = t.assign(month=pd.to_datetime(t.time).dt.to_period("M")).groupby("month").pnl.sum()
    pos = t.pnl[t.pnl > 0].sum()
    return {"trades": s["trades"], "win_rate": s["win_rate"], "profit_per_$1_lost": s["profit_factor"],
            "return_%": s["return_pct"], "biggest_drop_%": s["max_drawdown_pct"],
            "avg_win_%": s["avg_win_pct"], "avg_loss_%": s["avg_loss_pct"],
            "profitable_months": f"{int((m > 0).sum())}/{len(m)}",
            "top5_share_of_profit": round(float(t.pnl.nlargest(5).sum() / t.pnl.sum()), 2) if t.pnl.sum() > 0 else None}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("symbol"); ap.add_argument("setup", choices=SETUPS)
    ap.add_argument("--side", default="both", choices=["long", "short", "both"])
    ap.add_argument("--live", action="store_true")
    a = ap.parse_args()
    v = version(a.setup, a.side)
    d, btc = L.load()
    for f in FOLDERS[1:]:
        d.update(R.load_dir(L.HERE / f))
    ideas = L.build(d, btc, v)                                 # every past signal with its real outcome
    if a.side == "short":
        ideas = ideas[ideas.dir < 0]
    if a.side == "long":
        ideas = ideas[ideas.dir > 0]
    groups = {"this coin": ideas[ideas.symbol == a.symbol],
              "meme peers": ideas[ideas.symbol.isin(MEMES)], "all coins": ideas}
    print(f"SETUP '{a.setup}' ({a.side}) — past results after 0.30% costs per trade\n")
    for name, g in groups.items():
        print(f"{name:11s}", stats(L.trade(g, v)))
    if a.symbol not in d:
        print(f"\nNote: no price history stored for {a.symbol}.")
    if a.live:
        import fetch_data as Fd
        end = int(time.time() * 1000)
        df = L.bars(Fd.fetch(a.symbol, end - 150 * 86400 * 1000, end), v.bar_hours).iloc[:-1]
        b = L.bars(Fd.fetch("BTCUSDT", end - 150 * 86400 * 1000, end), v.bar_hours).iloc[:-1]
        f = pd.concat([df, atlas(df, b, v), hawk(df, v)], axis=1).iloc[-1]
        sig = {1: "BUY signal", -1: "SELL signal", 0: "no signal"}[int(f.hawk_sig)]
        print(f"\nLIVE (bar starting {df.index[-1]}): {sig}; price {f.close}; trend score {f.atlas_score:.2f}; "
              f"typical bar range {f.atr / f.close:.2%}")


if __name__ == "__main__":
    main()
