# XAUUSD (gold) strategy

# v2 "Go with London's break of the Asia range, wide stop" (1R)

**Version:** v2 (2026-10-09). Author: Agent 1 (Trading Research Lead). Status: **sent to Agent 2 for backtest (new hidden test: Oct 2022 – Sep 2023).**
Research: `research.md` section 8. Quick-check code: `research/10_v2_check.py` (variant V45). This is research, not financial advice. Trading carries real risk of loss.

## What changed from v1, and why
v1's direction held in every period before costs, but its stops (entry to the middle of the Asia range) were tiny when gold was cheaper
(typical 6 USD in Oct 2023 – Sep 2024), so the 0.40 USD cost ate the edge. Two cost-driven changes, decided from cost logic before testing:
1. **Wider stop: the opposite side of the Asia range** instead of the middle. The stop is about twice as far, so the cost is about half as large a share of the risk.
   The logic of the trade stays the same: if price crosses the whole Asia range against us, the break has clearly failed.
2. **Minimum stop = 20 × the round-trip cost = 8 USD.** Then the cost is at most 5% of the risk (0.05 R), below the edge measured before costs in every period.
   The multiple was chosen once and not tuned. **If your broker's cost is higher, the minimum scales with it** (20 × your round-trip cost).
No direction, hour, weekday or news filter was added (they flip between periods). Longs and shorts are both traded.

## Clocks
| Event | Local time | Doha |
|---|---|---|
| Trading day starts (gold reopens) | 18:00 New York (the evening before) | 01:00 (US summer) / 02:00 (US winter) |
| Asia range starts | 00:00 London | 02:00 (UK summer) / 03:00 (UK winter) |
| Asia range ends, signal window opens | 07:00 London | 09:00 (UK summer) / 10:00 (UK winter) |
| Last signal candle closes | 12:00 New York | 19:00 (US summer) / 20:00 (US winter) |
| Forced close | 16:00 New York | 23:00 (US summer) / 00:00 midnight (US winter) |
UK summer time: last Sunday of March → last Sunday of October. US summer time: 2nd Sunday of March → 1st Sunday of November.
Each step uses its own city's clock, so all summer-time changes (including the weeks when the US and UK switch on different dates) are handled automatically.

## Rules
**1. Mark the Asia range (1-minute chart).** **AH** = highest and **AL** = lowest price of the 1-minute bars from 00:00 to 06:59 London on the trading day's London date.
Use the same price feed you trade on (test data: bid prices).

**2. Chart for signals.** 15-minute candles aligned to the clock (07:00, 07:15, 07:30 London, ...).

**3. Signal window.** Candles that open at 07:00 London or later and close at or before 12:00 New York (last candle 11:45–12:00 NY).

**4. Signal.** Check each window candle when it closes, in time order. The **first** candle that closes outside the Asia range is the day's only candidate:
- **Long:** it closes **above AH** (strictly). **Short:** it closes **below AL** (strictly). Wicks without a close beyond do not count.

**5. Entry.** Market order at the close of the signal candle (in practice the open of the next candle).
**Buy orders fill at the ask price, which is the chart (bid) price plus the spread**; the test charges this through the cost per trade.

**6. Stop loss.** Long: at **AL**. Short: at **AH**. Risk = distance from entry to the stop.
**If price jumps past the stop (a gap or a very fast move), the fill is worse and the loss can be more than 1R.**

**7. Minimum stop.** If the risk is **smaller than 8 USD** (= 20 × the 0.40 USD round-trip cost), **no trade that day**.
Do not wait for a later candle: only the first close outside the range counts.

**8. Take profit.** At **1 × the risk** from entry (1R). No partial profits, no break-even move; stop and target are never moved.

**9. Position size.** Risk exactly **1% of the account**: size (ounces) = (1% of balance) ÷ (risk in USD). Round down to the broker's lot step.

**10. Daily limit.** Maximum **1 trade per day**. If no candle closes outside the range by 12:00 NY, no trade.

**11. Forced close.** Any open trade is closed at **16:00 New York**. Test price = **close of the last 1-minute bar before 16:00 NY** (normally 15:59). Nothing is held overnight.

**12. No-trade conditions.**
- **Thin days:** no trade on a day with fewer than **1,300 one-minute bars** (normal: 1,380; US-holiday early closes ~1,230; 24 Dec ~1,180; data gaps),
  **and no trade on the next trading day that has prices** (e.g. 26 Dec and 2 Jan are skipped after a thin 24 Dec / 31 Dec; 25 Dec and 1 Jan have no prices).
- If 00:00–06:59 London has fewer than 300 one-minute bars, skip the day.
- **News days are traded** and reported separately (dates: `research/news_calendar.py`; PPI dates doubtful).

**13. Trading day and weekends.** Trading day = 17:00 NY to 17:00 NY; gold reopens 18:00 NY. Sunday bars belong to **Monday**. Monday's Asia range is 00:00–06:59 London on Monday.

## Notes for the backtest (Agent 2)
- Costs 0.40 USD per round trip, and please show 0.80 USD. At 0.80 USD the rule's own logic says the minimum would be 16 USD; the quick check below keeps 8 USD at both costs (a stress test of the same rules).
- Stop and target in the same 1-minute bar: stop first. A bar that opens beyond the stop fills at its open.
- My v1 replica on the full file gives 232 trades / −1.1 R in A vs your 233 / −0.21 R: one trade differs, I believe 2 Oct 2023 (my first loaded day, which I skip because it has no previous day in the file).
- Please report by period, longs vs shorts, news vs normal days, stop size, and exit type (about 46% of trades end at the 16:00 forced close).

## My quick check (all of Oct 2023 – Sep 2026, 0.40 USD cost)
| Period | Trades | Win rate | Total | PF | Max drawdown | Longest losing run | At 0.80 USD |
|---|---|---|---|---|---|---|---|
| A Oct 2023 – Sep 2024 | 176 | 55.7% | +15.9 R | 1.27 | −6.7 R | 5 | +10.5 R (PF 1.17) |
| Y1 Oct 2024 – Sep 2025 | 217 | 55.8% | +10.8 R | 1.16 | −10.7 R | 5 | +6.4 R (PF 1.09) |
| Y2 Oct 2025 – Jun 2026 | 157 | 54.8% | +10.8 R | 1.25 | −11.9 R | 5 | +9.6 R (PF 1.22) |
| B Jul – Sep 2026 | 59 | 54.2% | +8.4 R | 1.57 | −2.5 R | 2 | +7.9 R (PF 1.53) |
| All 36 months | 609 | 55.3% | +45.9 R | 1.25 | −11.9 R (−11.4%) | 5 | +34.4 R (PF 1.18) |
Longs: A +16.2, Y1 +12.1, Y2 +3.2, B +5.4 R. Shorts: A −0.3, Y1 −1.3, Y2 +7.6, B +3.0 R. Positive months 25 of 36. Exits: 186 target, 143 stop, 280 forced close.
**Evidence: moderate, but all of it is on data already seen.** 45 variants tried in total (3 new this round); v2 was picked from 3 declared together.
Only the new hidden year (Oct 2022 – Sep 2023, gold ~1,620–2,080 USD) and a forward test can prove it.

---

# v1 "Go with London's break of the Asia range" (1R): IMPROVE → superseded by v2

**Version:** v1 (2026-10-09). Author: Agent 1 (Trading Research Lead). Status: **IMPROVE (Agent 2, see feedback.md) → superseded by v2.** Kept for the record.
Research: `research.md` (sections 3, 5, 6). Quick-check code: `research/09_v1_check.py` (written from these rules only).
This is research, not financial advice. Trading carries real risk of loss.

## The idea in one paragraph
Gold trades in a tight range during the Asian night. When London opens, the big gold dealers in London start trading and price usually
breaks out of that Asian range (the high side on 63–67% of days, the low side on 49–55%). On gold, unlike GBPUSD, these breaks tend to **keep going**:
fading them lost money in both design years, and going with them made money in both. So we wait for the first 15-minute candle that **closes**
outside the Asia range, trade in that direction, put the stop at the middle of the Asia range (if price gets back there, the break has failed),
and take profit at the same distance (1R).

## Clocks
The Asia range and the start of the window are on **London time**. The end of the window and the forced close are on **New York time**.
Using each city's own clock handles all summer-time changes automatically (including the weeks in March and October/November when the US and UK switch on different dates).

| Event | Local time | Doha |
|---|---|---|
| Trading day starts (gold reopens) | 18:00 New York (the evening before) | 01:00 (US summer) / 02:00 (US winter) |
| Asia range starts | 00:00 London | 02:00 (UK summer) / 03:00 (UK winter) |
| Asia range ends, signal window opens | 07:00 London | 09:00 (UK summer) / 10:00 (UK winter) |
| Last signal candle closes | 12:00 New York | 19:00 (US summer) / 20:00 (US winter) |
| Forced close | 16:00 New York | 23:00 (US summer) / 00:00 midnight (US winter) |
UK summer time: last Sunday of March → last Sunday of October. US summer time: 2nd Sunday of March → 1st Sunday of November.

## Rules

**1. Mark the Asia range (1-minute chart).**
- **Asia high (AH)** = highest price from 00:00 to 06:59 London (the 1-minute bars that open from 00:00 up to and including 06:59), on the trading day's London date.
- **Asia low (AL)** = lowest price in the same period.
- **Asia middle (MID)** = (AH + AL) ÷ 2.
- Use the same price feed you trade on (the test data are bid prices).

**2. Chart for signals.** 15-minute candles aligned to the clock (07:00, 07:15, 07:30 London, ...).

**3. Signal window.** Candles that open at **07:00 London or later** and **close at or before 12:00 New York**.
(The last candle is 11:45–12:00 NY. The window is 5 hours long when London is 5 hours ahead of New York, and 4 hours in the
few weeks a year when the gap is 4 hours.)

**4. Signal (setup and confirmation are one step).** Check each window candle when it closes, in time order. The **first** candle that closes outside the Asia range gives the signal:
- **Long:** the candle **closes above AH** (strictly higher).
- **Short:** the candle **closes below AL** (strictly lower).
Wicks beyond the range without a close beyond do not count. Only the first such candle of the day counts; later ones are ignored.

**5. Entry.** Market order at the close of the signal candle (in practice: the open of the next candle).

**6. Stop loss.** At **MID** (the middle of the Asia range). Risk = distance from entry to MID.

**7. Take profit.** At **1 × the risk** from entry (1R): long target = entry + (entry − MID); short target = entry − (MID − entry).
No partial profits, no break-even move, stop and target are never moved.

**8. Position size.** Risk exactly **1% of the account** per trade: size (ounces) = (1% of balance) ÷ (entry − stop distance in USD).
Round down to the broker's smallest lot step.

**9. Daily limit.** **Maximum 1 trade per day.** After it closes (target, stop or forced close), stop for the day.
If no candle in the window closes outside the Asia range, there is no trade that day.

**10. Forced close.** Any open trade is closed at **16:00 New York**. Price for testing = the **close of the last 1-minute bar before 16:00 NY**
(normally the 15:59 bar). Nothing is ever held overnight.

**11. No-trade conditions.**
- **Thin days:** no trade on a day with **fewer than 1,300 one-minute bars** (a normal gold day has 1,380; US-holiday early closes have about 1,230;
  24 Dec about 1,180; data gaps fewer), **and no trade on the day after such a day.**
- If the Asia period (00:00–06:59 London) has fewer than 300 one-minute bars, skip the day (missing data).
- **News days are traded** and reported separately so the owner can decide (dates: `research/news_calendar.py`; PPI dates are doubtful).

**12. Trading day and weekends.** Trading day = 17:00 New York to 17:00 New York. Gold reopens at 18:00 NY. Bars on Sunday (from 18:00 NY) belong to **Monday's** day.
Monday's Asia range is 00:00–06:59 London on Monday.

## Notes for the backtest (Agent 2)
- Costs: 0.40 USD per round trip (README); please also show 0.80 USD.
- If stop and target are both touched inside the same 1-minute bar, count the **stop** (cautious).
- Signals use only closed 15-minute candles; the Asia range is complete before the window opens. No look-ahead.
- Small stops happen (smallest seen 3.8 USD; a quarter of trades under 10 USD), where the cost is a bigger share of the risk. Please report results by stop size.
- Please report: news days vs normal days, longs vs shorts, by month, by entry hour (07:00 London hour vs later), and by stop size.

## My quick check on the design data (2 Oct 2024 – 30 Jun 2026), 0.40 USD cost
| Period | Trades | Win rate | Total | PF | Max drawdown | Longest losing run | At 0.80 USD |
|---|---|---|---|---|---|---|---|
| Y1 Oct 2024 – Sep 2025 | 218 | 54.1% | +12.4 R | 1.13 | −8.5 R | 7 | +4.2 R (PF 1.04) |
| Y2 Oct 2025 – Jun 2026 | 157 | 56.7% | +15.8 R | 1.27 | −10.3 R | 5 | +13.6 R (PF 1.23) |
| All 21 months | 375 | 55.2% | +28.2 R | 1.18 | −10.3 R | 7 | +17.8 R (PF 1.11) |
**Evidence: weak to moderate.** 42 variants were tried in total; this one was picked from 3 related variants declared together. The edge is small
(about +0.075 R per trade), Y1 is thin at double cost, and news-day results flip between the years (−3.3 R, +7.7 R).

## Backup ideas (if v1 fails)
1. **M2 "Overnight trend into the NY close":** at 08:00 NY trade the direction of the move since the 18:00 NY reopen; stop 0.5 x ATR14; exit 16:00 NY.
   Y1 +18.6 R, Y2 +16.1 R, both positive at double cost; but losing run 8 and most of its profit is on news days.
2. **A1a:** same as v1 but no target, hold to 16:00 NY. Y1 +42.0 R, Y2 +14.6 R; bigger drawdowns (−16.5 R / −16.8 R) and long trades lost in Y2.
3. **M1 "Momentum at 10:00 NY":** direction of price vs the day's open at 10:00 NY; stop 0.5 x ATR14; exit 16:00 NY. Y1 +9.7 R, Y2 +15.1 R; losing run 6.
All three share v1's underlying finding (gold continues; do not fade), so they may fail together.
