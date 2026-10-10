# Paper-trading journal: weekly report

Simulated trades only, no orders were placed. Rules exactly as in each market's FINAL-STRATEGY.md.
Prices: Hyperliquid xyz:XYZ100 (Nasdaq 100) and xyz:GOLD, 1-minute candles. R = the 1% risked per trade.
Costs as in the backtests (Nasdaq 2.0 points, gold 0.40 USD). 'After est. fees' assumes 0.05% of the position
value per side (an assumption, not your broker's real fee).

## NASDAQ

Backtest expectation: +0.04 to +0.08 R per trade, about 1 trade every 4 days.

| Week | Trades | Wins | Losses | Result (R) | Running total (R) | After est. fees (R) |
|---|---|---|---|---|---|---|
| 2026-10-05/2026-10-11 | 1 | 1 | 0 | +0.11 | +0.11 | -0.00 |

Total: 1 trades, 100% winners, +0.11 R (+0.111 R per trade); after est. fees -0.00 R.

Trades:

| Date | Direction | Entry (Doha) | Entry | Stop | Exit (Doha) | Exit | How it ended | R |
|---|---|---|---|---|---|---|---|---|
| 2026-10-09 | SHORT | 16:35 | 30910.0 | 31161.66 | 23:00 | 30880.0 | 15:59 close | +0.11 |

## GOLD

Backtest expectation: about +0.02 (unseen years) to +0.09 R per trade (2019-26), most weekdays.

No trades yet.

## Days without a trade

| Date | Market | Reason |
|---|---|---|
| 2026-10-08 | GOLD | no breakout by 11:59 London |
| 2026-10-08 | NASDAQ | gap not bigger than 0.5 x ATR |
| 2026-10-09 | GOLD | no breakout by 11:59 London |
