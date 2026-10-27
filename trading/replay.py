"""History training ground for Atlas, Hawk and Sage: real past setups, shown BLIND.

Each case is a real past moment when a chosen setup fired (validate period, before the sealed exam).
Coin name, date and price level are hidden (prices rescaled so the signal bar closes at 100), so the
agents cannot recognise the outcome. The team decides TAKE or SKIP; only then are outcomes revealed.
This shows whether the agents' judgment improves on the selection model, and trains it.

  python3 replay.py make ROUND N              # writes journal/replay/round<ROUND>_cases.md (+ hidden answers)
  python3 replay.py score ROUND decisions.csv # decisions.csv: case,decision(TAKE/SKIP),reason
Agents must never open journal/replay/answers/ (the hidden outcomes).
"""
import json, sys
from pathlib import Path
import numpy as np
import pandas as pd
import study_intraday as S
import select_intraday as X

HERE = Path(__file__).parent
DIR = HERE / "journal" / "replay"
ANS = DIR / "answers"


def setups():
    """The setups that passed validation, with their trained models (train part only)."""
    out = []
    for tf in ("1h", "30m", "5m", "1m"):
        p = S.OUT / f"select_{tf}_validate.json"
        if not p.exists():
            continue
        for c in json.load(open(p))["chosen"]:
            out.append((tf, c))
    return out


def packet(df, f, btc, i, tf, plan, meme):
    """Last 40 bars before the signal (inclusive), rescaled so close[i] = 100, plus BTC and context."""
    w = df.iloc[max(0, i - 39): i + 1]
    k = 100 / df.close.iloc[i]
    vol = (w.quote_volume / df.quote_volume.iloc[max(0, i - 96): i + 1].mean()).round(2)
    rows = [f"{n - len(w) + 1:>3} {o*k:8.3f} {h*k:8.3f} {l*k:8.3f} {c*k:8.3f} {v:5.2f}"
            for n, (o, h, l, c, v) in enumerate(zip(w.open, w.high, w.low, w.close, vol))]
    bw = btc.loc[:df.index[i]].iloc[-24:]
    bk = 100 / bw.close.iloc[-1]
    btxt = " ".join(f"{x*bk:.2f}" for x in bw.close.values)
    r = f.iloc[i]
    ctx = (f"trend(long avg) {'up' if r.trend > 0 else 'down'}, slope {r.slope:+.2f}, RSI14 {r.rsi14:.0f}, "
           f"volatility vs normal {r.atr_rel:.2f}x, buyers' share last 12 bars {r.buy_share:.2f}, "
           f"move last 12 bars {100*r.ret12:+.2f}%, last 48 bars {100*r.ret48:+.2f}%")
    return {"bars": rows, "btc": btxt, "context": ctx, "plan": plan, "kind": "meme coin" if meme else "big coin", "tf": tf}


def make(rnd, n):
    DIR.mkdir(parents=True, exist_ok=True); ANS.mkdir(exist_ok=True)
    rng = np.random.default_rng(int(rnd))
    cases, answers = [], {}
    sets = setups()
    for tf, c in sets:
        b = c["base"]
        val0 = S.VAL_START.get(tf, S.VAL_DEFAULT)
        t = X.gather(tf, b, "design")
        tr, va = t[t.t_in < val0], t[t.t_in >= val0]
        m = X.fit(tr, tr.pnl > S.WIN_MIN)
        va = va.assign(prob=m.predict_proba(va[X.FEATS].astype(float))[:, 1])
        # mostly model-approved cases (what the desk would really face) plus some near-misses
        hi, near = va[va.prob >= c["cut"]], va[(va.prob < c["cut"]) & (va.prob >= c["cut"] - 0.08)]
        k = max(1, n // len(sets))
        pick = pd.concat([hi.sample(min(len(hi), int(k * 0.75)), random_state=int(rng.integers(1e9))),
                          near.sample(min(len(near), k - int(k * 0.75)), random_state=int(rng.integers(1e9)))])
        btc = S.load("BTCUSDT", tf)
        frames = {}
        for r in pick.itertuples():
            if r.sym not in frames:
                df = S.load(r.sym, tf)
                frames[r.sym] = (df, S.features(df, S.btc_context(tf)))
            df, f = frames[r.sym]
            i = df.index.get_loc(r.t_in) - 1                 # signal bar = bar before entry
            e = df.open.iloc[i + 1] * 100 / df.close.iloc[i]
            a = f.atr.iloc[i] * 100 / df.close.iloc[i]
            d = int(r.dir)
            plan = (f"{'BUY' if d > 0 else 'SELL'} at next bar open (~{e:.3f}); target {e + d*b['target_atr']*a:.3f}; "
                    f"stop {e - d*b['stop_atr']*a:.3f}; max hold {b['hold_bars']} bars; model win-probability {r.prob:.2f} "
                    f"(desk cut-off {c['cut']:.2f})")
            cid = f"R{rnd}-{len(cases)+1:02d}"
            cases.append((cid, packet(df, f, btc, i, tf, plan, r.meme)))
            answers[cid] = {"sym": r.sym, "time": str(r.t_in), "pnl_pct": round(100 * r.pnl, 3), "win": bool(r.pnl > S.WIN_MIN),
                            "prob": round(float(r.prob), 4), "approved_by_model": bool(r.prob >= c["cut"]), "tf": tf,
                            "setup": f"{b['family']} {b['params']}"}
    order = rng.permutation(len(cases))
    lines = [f"# Replay round {rnd}: {len(cases)} blind historical cases\n",
             "Each case: the last 40 bars (bar 0 = the signal bar; columns: bar, open, high, low, close, volume vs normal),",
             "prices rescaled so the signal bar closes at 100; BTC closes for the last 24 bars (rescaled, last = 100).",
             "Decide TAKE or SKIP for each plan. Outcomes are hidden until the team has decided.\n"]
    for j in order:
        cid, p = cases[j]
        lines += [f"## {cid} - {p['kind']}, {p['tf']} chart", f"Context: {p['context']}", f"Plan: {p['plan']}",
                  "```", "bar     open     high      low    close   vol"] + p["bars"] + ["```", f"BTC: {p['btc']}", ""]
    (DIR / f"round{rnd}_cases.md").write_text("\n".join(lines))
    json.dump(answers, open(ANS / f"round{rnd}.json", "w"), indent=1)
    print(f"round {rnd}: {len(cases)} cases -> {DIR / f'round{rnd}_cases.md'}")


def score(rnd, path):
    ans = json.load(open(ANS / f"round{rnd}.json"))
    d = pd.read_csv(path)
    d["case"] = d["case"].str.strip()
    d["decision"] = d["decision"].str.strip().str.upper()
    d = d.merge(pd.DataFrame.from_dict(ans, orient="index").rename_axis("case").reset_index(), on="case")
    out = []
    for name, part in [("team TAKE", d[d.decision == "TAKE"]), ("team SKIP", d[d.decision == "SKIP"]),
                       ("model alone (approved)", d[d.approved_by_model]), ("all cases", d)]:
        p = part.pnl_pct.values / 100
        st = S.stats(p)
        out.append(f"{name:24s} {st}")
    d.to_csv(DIR / f"round{rnd}_scored.csv", index=False)
    print("\n".join(out))
    print(d[["case", "decision", "win", "pnl_pct", "prob", "approved_by_model", "kind" if "kind" in d else "tf"]].to_string(index=False))


if __name__ == "__main__":
    {"make": lambda: make(sys.argv[2], int(sys.argv[3])), "score": lambda: score(sys.argv[2], sys.argv[3])}[sys.argv[1]]()
