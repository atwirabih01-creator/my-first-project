"""Selection skill: from all the setups a chart shows, take only the highest-probability ones.

Rules written BEFORE any result was seen (27 Oct 2026), on top of study_intraday.py:
  1. Base setups per timeframe are picked from TRAIN results only: futures costs, 1000+ TRAIN trades,
     TRAIN win rate >= 70%, TRAIN $ per $1 lost >= 0.85 (raw setups lose a little; selection must fix that).
  2. A model (gradient-boosted trees) learns from TRAIN signals which situations win
     (features known at the signal bar: stretch, RSI, trend, slope, volatility, volume, buyer share,
     recent moves, distance to highs/lows, hour, BTC trend and stretch, meme or not, long or short).
  3. The cut-off is chosen on VALIDATE: the loosest cut-off with VALIDATE win rate >= 72%,
     $ per $1 lost >= 1.3 and 150+ trades. If none qualifies, the setup is dropped.
  4. Account check: $500, risk 1% per trade (fees included), at most 3 trades open, one per coin.
  5. The chosen setups + models are retrained on all design data and run ONCE on the sealed EXAM (2026).
     Pass = 100+ exam trades, 70%+ wins, $1.20+ per $1 lost, biggest drop <= 10%, account in profit.

  python3 select_intraday.py validate 5m     # train/validate only (no exam data touched)
  python3 select_intraday.py exam 5m         # the ONE sealed exam for the setups chosen in validate
"""
import json, pickle, sys, warnings
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
import study_intraday as S

warnings.filterwarnings("ignore")
FEATS = ["z", "z50", "rsi14", "rsi3", "slope", "atr_pct", "atr_rel", "vol_z", "buy_share", "ret1", "ret3", "ret12",
         "ret48", "dist_hi", "dist_lo", "hour", "btc_trend", "btc_ret12", "btc_z", "dir", "meme"]
FAM = {f"{fam}|{p}": (fam, p) for fam, p in S.FAMILIES}


def bases(tf):
    board = json.load(open(S.OUT / f"intraday_{tf}_design.json"))
    ok = [b for b in board if b["costs"] == "futures" and b["train"].get("trades", 0) >= 1000
          and b["train"]["win_rate"] >= 0.70 and b["train"]["pf"] >= 0.85]
    ok.sort(key=lambda b: -b["train"]["pf"])
    picked, seen = [], set()
    for b in ok:                                  # at most one exit setting per setup family/params
        k = (b["family"], b["params"])
        if k not in seen:
            seen.add(k); picked.append(b)
    return picked[:6]


def gather(tf, base, period):
    fam, p = FAM[f"{base['family']}|{base['params']}"]
    cc = S.COSTS[S.LIVE_COST]
    rows = []
    for sym, df, f in S.coin_frames(tf):
        m = (df.index < S.EXAM_START) if period == "design" else (df.index >= S.EXAM_START)
        d, fd = df[m], f[m]
        if len(d) < 500:
            continue
        sig = S.signals(d, fd, fam, p)
        o, h, l, c = (d[k].values for k in ("open", "high", "low", "close"))
        ii, jj, pnl, _ = S.simulate(o, h, l, c, sig, fd.atr.values, base["target_atr"], base["stop_atr"],
                                    base["hold_bars"], S.MIN_TARGET, cc["entry"], cc["tgt"], cc["stop"])
        if not len(ii):
            continue
        x = fd.iloc[ii][[k for k in FEATS if k in fd.columns]].copy()
        x["dir"], x["meme"] = sig[ii], int(sym in S.MEMES)
        x["sym"], x["t_in"], x["t_out"], x["pnl"] = sym, d.index[np.minimum(ii + 1, len(d) - 1)], d.index[jj], pnl
        x["stop_pct"] = base["stop_atr"] * fd.atr.values[ii] / o[np.minimum(ii + 1, len(d) - 1)]
        rows.append(x)
    return pd.concat(rows).sort_values("t_in") if rows else pd.DataFrame()


def account(t, start=500.0, risk=0.01, max_open=3, bar=None):
    """Take trades in time order: one per coin, at most max_open at once, 1% risk sizing incl. fees.
    Fixed 27 Oct after an independent audit: a trade stays OPEN until its exit bar has finished
    (t_out is the exit bar's START time), and profit is booked when the trade closes."""
    if bar is None:
        bar = pd.Timedelta(minutes=30)
    bal, peak, dd, open_, res = start, start, 0.0, [], []
    order = ["t_in", "prob"] if "prob" in t else ["t_in"]          # same bar: highest model probability first
    for r in t.sort_values(order, ascending=[True, False][:len(order)]).itertuples():
        still = []
        for o in open_:                                          # settle trades whose exit bar is over
            if o["end"] <= r.t_in:
                bal += o["size"] * o["pnl"]
                peak = max(peak, bal); dd = max(dd, 1 - bal / peak)
            else:
                still.append(o)
        open_ = still
        if len(open_) >= max_open or any(o["sym"] == r.sym for o in open_):
            continue
        size = min(bal * risk / (r.stop_pct + 0.0013), bal)
        open_.append({"sym": r.sym, "end": r.t_out + bar, "size": size, "pnl": r.pnl}); res.append(r.pnl)
    for o in open_:
        bal += o["size"] * o["pnl"]; peak = max(peak, bal); dd = max(dd, 1 - bal / peak)
    p = np.array(res)
    st = S.stats(p)
    st.update({"balance": round(bal, 2), "max_drop_pct": round(100 * dd, 2)})
    return st


def fit(x, y):
    m = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.05, max_leaf_nodes=15,
                                       min_samples_leaf=200, l2_regularization=1.0, random_state=7)
    return m.fit(x[FEATS].astype(float), y)


def validate(tf):
    val0 = S.VAL_START.get(tf, S.VAL_DEFAULT)
    chosen, report = [], []
    for b in bases(tf):
        t = gather(tf, b, "design")
        tr, va = t[t.t_in < val0], t[t.t_in >= val0]
        if len(tr) < 500 or len(va) < 200:
            continue
        m = fit(tr, tr.pnl > S.WIN_MIN)
        pv = m.predict_proba(va[FEATS].astype(float))[:, 1]
        best = None
        for q in (0.5, 0.7, 0.8, 0.9, 0.95, 0.98):
            cut = float(np.quantile(pv, q))
            sel = va[pv >= cut]
            st, acc = S.stats(sel.pnl.values), account(sel)
            row = {"base": f"{b['family']} {b['params']} T{b['target_atr']} S{b['stop_atr']} H{b['hold_bars']}",
                   "top_share": round(1 - q, 2), "cut": round(cut, 4), "val": st, "val_account": acc}
            report.append(row)
            if best is None and st["trades"] >= 150 and st["win_rate"] >= 0.72 and st["pf"] >= 1.3:
                best = row
        print(tf, report[-6]["base"], "raw val", S.stats(va.pnl.values), flush=True)
        for r in report[-6:]:
            print("   top", r["top_share"], r["val"], "account", r["val_account"], flush=True)
        if best:
            chosen.append({"base": b, "cut": best["cut"], "val": best["val"], "val_account": best["val_account"]})
    json.dump({"report": report, "chosen": chosen}, open(S.OUT / f"select_{tf}_validate.json", "w"), indent=1, default=str)
    print("CHOSEN:", [(c["base"]["family"], c["base"]["params"], c["cut"]) for c in chosen])


def exam(tf):
    sel = json.load(open(S.OUT / f"select_{tf}_validate.json"))["chosen"]
    allt, out = [], []
    for c in sel:
        b = c["base"]
        d = gather(tf, b, "design")
        val0 = S.VAL_START.get(tf, S.VAL_DEFAULT)
        m_tr = fit(d[d.t_in < val0], d[d.t_in < val0].pnl > S.WIN_MIN)
        # the cut-off was set on the TRAIN-only model; keep that model for the exam (no re-tuning)
        e = gather(tf, b, "exam")
        pe = m_tr.predict_proba(e[FEATS].astype(float))[:, 1]
        pick = e.assign(prob=pe)[pe >= c["cut"]].assign(setup=f"{b['family']} {b['params']}")
        out.append({"setup": f"{b['family']} {b['params']} T{b['target_atr']} S{b['stop_atr']} H{b['hold_bars']}",
                    "exam": S.stats(pick.pnl.values), "exam_account": account(pick)})
        allt.append(pick)
        print(out[-1], flush=True)
    if allt:
        t = pd.concat(allt)
        tot = {"setup": "ALL CHOSEN TOGETHER", "exam": S.stats(t.pnl.values), "exam_account": account(t)}
        out.append(tot); print(tot)
        t.to_csv(S.OUT / f"select_{tf}_exam_trades.csv", index=False)
    json.dump(out, open(S.OUT / f"select_{tf}_exam.json", "w"), indent=1)


if __name__ == "__main__":
    {"validate": validate, "exam": exam}[sys.argv[1]](sys.argv[2])
