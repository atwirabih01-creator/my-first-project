# EURUSD: Final strategy for this round, "Euro-vs-pound gap fade" (v3, called "Euro-only move fade" by the research team)

Prepared by Agent 2 (Backtest & Performance Manager), 10 Oct 2026. Written for someone who has never seen the strategy.

> ## Grade: **C: Experimental** (not proven, not promising on unseen data)
> **What C means:** it made money only on the price data that was used to build the rules. On the 3 years that nobody had seen,
> it **lost money**. It is **not** a proven strategy (grade A) and not a promising one (grade B). My test verdict was **DROP**.
> It is handed over only because every round must end with the best EURUSD rule tested so far. **Do not trade it with real money.**
>
> **The evidence in five lines:**
> - On the 3 years nobody had seen (2016-2018): **63 trades, -2.4 R, 44% won**. Only 2016 made money (+5.6 R); 2017 lost 7.9 R,
>   2018 was flat (-0.1 R). With double trading costs those years lose 6.1 R.
> - On the 8 years the rules were built on (2019 - Sep 2026): 226 trades, +41.9 R, 6 of 8 years positive. That looks good, but it was
>   the best of 110 ideas tried on that same data, so part of it is luck.
> - Longest losing run 8 trades (hidden years). Worst drop from a peak: 11.1 R (about 11% of the account), all of it in 2016-2018.
> - Buying held up on unseen data (+5.5 R on 23 trades); **selling lost 7.9 R**, nearly all in 2017 while the euro rose all year.
> - It trades rarely: about 2 trades a month. Even a real edge would take years to show itself.
>
> **What would upgrade it to B:** at least 50 new trades from Oct 2026 on (your own backtest of new months and demo trading; that is
> about 2 years at this pace) that are positive at **+0.10 R per trade or better**, and still positive at 2.4 pips cost.
> **What would rule it out completely:** a drop of more than **12 R** from a peak (worse than anything in 11 years), or
> **10 losses in a row** (the worst seen is 8).

*Past results do not guarantee future results. Trading carries a real risk of loss. This is not financial advice.*

---

## 1. Why it might work (the idea in plain words)
The euro (EURUSD) and the British pound (GBPUSD) are both priced against the US dollar, and most days they move together,
because most of their moves come from the dollar. Over the European morning (03:00 to 10:00 New York time, which is the London
morning) they sometimes drift apart by an unusual amount: one moves a lot, the other hardly moves.

The research team's idea: such a gap is often a one-sided flow (orders or news in one currency only), and in Europe's last trading
hours (10:00 to 12:00 New York is 15:00 to 17:00 London, with the 4 pm London fix and the London close) part of the gap closes again.
The strategy trades EURUSD in the direction that **closes the gap**:
- If the euro did **better** than the pound over the morning, **sell** EURUSD.
- If the euro did **worse** than the pound, **buy** EURUSD.

Two honest notes from the test:
- In about 3 trades out of 4, it was actually the **pound** that moved and the euro that stayed still. So most trades are a bet
  that the euro **catches up with an earlier pound move** in the afternoon, rather than the euro giving back its own move.
- The trade is only taken once the move has visibly stalled (price has already come back a bit from its morning extreme), with the
  stop just beyond that extreme. If the extreme breaks, the idea was wrong.

---

## 2. Backtest results

**How it was tested:** a computer program walked through every minute of EURUSD and GBPUSD price data (1-minute candles, from
HistData) from Jan 2016 to Sep 2026, following the rules below exactly. Every trade has a **cost of 1.2 pips** taken off (spread and
slippage). If the stop was touched in the last minute before the 16:00 close, the stop counted. 1 R = the 1% of the account risked.
The trade list is in `backtest/trades_v3.csv` (column `period`: H = hidden, D = design), so you can check any trade by hand.
`backtest/days_v3.csv` shows every day, why it was or was not traded, and that day's threshold and ATR.

**Periods:** 2016-2018 were **hidden** (nobody had looked at them; this is the real test). 2019 - Sep 2026 were used to build the rules.
Each period needs about 100 trading days of history before the first trade: trades start 23 May 2016 and 1 Apr 2019.

### Key numbers (1.2 pips cost)
| Period | Trades | Win rate | Avg win / avg loss | Total | Per trade | Profit factor* | Biggest drop | Longest losing run |
|---|---|---|---|---|---|---|---|---|
| **Hidden 2016-2018** (the real test) | 63 | 44.4% | +0.99 / -0.86 R | **-2.4 R** | **-0.04 R** | 0.92 | -11.1 R (-10.7%) | 8 |
| Design 2019 - Sep 2026 | 226 | 50.4% | +1.10 / -0.74 R | +41.9 R | +0.19 R | 1.50 | -8.4 R (-8.1%) | 6 |
| All, May 2016 - Sep 2026 | 289 | 49.1% | +1.08 / -0.77 R | +39.6 R | +0.14 R | 1.35 | -11.1 R (-10.7%) | 8 |

*Profit factor = money won ÷ money lost. Above 1 means profit; 1.1 is thin, 1.5 or more is solid. Below 1 means it lost.

### Per year (1.2 pips cost)
| Year | Trades | Win rate | Total | Per trade | Profit factor | Biggest drop | Longest losing run |
|---|---|---|---|---|---|---|---|
| 2016 (hidden, from May) | 18 | 44% | **+5.6 R** | +0.31 R | 1.66 | -4.0 R | 5 |
| 2017 (hidden) | 27 | 41% | **-7.9 R** | -0.29 R | 0.46 | -8.5 R | 8 |
| 2018 (hidden) | 18 | 50% | **-0.1 R** | -0.00 R | 0.99 | -3.4 R | 3 |
| 2019 (from May) | 23 | 52% | +9.7 R | +0.42 R | 2.69 | -1.7 R | 2 |
| 2020 | 39 | 44% | +13.2 R | +0.34 R | 1.89 | -5.2 R | 6 |
| 2021 | 20 | 50% | +0.9 R | +0.04 R | 1.12 | -3.8 R | 4 |
| 2022 | 63 | 54% | +5.1 R | +0.08 R | 1.21 | -6.5 R | 5 |
| 2023 (Feb-Jul data missing) | 5 | 40% | -0.5 R | -0.11 R | 0.73 | -1.3 R | 2 |
| 2024 | 27 | 67% | +9.6 R | +0.35 R | 2.58 | -3.0 R | 3 |
| 2025 | 32 | 41% | -4.2 R | -0.13 R | 0.72 | -8.4 R | 5 |
| 2026 (Jan-Sep) | 17 | 47% | +8.2 R | +0.48 R | 2.03 | -3.4 R | 3 |

### Other splits
- **Higher costs** (total R at 0 / 1.2 / 2.4 pips): hidden +1.4 / -2.4 / **-6.1**; design +54.2 / +41.9 / +29.6.
  At 2.4 pips: hidden 1 of 3 years positive, design 5 of 8.
- **Buying vs selling:** hidden longs 23 trades +5.5 R, shorts 40 trades **-7.9 R** (2017 shorts alone -9.6 R).
  Design longs 112 trades +30.4 R, shorts 114 trades +11.6 R. All years: longs +35.9 R, shorts +3.7 R.
- **Without the best trades:** hidden without its best 5 trades: -15.0 R. Design without its best 5: +20.4 R.
- **Chance the true average is zero or less** (a statistics check that reshuffles the trades): hidden 62%, design 1%.
  The design figure does not allow for the 110 ideas tried on the same data.
- **How trades ended:** hidden: closed at 16:00 New York 39 (62%) +23.4 R, stop hit 24 (38%) -25.7 R. Design: 16:00 close 163 (72%)
  +109.0 R, stop 63 (28%) -67.1 R. Stops were 11-68 pips (median 21) on hidden data, 7-78 pips (median 24) on design data.
- **Weekday** (trades, R): hidden Mon 11 +0.4, Tue 14 -0.4, Wed 8 +0.6, Thu 14 -0.1, **Fri 16 -2.8**; design Mon 36 +9.6,
  Tue 40 -0.3, Wed 49 +2.8, Thu 59 +16.9, Fri 42 +13.0. The best days are not the same in the two periods.
- **US summer vs winter time:** hidden summer 46 trades +0.3 R, winter 17 trades -2.6 R; design summer 152 trades +37.3 R, winter
  74 trades +4.6 R.
- **News days** (days with a big 08:30 New York price jump, e.g. US jobs or inflation reports; no exact calendar was available):
  hidden 10 trades -0.6 R, normal days 53 trades -1.7 R; design 42 trades +6.9 R, normal days 184 trades +35.1 R. No clear difference.
- **Entering 1 minute late** (at 10:01): hidden +1.8 R, design +37.2 R (instead of -2.4 / +41.9). Timing matters.
- **Half-years positive:** 12 of 21. Hidden months positive: 8 of 25.
- **Side-check (not used for the grade):** the same rules with a looser threshold (65th instead of 75th percentile) gave 96 hidden
  trades, -0.6 R, with a losing run of 12. It does not fix anything.

### Data notes
- Feb - Jul 2023: the price files have holes on most days, so those days were skipped (131 thin days and 11 days with holes in the
  design data). The hidden 2016-2018 data is clean (3 thin days, no holes).
- The research team's own quick check gave 228 design trades, +41.9 R. This independent test found 226 of those 228 trades exactly
  (same day, direction, stop and result); the other 2 (Aug and Sep 2023, together +0.01 R) depend on how the data holes are counted.

### Week-by-week table, Jan 2016 - Sep 2026
How to read it: one row per week, Monday to Friday. "Result" is after costs. "Data": hidden = the real test, design = the data the
rules were built on. Notes show each trade as weekday + L (buy) or S (sell) + result in R, e.g. "ThuS+0.64". Weeks with 0 trades
and no note simply had no setup: the strategy trades on about 1 day in 10. The running total is -2.36 R at the end of the hidden years.

| Week (Mon - Fri) | Data | Trades | Wins | Losses | Win rate | Result (R) | Running total (R) | Notes |
|---|---|---|---|---|---|---|---|---|
| 04 Jan 2016 - 08 Jan | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 11 Jan 2016 - 15 Jan | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 18 Jan 2016 - 22 Jan | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 25 Jan 2016 - 29 Jan | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 01 Feb 2016 - 05 Feb | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 08 Feb 2016 - 12 Feb | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 15 Feb 2016 - 19 Feb | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 22 Feb 2016 - 26 Feb | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 29 Feb 2016 - 04 Mar | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 07 Mar 2016 - 11 Mar | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 14 Mar 2016 - 18 Mar | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 21 Mar 2016 - 25 Mar | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 28 Mar 2016 - 01 Apr | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 04 Apr 2016 - 08 Apr | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 11 Apr 2016 - 15 Apr | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 18 Apr 2016 - 22 Apr | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 25 Apr 2016 - 29 Apr | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 02 May 2016 - 06 May | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 09 May 2016 - 13 May | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 16 May 2016 - 20 May | hidden | 0 | 0 | 0 | - | 0 | +0.00 | warm-up (no trades possible) |
| 23 May 2016 - 27 May | hidden | 1 | 0 | 1 | 0% | -1.08 | -1.08 | WedL-1.08 |
| 30 May 2016 - 03 Jun | hidden | 0 | 0 | 0 | - | 0 | -1.08 |  |
| 06 Jun 2016 - 10 Jun | hidden | 1 | 1 | 0 | 100% | +1.01 | -0.07 | FriS+1.01 |
| 13 Jun 2016 - 17 Jun | hidden | 2 | 1 | 1 | 50% | -0.28 | -0.34 | MonL+0.80 ThuL-1.08 |
| 20 Jun 2016 - 24 Jun | hidden | 1 | 1 | 0 | 100% | +0.86 | +0.52 | FriL+0.86 |
| 27 Jun 2016 - 01 Jul | hidden | 1 | 0 | 1 | 0% | -0.25 | +0.27 | WedL-0.25 |
| 04 Jul 2016 - 08 Jul | hidden | 1 | 1 | 0 | 100% | +2.11 | +2.37 | TueS+2.11 |
| 11 Jul 2016 - 15 Jul | hidden | 0 | 0 | 0 | - | 0 | +2.37 |  |
| 18 Jul 2016 - 22 Jul | hidden | 1 | 1 | 0 | 100% | +1.29 | +3.66 | FriS+1.29 |
| 25 Jul 2016 - 29 Jul | hidden | 1 | 0 | 1 | 0% | -1.07 | +2.59 | TueL-1.07 |
| 01 Aug 2016 - 05 Aug | hidden | 0 | 0 | 0 | - | 0 | +2.59 |  |
| 08 Aug 2016 - 12 Aug | hidden | 0 | 0 | 0 | - | 0 | +2.59 |  |
| 15 Aug 2016 - 19 Aug | hidden | 2 | 1 | 1 | 50% | +3.69 | +6.28 | ThuL+4.04 FriS-0.35 |
| 22 Aug 2016 - 26 Aug | hidden | 0 | 0 | 0 | - | 0 | +6.28 |  |
| 29 Aug 2016 - 02 Sep | hidden | 0 | 0 | 0 | - | 0 | +6.28 |  |
| 05 Sep 2016 - 09 Sep | hidden | 0 | 0 | 0 | - | 0 | +6.28 |  |
| 12 Sep 2016 - 16 Sep | hidden | 1 | 0 | 1 | 0% | -1.05 | +5.23 | TueS-1.05 |
| 19 Sep 2016 - 23 Sep | hidden | 1 | 0 | 1 | 0% | -1.10 | +4.13 | FriS-1.10 |
| 26 Sep 2016 - 30 Sep | hidden | 0 | 0 | 0 | - | 0 | +4.13 |  |
| 03 Oct 2016 - 07 Oct | hidden | 1 | 0 | 1 | 0% | -0.45 | +3.68 | FriS-0.45 |
| 10 Oct 2016 - 14 Oct | hidden | 0 | 0 | 0 | - | 0 | +3.68 |  |
| 17 Oct 2016 - 21 Oct | hidden | 0 | 0 | 0 | - | 0 | +3.68 |  |
| 24 Oct 2016 - 28 Oct | hidden | 1 | 0 | 1 | 0% | -1.03 | +2.65 | TueS-1.03 |
| 31 Oct 2016 - 04 Nov | hidden | 1 | 1 | 0 | 100% | +2.75 | +5.40 | ThuL+2.75 |
| 07 Nov 2016 - 11 Nov | hidden | 1 | 0 | 1 | 0% | -1.05 | +4.35 | FriL-1.05 |
| 14 Nov 2016 - 18 Nov | hidden | 0 | 0 | 0 | - | 0 | +4.35 |  |
| 21 Nov 2016 - 25 Nov | hidden | 0 | 0 | 0 | - | 0 | +4.35 |  |
| 28 Nov 2016 - 02 Dec | hidden | 1 | 1 | 0 | 100% | +1.23 | +5.58 | TueL+1.23 |
| 05 Dec 2016 - 09 Dec | hidden | 0 | 0 | 0 | - | 0 | +5.58 |  |
| 12 Dec 2016 - 16 Dec | hidden | 0 | 0 | 0 | - | 0 | +5.58 |  |
| 19 Dec 2016 - 23 Dec | hidden | 0 | 0 | 0 | - | 0 | +5.58 |  |
| 26 Dec 2016 - 30 Dec | hidden | 0 | 0 | 0 | - | 0 | +5.58 |  |
| 02 Jan 2017 - 06 Jan | hidden | 0 | 0 | 0 | - | 0 | +5.58 |  |
| 09 Jan 2017 - 13 Jan | hidden | 0 | 0 | 0 | - | 0 | +5.58 |  |
| 16 Jan 2017 - 20 Jan | hidden | 0 | 0 | 0 | - | 0 | +5.58 |  |
| 23 Jan 2017 - 27 Jan | hidden | 0 | 0 | 0 | - | 0 | +5.58 |  |
| 30 Jan 2017 - 03 Feb | hidden | 0 | 0 | 0 | - | 0 | +5.58 |  |
| 06 Feb 2017 - 10 Feb | hidden | 0 | 0 | 0 | - | 0 | +5.58 |  |
| 13 Feb 2017 - 17 Feb | hidden | 0 | 0 | 0 | - | 0 | +5.58 |  |
| 20 Feb 2017 - 24 Feb | hidden | 0 | 0 | 0 | - | 0 | +5.58 |  |
| 27 Feb 2017 - 03 Mar | hidden | 2 | 0 | 2 | 0% | -2.16 | +3.42 | WedS-1.08 FriS-1.08 |
| 06 Mar 2017 - 10 Mar | hidden | 0 | 0 | 0 | - | 0 | +3.42 |  |
| 13 Mar 2017 - 17 Mar | hidden | 1 | 0 | 1 | 0% | -1.08 | +2.34 | MonL-1.08 |
| 20 Mar 2017 - 24 Mar | hidden | 0 | 0 | 0 | - | 0 | +2.34 |  |
| 27 Mar 2017 - 31 Mar | hidden | 2 | 1 | 1 | 50% | -0.13 | +2.22 | WedL+0.96 ThuL-1.09 |
| 03 Apr 2017 - 07 Apr | hidden | 0 | 0 | 0 | - | 0 | +2.22 |  |
| 10 Apr 2017 - 14 Apr | hidden | 0 | 0 | 0 | - | 0 | +2.22 |  |
| 17 Apr 2017 - 21 Apr | hidden | 0 | 0 | 0 | - | 0 | +2.22 |  |
| 24 Apr 2017 - 28 Apr | hidden | 0 | 0 | 0 | - | 0 | +2.22 |  |
| 01 May 2017 - 05 May | hidden | 0 | 0 | 0 | - | 0 | +2.22 |  |
| 08 May 2017 - 12 May | hidden | 0 | 0 | 0 | - | 0 | +2.22 |  |
| 15 May 2017 - 19 May | hidden | 2 | 1 | 1 | 50% | -1.05 | +1.17 | MonS+0.01 TueS-1.05 |
| 22 May 2017 - 26 May | hidden | 0 | 0 | 0 | - | 0 | +1.17 |  |
| 29 May 2017 - 02 Jun | hidden | 0 | 0 | 0 | - | 0 | +1.17 |  |
| 05 Jun 2017 - 09 Jun | hidden | 1 | 1 | 0 | 100% | +0.29 | +1.47 | MonL+0.29 |
| 12 Jun 2017 - 16 Jun | hidden | 1 | 1 | 0 | 100% | +0.11 | +1.58 | MonS+0.11 |
| 19 Jun 2017 - 23 Jun | hidden | 1 | 1 | 0 | 100% | +0.39 | +1.97 | TueS+0.39 |
| 26 Jun 2017 - 30 Jun | hidden | 1 | 0 | 1 | 0% | -1.07 | +0.90 | TueS-1.07 |
| 03 Jul 2017 - 07 Jul | hidden | 0 | 0 | 0 | - | 0 | +0.90 |  |
| 10 Jul 2017 - 14 Jul | hidden | 0 | 0 | 0 | - | 0 | +0.90 |  |
| 17 Jul 2017 - 21 Jul | hidden | 1 | 0 | 1 | 0% | -1.09 | -0.19 | ThuS-1.09 |
| 24 Jul 2017 - 28 Jul | hidden | 0 | 0 | 0 | - | 0 | -0.19 |  |
| 31 Jul 2017 - 04 Aug | hidden | 1 | 0 | 1 | 0% | -1.05 | -1.24 | ThuS-1.05 |
| 07 Aug 2017 - 11 Aug | hidden | 0 | 0 | 0 | - | 0 | -1.24 |  |
| 14 Aug 2017 - 18 Aug | hidden | 0 | 0 | 0 | - | 0 | -1.24 |  |
| 21 Aug 2017 - 25 Aug | hidden | 0 | 0 | 0 | - | 0 | -1.24 |  |
| 28 Aug 2017 - 01 Sep | hidden | 0 | 0 | 0 | - | 0 | -1.24 |  |
| 04 Sep 2017 - 08 Sep | hidden | 1 | 1 | 0 | 100% | +1.34 | +0.10 | TueL+1.34 |
| 11 Sep 2017 - 15 Sep | hidden | 2 | 2 | 0 | 100% | +1.33 | +1.43 | TueL+0.88 ThuL+0.45 |
| 18 Sep 2017 - 22 Sep | hidden | 1 | 1 | 0 | 100% | +0.60 | +2.03 | FriS+0.60 |
| 25 Sep 2017 - 29 Sep | hidden | 0 | 0 | 0 | - | 0 | +2.03 |  |
| 02 Oct 2017 - 06 Oct | hidden | 1 | 1 | 0 | 100% | +0.99 | +3.02 | MonS+0.99 |
| 09 Oct 2017 - 13 Oct | hidden | 1 | 0 | 1 | 0% | -0.09 | +2.93 | ThuS-0.09 |
| 16 Oct 2017 - 20 Oct | hidden | 1 | 0 | 1 | 0% | -0.78 | +2.15 | TueS-0.78 |
| 23 Oct 2017 - 27 Oct | hidden | 1 | 0 | 1 | 0% | -1.10 | +1.05 | TueS-1.10 |
| 30 Oct 2017 - 03 Nov | hidden | 1 | 0 | 1 | 0% | -1.07 | -0.02 | ThuS-1.07 |
| 06 Nov 2017 - 10 Nov | hidden | 1 | 0 | 1 | 0% | -1.09 | -1.11 | ThuS-1.09 |
| 13 Nov 2017 - 17 Nov | hidden | 2 | 0 | 2 | 0% | -1.16 | -2.26 | TueS-1.09 FriS-0.06 |
| 20 Nov 2017 - 24 Nov | hidden | 0 | 0 | 0 | - | 0 | -2.26 |  |
| 27 Nov 2017 - 01 Dec | hidden | 0 | 0 | 0 | - | 0 | -2.26 |  |
| 04 Dec 2017 - 08 Dec | hidden | 1 | 0 | 1 | 0% | -0.64 | -2.91 | FriS-0.64 |
| 11 Dec 2017 - 15 Dec | hidden | 1 | 1 | 0 | 100% | +0.61 | -2.30 | FriS+0.61 |
| 18 Dec 2017 - 22 Dec | hidden | 0 | 0 | 0 | - | 0 | -2.30 |  |
| 25 Dec 2017 - 29 Dec | hidden | 0 | 0 | 0 | - | 0 | -2.30 |  |
| 01 Jan 2018 - 05 Jan | hidden | 0 | 0 | 0 | - | 0 | -2.30 |  |
| 08 Jan 2018 - 12 Jan | hidden | 0 | 0 | 0 | - | 0 | -2.30 |  |
| 15 Jan 2018 - 19 Jan | hidden | 0 | 0 | 0 | - | 0 | -2.30 |  |
| 22 Jan 2018 - 26 Jan | hidden | 0 | 0 | 0 | - | 0 | -2.30 |  |
| 29 Jan 2018 - 02 Feb | hidden | 0 | 0 | 0 | - | 0 | -2.30 |  |
| 05 Feb 2018 - 09 Feb | hidden | 2 | 1 | 1 | 50% | +0.24 | -2.06 | ThuL-0.53 FriS+0.77 |
| 12 Feb 2018 - 16 Feb | hidden | 0 | 0 | 0 | - | 0 | -2.06 |  |
| 19 Feb 2018 - 23 Feb | hidden | 0 | 0 | 0 | - | 0 | -2.06 |  |
| 26 Feb 2018 - 02 Mar | hidden | 1 | 1 | 0 | 100% | +0.30 | -1.76 | WedS+0.30 |
| 05 Mar 2018 - 09 Mar | hidden | 0 | 0 | 0 | - | 0 | -1.76 |  |
| 12 Mar 2018 - 16 Mar | hidden | 0 | 0 | 0 | - | 0 | -1.76 |  |
| 19 Mar 2018 - 23 Mar | hidden | 0 | 0 | 0 | - | 0 | -1.76 |  |
| 26 Mar 2018 - 30 Mar | hidden | 0 | 0 | 0 | - | 0 | -1.76 |  |
| 02 Apr 2018 - 06 Apr | hidden | 0 | 0 | 0 | - | 0 | -1.76 |  |
| 09 Apr 2018 - 13 Apr | hidden | 0 | 0 | 0 | - | 0 | -1.76 |  |
| 16 Apr 2018 - 20 Apr | hidden | 1 | 1 | 0 | 100% | +0.67 | -1.08 | WedS+0.67 |
| 23 Apr 2018 - 27 Apr | hidden | 1 | 0 | 1 | 0% | -1.09 | -2.18 | FriS-1.09 |
| 30 Apr 2018 - 04 May | hidden | 0 | 0 | 0 | - | 0 | -2.18 |  |
| 07 May 2018 - 11 May | hidden | 1 | 0 | 1 | 0% | -0.36 | -2.54 | ThuS-0.36 |
| 14 May 2018 - 18 May | hidden | 0 | 0 | 0 | - | 0 | -2.54 |  |
| 21 May 2018 - 25 May | hidden | 0 | 0 | 0 | - | 0 | -2.54 |  |
| 28 May 2018 - 01 Jun | hidden | 1 | 0 | 1 | 0% | -1.05 | -3.59 | FriL-1.05 |
| 04 Jun 2018 - 08 Jun | hidden | 1 | 1 | 0 | 100% | +0.43 | -3.16 | ThuS+0.43 |
| 11 Jun 2018 - 15 Jun | hidden | 0 | 0 | 0 | - | 0 | -3.16 |  |
| 18 Jun 2018 - 22 Jun | hidden | 0 | 0 | 0 | - | 0 | -3.16 |  |
| 25 Jun 2018 - 29 Jun | hidden | 0 | 0 | 0 | - | 0 | -3.16 |  |
| 02 Jul 2018 - 06 Jul | hidden | 0 | 0 | 0 | - | 0 | -3.16 |  |
| 09 Jul 2018 - 13 Jul | hidden | 1 | 1 | 0 | 100% | +1.92 | -1.24 | TueL+1.92 |
| 16 Jul 2018 - 20 Jul | hidden | 0 | 0 | 0 | - | 0 | -1.24 |  |
| 23 Jul 2018 - 27 Jul | hidden | 0 | 0 | 0 | - | 0 | -1.24 |  |
| 30 Jul 2018 - 03 Aug | hidden | 0 | 0 | 0 | - | 0 | -1.24 |  |
| 06 Aug 2018 - 10 Aug | hidden | 1 | 0 | 1 | 0% | -0.43 | -1.67 | MonS-0.43 |
| 13 Aug 2018 - 17 Aug | hidden | 0 | 0 | 0 | - | 0 | -1.67 |  |
| 20 Aug 2018 - 24 Aug | hidden | 0 | 0 | 0 | - | 0 | -1.67 |  |
| 27 Aug 2018 - 31 Aug | hidden | 1 | 1 | 0 | 100% | +0.36 | -1.31 | WedL+0.36 |
| 03 Sep 2018 - 07 Sep | hidden | 2 | 0 | 2 | 0% | -2.14 | -3.45 | MonS-1.07 FriL-1.07 |
| 10 Sep 2018 - 14 Sep | hidden | 0 | 0 | 0 | - | 0 | -3.45 |  |
| 17 Sep 2018 - 21 Sep | hidden | 0 | 0 | 0 | - | 0 | -3.45 |  |
| 24 Sep 2018 - 28 Sep | hidden | 0 | 0 | 0 | - | 0 | -3.45 |  |
| 01 Oct 2018 - 05 Oct | hidden | 0 | 0 | 0 | - | 0 | -3.45 |  |
| 08 Oct 2018 - 12 Oct | hidden | 0 | 0 | 0 | - | 0 | -3.45 |  |
| 15 Oct 2018 - 19 Oct | hidden | 0 | 0 | 0 | - | 0 | -3.45 |  |
| 22 Oct 2018 - 26 Oct | hidden | 0 | 0 | 0 | - | 0 | -3.45 |  |
| 29 Oct 2018 - 02 Nov | hidden | 0 | 0 | 0 | - | 0 | -3.45 |  |
| 05 Nov 2018 - 09 Nov | hidden | 0 | 0 | 0 | - | 0 | -3.45 |  |
| 12 Nov 2018 - 16 Nov | hidden | 2 | 1 | 1 | 50% | -0.35 | -3.80 | MonL-1.05 WedS+0.70 |
| 19 Nov 2018 - 23 Nov | hidden | 0 | 0 | 0 | - | 0 | -3.80 |  |
| 26 Nov 2018 - 30 Nov | hidden | 1 | 0 | 1 | 0% | -0.36 | -4.16 | ThuS-0.36 |
| 03 Dec 2018 - 07 Dec | hidden | 1 | 1 | 0 | 100% | +0.02 | -4.15 | MonS+0.02 |
| 10 Dec 2018 - 14 Dec | hidden | 1 | 1 | 0 | 100% | +1.78 | -2.36 | MonS+1.78 |
| 17 Dec 2018 - 21 Dec | hidden | 0 | 0 | 0 | - | 0 | -2.36 |  |
| 24 Dec 2018 - 28 Dec | hidden | 0 | 0 | 0 | - | 0 | -2.36 |  |
| 31 Dec 2018 - 04 Jan | hidden | 0 | 0 | 0 | - | 0 | -2.36 | warm-up (no trades possible) |
| 07 Jan 2019 - 11 Jan | design | 0 | 0 | 0 | - | 0 | -2.36 | warm-up (no trades possible) |
| 14 Jan 2019 - 18 Jan | design | 0 | 0 | 0 | - | 0 | -2.36 | warm-up (no trades possible) |
| 21 Jan 2019 - 25 Jan | design | 0 | 0 | 0 | - | 0 | -2.36 | warm-up (no trades possible) |
| 28 Jan 2019 - 01 Feb | design | 0 | 0 | 0 | - | 0 | -2.36 | warm-up (no trades possible) |
| 04 Feb 2019 - 08 Feb | design | 0 | 0 | 0 | - | 0 | -2.36 | warm-up (no trades possible) |
| 11 Feb 2019 - 15 Feb | design | 0 | 0 | 0 | - | 0 | -2.36 | warm-up (no trades possible) |
| 18 Feb 2019 - 22 Feb | design | 0 | 0 | 0 | - | 0 | -2.36 | warm-up (no trades possible) |
| 25 Feb 2019 - 01 Mar | design | 0 | 0 | 0 | - | 0 | -2.36 | warm-up (no trades possible) |
| 04 Mar 2019 - 08 Mar | design | 0 | 0 | 0 | - | 0 | -2.36 | warm-up (no trades possible) |
| 11 Mar 2019 - 15 Mar | design | 0 | 0 | 0 | - | 0 | -2.36 | warm-up (no trades possible) |
| 18 Mar 2019 - 22 Mar | design | 0 | 0 | 0 | - | 0 | -2.36 | warm-up (no trades possible) |
| 25 Mar 2019 - 29 Mar | design | 0 | 0 | 0 | - | 0 | -2.36 | warm-up (no trades possible) |
| 01 Apr 2019 - 05 Apr | design | 0 | 0 | 0 | - | 0 | -2.36 |  |
| 08 Apr 2019 - 12 Apr | design | 0 | 0 | 0 | - | 0 | -2.36 |  |
| 15 Apr 2019 - 19 Apr | design | 0 | 0 | 0 | - | 0 | -2.36 |  |
| 22 Apr 2019 - 26 Apr | design | 0 | 0 | 0 | - | 0 | -2.36 |  |
| 29 Apr 2019 - 03 May | design | 0 | 0 | 0 | - | 0 | -2.36 |  |
| 06 May 2019 - 10 May | design | 0 | 0 | 0 | - | 0 | -2.36 |  |
| 13 May 2019 - 17 May | design | 0 | 0 | 0 | - | 0 | -2.36 |  |
| 20 May 2019 - 24 May | design | 1 | 1 | 0 | 100% | +0.44 | -1.92 | WedS+0.44 |
| 27 May 2019 - 31 May | design | 1 | 0 | 1 | 0% | -1.17 | -3.09 | FriS-1.17 |
| 03 Jun 2019 - 07 Jun | design | 0 | 0 | 0 | - | 0 | -3.09 |  |
| 10 Jun 2019 - 14 Jun | design | 0 | 0 | 0 | - | 0 | -3.09 |  |
| 17 Jun 2019 - 21 Jun | design | 0 | 0 | 0 | - | 0 | -3.09 |  |
| 24 Jun 2019 - 28 Jun | design | 0 | 0 | 0 | - | 0 | -3.09 |  |
| 01 Jul 2019 - 05 Jul | design | 0 | 0 | 0 | - | 0 | -3.09 |  |
| 08 Jul 2019 - 12 Jul | design | 0 | 0 | 0 | - | 0 | -3.09 |  |
| 15 Jul 2019 - 19 Jul | design | 1 | 1 | 0 | 100% | +4.57 | +1.48 | ThuL+4.57 |
| 22 Jul 2019 - 26 Jul | design | 1 | 0 | 1 | 0% | -0.59 | +0.90 | WedL-0.59 |
| 29 Jul 2019 - 02 Aug | design | 0 | 0 | 0 | - | 0 | +0.90 |  |
| 05 Aug 2019 - 09 Aug | design | 1 | 0 | 1 | 0% | -1.08 | -0.18 | FriS-1.07 |
| 12 Aug 2019 - 16 Aug | design | 1 | 1 | 0 | 100% | +1.63 | +1.45 | FriL+1.63 |
| 19 Aug 2019 - 23 Aug | design | 2 | 1 | 1 | 50% | +0.48 | +1.93 | MonS+0.93 ThuL-0.45 |
| 26 Aug 2019 - 30 Aug | design | 1 | 1 | 0 | 100% | +0.27 | +2.20 | WedS+0.27 |
| 02 Sep 2019 - 06 Sep | design | 1 | 0 | 1 | 0% | -0.17 | +2.03 | MonS-0.17 |
| 09 Sep 2019 - 13 Sep | design | 0 | 0 | 0 | - | 0 | +2.03 |  |
| 16 Sep 2019 - 20 Sep | design | 0 | 0 | 0 | - | 0 | +2.03 |  |
| 23 Sep 2019 - 27 Sep | design | 2 | 2 | 0 | 100% | +3.55 | +5.58 | TueL+1.59 WedS+1.96 |
| 30 Sep 2019 - 04 Oct | design | 4 | 1 | 3 | 25% | -1.20 | +4.38 | MonL-0.15 TueS-1.05 ThuL+0.47 FriS-0.46 |
| 07 Oct 2019 - 11 Oct | design | 1 | 1 | 0 | 100% | +0.72 | +5.10 | TueS+0.72 |
| 14 Oct 2019 - 18 Oct | design | 1 | 1 | 0 | 100% | +0.67 | +5.77 | WedL+0.67 |
| 21 Oct 2019 - 25 Oct | design | 0 | 0 | 0 | - | 0 | +5.77 |  |
| 28 Oct 2019 - 01 Nov | design | 0 | 0 | 0 | - | 0 | +5.77 |  |
| 04 Nov 2019 - 08 Nov | design | 0 | 0 | 0 | - | 0 | +5.77 |  |
| 11 Nov 2019 - 15 Nov | design | 1 | 0 | 1 | 0% | -0.30 | +5.47 | MonL-0.30 |
| 18 Nov 2019 - 22 Nov | design | 0 | 0 | 0 | - | 0 | +5.47 |  |
| 25 Nov 2019 - 29 Nov | design | 0 | 0 | 0 | - | 0 | +5.47 |  |
| 02 Dec 2019 - 06 Dec | design | 0 | 0 | 0 | - | 0 | +5.47 |  |
| 09 Dec 2019 - 13 Dec | design | 1 | 1 | 0 | 100% | +2.16 | +7.63 | WedL+2.16 |
| 16 Dec 2019 - 20 Dec | design | 2 | 1 | 1 | 50% | -0.01 | +7.62 | TueS+0.11 ThuS-0.12 |
| 23 Dec 2019 - 27 Dec | design | 0 | 0 | 0 | - | 0 | +7.62 |  |
| 30 Dec 2019 - 03 Jan | design | 1 | 0 | 1 | 0% | -0.24 | +7.38 | TueL-0.24 |
| 06 Jan 2020 - 10 Jan | design | 1 | 1 | 0 | 100% | +0.07 | +7.45 | ThuS+0.07 |
| 13 Jan 2020 - 17 Jan | design | 1 | 1 | 0 | 100% | +0.30 | +7.75 | TueL+0.30 |
| 20 Jan 2020 - 24 Jan | design | 0 | 0 | 0 | - | 0 | +7.75 |  |
| 27 Jan 2020 - 31 Jan | design | 1 | 1 | 0 | 100% | +0.30 | +8.06 | ThuL+0.30 |
| 03 Feb 2020 - 07 Feb | design | 0 | 0 | 0 | - | 0 | +8.06 |  |
| 10 Feb 2020 - 14 Feb | design | 1 | 0 | 1 | 0% | -1.14 | +6.92 | ThuL-1.14 |
| 17 Feb 2020 - 21 Feb | design | 1 | 0 | 1 | 0% | -0.56 | +6.35 | TueL-0.56 |
| 24 Feb 2020 - 28 Feb | design | 1 | 0 | 1 | 0% | -1.13 | +5.22 | ThuS-1.13 |
| 02 Mar 2020 - 06 Mar | design | 1 | 1 | 0 | 100% | +0.73 | +5.96 | WedL+0.73 |
| 09 Mar 2020 - 13 Mar | design | 0 | 0 | 0 | - | 0 | +5.96 |  |
| 16 Mar 2020 - 20 Mar | design | 1 | 0 | 1 | 0% | -1.02 | +4.94 | ThuL-1.02 |
| 23 Mar 2020 - 27 Mar | design | 4 | 2 | 2 | 50% | +3.64 | +8.58 | TueL-1.05 WedS-1.02 ThuL+0.99 FriL+4.72 |
| 30 Mar 2020 - 03 Apr | design | 2 | 1 | 1 | 50% | +2.35 | +10.92 | TueL+2.84 FriS-0.49 |
| 06 Apr 2020 - 10 Apr | design | 2 | 0 | 2 | 0% | -0.94 | +9.99 | MonL-0.15 WedL-0.78 |
| 13 Apr 2020 - 17 Apr | design | 0 | 0 | 0 | - | 0 | +9.99 |  |
| 20 Apr 2020 - 24 Apr | design | 0 | 0 | 0 | - | 0 | +9.99 |  |
| 27 Apr 2020 - 01 May | design | 1 | 1 | 0 | 100% | +3.55 | +13.54 | ThuL+3.55 |
| 04 May 2020 - 08 May | design | 1 | 0 | 1 | 0% | -1.03 | +12.51 | ThuS-1.03 |
| 11 May 2020 - 15 May | design | 2 | 2 | 0 | 100% | +2.64 | +15.15 | MonS+1.29 FriS+1.35 |
| 18 May 2020 - 22 May | design | 0 | 0 | 0 | - | 0 | +15.15 |  |
| 25 May 2020 - 29 May | design | 1 | 0 | 1 | 0% | -0.25 | +14.90 | WedS-0.25 |
| 01 Jun 2020 - 05 Jun | design | 1 | 0 | 1 | 0% | -1.08 | +13.82 | FriL-1.08 |
| 08 Jun 2020 - 12 Jun | design | 0 | 0 | 0 | - | 0 | +13.82 |  |
| 15 Jun 2020 - 19 Jun | design | 2 | 2 | 0 | 100% | +1.01 | +14.83 | ThuS+0.18 FriS+0.82 |
| 22 Jun 2020 - 26 Jun | design | 0 | 0 | 0 | - | 0 | +14.83 |  |
| 29 Jun 2020 - 03 Jul | design | 1 | 1 | 0 | 100% | +0.66 | +15.48 | MonS+0.66 |
| 06 Jul 2020 - 10 Jul | design | 1 | 0 | 1 | 0% | -0.54 | +14.94 | TueL-0.54 |
| 13 Jul 2020 - 17 Jul | design | 0 | 0 | 0 | - | 0 | +14.94 |  |
| 20 Jul 2020 - 24 Jul | design | 1 | 1 | 0 | 100% | +1.56 | +16.50 | MonL+1.56 |
| 27 Jul 2020 - 31 Jul | design | 1 | 0 | 1 | 0% | -1.05 | +15.45 | FriL-1.05 |
| 03 Aug 2020 - 07 Aug | design | 0 | 0 | 0 | - | 0 | +15.45 |  |
| 10 Aug 2020 - 14 Aug | design | 1 | 0 | 1 | 0% | -1.06 | +14.39 | WedS-1.06 |
| 17 Aug 2020 - 21 Aug | design | 0 | 0 | 0 | - | 0 | +14.39 |  |
| 24 Aug 2020 - 28 Aug | design | 0 | 0 | 0 | - | 0 | +14.39 |  |
| 31 Aug 2020 - 04 Sep | design | 0 | 0 | 0 | - | 0 | +14.39 |  |
| 07 Sep 2020 - 11 Sep | design | 2 | 1 | 1 | 50% | +3.91 | +18.30 | TueS-0.06 ThuS+3.97 |
| 14 Sep 2020 - 18 Sep | design | 0 | 0 | 0 | - | 0 | +18.30 |  |
| 21 Sep 2020 - 25 Sep | design | 0 | 0 | 0 | - | 0 | +18.30 |  |
| 28 Sep 2020 - 02 Oct | design | 2 | 1 | 1 | 50% | +1.99 | +20.29 | WedL+2.12 FriL-0.13 |
| 05 Oct 2020 - 09 Oct | design | 0 | 0 | 0 | - | 0 | +20.29 |  |
| 12 Oct 2020 - 16 Oct | design | 1 | 0 | 1 | 0% | -0.26 | +20.03 | WedL-0.26 |
| 19 Oct 2020 - 23 Oct | design | 1 | 0 | 1 | 0% | -0.14 | +19.89 | WedL-0.14 |
| 26 Oct 2020 - 30 Oct | design | 0 | 0 | 0 | - | 0 | +19.89 |  |
| 02 Nov 2020 - 06 Nov | design | 1 | 0 | 1 | 0% | -0.61 | +19.29 | FriS-0.61 |
| 09 Nov 2020 - 13 Nov | design | 1 | 0 | 1 | 0% | -0.18 | +19.11 | TueL-0.18 |
| 16 Nov 2020 - 20 Nov | design | 0 | 0 | 0 | - | 0 | +19.11 |  |
| 23 Nov 2020 - 27 Nov | design | 0 | 0 | 0 | - | 0 | +19.11 |  |
| 30 Nov 2020 - 04 Dec | design | 1 | 0 | 1 | 0% | -1.05 | +18.06 | FriL-1.05 |
| 07 Dec 2020 - 11 Dec | design | 1 | 1 | 0 | 100% | +2.50 | +20.57 | MonS+2.50 |
| 14 Dec 2020 - 18 Dec | design | 0 | 0 | 0 | - | 0 | +20.57 |  |
| 21 Dec 2020 - 25 Dec | design | 0 | 0 | 0 | - | 0 | +20.57 |  |
| 28 Dec 2020 - 01 Jan | design | 0 | 0 | 0 | - | 0 | +20.57 |  |
| 04 Jan 2021 - 08 Jan | design | 1 | 1 | 0 | 100% | +1.82 | +22.39 | MonS+1.82 |
| 11 Jan 2021 - 15 Jan | design | 0 | 0 | 0 | - | 0 | +22.39 |  |
| 18 Jan 2021 - 22 Jan | design | 0 | 0 | 0 | - | 0 | +22.39 |  |
| 25 Jan 2021 - 29 Jan | design | 0 | 0 | 0 | - | 0 | +22.39 |  |
| 01 Feb 2021 - 05 Feb | design | 0 | 0 | 0 | - | 0 | +22.39 |  |
| 08 Feb 2021 - 12 Feb | design | 0 | 0 | 0 | - | 0 | +22.39 |  |
| 15 Feb 2021 - 19 Feb | design | 1 | 1 | 0 | 100% | +0.75 | +23.14 | ThuL+0.75 |
| 22 Feb 2021 - 26 Feb | design | 0 | 0 | 0 | - | 0 | +23.14 |  |
| 01 Mar 2021 - 05 Mar | design | 0 | 0 | 0 | - | 0 | +23.14 |  |
| 08 Mar 2021 - 12 Mar | design | 0 | 0 | 0 | - | 0 | +23.14 |  |
| 15 Mar 2021 - 19 Mar | design | 0 | 0 | 0 | - | 0 | +23.14 |  |
| 22 Mar 2021 - 26 Mar | design | 1 | 0 | 1 | 0% | -1.08 | +22.06 | MonS-1.08 |
| 29 Mar 2021 - 02 Apr | design | 0 | 0 | 0 | - | 0 | +22.06 |  |
| 05 Apr 2021 - 09 Apr | design | 1 | 1 | 0 | 100% | +1.02 | +23.08 | FriL+1.02 |
| 12 Apr 2021 - 16 Apr | design | 0 | 0 | 0 | - | 0 | +23.08 |  |
| 19 Apr 2021 - 23 Apr | design | 0 | 0 | 0 | - | 0 | +23.08 |  |
| 26 Apr 2021 - 30 Apr | design | 0 | 0 | 0 | - | 0 | +23.08 |  |
| 03 May 2021 - 07 May | design | 2 | 1 | 1 | 50% | -0.06 | +23.02 | MonL+0.17 ThuS-0.24 |
| 10 May 2021 - 14 May | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 17 May 2021 - 21 May | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 24 May 2021 - 28 May | design | 2 | 1 | 1 | 50% | +0.00 | +23.02 | TueS-0.04 ThuL+0.04 |
| 31 May 2021 - 04 Jun | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 07 Jun 2021 - 11 Jun | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 14 Jun 2021 - 18 Jun | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 21 Jun 2021 - 25 Jun | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 28 Jun 2021 - 02 Jul | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 05 Jul 2021 - 09 Jul | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 12 Jul 2021 - 16 Jul | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 19 Jul 2021 - 23 Jul | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 26 Jul 2021 - 30 Jul | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 02 Aug 2021 - 06 Aug | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 09 Aug 2021 - 13 Aug | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 16 Aug 2021 - 20 Aug | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 23 Aug 2021 - 27 Aug | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 30 Aug 2021 - 03 Sep | design | 0 | 0 | 0 | - | 0 | +23.02 |  |
| 06 Sep 2021 - 10 Sep | design | 1 | 0 | 1 | 0% | -1.14 | +21.87 | ThuL-1.14 |
| 13 Sep 2021 - 17 Sep | design | 0 | 0 | 0 | - | 0 | +21.87 |  |
| 20 Sep 2021 - 24 Sep | design | 0 | 0 | 0 | - | 0 | +21.87 |  |
| 27 Sep 2021 - 01 Oct | design | 3 | 0 | 3 | 0% | -2.41 | +19.47 | MonL-0.25 TueS-1.09 ThuL-1.06 |
| 04 Oct 2021 - 08 Oct | design | 0 | 0 | 0 | - | 0 | +19.47 |  |
| 11 Oct 2021 - 15 Oct | design | 0 | 0 | 0 | - | 0 | +19.47 |  |
| 18 Oct 2021 - 22 Oct | design | 0 | 0 | 0 | - | 0 | +19.47 |  |
| 25 Oct 2021 - 29 Oct | design | 1 | 1 | 0 | 100% | +1.89 | +21.36 | WedS+1.89 |
| 01 Nov 2021 - 05 Nov | design | 1 | 0 | 1 | 0% | -0.18 | +21.17 | ThuS-0.18 |
| 08 Nov 2021 - 12 Nov | design | 1 | 1 | 0 | 100% | +0.49 | +21.67 | MonL+0.49 |
| 15 Nov 2021 - 19 Nov | design | 0 | 0 | 0 | - | 0 | +21.67 |  |
| 22 Nov 2021 - 26 Nov | design | 1 | 1 | 0 | 100% | +0.60 | +22.27 | ThuS+0.60 |
| 29 Nov 2021 - 03 Dec | design | 0 | 0 | 0 | - | 0 | +22.27 |  |
| 06 Dec 2021 - 10 Dec | design | 1 | 0 | 1 | 0% | -1.08 | +21.19 | WedS-1.08 |
| 13 Dec 2021 - 17 Dec | design | 1 | 1 | 0 | 100% | +0.13 | +21.32 | ThuL+0.13 |
| 20 Dec 2021 - 24 Dec | design | 1 | 1 | 0 | 100% | +1.23 | +22.55 | ThuL+1.23 |
| 27 Dec 2021 - 31 Dec | design | 1 | 0 | 1 | 0% | -1.11 | +21.44 | FriS-1.11 |
| 03 Jan 2022 - 07 Jan | design | 1 | 0 | 1 | 0% | -0.10 | +21.33 | TueL-0.10 |
| 10 Jan 2022 - 14 Jan | design | 0 | 0 | 0 | - | 0 | +21.33 |  |
| 17 Jan 2022 - 21 Jan | design | 2 | 1 | 1 | 50% | -1.06 | +20.27 | WedL+0.02 ThuL-1.08 |
| 24 Jan 2022 - 28 Jan | design | 1 | 0 | 1 | 0% | -0.60 | +19.68 | MonS-0.60 |
| 31 Jan 2022 - 04 Feb | design | 1 | 0 | 1 | 0% | -1.06 | +18.62 | ThuS-1.06 |
| 07 Feb 2022 - 11 Feb | design | 1 | 1 | 0 | 100% | +0.67 | +19.29 | ThuL+0.67 |
| 14 Feb 2022 - 18 Feb | design | 2 | 0 | 2 | 0% | -1.07 | +18.23 | TueS-1.03 ThuL-0.03 |
| 21 Feb 2022 - 25 Feb | design | 2 | 1 | 1 | 50% | -0.06 | +18.17 | TueS+1.00 FriS-1.07 |
| 28 Feb 2022 - 04 Mar | design | 1 | 0 | 1 | 0% | -1.03 | +17.13 | WedL-1.03 |
| 07 Mar 2022 - 11 Mar | design | 2 | 1 | 1 | 50% | -0.59 | +16.54 | MonS+0.47 WedS-1.06 |
| 14 Mar 2022 - 18 Mar | design | 1 | 1 | 0 | 100% | +1.10 | +17.65 | FriL+1.10 |
| 21 Mar 2022 - 25 Mar | design | 0 | 0 | 0 | - | 0 | +17.65 |  |
| 28 Mar 2022 - 01 Apr | design | 1 | 0 | 1 | 0% | -1.05 | +16.60 | ThuL-1.05 |
| 04 Apr 2022 - 08 Apr | design | 0 | 0 | 0 | - | 0 | +16.60 |  |
| 11 Apr 2022 - 15 Apr | design | 1 | 1 | 0 | 100% | +3.69 | +20.29 | ThuL+3.69 |
| 18 Apr 2022 - 22 Apr | design | 1 | 1 | 0 | 100% | +0.29 | +20.58 | FriS+0.29 |
| 25 Apr 2022 - 29 Apr | design | 1 | 0 | 1 | 0% | -1.08 | +19.51 | WedL-1.08 |
| 02 May 2022 - 06 May | design | 3 | 3 | 0 | 100% | +2.33 | +21.84 | TueS+1.30 ThuS+0.09 FriS+0.94 |
| 09 May 2022 - 13 May | design | 0 | 0 | 0 | - | 0 | +21.84 |  |
| 16 May 2022 - 20 May | design | 1 | 1 | 0 | 100% | +2.01 | +23.85 | WedS+2.01 |
| 23 May 2022 - 27 May | design | 1 | 0 | 1 | 0% | -1.05 | +22.79 | MonS-1.05 |
| 30 May 2022 - 03 Jun | design | 1 | 1 | 0 | 100% | +1.76 | +24.56 | WedS+1.76 |
| 06 Jun 2022 - 10 Jun | design | 1 | 1 | 0 | 100% | +0.51 | +25.06 | TueL+0.51 |
| 13 Jun 2022 - 17 Jun | design | 3 | 2 | 1 | 67% | +0.00 | +25.07 | MonS+0.49 TueS+0.57 WedL-1.05 |
| 20 Jun 2022 - 24 Jun | design | 0 | 0 | 0 | - | 0 | +25.07 |  |
| 27 Jun 2022 - 01 Jul | design | 2 | 2 | 0 | 100% | +2.44 | +27.50 | WedS+0.71 ThuL+1.73 |
| 04 Jul 2022 - 08 Jul | design | 1 | 0 | 1 | 0% | -1.06 | +26.44 | ThuL-1.06 |
| 11 Jul 2022 - 15 Jul | design | 0 | 0 | 0 | - | 0 | +26.44 |  |
| 18 Jul 2022 - 22 Jul | design | 1 | 1 | 0 | 100% | +0.65 | +27.09 | TueS+0.65 |
| 25 Jul 2022 - 29 Jul | design | 2 | 1 | 1 | 50% | +0.67 | +27.76 | TueL-1.04 ThuL+1.71 |
| 01 Aug 2022 - 05 Aug | design | 2 | 1 | 1 | 50% | +0.05 | +27.82 | MonL+0.11 FriS-0.06 |
| 08 Aug 2022 - 12 Aug | design | 0 | 0 | 0 | - | 0 | +27.82 |  |
| 15 Aug 2022 - 19 Aug | design | 2 | 1 | 1 | 50% | -0.78 | +27.04 | WedS-1.07 FriS+0.29 |
| 22 Aug 2022 - 26 Aug | design | 0 | 0 | 0 | - | 0 | +27.04 |  |
| 29 Aug 2022 - 02 Sep | design | 3 | 1 | 2 | 33% | -1.75 | +25.29 | TueS+0.34 WedS-1.05 FriS-1.04 |
| 05 Sep 2022 - 09 Sep | design | 1 | 0 | 1 | 0% | -1.04 | +24.25 | WedS-1.04 |
| 12 Sep 2022 - 16 Sep | design | 3 | 1 | 2 | 33% | -0.81 | +23.44 | MonL-0.47 WedL-0.48 ThuS+0.14 |
| 19 Sep 2022 - 23 Sep | design | 0 | 0 | 0 | - | 0 | +23.44 |  |
| 26 Sep 2022 - 30 Sep | design | 2 | 0 | 2 | 0% | -2.06 | +21.38 | MonL-1.02 WedS-1.04 |
| 03 Oct 2022 - 07 Oct | design | 0 | 0 | 0 | - | 0 | +21.38 |  |
| 10 Oct 2022 - 14 Oct | design | 2 | 2 | 0 | 100% | +1.36 | +22.74 | ThuL+1.25 FriS+0.11 |
| 17 Oct 2022 - 21 Oct | design | 0 | 0 | 0 | - | 0 | +22.74 |  |
| 24 Oct 2022 - 28 Oct | design | 2 | 1 | 1 | 50% | +0.60 | +23.35 | WedL+1.64 ThuL-1.04 |
| 31 Oct 2022 - 04 Nov | design | 1 | 1 | 0 | 100% | +0.09 | +23.44 | MonS+0.09 |
| 07 Nov 2022 - 11 Nov | design | 3 | 2 | 1 | 67% | -0.41 | +23.02 | MonL+0.52 WedS+0.10 FriS-1.03 |
| 14 Nov 2022 - 18 Nov | design | 2 | 0 | 2 | 0% | -1.54 | +21.49 | TueL-1.06 ThuS-0.48 |
| 21 Nov 2022 - 25 Nov | design | 2 | 1 | 1 | 50% | +0.22 | +21.71 | WedL+0.46 ThuL-0.24 |
| 28 Nov 2022 - 02 Dec | design | 1 | 1 | 0 | 100% | +1.37 | +23.08 | MonS+1.37 |
| 05 Dec 2022 - 09 Dec | design | 1 | 1 | 0 | 100% | +1.37 | +24.45 | MonS+1.37 |
| 12 Dec 2022 - 16 Dec | design | 1 | 1 | 0 | 100% | +1.89 | +26.35 | ThuS+1.89 |
| 19 Dec 2022 - 23 Dec | design | 1 | 1 | 0 | 100% | +0.17 | +26.52 | ThuS+0.17 |
| 26 Dec 2022 - 30 Dec | design | 0 | 0 | 0 | - | 0 | +26.52 |  |
| 02 Jan 2023 - 06 Jan | design | 0 | 0 | 0 | - | 0 | +26.52 |  |
| 09 Jan 2023 - 13 Jan | design | 0 | 0 | 0 | - | 0 | +26.52 |  |
| 16 Jan 2023 - 20 Jan | design | 0 | 0 | 0 | - | 0 | +26.52 |  |
| 23 Jan 2023 - 27 Jan | design | 0 | 0 | 0 | - | 0 | +26.52 |  |
| 30 Jan 2023 - 03 Feb | design | 0 | 0 | 0 | - | 0 | +26.52 |  |
| 06 Feb 2023 - 10 Feb | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 13 Feb 2023 - 17 Feb | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 20 Feb 2023 - 24 Feb | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 27 Feb 2023 - 03 Mar | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 06 Mar 2023 - 10 Mar | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 13 Mar 2023 - 17 Mar | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 20 Mar 2023 - 24 Mar | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 27 Mar 2023 - 31 Mar | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 03 Apr 2023 - 07 Apr | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 10 Apr 2023 - 14 Apr | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 17 Apr 2023 - 21 Apr | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 24 Apr 2023 - 28 Apr | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 01 May 2023 - 05 May | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 08 May 2023 - 12 May | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 15 May 2023 - 19 May | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 22 May 2023 - 26 May | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 29 May 2023 - 02 Jun | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 05 Jun 2023 - 09 Jun | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 12 Jun 2023 - 16 Jun | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 19 Jun 2023 - 23 Jun | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 26 Jun 2023 - 30 Jun | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 03 Jul 2023 - 07 Jul | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 10 Jul 2023 - 14 Jul | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 17 Jul 2023 - 21 Jul | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 24 Jul 2023 - 28 Jul | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 31 Jul 2023 - 04 Aug | design | 0 | 0 | 0 | - | 0 | +26.52 | data holes |
| 07 Aug 2023 - 11 Aug | design | 0 | 0 | 0 | - | 0 | +26.52 |  |
| 14 Aug 2023 - 18 Aug | design | 0 | 0 | 0 | - | 0 | +26.52 |  |
| 21 Aug 2023 - 25 Aug | design | 0 | 0 | 0 | - | 0 | +26.52 |  |
| 28 Aug 2023 - 01 Sep | design | 0 | 0 | 0 | - | 0 | +26.52 |  |
| 04 Sep 2023 - 08 Sep | design | 0 | 0 | 0 | - | 0 | +26.52 |  |
| 11 Sep 2023 - 15 Sep | design | 1 | 0 | 1 | 0% | -0.28 | +26.24 | WedL-0.28 |
| 18 Sep 2023 - 22 Sep | design | 1 | 0 | 1 | 0% | -1.05 | +25.19 | ThuS-1.05 |
| 25 Sep 2023 - 29 Sep | design | 0 | 0 | 0 | - | 0 | +25.19 |  |
| 02 Oct 2023 - 06 Oct | design | 0 | 0 | 0 | - | 0 | +25.19 |  |
| 09 Oct 2023 - 13 Oct | design | 0 | 0 | 0 | - | 0 | +25.19 |  |
| 16 Oct 2023 - 20 Oct | design | 0 | 0 | 0 | - | 0 | +25.19 |  |
| 23 Oct 2023 - 27 Oct | design | 1 | 1 | 0 | 100% | +0.32 | +25.52 | ThuL+0.32 |
| 30 Oct 2023 - 03 Nov | design | 1 | 1 | 0 | 100% | +1.12 | +26.64 | ThuS+1.12 |
| 06 Nov 2023 - 10 Nov | design | 1 | 0 | 1 | 0% | -0.65 | +25.99 | FriS-0.65 |
| 13 Nov 2023 - 17 Nov | design | 0 | 0 | 0 | - | 0 | +25.99 |  |
| 20 Nov 2023 - 24 Nov | design | 0 | 0 | 0 | - | 0 | +25.99 |  |
| 27 Nov 2023 - 01 Dec | design | 0 | 0 | 0 | - | 0 | +25.99 |  |
| 04 Dec 2023 - 08 Dec | design | 0 | 0 | 0 | - | 0 | +25.99 |  |
| 11 Dec 2023 - 15 Dec | design | 0 | 0 | 0 | - | 0 | +25.99 |  |
| 18 Dec 2023 - 22 Dec | design | 0 | 0 | 0 | - | 0 | +25.99 |  |
| 25 Dec 2023 - 29 Dec | design | 0 | 0 | 0 | - | 0 | +25.99 |  |
| 01 Jan 2024 - 05 Jan | design | 0 | 0 | 0 | - | 0 | +25.99 |  |
| 08 Jan 2024 - 12 Jan | design | 0 | 0 | 0 | - | 0 | +25.99 |  |
| 15 Jan 2024 - 19 Jan | design | 0 | 0 | 0 | - | 0 | +25.99 |  |
| 22 Jan 2024 - 26 Jan | design | 0 | 0 | 0 | - | 0 | +25.99 |  |
| 29 Jan 2024 - 02 Feb | design | 0 | 0 | 0 | - | 0 | +25.99 |  |
| 05 Feb 2024 - 09 Feb | design | 1 | 1 | 0 | 100% | +0.81 | +26.80 | TueL+0.81 |
| 12 Feb 2024 - 16 Feb | design | 0 | 0 | 0 | - | 0 | +26.80 |  |
| 19 Feb 2024 - 23 Feb | design | 0 | 0 | 0 | - | 0 | +26.80 |  |
| 26 Feb 2024 - 01 Mar | design | 0 | 0 | 0 | - | 0 | +26.80 |  |
| 04 Mar 2024 - 08 Mar | design | 0 | 0 | 0 | - | 0 | +26.80 |  |
| 11 Mar 2024 - 15 Mar | design | 0 | 0 | 0 | - | 0 | +26.80 |  |
| 18 Mar 2024 - 22 Mar | design | 0 | 0 | 0 | - | 0 | +26.80 |  |
| 25 Mar 2024 - 29 Mar | design | 0 | 0 | 0 | - | 0 | +26.80 |  |
| 01 Apr 2024 - 05 Apr | design | 0 | 0 | 0 | - | 0 | +26.80 |  |
| 08 Apr 2024 - 12 Apr | design | 0 | 0 | 0 | - | 0 | +26.80 |  |
| 15 Apr 2024 - 19 Apr | design | 0 | 0 | 0 | - | 0 | +26.80 |  |
| 22 Apr 2024 - 26 Apr | design | 0 | 0 | 0 | - | 0 | +26.80 |  |
| 29 Apr 2024 - 03 May | design | 1 | 1 | 0 | 100% | +0.29 | +27.09 | FriS+0.29 |
| 06 May 2024 - 10 May | design | 0 | 0 | 0 | - | 0 | +27.09 |  |
| 13 May 2024 - 17 May | design | 0 | 0 | 0 | - | 0 | +27.09 |  |
| 20 May 2024 - 24 May | design | 0 | 0 | 0 | - | 0 | +27.09 |  |
| 27 May 2024 - 31 May | design | 0 | 0 | 0 | - | 0 | +27.09 |  |
| 03 Jun 2024 - 07 Jun | design | 0 | 0 | 0 | - | 0 | +27.09 |  |
| 10 Jun 2024 - 14 Jun | design | 0 | 0 | 0 | - | 0 | +27.09 |  |
| 17 Jun 2024 - 21 Jun | design | 0 | 0 | 0 | - | 0 | +27.09 |  |
| 24 Jun 2024 - 28 Jun | design | 0 | 0 | 0 | - | 0 | +27.09 |  |
| 01 Jul 2024 - 05 Jul | design | 2 | 2 | 0 | 100% | +1.11 | +28.20 | TueL+0.09 FriL+1.01 |
| 08 Jul 2024 - 12 Jul | design | 1 | 1 | 0 | 100% | +0.42 | +28.62 | WedL+0.42 |
| 15 Jul 2024 - 19 Jul | design | 0 | 0 | 0 | - | 0 | +28.62 |  |
| 22 Jul 2024 - 26 Jul | design | 0 | 0 | 0 | - | 0 | +28.62 |  |
| 29 Jul 2024 - 02 Aug | design | 0 | 0 | 0 | - | 0 | +28.62 |  |
| 05 Aug 2024 - 09 Aug | design | 2 | 1 | 1 | 50% | +1.27 | +29.88 | TueS-0.54 ThuL+1.81 |
| 12 Aug 2024 - 16 Aug | design | 1 | 1 | 0 | 100% | +0.22 | +30.10 | ThuL+0.22 |
| 19 Aug 2024 - 23 Aug | design | 0 | 0 | 0 | - | 0 | +30.10 |  |
| 26 Aug 2024 - 30 Aug | design | 1 | 1 | 0 | 100% | +0.78 | +30.89 | TueL+0.78 |
| 02 Sep 2024 - 06 Sep | design | 1 | 1 | 0 | 100% | +0.22 | +31.10 | FriL+0.22 |
| 09 Sep 2024 - 13 Sep | design | 0 | 0 | 0 | - | 0 | +31.10 |  |
| 16 Sep 2024 - 20 Sep | design | 1 | 0 | 1 | 0% | -1.06 | +30.04 | WedL-1.06 |
| 23 Sep 2024 - 27 Sep | design | 2 | 2 | 0 | 100% | +3.45 | +33.49 | ThuL+2.44 FriS+1.01 |
| 30 Sep 2024 - 04 Oct | design | 1 | 1 | 0 | 100% | +0.67 | +34.16 | ThuS+0.67 |
| 07 Oct 2024 - 11 Oct | design | 0 | 0 | 0 | - | 0 | +34.16 |  |
| 14 Oct 2024 - 18 Oct | design | 1 | 0 | 1 | 0% | -0.27 | +33.88 | ThuL-0.27 |
| 21 Oct 2024 - 25 Oct | design | 1 | 1 | 0 | 100% | +0.36 | +34.24 | TueS+0.36 |
| 28 Oct 2024 - 01 Nov | design | 4 | 1 | 3 | 25% | -1.52 | +32.72 | TueL+1.26 WedS-1.07 ThuS-0.64 FriL-1.07 |
| 04 Nov 2024 - 08 Nov | design | 0 | 0 | 0 | - | 0 | +32.72 |  |
| 11 Nov 2024 - 15 Nov | design | 1 | 1 | 0 | 100% | +0.79 | +33.50 | MonL+0.79 |
| 18 Nov 2024 - 22 Nov | design | 1 | 0 | 1 | 0% | -1.05 | +32.46 | TueS-1.05 |
| 25 Nov 2024 - 29 Nov | design | 1 | 1 | 0 | 100% | +0.63 | +33.08 | MonS+0.63 |
| 02 Dec 2024 - 06 Dec | design | 0 | 0 | 0 | - | 0 | +33.08 |  |
| 09 Dec 2024 - 13 Dec | design | 1 | 0 | 1 | 0% | -0.22 | +32.86 | FriS-0.22 |
| 16 Dec 2024 - 20 Dec | design | 2 | 2 | 0 | 100% | +2.79 | +35.65 | ThuS+0.95 FriL+1.84 |
| 23 Dec 2024 - 27 Dec | design | 1 | 0 | 1 | 0% | -0.10 | +35.55 | FriL-0.10 |
| 30 Dec 2024 - 03 Jan | design | 0 | 0 | 0 | - | 0 | +35.55 |  |
| 06 Jan 2025 - 10 Jan | design | 1 | 0 | 1 | 0% | -0.30 | +35.25 | ThuL-0.30 |
| 13 Jan 2025 - 17 Jan | design | 0 | 0 | 0 | - | 0 | +35.25 |  |
| 20 Jan 2025 - 24 Jan | design | 1 | 0 | 1 | 0% | -1.07 | +34.17 | MonS-1.07 |
| 27 Jan 2025 - 31 Jan | design | 1 | 0 | 1 | 0% | -0.34 | +33.83 | WedS-0.34 |
| 03 Feb 2025 - 07 Feb | design | 2 | 1 | 1 | 50% | +0.07 | +33.90 | MonL+1.13 ThuS-1.06 |
| 10 Feb 2025 - 14 Feb | design | 1 | 1 | 0 | 100% | +0.89 | +34.78 | TueL+0.89 |
| 17 Feb 2025 - 21 Feb | design | 0 | 0 | 0 | - | 0 | +34.78 |  |
| 24 Feb 2025 - 28 Feb | design | 0 | 0 | 0 | - | 0 | +34.78 |  |
| 03 Mar 2025 - 07 Mar | design | 1 | 0 | 1 | 0% | -1.03 | +33.75 | TueS-1.03 |
| 10 Mar 2025 - 14 Mar | design | 1 | 0 | 1 | 0% | -0.26 | +33.49 | FriS-0.26 |
| 17 Mar 2025 - 21 Mar | design | 0 | 0 | 0 | - | 0 | +33.49 |  |
| 24 Mar 2025 - 28 Mar | design | 1 | 1 | 0 | 100% | +0.77 | +34.27 | WedS+0.77 |
| 31 Mar 2025 - 04 Apr | design | 0 | 0 | 0 | - | 0 | +34.27 |  |
| 07 Apr 2025 - 11 Apr | design | 2 | 1 | 1 | 50% | +1.10 | +35.37 | TueL-1.05 WedS+2.15 |
| 14 Apr 2025 - 18 Apr | design | 1 | 1 | 0 | 100% | +0.81 | +36.18 | MonL+0.81 |
| 21 Apr 2025 - 25 Apr | design | 0 | 0 | 0 | - | 0 | +36.18 |  |
| 28 Apr 2025 - 02 May | design | 2 | 2 | 0 | 100% | +3.25 | +39.44 | MonL+1.58 WedS+1.67 |
| 05 May 2025 - 09 May | design | 1 | 1 | 0 | 100% | +0.37 | +39.81 | TueL+0.37 |
| 12 May 2025 - 16 May | design | 1 | 0 | 1 | 0% | -1.03 | +38.78 | MonL-1.03 |
| 19 May 2025 - 23 May | design | 0 | 0 | 0 | - | 0 | +38.78 |  |
| 26 May 2025 - 30 May | design | 0 | 0 | 0 | - | 0 | +38.78 |  |
| 02 Jun 2025 - 06 Jun | design | 0 | 0 | 0 | - | 0 | +38.78 |  |
| 09 Jun 2025 - 13 Jun | design | 1 | 1 | 0 | 100% | +0.16 | +38.94 | ThuS+0.16 |
| 16 Jun 2025 - 20 Jun | design | 0 | 0 | 0 | - | 0 | +38.94 |  |
| 23 Jun 2025 - 27 Jun | design | 1 | 1 | 0 | 100% | +0.74 | +39.68 | FriS+0.74 |
| 30 Jun 2025 - 04 Jul | design | 1 | 0 | 1 | 0% | -1.04 | +38.64 | WedS-1.04 |
| 07 Jul 2025 - 11 Jul | design | 2 | 0 | 2 | 0% | -1.08 | +37.56 | MonL-1.07 FriS-0.02 |
| 14 Jul 2025 - 18 Jul | design | 0 | 0 | 0 | - | 0 | +37.56 |  |
| 21 Jul 2025 - 25 Jul | design | 0 | 0 | 0 | - | 0 | +37.56 |  |
| 28 Jul 2025 - 01 Aug | design | 2 | 0 | 2 | 0% | -1.09 | +36.47 | ThuS-0.04 FriS-1.05 |
| 04 Aug 2025 - 08 Aug | design | 0 | 0 | 0 | - | 0 | +36.47 |  |
| 11 Aug 2025 - 15 Aug | design | 0 | 0 | 0 | - | 0 | +36.47 |  |
| 18 Aug 2025 - 22 Aug | design | 1 | 1 | 0 | 100% | +0.30 | +36.77 | WedS+0.30 |
| 25 Aug 2025 - 29 Aug | design | 1 | 0 | 1 | 0% | -1.08 | +35.69 | ThuS-1.08 |
| 01 Sep 2025 - 05 Sep | design | 0 | 0 | 0 | - | 0 | +35.69 |  |
| 08 Sep 2025 - 12 Sep | design | 0 | 0 | 0 | - | 0 | +35.69 |  |
| 15 Sep 2025 - 19 Sep | design | 0 | 0 | 0 | - | 0 | +35.69 |  |
| 22 Sep 2025 - 26 Sep | design | 0 | 0 | 0 | - | 0 | +35.69 |  |
| 29 Sep 2025 - 03 Oct | design | 2 | 1 | 1 | 50% | -0.57 | +35.13 | WedL-0.63 ThuS+0.06 |
| 06 Oct 2025 - 10 Oct | design | 0 | 0 | 0 | - | 0 | +35.13 |  |
| 13 Oct 2025 - 17 Oct | design | 0 | 0 | 0 | - | 0 | +35.13 |  |
| 20 Oct 2025 - 24 Oct | design | 0 | 0 | 0 | - | 0 | +35.13 |  |
| 27 Oct 2025 - 31 Oct | design | 1 | 0 | 1 | 0% | -1.05 | +34.08 | TueS-1.05 |
| 03 Nov 2025 - 07 Nov | design | 0 | 0 | 0 | - | 0 | +34.08 |  |
| 10 Nov 2025 - 14 Nov | design | 1 | 0 | 1 | 0% | -1.09 | +32.99 | WedS-1.09 |
| 17 Nov 2025 - 21 Nov | design | 1 | 0 | 1 | 0% | -1.07 | +31.92 | FriL-1.07 |
| 24 Nov 2025 - 28 Nov | design | 0 | 0 | 0 | - | 0 | +31.92 |  |
| 01 Dec 2025 - 05 Dec | design | 1 | 1 | 0 | 100% | +0.07 | +31.99 | WedL+0.07 |
| 08 Dec 2025 - 12 Dec | design | 0 | 0 | 0 | - | 0 | +31.99 |  |
| 15 Dec 2025 - 19 Dec | design | 1 | 0 | 1 | 0% | -0.60 | +31.40 | ThuL-0.60 |
| 22 Dec 2025 - 26 Dec | design | 0 | 0 | 0 | - | 0 | +31.40 |  |
| 29 Dec 2025 - 02 Jan | design | 0 | 0 | 0 | - | 0 | +31.40 |  |
| 05 Jan 2026 - 09 Jan | design | 1 | 1 | 0 | 100% | +1.40 | +32.80 | MonL+1.40 |
| 12 Jan 2026 - 16 Jan | design | 0 | 0 | 0 | - | 0 | +32.80 |  |
| 19 Jan 2026 - 23 Jan | design | 1 | 1 | 0 | 100% | +3.90 | +36.70 | FriL+3.90 |
| 26 Jan 2026 - 30 Jan | design | 0 | 0 | 0 | - | 0 | +36.70 |  |
| 02 Feb 2026 - 06 Feb | design | 1 | 1 | 0 | 100% | +0.64 | +37.34 | ThuS+0.64 |
| 09 Feb 2026 - 13 Feb | design | 1 | 1 | 0 | 100% | +0.34 | +37.68 | WedL+0.34 |
| 16 Feb 2026 - 20 Feb | design | 1 | 0 | 1 | 0% | -1.04 | +36.63 | TueS-1.04 |
| 23 Feb 2026 - 27 Feb | design | 0 | 0 | 0 | - | 0 | +36.63 |  |
| 02 Mar 2026 - 06 Mar | design | 1 | 0 | 1 | 0% | -1.05 | +35.58 | MonL-1.05 |
| 09 Mar 2026 - 13 Mar | design | 1 | 1 | 0 | 100% | +4.37 | +39.95 | FriS+4.37 |
| 16 Mar 2026 - 20 Mar | design | 1 | 0 | 1 | 0% | -0.46 | +39.50 | FriS-0.46 |
| 23 Mar 2026 - 27 Mar | design | 0 | 0 | 0 | - | 0 | +39.50 |  |
| 30 Mar 2026 - 03 Apr | design | 0 | 0 | 0 | - | 0 | +39.50 |  |
| 06 Apr 2026 - 10 Apr | design | 0 | 0 | 0 | - | 0 | +39.50 |  |
| 13 Apr 2026 - 17 Apr | design | 1 | 0 | 1 | 0% | -0.34 | +39.16 | TueL-0.34 |
| 20 Apr 2026 - 24 Apr | design | 0 | 0 | 0 | - | 0 | +39.16 |  |
| 27 Apr 2026 - 01 May | design | 0 | 0 | 0 | - | 0 | +39.16 |  |
| 04 May 2026 - 08 May | design | 0 | 0 | 0 | - | 0 | +39.16 |  |
| 11 May 2026 - 15 May | design | 0 | 0 | 0 | - | 0 | +39.16 |  |
| 18 May 2026 - 22 May | design | 1 | 0 | 1 | 0% | -1.09 | +38.07 | TueL-1.09 |
| 25 May 2026 - 29 May | design | 0 | 0 | 0 | - | 0 | +38.07 |  |
| 01 Jun 2026 - 05 Jun | design | 0 | 0 | 0 | - | 0 | +38.07 |  |
| 08 Jun 2026 - 12 Jun | design | 0 | 0 | 0 | - | 0 | +38.07 |  |
| 15 Jun 2026 - 19 Jun | design | 0 | 0 | 0 | - | 0 | +38.07 |  |
| 22 Jun 2026 - 26 Jun | design | 1 | 1 | 0 | 100% | +3.63 | +41.70 | FriS+3.63 |
| 29 Jun 2026 - 03 Jul | design | 1 | 0 | 1 | 0% | -0.52 | +41.19 | WedL-0.52 |
| 06 Jul 2026 - 10 Jul | design | 0 | 0 | 0 | - | 0 | +41.19 |  |
| 13 Jul 2026 - 17 Jul | design | 1 | 1 | 0 | 100% | +1.29 | +42.48 | WedL+1.29 |
| 20 Jul 2026 - 24 Jul | design | 1 | 1 | 0 | 100% | +0.46 | +42.94 | TueS+0.46 |
| 27 Jul 2026 - 31 Jul | design | 0 | 0 | 0 | - | 0 | +42.94 |  |
| 03 Aug 2026 - 07 Aug | design | 0 | 0 | 0 | - | 0 | +42.94 |  |
| 10 Aug 2026 - 14 Aug | design | 0 | 0 | 0 | - | 0 | +42.94 |  |
| 17 Aug 2026 - 21 Aug | design | 0 | 0 | 0 | - | 0 | +42.94 |  |
| 24 Aug 2026 - 28 Aug | design | 0 | 0 | 0 | - | 0 | +42.94 |  |
| 31 Aug 2026 - 04 Sep | design | 0 | 0 | 0 | - | 0 | +42.94 |  |
| 07 Sep 2026 - 11 Sep | design | 0 | 0 | 0 | - | 0 | +42.94 |  |
| 14 Sep 2026 - 18 Sep | design | 1 | 0 | 1 | 0% | -1.15 | +41.79 | ThuS-1.15 |
| 21 Sep 2026 - 25 Sep | design | 0 | 0 | 0 | - | 0 | +41.79 |  |
| 28 Sep 2026 - 02 Oct | design | 2 | 0 | 2 | 0% | -2.25 | +39.55 | MonL-1.16 WedL-1.08 |

---

## 3. Step by step, A to Z

### 3.1 Clocks (all rule times are New York time)
The US moves its clocks; Doha does not. **US summer time** runs from the 2nd Sunday of March to the 1st Sunday of November
(Doha = New York + 7 hours). The rest of the year is **US winter time** (Doha = New York + 8 hours).

| Step | New York | Doha (US summer time) | Doha (US winter time) |
|---|---|---|---|
| A "trading day" starts (also the daily-candle start) | 17:00 the evening before | 00:00 | 01:00 |
| Note the two "start" prices (close of the 02:59 candle) | 02:59 → 03:00 | 09:59 → 10:00 | 10:59 → 11:00 |
| The morning window runs | 03:00 – 09:59 | 10:00 – 16:59 | 11:00 – 17:59 |
| Check the setup and enter | 10:00 | 17:00 | 18:00 |
| Close anything still open (close of the 15:59 candle) | 16:00 | 23:00 | 00:00 (midnight) |

### 3.2 Which days to trade
Any Monday to Friday, at most **one trade a day**. **Do not trade:**
- Holidays and short days, when the market is half empty: 25 December, 1 January, and any day your EURUSD or GBPUSD chart is mostly flat or empty.
- Any day when your EURUSD chart has a hole of more than 15 minutes between 19:00 New York the evening before and 16:00 New York,
  or your GBPUSD chart has one between 03:00 and 10:00 New York.
- News days were traded in the test (no clear difference). Skipping them is your choice.

### 3.3 What you need: two charts and one spreadsheet
**Charts:** EURUSD and GBPUSD, **1-minute candles**, set so you can read New York time (or convert from Doha time with the table above).

**The spreadsheet (one row per trading day).** The rules need two numbers that you cannot see on a chart: the **threshold** (how big a
euro-vs-pound gap is "unusual") and the **ATR20** (EURUSD's normal daily range). A spreadsheet works them out for you:

| Column | What to type or calculate | Example (5 Feb 2026) |
|---|---|---|
| A Date | the trading day | 05-Feb-2026 |
| B E0 | EURUSD close of the **02:59 New York** candle | 1.17989 |
| C G0 | GBPUSD close of the **02:59 New York** candle | 1.36200 |
| D E1 | EURUSD close of the **09:59 New York** candle | 1.17979 |
| E G1 | GBPUSD close of the **09:59 New York** candle | 1.35362 |
| F Euro move | `=D/B-1` | -0.0085% |
| G Pound move | `=E/C-1` | -0.6153% |
| H **Gap** | `=F-G` | **+0.6068%** |
| I Gap size | `=ABS(H)` | 0.6068% |
| J **Threshold** | `=PERCENTILE.INC(I of the 250 rows above this one, 0.75)` (leave blank if fewer than 100 rows above) | **0.2100%** |
| K Day high | EURUSD highest price of the trading day (17:00 → 17:00 New York) | (fill in after 17:00 New York) |
| L Day low | EURUSD lowest price of the trading day | |
| M Day range (pips) | `=(K-L)*10000` | |
| N **ATR20** (pips) | `=AVERAGE(M of the 20 rows above this one)` | **82.9** |
| O Morning high | EURUSD highest price 03:00 – 09:59 New York | 1.18218 |
| P Morning low | EURUSD lowest price 03:00 – 09:59 New York | 1.17802 |

How to fill it:
- Rows **B to E** are filled in during the day (at 10:00/11:00 Doha and at 17:00/18:00 Doha). **K, L, M** are filled in after the trading
  day ends (17:00 New York = 00:00/01:00 Doha). Leave holiday or half-empty days (25 Dec, 1 Jan, etc.) out of the ATR (column M blank).
- A daily candle on a broker that uses "New York close" daily candles (most MetaTrader brokers with server time GMT+2/GMT+3) gives
  you K and L directly.
- **Starting the spreadsheet:** you need at least 100 days (ideally 250) of history before the first trade. You do not have to type a
  year of prices: `backtest/days_v3.csv` already has the gap (`gap_pct`), threshold (`threshold_pct`) and ATR (`atr_pips`) for every
  day up to 30 Sep 2026. Copy the last 250 rows of `gap_pct` (as gap sizes) and the last 20 day ranges into your sheet and continue from there.
  (Your broker's prices will differ very slightly; that is fine.)

### 3.4 Before 10:00 New York: mark
1. **At 03:00 New York** (10:00 Doha summer / 11:00 Doha winter): write down **E0** and **G0**, the closing prices of the 02:59 candles.
2. Watch nothing else. The morning window (03:00 – 09:59 New York) is just recorded.

### 3.5 At 10:00 New York (17:00 Doha summer / 18:00 Doha winter): the setup
1. Write down **E1** and **G1** (closes of the 09:59 candles), and EURUSD's **Morning High** and **Morning Low** (03:00 – 09:59 New York).
2. The spreadsheet gives you the **Gap**. Compare its size with today's **Threshold** (worked out from the previous days only).
   - Gap size **not larger** than the Threshold → **no trade today.**
   - Gap **positive** (euro did better than the pound) → plan to **SELL** EURUSD.
   - Gap **negative** (euro did worse than the pound) → plan to **BUY** EURUSD.

### 3.6 Confirmation: has the move stalled?
- Work out the **stop**: SELL → Morning High + 1 pip. BUY → Morning Low − 1 pip.
- **Stop distance** = the distance in pips from E1 to that stop.
- Trade only if the stop distance is **at least 0.15 × ATR20** (price has already come back from the morning extreme) **and at most
  0.6 × ATR20** (the give-back has not already happened), and at least 2.4 pips. Otherwise **no trade today.**

### 3.7 Entry
Enter **at market right at 10:00 New York** (17:00 / 18:00 Doha). Do not wait: in the test, entering one minute late cut the profit
by about 10% on design data.

### 3.8 Stop loss, take profit and size (place the stop immediately)
- **Stop loss:** the stop from 3.6. Never moved.
- **Take profit:** **none.** The trade is closed at 16:00 New York unless the stop is hit first.
- **Position size** (1% risk): size = (1% of your balance) ÷ (stop distance in pips × pip value).
  Example: balance 10,000 USD, risk 100 USD, stop 24.9 pips, 10 USD per pip per standard lot → 100 ÷ (24.9 × 10) = **0.40 lots**.

### 3.9 Managing the trade
Do nothing. No break-even, no partial profit, no moving the stop. In the test 7 trades in 10 lasted until the 16:00 close.

### 3.10 When to stop and when to close no matter what
- **Close at 16:00 New York** (23:00 Doha summer / 00:00 midnight Doha winter) at the latest. Never hold overnight.
- **One trade per day.** After it closes, stop for the day.

### 3.11 Worked examples (real trades from the test)
**Winner: Thursday 5 February 2026 (US winter time, Doha = New York + 8 h)**
- 02:59 New York (10:59 Doha): EURUSD **E0 = 1.17989**, GBPUSD **G0 = 1.36200**.
- 09:59 New York (17:59 Doha): EURUSD **E1 = 1.17979**, GBPUSD **G1 = 1.35362**.
- Euro move = 1.17979 ÷ 1.17989 − 1 = −0.0085%. Pound move = 1.35362 ÷ 1.36200 − 1 = −0.6153%.
  **Gap = −0.0085% − (−0.6153%) = +0.6068%**. Threshold that day 0.2100% → the gap is bigger → **SELL** (the pound fell, the euro did not).
- Morning High 1.18218 → **stop 1.18228**. Stop distance = 1.18228 − 1.17979 = **24.9 pips**. ATR20 = 82.9 pips:
  0.15 × 82.9 = 12.4 and 0.6 × 82.9 = 49.7, and 24.9 is in between → **confirmed**.
- Sell at 10:00 New York (18:00 Doha) at **1.17979**, stop 1.18228, no target.
- The stop was never hit. Closed at 16:00 New York (00:00 Doha) at **1.17808**: +17.1 pips − 1.2 cost = 15.9 pips = **+0.64 R**.

**Loser: Monday 2 March 2026 (US winter time)**
- E0 1.17161, G0 1.33618; E1 1.17167, G1 1.34119. Euro +0.005%, pound +0.375% → **gap −0.370%** (threshold 0.204%) → **BUY**.
- Morning Low 1.16949 → stop **1.16939**, distance 22.8 pips (ATR20 57.2: between 8.6 and 34.3 → confirmed).
- Bought at 10:00 New York (18:00 Doha) at 1.17167. Stop hit at 10:37 New York (18:37 Doha): −22.8 pips − 1.2 cost = **−1.05 R**.

**Hidden-years example: Thursday 18 August 2016 (US summer time)** — the best hidden trade:
euro +0.002%, pound +0.613%, gap −0.612% (threshold 0.576%) → BUY at 1.13159, stop 1.13042 (11.7 pips; ATR20 74.4), closed 16:00 New York
(23:00 Doha) at 1.13644 → **+4.04 R**. Without its 5 best trades like this one, the hidden years lose 15 R.

### 3.12 Checklist before every trade (tick all)
- [ ] It is a normal weekday, not a holiday or half-empty day; no data holes on my EURUSD/GBPUSD charts in the hours used.
- [ ] My spreadsheet has at least 100 earlier days of gaps and the last 20 day ranges.
- [ ] E0 and G0 (02:59 New York closes) and E1 and G1 (09:59 New York closes) are written down.
- [ ] Gap size is **bigger** than today's Threshold.
- [ ] Direction: gap positive → SELL; gap negative → BUY.
- [ ] Stop = Morning High + 1 pip (sell) or Morning Low − 1 pip (buy).
- [ ] Stop distance is between 0.15 × ATR20 and 0.6 × ATR20 (and at least 2.4 pips).
- [ ] It is 10:00 New York (17:00 Doha summer / 18:00 Doha winter). No trade taken yet today.
- [ ] Size = 1% risk (or less, see grade C). No take profit.
- [ ] Alarm set for 15:59 New York (22:59 Doha summer / 23:59 Doha winter) to close the trade.

---

## 4. Known weaknesses (read these before doing anything with it)
1. **It lost money on the unseen years.** 2016-2018: -2.4 R on 63 trades, only 1 of 3 years positive, -6.1 R at double cost.
   All of its good results come from the years used to build it.
2. **Selling into a rising euro fails.** In 2017 the euro rose most of the year; the sell trades lost 9.6 R. The sell side was also the
   weak side in 2021, 2023 and 2025.
3. **It depends on a few big winners.** Wins at the 16:00 close can be +2 to +4 R; without its 5 best trades the hidden years lose 15 R.
4. **Very few trades:** about 2 a month (24 to 30 a year). A bad year can be just bad luck, and a good year can be just good luck. You
   will need years, not months, to know if it works.
5. **The story behind it is shaky.** In 3 trades out of 4 the pound moved and the euro did not; the team's explanation ("the euro gives
   back its own move") fits only the other quarter, and those trades lost money on the hidden years.
6. **Exact timing matters.** Entry must be right at 10:00 New York; one minute late cost about 10% of the design profit.
7. **It needs a spreadsheet** (gap, threshold, ATR) and two charts every day. Mistakes in copying prices change the decision.
8. **Evening hours in Doha:** entry at 17:00 or 18:00 Doha, forced close at 23:00 or midnight Doha.
9. **Data:** the test used one free data source (HistData bid prices). Your broker's prices and spread will differ slightly.

---

## 5. Before you use it: your own checks
1. **Repeat the backtest by hand** on at least 10 trades from `backtest/trades_v3.csv` (5 hidden, 5 design): same dates, same direction,
   similar E0/E1/G0/G1, morning high/low and stop on your broker's charts. Note any differences.
2. **Do not trade it with real money.** It is grade C. If you want to follow it, keep a **paper log** (or demo account) from now on,
   with the checklist, for at least 50 trades (about 2 years). Compare with the test: about 2 trades a month, 7 in 10 closing at 16:00,
   wins around +1.0 R and losses around -0.8 R.
3. Only if that log is clearly positive (see "What would upgrade it to B" at the top) is it worth another look by the team.

*Past results do not guarantee future results. A strategy that made money in the past can lose money in the future.
Trading carries a real risk of loss. This is not financial advice.*
