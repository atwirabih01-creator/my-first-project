# XAUUSD (gold) weekly report: strategy v2 ("Go with London's break of the Asia range, wide stop", 1R)

**Written by:** Agent 2 (Backtest & Performance Manager). **Report date:** Friday 9 Oct 2026 (a re-run of 4 years of history, not a live week).
**Status of v2:** tested. **Verdict: DROP.** It lost money in the new hidden year (Oct 2022 – Sep 2023), the one test that decides.
Details are at the bottom and in `feedback.md`. (v1 was tested earlier the same day: IMPROVE; see `feedback.md`.)

**How to read this:**
- **R** = the amount risked on one trade (1% of the account). +1 R = won the amount risked; −1 R = lost it.
- Results already have the trading cost taken off (0.40 USD per trade). A "win" is any trade that ended above zero.
- **Periods:** **C** = Oct 2022 – Sep 2023, the new hidden year, opened only after v2 was frozen. **This is the judge.**
  **A, Y1, Y2, B** = Oct 2023 – Sep 2026, which Agent 1 had already seen when writing v2, so they flatter it.
- **Data gap in C:** the free price file is missing whole hours on almost every day from **20 Feb to 28 Jul 2023**. The rules
  skip such days ("thin days"), so C has trades in only about 7 of its 12 months (Oct 2022 – mid-Feb 2023 and Aug – Sep 2023).
- **When the trades happen:** signals come between 07:00 London and 12:00 New York, which is **09:00–19:00 Doha in summer**
  and **10:00–20:00 Doha in winter**. Any open trade is closed at 16:00 New York = **23:00 Doha (US summer) / 00:00 Doha (US winter)**.
- The full trade list, with Doha and New York times, is in `backtest/trades_v2.csv`.

## Key numbers per period (0.40 USD cost, 8 USD minimum stop)

| Period | Trades | Win rate | Total | Profit factor | Worst drop | Longest losing run | Losing weeks (of weeks with trades) | At 0.80 USD cost |
|---|---|---|---|---|---|---|---|---|
| **C: hidden, Oct 2022 – Sep 2023 (the judge)** | 74 | 43.2% | **−9.1 R** | 0.72 | −13.9 R (−13.2%) | 5 | 17 of 26 | **−11.7 R** |
| A: Oct 2023 – Sep 2024 (seen) | 177 | 55.9% | +16.9 R | 1.28 | −6.7 R (−6.6%) | 5 | 22 of 51 | +11.5 R |
| Y1: Oct 2024 – Sep 2025 (seen) | 217 | 55.8% | +10.8 R | 1.16 | −10.7 R (−10.3%) | 5 | 26 of 53 | +6.4 R |
| Y2: Oct 2025 – Jun 2026 (seen) | 157 | 54.8% | +10.8 R | 1.25 | −11.9 R (−11.4%) | 5 | 16 of 40 | +9.6 R |
| B: Jul – Sep 2026 (seen) | 59 | 54.2% | +8.4 R | 1.57 | −2.5 R (−2.5%) | 2 | 6 of 14 | +7.9 R |
| All 4 years | 684 | 54.1% | +37.8 R | 1.17 | −14.1 R (−13.5%) | 5 | 86 of 181 | +23.6 R |

## Week by week, Oct 2022 – Sep 2026 (one row per Monday–Friday week)

| Week (Mon–Fri) | Period | Trades | Wins | Losses | Win rate | Result (R) | Running total (R) | Notes |
|---|---|---|---|---|---|---|---|---|
| 03 Oct 2022 – 07 Oct 2022 | C | 4 | 3 | 1 | 75% | +0.99 | +0.99 | 1 closed at 16:00 NY |
| 10 Oct 2022 – 14 Oct 2022 | C | 4 | 2 | 2 | 50% | **-0.92** | +0.07 | news: PPI +0.2; 1 closed at 16:00 NY |
| 17 Oct 2022 – 21 Oct 2022 | C | 5 | 2 | 3 | 40% | **-0.17** | -0.10 | 2 closed at 16:00 NY |
| 24 Oct 2022 – 28 Oct 2022 | C | 4 | 2 | 2 | 50% | **-0.98** | -1.08 | 3 closed at 16:00 NY |
| 31 Oct 2022 – 04 Nov 2022 | C | 4 | 2 | 2 | 50% | +0.80 | -0.28 | news: FOMC -1.0, NFP +1.0; 1 closed at 16:00 NY |
| 07 Nov 2022 – 11 Nov 2022 | C | 2 | 1 | 1 | 50% | **-0.93** | -1.21 | 1 closed at 16:00 NY |
| 14 Nov 2022 – 18 Nov 2022 | C | 4 | 1 | 3 | 25% | **-1.72** | -2.93 | news: PPI +0.1; 3 closed at 16:00 NY |
| 21 Nov 2022 – 25 Nov 2022 | C | 2 | 1 | 1 | 50% | **-0.08** | -3.01 |  |
| 28 Nov 2022 – 02 Dec 2022 | C | 4 | 2 | 2 | 50% | +0.70 | -2.30 | news: NFP -0.8; 2 closed at 16:00 NY |
| 05 Dec 2022 – 09 Dec 2022 | C | 3 | 1 | 2 | 33% | **-0.06** | -2.37 | news: PPI -0.4; 2 closed at 16:00 NY |
| 12 Dec 2022 – 16 Dec 2022 | C | 3 | 1 | 2 | 33% | **-1.47** | -3.84 | 1 closed at 16:00 NY |
| 19 Dec 2022 – 23 Dec 2022 | C | 1 | 1 | 0 | 100% | +0.97 | -2.87 |  |
| 26 Dec 2022 – 30 Dec 2022 | C | 0 | 0 | 0 | – | +0.00 | -2.87 | no trade (holiday, thin days or stops under 8 USD) |
| 02 Jan 2023 – 06 Jan 2023 | C | 4 | 3 | 1 | 75% | +1.73 | -1.15 | news: NFP +1.0; 2 closed at 16:00 NY |
| 09 Jan 2023 – 13 Jan 2023 | C | 4 | 2 | 2 | 50% | **-0.93** | -2.08 | news: CPI -1.0; 1 closed at 16:00 NY |
| 16 Jan 2023 – 20 Jan 2023 | C | 3 | 1 | 2 | 33% | **-0.65** | -2.73 | news: PPI -0.6; 1 closed at 16:00 NY |
| 23 Jan 2023 – 27 Jan 2023 | C | 4 | 1 | 3 | 25% | **-1.85** | -4.58 | 1 closed at 16:00 NY |
| 30 Jan 2023 – 03 Feb 2023 | C | 1 | 0 | 1 | 0% | **-1.05** | -5.62 |  |
| 06 Feb 2023 – 10 Feb 2023 | C | 4 | 0 | 4 | 0% | **-3.28** | -8.91 | 1 closed at 16:00 NY |
| 13 Feb 2023 – 17 Feb 2023 | C | 5 | 1 | 4 | 20% | **-3.05** | -11.96 | news: CPI -1.0, PPI -1.0; 2 closed at 16:00 NY |
| 20 Feb 2023 – 24 Feb 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 27 Feb 2023 – 03 Mar 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 06 Mar 2023 – 10 Mar 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 13 Mar 2023 – 17 Mar 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 20 Mar 2023 – 24 Mar 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 27 Mar 2023 – 31 Mar 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 03 Apr 2023 – 07 Apr 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 10 Apr 2023 – 14 Apr 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 17 Apr 2023 – 21 Apr 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 24 Apr 2023 – 28 Apr 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 01 May 2023 – 05 May 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 08 May 2023 – 12 May 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 15 May 2023 – 19 May 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 22 May 2023 – 26 May 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 29 May 2023 – 02 Jun 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 05 Jun 2023 – 09 Jun 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 12 Jun 2023 – 16 Jun 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 19 Jun 2023 – 23 Jun 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 26 Jun 2023 – 30 Jun 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 03 Jul 2023 – 07 Jul 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 10 Jul 2023 – 14 Jul 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 17 Jul 2023 – 21 Jul 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 24 Jul 2023 – 28 Jul 2023 | C | 0 | 0 | 0 | – | +0.00 | -11.96 | data gap in the price file (hours missing), no trade possible |
| 31 Jul 2023 – 04 Aug 2023 | C | 2 | 2 | 0 | 100% | +1.91 | -10.05 |  |
| 07 Aug 2023 – 11 Aug 2023 | C | 2 | 1 | 1 | 50% | +0.84 | -9.21 | 1 closed at 16:00 NY |
| 14 Aug 2023 – 18 Aug 2023 | C | 0 | 0 | 0 | – | +0.00 | -9.21 | no trade (holiday, thin days or stops under 8 USD) |
| 21 Aug 2023 – 25 Aug 2023 | C | 1 | 0 | 1 | 0% | **-0.23** | -9.44 | 1 closed at 16:00 NY |
| 28 Aug 2023 – 01 Sep 2023 | C | 0 | 0 | 0 | – | +0.00 | -9.44 | no trade (holiday, thin days or stops under 8 USD) |
| 04 Sep 2023 – 08 Sep 2023 | C | 1 | 0 | 1 | 0% | **-1.04** | -10.48 |  |
| 11 Sep 2023 – 15 Sep 2023 | C | 1 | 0 | 1 | 0% | **-0.51** | -10.99 | 1 closed at 16:00 NY |
| 18 Sep 2023 – 22 Sep 2023 | C | 1 | 1 | 0 | 100% | +0.95 | -10.04 |  |
| 25 Sep 2023 – 29 Sep 2023 | C | 1 | 1 | 0 | 100% | +0.95 | -9.09 |  |
| 02 Oct 2023 – 06 Oct 2023 | A | 2 | 1 | 1 | 50% | +0.57 | -8.52 | 1 closed at 16:00 NY |
| 09 Oct 2023 – 13 Oct 2023 | A | 1 | 1 | 0 | 100% | +0.96 | -7.56 |  |
| 16 Oct 2023 – 20 Oct 2023 | A | 5 | 3 | 2 | 60% | +1.60 | -5.97 | 3 closed at 16:00 NY |
| 23 Oct 2023 – 27 Oct 2023 | A | 5 | 1 | 4 | 20% | **-2.59** | -8.55 | 1 closed at 16:00 NY |
| 30 Oct 2023 – 03 Nov 2023 | A | 2 | 0 | 2 | 0% | **-1.24** | -9.80 | news: FOMC -1.0; 1 closed at 16:00 NY |
| 06 Nov 2023 – 10 Nov 2023 | A | 2 | 2 | 0 | 100% | +1.21 | -8.59 | 1 closed at 16:00 NY |
| 13 Nov 2023 – 17 Nov 2023 | A | 4 | 2 | 2 | 50% | **-0.15** | -8.74 | news: CPI +1.0, PPI -1.0 |
| 20 Nov 2023 – 24 Nov 2023 | A | 2 | 1 | 1 | 50% | **-0.19** | -8.92 | 2 closed at 16:00 NY |
| 27 Nov 2023 – 01 Dec 2023 | A | 1 | 0 | 1 | 0% | **-0.33** | -9.25 | 1 closed at 16:00 NY |
| 04 Dec 2023 – 08 Dec 2023 | A | 3 | 2 | 1 | 67% | +1.58 | -7.67 | 2 closed at 16:00 NY |
| 11 Dec 2023 – 15 Dec 2023 | A | 4 | 2 | 2 | 50% | **-0.15** | -7.82 | news: CPI -1.0, PPI+FOMC +1.0 |
| 18 Dec 2023 – 22 Dec 2023 | A | 2 | 1 | 1 | 50% | +0.04 | -7.78 | 2 closed at 16:00 NY |
| 25 Dec 2023 – 29 Dec 2023 | A | 2 | 1 | 1 | 50% | **-0.08** | -7.86 |  |
| 01 Jan 2024 – 05 Jan 2024 | A | 3 | 1 | 2 | 33% | **-1.11** | -8.98 | news: NFP +1.0 |
| 08 Jan 2024 – 12 Jan 2024 | A | 3 | 0 | 3 | 0% | **-2.17** | -11.15 | news: CPI -1.0; 1 closed at 16:00 NY |
| 15 Jan 2024 – 19 Jan 2024 | A | 1 | 1 | 0 | 100% | +0.27 | -10.87 | 1 closed at 16:00 NY |
| 22 Jan 2024 – 26 Jan 2024 | A | 2 | 0 | 2 | 0% | **-1.26** | -12.14 | 1 closed at 16:00 NY |
| 29 Jan 2024 – 02 Feb 2024 | A | 4 | 3 | 1 | 75% | +0.16 | -11.97 | news: NFP +0.1; 2 closed at 16:00 NY |
| 05 Feb 2024 – 09 Feb 2024 | A | 2 | 1 | 1 | 50% | +0.92 | -11.05 | 1 closed at 16:00 NY |
| 12 Feb 2024 – 16 Feb 2024 | A | 0 | 0 | 0 | – | +0.00 | -11.05 | no trade (holiday, thin days or stops under 8 USD) |
| 19 Feb 2024 – 23 Feb 2024 | A | 1 | 0 | 1 | 0% | **-1.04** | -12.09 |  |
| 26 Feb 2024 – 01 Mar 2024 | A | 0 | 0 | 0 | – | +0.00 | -12.09 | no trade (holiday, thin days or stops under 8 USD) |
| 04 Mar 2024 – 08 Mar 2024 | A | 2 | 2 | 0 | 100% | +1.92 | -10.17 | news: NFP +1.0 |
| 11 Mar 2024 – 15 Mar 2024 | A | 4 | 2 | 2 | 50% | +0.48 | -9.69 | news: CPI +1.0, PPI +1.0; 1 closed at 16:00 NY |
| 18 Mar 2024 – 22 Mar 2024 | A | 4 | 3 | 1 | 75% | +0.74 | -8.95 | 3 closed at 16:00 NY |
| 25 Mar 2024 – 29 Mar 2024 | A | 4 | 3 | 1 | 75% | +1.64 | -7.31 | 2 closed at 16:00 NY |
| 01 Apr 2024 – 05 Apr 2024 | A | 5 | 3 | 2 | 60% | +1.60 | -5.70 | news: NFP +1.0; 1 closed at 16:00 NY |
| 08 Apr 2024 – 12 Apr 2024 | A | 4 | 2 | 2 | 50% | +0.09 | -5.61 | news: CPI +0.4, PPI -1.0; 2 closed at 16:00 NY |
| 15 Apr 2024 – 19 Apr 2024 | A | 4 | 2 | 2 | 50% | **-1.03** | -6.64 | 1 closed at 16:00 NY |
| 22 Apr 2024 – 26 Apr 2024 | A | 5 | 3 | 2 | 60% | +1.21 | -5.43 | 1 closed at 16:00 NY |
| 29 Apr 2024 – 03 May 2024 | A | 5 | 3 | 2 | 60% | +1.77 | -3.66 | news: FOMC +1.0, NFP -1.0; 1 closed at 16:00 NY |
| 06 May 2024 – 10 May 2024 | A | 5 | 3 | 2 | 60% | +0.52 | -3.14 | 3 closed at 16:00 NY |
| 13 May 2024 – 17 May 2024 | A | 4 | 4 | 0 | 100% | +3.86 | +0.73 | news: PPI +1.0 |
| 20 May 2024 – 24 May 2024 | A | 4 | 2 | 2 | 50% | +0.96 | +1.69 | 3 closed at 16:00 NY |
| 27 May 2024 – 31 May 2024 | A | 2 | 1 | 1 | 50% | **-1.00** | +0.69 | 1 closed at 16:00 NY |
| 03 Jun 2024 – 07 Jun 2024 | A | 5 | 4 | 1 | 80% | +3.41 | +4.10 | news: NFP +1.0; 2 closed at 16:00 NY |
| 10 Jun 2024 – 14 Jun 2024 | A | 5 | 2 | 3 | 40% | **-1.52** | +2.57 | news: CPI+FOMC -0.5, PPI -1.0; 2 closed at 16:00 NY |
| 17 Jun 2024 – 21 Jun 2024 | A | 2 | 0 | 2 | 0% | **-1.34** | +1.24 | 1 closed at 16:00 NY |
| 24 Jun 2024 – 28 Jun 2024 | A | 4 | 3 | 1 | 75% | +0.90 | +2.13 | 2 closed at 16:00 NY |
| 01 Jul 2024 – 05 Jul 2024 | A | 3 | 2 | 1 | 67% | +0.08 | +2.21 | 1 closed at 16:00 NY |
| 08 Jul 2024 – 12 Jul 2024 | A | 5 | 4 | 1 | 80% | +2.80 | +5.02 | news: CPI +1.0, PPI +1.0 |
| 15 Jul 2024 – 19 Jul 2024 | A | 5 | 2 | 3 | 40% | **-1.51** | +3.50 | 1 closed at 16:00 NY |
| 22 Jul 2024 – 26 Jul 2024 | A | 5 | 3 | 2 | 60% | **-0.92** | +2.58 | 2 closed at 16:00 NY |
| 29 Jul 2024 – 02 Aug 2024 | A | 5 | 3 | 2 | 60% | +0.89 | +3.47 | news: FOMC +1.0, NFP -1.0 |
| 05 Aug 2024 – 09 Aug 2024 | A | 5 | 3 | 2 | 60% | +0.65 | +4.12 | 4 closed at 16:00 NY |
| 12 Aug 2024 – 16 Aug 2024 | A | 4 | 3 | 1 | 75% | +1.87 | +6.00 | news: CPI -1.0 |
| 19 Aug 2024 – 23 Aug 2024 | A | 5 | 3 | 2 | 60% | +0.84 | +6.84 |  |
| 26 Aug 2024 – 30 Aug 2024 | A | 5 | 1 | 4 | 20% | **-2.27** | +4.57 | 1 closed at 16:00 NY |
| 02 Sep 2024 – 06 Sep 2024 | A | 2 | 1 | 1 | 50% | **-0.07** | +4.50 | news: NFP -1.0 |
| 09 Sep 2024 – 13 Sep 2024 | A | 4 | 2 | 2 | 50% | **-0.14** | +4.36 | news: CPI -1.0, PPI +1.0 |
| 16 Sep 2024 – 20 Sep 2024 | A | 4 | 4 | 0 | 100% | +3.31 | +7.67 | news: FOMC +1.0; 1 closed at 16:00 NY |
| 23 Sep 2024 – 27 Sep 2024 | A | 5 | 2 | 3 | 40% | **-0.50** | +7.17 | 1 closed at 16:00 NY |
| 30 Sep 2024 – 04 Oct 2024 | A/Y1 | 5 | 2 | 3 | 40% | **-0.92** | +6.24 | news: NFP -1.0; 3 closed at 16:00 NY |
| 07 Oct 2024 – 11 Oct 2024 | Y1 | 5 | 2 | 3 | 40% | **-2.44** | +3.80 | news: CPI -1.0, PPI +0.4; 2 closed at 16:00 NY |
| 14 Oct 2024 – 18 Oct 2024 | Y1 | 5 | 3 | 2 | 60% | **-0.90** | +2.90 | 4 closed at 16:00 NY |
| 21 Oct 2024 – 25 Oct 2024 | Y1 | 5 | 2 | 3 | 40% | **-1.94** | +0.96 | 2 closed at 16:00 NY |
| 28 Oct 2024 – 01 Nov 2024 | Y1 | 4 | 2 | 2 | 50% | **-0.45** | +0.51 | news: NFP -1.0; 1 closed at 16:00 NY |
| 04 Nov 2024 – 08 Nov 2024 | Y1 | 5 | 3 | 2 | 60% | +0.74 | +1.25 | news: FOMC +1.0; 3 closed at 16:00 NY |
| 11 Nov 2024 – 15 Nov 2024 | Y1 | 5 | 1 | 4 | 20% | **-1.74** | -0.49 | news: CPI -1.0, PPI -1.0; 2 closed at 16:00 NY |
| 18 Nov 2024 – 22 Nov 2024 | Y1 | 5 | 4 | 1 | 80% | +0.52 | +0.03 | 4 closed at 16:00 NY |
| 25 Nov 2024 – 29 Nov 2024 | Y1 | 3 | 1 | 2 | 33% | **-0.35** | -0.32 | 3 closed at 16:00 NY |
| 02 Dec 2024 – 06 Dec 2024 | Y1 | 3 | 1 | 2 | 33% | **-0.65** | -0.97 | 1 closed at 16:00 NY |
| 09 Dec 2024 – 13 Dec 2024 | Y1 | 5 | 5 | 0 | 100% | +3.11 | +2.14 | news: CPI +0.3, PPI +0.6; 3 closed at 16:00 NY |
| 16 Dec 2024 – 20 Dec 2024 | Y1 | 5 | 3 | 2 | 60% | +0.54 | +2.68 | news: FOMC +1.0; 2 closed at 16:00 NY |
| 23 Dec 2024 – 27 Dec 2024 | Y1 | 2 | 2 | 0 | 100% | +1.26 | +3.94 | 1 closed at 16:00 NY |
| 30 Dec 2024 – 03 Jan 2025 | Y1 | 4 | 4 | 0 | 100% | +3.87 | +7.81 |  |
| 06 Jan 2025 – 10 Jan 2025 | Y1 | 5 | 3 | 2 | 60% | **-0.05** | +7.75 | news: NFP -1.0; 1 closed at 16:00 NY |
| 13 Jan 2025 – 17 Jan 2025 | Y1 | 5 | 4 | 1 | 80% | +2.24 | +9.99 | news: PPI -1.0, CPI +0.9; 2 closed at 16:00 NY |
| 20 Jan 2025 – 24 Jan 2025 | Y1 | 3 | 0 | 3 | 0% | **-1.64** | +8.34 | 2 closed at 16:00 NY |
| 27 Jan 2025 – 31 Jan 2025 | Y1 | 2 | 1 | 1 | 50% | **-0.76** | +7.58 | 1 closed at 16:00 NY |
| 03 Feb 2025 – 07 Feb 2025 | Y1 | 5 | 2 | 3 | 40% | **-0.17** | +7.41 | news: NFP -1.0; 1 closed at 16:00 NY |
| 10 Feb 2025 – 14 Feb 2025 | Y1 | 4 | 2 | 2 | 50% | **-1.33** | +6.08 | news: CPI -1.0; 2 closed at 16:00 NY |
| 17 Feb 2025 – 21 Feb 2025 | Y1 | 3 | 0 | 3 | 0% | **-2.48** | +3.60 | 1 closed at 16:00 NY |
| 24 Feb 2025 – 28 Feb 2025 | Y1 | 5 | 4 | 1 | 80% | +1.02 | +4.63 | 4 closed at 16:00 NY |
| 03 Mar 2025 – 07 Mar 2025 | Y1 | 5 | 3 | 2 | 60% | +1.61 | +6.23 | news: NFP -0.3; 1 closed at 16:00 NY |
| 10 Mar 2025 – 14 Mar 2025 | Y1 | 5 | 2 | 3 | 40% | **-1.56** | +4.67 | news: CPI -1.0, PPI -1.0; 1 closed at 16:00 NY |
| 17 Mar 2025 – 21 Mar 2025 | Y1 | 5 | 3 | 2 | 60% | +1.10 | +5.77 | news: FOMC -1.0; 2 closed at 16:00 NY |
| 24 Mar 2025 – 28 Mar 2025 | Y1 | 4 | 2 | 2 | 50% | **-0.11** | +5.66 |  |
| 31 Mar 2025 – 04 Apr 2025 | Y1 | 4 | 1 | 3 | 25% | **-0.19** | +5.47 | news: NFP -1.0; 2 closed at 16:00 NY |
| 07 Apr 2025 – 11 Apr 2025 | Y1 | 4 | 3 | 1 | 75% | +0.88 | +6.35 | news: CPI +0.7, PPI +0.2; 2 closed at 16:00 NY |
| 14 Apr 2025 – 18 Apr 2025 | Y1 | 3 | 1 | 2 | 33% | +0.45 | +6.81 | 3 closed at 16:00 NY |
| 21 Apr 2025 – 25 Apr 2025 | Y1 | 4 | 2 | 2 | 50% | **-0.22** | +6.58 | 3 closed at 16:00 NY |
| 28 Apr 2025 – 02 May 2025 | Y1 | 4 | 1 | 3 | 25% | **-1.07** | +5.51 | news: NFP -1.0; 3 closed at 16:00 NY |
| 05 May 2025 – 09 May 2025 | Y1 | 4 | 3 | 1 | 75% | +1.97 | +7.48 | 3 closed at 16:00 NY |
| 12 May 2025 – 16 May 2025 | Y1 | 5 | 4 | 1 | 80% | +1.53 | +9.02 | news: CPI -0.3, PPI +0.5; 4 closed at 16:00 NY |
| 19 May 2025 – 23 May 2025 | Y1 | 4 | 3 | 1 | 75% | +2.68 | +11.70 | 2 closed at 16:00 NY |
| 26 May 2025 – 30 May 2025 | Y1 | 3 | 1 | 2 | 33% | **-0.55** | +11.15 | 2 closed at 16:00 NY |
| 02 Jun 2025 – 06 Jun 2025 | Y1 | 5 | 3 | 2 | 60% | +0.75 | +11.90 | news: NFP +1.0; 2 closed at 16:00 NY |
| 09 Jun 2025 – 13 Jun 2025 | Y1 | 4 | 2 | 2 | 50% | **-0.70** | +11.20 | news: CPI +0.0, PPI -1.0; 3 closed at 16:00 NY |
| 16 Jun 2025 – 20 Jun 2025 | Y1 | 1 | 1 | 0 | 100% | +0.89 | +12.09 | 1 closed at 16:00 NY |
| 23 Jun 2025 – 27 Jun 2025 | Y1 | 5 | 2 | 3 | 40% | **-1.68** | +10.41 | 3 closed at 16:00 NY |
| 30 Jun 2025 – 04 Jul 2025 | Y1 | 4 | 3 | 1 | 75% | +0.69 | +11.09 | news: NFP -0.3; 4 closed at 16:00 NY |
| 07 Jul 2025 – 11 Jul 2025 | Y1 | 4 | 3 | 1 | 75% | +1.10 | +12.19 | 1 closed at 16:00 NY |
| 14 Jul 2025 – 18 Jul 2025 | Y1 | 5 | 3 | 2 | 60% | +0.31 | +12.50 | news: CPI +0.4, PPI -1.0; 1 closed at 16:00 NY |
| 21 Jul 2025 – 25 Jul 2025 | Y1 | 5 | 4 | 1 | 80% | +1.97 | +14.47 | 1 closed at 16:00 NY |
| 28 Jul 2025 – 01 Aug 2025 | Y1 | 5 | 4 | 1 | 80% | +1.95 | +16.42 | news: FOMC +1.0, NFP +1.0; 3 closed at 16:00 NY |
| 04 Aug 2025 – 08 Aug 2025 | Y1 | 4 | 3 | 1 | 75% | +2.52 | +18.94 | 2 closed at 16:00 NY |
| 11 Aug 2025 – 15 Aug 2025 | Y1 | 4 | 3 | 1 | 75% | +1.39 | +20.34 | news: CPI -1.0, PPI +1.0; 1 closed at 16:00 NY |
| 18 Aug 2025 – 22 Aug 2025 | Y1 | 4 | 1 | 3 | 25% | **-1.39** | +18.94 | 1 closed at 16:00 NY |
| 25 Aug 2025 – 29 Aug 2025 | Y1 | 3 | 1 | 2 | 33% | **-0.68** | +18.26 | 1 closed at 16:00 NY |
| 01 Sep 2025 – 05 Sep 2025 | Y1 | 2 | 2 | 0 | 100% | +1.23 | +19.49 | news: NFP +0.2; 1 closed at 16:00 NY |
| 08 Sep 2025 – 12 Sep 2025 | Y1 | 4 | 1 | 3 | 25% | **-0.83** | +18.66 | news: PPI -0.2, CPI -0.6; 2 closed at 16:00 NY |
| 15 Sep 2025 – 19 Sep 2025 | Y1 | 5 | 2 | 3 | 40% | **-0.42** | +18.24 | news: FOMC -1.0; 2 closed at 16:00 NY |
| 22 Sep 2025 – 26 Sep 2025 | Y1 | 5 | 3 | 2 | 60% | +0.90 | +19.14 |  |
| 29 Sep 2025 – 03 Oct 2025 | Y1/Y2 | 5 | 3 | 2 | 60% | +0.40 | +19.54 | 2 closed at 16:00 NY |
| 06 Oct 2025 – 10 Oct 2025 | Y2 | 5 | 3 | 2 | 60% | **-1.48** | +18.07 | 3 closed at 16:00 NY |
| 13 Oct 2025 – 17 Oct 2025 | Y2 | 5 | 4 | 1 | 80% | +1.78 | +19.85 | 4 closed at 16:00 NY |
| 20 Oct 2025 – 24 Oct 2025 | Y2 | 5 | 2 | 3 | 40% | +1.09 | +20.94 | news: CPI -0.3; 3 closed at 16:00 NY |
| 27 Oct 2025 – 31 Oct 2025 | Y2 | 4 | 2 | 2 | 50% | **-0.15** | +20.79 | news: FOMC -1.0; 2 closed at 16:00 NY |
| 03 Nov 2025 – 07 Nov 2025 | Y2 | 5 | 1 | 4 | 20% | **-2.69** | +18.10 | 3 closed at 16:00 NY |
| 10 Nov 2025 – 14 Nov 2025 | Y2 | 5 | 3 | 2 | 60% | +0.40 | +18.50 | 3 closed at 16:00 NY |
| 17 Nov 2025 – 21 Nov 2025 | Y2 | 3 | 0 | 3 | 0% | **-2.12** | +16.38 | 2 closed at 16:00 NY |
| 24 Nov 2025 – 28 Nov 2025 | Y2 | 3 | 1 | 2 | 33% | **-0.21** | +16.16 | news: PPI -1.0; 1 closed at 16:00 NY |
| 01 Dec 2025 – 05 Dec 2025 | Y2 | 2 | 0 | 2 | 0% | **-2.03** | +14.14 |  |
| 08 Dec 2025 – 12 Dec 2025 | Y2 | 4 | 3 | 1 | 75% | +0.63 | +14.76 | news: FOMC -1.0; 2 closed at 16:00 NY |
| 15 Dec 2025 – 19 Dec 2025 | Y2 | 5 | 0 | 5 | 0% | **-2.47** | +12.29 | news: NFP -0.3, CPI -1.0; 3 closed at 16:00 NY |
| 22 Dec 2025 – 26 Dec 2025 | Y2 | 2 | 1 | 1 | 50% | **-0.82** | +11.46 | 1 closed at 16:00 NY |
| 29 Dec 2025 – 02 Jan 2026 | Y2 | 3 | 1 | 2 | 33% | **-0.73** | +10.74 | 1 closed at 16:00 NY |
| 05 Jan 2026 – 09 Jan 2026 | Y2 | 5 | 3 | 2 | 60% | **-0.13** | +10.61 | news: NFP +0.6; 4 closed at 16:00 NY |
| 12 Jan 2026 – 16 Jan 2026 | Y2 | 4 | 1 | 3 | 25% | **-0.59** | +10.02 | news: CPI +1.0; 2 closed at 16:00 NY |
| 19 Jan 2026 – 23 Jan 2026 | Y2 | 2 | 1 | 1 | 50% | **-0.01** | +10.01 |  |
| 26 Jan 2026 – 30 Jan 2026 | Y2 | 4 | 4 | 0 | 100% | +3.91 | +13.91 | news: FOMC +1.0, PPI +1.0; 1 closed at 16:00 NY |
| 02 Feb 2026 – 06 Feb 2026 | Y2 | 3 | 3 | 0 | 100% | +0.49 | +14.40 | 3 closed at 16:00 NY |
| 09 Feb 2026 – 13 Feb 2026 | Y2 | 5 | 4 | 1 | 80% | +1.63 | +16.04 | news: NFP +1.0, CPI +0.4; 2 closed at 16:00 NY |
| 16 Feb 2026 – 20 Feb 2026 | Y2 | 2 | 2 | 0 | 100% | +1.48 | +17.52 | 1 closed at 16:00 NY |
| 23 Feb 2026 – 27 Feb 2026 | Y2 | 5 | 1 | 4 | 20% | **-2.09** | +15.43 | news: PPI +1.0; 3 closed at 16:00 NY |
| 02 Mar 2026 – 06 Mar 2026 | Y2 | 5 | 3 | 2 | 60% | **-0.11** | +15.32 | news: NFP +0.0; 3 closed at 16:00 NY |
| 09 Mar 2026 – 13 Mar 2026 | Y2 | 4 | 3 | 1 | 75% | +0.15 | +15.47 | news: CPI +0.0; 2 closed at 16:00 NY |
| 16 Mar 2026 – 20 Mar 2026 | Y2 | 5 | 3 | 2 | 60% | +1.71 | +17.17 | news: FOMC +1.0; 1 closed at 16:00 NY |
| 23 Mar 2026 – 27 Mar 2026 | Y2 | 2 | 1 | 1 | 50% | **-0.97** | +16.20 | 1 closed at 16:00 NY |
| 30 Mar 2026 – 03 Apr 2026 | Y2 | 4 | 2 | 2 | 50% | +0.40 | +16.61 | 4 closed at 16:00 NY |
| 06 Apr 2026 – 10 Apr 2026 | Y2 | 5 | 2 | 3 | 40% | +0.13 | +16.74 | news: CPI -0.5; 2 closed at 16:00 NY |
| 13 Apr 2026 – 17 Apr 2026 | Y2 | 5 | 4 | 1 | 80% | +1.33 | +18.07 | news: PPI -1.0; 2 closed at 16:00 NY |
| 20 Apr 2026 – 24 Apr 2026 | Y2 | 4 | 2 | 2 | 50% | +0.87 | +18.94 | 3 closed at 16:00 NY |
| 27 Apr 2026 – 01 May 2026 | Y2 | 5 | 4 | 1 | 80% | +3.08 | +22.02 | news: FOMC +1.0; 2 closed at 16:00 NY |
| 04 May 2026 – 08 May 2026 | Y2 | 5 | 3 | 2 | 60% | +0.34 | +22.36 | news: NFP -0.2; 4 closed at 16:00 NY |
| 11 May 2026 – 15 May 2026 | Y2 | 4 | 2 | 2 | 50% | +0.02 | +22.38 | news: CPI -0.2, PPI -0.1; 4 closed at 16:00 NY |
| 18 May 2026 – 22 May 2026 | Y2 | 5 | 2 | 3 | 40% | +0.55 | +22.93 | 4 closed at 16:00 NY |
| 25 May 2026 – 29 May 2026 | Y2 | 3 | 3 | 0 | 100% | +2.32 | +25.26 | 1 closed at 16:00 NY |
| 01 Jun 2026 – 05 Jun 2026 | Y2 | 5 | 3 | 2 | 60% | +1.44 | +26.69 | news: NFP +1.0; 3 closed at 16:00 NY |
| 08 Jun 2026 – 12 Jun 2026 | Y2 | 2 | 2 | 0 | 100% | +1.39 | +28.08 | news: CPI +1.0; 1 closed at 16:00 NY |
| 15 Jun 2026 – 19 Jun 2026 | Y2 | 4 | 1 | 3 | 25% | **-0.88** | +27.20 | news: FOMC -1.0; 3 closed at 16:00 NY |
| 22 Jun 2026 – 26 Jun 2026 | Y2 | 4 | 3 | 1 | 75% | +1.94 | +29.13 | 2 closed at 16:00 NY |
| 29 Jun 2026 – 03 Jul 2026 | Y2/B | 4 | 2 | 2 | 50% | +0.22 | +29.35 | news: NFP +1.0; 2 closed at 16:00 NY |
| 06 Jul 2026 – 10 Jul 2026 | B | 4 | 3 | 1 | 75% | +1.96 | +31.31 |  |
| 13 Jul 2026 – 17 Jul 2026 | B | 5 | 2 | 3 | 40% | **-0.99** | +30.32 | news: CPI -0.3, PPI -1.0; 2 closed at 16:00 NY |
| 20 Jul 2026 – 24 Jul 2026 | B | 5 | 3 | 2 | 60% | +0.51 | +30.83 | 4 closed at 16:00 NY |
| 27 Jul 2026 – 31 Jul 2026 | B | 5 | 2 | 3 | 40% | **-0.07** | +30.76 | news: FOMC -1.0; 3 closed at 16:00 NY |
| 03 Aug 2026 – 07 Aug 2026 | B | 5 | 3 | 2 | 60% | +2.28 | +33.04 | news: NFP +1.0; 3 closed at 16:00 NY |
| 10 Aug 2026 – 14 Aug 2026 | B | 5 | 3 | 2 | 60% | +1.08 | +34.13 | news: CPI -0.0, PPI +0.3; 5 closed at 16:00 NY |
| 17 Aug 2026 – 21 Aug 2026 | B | 5 | 4 | 1 | 80% | +1.59 | +35.72 | 2 closed at 16:00 NY |
| 24 Aug 2026 – 28 Aug 2026 | B | 5 | 1 | 4 | 20% | **-1.31** | +34.42 | 4 closed at 16:00 NY |
| 31 Aug 2026 – 04 Sep 2026 | B | 4 | 3 | 1 | 75% | +1.96 | +36.38 | news: NFP -1.0 |
| 07 Sep 2026 – 11 Sep 2026 | B | 3 | 1 | 2 | 33% | **-0.07** | +36.31 | news: PPI +1.0, CPI -1.0; 1 closed at 16:00 NY |
| 14 Sep 2026 – 18 Sep 2026 | B | 5 | 2 | 3 | 40% | **-0.38** | +35.93 | news: FOMC -1.0; 3 closed at 16:00 NY |
| 21 Sep 2026 – 25 Sep 2026 | B | 4 | 2 | 2 | 50% | **-0.02** | +35.92 | 3 closed at 16:00 NY |
| 28 Sep 2026 – 02 Oct 2026 | B | 2 | 2 | 0 | 100% | +1.88 | +37.80 | 1 closed at 16:00 NY |

## Summary in plain words

**What is working:**
- On the three years Agent 1 had already seen (Oct 2023 – Sep 2026), v2 looks good: +46.9 R over 610 trades, losing runs of 5 or
  fewer, and positive in every one of those periods even at double or triple cost.
- The wider stop and the 8 USD minimum did fix v1's cost problem on those years.

**What is not working:**
- **In the one year nobody had seen (C), v2 lost 9.1 R over 74 trades.** Only 43% of trades won. 5 of the 7 months with trades lost.
  At 0.80 USD cost it lost 11.7 R.
- **The losses are not caused by costs.** Even with zero costs, C lost 6.5 R. The basic idea ("gold keeps going after London
  breaks the Asia range") went the wrong way that year: trading every break, before costs, lost 21.7 R over 130 days.
- So the idea worked during gold's huge rise (2023–2026, from about 1,800 to over 5,000 USD) but not in the choppier 2022–23 market.
  That is the same pattern that sank GBPUSD: it works in one kind of market and fails in another.
- February 2023 was the worst stretch: 10 trades, 1 win, −7.4 R. But C is negative even without it (−1.7 R over 64 trades).

**What is being changed:** v2 is dropped. Nothing goes to the owner. The team leader and Agent 1 decide whether gold gets a genuinely
different idea or the team moves on to the next market (NASDAQ 100).

**What to watch next week:** nothing to trade. A test on more history (the missing Feb – Jul 2023 hours from another source, or older
years) would only matter for a new idea. It would not rescue this one, because it already failed on clean data.

*Past results do not guarantee future results. This is a test on historical prices, not trading advice.*
