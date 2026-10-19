"""Fresh final exam: the Round 3 winner trades 15 markets it has never seen (Apr 2025 - Oct 2026)."""
import json
import pandas as pd
import paper_lab as L, round3 as R

d, btc = L.load()
fresh = R.load_dir(L.HERE / "data_fresh")
pick = json.load(open(L.OUT / "round3.json"))["picked"]
v = [x for x in R.R3 if x.name == pick][0]
start, end = pd.Timestamp("2025-04-20 09:30", tz="UTC"), btc.index[-1]
old, new = L.build(d, btc, v), L.build(fresh, btc, v)
pool = pd.concat([old, new])                      # Sage may study any trade that already finished
t = R.walk(pool, new[new.time >= start], v, start, end)
s = L.score(t)
t.to_csv(L.OUT / "fresh_exam_trades.csv", index=False)
json.dump({"version": pick, "result": s}, open(L.OUT / "fresh_exam.json", "w"), indent=1, default=str)
print(pick, s)
t["win"] = t.pnl > 0
print(t.groupby("dir").agg(n=("win", "size"), win=("win", "mean"), pnl=("pnl", "sum")).round(3))
print(t.groupby(pd.to_datetime(t.time).dt.to_period("Q")).agg(n=("win", "size"), win=("win", "mean"), pnl=("pnl", "sum")).round(3))
