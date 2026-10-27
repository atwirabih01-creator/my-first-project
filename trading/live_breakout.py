"""LIVE PAPER desk for the 30-minute breakout setup the team trained on. Places NO orders.

The trained pipeline, exactly as in history training (owner rule: trade only when all three agree):
  1. scan:   on every finished 30-minute bar, find breakouts (study_intraday 'breakout' (2.0,)/(3.0,),
             target 0.75 ATR, stop 2 ATR, hold 36 bars) in the same direction as BTC's long trend, scored by
             the selection skill (model trained on all history to Sep 2026, cut-off by the walk-forward rule).
             Each candidate gets the same blind-style packet the agents trained on.
  2. team:   Atlas (context; live he also checks news) -> Hawk (chart, TAKE/SKIP) -> Sage (hard limits).
  3. add:    record the agreed trade at the CURRENT price (no chasing: skipped if price already ran
             more than 0.25 ATR toward the target). Stop/target distances from the signal bar's ATR.
  4. update: close trades from real 1-minute prices (stop checked first; futures fees as in the study).
  5. score:  pass = 100+ trades, 70%+ wins, $1.20+ per $1 lost, biggest drop <= 10% on the $500 account.

  python3 live_breakout.py train        # build the live selection model (once; weekly refresh is fine)
  python3 live_breakout.py scan         # prints BREAKOUT_CANDIDATES=<n>; writes journal/breakout_candidates.md
  python3 live_breakout.py add CAND_ID "atlas" "hawk" "sage"
  python3 live_breakout.py update
  python3 live_breakout.py score
"""
import csv, json, pickle, sys, time, urllib.request
from pathlib import Path
import numpy as np
import pandas as pd
import study_intraday as S
import select_intraday as X
import replay as R
from universe import MEMES, MAJORS

HERE = Path(__file__).parent
MODEL = HERE / "results" / "live_breakout_model.pkl"
CANDS = HERE / "journal" / "breakout_candidates.json"
CANDS_MD = HERE / "journal" / "breakout_candidates.md"
TRADES = HERE / "journal" / "breakout_trades.csv"
API = "https://data-api.binance.vision/api/v3/klines"
TF, BAR = "30m", pd.Timedelta(minutes=30)
COLS = ["id", "symbol", "side", "signal_bar", "opened_utc", "entry", "stop", "target", "hold_until", "prob",
        "atlas", "hawk", "sage", "status", "closed_utc", "exit", "result_pct", "stop_pct"]


def klines(sym, interval="30m", bars=2100):
    end = int(time.time() * 1000)
    step = {"30m": 1800_000, "1m": 60_000}[interval]
    cur, rows = end - bars * step, []
    while cur < end:
        url = f"{API}?symbol={sym}&interval={interval}&startTime={cur}&limit=1000"
        for a in range(4):
            try:
                b = json.load(urllib.request.urlopen(url, timeout=30)); break
            except Exception:
                time.sleep(2 ** a)
        else:
            raise RuntimeError(f"price fetch failed {sym}")
        if not b:
            break
        rows += b; cur = b[-1][0] + 1
    df = pd.DataFrame(rows).iloc[:, [0, 1, 2, 3, 4, 7, 10]]
    df.columns = ["t", "open", "high", "low", "close", "quote_volume", "taker_buy_quote"]
    df = df.astype({c: float for c in df.columns[1:]})
    df.index = pd.to_datetime(df.t.astype("int64"), unit="ms", utc=True)
    return df.drop(columns="t")[~df.index.duplicated()]


def bases():
    return [b for b in X.bases(TF) if b["family"] == "breakout"]


def train():
    """Train on every historical breakout trade (with BTC's trend) up to Sep 2026; cut-off by the walk-forward rule."""
    t = []
    for b in bases():
        g = pd.concat([X.gather(TF, b, "design"), X.gather(TF, b, "exam")])
        t.append(g[g.dir == g.btc_trend])
    t = pd.concat(t).sort_values("t_in").drop_duplicates(["sym", "t_in"])
    m0 = pd.Timestamp("2026-10-01", tz="UTC")
    inner = t[(t.t_in >= m0 - pd.DateOffset(months=4)) & (t.t_out < m0)]
    fitset = t[t.t_in < m0 - pd.DateOffset(months=4)]
    m_in = X.fit(fitset, fitset.pnl > S.WIN_MIN)
    pi = m_in.predict_proba(inner[X.FEATS].astype(float))[:, 1]
    q_ok = next((q for q in (0.5, 0.7, 0.8, 0.9, 0.95)
                 if (lambda st: st["trades"] >= 60 and st["win_rate"] >= 0.72 and st["pf"] >= 1.3)(
                     S.stats(inner[pi >= np.quantile(pi, q)].pnl.values))), 0.8)
    model = X.fit(t[t.t_out < m0], t[t.t_out < m0].pnl > S.WIN_MIN)
    cut = float(np.quantile(model.predict_proba(inner[X.FEATS].astype(float))[:, 1], q_ok))
    pickle.dump({"model": model, "cut": cut, "top_share": round(1 - q_ok, 2), "bases": bases(),
                 "trained_on": len(t[t.t_out < m0]), "built_utc": str(pd.Timestamp.now(tz="UTC"))}, open(MODEL, "wb"))
    print(f"live model: trained on {len(t[t.t_out < m0])} trades, cut {cut:.3f} (top {1 - q_ok:.0%})")


def scan():
    M = pickle.load(open(MODEL, "rb"))
    btc = klines("BTCUSDT")
    btc = btc[btc.index + BAR <= pd.Timestamp.now(tz="UTC")]             # finished bars only
    ctx = S.btc_context_from(btc) if hasattr(S, "btc_context_from") else _btc_ctx(btc)
    out = []
    from concurrent.futures import ThreadPoolExecutor
    def get(sym):
        try:
            return sym, klines(sym)
        except Exception as e:
            print("skip", sym, e); return sym, None
    with ThreadPoolExecutor(8) as ex:
        frames = dict(ex.map(get, MEMES + MAJORS))
    for sym in MEMES + MAJORS:
        df = frames.get(sym)
        if df is None:
            continue
        df = df[df.index + BAR <= pd.Timestamp.now(tz="UTC")]
        if len(df) < 700:
            continue
        f = S.features(df, ctx)
        i = len(df) - 1                                                # the bar that just finished
        for b in M["bases"]:
            fam, p = X.FAM[f"{b['family']}|{b['params']}"]
            d = int(S.signals(df, f, fam, p)[i])
            if d == 0 or d != f.btc_trend.iloc[i]:
                continue
            a = f.atr.iloc[i]
            if b["target_atr"] * a / df.close.iloc[i] < S.MIN_TARGET:
                continue
            x = f.iloc[[i]][[k for k in X.FEATS if k in f.columns]].copy()
            x["dir"], x["meme"] = d, int(sym in MEMES)
            prob = float(M["model"].predict_proba(x[X.FEATS].astype(float))[:, 1][0])
            if prob < M["cut"]:
                continue
            cid = f"{df.index[i]:%Y%m%d%H%M}-{sym}"
            if any(c["id"] == cid for c in out):
                continue
            close = df.close.iloc[i]
            plan = (f"{'BUY' if d > 0 else 'SELL'} now (~{100:.3f}); target {100 + d*b['target_atr']*a*100/close:.3f}; "
                    f"stop {100 - d*b['stop_atr']*a*100/close:.3f}; max hold {b['hold_bars']} bars; "
                    f"selection-skill win probability {prob:.2f}")
            pk = R.packet(df, f, btc, i, TF, plan, sym in MEMES)
            out.append({"id": cid, "symbol": sym, "side": "long" if d > 0 else "short", "signal_bar": str(df.index[i]),
                        "signal_close": close, "atr": a, "target_atr": b["target_atr"], "stop_atr": b["stop_atr"],
                        "hold_bars": b["hold_bars"], "prob": round(prob, 4), "packet": pk})
    json.dump({"scanned_utc": str(pd.Timestamp.now(tz="UTC").floor("s")), "candidates": out}, open(CANDS, "w"), indent=1)
    lines = [f"# Live breakout candidates ({pd.Timestamp.now(tz='UTC'):%Y-%m-%d %H:%M} UTC)\n"]
    for c in out:
        p = c["packet"]
        lines += [f"## {c['id']} - {c['symbol']} ({p['kind']}), {c['side']}, 30m chart",
                  f"Context: {p['context']}", f"Plan: {p['plan']}", "```", "bar     open     high      low    close   vol"]
        lines += p["bars"] + ["```", f"BTC: {p['btc']}", ""]
    CANDS_MD.write_text("\n".join(lines))
    print(f"BREAKOUT_CANDIDATES={len(out)}")
    return out


def _btc_ctx(btc):
    c = btc.close
    tr = pd.concat([btc.high - btc.low, (btc.high - c.shift()).abs(), (btc.low - c.shift()).abs()], axis=1).max(axis=1)
    atr = tr.rolling(14).mean()
    return pd.DataFrame({"trend": np.sign(c.ewm(span=240, adjust=False).mean() - c.ewm(span=600, adjust=False).mean()),
                         "ret12": c / c.shift(12) - 1, "z": (c - c.ewm(span=20, adjust=False).mean()) / atr})


def _read():
    return pd.read_csv(TRADES, keep_default_na=False, dtype=str) if TRADES.exists() else pd.DataFrame(columns=COLS)


def add(cid, atlas, hawk, sage):
    c = next((c for c in json.load(open(CANDS))["candidates"] if c["id"] == cid), None)
    if c is None:
        print("no such candidate"); return
    t = _read()
    open_ = t[t.status == "open"] if len(t) else t
    if len(open_) >= 3 or (len(open_) and (open_.symbol == c["symbol"]).any()):
        print("skipped: max 3 open / one per coin"); return
    d = 1 if c["side"] == "long" else -1
    now = klines(c["symbol"], "1m", 5)
    px = float(now.close.iloc[-1])
    if d * (px - c["signal_close"]) > 0.25 * c["atr"]:
        print(f"skipped: price already ran {d*(px-c['signal_close'])/c['atr']:.2f} ATR toward target (no chasing)"); return
    tgt, stp = px + d * c["target_atr"] * c["atr"], px - d * c["stop_atr"] * c["atr"]
    opened = pd.Timestamp.now(tz="UTC").floor("s")
    until = pd.Timestamp(c["signal_bar"]) + BAR * (1 + c["hold_bars"])
    new = not TRADES.exists()
    with open(TRADES, "a", newline="") as fh:
        w = csv.writer(fh)
        if new:
            w.writerow(COLS)
        w.writerow([cid, c["symbol"], c["side"], c["signal_bar"], opened, px, stp, tgt, until, c["prob"], atlas, hawk, sage,
                    "open", "", "", "", round(c["stop_atr"] * c["atr"] / px, 6)])
    print(f"recorded {c['side']} {c['symbol']} at {px} stop {stp:.6g} target {tgt:.6g} until {until}")


def update():
    t = _read()
    if not len(t):
        print("no breakout trades yet"); return
    cc = S.COSTS["futures"]
    for i in t.index[t.status == "open"]:
        r = t.loc[i]
        d = 1 if r.side == "long" else -1
        e, stp, tgt = float(r.entry), float(r.stop), float(r.target)
        t0, until = pd.Timestamp(r.opened_utc), pd.Timestamp(r.hold_until)
        mins = int((pd.Timestamp.now(tz="UTC") - t0).total_seconds() // 60) + 2
        b = klines(r.symbol, "1m", min(mins, 3000))
        b = b[(b.index >= t0.floor("min")) & (b.index + pd.Timedelta(minutes=1) <= pd.Timestamp.now(tz="UTC"))]
        ex = None
        for ts, x in b.iterrows():
            if ts >= until:
                ex, cost, when = x.open, cc["stop"], ts; break
            if (d > 0 and x.low <= stp) or (d < 0 and x.high >= stp):
                ex, cost, when = stp, cc["stop"], ts; break
            if (d > 0 and x.high >= tgt) or (d < 0 and x.low <= tgt):
                ex, cost, when = tgt, cc["tgt"], ts; break
        if ex is not None:
            res = d * (ex / e - 1) - cc["entry"] - cost
            t.loc[i, ["status", "closed_utc", "exit", "result_pct"]] = ["closed", str(when), str(ex), f"{100*res:.3f}"]
    t.to_csv(TRADES, index=False)
    print(f"breakout trades: {int((t.status == 'open').sum())} open, {int((t.status == 'closed').sum())} closed")


def score():
    t = _read()
    c = t[t.status == "closed"] if len(t) else t
    if not len(c):
        print("breakout desk: 0 closed trades"); print("BREAKOUT_PASSED=no"); return
    x = pd.DataFrame({"sym": c.symbol, "t_in": pd.to_datetime(c.opened_utc), "t_out": pd.to_datetime(c.closed_utc),
                      "pnl": c.result_pct.astype(float) / 100, "stop_pct": c.stop_pct.astype(float)})
    a = X.account(x, risk=0.0075, bar=pd.Timedelta(minutes=1))
    ok = a["trades"] >= 100 and a["win_rate"] >= 0.70 and a["pf"] >= 1.2 and a["max_drop_pct"] <= 10 and a["balance"] > 500
    print(f"breakout desk: {a}")
    print("BREAKOUT_PASSED=" + ("yes" if ok else "no"))


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "add":
        add(*sys.argv[2:6])
    else:
        {"train": train, "scan": scan, "update": update, "score": score}[cmd]()
