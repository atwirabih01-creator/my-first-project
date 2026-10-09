# XAUUSD (gold) weekly report: strategy v1 ("Go with London's break of the Asia range", 1R)

**Written by:** Agent 2 (Backtest & Performance Manager). **Report date:** Friday 9 Oct 2026 (a full re-run of 36 months of history, not a live week).
**Status of v1:** tested on all 36 months. **Verdict: IMPROVE, not ready for the owner.** The reasons are at the bottom and in `feedback.md`.

**How to read this:**
- **R** = the amount risked on one trade (1% of the account). +1 R = won the amount risked; −1 R = lost it.
- Every result already has the trading cost taken off (0.40 USD per trade, cautious spread plus slippage).
- A "win" is any trade that ended above zero, including small gains from the 16:00 New York forced close.
- **Periods:** **A** = Oct 2023 – Sep 2024, a hidden test year nobody had looked at when the rules were written. **Y1** and **Y2** =
  Oct 2024 – Jun 2026, the design months Agent 1 built the rules on. **B** = Jul – Sep 2026, the most recent hidden months.
  A week that spans two periods shows both (e.g. "A/Y1").
- **When the trades happen:** signals come between 07:00 London and 12:00 New York, which is **09:00–19:00 Doha in summer**
  (UK and US summer time) and **10:00–20:00 Doha in winter**. Any open trade is closed at 16:00 New York = **23:00 Doha (US summer) / 00:00 Doha (US winter)**.
- The full trade list, with Doha and New York times for every trade, is in `backtest/trades_v1.csv`.
- The last row (28 Sep – 2 Oct 2026) only has data up to Wed 30 Sep.

## Key numbers per period (0.40 USD cost; double cost 0.80 USD in the last column)

| Period | Trades | Win rate | Total | Profit factor | Worst drop | Longest losing run | Losing weeks | At 0.80 USD cost |
|---|---|---|---|---|---|---|---|---|
| **A: hidden, Oct 2023 – Sep 2024** | 233 | 54.5% | **−0.2 R** | 1.00 | −9.2 R (−9.0%) | 5 | 25 of 53 | **−17.3 R** |
| Y1: design, Oct 2024 – Sep 2025 | 220 | 54.1% | +12.3 R | 1.13 | −8.6 R (−8.4%) | 7 | 24 of 53 | +3.9 R |
| Y2: design, Oct 2025 – Jun 2026 | 157 | 56.7% | +15.8 R | 1.27 | −10.3 R (−9.9%) | 5 | 18 of 40 | +13.6 R |
| B: hidden, Jul – Sep 2026 | 59 | 55.9% | +6.5 R | 1.29 | −3.2 R (−3.1%) | 3 | 5 of 14 | +5.6 R |
| **All 36 months** | 669 | 55.0% | **+34.4 R** | 1.12 | −15.3 R (−14.6%) | 7 | 72 of 157 | **+5.8 R** |

(Profit factor = money won ÷ money lost; above 1 makes money. Worst drop = the biggest fall from a high point, in R and in % of the account at 1% risk per trade.)

## Week by week, Oct 2023 – Sep 2026 (one row per Monday–Friday week)

| Week (Mon–Fri) | Period | Trades | Wins | Losses | Win rate | Result (R) | Running total (R) | Notes |
|---|---|---|---|---|---|---|---|---|
| 02 Oct 2023 – 06 Oct 2023 | A | 5 | 2 | 3 | 40% | **-1.49** | -1.49 | news: NFP -1.1 |
| 09 Oct 2023 – 13 Oct 2023 | A | 5 | 3 | 2 | 60% | +0.48 | -1.01 | news: PPI +0.9, CPI -1.1 |
| 16 Oct 2023 – 20 Oct 2023 | A | 5 | 2 | 3 | 40% | **-1.32** | -2.33 |  |
| 23 Oct 2023 – 27 Oct 2023 | A | 5 | 1 | 4 | 20% | **-3.37** | -5.70 |  |
| 30 Oct 2023 – 03 Nov 2023 | A | 5 | 3 | 2 | 60% | +0.44 | -5.25 | news: FOMC +0.9, NFP -1.1 |
| 06 Nov 2023 – 10 Nov 2023 | A | 5 | 4 | 1 | 80% | +2.08 | -3.17 | 1 closed at 16:00 NY |
| 13 Nov 2023 – 17 Nov 2023 | A | 5 | 3 | 2 | 60% | +0.62 | -2.54 | news: CPI +1.0, PPI -1.1 |
| 20 Nov 2023 – 24 Nov 2023 | A | 3 | 2 | 1 | 67% | +0.79 | -1.75 |  |
| 27 Nov 2023 – 01 Dec 2023 | A | 4 | 3 | 1 | 75% | +1.55 | -0.20 |  |
| 04 Dec 2023 – 08 Dec 2023 | A | 5 | 4 | 1 | 80% | +2.58 | +2.38 | news: NFP -1.1 |
| 11 Dec 2023 – 15 Dec 2023 | A | 5 | 3 | 2 | 60% | +0.61 | +2.99 | news: CPI -1.1, PPI+FOMC +0.9 |
| 18 Dec 2023 – 22 Dec 2023 | A | 5 | 3 | 2 | 60% | **-0.33** | +2.65 | 1 closed at 16:00 NY |
| 25 Dec 2023 – 29 Dec 2023 | A | 3 | 1 | 2 | 33% | **-1.34** | +1.32 |  |
| 01 Jan 2024 – 05 Jan 2024 | A | 4 | 2 | 2 | 50% | **-0.29** | +1.03 | news: NFP +0.9 |
| 08 Jan 2024 – 12 Jan 2024 | A | 4 | 1 | 3 | 25% | **-2.30** | -1.27 | news: CPI -1.1 |
| 15 Jan 2024 – 19 Jan 2024 | A | 3 | 2 | 1 | 67% | +0.22 | -1.05 | 1 closed at 16:00 NY |
| 22 Jan 2024 – 26 Jan 2024 | A | 4 | 2 | 2 | 50% | **-0.52** | -1.57 |  |
| 29 Jan 2024 – 02 Feb 2024 | A | 5 | 3 | 2 | 60% | **-0.14** | -1.72 | news: FOMC +0.9, NFP +0.2; 1 closed at 16:00 NY |
| 05 Feb 2024 – 09 Feb 2024 | A | 5 | 2 | 3 | 40% | **-1.59** | -3.31 |  |
| 12 Feb 2024 – 16 Feb 2024 | A | 5 | 2 | 3 | 40% | **-1.74** | -5.05 | news: CPI +0.9, PPI -1.2 |
| 19 Feb 2024 – 23 Feb 2024 | A | 2 | 1 | 1 | 50% | **-0.21** | -5.26 |  |
| 26 Feb 2024 – 01 Mar 2024 | A | 5 | 3 | 2 | 60% | +0.21 | -5.05 |  |
| 04 Mar 2024 – 08 Mar 2024 | A | 4 | 3 | 1 | 75% | +1.60 | -3.45 | news: NFP +0.9 |
| 11 Mar 2024 – 15 Mar 2024 | A | 5 | 3 | 2 | 60% | +0.63 | -2.83 | news: CPI +0.9, PPI +0.9 |
| 18 Mar 2024 – 22 Mar 2024 | A | 5 | 3 | 2 | 60% | **-0.04** | -2.86 | news: FOMC +0.9; 1 closed at 16:00 NY |
| 25 Mar 2024 – 29 Mar 2024 | A | 4 | 3 | 1 | 75% | +1.19 | -1.68 | 1 closed at 16:00 NY |
| 01 Apr 2024 – 05 Apr 2024 | A | 5 | 3 | 2 | 60% | +1.34 | -0.33 | news: NFP +1.0; 1 closed at 16:00 NY |
| 08 Apr 2024 – 12 Apr 2024 | A | 4 | 2 | 2 | 50% | **-0.14** | -0.48 | news: CPI +1.0, PPI -1.1 |
| 15 Apr 2024 – 19 Apr 2024 | A | 4 | 1 | 3 | 25% | **-2.16** | -2.64 |  |
| 22 Apr 2024 – 26 Apr 2024 | A | 5 | 3 | 2 | 60% | +0.81 | -1.83 |  |
| 29 Apr 2024 – 03 May 2024 | A | 5 | 3 | 2 | 60% | +0.74 | -1.09 | news: FOMC +0.9, NFP -1.1 |
| 06 May 2024 – 10 May 2024 | A | 5 | 3 | 2 | 60% | +0.73 | -0.36 |  |
| 13 May 2024 – 17 May 2024 | A | 5 | 4 | 1 | 80% | +2.65 | +2.29 | news: PPI -1.1, CPI +0.9 |
| 20 May 2024 – 24 May 2024 | A | 4 | 1 | 3 | 25% | **-2.14** | +0.15 |  |
| 27 May 2024 – 31 May 2024 | A | 3 | 2 | 1 | 67% | +0.83 | +0.97 |  |
| 03 Jun 2024 – 07 Jun 2024 | A | 5 | 4 | 1 | 80% | +3.41 | +4.38 | news: NFP +1.0; 1 closed at 16:00 NY |
| 10 Jun 2024 – 14 Jun 2024 | A | 5 | 2 | 3 | 40% | **-1.68** | +2.70 | news: CPI+FOMC -0.6, PPI -1.0; 2 closed at 16:00 NY |
| 17 Jun 2024 – 21 Jun 2024 | A | 3 | 1 | 2 | 33% | **-1.25** | +1.45 |  |
| 24 Jun 2024 – 28 Jun 2024 | A | 5 | 4 | 1 | 80% | +2.56 | +4.02 |  |
| 01 Jul 2024 – 05 Jul 2024 | A | 3 | 2 | 1 | 67% | +0.78 | +4.80 |  |
| 08 Jul 2024 – 12 Jul 2024 | A | 5 | 4 | 1 | 80% | +2.63 | +7.43 | news: CPI +0.9, PPI +0.9 |
| 15 Jul 2024 – 19 Jul 2024 | A | 5 | 2 | 3 | 40% | **-1.26** | +6.17 |  |
| 22 Jul 2024 – 26 Jul 2024 | A | 5 | 2 | 3 | 40% | **-2.85** | +3.32 | 2 closed at 16:00 NY |
| 29 Jul 2024 – 02 Aug 2024 | A | 5 | 2 | 3 | 40% | **-1.20** | +2.12 | news: FOMC +1.0, NFP -1.0 |
| 05 Aug 2024 – 09 Aug 2024 | A | 5 | 3 | 2 | 60% | +0.81 | +2.93 |  |
| 12 Aug 2024 – 16 Aug 2024 | A | 4 | 3 | 1 | 75% | +1.78 | +4.71 | news: CPI -1.0 |
| 19 Aug 2024 – 23 Aug 2024 | A | 5 | 3 | 2 | 60% | +0.71 | +5.42 |  |
| 26 Aug 2024 – 30 Aug 2024 | A | 5 | 1 | 4 | 20% | **-2.51** | +2.92 | 1 closed at 16:00 NY |
| 02 Sep 2024 – 06 Sep 2024 | A | 3 | 2 | 1 | 67% | +0.79 | +3.70 | news: NFP -1.1 |
| 09 Sep 2024 – 13 Sep 2024 | A | 5 | 1 | 4 | 20% | **-3.35** | +0.35 | news: CPI -1.1, PPI -1.1 |
| 16 Sep 2024 – 20 Sep 2024 | A | 4 | 2 | 2 | 50% | **-0.22** | +0.13 | news: FOMC -1.1 |
| 23 Sep 2024 – 27 Sep 2024 | A | 5 | 2 | 3 | 40% | **-1.30** | -1.17 |  |
| 30 Sep 2024 – 04 Oct 2024 | A/Y1 | 5 | 3 | 2 | 60% | +0.79 | -0.38 | news: NFP -1.0 |
| 07 Oct 2024 – 11 Oct 2024 | Y1 | 5 | 1 | 4 | 20% | **-3.26** | -3.64 | news: CPI -1.1, PPI +1.0 |
| 14 Oct 2024 – 18 Oct 2024 | Y1 | 5 | 3 | 2 | 60% | +0.28 | -3.36 | 1 closed at 16:00 NY |
| 21 Oct 2024 – 25 Oct 2024 | Y1 | 5 | 2 | 3 | 40% | **-1.26** | -4.62 |  |
| 28 Oct 2024 – 01 Nov 2024 | Y1 | 4 | 2 | 2 | 50% | **-0.21** | -4.83 | news: NFP -1.0 |
| 04 Nov 2024 – 08 Nov 2024 | Y1 | 5 | 3 | 2 | 60% | +0.81 | -4.02 | news: FOMC +1.0 |
| 11 Nov 2024 – 15 Nov 2024 | Y1 | 5 | 2 | 3 | 40% | **-1.18** | -5.19 | news: CPI -1.0, PPI +1.0 |
| 18 Nov 2024 – 22 Nov 2024 | Y1 | 5 | 4 | 1 | 80% | +2.08 | -3.11 | 1 closed at 16:00 NY |
| 25 Nov 2024 – 29 Nov 2024 | Y1 | 3 | 1 | 2 | 33% | **-1.64** | -4.75 | 1 closed at 16:00 NY |
| 02 Dec 2024 – 06 Dec 2024 | Y1 | 3 | 0 | 3 | 0% | **-3.15** | -7.89 |  |
| 09 Dec 2024 – 13 Dec 2024 | Y1 | 5 | 5 | 0 | 100% | +4.48 | -3.41 | news: CPI +0.6, PPI +1.0; 1 closed at 16:00 NY |
| 16 Dec 2024 – 20 Dec 2024 | Y1 | 5 | 3 | 2 | 60% | +0.77 | -2.65 | news: FOMC +0.9 |
| 23 Dec 2024 – 27 Dec 2024 | Y1 | 2 | 2 | 0 | 100% | +1.49 | -1.16 | 1 closed at 16:00 NY |
| 30 Dec 2024 – 03 Jan 2025 | Y1 | 4 | 3 | 1 | 75% | +1.77 | +0.61 |  |
| 06 Jan 2025 – 10 Jan 2025 | Y1 | 5 | 2 | 3 | 40% | **-1.30** | -0.69 | news: NFP -1.1 |
| 13 Jan 2025 – 17 Jan 2025 | Y1 | 5 | 3 | 2 | 60% | +0.72 | +0.03 | news: PPI -1.1, CPI +0.9 |
| 20 Jan 2025 – 24 Jan 2025 | Y1 | 3 | 0 | 3 | 0% | **-2.72** | -2.69 | 1 closed at 16:00 NY |
| 27 Jan 2025 – 31 Jan 2025 | Y1 | 5 | 1 | 4 | 20% | **-3.41** | -6.10 | news: FOMC -1.1 |
| 03 Feb 2025 – 07 Feb 2025 | Y1 | 5 | 4 | 1 | 80% | +2.81 | -3.30 | news: NFP +1.0 |
| 10 Feb 2025 – 14 Feb 2025 | Y1 | 4 | 3 | 1 | 75% | +1.86 | -1.44 | news: CPI +1.0 |
| 17 Feb 2025 – 21 Feb 2025 | Y1 | 3 | 0 | 3 | 0% | **-3.11** | -4.55 |  |
| 24 Feb 2025 – 28 Feb 2025 | Y1 | 5 | 3 | 2 | 60% | +0.47 | -4.08 | 1 closed at 16:00 NY |
| 03 Mar 2025 – 07 Mar 2025 | Y1 | 5 | 4 | 1 | 80% | +2.81 | -1.27 | news: NFP +1.0 |
| 10 Mar 2025 – 14 Mar 2025 | Y1 | 5 | 3 | 2 | 60% | +0.72 | -0.56 | news: CPI -1.1, PPI -1.1 |
| 17 Mar 2025 – 21 Mar 2025 | Y1 | 5 | 2 | 3 | 40% | **-0.46** | -1.01 | news: FOMC -1.0; 1 closed at 16:00 NY |
| 24 Mar 2025 – 28 Mar 2025 | Y1 | 4 | 1 | 3 | 25% | **-2.20** | -3.21 |  |
| 31 Mar 2025 – 04 Apr 2025 | Y1 | 4 | 1 | 3 | 25% | **-0.33** | -3.54 | news: NFP -1.0; 2 closed at 16:00 NY |
| 07 Apr 2025 – 11 Apr 2025 | Y1 | 4 | 3 | 1 | 75% | +1.93 | -1.61 | news: CPI +1.0, PPI +1.0 |
| 14 Apr 2025 – 18 Apr 2025 | Y1 | 3 | 1 | 2 | 33% | **-0.21** | -1.82 | 1 closed at 16:00 NY |
| 21 Apr 2025 – 25 Apr 2025 | Y1 | 4 | 2 | 2 | 50% | +0.48 | -1.34 | 1 closed at 16:00 NY |
| 28 Apr 2025 – 02 May 2025 | Y1 | 4 | 1 | 3 | 25% | **-1.74** | -3.08 | news: NFP -1.0; 2 closed at 16:00 NY |
| 05 May 2025 – 09 May 2025 | Y1 | 4 | 3 | 1 | 75% | +2.80 | -0.27 | 2 closed at 16:00 NY |
| 12 May 2025 – 16 May 2025 | Y1 | 5 | 4 | 1 | 80% | +2.92 | +2.65 | news: CPI -1.0, PPI +1.0 |
| 19 May 2025 – 23 May 2025 | Y1 | 4 | 3 | 1 | 75% | +1.91 | +4.56 |  |
| 26 May 2025 – 30 May 2025 | Y1 | 3 | 2 | 1 | 67% | +0.93 | +5.49 |  |
| 02 Jun 2025 – 06 Jun 2025 | Y1 | 5 | 4 | 1 | 80% | +3.47 | +8.96 | news: NFP +1.0; 1 closed at 16:00 NY |
| 09 Jun 2025 – 13 Jun 2025 | Y1 | 4 | 2 | 2 | 50% | **-0.10** | +8.87 | news: CPI -1.0, PPI -1.0 |
| 16 Jun 2025 – 20 Jun 2025 | Y1 | 1 | 1 | 0 | 100% | +0.98 | +9.84 |  |
| 23 Jun 2025 – 27 Jun 2025 | Y1 | 5 | 2 | 3 | 40% | **-1.16** | +8.69 |  |
| 30 Jun 2025 – 04 Jul 2025 | Y1 | 4 | 1 | 3 | 25% | **-1.51** | +7.17 | news: NFP -0.4; 1 closed at 16:00 NY |
| 07 Jul 2025 – 11 Jul 2025 | Y1 | 4 | 2 | 2 | 50% | **-0.83** | +6.34 | 1 closed at 16:00 NY |
| 14 Jul 2025 – 18 Jul 2025 | Y1 | 5 | 3 | 2 | 60% | +0.78 | +7.12 | news: CPI +1.0, PPI -1.0 |
| 21 Jul 2025 – 25 Jul 2025 | Y1 | 5 | 4 | 1 | 80% | +2.82 | +9.94 |  |
| 28 Jul 2025 – 01 Aug 2025 | Y1 | 5 | 3 | 2 | 60% | +0.91 | +10.85 | news: FOMC +1.0, NFP +1.0; 1 closed at 16:00 NY |
| 04 Aug 2025 – 08 Aug 2025 | Y1 | 4 | 2 | 2 | 50% | **-0.18** | +10.67 |  |
| 11 Aug 2025 – 15 Aug 2025 | Y1 | 4 | 3 | 1 | 75% | +1.82 | +12.50 | news: CPI -1.1, PPI +1.0 |
| 18 Aug 2025 – 22 Aug 2025 | Y1 | 4 | 2 | 2 | 50% | **-0.19** | +12.30 |  |
| 25 Aug 2025 – 29 Aug 2025 | Y1 | 3 | 1 | 2 | 33% | **-1.16** | +11.14 |  |
| 01 Sep 2025 – 05 Sep 2025 | Y1 | 2 | 2 | 0 | 100% | +1.29 | +12.43 | news: NFP +0.3; 1 closed at 16:00 NY |
| 08 Sep 2025 – 12 Sep 2025 | Y1 | 4 | 1 | 3 | 25% | **-1.44** | +11.00 | news: PPI -0.3, CPI -1.0; 1 closed at 16:00 NY |
| 15 Sep 2025 – 19 Sep 2025 | Y1 | 5 | 3 | 2 | 60% | +0.85 | +11.85 | news: FOMC -1.0 |
| 22 Sep 2025 – 26 Sep 2025 | Y1 | 5 | 2 | 3 | 40% | **-1.19** | +10.66 |  |
| 29 Sep 2025 – 03 Oct 2025 | Y1/Y2 | 5 | 4 | 1 | 80% | +2.30 | +12.96 | 1 closed at 16:00 NY |
| 06 Oct 2025 – 10 Oct 2025 | Y2 | 5 | 4 | 1 | 80% | +0.99 | +13.95 | 3 closed at 16:00 NY |
| 13 Oct 2025 – 17 Oct 2025 | Y2 | 5 | 4 | 1 | 80% | +2.93 | +16.88 |  |
| 20 Oct 2025 – 24 Oct 2025 | Y2 | 5 | 2 | 3 | 40% | **-0.32** | +16.56 | news: CPI -1.0; 1 closed at 16:00 NY |
| 27 Oct 2025 – 31 Oct 2025 | Y2 | 4 | 3 | 1 | 75% | +1.67 | +18.23 | news: FOMC +1.0; 2 closed at 16:00 NY |
| 03 Nov 2025 – 07 Nov 2025 | Y2 | 5 | 2 | 3 | 40% | **-1.32** | +16.91 | 2 closed at 16:00 NY |
| 10 Nov 2025 – 14 Nov 2025 | Y2 | 5 | 4 | 1 | 80% | +3.03 | +19.94 | 1 closed at 16:00 NY |
| 17 Nov 2025 – 21 Nov 2025 | Y2 | 3 | 0 | 3 | 0% | **-3.04** | +16.90 |  |
| 24 Nov 2025 – 28 Nov 2025 | Y2 | 3 | 1 | 2 | 33% | **-1.06** | +15.85 | news: PPI -1.0 |
| 01 Dec 2025 – 05 Dec 2025 | Y2 | 2 | 0 | 2 | 0% | **-2.05** | +13.80 |  |
| 08 Dec 2025 – 12 Dec 2025 | Y2 | 4 | 4 | 0 | 100% | +3.35 | +17.15 | news: FOMC +1.0; 1 closed at 16:00 NY |
| 15 Dec 2025 – 19 Dec 2025 | Y2 | 5 | 1 | 4 | 20% | **-2.23** | +14.92 | news: NFP -1.0, CPI +1.0; 1 closed at 16:00 NY |
| 22 Dec 2025 – 26 Dec 2025 | Y2 | 2 | 1 | 1 | 50% | **-0.67** | +14.25 | 1 closed at 16:00 NY |
| 29 Dec 2025 – 02 Jan 2026 | Y2 | 3 | 1 | 2 | 33% | **-1.05** | +13.20 |  |
| 05 Jan 2026 – 09 Jan 2026 | Y2 | 5 | 2 | 3 | 40% | **-1.09** | +12.11 | news: NFP +1.0; 2 closed at 16:00 NY |
| 12 Jan 2026 – 16 Jan 2026 | Y2 | 4 | 1 | 3 | 25% | **-1.42** | +10.69 | news: CPI +1.0; 1 closed at 16:00 NY |
| 19 Jan 2026 – 23 Jan 2026 | Y2 | 2 | 1 | 1 | 50% | **-0.02** | +10.66 |  |
| 26 Jan 2026 – 30 Jan 2026 | Y2 | 4 | 3 | 1 | 75% | +1.98 | +12.64 | news: FOMC +1.0, PPI +1.0 |
| 02 Feb 2026 – 06 Feb 2026 | Y2 | 3 | 3 | 0 | 100% | +2.32 | +14.96 | 1 closed at 16:00 NY |
| 09 Feb 2026 – 13 Feb 2026 | Y2 | 5 | 3 | 2 | 60% | +0.41 | +15.38 | news: NFP +1.0, CPI +1.0; 1 closed at 16:00 NY |
| 16 Feb 2026 – 20 Feb 2026 | Y2 | 2 | 1 | 1 | 50% | **-0.02** | +15.35 |  |
| 23 Feb 2026 – 27 Feb 2026 | Y2 | 5 | 1 | 4 | 20% | **-2.69** | +12.66 | news: PPI +1.0; 1 closed at 16:00 NY |
| 02 Mar 2026 – 06 Mar 2026 | Y2 | 5 | 3 | 2 | 60% | +0.06 | +12.72 | news: NFP +0.1; 1 closed at 16:00 NY |
| 09 Mar 2026 – 13 Mar 2026 | Y2 | 4 | 3 | 1 | 75% | +1.94 | +14.66 | news: CPI +1.0 |
| 16 Mar 2026 – 20 Mar 2026 | Y2 | 5 | 3 | 2 | 60% | +1.49 | +16.15 | news: FOMC +1.0; 1 closed at 16:00 NY |
| 23 Mar 2026 – 27 Mar 2026 | Y2 | 2 | 1 | 1 | 50% | **-0.95** | +15.20 | 1 closed at 16:00 NY |
| 30 Mar 2026 – 03 Apr 2026 | Y2 | 4 | 2 | 2 | 50% | +0.50 | +15.70 | 2 closed at 16:00 NY |
| 06 Apr 2026 – 10 Apr 2026 | Y2 | 5 | 2 | 3 | 40% | **-0.72** | +14.98 | news: CPI -1.0; 1 closed at 16:00 NY |
| 13 Apr 2026 – 17 Apr 2026 | Y2 | 5 | 3 | 2 | 60% | **-0.35** | +14.63 | news: PPI -1.0; 2 closed at 16:00 NY |
| 20 Apr 2026 – 24 Apr 2026 | Y2 | 4 | 2 | 2 | 50% | **-0.04** | +14.59 | 2 closed at 16:00 NY |
| 27 Apr 2026 – 01 May 2026 | Y2 | 5 | 4 | 1 | 80% | +3.57 | +18.16 | news: FOMC +1.0; 1 closed at 16:00 NY |
| 04 May 2026 – 08 May 2026 | Y2 | 5 | 3 | 2 | 60% | +0.93 | +19.09 | news: NFP -1.0 |
| 11 May 2026 – 15 May 2026 | Y2 | 4 | 3 | 1 | 75% | +0.47 | +19.56 | news: CPI +1.0, PPI -1.0; 2 closed at 16:00 NY |
| 18 May 2026 – 22 May 2026 | Y2 | 5 | 2 | 3 | 40% | **-0.50** | +19.06 | 2 closed at 16:00 NY |
| 25 May 2026 – 29 May 2026 | Y2 | 3 | 3 | 0 | 100% | +2.95 | +22.02 |  |
| 01 Jun 2026 – 05 Jun 2026 | Y2 | 5 | 3 | 2 | 60% | +0.93 | +22.95 | news: NFP +1.0 |
| 08 Jun 2026 – 12 Jun 2026 | Y2 | 2 | 2 | 0 | 100% | +1.98 | +24.93 | news: CPI +1.0 |
| 15 Jun 2026 – 19 Jun 2026 | Y2 | 4 | 2 | 2 | 50% | +0.32 | +25.24 | news: FOMC -1.0; 1 closed at 16:00 NY |
| 22 Jun 2026 – 26 Jun 2026 | Y2 | 4 | 3 | 1 | 75% | +1.89 | +27.14 | 2 closed at 16:00 NY |
| 29 Jun 2026 – 03 Jul 2026 | B/Y2 | 4 | 2 | 2 | 50% | +0.73 | +27.87 | news: NFP +1.0; 1 closed at 16:00 NY |
| 06 Jul 2026 – 10 Jul 2026 | B | 4 | 3 | 1 | 75% | +1.92 | +29.80 |  |
| 13 Jul 2026 – 17 Jul 2026 | B | 5 | 2 | 3 | 40% | **-0.94** | +28.86 | news: CPI -0.4, PPI -1.0; 2 closed at 16:00 NY |
| 20 Jul 2026 – 24 Jul 2026 | B | 5 | 3 | 2 | 60% | +0.95 | +29.81 | 2 closed at 16:00 NY |
| 27 Jul 2026 – 31 Jul 2026 | B | 5 | 2 | 3 | 40% | +0.59 | +30.40 | news: FOMC -1.0; 2 closed at 16:00 NY |
| 03 Aug 2026 – 07 Aug 2026 | B | 5 | 4 | 1 | 80% | +3.64 | +34.03 | news: NFP +1.0; 1 closed at 16:00 NY |
| 10 Aug 2026 – 14 Aug 2026 | B | 5 | 2 | 3 | 40% | **-2.20** | +31.84 | news: CPI -1.0, PPI +0.6; 2 closed at 16:00 NY |
| 17 Aug 2026 – 21 Aug 2026 | B | 5 | 4 | 1 | 80% | +1.99 | +33.83 | 1 closed at 16:00 NY |
| 24 Aug 2026 – 28 Aug 2026 | B | 5 | 2 | 3 | 40% | **-1.07** | +32.75 |  |
| 31 Aug 2026 – 04 Sep 2026 | B | 4 | 3 | 1 | 75% | +1.92 | +34.68 | news: NFP -1.0 |
| 07 Sep 2026 – 11 Sep 2026 | B | 3 | 2 | 1 | 67% | +0.96 | +35.64 | news: PPI +1.0, CPI -1.0 |
| 14 Sep 2026 – 18 Sep 2026 | B | 5 | 3 | 2 | 60% | +0.93 | +36.56 | news: FOMC -1.0 |
| 21 Sep 2026 – 25 Sep 2026 | B | 4 | 1 | 3 | 25% | **-2.07** | +34.49 |  |
| 28 Sep 2026 – 02 Oct 2026 | B | 2 | 1 | 1 | 50% | **-0.05** | +34.44 |  |

## Summary in plain words

**What is working:**
- Gold really does tend to keep going after London breaks out of the overnight Asia range. **Before costs**, the rules made money
  in all four periods, including the year nobody had seen: A +16.9 R, Y1 +20.6 R, Y2 +18.1 R, B +7.5 R.
- Losing runs stay fairly short: the longest is 7 losses in a row (Jan 2025). The hidden months had runs of only 5 (A) and 3 (B).
- The most recent hidden months (Jul – Sep 2026) were positive in every month: +2.5 R, +2.4 R, +1.7 R.

**What is not working:**
- **The hidden year A only broke even: −0.2 R over 233 trades.** In 2023–24 gold was cheaper (about 1,810–2,690 USD) and calmer,
  so the stop (the middle of the Asia range) was often tiny: a typical stop of 6 USD. The 0.40 USD cost was then 7% of the risk on
  every trade, which was as large as the whole edge. At double cost, year A **loses 17.3 R** and the account falls 18.5%.
- Over the full 36 months at double cost, the total is only +5.8 R, with a 26% fall along the way. That is too thin for real money.
- The edge per trade is small (about +0.05 R after cost). Nearly half of all weeks (72 of 157) lose money, and the worst 13-week stretch lost 11.6 R.
- News days (jobs report, inflation, Fed) do not help: −0.7 R over 115 news-day trades, and they flip between periods.
- Shorts lost 17.8 R in year A, when gold was rising strongly. Longs made +17.6 R.

**What is being changed:** v1 is not handed to the owner. Agent 1 gets the feedback (`feedback.md`). The main fix needed is a rule
that stops trading on days when the stop is so small that costs eat the edge, set from the cost itself and not tuned to these results.

**What to watch next week:** no trading. Any v2 cannot be proven on year A anymore (it has now been opened). It needs a fresh check
on data nobody has used, such as an older year (Oct 2022 – Sep 2023) and/or a forward paper test from Oct 2026.

*Past results do not guarantee future results. This is a test on historical prices, not trading advice.*
