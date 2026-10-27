"""Does futures positioning data (open interest + long/short ratios) add the information charts lack?

Rules written BEFORE any result was seen (27 Oct 2026, after the chart-only confirmation came out break-even):
  - Same setups as the live desk: 30m breakouts (2.0,)/(3.0,), target 0.75 ATR, stop 2 ATR, hold 36 bars,
    only in BTC's trend direction, futures costs (study_intraday / select_intraday / walkforward).
  - Same monthly learning cycle as walkforward.py (May 2025 - Sep 2026): train on everything that closed
    before the month, choose the cut-off on the 4 months before, trade the month.
  - Run twice, identically: A = chart features only; B = chart + positioning features. Positioning is read at
    the snapshot 5 minutes BEFORE the signal bar closes (no peeking):
      open interest change over 30m / 3h / 24h; top traders' position long/short ratio and its 3h change;
      all traders' account long/short ratio vs its 7-day average; takers' buy/sell ratio over the bar.
  - Account: $500, 0.75% risk, max 3 open, one per coin, trades stay open until the exit bar ends (fixed account).
  - PASS (B): 100+ trades, 70%+ wins, $1.20+ per $1 lost, biggest drop <= 10%, AND B beats A in both
    May-Dec 2025 and Jan-Sep 2026. Positioning data has never been looked at before this run.

  python3 walkforward_oi.py
"""
import json, warnings
from pathlib import Path
import numpy as np
import pandas as pd
import study_intraday as S
import select_intraday as X

warnings.filterwarnings("ignore")
HERE = Path(__file__).parent
MET = HERE / "data_metrics"
OI_FEATS = ["oi_30m", "oi_3h", "oi_24h", "top_pos", "top_pos_3h", "acct_rel", "taker"]
BAR = pd.Timedelta(minutes=30)


def oi_table(sym):
    p = MET / f"{sym}.pkl"
    if not p.exists():
        return None
    m = pd.read_pickle(p)
    oi = m.sum_open_interest_value
    t = pd.DataFrame(index=m.index)
    t["oi_30m"] = oi / oi.shift(6) - 1
    t["oi_3h"] = oi / oi.shift(36) - 1
    t["oi_24h"] = oi / oi.shift(288) - 1
    t["top_pos"] = m.sum_toptrader_long_short_ratio
    t["top_pos_3h"] = m.sum_toptrader_long_short_ratio - m.sum_toptrader_long_short_ratio.shift(36)
    t["acct_rel"] = m.count_long_short_ratio / m.count_long_short_ratio.rolling(2016, min_periods=288).mean()
    t["taker"] = m.sum_taker_long_short_vol_ratio.rolling(6).mean()
    return t


def add_oi(t):
    out = []
    for sym, g in t.groupby("sym"):
        tab = oi_table(sym)
        if tab is None:
            continue
        g = g.assign(_snap=pd.to_datetime(g.t_in) - pd.Timedelta(minutes=5)).sort_values("_snap")
        v = pd.merge_asof(g[["_snap"]].reset_index(), tab[OI_FEATS].reset_index().rename(columns={tab.index.name or "index": "_t"}),
                          left_on="_snap", right_on="_t", direction="backward").set_index("index")
        out.append(pd.concat([g.drop(columns="_snap"), v[OI_FEATS]], axis=1))
    return pd.concat(out).dropna(subset=OI_FEATS)


def cycle(t, feats):
    picks = []
    for setup, ts in t.groupby("setup"):
        for m0 in pd.date_range("2025-05-01", "2026-09-01", freq="MS", tz="UTC"):
            m1 = m0 + pd.offsets.MonthBegin(1)
            past = ts[ts.t_out < m0]
            inner, fitset = past[past.t_in >= m0 - pd.DateOffset(months=4)], past[past.t_in < m0 - pd.DateOffset(months=4)]
            if len(fitset) < 500 or len(inner) < 100:
                continue
            m_in = fit(fitset, feats)
            pi = m_in.predict_proba(inner[feats].astype(float))[:, 1]
            q_ok = next((q for q in (0.5, 0.7, 0.8, 0.9, 0.95)
                         if (lambda st: st["trades"] >= 60 and st["win_rate"] >= 0.72 and st["pf"] >= 1.3)(
                             S.stats(inner[pi >= np.quantile(pi, q)].pnl.values))), None)
            if q_ok is None:
                continue
            m_all = fit(past, feats)
            cut = float(np.quantile(m_all.predict_proba(inner[feats].astype(float))[:, 1], q_ok))
            now = ts[(ts.t_in >= m0) & (ts.t_in < m1)]
            if len(now):
                p = m_all.predict_proba(now[feats].astype(float))[:, 1]
                picks.append(now.assign(prob=p)[p >= cut])
    return pd.concat(picks).sort_values("t_in").drop_duplicates(["sym", "t_in"]) if picks else pd.DataFrame()


def fit(x, feats):
    from sklearn.ensemble import HistGradientBoostingClassifier
    m = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.05, max_leaf_nodes=15,
                                       min_samples_leaf=200, l2_regularization=1.0, random_state=7)
    return m.fit(x[feats].astype(float), x.pnl > S.WIN_MIN)


if __name__ == "__main__":
    rows = []
    for b in [b for b in X.bases("30m") if b["family"] == "breakout"]:
        g = pd.concat([X.gather("30m", b, "design"), X.gather("30m", b, "exam")])
        g = g[g.dir == g.btc_trend].assign(setup=f"{b['family']} {b['params']}")
        rows.append(g)
    t = add_oi(pd.concat(rows))
    t["t_in"] = pd.to_datetime(t.t_in); t["t_out"] = pd.to_datetime(t.t_out)
    print("signals with positioning data:", len(t), t.t_in.min(), t.t_in.max())
    rep = {}
    for name, feats in [("A chart only", X.FEATS), ("B chart + positioning", X.FEATS + OI_FEATS)]:
        p = cycle(t, feats)
        rep[name] = {}
        for part, q in [("2025 May-Dec", p[p.t_in < S.EXAM_START]), ("2026 Jan-Sep", p[p.t_in >= S.EXAM_START]), ("all", p)]:
            rep[name][part] = X.account(q, risk=0.0075)
            print(name, part, rep[name][part], flush=True)
        p.to_csv(S.OUT / f"walkforward_oi_{name[0]}_trades.csv", index=False)
    a, bb = rep["A chart only"], rep["B chart + positioning"]["all"]
    passed = (bb["trades"] >= 100 and bb["win_rate"] >= 0.7 and bb["pf"] >= 1.2 and bb["max_drop_pct"] <= 10
              and all(rep["B chart + positioning"][k]["pf"] > a[k]["pf"] for k in ("2025 May-Dec", "2026 Jan-Sep")))
    rep["PASSED"] = bool(passed)
    print("PASSED =", passed)
    json.dump(rep, open(S.OUT / "walkforward_oi.json", "w"), indent=1)
