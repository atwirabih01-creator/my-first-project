"""Draw example trades and the equity curve so the owner can eyeball them."""
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

from backtest import load, equity

HERE = Path(__file__).parent
OUT = HERE / "results" / "charts"
OUT.mkdir(parents=True, exist_ok=True)

df = load(HERE / "XAUUSD_M5.csv").set_index("t")
tr = pd.read_csv(HERE / "results" / "trades.csv",
                 parse_dates=["entry_time", "exit_time", "break_time", "date"])


def draw(row, name):
    day = row.date
    start = day - pd.Timedelta(hours=4)
    end = max(row.exit_time + pd.Timedelta(minutes=30), row.entry_time + pd.Timedelta(hours=2))
    x = df.loc[start:end]
    fig, ax = plt.subplots(figsize=(14, 6))
    for t, r in x.iterrows():
        col = "#2a9d55" if r.c >= r.o else "#d1495b"
        ax.vlines(t, r.l, r.h, color=col, linewidth=0.7)
        ax.vlines(t, min(r.o, r.c), max(r.o, r.c), color=col, linewidth=2.5)
    ax.hlines([row.asia_hi, row.asia_lo], start, day, color="#555", linestyle="--")
    ax.text(start, row.asia_hi, " Asia high", va="bottom", fontsize=8)
    ax.text(start, row.asia_lo, " Asia low", va="top", fontsize=8)
    b0 = day + (pd.Timedelta(hours=3) if row.session == "London" else pd.Timedelta(hours=9, minutes=30))
    ax.add_patch(plt.Rectangle((b0, row.box_lo), pd.Timedelta(hours=1), row.box_hi - row.box_lo,
                               alpha=0.15, color="#3366cc"))
    lvl50 = row.fib_end + 0.5 * (row.fib_start - row.fib_end)
    lvl75 = row.fib_end + 0.75 * (row.fib_start - row.fib_end)
    ax.axhspan(min(lvl50, lvl75), max(lvl50, lvl75), xmin=0, xmax=1, alpha=0.08, color="orange")
    ax.axhline(row.stop, color="#d1495b", linewidth=1)
    ax.axhline(row.target, color="#2a9d55", linewidth=1)
    ax.axvline(row.break_time, color="#999", linestyle=":")
    ax.scatter([row.entry_time], [row.entry], marker="^" if row.side == "BUY" else "v", s=120, color="black", zorder=5)
    ax.scatter([row.exit_time], [row.exit], marker="x", s=120, color="black", zorder=5)
    ax.set_title(f"{day.date()}  {row.session} {row.side}  ->  {row.result}  ({row.R:+.2f}R)\n"
                 "blue box = 1h range, orange band = 0.5-0.75 fib zone, red line = stop, green line = target, "
                 "dotted = break candle, triangle = entry, x = exit", fontsize=9)
    ax.set_xlabel("New York time")
    fig.tight_layout()
    fig.savefig(OUT / name, dpi=110)
    plt.close(fig)


picks = {
    "1_london_win.png": tr[(tr.session == "London") & (tr.result == "target")].iloc[-1],
    "2_london_loss.png": tr[(tr.session == "London") & (tr.result == "stop")].iloc[-1],
    "3_newyork_win.png": tr[(tr.session == "New York") & (tr.result == "target")].iloc[-1],
    "4_newyork_loss.png": tr[(tr.session == "New York") & (tr.result == "stop")].iloc[-1],
}
for name, row in picks.items():
    draw(row, name)

fig, ax = plt.subplots(figsize=(12, 5))
for p, col in ((1.0, "#3366cc"), (1.5, "#d1495b")):
    ax.plot(tr.exit_time, equity(tr, p), label=f"{p}% risk per trade", color=col)
ax.axhline(10_000, color="#999", linestyle="--")
ax.set_title("Account balance over time, starting with $10,000")
ax.legend()
fig.tight_layout()
fig.savefig(OUT / "0_equity_curve.png", dpi=110)
print("saved to", OUT)
