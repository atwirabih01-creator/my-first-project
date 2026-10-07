# Run the 4 locked rules together under prop-firm rules. Usage: RAW=<dir> python3 final.py <label> <outdir>
import sys, pandas as pd, numpy as np
from bt import Mkt, run, stats
from prop import portfolio, report, monte_carlo
RULES = {
    "NAS100": ("NYF", dict(tf="5min", k=0.3, rr=2, maxstop=0.5)),
    "XAUUSD": ("ABO", dict(tf="30min", win="W1", rr=3, bias=True, maxstop=0.6)),
    "GBPUSD": ("ABO", dict(tf="1h", win="W1", rr=3, bias=True, maxstop=0.6)),
    "GBPJPY": ("ABO", dict(tf="1h", win="W1", rr=3, pdfade=True, maxstop=0.6)),
}
label, out = sys.argv[1], sys.argv[2]
allT = []
for pair, (s, p) in RULES.items():
    T = run(Mkt(pair), s, p); T["pair"] = pair; allT.append(T)
    st = stats(T); ex = T.exit.value_counts().to_dict()
    print(f"{pair:7s} {s}: {st} exits={ex} avg_hold_min={T.mins.mean():.0f}")
    bs=np.random.default_rng(0).choice(T.R.values,(10000,len(T))).mean(1)
    print(f"        bootstrap 90% range of avg R: [{np.percentile(bs,5):.3f}, {np.percentile(bs,95):.3f}]  P(avg<=0)={(bs<=0).mean():.3f}  "
          f"STRICT PASS={'YES' if np.percentile(bs,5)>0 else 'NO'} | simple pass (avg>0)={'YES' if T.R.mean()>0 else 'NO'}")
T = pd.concat(allT, ignore_index=True)
P = portfolio(T)
print(f"\nPortfolio after prop rules: kept {len(P)} of {len(T)} trades")
daily, weekly, summ = report(P)
alldays = pd.date_range(T.time.min().normalize(), T.time.max().normalize(), freq="B", tz="UTC")
daily_full = daily.reindex(alldays, fill_value=0.0)
print(summ)
print("\nWEEKLY (week starting Monday):"); print(weekly.round(2).to_string())
print("\nBy pair:"); print(P.groupby("pair").R.agg(["count", "mean", "sum"]).round(2))
print("\nBy month (% at 1% risk):"); print(P.groupby(P.time.dt.to_period("M")).R.sum().round(1))
for tgt, d in [(8, 40), (10, 60), (5, 30)]:
    print(f"Challenge sim target +{tgt}% within {d} trading days, max loss -5%:", monte_carlo(daily_full, target=tgt, days=d))
P.to_csv(f"{out}/trades_{label}.csv", index=False); weekly.to_csv(f"{out}/weekly_{label}.csv")

print("\n=== RISK / PAIR VARIANTS (same trades, prop rules re-applied) ===")
for pairs, risk in [(["NAS100","XAUUSD","GBPUSD","GBPJPY"],1.0),(["NAS100","XAUUSD","GBPUSD","GBPJPY"],0.75),(["NAS100","XAUUSD","GBPUSD","GBPJPY"],0.5),
                    (["NAS100","XAUUSD"],1.0),(["NAS100","XAUUSD"],0.75),(["NAS100"],1.0)]:
    Pv = portfolio(T[T.pair.isin(pairs)], risk_pct=risk); d, w, s = report(Pv, risk_pct=risk)
    dfull = d.reindex(alldays, fill_value=0.0)
    print(f"{'+'.join(pairs):30s} risk {risk}%: total {s['total_pct']}% maxDD {s['max_dd_pct']}% worst day {s['worst_day']}% green days/wk {s['avg_green_days_wk']} "
          f"| 8% challenge (40d): {monte_carlo(dfull, target=8, days=40)} | 10%/60d: {monte_carlo(dfull, target=10, days=60)}")
