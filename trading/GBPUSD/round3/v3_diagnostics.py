"""Descriptive splits of v3 trades (NOT used to add filters)."""
import numpy as np, pandas as pd
import common3 as c
G = c.load_matrix("GBPUSD"); days = G["days"]; P = c.PIP; off = G["ldn_off"]
T = pd.read_csv("v3_trades.csv", parse_dates=["day"])
idx = pd.Index(days).get_indexer(T.day)
CF = G["C"].copy()
for i in range(len(CF)):
    r = CF[i]; mm = np.isnan(r)
    if mm.any():
        ii = np.where(~mm, np.arange(1440), 0); np.maximum.accumulate(ii, out=ii); CF[i] = r[ii]
rng = pd.Series(np.nanmax(G["H"][:, 60:c.col_ny(16)], 1) - np.nanmin(G["L"][:, 60:c.col_ny(16)], 1))
cl = pd.Series(CF[:, c.col_ny(16) - 1])
er10 = ((cl.shift(1) - cl.shift(11)).abs() / cl.diff().abs().rolling(10).sum().shift(1)).values
er_med = pd.Series(er10).rolling(250, min_periods=100).median().values
vr = (rng.rolling(5).mean().shift(1) / rng.rolling(100).mean().shift(1)).values
def shock(a, b):
    mv = np.abs(CF[np.arange(len(days)), np.broadcast_to(b, (len(days),)) - 1] - CF[np.arange(len(days)), np.broadcast_to(a, (len(days),)) - 1])
    med = pd.Series(mv).rolling(20, min_periods=10).median().shift(1).values
    return mv > 3 * med
news = shock(c.col_ldn(7, 0, off), c.col_ldn(7, 15, off)) | shock(c.col_ldn(12, 0, off), c.col_ldn(12, 15, off)) | \
       shock(c.col_ny(8, 30), c.col_ny(8, 45)) | shock(c.col_ny(14), c.col_ny(14, 15))
T["trend"] = np.where(er10[idx] >= er_med[idx], "trending (ER10>=median)", "ranging")
T["vol"] = np.where(vr[idx] >= 1, "vol rising (ATR5>=ATR100)", "vol falling")
T["news"] = np.where(news[idx], "release-shock day", "no shock")
T["wd"] = T.day.dt.day_name().str[:3]
T["hour"] = T.entry_ny.str[:2] + ":00 NY"
out = []
for col in ["trend", "vol", "news", "wd", "hour"]:
    g = T.groupby(col).R.agg(["size", "sum", "mean"]).round(3)
    g["win%"] = T.groupby(col).R.apply(lambda s: round((s > 0).mean() * 100))
    out.append(g.to_string())
print("\n\n".join(out)); open("out_v3_diag.txt", "w").write("\n\n".join(out))
