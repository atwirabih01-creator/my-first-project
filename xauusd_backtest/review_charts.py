"""Numbered review charts: trades the stricter rules keep, and old trades they now reject."""
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd
from backtest import load

HERE = Path(__file__).parent
OUT = HERE / "results" / "review"
OUT.mkdir(parents=True, exist_ok=True)
df = load(HERE / "XAUUSD_M5.csv").set_index("t")


def draw(ax, row, num, taken):
    day = pd.Timestamp(row.date)
    lon = row.session == "London"
    b0 = day + (pd.Timedelta(hours=3) if lon else pd.Timedelta(hours=9, minutes=30))
    start = day - pd.Timedelta(hours=4) if lon else day + pd.Timedelta(hours=7)
    end = (row.exit_time if taken else row.entry_time) + pd.Timedelta(hours=1)
    end = min(end, b0 + pd.Timedelta(hours=10))
    x = df.loc[start:end]
    w = pd.Timedelta(minutes=3)
    for t, r in x.iterrows():
        col = "#2a9d55" if r.c >= r.o else "#d1495b"
        ax.vlines(t, r.l, r.h, color=col, linewidth=0.6)
        ax.bar(t, max(abs(r.c - r.o), 0.05), bottom=min(r.o, r.c), width=w, color=col)
    if lon:
        ax.hlines([row.asia_hi, row.asia_lo], start, day, color="#555", linestyle="--", linewidth=1)
    ax.add_patch(plt.Rectangle((b0, row.box_lo), pd.Timedelta(hours=1), row.box_hi - row.box_lo,
                               alpha=0.15, color="#3366cc"))
    ax.axvline(row.break_time, color="#999", linestyle=":")
    if taken:
        ax.axhline(row.stop, color="#d1495b", linewidth=0.8)
        ax.axhline(row.target, color="#2a9d55", linewidth=0.8)
        ax.scatter([row.entry_time], [row.entry], marker="^" if row.side == "BUY" else "v",
                   s=90, color="black", zorder=5)
        ax.scatter([row.exit_time], [row.exit], marker="x", s=90, color="black", zorder=5)
        title = f"#{num}  {row.date}  {row.session} {row.side}  entry {row.entry_time:%H:%M}  -> {row.result} ({row.R:+.1f}R)"
    else:
        title = f"#{num}  {row.date}  {row.session} {row.side}  (now SKIPPED: break not clear enough)"
    ax.set_title(title, fontsize=10)
    ax.tick_params(labelsize=7)


new = pd.read_csv(HERE / "results" / "trades.csv", parse_dates=["entry_time", "exit_time", "break_time"])
old = pd.read_csv(Path(__import__("sys").argv[1]), parse_dates=["entry_time", "exit_time", "break_time"])
sk = pd.read_csv(HERE / "results" / "no_trade_days.csv")
unclear = set(sk[sk.reason.str.startswith("break candle")].date)
rejected = old[old.date.isin(unclear) & (old.date < "2026-09-01")]
kept = new.sample(6, random_state=1).sort_values("date")
rej = rejected.sample(6, random_state=1).sort_values("date")

for page, (rows, taken) in enumerate(((kept, True), (rej, False)), start=1):
    fig, axes = plt.subplots(3, 2, figsize=(16, 13))
    for i, (ax, (_, row)) in enumerate(zip(axes.flat, rows.iterrows())):
        draw(ax, row, (page - 1) * 6 + i + 1, taken)
    fig.suptitle(("Trades the stricter rules TAKE" if taken else "Trades the stricter rules now SKIP") +
                 "  |  blue box = 1h range, dashed = Asia high/low, dotted = break candle, "
                 "red/green line = stop/target", fontsize=11)
    fig.tight_layout()
    fig.savefig(OUT / f"review_page{page}.png", dpi=95)
print("ok")
