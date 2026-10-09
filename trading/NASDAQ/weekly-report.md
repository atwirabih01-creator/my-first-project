# NASDAQ 100: weekly report (Agent 2)

**Strategy:** v1 "Fade the big opening gap" (rules in `strategy.md`). **Report date:** Sunday edition, prepared 9 Oct 2026.
**Status:** tested on all 36 months. **Verdict: IMPROVE** (not ready for the owner). See `feedback.md`.

How to read the table:
- One row per week, Monday to Friday, 2 Oct 2023 to 2 Oct 2026. 1 R = the 1% of the account risked on a trade.
- Costs of 2.0 index points per trade are already taken off every result.
- **Period:** A = hidden test year Oct 2023 - Sep 2024 (nobody had seen it; the main judge), Y1 and Y2 = the data the rules were
  designed on (Oct 2024 - Jun 2026), B = hidden test Jul - Sep 2026 (the most recent months).
- The trade is entered at 09:35 New York = 16:35 Doha (US summer time) / 17:35 Doha (US winter time), and is closed by 16:00 New York
  = 23:00 Doha (summer) / 00:00 midnight Doha (winter) at the latest.
- **Notes:** each trade as "weekday, direction, how it ended, result". "16:00 close" = neither stop nor target was hit, closed at the
  end of the session. Labels in brackets: NFP (US jobs report), CPI (US inflation), PPI (producer prices), FOMC (US interest-rate
  decision), EARN (day after a big-tech company, Nvidia / Apple / Microsoft / Alphabet, reported its results).
  "skipped" = the day could not be traded by the rules (US holiday, half day, missing price data, or the day after one of those).
- Weeks with 0 trades: no day had a gap big enough. That is normal; the rule trades about 1 day in 4.

| Week (Mon - Fri) | Period | Trades | Wins | Losses | Win rate | Result (R) | Running total (R) | Notes |
|---|---|---|---|---|---|---|---|---|
| 02 Oct 23 - 06 Oct 23 | A | 0 | 0 | 0 | - | 0 | +0.00 | skipped: ATR warm-up, first day in file |
| 09 Oct 23 - 13 Oct 23 | A | 0 | 0 | 0 | - | 0 | +0.00 | skipped: ATR warm-up |
| 16 Oct 23 - 20 Oct 23 | A | 1 | 1 | 0 | 100% | +0.87 | +0.87 | Tue long target +0.87 |
| 23 Oct 23 - 27 Oct 23 | A | 0 | 0 | 0 | - | 0 | +0.87 |  |
| 30 Oct 23 - 03 Nov 23 | A | 1 | 0 | 1 | 0% | -0.47 | +0.40 | Thu short 16:00 close -0.47 |
| 06 Nov 23 - 10 Nov 23 | A | 0 | 0 | 0 | - | 0 | +0.40 |  |
| 13 Nov 23 - 17 Nov 23 | A | 1 | 0 | 1 | 0% | -0.35 | +0.06 | Tue short 16:00 close -0.35 (CPI) |
| 20 Nov 23 - 24 Nov 23 | A | 0 | 0 | 0 | - | 0 | +0.06 | skipped: US holiday, early close |
| 27 Nov 23 - 01 Dec 23 | A | 1 | 1 | 0 | 100% | +1.15 | +1.21 | Wed short target +1.15; skipped: day after a skipped day |
| 04 Dec 23 - 08 Dec 23 | A | 4 | 2 | 2 | 50% | -0.46 | +0.75 | Mon long stop -1.02; Tue long target +0.69; Wed short target +0.47; Thu short 16:00 close -0.59 |
| 11 Dec 23 - 15 Dec 23 | A | 0 | 0 | 0 | - | 0 | +0.75 |  |
| 18 Dec 23 - 22 Dec 23 | A | 1 | 0 | 1 | 0% | -0.15 | +0.60 | Thu short 16:00 close -0.15 |
| 25 Dec 23 - 29 Dec 23 | A | 0 | 0 | 0 | - | 0 | +0.60 |  |
| 01 Jan 24 - 05 Jan 24 | A | 3 | 1 | 2 | 33% | -1.15 | -0.56 | Tue long stop -1.02; Wed long 16:00 close -0.59; Thu long target +0.45 |
| 08 Jan 24 - 12 Jan 24 | A | 1 | 1 | 0 | 100% | +0.72 | +0.16 | Tue long target +0.72 |
| 15 Jan 24 - 19 Jan 24 | A | 2 | 1 | 1 | 50% | +0.32 | +0.48 | Wed long 16:00 close +0.84; Thu short 16:00 close -0.52; skipped: US holiday, day after a skipped day |
| 22 Jan 24 - 26 Jan 24 | A | 1 | 1 | 0 | 100% | +0.22 | +0.70 | Wed short 16:00 close +0.22 |
| 29 Jan 24 - 02 Feb 24 | A | 1 | 0 | 1 | 0% | -1.01 | -0.31 | Wed long stop -1.01 (FOMC+EARN) |
| 05 Feb 24 - 09 Feb 24 | A | 1 | 0 | 1 | 0% | -0.61 | -0.92 | Wed short 16:00 close -0.61 |
| 12 Feb 24 - 16 Feb 24 | A | 2 | 1 | 1 | 50% | -0.21 | -1.13 | Tue long 16:00 close +0.39 (CPI); Wed short 16:00 close -0.60 |
| 19 Feb 24 - 23 Feb 24 | A | 2 | 1 | 1 | 50% | -0.78 | -1.92 | Wed long 16:00 close +0.23; Thu short stop -1.01 (EARN); skipped: US holiday, day after a skipped day |
| 26 Feb 24 - 01 Mar 24 | A | 2 | 1 | 1 | 50% | +0.97 | -0.95 | Wed long 16:00 close -0.05; Thu short target +1.02 |
| 04 Mar 24 - 08 Mar 24 | A | 3 | 1 | 2 | 33% | -1.67 | -2.62 | Tue long stop -1.01; Wed short 16:00 close +0.36; Thu short stop -1.01 |
| 11 Mar 24 - 15 Mar 24 | A | 1 | 0 | 1 | 0% | -0.59 | -3.21 | Fri long 16:00 close -0.59 |
| 18 Mar 24 - 22 Mar 24 | A | 2 | 2 | 0 | 100% | +1.15 | -2.06 | Mon short 16:00 close +0.58; Thu short 16:00 close +0.57 |
| 25 Mar 24 - 29 Mar 24 | A | 1 | 1 | 0 | 100% | +0.48 | -1.57 | Wed short target +0.48 |
| 01 Apr 24 - 05 Apr 24 | A | 3 | 3 | 0 | 100% | +2.30 | +0.73 | Tue long 16:00 close +0.48; Wed long target +0.48; Thu short target +1.34 |
| 08 Apr 24 - 12 Apr 24 | A | 2 | 1 | 1 | 50% | -0.75 | -0.02 | Wed long 16:00 close +0.26 (CPI); Fri long stop -1.01 |
| 15 Apr 24 - 19 Apr 24 | A | 1 | 1 | 0 | 100% | +0.54 | +0.52 | Mon short target +0.54 |
| 22 Apr 24 - 26 Apr 24 | A | 1 | 1 | 0 | 100% | +1.32 | +1.84 | Thu long 16:00 close +1.32 |
| 29 Apr 24 - 03 May 24 | A | 2 | 1 | 1 | 50% | +0.29 | +2.13 | Thu short target +0.56; Fri short 16:00 close -0.27 (NFP+EARN) |
| 06 May 24 - 10 May 24 | A | 0 | 0 | 0 | - | 0 | +2.13 |  |
| 13 May 24 - 17 May 24 | A | 0 | 0 | 0 | - | 0 | +2.13 |  |
| 20 May 24 - 24 May 24 | A | 1 | 1 | 0 | 100% | +1.32 | +3.45 | Thu short target +1.32 (EARN) |
| 27 May 24 - 31 May 24 | A | 1 | 1 | 0 | 100% | +0.09 | +3.55 | Wed long 16:00 close +0.09; skipped: US holiday, day after a skipped day |
| 03 Jun 24 - 07 Jun 24 | A | 2 | 1 | 1 | 50% | -0.12 | +3.42 | Mon short target +0.89; Wed short stop -1.01 |
| 10 Jun 24 - 14 Jun 24 | A | 2 | 1 | 1 | 50% | -0.15 | +3.27 | Wed short 16:00 close -0.35 (CPI+FOMC); Thu short 16:00 close +0.20 (PPI) |
| 17 Jun 24 - 21 Jun 24 | A | 0 | 0 | 0 | - | 0 | +3.27 | skipped: US holiday, day after a skipped day |
| 24 Jun 24 - 28 Jun 24 | A | 0 | 0 | 0 | - | 0 | +3.27 |  |
| 01 Jul 24 - 05 Jul 24 | A | 0 | 0 | 0 | - | 0 | +3.27 | skipped: US holiday, day after a skipped day, early close |
| 08 Jul 24 - 12 Jul 24 | A | 0 | 0 | 0 | - | 0 | +3.27 |  |
| 15 Jul 24 - 19 Jul 24 | A | 2 | 1 | 1 | 50% | -0.47 | +2.80 | Wed long stop -1.01; Thu short target +0.54 |
| 22 Jul 24 - 26 Jul 24 | A | 3 | 0 | 3 | 0% | -1.83 | +0.96 | Mon short 16:00 close -0.43; Wed long stop -1.01 (EARN); Fri short 16:00 close -0.39 |
| 29 Jul 24 - 02 Aug 24 | A | 2 | 1 | 1 | 50% | -0.94 | +0.03 | Wed short stop -1.01 (FOMC+EARN); Fri long 16:00 close +0.07 (NFP+EARN) |
| 05 Aug 24 - 09 Aug 24 | A | 3 | 2 | 1 | 67% | +1.48 | +1.51 | Mon long 16:00 close +1.43; Wed short target +1.06; Thu short stop -1.01 |
| 12 Aug 24 - 16 Aug 24 | A | 1 | 0 | 1 | 0% | -0.64 | +0.87 | Thu short 16:00 close -0.64; skipped: day after a skipped day, missing price data |
| 19 Aug 24 - 23 Aug 24 | A | 0 | 0 | 0 | - | 0 | +0.87 |  |
| 26 Aug 24 - 30 Aug 24 | A | 1 | 1 | 0 | 100% | +0.68 | +1.55 | Fri short target +0.68 |
| 02 Sep 24 - 06 Sep 24 | A | 0 | 0 | 0 | - | 0 | +1.55 | skipped: US holiday, day after a skipped day |
| 09 Sep 24 - 13 Sep 24 | A | 1 | 0 | 1 | 0% | -0.15 | +1.40 | Mon short 16:00 close -0.15 |
| 16 Sep 24 - 20 Sep 24 | A | 1 | 0 | 1 | 0% | -0.20 | +1.20 | Thu short 16:00 close -0.20 |
| 23 Sep 24 - 27 Sep 24 | A | 1 | 1 | 0 | 100% | +1.13 | +2.33 | Thu short target +1.13 |
| 30 Sep 24 - 04 Oct 24 | A/Y1 | 1 | 0 | 1 | 0% | -0.06 | +2.27 | Fri short 16:00 close -0.06 (NFP) |
| 07 Oct 24 - 11 Oct 24 | Y1 | 0 | 0 | 0 | - | 0 | +2.27 |  |
| 14 Oct 24 - 18 Oct 24 | Y1 | 1 | 1 | 0 | 100% | +0.61 | +2.88 | Thu short 16:00 close +0.61 |
| 21 Oct 24 - 25 Oct 24 | Y1 | 1 | 1 | 0 | 100% | +0.70 | +3.58 | Tue long target +0.70; skipped: day after a skipped day, missing price data |
| 28 Oct 24 - 01 Nov 24 | Y1 | 1 | 0 | 1 | 0% | -1.01 | +2.57 | Thu long stop -1.01 (EARN); skipped: day after a skipped day, missing price data |
| 04 Nov 24 - 08 Nov 24 | Y1 | 1 | 0 | 1 | 0% | -1.01 | +1.56 | Wed short stop -1.01 |
| 11 Nov 24 - 15 Nov 24 | Y1 | 0 | 0 | 0 | - | 0 | +1.56 | skipped: day after a skipped day, missing price data |
| 18 Nov 24 - 22 Nov 24 | Y1 | 1 | 1 | 0 | 100% | +0.22 | +1.78 | Thu short target +0.22 (EARN) |
| 25 Nov 24 - 29 Nov 24 | Y1 | 1 | 1 | 0 | 100% | +0.84 | +2.62 | Mon short target +0.84; skipped: US holiday, early close |
| 02 Dec 24 - 06 Dec 24 | Y1 | 1 | 0 | 1 | 0% | -0.67 | +1.95 | Wed short 16:00 close -0.67; skipped: day after a skipped day |
| 09 Dec 24 - 13 Dec 24 | Y1 | 2 | 1 | 1 | 50% | -0.92 | +1.03 | Wed short stop -1.01 (CPI); Fri short 16:00 close +0.10 |
| 16 Dec 24 - 20 Dec 24 | Y1 | 3 | 2 | 1 | 67% | +0.84 | +1.87 | Mon short stop -1.01; Thu short target +0.97; Fri long target +0.88 |
| 23 Dec 24 - 27 Dec 24 | Y1 | 0 | 0 | 0 | - | 0 | +1.87 | skipped: day after a skipped day, early close |
| 30 Dec 24 - 03 Jan 25 | Y1 | 1 | 1 | 0 | 100% | +0.26 | +2.13 | Mon long 16:00 close +0.26 |
| 06 Jan 25 - 10 Jan 25 | Y1 | 1 | 1 | 0 | 100% | +0.08 | +2.21 | Mon short 16:00 close +0.08; skipped: US holiday, day after a skipped day |
| 13 Jan 25 - 17 Jan 25 | Y1 | 3 | 1 | 2 | 33% | +0.01 | +2.22 | Mon long 16:00 close +0.71; Wed short 16:00 close -0.50 (CPI); Fri short 16:00 close -0.19 |
| 20 Jan 25 - 24 Jan 25 | Y1 | 1 | 0 | 1 | 0% | -0.15 | +2.07 | Wed short 16:00 close -0.15; skipped: US holiday, day after a skipped day |
| 27 Jan 25 - 31 Jan 25 | Y1 | 2 | 2 | 0 | 100% | +1.07 | +3.14 | Mon long 16:00 close +0.11; Fri short target +0.95 (EARN) |
| 03 Feb 25 - 07 Feb 25 | Y1 | 1 | 1 | 0 | 100% | +0.86 | +4.00 | Mon long 16:00 close +0.86 |
| 10 Feb 25 - 14 Feb 25 | Y1 | 2 | 1 | 1 | 50% | +0.50 | +4.50 | Mon short 16:00 close -0.40; Wed long target +0.90 (CPI) |
| 17 Feb 25 - 21 Feb 25 | Y1 | 0 | 0 | 0 | - | 0 | +4.50 | skipped: US holiday, day after a skipped day |
| 24 Feb 25 - 28 Feb 25 | Y1 | 1 | 1 | 0 | 100% | +0.74 | +5.23 | Thu short target +0.74 (EARN) |
| 03 Mar 25 - 07 Mar 25 | Y1 | 1 | 0 | 1 | 0% | -0.61 | +4.62 | Thu long 16:00 close -0.61 |
| 10 Mar 25 - 14 Mar 25 | Y1 | 2 | 1 | 1 | 50% | -0.68 | +3.94 | Mon long stop -1.01; Wed short 16:00 close +0.32 (CPI) |
| 17 Mar 25 - 21 Mar 25 | Y1 | 0 | 0 | 0 | - | 0 | +3.94 |  |
| 24 Mar 25 - 28 Mar 25 | Y1 | 1 | 0 | 1 | 0% | -0.39 | +3.55 | Mon short 16:00 close -0.39 |
| 31 Mar 25 - 04 Apr 25 | Y1 | 4 | 2 | 2 | 50% | +0.39 | +3.94 | Mon long target +1.69; Wed long target +0.72; Thu long stop -1.01; Fri long stop -1.01 (NFP) |
| 07 Apr 25 - 11 Apr 25 | Y1 | 3 | 2 | 1 | 67% | +3.15 | +7.10 | Mon long target +2.45; Tue short target +1.70; Thu long stop -1.00 (CPI) |
| 14 Apr 25 - 18 Apr 25 | Y1 | 1 | 1 | 0 | 100% | +0.62 | +7.71 | Mon short target +0.62 |
| 21 Apr 25 - 25 Apr 25 | Y1 | 1 | 1 | 0 | 100% | +0.33 | +8.04 | Wed short 16:00 close +0.33 |
| 28 Apr 25 - 02 May 25 | Y1 | 3 | 2 | 1 | 67% | +0.65 | +8.69 | Wed long target +0.76; Thu short 16:00 close +0.18 (EARN); Fri short 16:00 close -0.29 (NFP+EARN) |
| 05 May 25 - 09 May 25 | Y1 | 2 | 1 | 1 | 50% | -0.01 | +8.68 | Tue long 16:00 close +0.13; Thu short 16:00 close -0.14 |
| 12 May 25 - 16 May 25 | Y1 | 1 | 0 | 1 | 0% | -0.49 | +8.19 | Mon short 16:00 close -0.49 |
| 19 May 25 - 23 May 25 | Y1 | 3 | 3 | 0 | 100% | +2.05 | +10.24 | Mon long target +1.10; Wed long target +0.60; Fri long 16:00 close +0.35 |
| 26 May 25 - 30 May 25 | Y1 | 1 | 1 | 0 | 100% | +1.16 | +11.40 | Thu short target +1.16 (EARN); skipped: US holiday, day after a skipped day |
| 02 Jun 25 - 06 Jun 25 | Y1 | 1 | 0 | 1 | 0% | -0.05 | +11.35 | Fri short 16:00 close -0.05 (NFP) |
| 09 Jun 25 - 13 Jun 25 | Y1 | 1 | 0 | 1 | 0% | -0.57 | +10.78 | Fri long 16:00 close -0.57 |
| 16 Jun 25 - 20 Jun 25 | Y1 | 1 | 0 | 1 | 0% | -0.53 | +10.25 | Mon short 16:00 close -0.53; skipped: US holiday, day after a skipped day |
| 23 Jun 25 - 27 Jun 25 | Y1 | 1 | 0 | 1 | 0% | -0.58 | +9.67 | Tue short 16:00 close -0.58 |
| 30 Jun 25 - 04 Jul 25 | Y1 | 0 | 0 | 0 | - | 0 | +9.67 | skipped: US holiday, early close |
| 07 Jul 25 - 11 Jul 25 | Y1 | 0 | 0 | 0 | - | 0 | +9.67 | skipped: day after a skipped day |
| 14 Jul 25 - 18 Jul 25 | Y1 | 1 | 1 | 0 | 100% | +0.74 | +10.40 | Tue short 16:00 close +0.74 (CPI) |
| 21 Jul 25 - 25 Jul 25 | Y1 | 0 | 0 | 0 | - | 0 | +10.40 |  |
| 28 Jul 25 - 01 Aug 25 | Y1 | 3 | 2 | 1 | 67% | +1.41 | +11.81 | Tue short target +1.04; Thu short target +1.39 (EARN); Fri long stop -1.02 (NFP+EARN) |
| 04 Aug 25 - 08 Aug 25 | Y1 | 2 | 1 | 1 | 50% | +0.14 | +11.96 | Mon short stop -1.01; Thu short target +1.16 |
| 11 Aug 25 - 15 Aug 25 | Y1 | 0 | 0 | 0 | - | 0 | +11.96 |  |
| 18 Aug 25 - 22 Aug 25 | Y1 | 0 | 0 | 0 | - | 0 | +11.96 |  |
| 25 Aug 25 - 29 Aug 25 | Y1 | 0 | 0 | 0 | - | 0 | +11.96 |  |
| 01 Sep 25 - 05 Sep 25 | Y1 | 2 | 1 | 1 | 50% | +0.67 | +12.63 | Wed short 16:00 close -0.31; Fri short target +0.98 (NFP); skipped: US holiday, day after a skipped day |
| 08 Sep 25 - 12 Sep 25 | Y1 | 1 | 1 | 0 | 100% | +0.54 | +13.17 | Wed short target +0.54 (PPI) |
| 15 Sep 25 - 19 Sep 25 | Y1 | 1 | 1 | 0 | 100% | +0.00 | +13.17 | Thu short 16:00 close +0.00 |
| 22 Sep 25 - 26 Sep 25 | Y1 | 1 | 1 | 0 | 100% | +0.73 | +13.90 | Thu long 16:00 close +0.73 |
| 29 Sep 25 - 03 Oct 25 | Y1/Y2 | 3 | 3 | 0 | 100% | +1.40 | +15.30 | Mon short 16:00 close +0.23; Wed long target +0.50; Thu short target +0.66 |
| 06 Oct 25 - 10 Oct 25 | Y2 | 1 | 0 | 1 | 0% | -0.11 | +15.19 | Mon short 16:00 close -0.11 |
| 13 Oct 25 - 17 Oct 25 | Y2 | 3 | 2 | 1 | 67% | +1.86 | +17.04 | Mon short 16:00 close -0.76; Tue long target +1.70; Wed short target +0.91 |
| 20 Oct 25 - 24 Oct 25 | Y2 | 1 | 0 | 1 | 0% | -0.07 | +16.98 | Fri short 16:00 close -0.07 (CPI) |
| 27 Oct 25 - 31 Oct 25 | Y2 | 2 | 1 | 1 | 50% | +0.18 | +17.15 | Mon short 16:00 close -0.50; Fri short 16:00 close +0.67 (EARN) |
| 03 Nov 25 - 07 Nov 25 | Y2 | 2 | 1 | 1 | 50% | +0.05 | +17.20 | Mon short 16:00 close +0.48; Tue long 16:00 close -0.43 |
| 10 Nov 25 - 14 Nov 25 | Y2 | 2 | 1 | 1 | 50% | +1.28 | +18.48 | Mon short 16:00 close -0.64; Fri long target +1.92 |
| 17 Nov 25 - 21 Nov 25 | Y2 | 1 | 1 | 0 | 100% | +1.53 | +20.01 | Thu short target +1.53 (NFP+EARN) |
| 24 Nov 25 - 28 Nov 25 | Y2 | 0 | 0 | 0 | - | 0 | +20.01 | skipped: US holiday, early close |
| 01 Dec 25 - 05 Dec 25 | Y2 | 0 | 0 | 0 | - | 0 | +20.01 | skipped: day after a skipped day |
| 08 Dec 25 - 12 Dec 25 | Y2 | 1 | 0 | 1 | 0% | -1.01 | +19.01 | Fri long stop -1.01 |
| 15 Dec 25 - 19 Dec 25 | Y2 | 2 | 2 | 0 | 100% | +0.58 | +19.58 | Mon short target +0.47; Thu short 16:00 close +0.10 (CPI) |
| 22 Dec 25 - 26 Dec 25 | Y2 | 1 | 1 | 0 | 100% | +0.06 | +19.64 | Mon short 16:00 close +0.06; skipped: day after a skipped day, early close |
| 29 Dec 25 - 02 Jan 26 | Y2 | 2 | 2 | 0 | 100% | +1.23 | +20.87 | Mon long 16:00 close +0.09; Fri short target +1.14 |
| 05 Jan 26 - 09 Jan 26 | Y2 | 1 | 1 | 0 | 100% | +0.02 | +20.89 | Mon short 16:00 close +0.02 |
| 12 Jan 26 - 16 Jan 26 | Y2 | 4 | 3 | 1 | 75% | +1.14 | +22.02 | Mon long target +0.40; Wed long stop -1.01 (PPI); Thu short 16:00 close +0.92; Fri short target +0.82 |
| 19 Jan 26 - 23 Jan 26 | Y2 | 1 | 1 | 0 | 100% | +0.01 | +22.03 | Thu short 16:00 close +0.01; skipped: US holiday, day after a skipped day |
| 26 Jan 26 - 30 Jan 26 | Y2 | 1 | 1 | 0 | 100% | +0.44 | +22.48 | Wed short 16:00 close +0.44 (FOMC) |
| 02 Feb 26 - 06 Feb 26 | Y2 | 1 | 0 | 1 | 0% | -0.63 | +21.85 | Thu long 16:00 close -0.63 (EARN) |
| 09 Feb 26 - 13 Feb 26 | Y2 | 1 | 1 | 0 | 100% | +0.57 | +22.42 | Wed short target +0.57 (NFP) |
| 16 Feb 26 - 20 Feb 26 | Y2 | 0 | 0 | 0 | - | 0 | +22.42 | skipped: US holiday, day after a skipped day |
| 23 Feb 26 - 27 Feb 26 | Y2 | 1 | 1 | 0 | 100% | +0.39 | +22.81 | Fri long 16:00 close +0.39 (PPI) |
| 02 Mar 26 - 06 Mar 26 | Y2 | 3 | 2 | 1 | 67% | +1.19 | +24.01 | Mon long target +0.56; Tue long 16:00 close +0.77; Fri long 16:00 close -0.14 (NFP) |
| 09 Mar 26 - 13 Mar 26 | Y2 | 1 | 1 | 0 | 100% | +0.67 | +24.68 | Mon long target +0.67; skipped: day after a skipped day, missing price data |
| 16 Mar 26 - 20 Mar 26 | Y2 | 2 | 2 | 0 | 100% | +1.13 | +25.81 | Mon short 16:00 close +0.08; Thu long target +1.05 |
| 23 Mar 26 - 27 Mar 26 | Y2 | 3 | 2 | 1 | 67% | -0.42 | +25.39 | Mon short 16:00 close +0.24; Wed short 16:00 close +0.34; Thu long stop -1.01 |
| 30 Mar 26 - 03 Apr 26 | Y2 | 3 | 2 | 1 | 67% | +1.07 | +26.46 | Mon short target +0.65; Tue short stop -1.06; Thu long target +1.48 |
| 06 Apr 26 - 10 Apr 26 | Y2 | 1 | 1 | 0 | 100% | +0.27 | +26.73 | Wed short 16:00 close +0.27 |
| 13 Apr 26 - 17 Apr 26 | Y2 | 1 | 0 | 1 | 0% | -0.49 | +26.24 | Fri short 16:00 close -0.49 |
| 20 Apr 26 - 24 Apr 26 | Y2 | 2 | 0 | 2 | 0% | -1.87 | +24.37 | Wed short stop -1.01; Fri short 16:00 close -0.86 |
| 27 Apr 26 - 01 May 26 | Y2 | 2 | 2 | 0 | 100% | +0.17 | +24.54 | Tue long 16:00 close +0.11; Thu short target +0.06 (EARN) |
| 04 May 26 - 08 May 26 | Y2 | 3 | 0 | 3 | 0% | -2.48 | +22.06 | Tue short 16:00 close -0.46; Wed short stop -1.01; Fri short stop -1.01 (NFP) |
| 11 May 26 - 15 May 26 | Y2 | 2 | 0 | 2 | 0% | -1.10 | +20.96 | Tue long stop -1.01 (CPI); Fri long 16:00 close -0.09 |
| 18 May 26 - 22 May 26 | Y2 | 1 | 0 | 1 | 0% | -1.01 | +19.95 | Tue long stop -1.01 |
| 25 May 26 - 29 May 26 | Y2 | 0 | 0 | 0 | - | 0 | +19.95 | skipped: US holiday, day after a skipped day |
| 01 Jun 26 - 05 Jun 26 | Y2 | 2 | 1 | 1 | 50% | -0.54 | +19.41 | Thu long 16:00 close +0.46; Fri long stop -1.01 (NFP) |
| 08 Jun 26 - 12 Jun 26 | Y2 | 3 | 2 | 1 | 67% | +0.57 | +19.98 | Mon short stop -1.01; Tue short target +0.65; Wed long target +0.92 (CPI) |
| 15 Jun 26 - 19 Jun 26 | Y2 | 2 | 0 | 2 | 0% | -0.96 | +19.02 | Mon short 16:00 close -0.48; Thu short 16:00 close -0.47; skipped: US holiday |
| 22 Jun 26 - 26 Jun 26 | Y2 | 3 | 2 | 1 | 67% | +1.12 | +20.14 | Tue long 16:00 close -0.24; Thu short target +1.05; Fri long 16:00 close +0.31; skipped: day after a skipped day |
| 29 Jun 26 - 03 Jul 26 | Y2/B | 0 | 0 | 0 | - | 0 | +20.14 | skipped: US holiday |
| 06 Jul 26 - 10 Jul 26 | B | 2 | 0 | 2 | 0% | -0.72 | +19.42 | Tue long 16:00 close -0.32; Thu short 16:00 close -0.40; skipped: day after a skipped day |
| 13 Jul 26 - 17 Jul 26 | B | 3 | 1 | 2 | 33% | -0.06 | +19.36 | Mon long 16:00 close -0.44; Tue short 16:00 close -0.24 (CPI); Fri long 16:00 close +0.61 |
| 20 Jul 26 - 24 Jul 26 | B | 3 | 1 | 2 | 33% | +0.15 | +19.51 | Mon short 16:00 close +0.99; Tue short 16:00 close -0.48; Thu long 16:00 close -0.37 (EARN) |
| 27 Jul 26 - 31 Jul 26 | B | 4 | 3 | 1 | 75% | +1.19 | +20.70 | Mon short target +0.79; Tue long 16:00 close +0.11; Thu short stop -1.01 (EARN); Fri short target +1.29 (EARN) |
| 03 Aug 26 - 07 Aug 26 | B | 2 | 1 | 1 | 50% | -0.19 | +20.51 | Tue short stop -1.01; Thu long target +0.81 |
| 10 Aug 26 - 14 Aug 26 | B | 1 | 1 | 0 | 100% | +0.06 | +20.57 | Wed short 16:00 close +0.06 (CPI) |
| 17 Aug 26 - 21 Aug 26 | B | 1 | 0 | 1 | 0% | -0.31 | +20.26 | Tue long 16:00 close -0.31 |
| 24 Aug 26 - 28 Aug 26 | B | 2 | 1 | 1 | 50% | -0.57 | +19.69 | Tue short 16:00 close +0.44; Thu short stop -1.01 (EARN) |
| 31 Aug 26 - 04 Sep 26 | B | 1 | 1 | 0 | 100% | +0.13 | +19.82 | Tue long 16:00 close +0.13 |
| 07 Sep 26 - 11 Sep 26 | B | 2 | 2 | 0 | 100% | +0.35 | +20.17 | Thu long 16:00 close +0.18 (PPI); Fri short 16:00 close +0.17 (CPI); skipped: US holiday, day after a skipped day |
| 14 Sep 26 - 18 Sep 26 | B | 3 | 2 | 1 | 67% | +1.65 | +21.82 | Mon long 16:00 close +1.30; Wed short target +0.78 (FOMC); Thu short 16:00 close -0.43 |
| 21 Sep 26 - 25 Sep 26 | B | 2 | 1 | 1 | 50% | -0.04 | +21.78 | Mon short stop -1.01; Thu long target +0.97; skipped: no price data |
| 28 Sep 26 - 02 Oct 26 | B | 0 | 0 | 0 | - | 0 | +21.78 | skipped: day after a skipped day, no price data |

## Summary in plain words

**Totals (2.0 points cost):** 215 trades over 36 months, 57% won, **+21.8 R** in total. Every period ended positive, even with
three times the cost (6.0 points): A +0.8 R, Y1 +10.6 R, Y2 +5.0 R, B +1.3 R. The longest losing run was 6 trades (ending 19 May 2026),
and the biggest drop from a peak was 8.3 R (about 8% of the account), also in spring 2026.

**But the years nobody had seen were much weaker than the years the rules were built on:**

| Period | Trades | Win rate | Total | Average per trade | Without its 3 best trades |
|---|---|---|---|---|---|
| **A, hidden (Oct 23 - Sep 24)** | 61 | 52.5% | **+2.3 R** | +0.04 R | **-1.8 R** |
| Y1, design | 64 | 59.4% | +11.8 R | +0.18 R | +6.0 R |
| Y2, design | 64 | 59.4% | +6.0 R | +0.09 R | +0.9 R |
| **B, hidden (Jul - Sep 26)** | 26 | 53.8% | **+1.6 R** | +0.06 R | **-1.9 R** |

**What is working**
- The strategy never collapsed: no period lost money, at any cost level. Costs hardly matter here (the stops are big, around 150-300 points),
  unlike gold.
- Losing runs stay short (6 at most) and drawdowns are moderate (worst 8.3 R).
- Buying after a big gap down did well in Y1, Y2 and B (+5.7, +3.8, +2.7 R).

**What is not working**
- In hidden year A the result is close to zero: 20 of the 37 traded weeks were down, 6 of 12 months lost, and the whole year's profit
  comes from April 2024 (+3.4 R). Without that month A is -1.1 R. Buying after gap downs made exactly 0.0 R in A.
- July 2024 (-3.3 R) and May 2026 (-4.6 R) were the worst months. In May 2026, and in Q2 2026 overall (-4.8 R from shorts),
  shorting gap-ups failed in a strong rally. In B, shorts lost again (-1.1 R).
- About half of all trades (113 of 215) end at 16:00 with neither stop nor target hit; together they made +0.3 R. All the profit
  comes from the 30% of trades that reach the target.
- Days after big-tech earnings lost in both hidden periods (A -2.9 R over 7 trades, B -1.1 R over 4).

**What is being changed:** nothing yet. The rules stay frozen. My recommendation (see `feedback.md`) is to test the unchanged v1 on
older Nasdaq data nobody has used (Oct 2021 - Sep 2023, which includes the 2022 bear market) before any change is made.

**What to watch next week:** no live or paper trading of v1. If the team leader supplies the older data, the first thing to check is
whether v1 makes money there at all, especially the long trades and the days after earnings.

*Past results do not guarantee future results.*
