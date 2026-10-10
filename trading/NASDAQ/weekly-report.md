# NASDAQ 100: weekly report (Agent 2)

**Strategy:** v1 "Fade the big opening gap" (rules in `strategy.md`). **Report date:** Sunday edition, prepared 9 Oct 2026.
**Status:** tested on 5 years (Oct 2021 – Sep 2026). **Final verdict: DROP.** See `feedback.md`.

How to read the table:
- One row per week, Monday to Friday, 27 Sep 2021 to 2 Oct 2026. 1 R = the 1% of the account risked on a trade.
- Costs of 2.0 index points per trade are already taken off every result.
- **Period:** C = hidden test Oct 2021 – Sep 2023 (opened after the rules were frozen; includes the 2022 bear market),
  A = hidden test Oct 2023 – Sep 2024, Y1 and Y2 = the data the rules were designed on (Oct 2024 – Jun 2026),
  B = hidden test Jul – Sep 2026. C, A and B were never used to build the rules.
- This table comes from one continuous run (C joined in front of the main file). Because of that, A no longer needs an ATR
  warm-up in Oct 2023 and has 2 extra trades (3 and 6 Oct 2023) compared with the earlier A-only run (A: 63 trades, +1.91 R).
- **Mar – Jul 2023 has missing price data on almost every day**, so those weeks show "skipped: missing price data" and no trades.
- The trade is entered at 09:35 New York = 16:35 Doha (US summer time) / 17:35 Doha (US winter time), and is closed by 16:00 New York
  = 23:00 Doha (summer) / 00:00 midnight Doha (winter) at the latest.
- **Notes:** each trade as "weekday, direction, how it ended, result". "16:00 close" = neither stop nor target was hit. Labels:
  NFP (US jobs report), CPI (US inflation), PPI (producer prices), FOMC (US interest-rate decision), EARN (day after Nvidia / Apple /
  Microsoft / Alphabet results). In C only EARN is labelled. "skipped" = the day could not be traded by the rules (holiday, half day,
  missing price data, ATR warm-up, or the day after one of those); the number of skipped days is in brackets.

### Added 10 Oct 2026: hidden period H, Jan 2016 – Dec 2018 (rules unchanged; opened for the first time)
H: 81 trades, +4.34 R (2016 -0.10, 2017 -2.46, 2018 +6.89). Running total for H starts at 0. Notes: weekday + L/S + R + how it ended.
Weeks with 0 trades had no big enough gap, a stop under 40 points (85 days in 2016-2018), or a holiday.

| Week | Period | Trades | Wins | Losses | Win rate | Result (R) | Running total H (R) | Notes |
|---|---|---|---|---|---|---|---|---|
| 04 Jan 2016 - 08 Jan | H | 0 | 0 | 0 | - | 0 | +0.00 |  |
| 11 Jan 2016 - 15 Jan | H | 0 | 0 | 0 | - | 0 | +0.00 |  |
| 18 Jan 2016 - 22 Jan | H | 2 | 0 | 2 | 0% | -1.53 | -1.53 | WedL-1.03(stop) FriS-0.51(close) |
| 25 Jan 2016 - 29 Jan | H | 1 | 1 | 0 | 100% | +0.75 | -0.78 | ThuS+0.75(target) |
| 01 Feb 2016 - 05 Feb | H | 0 | 0 | 0 | - | 0 | -0.78 |  |
| 08 Feb 2016 - 12 Feb | H | 4 | 4 | 0 | 100% | +1.71 | +0.93 | MonL+0.25(close) TueL+0.66(target) WedS+0.24(close) ThuL+0.56(target) |
| 15 Feb 2016 - 19 Feb | H | 0 | 0 | 0 | - | 0 | +0.93 |  |
| 22 Feb 2016 - 26 Feb | H | 1 | 1 | 0 | 100% | +0.95 | +1.88 | WedL+0.95(target) |
| 29 Feb 2016 - 04 Mar | H | 1 | 0 | 1 | 0% | -1.04 | +0.84 | TueS-1.04(stop) |
| 07 Mar 2016 - 11 Mar | H | 1 | 0 | 1 | 0% | -0.68 | +0.16 | FriS-0.68(close) |
| 14 Mar 2016 - 18 Mar | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 21 Mar 2016 - 25 Mar | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 28 Mar 2016 - 01 Apr | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 04 Apr 2016 - 08 Apr | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 11 Apr 2016 - 15 Apr | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 18 Apr 2016 - 22 Apr | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 25 Apr 2016 - 29 Apr | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 02 May 2016 - 06 May | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 09 May 2016 - 13 May | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 16 May 2016 - 20 May | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 23 May 2016 - 27 May | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 30 May 2016 - 03 Jun | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 06 Jun 2016 - 10 Jun | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 13 Jun 2016 - 17 Jun | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 20 Jun 2016 - 24 Jun | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 27 Jun 2016 - 01 Jul | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 04 Jul 2016 - 08 Jul | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 11 Jul 2016 - 15 Jul | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 18 Jul 2016 - 22 Jul | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 25 Jul 2016 - 29 Jul | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 01 Aug 2016 - 05 Aug | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 08 Aug 2016 - 12 Aug | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 15 Aug 2016 - 19 Aug | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 22 Aug 2016 - 26 Aug | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 29 Aug 2016 - 02 Sep | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 05 Sep 2016 - 09 Sep | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 12 Sep 2016 - 16 Sep | H | 0 | 0 | 0 | - | 0 | +0.16 |  |
| 19 Sep 2016 - 23 Sep | H | 1 | 0 | 1 | 0% | -0.26 | -0.10 | ThuS-0.26(close) |
| 26 Sep 2016 - 30 Sep | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 03 Oct 2016 - 07 Oct | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 10 Oct 2016 - 14 Oct | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 17 Oct 2016 - 21 Oct | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 24 Oct 2016 - 28 Oct | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 31 Oct 2016 - 04 Nov | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 07 Nov 2016 - 11 Nov | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 14 Nov 2016 - 18 Nov | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 21 Nov 2016 - 25 Nov | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 28 Nov 2016 - 02 Dec | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 05 Dec 2016 - 09 Dec | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 12 Dec 2016 - 16 Dec | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 19 Dec 2016 - 23 Dec | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 26 Dec 2016 - 30 Dec | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 02 Jan 2017 - 06 Jan | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 09 Jan 2017 - 13 Jan | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 16 Jan 2017 - 20 Jan | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 23 Jan 2017 - 27 Jan | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 30 Jan 2017 - 03 Feb | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 06 Feb 2017 - 10 Feb | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 13 Feb 2017 - 17 Feb | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 20 Feb 2017 - 24 Feb | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 27 Feb 2017 - 03 Mar | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 06 Mar 2017 - 10 Mar | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 13 Mar 2017 - 17 Mar | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 20 Mar 2017 - 24 Mar | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 27 Mar 2017 - 31 Mar | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 03 Apr 2017 - 07 Apr | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 10 Apr 2017 - 14 Apr | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 17 Apr 2017 - 21 Apr | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 24 Apr 2017 - 28 Apr | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 01 May 2017 - 05 May | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 08 May 2017 - 12 May | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 15 May 2017 - 19 May | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 22 May 2017 - 26 May | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 29 May 2017 - 02 Jun | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 05 Jun 2017 - 09 Jun | H | 0 | 0 | 0 | - | 0 | -0.10 |  |
| 12 Jun 2017 - 16 Jun | H | 2 | 1 | 1 | 50% | +0.49 | +0.39 | TueS-0.22(close) ThuL+0.70(close) |
| 19 Jun 2017 - 23 Jun | H | 1 | 0 | 1 | 0% | -1.04 | -0.65 | MonS-1.04(stop) |
| 26 Jun 2017 - 30 Jun | H | 0 | 0 | 0 | - | 0 | -0.65 |  |
| 03 Jul 2017 - 07 Jul | H | 1 | 0 | 1 | 0% | -0.36 | -1.01 | ThuL-0.36(close) |
| 10 Jul 2017 - 14 Jul | H | 1 | 0 | 1 | 0% | -0.43 | -1.44 | WedS-0.43(close) |
| 17 Jul 2017 - 21 Jul | H | 0 | 0 | 0 | - | 0 | -1.44 |  |
| 24 Jul 2017 - 28 Jul | H | 0 | 0 | 0 | - | 0 | -1.44 |  |
| 31 Jul 2017 - 04 Aug | H | 0 | 0 | 0 | - | 0 | -1.44 |  |
| 07 Aug 2017 - 11 Aug | H | 0 | 0 | 0 | - | 0 | -1.44 |  |
| 14 Aug 2017 - 18 Aug | H | 1 | 0 | 1 | 0% | -0.52 | -1.96 | MonS-0.52(close) |
| 21 Aug 2017 - 25 Aug | H | 2 | 1 | 1 | 50% | -0.85 | -2.81 | TueS-1.05(stop) WedL+0.20(close) |
| 28 Aug 2017 - 01 Sep | H | 1 | 1 | 0 | 100% | +0.73 | -2.08 | TueL+0.73(target) |
| 04 Sep 2017 - 08 Sep | H | 0 | 0 | 0 | - | 0 | -2.08 |  |
| 11 Sep 2017 - 15 Sep | H | 1 | 0 | 1 | 0% | -0.38 | -2.46 | MonS-0.38(close) |
| 18 Sep 2017 - 22 Sep | H | 0 | 0 | 0 | - | 0 | -2.46 |  |
| 25 Sep 2017 - 29 Sep | H | 0 | 0 | 0 | - | 0 | -2.46 |  |
| 02 Oct 2017 - 06 Oct | H | 0 | 0 | 0 | - | 0 | -2.46 |  |
| 09 Oct 2017 - 13 Oct | H | 0 | 0 | 0 | - | 0 | -2.46 |  |
| 16 Oct 2017 - 20 Oct | H | 0 | 0 | 0 | - | 0 | -2.46 |  |
| 23 Oct 2017 - 27 Oct | H | 0 | 0 | 0 | - | 0 | -2.46 |  |
| 30 Oct 2017 - 03 Nov | H | 0 | 0 | 0 | - | 0 | -2.46 |  |
| 06 Nov 2017 - 10 Nov | H | 0 | 0 | 0 | - | 0 | -2.46 |  |
| 13 Nov 2017 - 17 Nov | H | 0 | 0 | 0 | - | 0 | -2.46 |  |
| 20 Nov 2017 - 24 Nov | H | 0 | 0 | 0 | - | 0 | -2.46 |  |
| 27 Nov 2017 - 01 Dec | H | 0 | 0 | 0 | - | 0 | -2.46 |  |
| 04 Dec 2017 - 08 Dec | H | 2 | 2 | 0 | 100% | +1.23 | -1.23 | MonS+0.67(target) FriS+0.55(close) |
| 11 Dec 2017 - 15 Dec | H | 1 | 0 | 1 | 0% | -1.04 | -2.27 | FriS-1.04(stop) |
| 18 Dec 2017 - 22 Dec | H | 1 | 0 | 1 | 0% | -0.28 | -2.55 | MonS-0.28(close) |
| 25 Dec 2017 - 29 Dec | H | 0 | 0 | 0 | - | 0 | -2.55 |  |
| 01 Jan 2018 - 05 Jan | H | 0 | 0 | 0 | - | 0 | -2.55 |  |
| 08 Jan 2018 - 12 Jan | H | 0 | 0 | 0 | - | 0 | -2.55 |  |
| 15 Jan 2018 - 19 Jan | H | 1 | 0 | 1 | 0% | -1.05 | -3.60 | WedS-1.05(stop) |
| 22 Jan 2018 - 26 Jan | H | 2 | 1 | 1 | 50% | -0.17 | -3.77 | ThuS+0.87(target) FriS-1.04(stop) |
| 29 Jan 2018 - 02 Feb | H | 3 | 3 | 0 | 100% | +1.26 | -2.51 | TueL+0.01(close) WedS+0.76(target) ThuL+0.49(target) |
| 05 Feb 2018 - 09 Feb | H | 3 | 3 | 0 | 100% | +2.07 | -0.44 | MonL+0.79(target) TueL+0.27(target) FriS+1.00(target) |
| 12 Feb 2018 - 16 Feb | H | 0 | 0 | 0 | - | 0 | -0.44 |  |
| 19 Feb 2018 - 23 Feb | H | 0 | 0 | 0 | - | 0 | -0.44 |  |
| 26 Feb 2018 - 02 Mar | H | 1 | 1 | 0 | 100% | +0.67 | +0.23 | FriL+0.67(target) |
| 05 Mar 2018 - 09 Mar | H | 0 | 0 | 0 | - | 0 | +0.23 |  |
| 12 Mar 2018 - 16 Mar | H | 0 | 0 | 0 | - | 0 | +0.23 |  |
| 19 Mar 2018 - 23 Mar | H | 2 | 0 | 2 | 0% | -2.05 | -1.83 | MonL-1.03(stop) ThuL-1.03(stop) |
| 26 Mar 2018 - 30 Mar | H | 1 | 0 | 1 | 0% | -1.03 | -2.86 | MonS-1.03(stop) |
| 02 Apr 2018 - 06 Apr | H | 1 | 1 | 0 | 100% | +0.75 | -2.11 | WedL+0.75(target) |
| 09 Apr 2018 - 13 Apr | H | 1 | 0 | 1 | 0% | -0.42 | -2.53 | TueS-0.42(close) |
| 16 Apr 2018 - 20 Apr | H | 0 | 0 | 0 | - | 0 | -2.53 |  |
| 23 Apr 2018 - 27 Apr | H | 2 | 1 | 1 | 50% | +0.28 | -2.25 | ThuS-0.66(close) FriS+0.94(target) |
| 30 Apr 2018 - 04 May | H | 0 | 0 | 0 | - | 0 | -2.25 |  |
| 07 May 2018 - 11 May | H | 0 | 0 | 0 | - | 0 | -2.25 |  |
| 14 May 2018 - 18 May | H | 1 | 0 | 1 | 0% | -0.06 | -2.31 | TueL-0.06(close) |
| 21 May 2018 - 25 May | H | 2 | 2 | 0 | 100% | +1.25 | -1.06 | MonS+0.47(close) WedL+0.78(target) |
| 28 May 2018 - 01 Jun | H | 0 | 0 | 0 | - | 0 | -1.06 |  |
| 04 Jun 2018 - 08 Jun | H | 1 | 1 | 0 | 100% | +0.68 | -0.38 | FriL+0.68(target) |
| 11 Jun 2018 - 15 Jun | H | 1 | 0 | 1 | 0% | -0.70 | -1.08 | ThuS-0.70(close) |
| 18 Jun 2018 - 22 Jun | H | 3 | 2 | 1 | 67% | +1.89 | +0.81 | MonL+1.21(close) TueL+1.01(close) WedS-0.33(close) |
| 25 Jun 2018 - 29 Jun | H | 1 | 0 | 1 | 0% | -1.04 | -0.23 | MonL-1.04(stop) |
| 02 Jul 2018 - 06 Jul | H | 1 | 1 | 0 | 100% | +0.97 | +0.73 | MonL+0.97(target) |
| 09 Jul 2018 - 13 Jul | H | 1 | 0 | 1 | 0% | -0.03 | +0.70 | WedL-0.03(close) |
| 16 Jul 2018 - 20 Jul | H | 1 | 1 | 0 | 100% | +0.91 | +1.61 | TueL+0.91(target) |
| 23 Jul 2018 - 27 Jul | H | 3 | 2 | 1 | 67% | +1.02 | +2.63 | TueS+0.86(close) ThuL-0.40(close) FriS+0.56(target) |
| 30 Jul 2018 - 03 Aug | H | 1 | 1 | 0 | 100% | +0.59 | +3.23 | ThuL+0.59(target) |
| 06 Aug 2018 - 10 Aug | H | 1 | 0 | 1 | 0% | -0.27 | +2.95 | FriL-0.27(close) |
| 13 Aug 2018 - 17 Aug | H | 2 | 1 | 1 | 50% | -0.53 | +2.43 | WedL-1.03(stop) ThuS+0.51(close) |
| 20 Aug 2018 - 24 Aug | H | 0 | 0 | 0 | - | 0 | +2.43 |  |
| 27 Aug 2018 - 31 Aug | H | 1 | 0 | 1 | 0% | -0.72 | +1.70 | MonS-0.72(close) |
| 03 Sep 2018 - 07 Sep | H | 1 | 1 | 0 | 100% | +0.70 | +2.40 | FriL+0.70(target) |
| 10 Sep 2018 - 14 Sep | H | 1 | 0 | 1 | 0% | -0.31 | +2.09 | ThuS-0.31(close) |
| 17 Sep 2018 - 21 Sep | H | 2 | 1 | 1 | 50% | +0.03 | +2.13 | ThuS-0.75(close) FriS+0.79(target) |
| 24 Sep 2018 - 28 Sep | H | 1 | 1 | 0 | 100% | +1.15 | +3.28 | MonL+1.15(target) |
| 01 Oct 2018 - 05 Oct | H | 1 | 1 | 0 | 100% | +0.84 | +4.12 | MonS+0.84(target) |
| 08 Oct 2018 - 12 Oct | H | 1 | 0 | 1 | 0% | -0.49 | +3.63 | FriS-0.49(close) |
| 15 Oct 2018 - 19 Oct | H | 1 | 0 | 1 | 0% | -1.02 | +2.61 | TueS-1.02(stop) |
| 22 Oct 2018 - 26 Oct | H | 3 | 2 | 1 | 67% | +0.43 | +3.03 | TueL+1.15(target) ThuS-1.02(stop) FriL+0.29(close) |
| 29 Oct 2018 - 02 Nov | H | 2 | 1 | 1 | 50% | +0.36 | +3.40 | MonS+0.61(target) WedS-0.24(close) |
| 05 Nov 2018 - 09 Nov | H | 0 | 0 | 0 | - | 0 | +3.40 |  |
| 12 Nov 2018 - 16 Nov | H | 0 | 0 | 0 | - | 0 | +3.40 |  |
| 19 Nov 2018 - 23 Nov | H | 2 | 2 | 0 | 100% | +0.55 | +3.94 | TueL+0.13(close) WedS+0.41(close) |
| 26 Nov 2018 - 30 Nov | H | 0 | 0 | 0 | - | 0 | +3.94 |  |
| 03 Dec 2018 - 07 Dec | H | 1 | 1 | 0 | 100% | +0.11 | +4.05 | MonS+0.11(close) |
| 10 Dec 2018 - 14 Dec | H | 3 | 2 | 1 | 67% | +0.29 | +4.34 | TueS+0.79(target) WedS+0.22(close) FriL-0.72(close) |
| 17 Dec 2018 - 21 Dec | H | 0 | 0 | 0 | - | 0 | +4.34 |  |
| 24 Dec 2018 - 28 Dec | H | 0 | 0 | 0 | - | 0 | +4.34 |  |
| 31 Dec 2018 - 04 Jan | H | 0 | 0 | 0 | - | 0 | +4.34 |  |

### Oct 2021 – Sep 2026 (from the earlier report)
| Week (Mon - Fri) | Period | Trades | Wins | Losses | Win rate | Result (R) | Running total (R) | Notes |
|---|---|---|---|---|---|---|---|---|
| 27 Sep 21 - 01 Oct 21 | C | 0 | 0 | 0 | - | 0 | +0.00 | skipped: first day in file (1 d) |
| 04 Oct 21 - 08 Oct 21 | C | 0 | 0 | 0 | - | 0 | +0.00 | skipped: ATR warm-up (5 d) |
| 11 Oct 21 - 15 Oct 21 | C | 0 | 0 | 0 | - | 0 | +0.00 | skipped: ATR warm-up (4 d) |
| 18 Oct 21 - 22 Oct 21 | C | 0 | 0 | 0 | - | 0 | +0.00 |  |
| 25 Oct 21 - 29 Oct 21 | C | 2 | 2 | 0 | 100% | +1.57 | +1.57 | Tue short 16:00 close +0.63; Fri long target +0.94 (EARN) |
| 01 Nov 21 - 05 Nov 21 | C | 0 | 0 | 0 | - | 0 | +1.57 |  |
| 08 Nov 21 - 12 Nov 21 | C | 2 | 2 | 0 | 100% | +1.55 | +3.12 | Wed long target +1.12; Thu short 16:00 close +0.42 |
| 15 Nov 21 - 19 Nov 21 | C | 0 | 0 | 0 | - | 0 | +3.12 |  |
| 22 Nov 21 - 26 Nov 21 | C | 1 | 1 | 0 | 100% | +1.05 | +4.16 | Wed long target +1.05; skipped: US holiday, early close (2 d) |
| 29 Nov 21 - 03 Dec 21 | C | 1 | 1 | 0 | 100% | +0.82 | +4.99 | Wed short target +0.82; skipped: day after a skipped day (1 d) |
| 06 Dec 21 - 10 Dec 21 | C | 1 | 0 | 1 | 0% | -0.71 | +4.27 | Tue short 16:00 close -0.71 |
| 13 Dec 21 - 17 Dec 21 | C | 1 | 1 | 0 | 100% | +0.10 | +4.38 | Tue long 16:00 close +0.10 |
| 20 Dec 21 - 24 Dec 21 | C | 1 | 1 | 0 | 100% | +0.18 | +4.56 | Mon long 16:00 close +0.18 |
| 27 Dec 21 - 31 Dec 21 | C | 0 | 0 | 0 | - | 0 | +4.56 |  |
| 03 Jan 22 - 07 Jan 22 | C | 0 | 0 | 0 | - | 0 | +4.56 |  |
| 10 Jan 22 - 14 Jan 22 | C | 1 | 1 | 0 | 100% | +1.46 | +6.02 | Mon long target +1.46 |
| 17 Jan 22 - 21 Jan 22 | C | 0 | 0 | 0 | - | 0 | +6.02 | skipped: US holiday, day after a skipped day (2 d) |
| 24 Jan 22 - 28 Jan 22 | C | 3 | 1 | 2 | 33% | -0.31 | +5.70 | Mon long stop -1.01; Tue long 16:00 close -0.23; Wed short target +0.93 (EARN) |
| 31 Jan 22 - 04 Feb 22 | C | 1 | 0 | 1 | 0% | -0.63 | +5.08 | Thu long 16:00 close -0.63 |
| 07 Feb 22 - 11 Feb 22 | C | 1 | 0 | 1 | 0% | -0.28 | +4.80 | Thu long 16:00 close -0.28 |
| 14 Feb 22 - 18 Feb 22 | C | 1 | 0 | 1 | 0% | -0.36 | +4.44 | Tue short 16:00 close -0.36 |
| 21 Feb 22 - 25 Feb 22 | C | 1 | 1 | 0 | 100% | +1.36 | +5.80 | Thu long target +1.36; skipped: US holiday, day after a skipped day (2 d) |
| 28 Feb 22 - 04 Mar 22 | C | 0 | 0 | 0 | - | 0 | +5.80 |  |
| 07 Mar 22 - 11 Mar 22 | C | 1 | 0 | 1 | 0% | -0.57 | +5.23 | Wed short 16:00 close -0.57 |
| 14 Mar 22 - 18 Mar 22 | C | 0 | 0 | 0 | - | 0 | +5.23 |  |
| 21 Mar 22 - 25 Mar 22 | C | 0 | 0 | 0 | - | 0 | +5.23 |  |
| 28 Mar 22 - 01 Apr 22 | C | 0 | 0 | 0 | - | 0 | +5.23 |  |
| 04 Apr 22 - 08 Apr 22 | C | 1 | 0 | 1 | 0% | -0.47 | +4.76 | Wed long 16:00 close -0.47 |
| 11 Apr 22 - 15 Apr 22 | C | 2 | 1 | 1 | 50% | +0.17 | +4.93 | Mon long 16:00 close -0.68; Tue short target +0.85 |
| 18 Apr 22 - 22 Apr 22 | C | 1 | 1 | 0 | 100% | +1.18 | +6.11 | Thu short target +1.18 |
| 25 Apr 22 - 29 Apr 22 | C | 2 | 0 | 2 | 0% | -2.02 | +4.09 | Thu short stop -1.01; Fri long stop -1.01 (EARN) |
| 02 May 22 - 06 May 22 | C | 0 | 0 | 0 | - | 0 | +4.09 |  |
| 09 May 22 - 13 May 22 | C | 2 | 1 | 1 | 50% | -0.12 | +3.97 | Mon long stop -1.01; Tue short target +0.88 |
| 16 May 22 - 20 May 22 | C | 1 | 0 | 1 | 0% | -0.20 | +3.77 | Tue short 16:00 close -0.20 |
| 23 May 22 - 27 May 22 | C | 1 | 0 | 1 | 0% | -0.05 | +3.72 | Tue long 16:00 close -0.05 |
| 30 May 22 - 03 Jun 22 | C | 1 | 0 | 1 | 0% | -0.58 | +3.14 | Fri long 16:00 close -0.58; skipped: US holiday, day after a skipped day (2 d) |
| 06 Jun 22 - 10 Jun 22 | C | 2 | 1 | 1 | 50% | +0.06 | +3.20 | Mon short target +0.69; Fri long 16:00 close -0.63 |
| 13 Jun 22 - 17 Jun 22 | C | 2 | 0 | 2 | 0% | -1.57 | +1.63 | Mon long stop -1.01; Thu long 16:00 close -0.56 |
| 20 Jun 22 - 24 Jun 22 | C | 0 | 0 | 0 | - | 0 | +1.63 | skipped: US holiday, day after a skipped day (2 d) |
| 27 Jun 22 - 01 Jul 22 | C | 0 | 0 | 0 | - | 0 | +1.63 |  |
| 04 Jul 22 - 08 Jul 22 | C | 0 | 0 | 0 | - | 0 | +1.63 | skipped: US holiday, day after a skipped day (2 d) |
| 11 Jul 22 - 15 Jul 22 | C | 1 | 1 | 0 | 100% | +0.95 | +2.59 | Wed long target +0.95 |
| 18 Jul 22 - 22 Jul 22 | C | 1 | 0 | 1 | 0% | -1.01 | +1.58 | Tue short stop -1.01 |
| 25 Jul 22 - 29 Jul 22 | C | 1 | 0 | 1 | 0% | -1.01 | +0.57 | Wed short stop -1.01 (EARN) |
| 01 Aug 22 - 05 Aug 22 | C | 1 | 1 | 0 | 100% | +0.22 | +0.79 | Fri long 16:00 close +0.22 |
| 08 Aug 22 - 12 Aug 22 | C | 1 | 0 | 1 | 0% | -0.44 | +0.34 | Wed short 16:00 close -0.44 |
| 15 Aug 22 - 19 Aug 22 | C | 2 | 0 | 2 | 0% | -0.92 | -0.58 | Wed long 16:00 close -0.13; Fri long 16:00 close -0.79 |
| 22 Aug 22 - 26 Aug 22 | C | 1 | 0 | 1 | 0% | -1.01 | -1.59 | Mon long stop -1.01 |
| 29 Aug 22 - 02 Sep 22 | C | 4 | 3 | 1 | 75% | +0.89 | -0.70 | Mon long 16:00 close -0.46; Wed short target +0.34; Thu long target +0.81; Fri short target +0.21 |
| 05 Sep 22 - 09 Sep 22 | C | 0 | 0 | 0 | - | 0 | -0.70 | skipped: US holiday, day after a skipped day (2 d) |
| 12 Sep 22 - 16 Sep 22 | C | 2 | 1 | 1 | 50% | -0.47 | -1.17 | Tue long stop -1.01; Fri long 16:00 close +0.54 |
| 19 Sep 22 - 23 Sep 22 | C | 0 | 0 | 0 | - | 0 | -1.17 |  |
| 26 Sep 22 - 30 Sep 22 | C | 2 | 1 | 1 | 50% | +0.18 | -0.99 | Tue short target +1.19; Thu long stop -1.01 |
| 03 Oct 22 - 07 Oct 22 | C | 3 | 1 | 2 | 33% | -0.88 | -1.87 | Tue short 16:00 close -0.45; Wed long target +0.58; Fri long stop -1.01 |
| 10 Oct 22 - 14 Oct 22 | C | 1 | 1 | 0 | 100% | +1.57 | -0.30 | Thu long target +1.57 |
| 17 Oct 22 - 21 Oct 22 | C | 2 | 1 | 1 | 50% | +0.83 | +0.53 | Mon short 16:00 close -0.30; Tue short target +1.13 |
| 24 Oct 22 - 28 Oct 22 | C | 1 | 0 | 1 | 0% | -0.12 | +0.41 | Wed long 16:00 close -0.12 (EARN) |
| 31 Oct 22 - 04 Nov 22 | C | 1 | 1 | 0 | 100% | +0.67 | +1.08 | Fri short target +0.67 |
| 07 Nov 22 - 11 Nov 22 | C | 1 | 0 | 1 | 0% | -1.01 | +0.07 | Thu short stop -1.01 |
| 14 Nov 22 - 18 Nov 22 | C | 2 | 2 | 0 | 100% | +1.25 | +1.32 | Tue short 16:00 close +0.51; Thu long target +0.74 (EARN) |
| 21 Nov 22 - 25 Nov 22 | C | 0 | 0 | 0 | - | 0 | +1.32 | skipped: US holiday, early close (2 d) |
| 28 Nov 22 - 02 Dec 22 | C | 1 | 1 | 0 | 100% | +0.67 | +1.99 | Fri long 16:00 close +0.67; skipped: day after a skipped day (1 d) |
| 05 Dec 22 - 09 Dec 22 | C | 0 | 0 | 0 | - | 0 | +1.99 |  |
| 12 Dec 22 - 16 Dec 22 | C | 2 | 1 | 1 | 50% | +0.45 | +2.43 | Tue short 16:00 close +1.46; Thu long stop -1.01 |
| 19 Dec 22 - 23 Dec 22 | C | 1 | 0 | 1 | 0% | -1.01 | +1.42 | Thu long stop -1.01 |
| 26 Dec 22 - 30 Dec 22 | C | 1 | 1 | 0 | 100% | +0.49 | +1.91 | Fri long 16:00 close +0.49 |
| 02 Jan 23 - 06 Jan 23 | C | 0 | 0 | 0 | - | 0 | +1.91 |  |
| 09 Jan 23 - 13 Jan 23 | C | 0 | 0 | 0 | - | 0 | +1.91 |  |
| 16 Jan 23 - 20 Jan 23 | C | 0 | 0 | 0 | - | 0 | +1.91 | skipped: US holiday, day after a skipped day, missing price data (4 d) |
| 23 Jan 23 - 27 Jan 23 | C | 2 | 1 | 1 | 50% | +0.69 | +2.60 | Wed long 16:00 close +1.08 (EARN); Thu short 16:00 close -0.38 |
| 30 Jan 23 - 03 Feb 23 | C | 3 | 1 | 2 | 33% | -0.45 | +2.15 | Mon long 16:00 close -0.57; Thu short stop -1.01; Fri long target +1.13 (EARN) |
| 06 Feb 23 - 10 Feb 23 | C | 1 | 1 | 0 | 100% | +0.72 | +2.87 | Thu short target +0.72 |
| 13 Feb 23 - 17 Feb 23 | C | 1 | 0 | 1 | 0% | -0.30 | +2.57 | Thu long 16:00 close -0.30 |
| 20 Feb 23 - 24 Feb 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: US holiday, missing price data (5 d) |
| 27 Feb 23 - 03 Mar 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 06 Mar 23 - 10 Mar 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 13 Mar 23 - 17 Mar 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 20 Mar 23 - 24 Mar 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 27 Mar 23 - 31 Mar 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 03 Apr 23 - 07 Apr 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: US holiday, day after a skipped day, missing price data (5 d) |
| 10 Apr 23 - 14 Apr 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 17 Apr 23 - 21 Apr 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 24 Apr 23 - 28 Apr 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 01 May 23 - 05 May 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 08 May 23 - 12 May 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 15 May 23 - 19 May 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 22 May 23 - 26 May 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 29 May 23 - 02 Jun 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: US holiday, missing price data (5 d) |
| 05 Jun 23 - 09 Jun 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 12 Jun 23 - 16 Jun 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 19 Jun 23 - 23 Jun 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: US holiday, missing price data (5 d) |
| 26 Jun 23 - 30 Jun 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 03 Jul 23 - 07 Jul 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: early close, missing price data (4 d) |
| 10 Jul 23 - 14 Jul 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 17 Jul 23 - 21 Jul 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 24 Jul 23 - 28 Jul 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: missing price data (5 d) |
| 31 Jul 23 - 04 Aug 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: ATR warm-up, day after a skipped day (5 d) |
| 07 Aug 23 - 11 Aug 23 | C | 0 | 0 | 0 | - | 0 | +2.57 | skipped: ATR warm-up (5 d) |
| 14 Aug 23 - 18 Aug 23 | C | 1 | 1 | 0 | 100% | +0.87 | +3.44 | Fri long target +0.87 |
| 21 Aug 23 - 25 Aug 23 | C | 1 | 1 | 0 | 100% | +0.35 | +3.79 | Thu short target +0.35 (EARN) |
| 28 Aug 23 - 01 Sep 23 | C | 1 | 1 | 0 | 100% | +0.06 | +3.85 | Mon short 16:00 close +0.06 |
| 04 Sep 23 - 08 Sep 23 | C | 1 | 1 | 0 | 100% | +0.55 | +4.40 | Thu long 16:00 close +0.55; skipped: US holiday, day after a skipped day (2 d) |
| 11 Sep 23 - 15 Sep 23 | C | 1 | 0 | 1 | 0% | -0.28 | +4.11 | Mon short 16:00 close -0.28 |
| 18 Sep 23 - 22 Sep 23 | C | 1 | 0 | 1 | 0% | -1.00 | +3.12 | Thu long 16:00 close -1.00 |
| 25 Sep 23 - 29 Sep 23 | C | 2 | 1 | 1 | 50% | -0.01 | +3.11 | Tue long stop -1.02; Fri short target +1.01 |
| 02 Oct 23 - 06 Oct 23 | A | 2 | 1 | 1 | 50% | -0.40 | +2.71 | Tue long stop -1.01; Fri long target +0.61 (NFP) |
| 09 Oct 23 - 13 Oct 23 | A | 0 | 0 | 0 | - | 0 | +2.71 |  |
| 16 Oct 23 - 20 Oct 23 | A | 1 | 1 | 0 | 100% | +0.86 | +3.56 | Tue long target +0.86 |
| 23 Oct 23 - 27 Oct 23 | A | 0 | 0 | 0 | - | 0 | +3.56 |  |
| 30 Oct 23 - 03 Nov 23 | A | 1 | 0 | 1 | 0% | -0.47 | +3.10 | Thu short 16:00 close -0.47 |
| 06 Nov 23 - 10 Nov 23 | A | 0 | 0 | 0 | - | 0 | +3.10 |  |
| 13 Nov 23 - 17 Nov 23 | A | 1 | 0 | 1 | 0% | -0.35 | +2.75 | Tue short 16:00 close -0.35 (CPI) |
| 20 Nov 23 - 24 Nov 23 | A | 0 | 0 | 0 | - | 0 | +2.75 | skipped: US holiday, early close (2 d) |
| 27 Nov 23 - 01 Dec 23 | A | 1 | 1 | 0 | 100% | +1.15 | +3.91 | Wed short target +1.15; skipped: day after a skipped day (1 d) |
| 04 Dec 23 - 08 Dec 23 | A | 4 | 2 | 2 | 50% | -0.46 | +3.45 | Mon long stop -1.02; Tue long target +0.69; Wed short target +0.47; Thu short 16:00 close -0.59 |
| 11 Dec 23 - 15 Dec 23 | A | 0 | 0 | 0 | - | 0 | +3.45 |  |
| 18 Dec 23 - 22 Dec 23 | A | 1 | 0 | 1 | 0% | -0.15 | +3.30 | Thu short 16:00 close -0.15 |
| 25 Dec 23 - 29 Dec 23 | A | 0 | 0 | 0 | - | 0 | +3.30 |  |
| 01 Jan 24 - 05 Jan 24 | A | 3 | 1 | 2 | 33% | -1.15 | +2.14 | Tue long stop -1.02; Wed long 16:00 close -0.59; Thu long target +0.45 |
| 08 Jan 24 - 12 Jan 24 | A | 1 | 1 | 0 | 100% | +0.72 | +2.86 | Tue long target +0.72 |
| 15 Jan 24 - 19 Jan 24 | A | 2 | 1 | 1 | 50% | +0.32 | +3.18 | Wed long 16:00 close +0.84; Thu short 16:00 close -0.52; skipped: US holiday, day after a skipped day (2 d) |
| 22 Jan 24 - 26 Jan 24 | A | 1 | 1 | 0 | 100% | +0.22 | +3.40 | Wed short 16:00 close +0.22 |
| 29 Jan 24 - 02 Feb 24 | A | 1 | 0 | 1 | 0% | -1.01 | +2.38 | Wed long stop -1.01 (FOMC+EARN) |
| 05 Feb 24 - 09 Feb 24 | A | 1 | 0 | 1 | 0% | -0.61 | +1.77 | Wed short 16:00 close -0.61 |
| 12 Feb 24 - 16 Feb 24 | A | 2 | 1 | 1 | 50% | -0.21 | +1.56 | Tue long 16:00 close +0.39 (CPI); Wed short 16:00 close -0.60 |
| 19 Feb 24 - 23 Feb 24 | A | 2 | 1 | 1 | 50% | -0.78 | +0.78 | Wed long 16:00 close +0.23; Thu short stop -1.01 (EARN); skipped: US holiday, day after a skipped day (2 d) |
| 26 Feb 24 - 01 Mar 24 | A | 2 | 1 | 1 | 50% | +0.97 | +1.75 | Wed long 16:00 close -0.05; Thu short target +1.02 |
| 04 Mar 24 - 08 Mar 24 | A | 3 | 1 | 2 | 33% | -1.67 | +0.08 | Tue long stop -1.01; Wed short 16:00 close +0.36; Thu short stop -1.01 |
| 11 Mar 24 - 15 Mar 24 | A | 1 | 0 | 1 | 0% | -0.59 | -0.51 | Fri long 16:00 close -0.59 |
| 18 Mar 24 - 22 Mar 24 | A | 2 | 2 | 0 | 100% | +1.15 | +0.64 | Mon short 16:00 close +0.58; Thu short 16:00 close +0.57 |
| 25 Mar 24 - 29 Mar 24 | A | 1 | 1 | 0 | 100% | +0.48 | +1.12 | Wed short target +0.48 |
| 01 Apr 24 - 05 Apr 24 | A | 3 | 3 | 0 | 100% | +2.30 | +3.43 | Tue long 16:00 close +0.48; Wed long target +0.48; Thu short target +1.34 |
| 08 Apr 24 - 12 Apr 24 | A | 2 | 1 | 1 | 50% | -0.75 | +2.68 | Wed long 16:00 close +0.26 (CPI); Fri long stop -1.01 |
| 15 Apr 24 - 19 Apr 24 | A | 1 | 1 | 0 | 100% | +0.54 | +3.21 | Mon short target +0.54 |
| 22 Apr 24 - 26 Apr 24 | A | 1 | 1 | 0 | 100% | +1.32 | +4.54 | Thu long 16:00 close +1.32 |
| 29 Apr 24 - 03 May 24 | A | 2 | 1 | 1 | 50% | +0.29 | +4.83 | Thu short target +0.56; Fri short 16:00 close -0.27 (NFP+EARN) |
| 06 May 24 - 10 May 24 | A | 0 | 0 | 0 | - | 0 | +4.83 |  |
| 13 May 24 - 17 May 24 | A | 0 | 0 | 0 | - | 0 | +4.83 |  |
| 20 May 24 - 24 May 24 | A | 1 | 1 | 0 | 100% | +1.32 | +6.15 | Thu short target +1.32 (EARN) |
| 27 May 24 - 31 May 24 | A | 1 | 1 | 0 | 100% | +0.09 | +6.24 | Wed long 16:00 close +0.09; skipped: US holiday, day after a skipped day (2 d) |
| 03 Jun 24 - 07 Jun 24 | A | 2 | 1 | 1 | 50% | -0.12 | +6.12 | Mon short target +0.89; Wed short stop -1.01 |
| 10 Jun 24 - 14 Jun 24 | A | 2 | 1 | 1 | 50% | -0.15 | +5.97 | Wed short 16:00 close -0.35 (CPI+FOMC); Thu short 16:00 close +0.20 (PPI) |
| 17 Jun 24 - 21 Jun 24 | A | 0 | 0 | 0 | - | 0 | +5.97 | skipped: US holiday, day after a skipped day (2 d) |
| 24 Jun 24 - 28 Jun 24 | A | 0 | 0 | 0 | - | 0 | +5.97 |  |
| 01 Jul 24 - 05 Jul 24 | A | 0 | 0 | 0 | - | 0 | +5.97 | skipped: US holiday, day after a skipped day, early close (3 d) |
| 08 Jul 24 - 12 Jul 24 | A | 0 | 0 | 0 | - | 0 | +5.97 |  |
| 15 Jul 24 - 19 Jul 24 | A | 2 | 1 | 1 | 50% | -0.47 | +5.49 | Wed long stop -1.01; Thu short target +0.54 |
| 22 Jul 24 - 26 Jul 24 | A | 3 | 0 | 3 | 0% | -1.83 | +3.66 | Mon short 16:00 close -0.43; Wed long stop -1.01 (EARN); Fri short 16:00 close -0.39 |
| 29 Jul 24 - 02 Aug 24 | A | 2 | 1 | 1 | 50% | -0.94 | +2.72 | Wed short stop -1.01 (FOMC+EARN); Fri long 16:00 close +0.07 (NFP+EARN) |
| 05 Aug 24 - 09 Aug 24 | A | 3 | 2 | 1 | 67% | +1.48 | +4.20 | Mon long 16:00 close +1.43; Wed short target +1.06; Thu short stop -1.01 |
| 12 Aug 24 - 16 Aug 24 | A | 1 | 0 | 1 | 0% | -0.64 | +3.56 | Thu short 16:00 close -0.64; skipped: day after a skipped day, missing price data (2 d) |
| 19 Aug 24 - 23 Aug 24 | A | 0 | 0 | 0 | - | 0 | +3.56 |  |
| 26 Aug 24 - 30 Aug 24 | A | 1 | 1 | 0 | 100% | +0.68 | +4.25 | Fri short target +0.68 |
| 02 Sep 24 - 06 Sep 24 | A | 0 | 0 | 0 | - | 0 | +4.25 | skipped: US holiday, day after a skipped day (2 d) |
| 09 Sep 24 - 13 Sep 24 | A | 1 | 0 | 1 | 0% | -0.15 | +4.09 | Mon short 16:00 close -0.15 |
| 16 Sep 24 - 20 Sep 24 | A | 1 | 0 | 1 | 0% | -0.20 | +3.89 | Thu short 16:00 close -0.20 |
| 23 Sep 24 - 27 Sep 24 | A | 1 | 1 | 0 | 100% | +1.13 | +5.02 | Thu short target +1.13 |
| 30 Sep 24 - 04 Oct 24 | A/Y1 | 1 | 0 | 1 | 0% | -0.06 | +4.97 | Fri short 16:00 close -0.06 (NFP) |
| 07 Oct 24 - 11 Oct 24 | Y1 | 0 | 0 | 0 | - | 0 | +4.97 |  |
| 14 Oct 24 - 18 Oct 24 | Y1 | 1 | 1 | 0 | 100% | +0.61 | +5.58 | Thu short 16:00 close +0.61 |
| 21 Oct 24 - 25 Oct 24 | Y1 | 1 | 1 | 0 | 100% | +0.70 | +6.28 | Tue long target +0.70; skipped: day after a skipped day, missing price data (2 d) |
| 28 Oct 24 - 01 Nov 24 | Y1 | 1 | 0 | 1 | 0% | -1.01 | +5.26 | Thu long stop -1.01 (EARN); skipped: day after a skipped day, missing price data (2 d) |
| 04 Nov 24 - 08 Nov 24 | Y1 | 1 | 0 | 1 | 0% | -1.01 | +4.25 | Wed short stop -1.01 |
| 11 Nov 24 - 15 Nov 24 | Y1 | 0 | 0 | 0 | - | 0 | +4.25 | skipped: day after a skipped day, missing price data (2 d) |
| 18 Nov 24 - 22 Nov 24 | Y1 | 1 | 1 | 0 | 100% | +0.22 | +4.48 | Thu short target +0.22 (EARN) |
| 25 Nov 24 - 29 Nov 24 | Y1 | 1 | 1 | 0 | 100% | +0.84 | +5.31 | Mon short target +0.84; skipped: US holiday, early close (2 d) |
| 02 Dec 24 - 06 Dec 24 | Y1 | 1 | 0 | 1 | 0% | -0.67 | +4.64 | Wed short 16:00 close -0.67; skipped: day after a skipped day (1 d) |
| 09 Dec 24 - 13 Dec 24 | Y1 | 2 | 1 | 1 | 50% | -0.92 | +3.72 | Wed short stop -1.01 (CPI); Fri short 16:00 close +0.10 |
| 16 Dec 24 - 20 Dec 24 | Y1 | 3 | 2 | 1 | 67% | +0.84 | +4.57 | Mon short stop -1.01; Thu short target +0.97; Fri long target +0.88 |
| 23 Dec 24 - 27 Dec 24 | Y1 | 0 | 0 | 0 | - | 0 | +4.57 | skipped: day after a skipped day, early close (2 d) |
| 30 Dec 24 - 03 Jan 25 | Y1 | 1 | 1 | 0 | 100% | +0.26 | +4.83 | Mon long 16:00 close +0.26 |
| 06 Jan 25 - 10 Jan 25 | Y1 | 1 | 1 | 0 | 100% | +0.08 | +4.90 | Mon short 16:00 close +0.08; skipped: US holiday, day after a skipped day (2 d) |
| 13 Jan 25 - 17 Jan 25 | Y1 | 3 | 1 | 2 | 33% | +0.01 | +4.92 | Mon long 16:00 close +0.71; Wed short 16:00 close -0.50 (CPI); Fri short 16:00 close -0.19 |
| 20 Jan 25 - 24 Jan 25 | Y1 | 1 | 0 | 1 | 0% | -0.15 | +4.77 | Wed short 16:00 close -0.15; skipped: US holiday, day after a skipped day (2 d) |
| 27 Jan 25 - 31 Jan 25 | Y1 | 2 | 2 | 0 | 100% | +1.07 | +5.84 | Mon long 16:00 close +0.11; Fri short target +0.95 (EARN) |
| 03 Feb 25 - 07 Feb 25 | Y1 | 1 | 1 | 0 | 100% | +0.86 | +6.69 | Mon long 16:00 close +0.86 |
| 10 Feb 25 - 14 Feb 25 | Y1 | 2 | 1 | 1 | 50% | +0.50 | +7.19 | Mon short 16:00 close -0.40; Wed long target +0.90 (CPI) |
| 17 Feb 25 - 21 Feb 25 | Y1 | 0 | 0 | 0 | - | 0 | +7.19 | skipped: US holiday, day after a skipped day (2 d) |
| 24 Feb 25 - 28 Feb 25 | Y1 | 1 | 1 | 0 | 100% | +0.74 | +7.93 | Thu short target +0.74 (EARN) |
| 03 Mar 25 - 07 Mar 25 | Y1 | 1 | 0 | 1 | 0% | -0.61 | +7.32 | Thu long 16:00 close -0.61 |
| 10 Mar 25 - 14 Mar 25 | Y1 | 2 | 1 | 1 | 50% | -0.68 | +6.64 | Mon long stop -1.01; Wed short 16:00 close +0.32 (CPI) |
| 17 Mar 25 - 21 Mar 25 | Y1 | 0 | 0 | 0 | - | 0 | +6.64 |  |
| 24 Mar 25 - 28 Mar 25 | Y1 | 1 | 0 | 1 | 0% | -0.39 | +6.25 | Mon short 16:00 close -0.39 |
| 31 Mar 25 - 04 Apr 25 | Y1 | 4 | 2 | 2 | 50% | +0.39 | +6.64 | Mon long target +1.69; Wed long target +0.72; Thu long stop -1.01; Fri long stop -1.01 (NFP) |
| 07 Apr 25 - 11 Apr 25 | Y1 | 3 | 2 | 1 | 67% | +3.15 | +9.79 | Mon long target +2.45; Tue short target +1.70; Thu long stop -1.00 (CPI) |
| 14 Apr 25 - 18 Apr 25 | Y1 | 1 | 1 | 0 | 100% | +0.62 | +10.41 | Mon short target +0.62 |
| 21 Apr 25 - 25 Apr 25 | Y1 | 1 | 1 | 0 | 100% | +0.33 | +10.74 | Wed short 16:00 close +0.33 |
| 28 Apr 25 - 02 May 25 | Y1 | 3 | 2 | 1 | 67% | +0.65 | +11.38 | Wed long target +0.76; Thu short 16:00 close +0.18 (EARN); Fri short 16:00 close -0.29 (NFP+EARN) |
| 05 May 25 - 09 May 25 | Y1 | 2 | 1 | 1 | 50% | -0.01 | +11.38 | Tue long 16:00 close +0.13; Thu short 16:00 close -0.14 |
| 12 May 25 - 16 May 25 | Y1 | 1 | 0 | 1 | 0% | -0.49 | +10.88 | Mon short 16:00 close -0.49 |
| 19 May 25 - 23 May 25 | Y1 | 3 | 3 | 0 | 100% | +2.05 | +12.93 | Mon long target +1.10; Wed long target +0.60; Fri long 16:00 close +0.35 |
| 26 May 25 - 30 May 25 | Y1 | 1 | 1 | 0 | 100% | +1.16 | +14.09 | Thu short target +1.16 (EARN); skipped: US holiday, day after a skipped day (2 d) |
| 02 Jun 25 - 06 Jun 25 | Y1 | 1 | 0 | 1 | 0% | -0.05 | +14.04 | Fri short 16:00 close -0.05 (NFP) |
| 09 Jun 25 - 13 Jun 25 | Y1 | 1 | 0 | 1 | 0% | -0.57 | +13.48 | Fri long 16:00 close -0.57 |
| 16 Jun 25 - 20 Jun 25 | Y1 | 1 | 0 | 1 | 0% | -0.53 | +12.95 | Mon short 16:00 close -0.53; skipped: US holiday, day after a skipped day (2 d) |
| 23 Jun 25 - 27 Jun 25 | Y1 | 1 | 0 | 1 | 0% | -0.58 | +12.36 | Tue short 16:00 close -0.58 |
| 30 Jun 25 - 04 Jul 25 | Y1 | 0 | 0 | 0 | - | 0 | +12.36 | skipped: US holiday, early close (2 d) |
| 07 Jul 25 - 11 Jul 25 | Y1 | 0 | 0 | 0 | - | 0 | +12.36 | skipped: day after a skipped day (1 d) |
| 14 Jul 25 - 18 Jul 25 | Y1 | 1 | 1 | 0 | 100% | +0.74 | +13.10 | Tue short 16:00 close +0.74 (CPI) |
| 21 Jul 25 - 25 Jul 25 | Y1 | 0 | 0 | 0 | - | 0 | +13.10 |  |
| 28 Jul 25 - 01 Aug 25 | Y1 | 3 | 2 | 1 | 67% | +1.41 | +14.51 | Tue short target +1.04; Thu short target +1.39 (EARN); Fri long stop -1.02 (NFP+EARN) |
| 04 Aug 25 - 08 Aug 25 | Y1 | 2 | 1 | 1 | 50% | +0.14 | +14.65 | Mon short stop -1.01; Thu short target +1.16 |
| 11 Aug 25 - 15 Aug 25 | Y1 | 0 | 0 | 0 | - | 0 | +14.65 |  |
| 18 Aug 25 - 22 Aug 25 | Y1 | 0 | 0 | 0 | - | 0 | +14.65 |  |
| 25 Aug 25 - 29 Aug 25 | Y1 | 0 | 0 | 0 | - | 0 | +14.65 |  |
| 01 Sep 25 - 05 Sep 25 | Y1 | 2 | 1 | 1 | 50% | +0.67 | +15.32 | Wed short 16:00 close -0.31; Fri short target +0.98 (NFP); skipped: US holiday, day after a skipped day (2 d) |
| 08 Sep 25 - 12 Sep 25 | Y1 | 1 | 1 | 0 | 100% | +0.54 | +15.87 | Wed short target +0.54 (PPI) |
| 15 Sep 25 - 19 Sep 25 | Y1 | 1 | 1 | 0 | 100% | +0.00 | +15.87 | Thu short 16:00 close +0.00 |
| 22 Sep 25 - 26 Sep 25 | Y1 | 1 | 1 | 0 | 100% | +0.73 | +16.60 | Thu long 16:00 close +0.73 |
| 29 Sep 25 - 03 Oct 25 | Y1/Y2 | 3 | 3 | 0 | 100% | +1.40 | +18.00 | Mon short 16:00 close +0.23; Wed long target +0.50; Thu short target +0.66 |
| 06 Oct 25 - 10 Oct 25 | Y2 | 1 | 0 | 1 | 0% | -0.11 | +17.89 | Mon short 16:00 close -0.11 |
| 13 Oct 25 - 17 Oct 25 | Y2 | 3 | 2 | 1 | 67% | +1.86 | +19.74 | Mon short 16:00 close -0.76; Tue long target +1.70; Wed short target +0.91 |
| 20 Oct 25 - 24 Oct 25 | Y2 | 1 | 0 | 1 | 0% | -0.07 | +19.67 | Fri short 16:00 close -0.07 (CPI) |
| 27 Oct 25 - 31 Oct 25 | Y2 | 2 | 1 | 1 | 50% | +0.18 | +19.85 | Mon short 16:00 close -0.50; Fri short 16:00 close +0.67 (EARN) |
| 03 Nov 25 - 07 Nov 25 | Y2 | 2 | 1 | 1 | 50% | +0.05 | +19.90 | Mon short 16:00 close +0.48; Tue long 16:00 close -0.43 |
| 10 Nov 25 - 14 Nov 25 | Y2 | 2 | 1 | 1 | 50% | +1.28 | +21.18 | Mon short 16:00 close -0.64; Fri long target +1.92 |
| 17 Nov 25 - 21 Nov 25 | Y2 | 1 | 1 | 0 | 100% | +1.53 | +22.71 | Thu short target +1.53 (NFP+EARN) |
| 24 Nov 25 - 28 Nov 25 | Y2 | 0 | 0 | 0 | - | 0 | +22.71 | skipped: US holiday, early close (2 d) |
| 01 Dec 25 - 05 Dec 25 | Y2 | 0 | 0 | 0 | - | 0 | +22.71 | skipped: day after a skipped day (1 d) |
| 08 Dec 25 - 12 Dec 25 | Y2 | 1 | 0 | 1 | 0% | -1.01 | +21.70 | Fri long stop -1.01 |
| 15 Dec 25 - 19 Dec 25 | Y2 | 2 | 2 | 0 | 100% | +0.58 | +22.28 | Mon short target +0.47; Thu short 16:00 close +0.10 (CPI) |
| 22 Dec 25 - 26 Dec 25 | Y2 | 1 | 1 | 0 | 100% | +0.06 | +22.34 | Mon short 16:00 close +0.06; skipped: day after a skipped day, early close (2 d) |
| 29 Dec 25 - 02 Jan 26 | Y2 | 2 | 2 | 0 | 100% | +1.23 | +23.57 | Mon long 16:00 close +0.09; Fri short target +1.14 |
| 05 Jan 26 - 09 Jan 26 | Y2 | 1 | 1 | 0 | 100% | +0.02 | +23.58 | Mon short 16:00 close +0.02 |
| 12 Jan 26 - 16 Jan 26 | Y2 | 4 | 3 | 1 | 75% | +1.14 | +24.72 | Mon long target +0.40; Wed long stop -1.01 (PPI); Thu short 16:00 close +0.92; Fri short target +0.82 |
| 19 Jan 26 - 23 Jan 26 | Y2 | 1 | 1 | 0 | 100% | +0.01 | +24.73 | Thu short 16:00 close +0.01; skipped: US holiday, day after a skipped day (2 d) |
| 26 Jan 26 - 30 Jan 26 | Y2 | 1 | 1 | 0 | 100% | +0.44 | +25.17 | Wed short 16:00 close +0.44 (FOMC) |
| 02 Feb 26 - 06 Feb 26 | Y2 | 1 | 0 | 1 | 0% | -0.63 | +24.55 | Thu long 16:00 close -0.63 (EARN) |
| 09 Feb 26 - 13 Feb 26 | Y2 | 1 | 1 | 0 | 100% | +0.57 | +25.12 | Wed short target +0.57 (NFP) |
| 16 Feb 26 - 20 Feb 26 | Y2 | 0 | 0 | 0 | - | 0 | +25.12 | skipped: US holiday, day after a skipped day (2 d) |
| 23 Feb 26 - 27 Feb 26 | Y2 | 1 | 1 | 0 | 100% | +0.39 | +25.51 | Fri long 16:00 close +0.39 (PPI) |
| 02 Mar 26 - 06 Mar 26 | Y2 | 3 | 2 | 1 | 67% | +1.19 | +26.70 | Mon long target +0.56; Tue long 16:00 close +0.77; Fri long 16:00 close -0.14 (NFP) |
| 09 Mar 26 - 13 Mar 26 | Y2 | 1 | 1 | 0 | 100% | +0.67 | +27.37 | Mon long target +0.67; skipped: day after a skipped day, missing price data (2 d) |
| 16 Mar 26 - 20 Mar 26 | Y2 | 2 | 2 | 0 | 100% | +1.13 | +28.51 | Mon short 16:00 close +0.08; Thu long target +1.05 |
| 23 Mar 26 - 27 Mar 26 | Y2 | 3 | 2 | 1 | 67% | -0.42 | +28.09 | Mon short 16:00 close +0.24; Wed short 16:00 close +0.34; Thu long stop -1.01 |
| 30 Mar 26 - 03 Apr 26 | Y2 | 3 | 2 | 1 | 67% | +1.07 | +29.16 | Mon short target +0.65; Tue short stop -1.06; Thu long target +1.48 |
| 06 Apr 26 - 10 Apr 26 | Y2 | 1 | 1 | 0 | 100% | +0.27 | +29.43 | Wed short 16:00 close +0.27 |
| 13 Apr 26 - 17 Apr 26 | Y2 | 1 | 0 | 1 | 0% | -0.49 | +28.93 | Fri short 16:00 close -0.49 |
| 20 Apr 26 - 24 Apr 26 | Y2 | 2 | 0 | 2 | 0% | -1.87 | +27.06 | Wed short stop -1.01; Fri short 16:00 close -0.86 |
| 27 Apr 26 - 01 May 26 | Y2 | 2 | 2 | 0 | 100% | +0.17 | +27.23 | Tue long 16:00 close +0.11; Thu short target +0.06 (EARN) |
| 04 May 26 - 08 May 26 | Y2 | 3 | 0 | 3 | 0% | -2.48 | +24.75 | Tue short 16:00 close -0.46; Wed short stop -1.01; Fri short stop -1.01 (NFP) |
| 11 May 26 - 15 May 26 | Y2 | 2 | 0 | 2 | 0% | -1.10 | +23.66 | Tue long stop -1.01 (CPI); Fri long 16:00 close -0.09 |
| 18 May 26 - 22 May 26 | Y2 | 1 | 0 | 1 | 0% | -1.01 | +22.65 | Tue long stop -1.01 |
| 25 May 26 - 29 May 26 | Y2 | 0 | 0 | 0 | - | 0 | +22.65 | skipped: US holiday, day after a skipped day (2 d) |
| 01 Jun 26 - 05 Jun 26 | Y2 | 2 | 1 | 1 | 50% | -0.54 | +22.11 | Thu long 16:00 close +0.46; Fri long stop -1.01 (NFP) |
| 08 Jun 26 - 12 Jun 26 | Y2 | 3 | 2 | 1 | 67% | +0.57 | +22.67 | Mon short stop -1.01; Tue short target +0.65; Wed long target +0.92 (CPI) |
| 15 Jun 26 - 19 Jun 26 | Y2 | 2 | 0 | 2 | 0% | -0.96 | +21.72 | Mon short 16:00 close -0.48; Thu short 16:00 close -0.47; skipped: US holiday (1 d) |
| 22 Jun 26 - 26 Jun 26 | Y2 | 3 | 2 | 1 | 67% | +1.12 | +22.84 | Tue long 16:00 close -0.24; Thu short target +1.05; Fri long 16:00 close +0.31; skipped: day after a skipped day (1 d) |
| 29 Jun 26 - 03 Jul 26 | Y2/B | 0 | 0 | 0 | - | 0 | +22.84 | skipped: US holiday (1 d) |
| 06 Jul 26 - 10 Jul 26 | B | 2 | 0 | 2 | 0% | -0.72 | +22.12 | Tue long 16:00 close -0.32; Thu short 16:00 close -0.40; skipped: day after a skipped day (1 d) |
| 13 Jul 26 - 17 Jul 26 | B | 3 | 1 | 2 | 33% | -0.06 | +22.06 | Mon long 16:00 close -0.44; Tue short 16:00 close -0.24 (CPI); Fri long 16:00 close +0.61 |
| 20 Jul 26 - 24 Jul 26 | B | 3 | 1 | 2 | 33% | +0.15 | +22.21 | Mon short 16:00 close +0.99; Tue short 16:00 close -0.48; Thu long 16:00 close -0.37 (EARN) |
| 27 Jul 26 - 31 Jul 26 | B | 4 | 3 | 1 | 75% | +1.19 | +23.40 | Mon short target +0.79; Tue long 16:00 close +0.11; Thu short stop -1.01 (EARN); Fri short target +1.29 (EARN) |
| 03 Aug 26 - 07 Aug 26 | B | 2 | 1 | 1 | 50% | -0.19 | +23.21 | Tue short stop -1.01; Thu long target +0.81 |
| 10 Aug 26 - 14 Aug 26 | B | 1 | 1 | 0 | 100% | +0.06 | +23.26 | Wed short 16:00 close +0.06 (CPI) |
| 17 Aug 26 - 21 Aug 26 | B | 1 | 0 | 1 | 0% | -0.31 | +22.96 | Tue long 16:00 close -0.31 |
| 24 Aug 26 - 28 Aug 26 | B | 2 | 1 | 1 | 50% | -0.57 | +22.38 | Tue short 16:00 close +0.44; Thu short stop -1.01 (EARN) |
| 31 Aug 26 - 04 Sep 26 | B | 1 | 1 | 0 | 100% | +0.13 | +22.52 | Tue long 16:00 close +0.13 |
| 07 Sep 26 - 11 Sep 26 | B | 2 | 2 | 0 | 100% | +0.35 | +22.87 | Thu long 16:00 close +0.18 (PPI); Fri short 16:00 close +0.17 (CPI); skipped: US holiday, day after a skipped day (2 d) |
| 14 Sep 26 - 18 Sep 26 | B | 3 | 2 | 1 | 67% | +1.65 | +24.52 | Mon long 16:00 close +1.30; Wed short target +0.78 (FOMC); Thu short 16:00 close -0.43 |
| 21 Sep 26 - 25 Sep 26 | B | 2 | 1 | 1 | 50% | -0.04 | +24.48 | Mon short stop -1.01; Thu long target +0.97; skipped: no price data (1 d) |
| 28 Sep 26 - 02 Oct 26 | B | 0 | 0 | 0 | - | 0 | +24.48 | skipped: day after a skipped day, no price data (2 d) |

## Summary in plain words

**Totals (2.0 points cost), 297 trades over 5 years, +24.5 R.** But almost all of that comes from the two years the rules were
designed on. In the three periods nobody had seen, the strategy only just broke even:

| Period | Trades | Win rate | Total | Average per trade | Without its 3 best trades |
|---|---|---|---|---|---|
| **C, hidden (Oct 21 – Sep 23)** | 80 | 48.8% | **+3.1 R** | +0.04 R | **−1.4 R** |
| **A, hidden (Oct 23 – Sep 24)** | 63 | 52.4% | **+1.9 R** | +0.03 R | **−2.2 R** |
| Y1, design | 64 | 59.4% | +11.8 R | +0.18 R | +6.0 R |
| Y2, design | 64 | 59.4% | +6.0 R | +0.09 R | +0.9 R |
| **B, hidden (Jul – Sep 26)** | 26 | 53.8% | **+1.6 R** | +0.06 R | **−1.9 R** |
| **All unseen (C + A + B)** | 169 | 50.9% | **+6.7 R** | +0.04 R | +2.2 R |

**What worked:** it never lost much. Every period ended slightly positive, the longest losing run was 6 trades, and the worst
drop from a peak was about 8 R (8% of the account). Costs hardly matter.

**What did not work:**
- On unseen data the profit per trade (+0.04 R) is so small that it could easily be luck: about a 1 in 4 chance there is no edge at all.
- Every unseen period goes negative without its 3 best trades.
- Buying after a gap down made nothing on unseen data (84 trades, +0.1 R), and lost in the 2022 bear market (39 trades, −2.9 R).
- 2022 Q2 and Q3 lost 6.2 R together. The gains came mostly from Oct – Nov 2021 and Oct – Dec 2022.
- Half of all trades end at 16:00 with nothing gained (151 trades, −3.9 R over 5 years).

**Update 10 Oct 2026 (hidden 2016-2018, H):** +4.34 R on 81 trades (+0.05 R per trade); only 2018 made money. All unseen data together
(H + C + A + B): 250 trades, +11.0 R, +0.04 R per trade; shorts about zero. The owner's document stays grade B (see `FINAL-STRATEGY.md`).

**What is being changed:** v1 is dropped. It is not handed to the owner. The next market in the plan is EURUSD.

**What to watch next week:** nothing to trade from this strategy.

*Past results do not guarantee future results.*
