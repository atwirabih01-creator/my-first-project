# Day-trading research: GBPUSD, XAUUSD, NAS100, GBPJPY

**Open `report.html`** for the full write-up: market behaviour, every test, the final gold strategy in Doha time, and the weekly P&L.

## Result in short
- **XAUUSD (gold): one proven strategy, the Gold London Breakout.** It made money in all three separate test periods (Apr–Jul 2026, Jul–Oct 2026, and a sealed Oct 2025–Mar 2026 exam). Over 12 months at 1% risk: +18.8%, worst drawdown −3.1%, worst day −1.03%.
- **NAS100: on watch.** It worked from March to September only. Track it on demo; don't use it in the challenge.
- **GBPUSD, GBPJPY: no edge found.** Their best rules failed the sealed exam. Don't trade them in the challenge.

## What's in this folder
- `report.html`: the report.
- `scripts/`: the research code. `common.py` loads the price data, `bt.py` is the backtest engine and strategies, `study.py` is the market-behaviour study, `run_all.py` / `run2.py` / `jpy.py` are the strategy tests, `final.py` runs the locked rules under the prop-firm rules, and `dlp.py` downloads the data.
- `results/`: the raw outputs. `PREREGISTERED.txt` holds the rules as they were locked before the sealed exam. `final_holdout.txt` is the exam result, and `gold_weekly_full.csv` is the weekly P&L.

The price data (1-minute candles from Dukascopy) is not stored here because of its size. `scripts/dlp.py` downloads it again.
