"""04: descriptive check of the strongest finding: big 09:30 gaps tend to be faded during the cash session.
Moves are measured AGAINST the gap ("fade" = positive), in ATR units, from the 09:30 open (and from 10:00) to the 15:59 close."""
from levels import *
E = pd.read_pickle("/tmp/claude-0/-home-user-my-first-project/1c8d33d7-d94d-5131-95fb-13a566ad2900/scratchpad/ndx_open_ev.pkl")
E["fade_open"] = -np.sign(E.gap_pct) * (E.c1600 - E.o930) / E.atr_pts
E["fade_1000"] = -np.sign(E.gap_pct) * (E.c1600 - E.c30) / E.atr_pts
E["dir"] = np.where(E.gap_pct > 0, "gap UP (fade=short)", "gap DOWN (fade=long)")
E["crash"] = (E.index >= "2025-03-01") & (E.index < "2025-06-01")
med = 1.282
E["vol"] = np.where(E.atr_pct > med, "volatile", "calm")
def summ(q):
    return pd.Series(dict(n=len(q), fade_pct=100 * (q.fade_open > 0).mean(), fade_open=q.fade_open.mean(), med=q.fade_open.median(),
                          fade_from_1000=q.fade_1000.mean(), fade1000_pct=100 * (q.fade_1000 > 0).mean()))
for th in [0.25, 0.35, 0.5, 0.75, 1.0]:
    q = E[E.gap_atr.abs() > th]
    print(f"\n=== |gap| > {th} ATR")
    print(q.groupby(["year", "dir"]).apply(summ, include_groups=False).round(2).to_string())
q = E[E.gap_atr.abs() > 0.5]
print("\n=== |gap| > 0.5 ATR by market mood")
print(q.groupby(["vol"]).apply(summ, include_groups=False).round(2).to_string())
print(q.groupby(["year", "vol"]).apply(summ, include_groups=False).round(2).to_string())
print(q.groupby(["crash"]).apply(summ, include_groups=False).round(2).to_string())
print("\n=== |gap| > 0.5 ATR by news vs normal")
print(q.groupby(q.event == "normal").apply(summ, include_groups=False).round(2).to_string())
print("\n=== |gap| > 0.5 ATR by quarter")
print(q.groupby(q.index.to_period("Q")).apply(summ, include_groups=False).round(2).to_string())
print("\n=== |gap| <= 0.25 ATR (small gaps), for contrast")
print(E[E.gap_atr.abs() <= 0.25].groupby(["year", "dir"]).apply(summ, include_groups=False).round(2).to_string())
