# GBPUSD: Final strategy for this round, "Quiet-Asia breakout" (v3)

Prepared by Agent 2 (Backtest & Performance Manager), 10 Oct 2026. Written for someone who has never seen the strategy.

> ## Grade: **B: Promising** (not proven)
> **What B means:** it made money on price data that nobody used to build the rules, but the edge is small and uneven.
> It is **not** a proven strategy (that would be grade A). My test verdict was **IMPROVE**, so it must not be traded with real money
> before your own checks.
>
> **The evidence in four lines:**
> - On the 3 years nobody had seen when the rules were written (2016-2018): 139 trades, **+8.4 R** (about +8% of the account),
>   2 of 3 years positive (2016 -1.8 R, 2017 +3.2 R, 2018 +7.0 R). Longest losing run: 6. Worst drop from a peak: 10.5 R (about 10%).
> - But that is only **+0.06 R per trade**. If your costs are double the test's (3 pips instead of 1.5), those 3 years **lose 3.0 R**.
>   Without the 5 best hidden trades, they **lose 1.4 R**. There is roughly **a 1 in 3 chance the real edge is zero**.
> - On the 7.75 years the rules were built on (2019 - Sep 2026) it made +39.4 R (+0.13 R per trade), but it was picked as the best of 47
>   ideas tested on those years, so that number flatters it.
> - All 10.75 years together: 435 trades, +47.8 R, 8 of 11 years positive, longest losing run 8.
>
> **What would upgrade it to A:** at least 50 new trades (about 15 months at this strategy's pace) from your own demo trading from now on,
> at your real broker cost, clearly positive at more than +0.10 R per trade, with no losing run longer than 8.
> **What would downgrade it (stop using it):** a losing run of **9 or more** trades (never happened in 10.75 years), or any calendar quarter
> worse than **-7.8 R** (the worst quarter seen, Oct-Dec 2016), or an all-in broker cost above 1.5 pips per trade at 07:00 London.

*Past results do not guarantee future results. Trading carries a real risk of loss. This is not financial advice.*

---

## 1. Why it works (the idea in plain words)
During the Asian night the pound usually moves in a box of about 25-40 pips. Some nights it is unusually quiet, with a box much smaller
than normal. When London opens (07:00 London time), the big banks and funds arrive, and after a quiet night the price often breaks out of
the night's box and keeps going.

The strategy does not guess the direction. It places two waiting orders: one to **buy** if price rises above the night's high, and one to
**sell** if price falls below the night's low. Whichever is triggered first is the trade, and the other order is cancelled. The stop loss
is the other side of the box, so it is small; the take profit is twice the stop distance.

Honest note: it wins only about **4 trades in 10**. It makes money because each win (about +1.9 R) is almost twice the size of each loss
(about -1.1 R). Because the stop is small (typically 18 pips), the trading cost (1.5 pips) takes about 0.08 R from every trade, which is
more than the whole edge seen on the hidden years. **Your broker's cost decides whether this strategy makes money.**

---

## 2. Backtest results

**How it was tested:** a computer program walked through every minute of GBPUSD price data (1-minute candles, HistData bid prices) from
Jan 2016 to Sep 2026, following the rules below exactly. Every trade has a **cost of 1.5 pips** (spread and slippage) taken off. If the stop
and the target were both touched in the same minute, the test counted the stop. 1 R = the 1% of the account risked per trade. The trade
list is in `backtest/trades_v3.csv` (date, Doha / New York / London time, direction, entry, stop, target, exit, result), so you can check
any trade by hand. The test program was written independently of the researcher's; on the 296 days both programs trade, every trade matches.

**Periods:** **hidden** = 2016-2018, not used to build the rules (the real test). **design** = 2019 - Sep 2026, used to build the rules.

| Period | Trades | Win rate | Avg win / avg loss | Total | Per trade | Profit factor* | Biggest drop | Longest losing run | Total at 3-pip cost |
|---|---|---|---|---|---|---|---|---|---|
| 2016 (hidden) | 48 | 35% | +1.83 / -1.06 R | **-1.8 R** | -0.04 R | 0.95 | -8.2 R | 6 | -4.7 R |
| 2017 (hidden) | 48 | 40% | +1.84 / -1.10 R | **+3.2 R** | +0.07 R | 1.10 | -9.8 R | 4 | -1.3 R |
| 2018 (hidden) | 43 | 42% | +1.91 / -1.09 R | **+7.0 R** | +0.16 R | 1.26 | -5.4 R | 4 | +3.1 R |
| 2019 (design) | 45 | 31% | +1.89 / -1.08 R | -7.2 R | -0.16 R | 0.79 | -9.2 R | 5 | -12.3 R |
| 2020 (design) | 46 | 39% | +1.86 / -0.97 R | +6.3 R | +0.14 R | 1.23 | -6.7 R | 8 | +3.2 R |
| 2021 (design) | 36 | 42% | +1.80 / -1.04 R | +5.2 R | +0.14 R | 1.24 | -5.5 R | 5 | +2.2 R |
| 2022 (design) | 36 | 50% | +1.86 / -1.00 R | +15.5 R | +0.43 R | 1.86 | -3.3 R | 4 | +13.3 R |
| 2023 (design; Feb-Jul data holes) | 17 | 47% | +1.90 / -1.08 R | +5.5 R | +0.33 R | 1.57 | -5.3 R | 5 | +4.1 R |
| 2024 (design) | 41 | 44% | +1.81 / -1.12 R | +6.9 R | +0.17 R | 1.27 | -7.8 R | 7 | +2.0 R |
| 2025 (design) | 42 | 45% | +1.86 / -1.08 R | +10.6 R | +0.25 R | 1.43 | -4.5 R | 4 | +7.4 R |
| 2026 Jan-Sep (design) | 33 | 33% | +1.84 / -1.08 R | -3.4 R | -0.10 R | 0.86 | -6.2 R | 4 | -6.5 R |
| **All hidden 2016-2018** | **139** | **39%** | +1.86 / -1.08 R | **+8.4 R** | **+0.06 R** | 1.09 | **-10.5 R (-10.3%)** | **6** | **-3.0 R** |
| All design 2019 - Sep 2026 | 296 | 41% | +1.85 / -1.05 R | +39.4 R | +0.13 R | 1.21 | -11.4 R (-11.2%) | 8 | +13.4 R |
| **All 10.75 years** | **435** | **40%** | +1.85 / -1.06 R | **+47.8 R** | **+0.11 R** | 1.17 | **-12.3 R (-12.6%)** | **8** | +10.4 R |

*Profit factor = money won ÷ money lost. Above 1 means profit; 1.1 is thin, 1.5 or more is solid.

**Losing streaks:** streaks of 3 or more losses in a row happened 11 times in the 3 hidden years and 37 times in 10.75 years. The longest
were 8 (once, in 2020) and 7 (once, in 2024). Expect several runs of 4-6 losses every year.

**Buying vs selling:** shorts (selling) made +29.9 R on 217 trades over all years and +10.5 R on the hidden years. Longs (buying) made
+17.9 R on 218 trades over all years, but **lost 2.1 R** on the hidden years (67 trades).

**By weekday (all 10.75 years):** Mon +3.2 R (74 trades), Tue +3.8 R (95), **Wed +36.7 R** (89), **Thu +22.7 R** (81), **Fri -18.6 R** (96).
On the hidden years: Mon +1.9, Tue +2.6, Wed +9.5, Thu +10.5, **Fri -16.0 R** (33 trades, only 21% wins). The rules do not skip Fridays,
because that pattern was found after the test and cannot be proven on these data. It is your choice to watch it (see section 4).

**How trades ended (all years):** target reached 166 trades (38%), +317.6 R; stop hit 251 (58%), -272.9 R; closed at 15:59 New York
18 (4%), +3.1 R.

**When the orders were filled:** 86% of trades are filled in the first London hour (07:00-07:59 London), about half in the first 15 minutes.
Only 4 of 435 fills were at a worse price than the box edge because price jumped past it.

**News days:** US jobs report (NFP) and US interest-rate decision (FOMC) days were traded like any other day. All years: 47 trades, +0.9 R
(about zero); hidden years: 14 trades, -3.1 R. Skipping them is your choice; the rules do not require it.

**Brexit vote (June 2016), reported separately:** on 23 June 2016 (vote day) and 24 June (result night, when the pound fell more than
1,600 pips during Asia) the night was not quiet, so **no trade** either day. The 7 Oct 2016 "flash crash" night was also skipped.
After the vote, nights stayed wild for weeks, so the 20-day "normal" was very high and July 2016 had 7 trades with wide stops (34-50 pips):
together -2.3 R. Hidden total without 23 Jun - 31 Jul 2016: +9.7 R.

**Worst stretches:** worst quarter Oct-Dec 2016 (-7.8 R), then Oct-Dec 2019 (-6.2 R); worst month Aug 2021 (-5.5 R); worst week -5.5 R.
Fewer than half of the months with a trade were positive (55 of 116); the profit comes from a minority of strong months.

**Missing data:** the 2019-2026 file has holes on most days from Feb to Jul 2023, so those days were skipped. The first 20 days of each file
were skipped (warm-up for the 20-day median). The 2016-2018 file is clean.

### Week-by-week table, Jan 2016 - Sep 2026
How to read it: one row per week, Monday to Friday. "Result" is after costs. "15:59 close" = closed at the end of the New York day without
hitting stop or target. Labels in brackets: NFP = US jobs report, FOMC = US interest-rate decision. "Skipped" = days the rules did not allow.
Weeks with 0 trades and no "skipped" note simply had no quiet night (or no breakout); the strategy trades on about 1 day in 6.

| Week (Mon - Fri) | Period | Trades | Wins | Losses | Win rate | Result (R) | Running total (R) | Notes |
|---|---|---|---|---|---|---|---|---|
| 04 Jan 16 - 08 Jan 16 | hidden | 0 | 0 | 0 | - | 0 | +0.00 | skipped: warm-up (5 d) |
| 11 Jan 16 - 15 Jan 16 | hidden | 0 | 0 | 0 | - | 0 | +0.00 | skipped: warm-up (5 d) |
| 18 Jan 16 - 22 Jan 16 | hidden | 0 | 0 | 0 | - | 0 | +0.00 | skipped: warm-up (5 d) |
| 25 Jan 16 - 29 Jan 16 | hidden | 0 | 0 | 0 | - | 0 | +0.00 | skipped: warm-up (5 d) |
| 01 Feb 16 - 05 Feb 16 | hidden | 0 | 0 | 0 | - | 0 | +0.00 |  |
| 08 Feb 16 - 12 Feb 16 | hidden | 1 | 0 | 1 | 0% | -1.07 | -1.07 | Mon long stop -1.07 |
| 15 Feb 16 - 19 Feb 16 | hidden | 1 | 1 | 0 | 100% | +1.94 | +0.87 | Fri short target +1.94 |
| 22 Feb 16 - 26 Feb 16 | hidden | 0 | 0 | 0 | - | 0 | +0.87 |  |
| 29 Feb 16 - 04 Mar 16 | hidden | 2 | 0 | 2 | 0% | -2.14 | -1.27 | Thu long stop -1.07; Fri short stop -1.07 (NFP) |
| 07 Mar 16 - 11 Mar 16 | hidden | 0 | 0 | 0 | - | 0 | -1.27 |  |
| 14 Mar 16 - 18 Mar 16 | hidden | 1 | 1 | 0 | 100% | +1.91 | +0.64 | Mon short target +1.91 |
| 21 Mar 16 - 25 Mar 16 | hidden | 0 | 0 | 0 | - | 0 | +0.64 |  |
| 28 Mar 16 - 01 Apr 16 | hidden | 0 | 0 | 0 | - | 0 | +0.64 |  |
| 04 Apr 16 - 08 Apr 16 | hidden | 1 | 1 | 0 | 100% | +1.94 | +2.59 | Wed short target +1.94 |
| 11 Apr 16 - 15 Apr 16 | hidden | 2 | 2 | 0 | 100% | +3.87 | +6.46 | Tue long target +1.93; Fri long target +1.95 |
| 18 Apr 16 - 22 Apr 16 | hidden | 1 | 0 | 1 | 0% | -1.06 | +5.40 | Mon short stop -1.06 |
| 25 Apr 16 - 29 Apr 16 | hidden | 0 | 0 | 0 | - | 0 | +5.40 |  |
| 02 May 16 - 06 May 16 | hidden | 0 | 0 | 0 | - | 0 | +5.40 |  |
| 09 May 16 - 13 May 16 | hidden | 1 | 0 | 1 | 0% | -1.08 | +4.32 | Thu short stop -1.08 |
| 16 May 16 - 20 May 16 | hidden | 1 | 0 | 1 | 0% | -1.10 | +3.22 | Fri long stop -1.10 |
| 23 May 16 - 27 May 16 | hidden | 2 | 1 | 1 | 50% | +0.84 | +4.06 | Tue long target +1.92; Wed long stop -1.09 |
| 30 May 16 - 03 Jun 16 | hidden | 0 | 0 | 0 | - | 0 | +4.06 |  |
| 06 Jun 16 - 10 Jun 16 | hidden | 0 | 0 | 0 | - | 0 | +4.06 |  |
| 13 Jun 16 - 17 Jun 16 | hidden | 0 | 0 | 0 | - | 0 | +4.06 |  |
| 20 Jun 16 - 24 Jun 16 | hidden | 0 | 0 | 0 | - | 0 | +4.06 | BREXIT result Fri 24 Jun: Asia box 1,654 pips, no trade |
| 27 Jun 16 - 01 Jul 16 | hidden | 0 | 0 | 0 | - | 0 | +4.06 |  |
| 04 Jul 16 - 08 Jul 16 | hidden | 2 | 1 | 1 | 50% | +0.93 | +4.99 | Mon short stop -1.04; Tue short target +1.97 |
| 11 Jul 16 - 15 Jul 16 | hidden | 1 | 0 | 1 | 0% | -1.03 | +3.95 | Mon long stop -1.03 |
| 18 Jul 16 - 22 Jul 16 | hidden | 2 | 1 | 1 | 50% | +0.93 | +4.88 | Wed long target +1.97; Fri long stop -1.04 |
| 25 Jul 16 - 29 Jul 16 | hidden | 2 | 0 | 2 | 0% | -2.08 | +2.80 | Mon long stop -1.04; Tue short stop -1.04 |
| 01 Aug 16 - 05 Aug 16 | hidden | 4 | 1 | 3 | 25% | -1.20 | +1.60 | Tue short stop -1.06; Wed short stop -1.05; Thu short target +1.96; Fri long stop -1.06 (NFP) |
| 08 Aug 16 - 12 Aug 16 | hidden | 3 | 2 | 1 | 67% | +1.02 | +2.62 | Mon short 15:59 close +1.16; Thu short 15:59 close +0.91; Fri short stop -1.05 |
| 15 Aug 16 - 19 Aug 16 | hidden | 0 | 0 | 0 | - | 0 | +2.62 |  |
| 22 Aug 16 - 26 Aug 16 | hidden | 1 | 0 | 1 | 0% | -1.05 | +1.57 | Wed short stop -1.05 |
| 29 Aug 16 - 02 Sep 16 | hidden | 2 | 1 | 1 | 50% | +0.88 | +2.45 | Thu long target +1.94; Fri short stop -1.06 (NFP) |
| 05 Sep 16 - 09 Sep 16 | hidden | 1 | 1 | 0 | 100% | +1.93 | +4.39 | Wed short target +1.93 |
| 12 Sep 16 - 16 Sep 16 | hidden | 2 | 1 | 1 | 50% | +0.87 | +5.26 | Mon long stop -1.06; Tue short target +1.93 |
| 19 Sep 16 - 23 Sep 16 | hidden | 1 | 0 | 1 | 0% | -1.10 | +4.15 | Tue short stop -1.10 |
| 26 Sep 16 - 30 Sep 16 | hidden | 1 | 1 | 0 | 100% | +1.91 | +6.07 | Mon short target +1.91 |
| 03 Oct 16 - 07 Oct 16 | hidden | 1 | 0 | 1 | 0% | -1.07 | +5.00 | Wed short stop -1.07; pound flash crash Fri 7 Oct (in Asia): box 584 pips, no trade |
| 10 Oct 16 - 14 Oct 16 | hidden | 0 | 0 | 0 | - | 0 | +5.00 |  |
| 17 Oct 16 - 21 Oct 16 | hidden | 1 | 0 | 1 | 0% | -1.05 | +3.95 | Mon long stop -1.05 |
| 24 Oct 16 - 28 Oct 16 | hidden | 1 | 0 | 1 | 0% | -1.06 | +2.89 | Tue long stop -1.06 |
| 31 Oct 16 - 04 Nov 16 | hidden | 2 | 0 | 2 | 0% | -2.11 | +0.78 | Tue long stop -1.05; Fri short stop -1.05 (NFP) |
| 07 Nov 16 - 11 Nov 16 | hidden | 1 | 0 | 1 | 0% | -1.07 | -0.29 | Tue long stop -1.07 |
| 14 Nov 16 - 18 Nov 16 | hidden | 1 | 1 | 0 | 100% | +1.94 | +1.66 | Thu long target +1.94 |
| 21 Nov 16 - 25 Nov 16 | hidden | 2 | 0 | 2 | 0% | -2.14 | -0.49 | Wed short stop -1.06; Thu short stop -1.08 |
| 28 Nov 16 - 02 Dec 16 | hidden | 0 | 0 | 0 | - | 0 | -0.49 |  |
| 05 Dec 16 - 09 Dec 16 | hidden | 2 | 1 | 1 | 50% | +0.88 | +0.40 | Wed short target +1.94; Fri short stop -1.06 |
| 12 Dec 16 - 16 Dec 16 | hidden | 2 | 0 | 2 | 0% | -2.18 | -1.78 | Mon long stop -1.08; Tue short stop -1.09 |
| 19 Dec 16 - 23 Dec 16 | hidden | 0 | 0 | 0 | - | 0 | -1.78 |  |
| 26 Dec 16 - 30 Dec 16 | hidden | 0 | 0 | 0 | - | 0 | -1.78 | skipped: holiday/short day (1 d) |
| 02 Jan 17 - 06 Jan 17 | hidden | 0 | 0 | 0 | - | 0 | -1.78 | skipped: holiday/short day (1 d) |
| 09 Jan 17 - 13 Jan 17 | hidden | 0 | 0 | 0 | - | 0 | -1.78 |  |
| 16 Jan 17 - 20 Jan 17 | hidden | 0 | 0 | 0 | - | 0 | -1.78 |  |
| 23 Jan 17 - 27 Jan 17 | hidden | 0 | 0 | 0 | - | 0 | -1.78 |  |
| 30 Jan 17 - 03 Feb 17 | hidden | 2 | 0 | 2 | 0% | -2.16 | -3.94 | Thu long stop -1.07; Fri long stop -1.09 (NFP) |
| 06 Feb 17 - 10 Feb 17 | hidden | 1 | 1 | 0 | 100% | +1.92 | -2.01 | Mon short target +1.93 |
| 13 Feb 17 - 17 Feb 17 | hidden | 1 | 1 | 0 | 100% | +1.92 | -0.09 | Thu long target +1.92 |
| 20 Feb 17 - 24 Feb 17 | hidden | 0 | 0 | 0 | - | 0 | -0.09 |  |
| 27 Feb 17 - 03 Mar 17 | hidden | 0 | 0 | 0 | - | 0 | -0.09 |  |
| 06 Mar 17 - 10 Mar 17 | hidden | 3 | 2 | 1 | 67% | +2.72 | +2.62 | Mon short target +1.93; Wed short target +1.90; Fri long stop -1.12 (NFP) |
| 13 Mar 17 - 17 Mar 17 | hidden | 2 | 1 | 1 | 50% | +0.81 | +3.43 | Tue short target +1.92; Fri long stop -1.11 |
| 20 Mar 17 - 24 Mar 17 | hidden | 1 | 1 | 0 | 100% | +1.89 | +5.32 | Mon long target +1.89 |
| 27 Mar 17 - 31 Mar 17 | hidden | 0 | 0 | 0 | - | 0 | +5.32 |  |
| 03 Apr 17 - 07 Apr 17 | hidden | 1 | 0 | 1 | 0% | -1.10 | +4.22 | Wed short stop -1.10 |
| 10 Apr 17 - 14 Apr 17 | hidden | 2 | 2 | 0 | 100% | +2.53 | +6.75 | Wed long target +1.89; Fri long 15:59 close +0.64 |
| 17 Apr 17 - 21 Apr 17 | hidden | 0 | 0 | 0 | - | 0 | +6.75 |  |
| 24 Apr 17 - 28 Apr 17 | hidden | 1 | 0 | 1 | 0% | -1.11 | +5.64 | Wed short stop -1.11 |
| 01 May 17 - 05 May 17 | hidden | 1 | 1 | 0 | 100% | +1.91 | +7.55 | Thu short target +1.91 |
| 08 May 17 - 12 May 17 | hidden | 3 | 0 | 3 | 0% | -3.35 | +4.20 | Tue short stop -1.08; Wed long stop -1.18; Thu long stop -1.09 |
| 15 May 17 - 19 May 17 | hidden | 0 | 0 | 0 | - | 0 | +4.20 |  |
| 22 May 17 - 26 May 17 | hidden | 0 | 0 | 0 | - | 0 | +4.20 |  |
| 29 May 17 - 02 Jun 17 | hidden | 0 | 0 | 0 | - | 0 | +4.20 |  |
| 05 Jun 17 - 09 Jun 17 | hidden | 3 | 1 | 2 | 33% | -0.28 | +3.92 | Mon long target +1.90; Wed long stop -1.09; Thu long stop -1.09 |
| 12 Jun 17 - 16 Jun 17 | hidden | 1 | 1 | 0 | 100% | +1.91 | +5.82 | Wed long target +1.91 (FOMC) |
| 19 Jun 17 - 23 Jun 17 | hidden | 2 | 1 | 1 | 50% | +0.81 | +6.63 | Mon long stop -1.08; Wed short target +1.89 |
| 26 Jun 17 - 30 Jun 17 | hidden | 1 | 0 | 1 | 0% | -1.10 | +5.53 | Mon long stop -1.10 |
| 03 Jul 17 - 07 Jul 17 | hidden | 0 | 0 | 0 | - | 0 | +5.53 |  |
| 10 Jul 17 - 14 Jul 17 | hidden | 1 | 1 | 0 | 100% | +1.88 | +7.41 | Tue long target +1.88 |
| 17 Jul 17 - 21 Jul 17 | hidden | 1 | 1 | 0 | 100% | +1.91 | +9.33 | Thu short target +1.91 |
| 24 Jul 17 - 28 Jul 17 | hidden | 1 | 0 | 1 | 0% | -1.09 | +8.24 | Wed short stop -1.09 (FOMC) |
| 31 Jul 17 - 04 Aug 17 | hidden | 1 | 0 | 1 | 0% | -1.09 | +7.15 | Fri long stop -1.09 (NFP) |
| 07 Aug 17 - 11 Aug 17 | hidden | 0 | 0 | 0 | - | 0 | +7.15 |  |
| 14 Aug 17 - 18 Aug 17 | hidden | 2 | 1 | 1 | 50% | +0.81 | +7.96 | Tue short target +1.91; Wed short stop -1.10 |
| 21 Aug 17 - 25 Aug 17 | hidden | 1 | 0 | 1 | 0% | -1.09 | +6.86 | Mon short stop -1.09 |
| 28 Aug 17 - 01 Sep 17 | hidden | 0 | 0 | 0 | - | 0 | +6.86 |  |
| 04 Sep 17 - 08 Sep 17 | hidden | 1 | 0 | 1 | 0% | -1.09 | +5.77 | Wed short stop -1.09 |
| 11 Sep 17 - 15 Sep 17 | hidden | 0 | 0 | 0 | - | 0 | +5.77 |  |
| 18 Sep 17 - 22 Sep 17 | hidden | 0 | 0 | 0 | - | 0 | +5.77 |  |
| 25 Sep 17 - 29 Sep 17 | hidden | 1 | 0 | 1 | 0% | -1.09 | +4.68 | Tue long stop -1.09 |
| 02 Oct 17 - 06 Oct 17 | hidden | 1 | 1 | 0 | 100% | +1.93 | +6.61 | Thu short target +1.93 |
| 09 Oct 17 - 13 Oct 17 | hidden | 1 | 0 | 1 | 0% | -1.06 | +5.55 | Fri long stop -1.06 |
| 16 Oct 17 - 20 Oct 17 | hidden | 2 | 0 | 2 | 0% | -2.13 | +3.42 | Mon short stop -1.06; Wed short stop -1.07 |
| 23 Oct 17 - 27 Oct 17 | hidden | 2 | 1 | 1 | 50% | +0.84 | +4.25 | Wed short stop -1.08; Thu short target +1.92 |
| 30 Oct 17 - 03 Nov 17 | hidden | 0 | 0 | 0 | - | 0 | +4.25 |  |
| 06 Nov 17 - 10 Nov 17 | hidden | 0 | 0 | 0 | - | 0 | +4.25 |  |
| 13 Nov 17 - 17 Nov 17 | hidden | 0 | 0 | 0 | - | 0 | +4.25 |  |
| 20 Nov 17 - 24 Nov 17 | hidden | 1 | 0 | 1 | 0% | -1.09 | +3.17 | Tue long stop -1.09 |
| 27 Nov 17 - 01 Dec 17 | hidden | 1 | 0 | 1 | 0% | -1.09 | +2.08 | Mon short stop -1.09 |
| 04 Dec 17 - 08 Dec 17 | hidden | 0 | 0 | 0 | - | 0 | +2.08 |  |
| 11 Dec 17 - 15 Dec 17 | hidden | 2 | 1 | 1 | 50% | +0.84 | +2.92 | Tue long stop -1.07; Fri short target +1.92 |
| 18 Dec 17 - 22 Dec 17 | hidden | 2 | 0 | 2 | 0% | -2.18 | +0.74 | Thu short stop -1.09; Fri short stop -1.09 |
| 25 Dec 17 - 29 Dec 17 | hidden | 2 | 1 | 1 | 50% | +0.67 | +1.41 | Tue long stop -1.25; Wed long target +1.92 |
| 01 Jan 18 - 05 Jan 18 | hidden | 1 | 1 | 0 | 100% | +1.92 | +3.32 | Tue long target +1.92 |
| 08 Jan 18 - 12 Jan 18 | hidden | 0 | 0 | 0 | - | 0 | +3.32 |  |
| 15 Jan 18 - 19 Jan 18 | hidden | 0 | 0 | 0 | - | 0 | +3.32 |  |
| 22 Jan 18 - 26 Jan 18 | hidden | 0 | 0 | 0 | - | 0 | +3.32 |  |
| 29 Jan 18 - 02 Feb 18 | hidden | 0 | 0 | 0 | - | 0 | +3.32 |  |
| 05 Feb 18 - 09 Feb 18 | hidden | 1 | 0 | 1 | 0% | -1.07 | +2.26 | Wed long stop -1.07 |
| 12 Feb 18 - 16 Feb 18 | hidden | 1 | 1 | 0 | 100% | +1.93 | +4.19 | Thu long target +1.93 |
| 19 Feb 18 - 23 Feb 18 | hidden | 1 | 0 | 1 | 0% | -1.06 | +3.13 | Fri short stop -1.06 |
| 26 Feb 18 - 02 Mar 18 | hidden | 1 | 0 | 1 | 0% | -1.07 | +2.06 | Tue long stop -1.07 |
| 05 Mar 18 - 09 Mar 18 | hidden | 2 | 1 | 1 | 50% | +0.86 | +2.93 | Thu short stop -1.07; Fri long target +1.93 (NFP) |
| 12 Mar 18 - 16 Mar 18 | hidden | 1 | 0 | 1 | 0% | -1.11 | +1.81 | Mon long stop -1.11 |
| 19 Mar 18 - 23 Mar 18 | hidden | 2 | 1 | 1 | 50% | +0.84 | +2.65 | Wed long target +1.92 (FOMC); Fri long stop -1.08 |
| 26 Mar 18 - 30 Mar 18 | hidden | 1 | 0 | 1 | 0% | -1.09 | +1.56 | Tue long stop -1.09 |
| 02 Apr 18 - 06 Apr 18 | hidden | 1 | 0 | 1 | 0% | -1.09 | +0.47 | Tue long stop -1.09 |
| 09 Apr 18 - 13 Apr 18 | hidden | 3 | 1 | 2 | 33% | -0.27 | +0.20 | Mon long stop -1.09; Wed long target +1.91; Fri short stop -1.09 |
| 16 Apr 18 - 20 Apr 18 | hidden | 0 | 0 | 0 | - | 0 | +0.20 |  |
| 23 Apr 18 - 27 Apr 18 | hidden | 0 | 0 | 0 | - | 0 | +0.20 |  |
| 30 Apr 18 - 04 May 18 | hidden | 0 | 0 | 0 | - | 0 | +0.20 |  |
| 07 May 18 - 11 May 18 | hidden | 0 | 0 | 0 | - | 0 | +0.20 |  |
| 14 May 18 - 18 May 18 | hidden | 1 | 0 | 1 | 0% | -1.10 | -0.90 | Fri long stop -1.10 |
| 21 May 18 - 25 May 18 | hidden | 0 | 0 | 0 | - | 0 | -0.90 |  |
| 28 May 18 - 01 Jun 18 | hidden | 0 | 0 | 0 | - | 0 | -0.90 |  |
| 04 Jun 18 - 08 Jun 18 | hidden | 3 | 1 | 2 | 33% | -0.27 | -1.17 | Tue long target +1.91; Wed long stop -1.08; Fri long stop -1.10 |
| 11 Jun 18 - 15 Jun 18 | hidden | 1 | 1 | 0 | 100% | +1.91 | +0.74 | Wed short target +1.91 (FOMC) |
| 18 Jun 18 - 22 Jun 18 | hidden | 1 | 1 | 0 | 100% | +1.90 | +2.63 | Mon short target +1.90 |
| 25 Jun 18 - 29 Jun 18 | hidden | 0 | 0 | 0 | - | 0 | +2.63 |  |
| 02 Jul 18 - 06 Jul 18 | hidden | 1 | 1 | 0 | 100% | +1.91 | +4.55 | Thu long target +1.91 |
| 09 Jul 18 - 13 Jul 18 | hidden | 0 | 0 | 0 | - | 0 | +4.55 |  |
| 16 Jul 18 - 20 Jul 18 | hidden | 0 | 0 | 0 | - | 0 | +4.55 |  |
| 23 Jul 18 - 27 Jul 18 | hidden | 1 | 0 | 1 | 0% | -1.11 | +3.44 | Fri short stop -1.11 |
| 30 Jul 18 - 03 Aug 18 | hidden | 0 | 0 | 0 | - | 0 | +3.44 |  |
| 06 Aug 18 - 10 Aug 18 | hidden | 1 | 1 | 0 | 100% | +1.86 | +5.30 | Tue long target +1.86 |
| 13 Aug 18 - 17 Aug 18 | hidden | 0 | 0 | 0 | - | 0 | +5.30 |  |
| 20 Aug 18 - 24 Aug 18 | hidden | 2 | 1 | 1 | 50% | +0.80 | +6.10 | Mon short stop -1.10; Wed short target +1.90 |
| 27 Aug 18 - 31 Aug 18 | hidden | 0 | 0 | 0 | - | 0 | +6.10 |  |
| 03 Sep 18 - 07 Sep 18 | hidden | 2 | 1 | 1 | 50% | +0.82 | +6.92 | Mon short target +1.91; Fri short stop -1.09 (NFP) |
| 10 Sep 18 - 14 Sep 18 | hidden | 1 | 0 | 1 | 0% | -1.10 | +5.82 | Fri short stop -1.10 |
| 17 Sep 18 - 21 Sep 18 | hidden | 1 | 1 | 0 | 100% | +1.91 | +7.73 | Fri short target +1.91 |
| 24 Sep 18 - 28 Sep 18 | hidden | 0 | 0 | 0 | - | 0 | +7.73 |  |
| 01 Oct 18 - 05 Oct 18 | hidden | 0 | 0 | 0 | - | 0 | +7.73 |  |
| 08 Oct 18 - 12 Oct 18 | hidden | 0 | 0 | 0 | - | 0 | +7.73 |  |
| 15 Oct 18 - 19 Oct 18 | hidden | 1 | 0 | 1 | 0% | -1.14 | +6.59 | Fri long stop -1.14 |
| 22 Oct 18 - 26 Oct 18 | hidden | 3 | 1 | 2 | 33% | -0.30 | +6.29 | Tue short stop -1.10; Wed short target +1.91; Fri short stop -1.11 |
| 29 Oct 18 - 02 Nov 18 | hidden | 2 | 1 | 1 | 50% | +0.80 | +7.09 | Mon long stop -1.10; Tue short target +1.90 |
| 05 Nov 18 - 09 Nov 18 | hidden | 0 | 0 | 0 | - | 0 | +7.09 |  |
| 12 Nov 18 - 16 Nov 18 | hidden | 0 | 0 | 0 | - | 0 | +7.09 |  |
| 19 Nov 18 - 23 Nov 18 | hidden | 2 | 1 | 1 | 50% | +0.81 | +7.90 | Tue short stop -1.09; Fri short target +1.90 |
| 26 Nov 18 - 30 Nov 18 | hidden | 1 | 0 | 1 | 0% | -1.08 | +6.82 | Fri long stop -1.08 |
| 03 Dec 18 - 07 Dec 18 | hidden | 1 | 0 | 1 | 0% | -1.08 | +5.74 | Fri short stop -1.08 (NFP) |
| 10 Dec 18 - 14 Dec 18 | hidden | 0 | 0 | 0 | - | 0 | +5.74 |  |
| 17 Dec 18 - 21 Dec 18 | hidden | 1 | 1 | 0 | 100% | +1.88 | +7.63 | Mon long target +1.88 |
| 24 Dec 18 - 28 Dec 18 | hidden | 1 | 0 | 1 | 0% | -1.07 | +6.55 | Thu short stop -1.07; skipped: holiday/short day (1 d) |
| 31 Dec 18 - 04 Jan 19 | hidden/design | 1 | 1 | 0 | 100% | +1.89 | +8.44 | Mon long target +1.89; skipped: warm-up (3 d) |
| 07 Jan 19 - 11 Jan 19 | design | 0 | 0 | 0 | - | 0 | +8.44 | skipped: warm-up (5 d) |
| 14 Jan 19 - 18 Jan 19 | design | 0 | 0 | 0 | - | 0 | +8.44 | skipped: warm-up (5 d) |
| 21 Jan 19 - 25 Jan 19 | design | 0 | 0 | 0 | - | 0 | +8.44 | skipped: warm-up (5 d) |
| 28 Jan 19 - 01 Feb 19 | design | 0 | 0 | 0 | - | 0 | +8.44 | skipped: warm-up (2 d) |
| 04 Feb 19 - 08 Feb 19 | design | 5 | 0 | 5 | 0% | -5.49 | +2.95 | Mon long stop -1.08; Tue long stop -1.08; Wed short stop -1.10; Thu short stop -1.12; Fri short stop -1.11 |
| 11 Feb 19 - 15 Feb 19 | design | 2 | 1 | 1 | 50% | +0.77 | +3.72 | Mon short target +1.88; Tue long stop -1.11 |
| 18 Feb 19 - 22 Feb 19 | design | 0 | 0 | 0 | - | 0 | +3.72 |  |
| 25 Feb 19 - 01 Mar 19 | design | 0 | 0 | 0 | - | 0 | +3.72 |  |
| 04 Mar 19 - 08 Mar 19 | design | 0 | 0 | 0 | - | 0 | +3.72 |  |
| 11 Mar 19 - 15 Mar 19 | design | 0 | 0 | 0 | - | 0 | +3.72 |  |
| 18 Mar 19 - 22 Mar 19 | design | 0 | 0 | 0 | - | 0 | +3.72 |  |
| 25 Mar 19 - 29 Mar 19 | design | 0 | 0 | 0 | - | 0 | +3.72 |  |
| 01 Apr 19 - 05 Apr 19 | design | 1 | 0 | 1 | 0% | -1.08 | +2.64 | Thu long stop -1.08; skipped: data hole (1 d) |
| 08 Apr 19 - 12 Apr 19 | design | 1 | 0 | 1 | 0% | -1.07 | +1.57 | Thu short stop -1.07 |
| 15 Apr 19 - 19 Apr 19 | design | 2 | 1 | 1 | 50% | +1.41 | +2.98 | Thu short target +1.92; Fri long 15:59 close -0.51 |
| 22 Apr 19 - 26 Apr 19 | design | 3 | 0 | 3 | 0% | -3.34 | -0.36 | Mon long stop -1.13; Tue long stop -1.10; Wed short stop -1.11 |
| 29 Apr 19 - 03 May 19 | design | 1 | 1 | 0 | 100% | +1.89 | +1.53 | Fri short target +1.89 (NFP) |
| 06 May 19 - 10 May 19 | design | 0 | 0 | 0 | - | 0 | +1.53 |  |
| 13 May 19 - 17 May 19 | design | 3 | 1 | 2 | 33% | -0.45 | +1.09 | Mon long stop -1.16; Wed short stop -1.14; Thu short target +1.84 |
| 20 May 19 - 24 May 19 | design | 1 | 1 | 0 | 100% | +1.84 | +2.93 | Fri long target +1.84 |
| 27 May 19 - 31 May 19 | design | 0 | 0 | 0 | - | 0 | +2.93 | skipped: holiday/short day (1 d) |
| 03 Jun 19 - 07 Jun 19 | design | 0 | 0 | 0 | - | 0 | +2.93 |  |
| 10 Jun 19 - 14 Jun 19 | design | 0 | 0 | 0 | - | 0 | +2.93 |  |
| 17 Jun 19 - 21 Jun 19 | design | 1 | 0 | 1 | 0% | -1.16 | +1.77 | Mon short stop -1.16 |
| 24 Jun 19 - 28 Jun 19 | design | 1 | 0 | 1 | 0% | -1.13 | +0.64 | Fri short stop -1.13 |
| 01 Jul 19 - 05 Jul 19 | design | 1 | 0 | 1 | 0% | -1.16 | -0.52 | Fri long stop -1.16 (NFP) |
| 08 Jul 19 - 12 Jul 19 | design | 0 | 0 | 0 | - | 0 | -0.52 |  |
| 15 Jul 19 - 19 Jul 19 | design | 1 | 1 | 0 | 100% | +1.88 | +1.36 | Tue short target +1.88 |
| 22 Jul 19 - 26 Jul 19 | design | 0 | 0 | 0 | - | 0 | +1.36 |  |
| 29 Jul 19 - 02 Aug 19 | design | 0 | 0 | 0 | - | 0 | +1.36 |  |
| 05 Aug 19 - 09 Aug 19 | design | 1 | 1 | 0 | 100% | +1.90 | +3.26 | Fri short target +1.90 |
| 12 Aug 19 - 16 Aug 19 | design | 1 | 1 | 0 | 100% | +1.88 | +5.15 | Thu long target +1.88 |
| 19 Aug 19 - 23 Aug 19 | design | 0 | 0 | 0 | - | 0 | +5.15 |  |
| 26 Aug 19 - 30 Aug 19 | design | 2 | 1 | 1 | 50% | +0.81 | +5.95 | Tue long target +1.91; Fri long stop -1.10 |
| 02 Sep 19 - 06 Sep 19 | design | 0 | 0 | 0 | - | 0 | +5.95 |  |
| 09 Sep 19 - 13 Sep 19 | design | 2 | 1 | 1 | 50% | +0.77 | +6.72 | Tue long target +1.88; Thu short stop -1.12 |
| 16 Sep 19 - 20 Sep 19 | design | 0 | 0 | 0 | - | 0 | +6.72 |  |
| 23 Sep 19 - 27 Sep 19 | design | 1 | 0 | 1 | 0% | -1.10 | +5.61 | Tue long stop -1.10 |
| 30 Sep 19 - 04 Oct 19 | design | 2 | 1 | 1 | 50% | +0.81 | +6.42 | Mon long target +1.91; Tue short stop -1.10 |
| 07 Oct 19 - 11 Oct 19 | design | 1 | 0 | 1 | 0% | -1.10 | +5.32 | Tue long stop -1.10 |
| 14 Oct 19 - 18 Oct 19 | design | 0 | 0 | 0 | - | 0 | +5.32 |  |
| 21 Oct 19 - 25 Oct 19 | design | 1 | 0 | 1 | 0% | -1.10 | +4.22 | Fri long stop -1.10 |
| 28 Oct 19 - 01 Nov 19 | design | 0 | 0 | 0 | - | 0 | +4.22 |  |
| 04 Nov 19 - 08 Nov 19 | design | 4 | 1 | 3 | 25% | -1.44 | +2.78 | Mon short target +1.88; Tue long stop -1.12; Wed long stop -1.09; Fri short stop -1.11 |
| 11 Nov 19 - 15 Nov 19 | design | 4 | 2 | 2 | 50% | +1.97 | +4.76 | Mon long target +1.89; Tue short target +1.90; Wed short 15:59 close -0.67; Fri short stop -1.15 |
| 18 Nov 19 - 22 Nov 19 | design | 1 | 0 | 1 | 0% | -1.19 | +3.57 | Thu short stop -1.19 |
| 25 Nov 19 - 29 Nov 19 | design | 0 | 0 | 0 | - | 0 | +3.57 |  |
| 02 Dec 19 - 06 Dec 19 | design | 1 | 0 | 1 | 0% | -1.14 | +2.43 | Mon long stop -1.14 |
| 09 Dec 19 - 13 Dec 19 | design | 0 | 0 | 0 | - | 0 | +2.43 |  |
| 16 Dec 19 - 20 Dec 19 | design | 0 | 0 | 0 | - | 0 | +2.43 |  |
| 23 Dec 19 - 27 Dec 19 | design | 1 | 0 | 1 | 0% | -1.14 | +1.29 | Tue short stop -1.14; skipped: holiday/short day (1 d) |
| 30 Dec 19 - 03 Jan 20 | design | 0 | 0 | 0 | - | 0 | +1.29 |  |
| 06 Jan 20 - 10 Jan 20 | design | 2 | 1 | 1 | 50% | +0.86 | +2.15 | Mon long stop -1.07; Thu short target +1.93 |
| 13 Jan 20 - 17 Jan 20 | design | 2 | 0 | 2 | 0% | -2.18 | -0.03 | Tue short stop -1.09; Thu short stop -1.09 |
| 20 Jan 20 - 24 Jan 20 | design | 0 | 0 | 0 | - | 0 | -0.03 |  |
| 27 Jan 20 - 31 Jan 20 | design | 2 | 2 | 0 | 100% | +3.78 | +3.75 | Wed short target +1.88 (FOMC); Thu short target +1.90 |
| 03 Feb 20 - 07 Feb 20 | design | 0 | 0 | 0 | - | 0 | +3.75 |  |
| 10 Feb 20 - 14 Feb 20 | design | 2 | 0 | 2 | 0% | -2.23 | +1.52 | Tue short stop -1.13; Fri long stop -1.10 |
| 17 Feb 20 - 21 Feb 20 | design | 1 | 0 | 1 | 0% | -1.11 | +0.41 | Mon short stop -1.11 |
| 24 Feb 20 - 28 Feb 20 | design | 0 | 0 | 0 | - | 0 | +0.41 |  |
| 02 Mar 20 - 06 Mar 20 | design | 0 | 0 | 0 | - | 0 | +0.41 |  |
| 09 Mar 20 - 13 Mar 20 | design | 0 | 0 | 0 | - | 0 | +0.41 |  |
| 16 Mar 20 - 20 Mar 20 | design | 0 | 0 | 0 | - | 0 | +0.41 |  |
| 23 Mar 20 - 27 Mar 20 | design | 0 | 0 | 0 | - | 0 | +0.41 |  |
| 30 Mar 20 - 03 Apr 20 | design | 2 | 0 | 2 | 0% | -2.09 | -1.69 | Thu long stop -1.04; Fri short stop -1.05 (NFP); skipped: data hole (1 d) |
| 06 Apr 20 - 10 Apr 20 | design | 3 | 0 | 3 | 0% | -1.27 | -2.95 | Mon long 15:59 close -0.21; Wed short stop -1.03; Fri long 15:59 close -0.02 |
| 13 Apr 20 - 17 Apr 20 | design | 2 | 2 | 0 | 100% | +3.91 | +0.96 | Mon long target +1.95; Wed short target +1.96 |
| 20 Apr 20 - 24 Apr 20 | design | 3 | 2 | 1 | 67% | +1.50 | +2.46 | Mon short 15:59 close +0.61; Wed long target +1.95; Fri short stop -1.05 |
| 27 Apr 20 - 01 May 20 | design | 1 | 0 | 1 | 0% | -1.05 | +1.41 | Tue short stop -1.05 |
| 04 May 20 - 08 May 20 | design | 3 | 1 | 2 | 33% | -0.17 | +1.24 | Tue long stop -1.05; Wed short stop -1.06; Thu long target +1.94 |
| 11 May 20 - 15 May 20 | design | 0 | 0 | 0 | - | 0 | +1.24 |  |
| 18 May 20 - 22 May 20 | design | 0 | 0 | 0 | - | 0 | +1.24 |  |
| 25 May 20 - 29 May 20 | design | 1 | 0 | 1 | 0% | -1.07 | +0.17 | Mon short stop -1.07 |
| 01 Jun 20 - 05 Jun 20 | design | 0 | 0 | 0 | - | 0 | +0.17 |  |
| 08 Jun 20 - 12 Jun 20 | design | 0 | 0 | 0 | - | 0 | +0.17 |  |
| 15 Jun 20 - 19 Jun 20 | design | 0 | 0 | 0 | - | 0 | +0.17 |  |
| 22 Jun 20 - 26 Jun 20 | design | 3 | 2 | 1 | 67% | +2.85 | +3.02 | Wed short target +1.96; Thu long stop -1.05; Fri short target +1.94 |
| 29 Jun 20 - 03 Jul 20 | design | 4 | 1 | 3 | 25% | -1.23 | +1.79 | Tue short stop -1.05; Wed long target +1.96; Thu long stop -1.04; Fri long stop -1.09 (NFP) |
| 06 Jul 20 - 10 Jul 20 | design | 2 | 0 | 2 | 0% | -1.32 | +0.47 | Mon long 15:59 close -0.27; Tue short stop -1.05 |
| 13 Jul 20 - 17 Jul 20 | design | 3 | 3 | 0 | 100% | +5.80 | +6.27 | Tue short target +1.94; Wed long target +1.94; Fri short target +1.92 |
| 20 Jul 20 - 24 Jul 20 | design | 0 | 0 | 0 | - | 0 | +6.27 |  |
| 27 Jul 20 - 31 Jul 20 | design | 0 | 0 | 0 | - | 0 | +6.27 |  |
| 03 Aug 20 - 07 Aug 20 | design | 1 | 0 | 1 | 0% | -1.07 | +5.20 | Thu long stop -1.07 |
| 10 Aug 20 - 14 Aug 20 | design | 0 | 0 | 0 | - | 0 | +5.20 |  |
| 17 Aug 20 - 21 Aug 20 | design | 0 | 0 | 0 | - | 0 | +5.20 |  |
| 24 Aug 20 - 28 Aug 20 | design | 1 | 0 | 1 | 0% | -1.07 | +4.13 | Mon long stop -1.07 |
| 31 Aug 20 - 04 Sep 20 | design | 0 | 0 | 0 | - | 0 | +4.13 |  |
| 07 Sep 20 - 11 Sep 20 | design | 1 | 1 | 0 | 100% | +1.93 | +6.06 | Wed short target +1.93 |
| 14 Sep 20 - 18 Sep 20 | design | 0 | 0 | 0 | - | 0 | +6.06 |  |
| 21 Sep 20 - 25 Sep 20 | design | 1 | 1 | 0 | 100% | +1.91 | +7.98 | Fri long target +1.91 |
| 28 Sep 20 - 02 Oct 20 | design | 0 | 0 | 0 | - | 0 | +7.98 |  |
| 05 Oct 20 - 09 Oct 20 | design | 2 | 0 | 2 | 0% | -2.13 | +5.84 | Tue long stop -1.07; Thu long stop -1.06 |
| 12 Oct 20 - 16 Oct 20 | design | 1 | 1 | 0 | 100% | +1.93 | +7.77 | Thu short target +1.93 |
| 19 Oct 20 - 23 Oct 20 | design | 0 | 0 | 0 | - | 0 | +7.77 |  |
| 26 Oct 20 - 30 Oct 20 | design | 0 | 0 | 0 | - | 0 | +7.77 |  |
| 02 Nov 20 - 06 Nov 20 | design | 0 | 0 | 0 | - | 0 | +7.77 |  |
| 09 Nov 20 - 13 Nov 20 | design | 0 | 0 | 0 | - | 0 | +7.77 |  |
| 16 Nov 20 - 20 Nov 20 | design | 1 | 0 | 1 | 0% | -1.07 | +6.70 | Tue short stop -1.07 |
| 23 Nov 20 - 27 Nov 20 | design | 2 | 1 | 1 | 50% | +0.84 | +7.54 | Tue long stop -1.06; Thu short target +1.90 |
| 30 Nov 20 - 04 Dec 20 | design | 0 | 0 | 0 | - | 0 | +7.54 | skipped: holiday/short day (1 d) |
| 07 Dec 20 - 11 Dec 20 | design | 0 | 0 | 0 | - | 0 | +7.54 |  |
| 14 Dec 20 - 18 Dec 20 | design | 0 | 0 | 0 | - | 0 | +7.54 |  |
| 21 Dec 20 - 25 Dec 20 | design | 0 | 0 | 0 | - | 0 | +7.54 | skipped: holiday/short day (1 d) |
| 28 Dec 20 - 01 Jan 21 | design | 0 | 0 | 0 | - | 0 | +7.54 |  |
| 04 Jan 21 - 08 Jan 21 | design | 0 | 0 | 0 | - | 0 | +7.54 |  |
| 11 Jan 21 - 15 Jan 21 | design | 1 | 0 | 1 | 0% | -1.06 | +6.49 | Wed long stop -1.06 |
| 18 Jan 21 - 22 Jan 21 | design | 1 | 0 | 1 | 0% | -0.94 | +5.55 | Mon short 15:59 close -0.94 |
| 25 Jan 21 - 29 Jan 21 | design | 1 | 0 | 1 | 0% | -1.05 | +4.50 | Wed long stop -1.05 (FOMC) |
| 01 Feb 21 - 05 Feb 21 | design | 1 | 1 | 0 | 100% | +1.94 | +6.43 | Fri long target +1.94 (NFP) |
| 08 Feb 21 - 12 Feb 21 | design | 2 | 1 | 1 | 50% | -0.89 | +5.54 | Mon long stop -1.08; Wed long 15:59 close +0.19 |
| 15 Feb 21 - 19 Feb 21 | design | 0 | 0 | 0 | - | 0 | +5.54 |  |
| 22 Feb 21 - 26 Feb 21 | design | 0 | 0 | 0 | - | 0 | +5.54 |  |
| 01 Mar 21 - 05 Mar 21 | design | 0 | 0 | 0 | - | 0 | +5.54 |  |
| 08 Mar 21 - 12 Mar 21 | design | 1 | 1 | 0 | 100% | +1.94 | +7.48 | Thu long target +1.94 |
| 15 Mar 21 - 19 Mar 21 | design | 0 | 0 | 0 | - | 0 | +7.48 |  |
| 22 Mar 21 - 26 Mar 21 | design | 2 | 0 | 2 | 0% | -2.11 | +5.37 | Thu short stop -1.05; Fri short stop -1.06 |
| 29 Mar 21 - 02 Apr 21 | design | 2 | 1 | 1 | 50% | +1.72 | +7.09 | Tue short target +1.94; Fri short 15:59 close -0.21 (NFP); skipped: data hole (1 d) |
| 05 Apr 21 - 09 Apr 21 | design | 1 | 0 | 1 | 0% | -1.06 | +6.03 | Mon short stop -1.06 |
| 12 Apr 21 - 16 Apr 21 | design | 0 | 0 | 0 | - | 0 | +6.03 |  |
| 19 Apr 21 - 23 Apr 21 | design | 0 | 0 | 0 | - | 0 | +6.03 |  |
| 26 Apr 21 - 30 Apr 21 | design | 0 | 0 | 0 | - | 0 | +6.03 |  |
| 03 May 21 - 07 May 21 | design | 1 | 1 | 0 | 100% | +1.93 | +7.97 | Fri long target +1.93 (NFP) |
| 10 May 21 - 14 May 21 | design | 2 | 1 | 1 | 50% | +0.86 | +8.82 | Tue short stop -1.07; Fri long target +1.93 |
| 17 May 21 - 21 May 21 | design | 0 | 0 | 0 | - | 0 | +8.82 |  |
| 24 May 21 - 28 May 21 | design | 0 | 0 | 0 | - | 0 | +8.82 |  |
| 31 May 21 - 04 Jun 21 | design | 1 | 0 | 1 | 0% | -1.08 | +7.74 | Wed short stop -1.08; skipped: holiday/short day (2 d) |
| 07 Jun 21 - 11 Jun 21 | design | 1 | 1 | 0 | 100% | +1.91 | +9.65 | Fri short target +1.91 |
| 14 Jun 21 - 18 Jun 21 | design | 2 | 2 | 0 | 100% | +3.80 | +13.45 | Mon short target +1.89; Wed long target +1.91 (FOMC) |
| 21 Jun 21 - 25 Jun 21 | design | 1 | 0 | 1 | 0% | -1.08 | +12.37 | Thu short stop -1.08 |
| 28 Jun 21 - 02 Jul 21 | design | 0 | 0 | 0 | - | 0 | +12.37 |  |
| 05 Jul 21 - 09 Jul 21 | design | 0 | 0 | 0 | - | 0 | +12.37 |  |
| 12 Jul 21 - 16 Jul 21 | design | 1 | 1 | 0 | 100% | +1.91 | +14.28 | Fri short target +1.91 |
| 19 Jul 21 - 23 Jul 21 | design | 0 | 0 | 0 | - | 0 | +14.28 |  |
| 26 Jul 21 - 30 Jul 21 | design | 1 | 1 | 0 | 100% | +1.88 | +16.16 | Tue short target +1.88 |
| 02 Aug 21 - 06 Aug 21 | design | 2 | 0 | 2 | 0% | -2.18 | +13.98 | Tue long stop -1.09; Fri short stop -1.10 (NFP) |
| 09 Aug 21 - 13 Aug 21 | design | 3 | 0 | 3 | 0% | -3.35 | +10.63 | Tue long stop -1.10; Thu short stop -1.14; Fri short stop -1.12 |
| 16 Aug 21 - 20 Aug 21 | design | 0 | 0 | 0 | - | 0 | +10.63 |  |
| 23 Aug 21 - 27 Aug 21 | design | 0 | 0 | 0 | - | 0 | +10.63 |  |
| 30 Aug 21 - 03 Sep 21 | design | 1 | 1 | 0 | 100% | +1.89 | +12.52 | Thu long target +1.89 |
| 06 Sep 21 - 10 Sep 21 | design | 0 | 0 | 0 | - | 0 | +12.52 |  |
| 13 Sep 21 - 17 Sep 21 | design | 1 | 0 | 1 | 0% | -1.10 | +11.42 | Tue short stop -1.10 |
| 20 Sep 21 - 24 Sep 21 | design | 0 | 0 | 0 | - | 0 | +11.42 |  |
| 27 Sep 21 - 01 Oct 21 | design | 0 | 0 | 0 | - | 0 | +11.42 |  |
| 04 Oct 21 - 08 Oct 21 | design | 0 | 0 | 0 | - | 0 | +11.42 |  |
| 11 Oct 21 - 15 Oct 21 | design | 1 | 1 | 0 | 100% | +1.89 | +13.32 | Thu long target +1.89 |
| 18 Oct 21 - 22 Oct 21 | design | 0 | 0 | 0 | - | 0 | +13.32 |  |
| 25 Oct 21 - 29 Oct 21 | design | 3 | 2 | 1 | 67% | +2.74 | +16.05 | Tue long target +1.90; Wed short stop -1.08; Fri short target +1.91 |
| 01 Nov 21 - 05 Nov 21 | design | 0 | 0 | 0 | - | 0 | +16.05 |  |
| 08 Nov 21 - 12 Nov 21 | design | 0 | 0 | 0 | - | 0 | +16.05 |  |
| 15 Nov 21 - 19 Nov 21 | design | 0 | 0 | 0 | - | 0 | +16.05 |  |
| 22 Nov 21 - 26 Nov 21 | design | 0 | 0 | 0 | - | 0 | +16.05 |  |
| 29 Nov 21 - 03 Dec 21 | design | 1 | 0 | 1 | 0% | -1.10 | +14.95 | Mon short stop -1.10 |
| 06 Dec 21 - 10 Dec 21 | design | 0 | 0 | 0 | - | 0 | +14.95 |  |
| 13 Dec 21 - 17 Dec 21 | design | 0 | 0 | 0 | - | 0 | +14.95 |  |
| 20 Dec 21 - 24 Dec 21 | design | 0 | 0 | 0 | - | 0 | +14.95 |  |
| 27 Dec 21 - 31 Dec 21 | design | 2 | 0 | 2 | 0% | -2.23 | +12.73 | Tue long stop -1.11; Fri long stop -1.12 |
| 03 Jan 22 - 07 Jan 22 | design | 0 | 0 | 0 | - | 0 | +12.73 |  |
| 10 Jan 22 - 14 Jan 22 | design | 1 | 1 | 0 | 100% | +1.90 | +14.63 | Thu long target +1.90 |
| 17 Jan 22 - 21 Jan 22 | design | 0 | 0 | 0 | - | 0 | +14.63 |  |
| 24 Jan 22 - 28 Jan 22 | design | 0 | 0 | 0 | - | 0 | +14.63 |  |
| 31 Jan 22 - 04 Feb 22 | design | 1 | 1 | 0 | 100% | +1.86 | +16.49 | Wed long target +1.86 |
| 07 Feb 22 - 11 Feb 22 | design | 1 | 1 | 0 | 100% | +1.86 | +18.35 | Thu long target +1.86 |
| 14 Feb 22 - 18 Feb 22 | design | 0 | 0 | 0 | - | 0 | +18.35 |  |
| 21 Feb 22 - 25 Feb 22 | design | 0 | 0 | 0 | - | 0 | +18.35 |  |
| 28 Feb 22 - 04 Mar 22 | design | 0 | 0 | 0 | - | 0 | +18.35 |  |
| 07 Mar 22 - 11 Mar 22 | design | 0 | 0 | 0 | - | 0 | +18.35 |  |
| 14 Mar 22 - 18 Mar 22 | design | 0 | 0 | 0 | - | 0 | +18.35 |  |
| 21 Mar 22 - 25 Mar 22 | design | 1 | 0 | 1 | 0% | -1.07 | +17.28 | Mon short stop -1.07 |
| 28 Mar 22 - 01 Apr 22 | design | 0 | 0 | 0 | - | 0 | +17.28 | skipped: data hole (1 d) |
| 04 Apr 22 - 08 Apr 22 | design | 3 | 1 | 2 | 33% | -0.23 | +17.05 | Wed short stop -1.07; Thu long stop -1.07; Fri short target +1.91 |
| 11 Apr 22 - 15 Apr 22 | design | 0 | 0 | 0 | - | 0 | +17.05 |  |
| 18 Apr 22 - 22 Apr 22 | design | 0 | 0 | 0 | - | 0 | +17.05 |  |
| 25 Apr 22 - 29 Apr 22 | design | 0 | 0 | 0 | - | 0 | +17.05 |  |
| 02 May 22 - 06 May 22 | design | 0 | 0 | 0 | - | 0 | +17.05 |  |
| 09 May 22 - 13 May 22 | design | 0 | 0 | 0 | - | 0 | +17.05 |  |
| 16 May 22 - 20 May 22 | design | 1 | 1 | 0 | 100% | +1.95 | +19.00 | Tue long target +1.95 |
| 23 May 22 - 27 May 22 | design | 2 | 0 | 2 | 0% | -2.09 | +16.91 | Tue long stop -1.05; Wed long stop -1.05 |
| 30 May 22 - 03 Jun 22 | design | 2 | 2 | 0 | 100% | +3.87 | +20.77 | Thu long target +1.93; Fri short target +1.94 (NFP) |
| 06 Jun 22 - 10 Jun 22 | design | 1 | 0 | 1 | 0% | -1.05 | +19.72 | Thu short stop -1.05 |
| 13 Jun 22 - 17 Jun 22 | design | 0 | 0 | 0 | - | 0 | +19.72 |  |
| 20 Jun 22 - 24 Jun 22 | design | 0 | 0 | 0 | - | 0 | +19.72 |  |
| 27 Jun 22 - 01 Jul 22 | design | 1 | 0 | 1 | 0% | -1.07 | +18.66 | Tue short stop -1.07 |
| 04 Jul 22 - 08 Jul 22 | design | 1 | 1 | 0 | 100% | +1.95 | +20.60 | Tue short target +1.95 |
| 11 Jul 22 - 15 Jul 22 | design | 0 | 0 | 0 | - | 0 | +20.60 |  |
| 18 Jul 22 - 22 Jul 22 | design | 0 | 0 | 0 | - | 0 | +20.60 |  |
| 25 Jul 22 - 29 Jul 22 | design | 1 | 0 | 1 | 0% | -1.05 | +19.55 | Wed long stop -1.05 (FOMC) |
| 01 Aug 22 - 05 Aug 22 | design | 0 | 0 | 0 | - | 0 | +19.55 |  |
| 08 Aug 22 - 12 Aug 22 | design | 2 | 1 | 1 | 50% | +0.86 | +20.40 | Tue long stop -1.07; Wed long target +1.92 |
| 15 Aug 22 - 19 Aug 22 | design | 1 | 0 | 1 | 0% | -1.06 | +19.34 | Tue short stop -1.06 |
| 22 Aug 22 - 26 Aug 22 | design | 0 | 0 | 0 | - | 0 | +19.34 |  |
| 29 Aug 22 - 02 Sep 22 | design | 1 | 0 | 1 | 0% | -1.07 | +18.27 | Fri short stop -1.07 (NFP) |
| 05 Sep 22 - 09 Sep 22 | design | 0 | 0 | 0 | - | 0 | +18.27 |  |
| 12 Sep 22 - 16 Sep 22 | design | 2 | 1 | 1 | 50% | +0.89 | +19.16 | Mon long target +1.95; Tue long stop -1.06 |
| 19 Sep 22 - 23 Sep 22 | design | 1 | 1 | 0 | 100% | +1.92 | +21.09 | Wed short target +1.92 (FOMC) |
| 26 Sep 22 - 30 Sep 22 | design | 0 | 0 | 0 | - | 0 | +21.09 |  |
| 03 Oct 22 - 07 Oct 22 | design | 0 | 0 | 0 | - | 0 | +21.09 |  |
| 10 Oct 22 - 14 Oct 22 | design | 0 | 0 | 0 | - | 0 | +21.09 |  |
| 17 Oct 22 - 21 Oct 22 | design | 3 | 2 | 1 | 67% | +2.91 | +23.99 | Wed short target +1.97; Thu short stop -1.03; Fri short target +1.97 |
| 24 Oct 22 - 28 Oct 22 | design | 3 | 3 | 0 | 100% | +4.63 | +28.63 | Tue long target +1.97; Wed long target +1.96; Thu short 15:59 close +0.70 |
| 31 Oct 22 - 04 Nov 22 | design | 1 | 1 | 0 | 100% | +1.95 | +30.58 | Mon short target +1.95 |
| 07 Nov 22 - 11 Nov 22 | design | 0 | 0 | 0 | - | 0 | +30.58 |  |
| 14 Nov 22 - 18 Nov 22 | design | 0 | 0 | 0 | - | 0 | +30.58 |  |
| 21 Nov 22 - 25 Nov 22 | design | 1 | 0 | 1 | 0% | -0.13 | +30.45 | Fri short 15:59 close -0.13 |
| 28 Nov 22 - 02 Dec 22 | design | 1 | 0 | 1 | 0% | -1.04 | +29.40 | Fri long stop -1.04 (NFP) |
| 05 Dec 22 - 09 Dec 22 | design | 1 | 0 | 1 | 0% | -1.04 | +28.36 | Thu long stop -1.04 |
| 12 Dec 22 - 16 Dec 22 | design | 2 | 1 | 1 | 50% | +0.90 | +29.26 | Mon short stop -1.05; Wed long target +1.95 (FOMC); skipped: holiday/short day (1 d) |
| 19 Dec 22 - 23 Dec 22 | design | 0 | 0 | 0 | - | 0 | +29.26 |  |
| 26 Dec 22 - 30 Dec 22 | design | 1 | 0 | 1 | 0% | -1.06 | +28.20 | Mon short stop -1.06 |
| 02 Jan 23 - 06 Jan 23 | design | 0 | 0 | 0 | - | 0 | +28.20 |  |
| 09 Jan 23 - 13 Jan 23 | design | 0 | 0 | 0 | - | 0 | +28.20 |  |
| 16 Jan 23 - 20 Jan 23 | design | 0 | 0 | 0 | - | 0 | +28.20 |  |
| 23 Jan 23 - 27 Jan 23 | design | 1 | 0 | 1 | 0% | -1.06 | +27.14 | Wed long stop -1.06 |
| 30 Jan 23 - 03 Feb 23 | design | 3 | 0 | 3 | 0% | -3.19 | +23.96 | Mon short stop -1.06; Wed long stop -1.06 (FOMC); Fri short stop -1.07 (NFP) |
| 06 Feb 23 - 10 Feb 23 | design | 1 | 0 | 1 | 0% | -1.07 | +22.89 | Wed short stop -1.07 |
| 13 Feb 23 - 17 Feb 23 | design | 1 | 1 | 0 | 100% | +1.92 | +24.80 | Tue long target +1.92 |
| 20 Feb 23 - 24 Feb 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 27 Feb 23 - 03 Mar 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 06 Mar 23 - 10 Mar 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 13 Mar 23 - 17 Mar 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 20 Mar 23 - 24 Mar 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 27 Mar 23 - 31 Mar 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 03 Apr 23 - 07 Apr 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 10 Apr 23 - 14 Apr 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 17 Apr 23 - 21 Apr 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 24 Apr 23 - 28 Apr 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 01 May 23 - 05 May 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 08 May 23 - 12 May 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 15 May 23 - 19 May 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 22 May 23 - 26 May 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 29 May 23 - 02 Jun 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 05 Jun 23 - 09 Jun 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 12 Jun 23 - 16 Jun 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 19 Jun 23 - 23 Jun 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 26 Jun 23 - 30 Jun 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 03 Jul 23 - 07 Jul 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 10 Jul 23 - 14 Jul 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 17 Jul 23 - 21 Jul 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 24 Jul 23 - 28 Jul 23 | design | 0 | 0 | 0 | - | 0 | +24.80 | skipped: holiday/short day (5 d) |
| 31 Jul 23 - 04 Aug 23 | design | 1 | 0 | 1 | 0% | -1.09 | +23.71 | Mon long stop -1.09 |
| 07 Aug 23 - 11 Aug 23 | design | 1 | 1 | 0 | 100% | +1.91 | +25.62 | Thu long target +1.91 |
| 14 Aug 23 - 18 Aug 23 | design | 1 | 1 | 0 | 100% | +1.92 | +27.54 | Tue long target +1.92 |
| 21 Aug 23 - 25 Aug 23 | design | 0 | 0 | 0 | - | 0 | +27.54 |  |
| 28 Aug 23 - 01 Sep 23 | design | 0 | 0 | 0 | - | 0 | +27.54 |  |
| 04 Sep 23 - 08 Sep 23 | design | 1 | 0 | 1 | 0% | -1.10 | +26.44 | Thu long stop -1.10 |
| 11 Sep 23 - 15 Sep 23 | design | 0 | 0 | 0 | - | 0 | +26.44 |  |
| 18 Sep 23 - 22 Sep 23 | design | 1 | 1 | 0 | 100% | +1.89 | +28.33 | Wed short target +1.89 (FOMC) |
| 25 Sep 23 - 29 Sep 23 | design | 0 | 0 | 0 | - | 0 | +28.33 | skipped: data hole (1 d) |
| 02 Oct 23 - 06 Oct 23 | design | 0 | 0 | 0 | - | 0 | +28.33 |  |
| 09 Oct 23 - 13 Oct 23 | design | 0 | 0 | 0 | - | 0 | +28.33 |  |
| 16 Oct 23 - 20 Oct 23 | design | 0 | 0 | 0 | - | 0 | +28.33 |  |
| 23 Oct 23 - 27 Oct 23 | design | 1 | 1 | 0 | 100% | +1.91 | +30.24 | Wed short target +1.91 |
| 30 Oct 23 - 03 Nov 23 | design | 0 | 0 | 0 | - | 0 | +30.24 |  |
| 06 Nov 23 - 10 Nov 23 | design | 0 | 0 | 0 | - | 0 | +30.24 |  |
| 13 Nov 23 - 17 Nov 23 | design | 1 | 1 | 0 | 100% | +1.90 | +32.14 | Tue long target +1.90 |
| 20 Nov 23 - 24 Nov 23 | design | 0 | 0 | 0 | - | 0 | +32.14 |  |
| 27 Nov 23 - 01 Dec 23 | design | 0 | 0 | 0 | - | 0 | +32.14 |  |
| 04 Dec 23 - 08 Dec 23 | design | 1 | 0 | 1 | 0% | -1.09 | +31.05 | Tue short stop -1.09 |
| 11 Dec 23 - 15 Dec 23 | design | 0 | 0 | 0 | - | 0 | +31.05 |  |
| 18 Dec 23 - 22 Dec 23 | design | 2 | 2 | 0 | 100% | +3.79 | +34.84 | Tue long target +1.91; Fri long target +1.88 |
| 25 Dec 23 - 29 Dec 23 | design | 1 | 0 | 1 | 0% | -1.10 | +33.74 | Tue short stop -1.10; skipped: holiday/short day (1 d) |
| 01 Jan 24 - 05 Jan 24 | design | 0 | 0 | 0 | - | 0 | +33.74 |  |
| 08 Jan 24 - 12 Jan 24 | design | 0 | 0 | 0 | - | 0 | +33.74 |  |
| 15 Jan 24 - 19 Jan 24 | design | 0 | 0 | 0 | - | 0 | +33.74 | skipped: data hole (1 d) |
| 22 Jan 24 - 26 Jan 24 | design | 1 | 0 | 1 | 0% | -1.07 | +32.67 | Thu long stop -1.07 |
| 29 Jan 24 - 02 Feb 24 | design | 2 | 0 | 2 | 0% | -2.20 | +30.47 | Mon long stop -1.08; Fri long stop -1.12 (NFP) |
| 05 Feb 24 - 09 Feb 24 | design | 3 | 2 | 1 | 67% | +1.42 | +31.88 | Wed long 15:59 close +0.65; Thu short target +1.89; Fri long stop -1.13 |
| 12 Feb 24 - 16 Feb 24 | design | 2 | 0 | 2 | 0% | -2.19 | +29.70 | Mon long stop -1.09; Thu short stop -1.10 |
| 19 Feb 24 - 23 Feb 24 | design | 1 | 1 | 0 | 100% | +1.89 | +31.59 | Tue long target +1.89 |
| 26 Feb 24 - 01 Mar 24 | design | 1 | 0 | 1 | 0% | -1.12 | +30.47 | Tue long stop -1.12 |
| 04 Mar 24 - 08 Mar 24 | design | 1 | 1 | 0 | 100% | +1.87 | +32.34 | Mon long target +1.87 |
| 11 Mar 24 - 15 Mar 24 | design | 1 | 1 | 0 | 100% | +1.85 | +34.18 | Tue short target +1.85 |
| 18 Mar 24 - 22 Mar 24 | design | 0 | 0 | 0 | - | 0 | +34.18 |  |
| 25 Mar 24 - 29 Mar 24 | design | 0 | 0 | 0 | - | 0 | +34.18 |  |
| 01 Apr 24 - 05 Apr 24 | design | 1 | 0 | 1 | 0% | -1.17 | +33.01 | Tue short stop -1.17; skipped: data hole (1 d) |
| 08 Apr 24 - 12 Apr 24 | design | 2 | 1 | 1 | 50% | +0.71 | +33.72 | Tue long stop -1.16; Wed long target +1.87 |
| 15 Apr 24 - 19 Apr 24 | design | 0 | 0 | 0 | - | 0 | +33.72 |  |
| 22 Apr 24 - 26 Apr 24 | design | 0 | 0 | 0 | - | 0 | +33.72 |  |
| 29 Apr 24 - 03 May 24 | design | 0 | 0 | 0 | - | 0 | +33.72 |  |
| 06 May 24 - 10 May 24 | design | 1 | 1 | 0 | 100% | +1.90 | +35.61 | Thu short target +1.90 |
| 13 May 24 - 17 May 24 | design | 2 | 1 | 1 | 50% | +0.75 | +36.36 | Mon long target +1.89; Tue short stop -1.15 |
| 20 May 24 - 24 May 24 | design | 1 | 0 | 1 | 0% | -1.14 | +35.22 | Fri short stop -1.14 |
| 27 May 24 - 31 May 24 | design | 1 | 1 | 0 | 100% | +1.84 | +37.06 | Mon long target +1.84 |
| 03 Jun 24 - 07 Jun 24 | design | 1 | 0 | 1 | 0% | -1.15 | +35.91 | Fri short stop -1.15 (NFP) |
| 10 Jun 24 - 14 Jun 24 | design | 0 | 0 | 0 | - | 0 | +35.91 |  |
| 17 Jun 24 - 21 Jun 24 | design | 1 | 0 | 1 | 0% | -1.14 | +34.77 | Fri long stop -1.14 |
| 24 Jun 24 - 28 Jun 24 | design | 0 | 0 | 0 | - | 0 | +34.77 |  |
| 01 Jul 24 - 05 Jul 24 | design | 0 | 0 | 0 | - | 0 | +34.77 |  |
| 08 Jul 24 - 12 Jul 24 | design | 0 | 0 | 0 | - | 0 | +34.77 |  |
| 15 Jul 24 - 19 Jul 24 | design | 0 | 0 | 0 | - | 0 | +34.77 |  |
| 22 Jul 24 - 26 Jul 24 | design | 1 | 1 | 0 | 100% | +1.85 | +36.62 | Tue short target +1.85 |
| 29 Jul 24 - 02 Aug 24 | design | 0 | 0 | 0 | - | 0 | +36.62 |  |
| 05 Aug 24 - 09 Aug 24 | design | 0 | 0 | 0 | - | 0 | +36.62 |  |
| 12 Aug 24 - 16 Aug 24 | design | 1 | 1 | 0 | 100% | +1.90 | +38.52 | Wed short target +1.90 |
| 19 Aug 24 - 23 Aug 24 | design | 0 | 0 | 0 | - | 0 | +38.52 |  |
| 26 Aug 24 - 30 Aug 24 | design | 1 | 1 | 0 | 100% | +1.87 | +40.39 | Fri long target +1.87 |
| 02 Sep 24 - 06 Sep 24 | design | 2 | 0 | 2 | 0% | -2.24 | +38.14 | Thu long stop -1.10; Fri long stop -1.15 (NFP) |
| 09 Sep 24 - 13 Sep 24 | design | 0 | 0 | 0 | - | 0 | +38.14 |  |
| 16 Sep 24 - 20 Sep 24 | design | 1 | 0 | 1 | 0% | -1.13 | +37.01 | Tue long stop -1.13 |
| 23 Sep 24 - 27 Sep 24 | design | 1 | 0 | 1 | 0% | -1.12 | +35.90 | Mon long stop -1.12 |
| 30 Sep 24 - 04 Oct 24 | design | 1 | 0 | 1 | 0% | -1.08 | +34.81 | Fri long stop -1.08 (NFP) |
| 07 Oct 24 - 11 Oct 24 | design | 1 | 0 | 1 | 0% | -1.10 | +33.72 | Thu long stop -1.10 |
| 14 Oct 24 - 18 Oct 24 | design | 0 | 0 | 0 | - | 0 | +33.72 |  |
| 21 Oct 24 - 25 Oct 24 | design | 1 | 0 | 1 | 0% | -1.11 | +32.61 | Fri short stop -1.11 |
| 28 Oct 24 - 01 Nov 24 | design | 0 | 0 | 0 | - | 0 | +32.61 | skipped: data hole (1 d) |
| 04 Nov 24 - 08 Nov 24 | design | 0 | 0 | 0 | - | 0 | +32.61 | skipped: holiday/short day (1 d) |
| 11 Nov 24 - 15 Nov 24 | design | 0 | 0 | 0 | - | 0 | +32.61 |  |
| 18 Nov 24 - 22 Nov 24 | design | 1 | 1 | 0 | 100% | +1.89 | +34.50 | Thu short target +1.89; skipped: both sides broken same minute (1 d) |
| 25 Nov 24 - 29 Nov 24 | design | 1 | 1 | 0 | 100% | +1.89 | +36.39 | Wed long target +1.89 |
| 02 Dec 24 - 06 Dec 24 | design | 0 | 0 | 0 | - | 0 | +36.39 |  |
| 09 Dec 24 - 13 Dec 24 | design | 2 | 1 | 1 | 50% | +0.78 | +37.17 | Wed short target +1.92; Thu long stop -1.14 |
| 16 Dec 24 - 20 Dec 24 | design | 1 | 1 | 0 | 100% | +1.89 | +39.06 | Mon long target +1.89 |
| 23 Dec 24 - 27 Dec 24 | design | 3 | 2 | 1 | 67% | +2.65 | +41.71 | Tue long target +1.91; Thu short target +1.86; Fri long stop -1.12; skipped: holiday/short day (1 d) |
| 30 Dec 24 - 03 Jan 25 | design | 1 | 0 | 1 | 0% | -1.09 | +40.62 | Mon short stop -1.09 |
| 06 Jan 25 - 10 Jan 25 | design | 0 | 0 | 0 | - | 0 | +40.62 |  |
| 13 Jan 25 - 17 Jan 25 | design | 0 | 0 | 0 | - | 0 | +40.62 | skipped: both sides broken same minute (1 d) |
| 20 Jan 25 - 24 Jan 25 | design | 1 | 0 | 1 | 0% | -1.07 | +39.55 | Thu short stop -1.07 |
| 27 Jan 25 - 31 Jan 25 | design | 3 | 0 | 3 | 0% | -3.19 | +36.36 | Mon short stop -1.07; Thu short stop -1.06; Fri long stop -1.06 |
| 03 Feb 25 - 07 Feb 25 | design | 3 | 3 | 0 | 100% | +5.82 | +42.19 | Wed long target +1.94; Thu short target +1.94; Fri long target +1.94 (NFP) |
| 10 Feb 25 - 14 Feb 25 | design | 1 | 0 | 1 | 0% | -1.07 | +41.12 | Tue short stop -1.07 |
| 17 Feb 25 - 21 Feb 25 | design | 0 | 0 | 0 | - | 0 | +41.12 |  |
| 24 Feb 25 - 28 Feb 25 | design | 0 | 0 | 0 | - | 0 | +41.12 |  |
| 03 Mar 25 - 07 Mar 25 | design | 0 | 0 | 0 | - | 0 | +41.12 |  |
| 10 Mar 25 - 14 Mar 25 | design | 0 | 0 | 0 | - | 0 | +41.12 |  |
| 17 Mar 25 - 21 Mar 25 | design | 2 | 1 | 1 | 50% | +0.84 | +41.96 | Mon long target +1.92; Tue long stop -1.08 |
| 24 Mar 25 - 28 Mar 25 | design | 3 | 1 | 2 | 33% | -0.26 | +41.69 | Tue short stop -1.09; Wed short target +1.92; Fri long stop -1.10 |
| 31 Mar 25 - 04 Apr 25 | design | 0 | 0 | 0 | - | 0 | +41.69 | skipped: data hole (1 d) |
| 07 Apr 25 - 11 Apr 25 | design | 0 | 0 | 0 | - | 0 | +41.69 |  |
| 14 Apr 25 - 18 Apr 25 | design | 0 | 0 | 0 | - | 0 | +41.69 | skipped: quiet night, no breakout (1 d) |
| 21 Apr 25 - 25 Apr 25 | design | 1 | 1 | 0 | 100% | +1.95 | +43.64 | Thu long target +1.95 |
| 28 Apr 25 - 02 May 25 | design | 1 | 1 | 0 | 100% | +1.95 | +45.59 | Wed short target +1.95 |
| 05 May 25 - 09 May 25 | design | 1 | 0 | 1 | 0% | -1.05 | +44.54 | Wed long stop -1.05 (FOMC) |
| 12 May 25 - 16 May 25 | design | 4 | 1 | 3 | 25% | -2.55 | +41.99 | Mon long stop -1.07; Wed short stop -1.07; Thu long 15:59 close +0.65; Fri long stop -1.06 |
| 19 May 25 - 23 May 25 | design | 1 | 1 | 0 | 100% | +1.94 | +43.93 | Mon long target +1.94 |
| 26 May 25 - 30 May 25 | design | 0 | 0 | 0 | - | 0 | +43.93 |  |
| 02 Jun 25 - 06 Jun 25 | design | 2 | 2 | 0 | 100% | +3.88 | +47.81 | Thu long target +1.94; Fri short target +1.94 (NFP) |
| 09 Jun 25 - 13 Jun 25 | design | 0 | 0 | 0 | - | 0 | +47.81 |  |
| 16 Jun 25 - 20 Jun 25 | design | 2 | 1 | 1 | 50% | +0.88 | +48.68 | Tue short target +1.93; Wed long stop -1.06 (FOMC) |
| 23 Jun 25 - 27 Jun 25 | design | 1 | 0 | 1 | 0% | -1.08 | +47.60 | Wed long stop -1.08 |
| 30 Jun 25 - 04 Jul 25 | design | 1 | 1 | 0 | 100% | +1.93 | +49.52 | Wed short target +1.93 |
| 07 Jul 25 - 11 Jul 25 | design | 0 | 0 | 0 | - | 0 | +49.52 |  |
| 14 Jul 25 - 18 Jul 25 | design | 2 | 0 | 2 | 0% | -2.15 | +47.37 | Tue long stop -1.07; Wed long stop -1.08 |
| 21 Jul 25 - 25 Jul 25 | design | 3 | 1 | 2 | 33% | -0.24 | +47.13 | Tue short stop -1.07; Wed short stop -1.08; Thu short target +1.92 |
| 28 Jul 25 - 01 Aug 25 | design | 0 | 0 | 0 | - | 0 | +47.13 |  |
| 04 Aug 25 - 08 Aug 25 | design | 0 | 0 | 0 | - | 0 | +47.13 |  |
| 11 Aug 25 - 15 Aug 25 | design | 1 | 1 | 0 | 100% | +1.90 | +49.03 | Wed long target +1.90 |
| 18 Aug 25 - 22 Aug 25 | design | 1 | 1 | 0 | 100% | +1.91 | +50.94 | Mon short target +1.91 |
| 25 Aug 25 - 29 Aug 25 | design | 0 | 0 | 0 | - | 0 | +50.94 |  |
| 01 Sep 25 - 05 Sep 25 | design | 0 | 0 | 0 | - | 0 | +50.94 |  |
| 08 Sep 25 - 12 Sep 25 | design | 0 | 0 | 0 | - | 0 | +50.94 |  |
| 15 Sep 25 - 19 Sep 25 | design | 0 | 0 | 0 | - | 0 | +50.94 |  |
| 22 Sep 25 - 26 Sep 25 | design | 1 | 0 | 1 | 0% | -1.09 | +49.85 | Thu long stop -1.09 |
| 29 Sep 25 - 03 Oct 25 | design | 0 | 0 | 0 | - | 0 | +49.85 |  |
| 06 Oct 25 - 10 Oct 25 | design | 0 | 0 | 0 | - | 0 | +49.85 |  |
| 13 Oct 25 - 17 Oct 25 | design | 0 | 0 | 0 | - | 0 | +49.85 |  |
| 20 Oct 25 - 24 Oct 25 | design | 0 | 0 | 0 | - | 0 | +49.85 |  |
| 27 Oct 25 - 31 Oct 25 | design | 0 | 0 | 0 | - | 0 | +49.85 |  |
| 03 Nov 25 - 07 Nov 25 | design | 3 | 1 | 2 | 33% | -0.25 | +49.59 | Mon short stop -1.08; Tue long stop -1.08; Thu long target +1.91 |
| 10 Nov 25 - 14 Nov 25 | design | 0 | 0 | 0 | - | 0 | +49.59 |  |
| 17 Nov 25 - 21 Nov 25 | design | 0 | 0 | 0 | - | 0 | +49.59 |  |
| 24 Nov 25 - 28 Nov 25 | design | 0 | 0 | 0 | - | 0 | +49.59 |  |
| 01 Dec 25 - 05 Dec 25 | design | 0 | 0 | 0 | - | 0 | +49.59 |  |
| 08 Dec 25 - 12 Dec 25 | design | 2 | 2 | 0 | 100% | +3.79 | +53.38 | Wed long target +1.92 (FOMC); Fri short target +1.87 |
| 15 Dec 25 - 19 Dec 25 | design | 1 | 0 | 1 | 0% | -1.09 | +52.29 | Thu short stop -1.09 |
| 22 Dec 25 - 26 Dec 25 | design | 0 | 0 | 0 | - | 0 | +52.29 | skipped: holiday/short day (1 d) |
| 29 Dec 25 - 02 Jan 26 | design | 1 | 0 | 1 | 0% | -1.10 | +51.19 | Wed short stop -1.10 |
| 05 Jan 26 - 09 Jan 26 | design | 2 | 1 | 1 | 50% | +0.79 | +51.98 | Thu short target +1.90; Fri short stop -1.11 |
| 12 Jan 26 - 16 Jan 26 | design | 2 | 0 | 2 | 0% | -2.18 | +49.80 | Tue short stop -1.09; Thu long stop -1.09 |
| 19 Jan 26 - 23 Jan 26 | design | 0 | 0 | 0 | - | 0 | +49.80 |  |
| 26 Jan 26 - 30 Jan 26 | design | 0 | 0 | 0 | - | 0 | +49.80 |  |
| 02 Feb 26 - 06 Feb 26 | design | 0 | 0 | 0 | - | 0 | +49.80 |  |
| 09 Feb 26 - 13 Feb 26 | design | 0 | 0 | 0 | - | 0 | +49.80 |  |
| 16 Feb 26 - 20 Feb 26 | design | 4 | 1 | 3 | 25% | -1.33 | +48.47 | Mon long stop -1.12; Tue short target +1.94; Wed long stop -1.09; Thu long stop -1.07 |
| 23 Feb 26 - 27 Feb 26 | design | 0 | 0 | 0 | - | 0 | +48.47 |  |
| 02 Mar 26 - 06 Mar 26 | design | 1 | 0 | 1 | 0% | -1.07 | +47.40 | Fri long stop -1.07 (NFP) |
| 09 Mar 26 - 13 Mar 26 | design | 0 | 0 | 0 | - | 0 | +47.40 |  |
| 16 Mar 26 - 20 Mar 26 | design | 1 | 1 | 0 | 100% | +1.94 | +49.33 | Wed short target +1.94 (FOMC) |
| 23 Mar 26 - 27 Mar 26 | design | 2 | 1 | 1 | 50% | +0.86 | +50.20 | Thu short stop -1.08; Fri short target +1.94 |
| 30 Mar 26 - 03 Apr 26 | design | 1 | 0 | 1 | 0% | -1.09 | +49.10 | Fri long stop -1.09 (NFP); skipped: data hole (1 d) |
| 06 Apr 26 - 10 Apr 26 | design | 3 | 1 | 2 | 33% | -0.19 | +48.91 | Tue long target +1.95; Thu short stop -1.06; Fri short stop -1.08 |
| 13 Apr 26 - 17 Apr 26 | design | 3 | 1 | 2 | 33% | +0.17 | +49.08 | Tue long target +1.92; Wed short 15:59 close -0.67; Fri short stop -1.08 |
| 20 Apr 26 - 24 Apr 26 | design | 0 | 0 | 0 | - | 0 | +49.08 |  |
| 27 Apr 26 - 01 May 26 | design | 0 | 0 | 0 | - | 0 | +49.08 |  |
| 04 May 26 - 08 May 26 | design | 0 | 0 | 0 | - | 0 | +49.08 |  |
| 11 May 26 - 15 May 26 | design | 0 | 0 | 0 | - | 0 | +49.08 |  |
| 18 May 26 - 22 May 26 | design | 1 | 0 | 1 | 0% | -1.10 | +47.97 | Fri short stop -1.10; skipped: holiday/short day (1 d), data hole (1 d) |
| 25 May 26 - 29 May 26 | design | 2 | 1 | 1 | 50% | +0.79 | +48.77 | Mon short stop -1.09; Wed short target +1.89 |
| 01 Jun 26 - 05 Jun 26 | design | 1 | 0 | 1 | 0% | -1.10 | +47.67 | Thu long stop -1.10 |
| 08 Jun 26 - 12 Jun 26 | design | 0 | 0 | 0 | - | 0 | +47.67 |  |
| 15 Jun 26 - 19 Jun 26 | design | 0 | 0 | 0 | - | 0 | +47.67 | skipped: both sides broken same minute (1 d) |
| 22 Jun 26 - 26 Jun 26 | design | 2 | 1 | 1 | 50% | +0.82 | +48.49 | Tue short target +1.91; Wed long stop -1.09 |
| 29 Jun 26 - 03 Jul 26 | design | 0 | 0 | 0 | - | 0 | +48.49 |  |
| 06 Jul 26 - 10 Jul 26 | design | 1 | 0 | 1 | 0% | -1.09 | +47.40 | Wed long stop -1.09 |
| 13 Jul 26 - 17 Jul 26 | design | 0 | 0 | 0 | - | 0 | +47.40 |  |
| 20 Jul 26 - 24 Jul 26 | design | 0 | 0 | 0 | - | 0 | +47.40 |  |
| 27 Jul 26 - 31 Jul 26 | design | 0 | 0 | 0 | - | 0 | +47.40 |  |
| 03 Aug 26 - 07 Aug 26 | design | 2 | 1 | 1 | 50% | +0.03 | +47.43 | Tue long 15:59 close +1.20; Fri long stop -1.16 (NFP) |
| 10 Aug 26 - 14 Aug 26 | design | 4 | 2 | 2 | 50% | +1.49 | +48.92 | Mon long target +1.86; Tue long stop -1.12; Wed long target +1.85; Thu short stop -1.11 |
| 17 Aug 26 - 21 Aug 26 | design | 0 | 0 | 0 | - | 0 | +48.92 |  |
| 24 Aug 26 - 28 Aug 26 | design | 1 | 0 | 1 | 0% | -1.13 | +47.79 | Fri short stop -1.13 |
| 31 Aug 26 - 04 Sep 26 | design | 0 | 0 | 0 | - | 0 | +47.79 |  |
| 07 Sep 26 - 11 Sep 26 | design | 0 | 0 | 0 | - | 0 | +47.79 |  |
| 14 Sep 26 - 18 Sep 26 | design | 0 | 0 | 0 | - | 0 | +47.79 |  |
| 21 Sep 26 - 25 Sep 26 | design | 0 | 0 | 0 | - | 0 | +47.79 | skipped: holiday/short day (1 d) |
| 28 Sep 26 - 02 Oct 26 | design | 0 | 0 | 0 | - | 0 | +47.79 |  |

---

## 3. Step by step, A to Z

### 3.1 Clocks
The rules use **London's clock** for the night box and the order window, and **New York's clock** for the forced close.
Doha never changes its clock, but the UK and the US do:
- **UK summer time:** last Sunday of March to last Sunday of October (London = Doha - 2 hours). **UK winter time:** the rest (London = Doha - 3 hours).
- **US summer time:** 2nd Sunday of March to 1st Sunday of November. **US winter time:** the rest.

| Step | London | New York (normal weeks) | Doha, UK summer (late Mar - late Oct) | Doha, UK winter (late Oct - late Mar) |
|---|---|---|---|---|
| Night box: watch, do nothing | 00:00 - 06:59 | 19:00 (evening before) - 01:59 | 02:00 - 08:59 | 03:00 - 09:59 |
| Place both orders | 07:00 | 02:00 | 09:00 | 10:00 |
| Cancel any unfilled order | 12:00 (end of the 11:59 candle) | 07:00 | 14:00 | 15:00 |

| Forced close (any open trade) | New York | Doha, US summer (2nd Sun Mar - 1st Sun Nov) | Doha, US winter |
|---|---|---|---|
| Close at the end of the 15:59 candle | 16:00 | 23:00 | 00:00 (midnight) |

**The "odd" weeks (2-3 a year):** from the 2nd to the last Sunday of March, and from the last Sunday of October to the 1st Sunday of
November, the US is on summer time but the UK is not. In those weeks London is only 4 hours ahead of New York: the box is 20:00 - 02:59
New York, orders go in at 03:00 New York and expire at 08:00 New York. **The Doha times do not change** in those weeks: use the
"UK winter" column (box 03:00 - 09:59, orders 10:00, expiry 15:00) and the "US summer" forced close (23:00 Doha).
Simplest: put a London clock on your phone or chart and always follow it for the box and the orders.

### 3.2 Which days to trade
- Any Monday to Friday. **One trade per day at most.**
- **Do not trade** on short days and holidays (Christmas Day, New Year's Day, and any day your chart shows clearly fewer candles than
  normal), or when your chart has a hole of more than 15 minutes between 19:00 New York the evening before and 16:00 New York.
- News days (US jobs report, US rate decision, UK data) were **traded** in the test. Skipping them is your choice.
- **Fridays:** in the test, Friday trades lost money in both periods (all years: 96 trades, -18.6 R). The rules still trade Fridays,
  because this was found after the test. If you want to skip Fridays, decide that **before** you start demo trading and keep to it.

### 3.3 Every day: build the "normal night" list (5 minutes)
Chart: **GBPUSD, 1-minute candles** (a 5-minute chart gives the same high and low).
Keep a simple spreadsheet with one row per weekday: date, Asia High, Asia Low, **Asia range in pips** = (High - Low) × 10,000.
- **Asia box** = the highest high (Asia High) and lowest low (Asia Low) of all candles from **00:00 to 06:59 London time**.
- **Normal night** = the **median** of the Asia ranges of the **previous 20 weekdays** (not today). Median = put the 20 numbers in order and
  take the average of the 10th and 11th. In a spreadsheet: `=MEDIAN(` the 20 cells above `)`.
- Count every previous weekday whose box you can see in full, including holidays like Good Friday. Skip a day only if your chart has a hole
  in it during the box. You need 20 days before the first trade.

### 3.4 Before 07:00 London: is tonight quiet? (the setup)
- **Quiet** = today's Asia range is **smaller than 0.7 × the normal night**. Example: normal night 26.8 pips → 0.7 × 26.8 = 18.8 pips.
  Today's box is 16.7 pips → quiet → trade today. If it is 18.8 pips or more → **no trade today**, close the chart.

### 3.5 At 07:00 London (09:00 Doha in UK summer / 10:00 Doha in UK winter): place two orders
- **Buy stop** at the **Asia High**, with stop loss at the **Asia Low**, take profit at **Asia High + 2 × (Asia High - Asia Low)**.
- **Sell stop** at the **Asia Low**, with stop loss at the **Asia High**, take profit at **Asia Low - 2 × (Asia High - Asia Low)**.
- **Position size** for each order (so the stop costs 1% of the account):
  size in lots = (1% of balance) ÷ (box size in pips × value of 1 pip per lot). For GBPUSD, 1 pip on 1 standard lot is about 10 USD.
  Example: balance 10,000 USD, risk 100 USD, box 16.7 pips → 100 ÷ (16.7 × 10) = **0.60 lots**.
- If the box is under 3 pips, do not trade (never happened in 10.75 years; the smallest was 5.9 pips).

### 3.6 Wait for the confirmation: the first order to be filled
- The confirmation **is** the fill: price trades beyond one side of the box. There is no other signal to wait for.
- **As soon as one order fills, cancel the other one.** (Many platforms let you link them as "one cancels the other", OCO.)
- If price jumps past the level, your fill may be a little worse than the box edge; keep the stop and target where they are calculated
  from the actual fill price (target = fill ± 2 × distance from fill to stop).
- If both sides are broken within the same minute, the test took no trade (happened 3 times in 10.75 years).
- **If nothing fills by 12:00 London** (14:00 Doha UK summer / 15:00 Doha UK winter), cancel both orders. No trade today.

### 3.7 Stop loss and take profit (already attached to the orders)
- **Long (bought at Asia High):** stop = Asia Low; target = entry + 2 × (entry - Asia Low).
- **Short (sold at Asia Low):** stop = Asia High; target = entry - 2 × (Asia High - entry).
- A stop-out costs about -1.1 R after costs; a target is about +1.9 R.

### 3.8 Managing the trade
- **Do nothing.** No break-even move, no partial profits, no moving the stop or target. The test did none of this.

### 3.9 Closing time and daily limits
- **Close any open trade at 16:00 New York** (end of the 15:59 candle) = **23:00 Doha in US summer time, 00:00 midnight Doha in US winter time.**
  Never hold overnight. In the test only 4% of trades were still open by then.
- **One trade per day.** After it closes (stop, target or 16:00 New York), stop for the day.

### 3.10 Worked example: Tuesday 23 June 2026 (UK and US summer time)
- **Box (00:00 - 06:59 London = 02:00 - 08:59 Doha = 19:00 - 01:59 New York):** Asia High **1.32496**, Asia Low **1.32329**,
  range **16.7 pips**.
- **Normal night:** median of the previous 20 weekdays' ranges = **26.8 pips**; 0.7 × 26.8 = 18.8. 16.7 < 18.8 → **quiet, trade today**.
- **07:00 London (09:00 Doha, 02:00 New York):** buy stop 1.32496 (stop 1.32329, target 1.32830); sell stop 1.32329 (stop 1.32496,
  target **1.31995**). Size for 1% risk on 10,000 USD: 100 ÷ (16.7 × 10) = 0.60 lots.
- **07:37 London (09:37 Doha, 02:37 New York):** price fell below 1.32329 → **sold at 1.32329**. Buy stop cancelled.
- **15:36 London (17:36 Doha, 10:36 New York):** the target **1.31995** was reached. +33.4 pips - 1.5 pips cost = 31.9 pips ÷ 16.7 = **+1.91 R**.
- For contrast, the next day (Wed 24 June 2026) was also quiet: bought at 1.32043 at 07:10 London (09:10 Doha) and stopped out at 1.31867
  at 07:57 London (09:57 Doha): **-1.09 R**.

### 3.11 Checklist before every trade (tick all)
- [ ] Monday to Friday, not a holiday or short day, no hole in my chart from 19:00 New York yesterday to now.
- [ ] Asia box (00:00 - 06:59 **London**) marked: High ______ Low ______ Range ______ pips.
- [ ] Normal night (median of the previous 20 weekdays) = ______ pips. 0.7 × normal = ______.
- [ ] Today's range is **smaller** than 0.7 × normal. (If not: no trade today.)
- [ ] It is 07:00 London (09:00 Doha UK summer / 10:00 Doha UK winter). No trade taken yet today.
- [ ] Buy stop at Asia High and sell stop at Asia Low placed, each with its stop (other side) and target (2 × box), linked as one-cancels-the-other.
- [ ] Size = 1% risk on the box size. My broker's spread + commission is not more than 1.5 pips.
- [ ] Alarm at 12:00 London to cancel unfilled orders (14:00 / 15:00 Doha).
- [ ] Alarm at 16:00 New York to close the trade if still open (23:00 Doha US summer / 00:00 Doha US winter).

---

## 4. Known weaknesses (read these before trading it)
1. **The edge is thin and very sensitive to cost.** On the hidden years it is about +0.06 R per trade: on a 10,000 USD account risking
   100 USD, about +6 USD per trade on average, with big swings around it. At 3 pips cost the hidden years lose money. Roughly a 1 in 3
   chance the real edge is zero.
2. **It depends on a few good trades.** Without the 5 best hidden trades, the hidden years lose 1.4 R. Each hidden year is negative without
   its 5 best trades.
3. **Losing years happen:** 2016 (-1.8 R), 2019 (-7.2 R) and 2026 so far (-3.4 R). With only about 40 trades a year, a whole year can be
   negative by chance. Fewer than half of the months with a trade are positive.
4. **The main reason to believe in it did not repeat.** On 2019-2026, the quieter the night, the better the trade. On 2016-2018 the very
   quietest nights (box under half of normal) lost money, and the best were the "just quiet" nights (0.6-0.7 × normal).
5. **Buying was weak on the hidden years** (-2.1 R on 67 trades), and **Fridays lost in both periods** (all years -18.6 R).
6. **Wednesday and Thursday carry the profit.** Over all years, Monday + Tuesday + Friday together lost 11.6 R; Wednesday + Thursday made +59.4 R.
   There is no clear reason for this, so it may not last.
7. **Early-morning fills:** about half the trades fill in the first 15 minutes of the London open, when spreads can be wider at some brokers.
   The test used bid prices; on a real chart a buy stop triggers on the ask price, about one spread earlier, so a few trades may differ.
8. **It was the best of 47 ideas tried in this round.** Picking the best of many makes it look better than it is; the hidden years
   (+0.06 R per trade) are the honest number, not the design years (+0.13 R).
9. **Data:** one free data source (HistData bid prices). Your broker's prices will differ slightly, which can change individual trades.

---

## 5. Before you use it: your own checks
1. **Check your broker's cost** for GBPUSD at 07:00 - 08:00 London: spread plus commission per round trip. If it is more than 1.5 pips,
   do not use this strategy: the test says it does not survive higher costs.
2. **Repeat the backtest by hand** on at least 20 trades from the list (`backtest/trades_v3.csv`), including 23 June 2026 above: same box,
   same "quiet" decision, same direction, similar entry, stop and target on your broker's chart. Note any differences. Also check a few
   days the test did **not** trade (`backtest/days_v3.csv` gives the reason for every day).
3. **Demo-trade it** (a practice account, no real money) following the checklist exactly. It trades only about once a week, so give it at
   least **6 months** (about 20 trades) before judging, and expect losing runs of 4-6 trades. Compare with the test: about 4 wins in 10,
   wins near +1.9 R, losses near -1.1 R.
4. Only then decide, yourself, whether to go live, and with how much risk. Given grade B, consider risking less than 1% at first.

*Past results do not guarantee future results. A strategy that made money in the past can lose money in the future.
Trading carries a real risk of loss. This is not financial advice.*
