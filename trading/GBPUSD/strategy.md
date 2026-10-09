# GBPUSD strategy: v1, "New York false break of yesterday's high/low"

**Version:** v1 (2026-10-09). Author: Agent 1 (Trading Research Lead). Status: **waiting for Agent 2's backtest.**
Research behind it: `research.md` section 6. Quick-check code: `research/08_level_sweeps.py` (function `sweep_level` with `pd_lv`)
and `research/09_pd_sweep_ny_robustness.py` (the "BASE" line). Not financial advice.

## The idea in one paragraph
Stop-loss orders gather just above yesterday's high and just below yesterday's low. In the busy New York morning, price often
pokes through one of these levels and then fails. We wait until a 15-minute candle **closes back on the other side** of the level
(proof that the break failed), then trade back the other way, with the stop just past the fake move's extreme and the target at
twice the risk.

## Clocks
All times are **New York local time**, so US summer time is handled automatically.
Doha = New York + 7 hours (US summer time, 2nd Sunday of March to 1st Sunday of November), New York + 8 hours (US winter time).

| Event | New York | Doha (US summer) | Doha (US winter) |
|---|---|---|---|
| Trading day starts / ends | 17:00 | 00:00 | 01:00 |
| Signal window opens | 08:00 | 15:00 | 16:00 |
| Last signal candle closes | 11:00 | 18:00 | 19:00 |
| Forced close | 16:00 | 23:00 | 00:00 (midnight) |

## Rules

**1. Mark before the window (daily levels).**
- Trading day = 17:00 New York to 17:00 New York the next day. Monday's day starts Sunday 17:00 NY.
- **PDH** = highest price of the previous trading day. **PDL** = lowest price of the previous trading day.
  (Monday uses Friday's day. Use the same price feed you trade on; the test data are bid prices.)

**2. Chart.** 15-minute candles, aligned to the clock (08:00, 08:15, 08:30, ...).

**3. Signal window.** Only the 12 candles that open from 08:00 to 10:45 New York (so they close by 11:00 NY).
Nothing before 08:00 NY counts for the setup or the stop.

**4. Setup (what must happen first).**
- **Short setup:** any candle in the window has its high **above PDH** (by any amount).
- **Long setup:** any candle in the window has its low **below PDL** (by any amount).
- The setup and the confirmation can be on the same candle (a long wick through the level that closes back).

**5. Confirmation (entry signal).** Check each window candle when it closes:
- **Short:** short setup has happened (on this candle or an earlier window candle) AND this candle **closes below PDH**.
- **Long:** long setup has happened AND this candle **closes above PDL**.
- If both qualify on the same candle (very rare), take the short (check the short first).

**6. Entry.** Market order at the close of the confirmation candle (in practice the open of the next 15-minute candle).

**7. Stop loss.**
- Short: **highest high of all window candles so far (08:00 NY up to and including the confirmation candle) + 2 pips.**
- Long: **lowest low of all window candles so far − 2 pips.**
- No minimum or maximum stop size in v1.

**8. Take profit.** **2 × the stop distance** from entry (2R). No partial profits. No break-even move. Stop and target are never moved.

**9. Position size.** Risk exactly **1% of the account** per trade: size = (1% of balance) ÷ (distance from entry to stop).

**10. Daily limits.** **Maximum 1 trade per day.** After that trade closes (win, loss or time), stop for the day.
If no confirmation by the candle closing at 11:00 NY, no trade that day.

**11. Forced close.** Any open trade is closed at **16:00 New York** at the market price. Nothing is held overnight.

**12. No-trade conditions.** None in v1. News days are **traded and reported separately**, so the owner can decide about them
(the list of news dates is in `research/news_calendar.py`). If the price feed is missing for the window, skip the day.

## Notes for the backtest (Agent 2)
- Costs: 1.5 pips per round trip (README). The quick check charged this on every trade.
- If the stop and the target are both touched inside the same 1-minute bar, count the **stop** first (cautious).
- Signals are decided only on closed 15-minute candles; the stop uses only candles already closed. There is no look-ahead.
- Very small stops happen (smallest seen 3.2 pips; 14 of 66 trades had stops of 8 pips or less), where the 1.5-pip cost is a large share
  of the risk. It would be useful to report results by stop size.
- Please report: news days vs normal days, longs vs shorts, by month, and by stop size.

## My quick check on the development data (1 Oct 2025 – 30 Jun 2026), NOT tuned
66 trades, 48% won, +12.6 R total (average +0.19 R), profit factor 1.38, worst drawdown −3.9 R, both halves of the period positive.
Exits: 21 target, 27 stop, 17 forced close at 16:00 NY, 1 at end of data.
**Evidence is weak to moderate** (about 11% bootstrap chance the true average is zero or below; ~11 ideas/settings were tried before picking this one).
The hidden Jul–Sep 2026 data is the real test.
