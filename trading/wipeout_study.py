"""Wipe-out bounce study: after many leveraged longs are force-closed at once, does a long bounce trade
win 70%+ AND make a profit after fees?   PAPER RESEARCH ONLY - no orders anywhere, free local data only.

Rules written BEFORE any result was seen (30 Oct 2026). They are not changed after looking at results.

DATA
  Prices: data_intraday/<SYM>_5m.pkl (index = bar OPEN time, UTC). Positioning: data_metrics/<SYM>.pkl
  (5-minute futures snapshots, index = snapshot time). Coins: the scanner universe (universe.py) that has
  BOTH price and metrics files (38 coins). BTC metrics are used for the market filter.
  No peeking: a signal bar that opens at t closes at t+5m; we only use the latest snapshot with time
  <= (bar close - 5 min) = t (merge_asof backward, max staleness 10 min, else no signal).

SIGNAL (5m bars, LONG only)
  Coin wipe-out on bar i:
    OI 1h change  = OI(snapshot) / OI(snapshot exactly 1h = 12 snapshots earlier) - 1  <= -D%
    price 1h change = close[i] / close of the bar 1h earlier - 1                        <= -P%
    grid D in {3, 5, 8}, P in {2, 3, 5}  (missing earlier value -> no signal)
  Market filter variant "btc": BTC OI 1h change at the same snapshot time also <= -2%. Tested with and without.
  Cooldown: after a wipe-out event on a coin, further events on that coin are ignored for 6 hours (72 bars).
  Entry variants:
    "next":    enter at the open of the bar after the signal bar.
    "confirm": wait for the first bar j in i+1..i+6 whose close > high of bar j-1; enter at the open of j+1.
               No confirmation within 6 bars -> no trade. ATR used is ATR at bar j.
EXITS (as existing families, study_intraday.simulate: entry next open, stop checked before target in a bar)
  ATR = 14-bar mean true range at the signal bar. Target in {0.5, 0.75, 1.0} ATR, stop in {1.5, 2.0, 3.0} ATR,
  hold in {12, 36, 72} bars (time exit at close). Targets smaller than MIN_TARGET (0.30% of price) are skipped.
  A win = pnl > WIN_MIN (0.10% after fees). pf = $ won per $1 lost.
COSTS: 'futures' and 'mexc' sets from study_intraday.COSTS. Each cost set is judged on its own (selection,
  validation and exam are all done separately per cost set). 'futures' is the headline (desk default).
PERIODS (by signal-bar time)
  TRAIN    = 2024-01-01 .. 2025-04-30   -> choose settings here only
  VALIDATE = 2025-05-01 .. 2025-12-31   -> check the TRAIN choices
  EXAM     = 2026-01-01 .. 2026-09-30   -> looked at ONCE, only for the chosen settings
  Design stage uses only data before 2026-01-01 (frames are cut there).
SELECTION
  TRAIN: 150+ trades, win rate >= 70%, pf >= 1.2.
  VALIDATE (only TRAIN qualifiers): 60+ trades, win >= 70%, pf >= 1.15.
  Chosen: at most 3 settings that pass both, at most one exit setting per signal definition
  (D, P, btc filter, entry), ranked by min(TRAIN pf, VALIDATE pf), then by TRAIN trades.
  If nothing qualifies: STOP, no exam; best near-misses are reported as information only.
PASS (EXAM, chosen settings combined through select_intraday.account, $500, risk 1%, max 3 open,
  one per coin, bar = 5 min): 100+ trades, 70%+ wins, pf >= 1.2, biggest drop <= 10%, balance > $500.

  python3 wipeout_study.py design      # TRAIN + VALIDATE -> results/wipeout_study.json
  python3 wipeout_study.py exam        # the ONE sealed exam for the chosen settings (refuses to run twice)
"""
import itertools, json, sys, warnings
from pathlib import Path
import numpy as np
import pandas as pd
import study_intraday as S
import select_intraday as X
from universe import MEMES, MAJORS

warnings.filterwarnings("ignore")
HERE = Path(__file__).parent
MET = HERE / "data_metrics"
OUTF = S.OUT / "wipeout_study.json"
TRAIN_END = pd.Timestamp("2025-05-01", tz="UTC")
EXAM_START = S.EXAM_START
EXAM_END = pd.Timestamp("2026-10-01", tz="UTC")
DS, PS = (3, 5, 8), (2, 3, 5)
BTCF = ("none", "btc")
ENTRIES = ("next", "confirm")
EXITS = list(itertools.product([0.5, 0.75, 1.0], [1.5, 2.0, 3.0], [12, 36, 72]))
COSTSETS = ("futures", "mexc")
COOLDOWN = 72
BTC_OI_DROP = 0.02
HOUR = pd.Timedelta(hours=1)
BAR = pd.Timedelta(minutes=5)


def oi_change(sym):
    p = MET / f"{sym}.pkl"
    if not p.exists():
        return None
    oi = pd.read_pickle(p).sum_open_interest_value.astype(float)
    oi = oi[~oi.index.duplicated()].sort_index()
    prev = oi.reindex(oi.index - HOUR).values          # exactly 1h (12 snapshots) earlier; NaN if missing
    ch = pd.Series(oi.values / prev - 1, index=oi.index)
    ch[(oi.values <= 0) | (prev <= 0)] = np.nan
    return ch


def asof(ch, idx):
    """Value of the latest snapshot at time <= bar open (= bar close - 5 min), at most 10 min stale."""
    left = pd.DataFrame({"t": idx})
    right = pd.DataFrame({"t": ch.index.astype(idx.dtype), "v": ch.values})
    m = pd.merge_asof(left, right, on="t", direction="backward", tolerance=pd.Timedelta(minutes=10))
    return m.v.values


def frame(sym, btc_ch):
    df = S.load(sym, "5m")
    ch = oi_change(sym)
    if df is None or ch is None or len(df) < 3000:
        return None
    df = df[~df.index.duplicated()].sort_index()
    c, h, l = df.close, df.high, df.low
    tr = pd.concat([h - l, (h - c.shift()).abs(), (l - c.shift()).abs()], axis=1).max(axis=1)
    atr = tr.rolling(14).mean().values
    pr = c.values / c.reindex(df.index - HOUR).values - 1     # price 1h change by clock time
    oi = asof(ch, df.index)
    boi = asof(btc_ch, df.index)
    gaps = int((df.index.to_series().diff() > BAR).sum())
    return df, atr, pr, oi, boi, gaps


def events(pr, oi, boi, D, P, btcf):
    raw = (oi <= -D / 100) & (pr <= -P / 100)
    if btcf == "btc":
        raw &= boi <= -BTC_OI_DROP
    raw = np.nan_to_num(raw, nan=False).astype(bool)
    out, nxt = [], -1
    for i in np.flatnonzero(raw):
        if i >= nxt:
            out.append(i); nxt = i + COOLDOWN
    return np.array(out, dtype=np.int64)


def entry_bars(ev, o, h, c, mode):
    """Signal bar index for each event (entry is the next bar's open, as simulate does)."""
    if mode == "next":
        return ev
    n, out = len(c), []
    for i in ev:
        for j in range(i + 1, min(i + 6, n - 2) + 1):
            if c[j] > h[j - 1]:
                out.append(j); break
    return np.array(out, dtype=np.int64)


def run_coin(sym, fr, keep=None, start=None, end=None):
    """Simulate every setting (or only `keep`) on one coin. Returns list of per-trade rows."""
    df, atr, pr, oi, boi, _ = fr
    o, h, l, c = (df[k].values.astype(float) for k in ("open", "high", "low", "close"))
    idx = df.index
    rows = []
    for D, P, bf in itertools.product(DS, PS, BTCF):
        ev = events(pr, oi, boi, D, P, bf)
        if start is not None:
            ev = ev[(idx[ev] >= start) & (idx[ev] < end)]
        for mode in ENTRIES:
            sb = entry_bars(ev, o, h, c, mode)
            if not len(sb):
                continue
            sig = np.zeros(len(c), np.int8); sig[sb] = 1
            for T, St, H in EXITS:
                for cn in COSTSETS:
                    key = (D, P, bf, mode, T, St, H, cn)
                    if keep is not None and key not in keep:
                        continue
                    cc = S.COSTS[cn]
                    ii, jj, pnl, _ = S.simulate(o, h, l, c, sig, atr, T, St, H, S.MIN_TARGET,
                                                cc["entry"], cc["tgt"], cc["stop"])
                    if not len(ii):
                        continue
                    e = o[ii + 1]
                    rows.append(pd.DataFrame({"key": [key] * len(ii), "sym": sym, "t_sig": idx[ii],
                                              "t_in": idx[ii + 1], "t_out": idx[jj], "pnl": pnl,
                                              "stop_pct": St * atr[ii] / e}))
    return rows


def coins():
    return [s for s in MEMES + MAJORS if (MET / f"{s}.pkl").exists() and (S.DATA / f"{s}_5m.pkl").exists()]


def keyname(k):
    D, P, bf, mode, T, St, H, cn = k
    return {"oi_drop_pct": D, "price_drop_pct": P, "btc_filter": bf, "entry": mode,
            "target_atr": T, "stop_atr": St, "hold_bars": H, "costs": cn}


def design():
    btc_ch = oi_change("BTCUSDT")
    acc, ev_count, data_notes = {}, {}, {}
    for sym in coins():
        fr = frame(sym, btc_ch)
        if fr is None:
            data_notes[sym] = "missing/short"; continue
        df, atr, pr, oi, boi, gaps = fr
        cut = df.index < EXAM_START
        fr = (df[cut], atr[cut], pr[cut], oi[cut], boi[cut], gaps)
        data_notes[sym] = {"price_gaps": gaps, "oi_missing_share": round(float(np.isnan(oi[cut]).mean()), 4)}
        for D, P, bf in itertools.product(DS, PS, BTCF):
            ev = events(fr[2], fr[3], fr[4], D, P, bf)
            t = fr[0].index[ev]
            k = f"D{D} P{P} {bf}"
            a = ev_count.setdefault(k, {"train": 0, "validate": 0})
            a["train"] += int((t < TRAIN_END).sum()); a["validate"] += int((t >= TRAIN_END).sum())
        for r in run_coin(sym, fr):
            key = r.key.iloc[0]
            v = (r.t_sig >= TRAIN_END).values
            a = acc.setdefault(key, {"train": [], "val": []})
            a["train"].append(r.pnl.values[~v]); a["val"].append(r.pnl.values[v])
        print(sym, "done", data_notes[sym], flush=True)
    board = []
    for key, a in acc.items():
        row = keyname(key)
        row["key"] = list(key)
        row["train"] = S.stats(np.concatenate(a["train"]))
        row["val"] = S.stats(np.concatenate(a["val"]))
        board.append(row)
    res = {"events_per_signal_definition": ev_count, "data_notes": data_notes, "by_cost": {}}
    for cn in COSTSETS:
        b = [r for r in board if r["costs"] == cn]
        tr_ok = [r for r in b if r["train"].get("trades", 0) >= 150 and r["train"]["win_rate"] >= 0.70
                 and r["train"]["pf"] >= 1.2]
        both = [r for r in tr_ok if r["val"].get("trades", 0) >= 60 and r["val"]["win_rate"] >= 0.70
                and r["val"]["pf"] >= 1.15]
        both.sort(key=lambda r: (-min(r["train"]["pf"], r["val"]["pf"]), -r["train"]["trades"]))
        chosen, seen = [], set()
        for r in both:
            sd = tuple(r["key"][:4])
            if sd not in seen:
                seen.add(sd); chosen.append(r)
            if len(chosen) == 3:
                break
        # information only: near-misses on TRAIN (enough trades), ranked by how close they get to the bar
        enough = [r for r in b if r["train"].get("trades", 0) >= 150]
        enough.sort(key=lambda r: -min(r["train"]["win_rate"] / 0.70, r["train"]["pf"] / 1.2))
        top_pf = sorted([r for r in b if r["train"].get("trades", 0) >= 150], key=lambda r: -r["train"]["pf"])[:10]
        top_win = sorted([r for r in b if r["train"].get("trades", 0) >= 150],
                         key=lambda r: -r["train"]["win_rate"])[:10]
        res["by_cost"][cn] = {"train_qualifiers": len(tr_ok), "train_qualifiers_list": tr_ok[:30],
                              "pass_train_and_validate": len(both), "chosen": chosen,
                              "near_misses_train": enough[:10], "top_train_pf": top_pf, "top_train_win": top_win,
                              "settings_with_150_train_trades": len(enough), "settings_total": len(b)}
        print(f"[{cn}] settings={len(b)} with150={len(enough)} train_qual={len(tr_ok)} both={len(both)} "
              f"chosen={[r['key'] for r in chosen]}", flush=True)
        for r in enough[:5]:
            print("   near-miss", r["key"], "TRAIN", r["train"], "VAL", r["val"], flush=True)
    json.dump(res, open(OUTF, "w"), indent=1, default=str)


def exam():
    res = json.load(open(OUTF))
    if "exam" in res and "--force" not in sys.argv:
        print("EXAM already run once; refusing to look again."); return
    btc_ch = oi_change("BTCUSDT")
    res["exam"] = {}
    for cn in COSTSETS:
        chosen = res["by_cost"][cn]["chosen"]
        if not chosen:
            res["exam"][cn] = {"ran": False, "reason": "no setting passed TRAIN and VALIDATE"}
            print(cn, "no chosen settings -> no exam"); continue
        keep = {tuple(r["key"]) for r in chosen}
        keep = {(int(k[0]), int(k[1]), k[2], k[3], float(k[4]), float(k[5]), int(k[6]), k[7]) for k in keep}
        rows = []
        for sym in coins():
            fr = frame(sym, btc_ch)
            if fr is None:
                continue
            rows += run_coin(sym, fr, keep=keep, start=EXAM_START, end=EXAM_END)
        t = pd.concat(rows) if rows else pd.DataFrame()
        per = {str(k): S.stats(g.pnl.values) for k, g in t.groupby("key")} if len(t) else {}
        acct = X.account(t, start=500, risk=0.01, max_open=3, bar=BAR) if len(t) else {"trades": 0}
        ok = (acct.get("trades", 0) >= 100 and acct["win_rate"] >= 0.70 and acct["pf"] >= 1.2
              and acct["max_drop_pct"] <= 10 and acct["balance"] > 500)
        res["exam"][cn] = {"ran": True, "per_setting": per, "raw_all": S.stats(t.pnl.values) if len(t) else {},
                           "account": acct, "PASS": bool(ok)}
        print(cn, "EXAM", res["exam"][cn], flush=True)
        if len(t):
            t.assign(key=t.key.astype(str)).to_csv(S.OUT / f"wipeout_exam_trades_{cn}.csv", index=False)
    json.dump(res, open(OUTF, "w"), indent=1, default=str)


if __name__ == "__main__":
    {"design": design, "exam": exam}[sys.argv[1]]()
