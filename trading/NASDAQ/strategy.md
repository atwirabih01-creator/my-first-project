# NASDAQ 100 strategy

# v1 "Fade the big opening gap"

**Version:** v1 (2026-10-09). Author: Agent 1 (Trading Research Lead). Status: **sent to Agent 2 for backtest.**
Research: `research.md` sections 2–4 and 6. Quick-check code: `research/05_variants.py` (variant **V2**), trades in
`research/out_06_V2_trades.csv`. Built on design data only (Oct 2024 – Jun 2026). Not financial advice.

## The idea in one paragraph
When the Nasdaq opens at 09:30 New York far away from yesterday's 16:00 close (a big "gap"), the cash session usually takes part
of that gap back. The gap was built overnight on thin trading; when the full stock market opens, part of the overshoot is corrected.
We trade **against** a big gap at 09:35 NY: short after a big gap up, long after a big gap down. The target is yesterday's close
(a full gap fill); if it is not reached, we close at the end of the cash session. It works in both directions by construction.

## Clocks
All rule times are **New York local time** (US summer time handled automatically).
Doha = New York + 7 h in US summer time (2nd Sunday of March to 1st Sunday of November), New York + 8 h in US winter time.

| Event | New York | Doha (US summer) | Doha (US winter) |
|---|---|---|---|
| Yesterday's reference close (last bar before 16:00) | 15:59 | 22:59 | 23:59 |
| Cash market opens, gap is measured | 09:30 | 16:30 | 17:30 |
| Entry (close of the first 5-minute candle) | 09:35 | 16:35 | 17:35 |
| Forced close (close of the 15:59 bar) | 16:00 | 23:00 | 00:00 (midnight) |

## Rules

**1. Trading days.** Trade only on a **full US cash session** (09:30–16:00 NY) whose **previous trading day was also a full cash session**.
- Not a full session: US stock-market holidays (CFD may still print prices), 13:00 early closes, and any day with a price-data gap
  of more than 15 minutes between 09:30 and 16:00 NY.
- Design-period holidays: 28 Nov 2024, 25 Dec 2024, 1 Jan 2025, 9 Jan 2025, 20 Jan, 17 Feb, 18 Apr, 26 May, 19 Jun, 4 Jul, 1 Sep,
  27 Nov, 25 Dec 2025, 1 Jan 2026, 19 Jan, 16 Feb, 3 Apr, 25 May, 19 Jun 2026. Early closes: 29 Nov 2024, 24 Dec 2024, 3 Jul 2025, 28 Nov 2025, 24 Dec 2025.
  (Agent 2: use the published NYSE/Nasdaq calendars for other years.)
- "Previous trading day" = the previous day that has any price data (so the day after a CFD-holiday session such as 20 Jan 2025 is skipped;
  a Monday after Good Friday, which has no prices at all, uses Thursday).
- Trading day = 18:00 NY to 17:00 NY (Sunday-evening bars belong to Monday).

**2. Mark before the open.**
- **PC (previous close)** = close of the **last 1-minute bar before 16:00 NY** on the previous trading day (normally the 15:59 bar).
- **ATR** (in points): for each of the **14 previous trading days**, take (highest high − lowest low of 09:30–15:59 NY) ÷ that day's 09:30 open × 100
  (the day's range in %). Ignore days among those 14 that were not full cash sessions; if fewer than 10 full sessions remain, no trade.
  ATR % = the average of the remaining days. **ATR (points) = ATR % × today's 09:30 open ÷ 100.**
- Chart: 1-minute bars for prices; the "first 5-minute candle" is 09:30:00–09:34:59 NY.

**3. Setup (09:30 NY).**
- **O** = open of today's 09:30 bar (if that minute is missing, the first bar from 09:30 to 09:34).
- **Gap** = O − PC.
- Trade only if **|Gap| > 0.5 × ATR (points)**.
- Direction: **Gap up (Gap > 0) → SHORT. Gap down (Gap < 0) → LONG.**

**4. Skip if already filled.** If the first 5-minute candle (09:30–09:34) has already reached PC
(for a short: its low ≤ PC; for a long: its high ≥ PC), **no trade today**.

**5. Entry.** Market order at the **close of the first 5-minute candle** (= close of the 09:34 one-minute bar), i.e. at 09:35 NY.
No other confirmation is needed. If the 09:30 candle has no bars, no trade.

**6. Stop loss.** **0.75 × ATR (points)** from the entry price: above the entry for a short, below for a long.
If this distance is under 40 points (20× cost), no trade (never happened in the design data; the smallest was 135 points).

**7. Take profit.** **PC exactly** (full gap fill). No partial profits, no break-even move. Stop and target are never moved.
If stop and target are both touched within the same minute, count the stop.

**8. Forced close.** If neither stop nor target is hit, close at the **close of the 15:59 NY 1-minute bar** (16:00 NY = 23:00 Doha summer / 00:00 Doha winter).
Nothing is ever held overnight.

**9. Position size.** Risk exactly **1% of the account**: size = (1% of balance) ÷ (distance from entry to stop in points × value per point).
Note: because the target is the gap fill and not a fixed multiple of the risk, a winning trade can be worth less than 1R or more than 1R.

**10. Daily limits.** **One trade per day maximum.** After it closes (target, stop or time), stop for the day.

**11. News days.** No news filter. CPI, NFP, PPI, FOMC and big-tech earnings days are traded like any other day (the owner decides
whether to skip them). In the design data, NFP and CPI days were weaker (research.md section 6).

**12. Fills and costs (for testing).** Test prices are bid. Cost 2.0 index points per round trip (spread + slippage); stress test 4.0.
If price jumps past the stop, the loss can be more than 1R. Buy orders fill at the ask (chart price + spread).

## Quick check on design data (Agent 1, 2.0 points cost; Agent 2 will verify)

| Period | Trades | Win rate | Total | PF | Max drawdown | Longest losing run | At 4.0 cost | Longs | Shorts |
|---|---|---|---|---|---|---|---|---|---|
| Y1 (Oct 2024 – Sep 2025) | 63 | 60.3% | +11.9 R | 1.74 | −3.6 R | 4 | +11.3 R | 24 tr, +5.7 R | 39 tr, +6.1 R |
| Y2 (Oct 2025 – Jun 2026) | 64 | 59.4% | +6.1 R | 1.35 | −8.3 R | 6 | +5.5 R | 26 tr, +3.8 R | 38 tr, +2.3 R |

Exits: 64 at 16:00 NY, 42 at target, 21 at stop (all 127 trades). Before costs: Y1 +12.5 R, Y2 +6.6 R.
Weak spots: Q2 2026 −4.8 R (shorts in a strong rally); NFP/CPI days −2.0 R over 20 trades; Y2 is +0.9 R without its best 3 trades.
Days skipped by the data/holiday rule: 51 of 450 (incl. a 10-day ATR warm-up at the start).

*Past results do not guarantee future results. Trading carries a real risk of loss.*
