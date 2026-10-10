# GBPUSD strategy

# ROUND 3 (10 Oct 2026): v3 "Quiet-Asia breakout" - CURRENT VERSION, sent to Agent 2

**Version:** v3 (2026-10-10). Author: Agent 1. Status: **proposed, frozen for Agent 2's backtest and the 2016-2018 hidden test.**
Built on design data Jan 2019 - Sep 2026 only (hidden 2016-2018 never opened). Research log with every pre-declared test and its result:
`round3/TESTS_DECLARED.md`. Quick-check code: `round3/v3_quiet_asia.py` (trades: `round3/v3_trades.csv`, summary `round3/out_v3.txt`).
Not financial advice. Trading carries real risk of loss.

## The idea in plain words
Some nights the Asian session is unusually quiet: the pound moves in a much narrower box than normal. That calm does not last.
When London opens, the big banks and funds arrive, and a quiet night is usually followed by a real move out of the box.
We do not guess the direction: we place an order on **both** sides of the night's box, and let London tell us which way it goes.
Because the box is small, the stop (the other side of the box) is small, and the target (twice the stop) is a normal-size London move.
Evidence: the quieter the night, the better this works (0.6x normal > 0.7x > 0.8x > 0.9x; on ordinary nights it loses). That "more
compression, more expansion" pattern is what makes us think it is a real effect and not luck. It made money in trending and in ranging
markets, and in rising and falling volatility (weakest when volatility is falling).

## Clocks (rules are defined on London's and New York's own clocks)
| Step | London | New York | Doha |
|---|---|---|---|
| Mark the Asia box | 00:00-06:59 | 19:00-01:59 (prev. evening) | 02:00-08:59 (UK summer) / 03:00-09:59 (UK winter) |
| Orders live | 07:00-11:59 | 02:00-06:59 | 09:00-13:59 (UK summer) / 10:00-14:59 (UK winter) |
| Forced close | - | close of the 15:59 bar | 22:59 (US summer) / 23:59 (US winter) |
UK summer time = last Sunday of March to last Sunday of October. US summer time = 2nd Sunday of March to 1st Sunday of November.
In the 2-3 "mismatch" weeks a year (mid-March, late October) London is only 4 hours ahead of New York, so the London times above fall one
hour later on the New York clock (e.g. orders live 03:00-07:59 NY). Always use the London clock for the box and the order window.

## Rules (1-minute chart; one trade a day at most)
1. **Trading day** = 17:00 New York to 17:00 New York. Weekend bars belong to Monday.
2. **Mark the Asia box:** the highest high (**Asia High**) and lowest low (**Asia Low**) of all 1-minute bars from 00:00 to 06:59 London time.
   **Asia range** = Asia High - Asia Low.
3. **Quiet-night test (the setup):** compare today's Asia range with the **median of the Asia ranges of the previous 20 trading days**.
   Trade only if today's Asia range is **smaller than 0.7 x that median**. Otherwise no trade today.
4. **Orders (at 07:00 London):** a **buy stop** at Asia High and a **sell stop** at Asia Low. An order fills when price trades **beyond** the level.
   If the price jumps past the level, the fill is the first available price (in the test: the open of that minute).
5. **Confirmation = the fill.** The first order to fill is the trade. **Cancel the other order at once.**
   If both levels are broken inside the same 1-minute bar, no trade that day.
6. **Stop loss:** the other side of the box (long: Asia Low; short: Asia High). Minimum 3 pips (in 2019-2026 the smallest was 8.1 pips).
7. **Take profit:** 2 x the risk from the fill price (long: fill + 2 x (fill - Asia Low); short: fill - 2 x (Asia High - fill)).
   No partial profits, no break-even move.
8. **Order expiry:** if neither order has filled by the end of the 11:59 London bar, cancel both. No trade today.
9. **Forced close:** any open trade is closed at the **close of the 15:59 New York 1-minute bar**.
10. **Size:** risk 1% of the account: position size = 1% of balance / (stop distance in pips x pip value).
11. **No-trade days:** the data or your platform shows a hole of more than 15 minutes between 19:00 NY the evening before and 16:00 NY,
    or the day has fewer than 1,300 one-minute bars (holidays, half days). News days are **traded** (the owner decides whether to skip them).
12. **Daily limit:** 1 trade. After it closes (stop, target or 15:59 NY), stop for the day.

## Agent 1 quick check (design data Jan 2019 - Sep 2026, cost 1.5 pips per trade, stop first if stop and target hit in the same minute)
| Year | Trades | Win rate | Total R | R per trade |
|---|---|---|---|---|
| 2019 | 46 | 33% | -5.8 | -0.13 |
| 2020 | 47 | 38% | +5.2 | +0.11 |
| 2021 | 36 | 42% | +5.2 | +0.14 |
| 2022 | 36 | 50% | +15.5 | +0.43 |
| 2023 (Feb-Jul data gaps) | 17 | 47% | +5.5 | +0.33 |
| 2024 | 42 | 45% | +8.8 | +0.21 |
| 2025 | 42 | 45% | +10.6 | +0.25 |
| 2026 (Jan-Sep) | 34 | 35% | -1.5 | -0.04 |
| **All** | **300** | **41%** | **+43.5** | **+0.145** |
Profit factor 1.23; biggest drop -11.8 R; longest losing run 9; avg win +1.85 R, avg loss -1.05 R; exits: 167 stop, 117 target, 16 at 15:59 NY.
Longs 152 trades +21.9 R; shorts 148 trades +21.7 R. At 3-pip cost: +17.3 R (+0.058 R/trade), still 6 of 8 years positive (2019 -11.0 R, 2026 -4.7 R).
Without the best 5 trades: +33.7 R. Bootstrap chance the true average is zero or less: 4% (before allowing for the ~47 checks made this round).

## Target bar: what it meets and misses (honest)
| Point | Result | Met? |
|---|---|---|
| Positive in >= 6 of 8 years | 6 of 8 (2019 -5.8 R, 2026 -1.5 R) | Yes |
| No year worse than -8 R | worst -5.8 R | Yes |
| Positive at double cost (3 pips) | +17.3 R, but only +0.058 R/trade and 2019 -11.0 R | Yes, thinly |
| Longs and shorts both positive | +21.9 R / +21.7 R | Yes |
| Longest losing run <= 8 | **9** (2020) | **No (by one)** |
| Edge >= +0.08 R per trade | +0.145 R | Yes |
| Positive without best 5 | +33.7 R | Yes |
| >= 60 trades a year | **about 39 a year** | **No** |

## Known weaknesses and doubts
- Only ~39 trades a year, so one year is ~40 trades: a single year can easily be negative by chance (2019 was).
- Win rate 41%: losing runs of 7-9 will happen. The stop is small (median 17.7 pips), so costs take ~0.085 R per trade; with a worse broker
  (3 pips) the edge shrinks to about a third.
- Wednesday trades made +27 R of the +43.5 R; Monday, Tuesday and Friday are near zero. Not filtered (that would be fitting), but it is a warning.
- It was the best of ~47 checks this round. Some of its edge may be luck from looking at many ideas; the 2016-2018 hidden test is the real judge.
- 82% of trades fill in the first London hour (02:00-03:00 NY); fills at the open are assumed at the level, real fills may be a little worse.

## Backup ideas (not ready)
1. Month-end London 4pm fix reversal: +20 R on 70 trades, but only the shorts work and it depends on a few trades.
2. Round-number push-through: a real effect (price breaks through 00/50 levels more than through other levels in 7/8 years), but it nets ~0 before costs.

---

## Status (round 2, 9 Oct 2026): **no v2 proposed. Recommendation: pause GBPUSD.**
I re-did the research on the 21 design months (Oct 2024 – Jun 2026) with the corrected clock and tested 7 rule variants,
each fixed in advance. That includes v1 with a market-mood switch (trade only after range-bound days) and a minimum stop.
**None was positive in both design years.** Details: `research.md` sections 6–7.
I am not sending a v2 to backtest. A rule set that already fails on design data would only use up hidden test A
(Oct 2023 – Sep 2024), which can be used only once.

## Settled points (apply to any future GBPUSD version and to re-runs of v1)
1. **Forced-close price:** the trade closes at the **close of the last 1-minute bar before the forced-close time**
   (for v1: the close of the 15:59 NY bar). Same as Agent 2's reading.
2. **Sunday bars before 17:00 NY** (and any other weekend bars) **belong to Monday's trading day.** They count toward Monday's
   levels, never as a day of their own. Friday stays Monday's "previous day".
3. **The day after a holiday or data gap:** if the previous trading day has fewer than 1,300 one-minute bars (a normal day has about 1,435),
   its high/low is not real, so **no trade that day**. The same applies to a day that itself has fewer than 1,300 bars.
   In the design data this affects 25 Dec 2024, 25 Dec 2025, 7 Nov 2024 (missing the FOMC hour), 18 May 2026 (data gap), the partial first day 1 Oct 2024, and the day after each.

---

# v1 "New York false break of yesterday's high/low": DROPPED (9 Oct 2026)

**Version:** v1 (2026-10-09). Author: Agent 1 (Trading Research Lead). Status: **DROPPED** by Agent 2 (lost −21.9 R in Oct 2024 – Sep 2025; see feedback.md).
Research behind it: round-1 research (Oct 2025–Jun 2026 only; now replaced by the round-2 research.md). Quick-check code: `research/08_level_sweeps.py` (function `sweep_level` with `pd_lv`)
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
