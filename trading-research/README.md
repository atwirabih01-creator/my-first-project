# Day-trading research: GBPUSD, XAUUSD, NAS100, GBPJPY

**Open `report.html`** for the full write-up: market behaviour, every test, the final gold strategy in Doha time, and the weekly P&L.

## Result in short (version 2)
- 10 strategies were tested on every pair and every timeframe (5m, 15m, 30m, 1H), about 167 versions per pair, over 12 months. The best candidate for each pair was then checked on a second sealed test (Apr–Sep 2025).
- **Every candidate failed the second sealed test.** Version 1 called the gold breakout "proven"; that has been corrected.
- **XAUUSD:** the NY fair-value-gap strategy is the best candidate. Over 18 months at 1% risk it made +23.4% with a −7.3% drawdown. It is not proven; trade it only at 0.5% risk, after demo practice.
- **GBPJPY:** +6.6% with a −14.5% drawdown. Not safe for a 5% limit.
- **GBPUSD** (−4.3%) and **NAS100** (−11.2%): no edge found.

## What's in this folder
- `report.html`: the report.
- `scripts/`: the research code. `common.py` loads the price data, `bt.py` is the backtest engine and strategies, `study.py` is the market-behaviour study, `study2.py` is the session-by-session study, `run_all.py` / `run2.py` / `run3.py` / `jpy.py` are the strategy tests, `final3.py` runs the locked round-3 rules, `final.py` runs the locked rules under the prop-firm rules, and `dlp.py` downloads the data.
- `results/`: the raw outputs. `PREREGISTERED.txt` holds the rules as they were locked before the sealed exam. `final_holdout.txt` is the exam result, and `gold_weekly_full.csv` is the weekly P&L.

The price data (1-minute candles from Dukascopy) is not stored here because of its size. `scripts/dlp.py` downloads it again.
