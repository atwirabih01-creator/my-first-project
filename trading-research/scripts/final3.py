# Run the Round-3 locked rules. Usage: RAW=<dir> python3 final3.py <label> <outdir>
import sys, numpy as np, pandas as pd
from bt import Mkt, run, stats
from prop import portfolio, report, monte_carlo
RULES = {
    "GBPUSD": ("BRT", dict(tf="1h", stop="bar", rr=3, bias=True, maxstop=0.6)),
    "GBPJPY": ("VWP", dict(tf="15min", win="W1", rr=3, anchor="day", maxstop=0.5)),
    "NAS100": ("FVG", dict(tf="5min", win="W2", rr=2, maxstop=0.5)),
    "XAUUSD": ("ABO", dict(tf="30min", win="W1", rr=3, bias=True, maxstop=0.6)),
    "XAUUSD_FVG": ("FVG", dict(tf="30min", win="W2", rr=3, maxstop=0.5)),
}
label, out = sys.argv[1], sys.argv[2]
cache = {}; allT = []
for key, (s, p) in RULES.items():
    pair = key.split("_")[0]
    m = cache.setdefault(pair, Mkt(pair))
    T = run(m, s, p); T["pair"] = key; allT.append(T)
    st = stats(T)
    bs = np.random.default_rng(0).choice(T.R.values, (20000, len(T))).mean(1) if len(T) else np.array([0.0])
    p0 = (bs <= 0).mean(); lo = np.percentile(bs, 5)
    verdict = "STRONG PASS" if lo > 0 else ("PASS" if T.R.mean() > 0 and p0 < 0.2 else "FAIL")
    print(f"{key:11s} {s}: n={st.get('n')} win={st.get('win')} avgR={st.get('avgR')} PF={st.get('PF')} maxDD_R={st.get('maxDD_R')} "
          f"streak={st.get('lose_streak')} | 90% range [{lo:.3f},{np.percentile(bs,95):.3f}] P(<=0)={p0:.2f} -> {verdict}")
    print("            exits:", T.exit.value_counts().to_dict() if len(T) else {}, " by month R:",
          T.groupby(T.time.dt.strftime("%Y-%m")).R.sum().round(1).to_dict() if len(T) else {})
T = pd.concat(allT, ignore_index=True); T.to_csv(f"{out}/r3_trades_{label}.csv", index=False)
