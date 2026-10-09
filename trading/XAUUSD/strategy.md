# XAUUSD (gold) strategy

# v1 "Go with London's break of the Asia range" (1R)

**Version:** v1 (2026-10-09). Author: Agent 1 (Trading Research Lead). Status: **sent to Agent 2 for backtest.**
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
