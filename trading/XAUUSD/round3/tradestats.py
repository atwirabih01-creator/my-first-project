import numpy as np, pandas as pd
def summarize(T, label, cost=0.40, show=True):
    T = T.copy(); T["R"] = (T.gross - cost) / T.risk; T["y"] = pd.to_datetime(T.day).dt.year
    lines = [f"--- {label} (cost {cost})"]
    rows = []
    for y, g in T.groupby("y"): rows.append(one(g.R.values, str(y)))
    rows.append(one(T.R.values, "ALL"))
    df = pd.DataFrame(rows)
    lo = T[T.side > 0].R; sh = T[T.side < 0].R
    w5 = T.R.sort_values().iloc[:-5].sum()
    R2 = ((T.gross - 2 * cost) / T.risk)
    yrs_pos = int((df.totR.iloc[:-1] > 0).sum()); worst = df.totR.iloc[:-1].min()
    lines.append(df.to_string(index=False))
    lines.append(f"longs {len(lo)} {lo.sum():+.1f}R | shorts {len(sh)} {sh.sum():+.1f}R | without best5 {w5:+.1f}R | "
                 f"double cost {R2.sum():+.1f}R ({R2.mean():+.3f}/tr) | yrs+ {yrs_pos}/8 worst {worst:+.1f} | trades/yr {len(T)/7.75:.0f}")
    if show: print("\n".join(lines))
    return "\n".join(lines), T, df
def one(r, name):
    eq = np.cumsum(r); dd = (eq - np.maximum.accumulate(np.r_[0, eq])[1:]).min() if len(r) else 0
    run = best = 0
    for x in r:
        run = run + 1 if x <= 0 else 0; best = max(best, run)
    pf = r[r > 0].sum() / -r[r <= 0].sum() if (r <= 0).any() else np.inf
    return dict(period=name, n=len(r), win=f"{(r>0).mean()*100:.0f}%", totR=round(r.sum(), 1), perTr=round(r.mean(), 3),
                PF=round(pf, 2), maxDD=round(dd, 1), lrun=best)
