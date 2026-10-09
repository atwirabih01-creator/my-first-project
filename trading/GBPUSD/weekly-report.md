# GBPUSD weekly report: strategy v1 ("New York false break of yesterday's high/low")

**Written by:** Agent 2 (Backtest & Performance Manager). **Report date:** 9 Oct 2026.
**Status of v1:** tested. **Verdict: DROP** (reasons at the bottom and in `feedback.md`).

**How to read this:**
- **R** = the amount risked on one trade (1% of the account). +2 R = won twice the risk; −1 R = lost the full risk.
- Every result already has the trading cost taken off (1.5 pips per trade).
- "dev" weeks are the months Agent 1 used to design the rules (Oct 2025 – Jun 2026). "hidden" weeks are Jul – Sep 2026,
  which Agent 1 never saw. The week of 29 Jun – 3 Jul has one trade, on a July day, so it counts as hidden.
- Signals come between 08:00 and 11:00 New York time (15:00–18:00 Doha in US summer time, 16:00–19:00 Doha in US winter time).
- A "win" is any trade that ended above zero. That includes small gains from the 16:00 New York forced close.
- The full trade list, with Doha and New York times for every trade, is in `backtest/trades_v1.csv`.
- **Data correction used here:** in 4 weeks of the price file (27–31 Oct 2025 and 9–27 Mar 2026), the clock was
  1 hour early. I corrected it (details in `feedback.md`). Without the correction the 12-month total would be +16.95 R
  instead of +14.22 R.

## Week by week, Oct 2025 – Sep 2026 (one row per Monday–Friday week)

| Week (Mon–Fri) | Period | Trades | Wins | Losses | Win rate | Result (R) | Running total (R) | Notes |
|---|---|---|---|---|---|---|---|---|
| 29 Sep 2025 - 03 Oct 2025 | dev | 0 | 0 | 0 | - | 0 (no trade) | +0.00 |  |
| 06 Oct 2025 - 10 Oct 2025 | dev | 4 | 2 | 2 | 50% | +2.50 | +2.50 |  |
| 13 Oct 2025 - 17 Oct 2025 | dev | 1 | 0 | 1 | 0% | -1.14 | +1.36 |  |
| 20 Oct 2025 - 24 Oct 2025 | dev | 1 | 1 | 0 | 100% | +1.72 | +3.08 | Fri news (US CPI) +1.72R |
| 27 Oct 2025 - 31 Oct 2025 | dev | 2 | 1 | 1 | 50% | +0.13 | +3.20 |  |
| 03 Nov 2025 - 07 Nov 2025 | dev | 0 | 0 | 0 | - | 0 (no trade) | +3.20 |  |
| 10 Nov 2025 - 14 Nov 2025 | dev | 2 | 1 | 1 | 50% | -0.13 | +3.07 |  |
| 17 Nov 2025 - 21 Nov 2025 | dev | 1 | 1 | 0 | 100% | +1.78 | +4.86 |  |
| 24 Nov 2025 - 28 Nov 2025 | dev | 4 | 2 | 2 | 50% | +0.41 | +5.26 | 2 losses |
| 01 Dec 2025 - 05 Dec 2025 | dev | 2 | 1 | 1 | 50% | +0.45 | +5.71 |  |
| 08 Dec 2025 - 12 Dec 2025 | dev | 3 | 1 | 2 | 33% | -0.71 | +5.00 | 2 losses |
| 15 Dec 2025 - 19 Dec 2025 | dev | 3 | 2 | 1 | 67% | +2.64 | +7.64 | Wed news (UK CPI) +1.92R; Thu news (US CPI+BoE) -1.07R |
| 22 Dec 2025 - 26 Dec 2025 | dev | 0 | 0 | 0 | - | 0 (no trade) | +7.64 |  |
| 29 Dec 2025 - 02 Jan 2026 | dev | 2 | 0 | 2 | 0% | -1.64 | +6.00 |  |
| 05 Jan 2026 - 09 Jan 2026 | dev | 3 | 1 | 2 | 33% | -0.20 | +5.80 | Fri news (NFP) -1.03R; 2 losses |
| 12 Jan 2026 - 16 Jan 2026 | dev | 1 | 1 | 0 | 100% | +1.93 | +7.73 | Tue news (US CPI) +1.93R |
| 19 Jan 2026 - 23 Jan 2026 | dev | 1 | 0 | 1 | 0% | -1.40 | +6.32 |  |
| 26 Jan 2026 - 30 Jan 2026 | dev | 2 | 1 | 1 | 50% | +0.64 | +6.97 |  |
| 02 Feb 2026 - 06 Feb 2026 | dev | 1 | 1 | 0 | 100% | +1.09 | +8.06 |  |
| 09 Feb 2026 - 13 Feb 2026 | dev | 1 | 0 | 1 | 0% | -0.68 | +7.38 | Wed news (NFP) -0.68R |
| 16 Feb 2026 - 20 Feb 2026 | dev | 0 | 0 | 0 | - | 0 (no trade) | +7.38 |  |
| 23 Feb 2026 - 27 Feb 2026 | dev | 3 | 1 | 2 | 33% | -0.69 | +6.68 | 2 losses |
| 02 Mar 2026 - 06 Mar 2026 | dev | 1 | 1 | 0 | 100% | +1.90 | +8.58 | Fri news (NFP) +1.90R |
| 09 Mar 2026 - 13 Mar 2026 | dev | 2 | 0 | 2 | 0% | -2.43 | +6.15 | Wed news (US CPI) -1.33R; 2 losses |
| 16 Mar 2026 - 20 Mar 2026 | dev | 0 | 0 | 0 | - | 0 (no trade) | +6.15 |  |
| 23 Mar 2026 - 27 Mar 2026 | dev | 2 | 0 | 2 | 0% | -2.07 | +4.08 | 2 losses |
| 30 Mar 2026 - 03 Apr 2026 | dev | 2 | 2 | 0 | 100% | +2.22 | +6.30 |  |
| 06 Apr 2026 - 10 Apr 2026 | dev | 2 | 1 | 1 | 50% | -1.07 | +5.23 | Fri news (US CPI) -1.14R |
| 13 Apr 2026 - 17 Apr 2026 | dev | 2 | 1 | 1 | 50% | +0.67 | +5.91 |  |
| 20 Apr 2026 - 24 Apr 2026 | dev | 1 | 0 | 1 | 0% | -1.07 | +4.83 |  |
| 27 Apr 2026 - 01 May 2026 | dev | 1 | 1 | 0 | 100% | +0.49 | +5.33 |  |
| 04 May 2026 - 08 May 2026 | dev | 0 | 0 | 0 | - | 0 (no trade) | +5.33 |  |
| 11 May 2026 - 15 May 2026 | dev | 1 | 1 | 0 | 100% | +0.29 | +5.62 |  |
| 18 May 2026 - 22 May 2026 | dev | 2 | 1 | 1 | 50% | +0.74 | +6.35 | Wed news (UK CPI) -1.16R |
| 25 May 2026 - 29 May 2026 | dev | 2 | 1 | 1 | 50% | -0.07 | +6.28 |  |
| 01 Jun 2026 - 05 Jun 2026 | dev | 3 | 2 | 1 | 67% | +2.49 | +8.77 | Fri news (NFP) +1.83R |
| 08 Jun 2026 - 12 Jun 2026 | dev | 1 | 1 | 0 | 100% | +1.90 | +10.68 | Wed news (US CPI) +1.91R |
| 15 Jun 2026 - 19 Jun 2026 | dev | 2 | 0 | 2 | 0% | -2.32 | +8.36 | Wed news (FOMC+UK CPI) -1.14R; 2 losses |
| 22 Jun 2026 - 26 Jun 2026 | dev | 3 | 2 | 1 | 67% | +1.49 | +9.85 |  |
| 29 Jun 2026 - 03 Jul 2026 | dev/hidden | 1 | 0 | 1 | 0% | -1.08 | +8.77 |  |
| 06 Jul 2026 - 10 Jul 2026 | hidden | 3 | 2 | 1 | 67% | +2.65 | +11.42 |  |
| 13 Jul 2026 - 17 Jul 2026 | hidden | 3 | 1 | 2 | 33% | -1.71 | +9.71 | Tue news (US CPI) +0.55R; 2 losses |
| 20 Jul 2026 - 24 Jul 2026 | hidden | 1 | 1 | 0 | 100% | +0.48 | +10.19 |  |
| 27 Jul 2026 - 31 Jul 2026 | hidden | 2 | 1 | 1 | 50% | +0.68 | +10.87 | Thu news (BoE) -1.15R |
| 03 Aug 2026 - 07 Aug 2026 | hidden | 1 | 0 | 1 | 0% | -0.03 | +10.84 | Fri news (NFP) -0.03R |
| 10 Aug 2026 - 14 Aug 2026 | hidden | 2 | 1 | 1 | 50% | -0.70 | +10.14 | Wed news (US CPI) +0.59R |
| 17 Aug 2026 - 21 Aug 2026 | hidden | 4 | 2 | 2 | 50% | +2.17 | +12.31 |  |
| 24 Aug 2026 - 28 Aug 2026 | hidden | 2 | 0 | 2 | 0% | -1.05 | +11.25 |  |
| 31 Aug 2026 - 04 Sep 2026 | hidden | 3 | 2 | 1 | 67% | +2.87 | +14.12 |  |
| 07 Sep 2026 - 11 Sep 2026 | hidden | 3 | 3 | 0 | 100% | +2.46 | +16.58 | Fri news (US CPI) +0.56R |
| 14 Sep 2026 - 18 Sep 2026 | hidden | 3 | 1 | 2 | 33% | -0.82 | +15.76 | Thu news (BoE) -1.09R; 2 losses |
| 21 Sep 2026 - 25 Sep 2026 | hidden | 3 | 1 | 2 | 33% | -0.40 | +15.37 | 2 losses |
| 28 Sep 2026 - 02 Oct 2026 | hidden | 1 | 0 | 1 | 0% | -1.15 | +14.22 |  |

## Summary in plain words

**The 12 months above:** 96 trades, 47.9% winners, **+14.22 R** in total (about +14% on the account at 1% risk per trade).
25 winning weeks, 22 losing weeks, 6 weeks with no trade. The worst week was −2.43 R (9–13 Mar 2026). The biggest drop
from a high point was −4.64 R (about −4.7%). The longest run of losing trades in a row was 4.

| Period | Trades | Win rate | Total | Profit factor | Biggest drop | Longest losing run |
|---|---|---|---|---|---|---|
| Design months, Oct 2025 – Jun 2026 | 64 | 48.4% | +9.85 R | 1.29 | −4.64 R (−4.7%) | 4 |
| Hidden check, Jul – Sep 2026 | 32 | 46.9% | +4.37 R | 1.28 | −3.37 R (−3.3%) | 3 |
| **Extra check, Oct 2024 – Sep 2025** (the year before) | 94 | 30.9% | **−21.89 R** | 0.67 | **−26.21 R (−23.4%)** | **9** |
| All 24 months together | 190 | 39.5% | **−7.67 R** | 0.93 | −26.21 R (−23.4%) | 9 |

(Profit factor = money won ÷ money lost. Above 1 makes money; below 1 loses money.)

**What is working:** in the 12 months shown in the table, the rules made a small, steady profit. Drops stayed small
and losing runs stayed short. The hidden Jul–Sep 2026 months were also slightly positive (+4.37 R).

**What is not working:**
- The hidden-months profit is thin. It turns negative if trading costs are 3 pips instead of 1.5, or if you remove
  the 3 best trades. With only 32 trades, there is roughly a 1-in-4 chance it came from luck alone.
- To get a second honest check, I downloaded the year *before* the test data (Oct 2024 – Sep 2025, same free source) and
  ran the exact same rules. That year **lost 21.9 R**: only 31% of trades won, it had a losing run of **9 trades in a row**,
  and it had 7 separate runs of 5 or more losses. The account would have dropped about 23%.
- Over the full 24 months the rules lose money. This is exactly the "long losing streaks" problem the owner wants to avoid.
- The details that looked good (better on Fridays, better with big stops) flip from one period to the next, so they are
  most likely chance rather than real patterns.

**What is being changed:** v1 is dropped. Agent 1 has the feedback (`feedback.md`) and will either bring a new idea for GBPUSD
or rebuild this one on a longer history.

**What to watch next week:** nothing to trade. The next step is Agent 1's new rules. Any new version must be positive on
every period already looked at, and then pass a final check on an older year (Oct 2023 – Sep 2024) that nobody has opened yet.

*Past results do not guarantee future results. This is a test on historical prices, not trading advice.*
