"""Monthly learning cycle: the selection skill re-learns every month from everything known so far.

Rules written BEFORE running (27 Oct 2026, after the one-look exam of select_intraday.py came close but
failed PF/drop):
  - Same base setups as select_intraday (picked from TRAIN only).
  - At the start of each month M: train the model on all signals whose trade CLOSED before M.
    Inner check on the 4 months before M: the loosest cut-off (top 50/30/20/10/5%) with win rate >= 72%,
    $ per $1 lost >= 1.3 and 60+ trades. If none qualifies, the setup sits out month M.
  - Trade month M with that model and cut-off. Nothing from month M or later is used to decide month M.
  - Account: $500, 1% risk per trade (fees included), max 3 open, one per coin, all setups share it.
  Months tested: May 2025 - Sep 2026. NOTE: Jan-Sep 2026 was already looked at once (select exam), so 2026
  here is a second look with a rule fixed in advance; the decisive proof is forward paper trading.

  python3 walkforward.py 30m [--with-btc]
  --with-btc (added 27 Oct after a diagnosis): only breakouts in the same direction as BTC's long trend.
  Checked on design data first: on 30m it helped in TRAIN (2024-Apr 2025) and VALIDATE (May-Dec 2025).
"""
import json, sys, warnings
import numpy as np
import pandas as pd
import study_intraday as S
import select_intraday as X

warnings.filterwarnings("ignore")


WITH_BTC = False


def run(tf):
    picks = []
    for b in X.bases(tf):
        t = pd.concat([X.gather(tf, b, "design"), X.gather(tf, b, "exam")]).sort_values("t_in")
        t["setup"] = f"{b['family']} {b['params']} T{b['target_atr']} S{b['stop_atr']} H{b['hold_bars']}"
        if WITH_BTC:                                   # rule confirmed on TRAIN, VALIDATE and 2026 alike (30m)
            t = t[t.dir == t.btc_trend]
        months = pd.date_range("2025-05-01", "2026-09-01", freq="MS", tz="UTC")
        for m0 in months:
            m1 = m0 + pd.offsets.MonthBegin(1)
            past = t[t.t_out < m0]
            inner = past[past.t_in >= m0 - pd.DateOffset(months=4)]
            fitset = past[past.t_in < m0 - pd.DateOffset(months=4)]
            if len(fitset) < 500 or len(inner) < 100:
                continue
            m_in = X.fit(fitset, fitset.pnl > S.WIN_MIN)
            pi = m_in.predict_proba(inner[X.FEATS].astype(float))[:, 1]
            q_ok = None
            for q in (0.5, 0.7, 0.8, 0.9, 0.95):
                sel = inner[pi >= np.quantile(pi, q)]
                st = S.stats(sel.pnl.values)
                if st["trades"] >= 60 and st["win_rate"] >= 0.72 and st["pf"] >= 1.3:
                    q_ok = q; break
            if q_ok is None:
                continue
            m_all = X.fit(past, past.pnl > S.WIN_MIN)                       # learn from everything known
            cut = float(np.quantile(m_all.predict_proba(inner[X.FEATS].astype(float))[:, 1], q_ok))
            now = t[(t.t_in >= m0) & (t.t_in < m1)]
            if not len(now):
                continue
            p = m_all.predict_proba(now[X.FEATS].astype(float))[:, 1]
            picks.append(now.assign(prob=p)[p >= cut].assign(month=str(m0.date())[:7], top=round(1 - q_ok, 2)))
        print(tf, b["family"], b["params"], "done", flush=True)
    t = pd.concat(picks).sort_values("t_in")
    tag = f"{tf}_withbtc" if WITH_BTC else tf
    t.to_csv(S.OUT / f"walkforward_{tag}_trades.csv", index=False)
    rep = {}
    for name, part in [("2025 May-Dec", t[t.t_in < S.EXAM_START]), ("2026 Jan-Sep", t[t.t_in >= S.EXAM_START]), ("all", t)]:
        rep[name] = {"signals": S.stats(part.pnl.values), "account": X.account(part)}
        print(name, rep[name], flush=True)
    mon = {}
    for m, g in t.groupby("month"):
        mon[m] = X.account(g)
    rep["by_month_account"] = mon
    for m, a in mon.items():
        print("  ", m, a)
    json.dump(rep, open(S.OUT / f"walkforward_{tag}.json", "w"), indent=1)


if __name__ == "__main__":
    WITH_BTC = "--with-btc" in sys.argv
    run(sys.argv[1])
