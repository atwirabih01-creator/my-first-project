"""Step 3 tool: backtest one setup on one coin, its meme-coin peers and the whole market.

Usage:
  python3 check_setup.py SYMBOL SETUP [--side long|short|both] [--live]
    SYMBOL  e.g. PEPEUSDT
    SETUP   dip      - buy/sell the dip on 4-hour charts (Q051 style)
            spike    - follow a sudden volume spike, trailing stop (P069 style)
            breakout - new 4-hour high/low on volume, target 3x the risk
  --live    also say whether the setup is firing on the latest finished bar
  --desk    backtest all 10 desk versions (desk_journal.VERSIONS exits) on this coin and its meme peers

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


def ensure_data(symbols):
    """Download 3 years of hourly prices for any coin we don't have yet (fresh sessions start empty)."""
    import fetch_data as Fd
    from concurrent.futures import ThreadPoolExecutor
    have = {p.stem for f in FOLDERS for p in (L.HERE / f).glob("*.pkl")}
    need = [s for s in symbols if s not in have]
    if not need:
        return
    (L.HERE / "data").mkdir(exist_ok=True)
    end = int(time.time() * 1000); start = end - 1095 * 86400 * 1000

    def get(s):
        try:
            Fd.fetch(s, start, end).to_pickle(L.HERE / "data" / f"{s}.pkl")
        except Exception as e:
            print("could not download", s, e)
    with ThreadPoolExecutor(8) as ex:
        list(ex.map(get, need))


def desk_versions(setup, side):
    import desk_journal as DJ
    out = []
    for name, p in DJ.VERSIONS.items():
        v = version(setup, side)
        v.name = name
        v.stop_atr, v.max_hold = p["stop"], max(p["hold"] // v.bar_hours, 1)
        if p["target"]:
            v.target_atr = p["target"]
        else:
            v.target_atr = 10.0
            v.extra.update(breakeven_atr=p["breakeven"], trail_atr=p["trail"])
        out.append(v)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("symbol"); ap.add_argument("setup", choices=SETUPS)
    ap.add_argument("--side", default="both", choices=["long", "short", "both"])
    ap.add_argument("--live", action="store_true")
    ap.add_argument("--desk", action="store_true")
    a = ap.parse_args()
    v = version(a.setup, a.side)
    ensure_data(["BTCUSDT", a.symbol] + sorted(MEMES))
    d = {}
    for f in FOLDERS:
        d.update(R.load_dir(L.HERE / f))
    btc = d["BTCUSDT"]
    if a.desk:
        d = {k: x for k, x in d.items() if k in MEMES or k == a.symbol}
        print(f"DESK VERSIONS on setup '{a.setup}' ({a.side}) — {a.symbol} and meme peers, after 0.30% costs\n")
        for dv in desk_versions(a.setup, a.side):
            ideas = L.build(d, btc, dv)
            if a.side != "both":
                ideas = ideas[ideas.dir == (1 if a.side == "long" else -1)]
            print(f"{dv.name}  coin: {stats(L.trade(ideas[ideas.symbol == a.symbol], dv))}")
            print(f"      peers: {stats(L.trade(ideas[ideas.symbol.isin(MEMES)], dv))}")
        return
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
