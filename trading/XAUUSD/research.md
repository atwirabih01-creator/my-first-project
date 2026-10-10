# ROUND 3 research (10 Oct 2026), 8 years of design data (Jan 2019 – Sep 2026)
Full register of the 82 pre-declared checks with results: `round3/TESTS_DECLARED.md` (code and outputs in `round3/`). Key facts, per calendar year:
- **Scale:** median daily range 13.5 USD in 2019 (0.96% of price) → 103 USD in 2026 (2.29%). The 0.40 USD cost is 3.0% of a day's range in 2019, 0.4% in 2026.
- **When gold moves:** 08:00–11:00 NY is the busiest block every year (each hour ≈ 0.30–0.40 of the day's range); 18:00–19:00 and 23:00–00:00 NY are the quietest.
  No hour has a direction that holds every year (the 18:00 NY "rise" is the bid-only reopen spread).
- **London's first break of the Asia box (00:00–06:59 London) is followed through** by +3.7% of ATR on average (break to 16:00 NY), positive in 6 of 8 years,
  longs and shorts both positive. Fading it loses in every mood measure tried.
- **Unlike GBPUSD, a quiet Asia night is NOT a good sign on gold:** boxes < 0.7× normal gave +2.0% ATR with 2019 at −11%; boxes > 1.3× normal gave +9.4% (7/8 years).
- **News days:** price-defined 08:30 NY shocks: follow/fade flips by year; 10:00 NY shocks continue to 16:00 NY in 7/8 years (+3.6% ATR, ~24 a year);
  14:00 NY (FOMC) shocks partly reverse by 16:00 (6/8 years, +2.4% ATR). The direction of a US news shock is unrelated to London's earlier break (49.5% same way).
- **Cross-market:** the dollar (EURUSD) and the Nasdaq do not lead gold intraday in any stable way (all < 1% ATR or flipping by year).
- **Fixes, COMEX open, Shanghai, month-end:** nothing stable and large enough (all |edge| < 1% ATR or < 6/8 years).
- **Bad conditions:** Oct 2022 – Feb 2023 and 2022 generally (falling, choppier gold); the break follow-through was weakest there.

---

# XAUUSD (gold) research (Agent 1), round 1

**Data used:** HistData 1-minute bid prices (UTC, already correct; no clock fix applied), **design period only: 1 Oct 2024 to 30 Jun 2026 (21 months)**.
`research/common.py` drops every row outside the design period as each chunk is read, and asserts that nothing from hidden test A
(Oct 2023 – Sep 2024) or hidden test B (Jul 2026 onward) survives. Neither hidden period was loaded or looked at.

**Two design years**, compared throughout. A finding counts only if it shows in **both** years.
- **Y1** = Oct 2024 – Sep 2025. Gold rose strongly: 2,662 → 3,857 USD (+45%). Average day range **48.8 USD = 1.57% of price**.
- **Y2** = Oct 2025 – Jun 2026. Up to 5,372 (early Mar 2026), then down to 4,007. Much wilder: average day range **125.2 USD = 2.73%**.
Because the price level and volatility changed so much, sizes are shown in **dollars, % of price, and "x ATR"**
(ATR = average day range of the previous 14 full days; 1.0 x ATR = a normal full day).

**Gold's day:** trading day = 17:00 New York to 17:00 New York. Gold trades 18:00 → 16:59 NY (1-hour daily break 17:00–18:00 NY),
1,380 one-minute bars on a normal day. Sunday bars belong to Monday. **Usable days:** 416 (239 in Y1, 177 in Y2).
Days with fewer than 1,300 bars are thin and are removed, together with the day after each: 1 Oct 2024 (partial start), US holiday early
closes (28–29 Nov 2024, 24 Dec 2024, 20 Jan, 17 Feb, 26 May, 19 Jun, 4 Jul, 1 Sep 2025, 27–28 Nov 2025, 24 Dec 2025, 19 Jan, 16 Feb, 25 May,
19 Jun 2026) and a data gap on 5 Dec 2025 (prices stop at 10:59 NY). Gold is closed on 25 Dec and 1 Jan.
**Times:** Doha = New York + 7 h in US summer time (2nd Sunday of March → 1st Sunday of November), + 8 h in US winter time.
London-clock times: Doha = London + 2 h (UK summer time, last Sunday of March → last Sunday of October), + 3 h (UK winter).
Scripts and outputs: `trading/XAUUSD/research/` (see its README).

---

## A. Summary: what held in both years and what did not

| Finding | Y1 | Y2 | Holds? |
|---|---|---|---|
| Busiest hours are 08:00–11:00 NY (09:00 and 10:00 NY the peak) | 0.29–0.33 x ATR per hour | 0.27–0.33 | **Yes** |
| Quietest hours 15:00–16:00 NY and 23:00–00:00 NY | 0.11–0.15 | 0.13–0.18 | **Yes** |
| NY morning 08:00–12:00 is the biggest session (0.6 x ATR) | 0.62 | 0.61 | **Yes** |
| Asia breaks hold more than on GBPUSD: return to the Asia middle after the first break | 55% | 49% | **Yes** (GBPUSD: 70–77%) |
| Day closes beyond the side London broke first | 56% | 54% | **Yes (mild)** |
| **Fading a London break of the Asia range loses** (test A2) | −39.3 R | −18.5 R | **Yes, strongly** |
| **Going with the London break makes money** (tests A1, A1a, A1b) | +12 to +42 R | +15 to +22 R | **Yes** |
| Earlier move → later move: same direction more often than not (day open→10:00 → 10:00–16:00) | 55% follow | 53% | **Yes (weak)** |
| Overnight direction (18:00→08:00 NY) continues 08:00→16:00 NY | 54%, +0.04 x ATR | 56%, +0.05 x ATR | **Yes (weak)**, mostly on news days |
| Big days start in the evening/Asia session (not in NY) | 42 of 52 | 43 of 50 | **Yes** |
| Big days follow a wider Asia range | 0.70 vs 0.44 x ATR | 0.82 vs 0.45 | **Yes** (no direction info) |
| News days are wider than normal days (relative to ATR) | 1.03 vs 0.94 | 0.84 vs 0.94 | **No** (unlike GBPUSD) |
| After PDH is traded, the day closes above it | 55% | 51% | Coin flip |
| Previous-day false break in NY (GBPUSD v1 on gold) | −0.4 R | +9.4 R | **No (flips)** |
| NY opening-range breakout 08:00–09:00 | +5.8 R | −1.8 R | **No** |
| First 15 min after CPI/FOMC/PPI keeps going | mixed | mixed | **No** |
| Weekday effects | Mon widest by count of big days | Mon widest | Weak; not used |

**Main lesson:** gold is the opposite of GBPUSD on one key point. On GBPUSD, breaks of the Asia range were a coin flip and fades were
no better. On gold, **breaks tend to keep going and fading them loses money in both years** (−39 R and −18.5 R). Gold's edge, if any,
is in **going with a move that is already under way**, not in catching reversals.

---

## 1. When does gold move? (`01_ranges.py`, `out_01_ALL.txt`)

### By New York hour (average high–low range inside the hour; usable days with ATR known)
| New York | Doha (US summer / winter) | Y1 avg $ | Y1 % of price | Y1 x ATR | Y2 avg $ | Y2 % | Y2 x ATR | Note |
|---|---|---|---|---|---|---|---|---|
| 18:00 | 01:00 / 02:00 | 8.1 | 0.26 | 0.16 | 28.0 | 0.61 | 0.23 | gold reopens after the daily break |
| 19:00 | 02:00 / 03:00 | 6.9 | 0.22 | 0.14 | 22.2 | 0.49 | 0.19 | |
| 20:00–21:00 | 03:00–04:00 / 04:00–05:00 | 10.0–11.6 | 0.32–0.37 | 0.21–0.24 | 29.3–29.7 | 0.64–0.65 | 0.25 | **Shanghai / Tokyo morning: an Asia peak** |
| 22:00–00:00 | 05:00–07:00 / 06:00–08:00 | 6.4–8.9 | 0.21–0.28 | 0.14–0.18 | 15.5–20.7 | 0.34–0.46 | 0.13–0.17 | quiet |
| 01:00–04:00 | 08:00–11:00 / 09:00–12:00 | 8.7–9.7 | 0.28–0.31 | 0.18–0.21 | 21.4–23.9 | 0.47–0.53 | 0.18–0.20 | Europe / London open |
| 05:00–07:00 | 12:00–14:00 / 13:00–15:00 | 8.0–8.8 | 0.26–0.28 | 0.17–0.19 | 18.6–22.2 | 0.41–0.49 | 0.16–0.19 | London lunch |
| 08:00 | 15:00 / 16:00 | 13.5 | 0.44 | 0.29 | 30.5 | 0.67 | 0.27 | US data at 08:30, COMEX opens 08:20 |
| **09:00** | **16:00 / 17:00** | **15.2** | **0.49** | **0.33** | 35.6 | 0.78 | 0.31 | **peak**, US stocks open 09:30 |
| **10:00** | **17:00 / 18:00** | 14.6 | 0.47 | 0.32 | **37.1** | **0.81** | **0.33** | **peak**, 10:00 data, London PM fix at 15:00 London |
| 11:00 | 18:00 / 19:00 | 10.6 | 0.34 | 0.23 | 29.4 | 0.64 | 0.25 | |
| 12:00–15:00 | 19:00–22:00 / 20:00–23:00 | 6.8–8.4 | 0.22–0.27 | 0.14–0.18 | 21.0–22.4 | 0.46–0.49 | 0.18–0.20 | COMEX closes 13:30 |
| 16:00 | 23:00 / 00:00 | 5.3 | 0.17 | 0.11 | 15.7 | 0.34 | 0.13 | quietest |
"Cleanness" (net move ÷ range inside the hour) is 0.40–0.49 in every hour in both years: no hour is clearly cleaner than another.

### By session (local clocks; "made day high/low" = share of days the session printed the day's extreme)
| Session | Doha | Y1 range (x ATR) | Y2 range (x ATR) | Day high / low made here, Y1 | Y2 |
|---|---|---|---|---|---|
| Evening 18:00–00:00 NY | 01:00–07:00 / 02:00–08:00 | 23.0 $ (0.47) | 63.2 $ (0.53) | 28% / 42% | 33% / 42% |
| Asia 00:00–07:00 London | 02:00–09:00 / 03:00–10:00 | 24.2 $ (0.50) | 65.9 $ (0.55) | 22% / 28% | 23% / 28% |
| London open hour 07:00–08:00 London | 09:00–10:00 / 10:00–11:00 | 9.2 $ (0.20) | 20.9 $ (0.18) | 3% / 3% | 1% / 3% |
| London morning 08:00–12:00 London | 10:00–14:00 / 11:00–15:00 | 17.2 $ (0.37) | 41.1 $ (0.35) | 11% / 8% | 7% / 7% |
| NY morning 08:00–12:00 NY | 15:00–19:00 / 16:00–20:00 | 27.9 $ (0.62) | 68.5 $ (0.61) | 26% / 26% | 27% / 23% |
| NY afternoon 12:00–17:00 NY | 19:00–00:00 / 20:00–01:00 | 15.7 $ (0.33) | 46.7 $ (0.41) | 27% / 16% | 24% / 17% |
| Whole day | | 48.8 $, 1.57% | 125.2 $, 2.73% | | |

- Gold makes its **low of the day most often in the evening/Asia** (42% both years), and its high most often in the NY session (53% / 51% for 08:00–17:00 NY).
  This reflects the up-trend of both years (up days: 58% Y1, 55% Y2), so I do not treat it as a rule.
- **Weekday:** median range Mon 0.97/1.02 x ATR, Tue 0.98/0.93, Wed 0.83/0.86, Thu 0.98/0.92, Fri 1.00/0.92 (Y1/Y2). Only "Wednesday is a bit quieter" shows in both years, by a small margin. Not usable.
- **Months:** widest Apr 2025 (2.64%, tariff shock), Jan–Mar 2026 (3.2–3.8%, record highs then a sharp fall). Quietest Oct 2024, Jan 2025, Aug 2025 (1.1%).

## 2. Where do big moves come from? (`02_big_moves.py`)
**Big days** = range ≥ 1.24 x ATR (top 25% over 21 months): 52 in Y1, 50 in Y2. Up: 52% (Y1), 42% (Y2): no direction bias.
- They trend: open-to-close is 64% / 58% of the range, against 46% / 41% on other days.
- **They start early:** the starting extreme (low of an up day, high of a down day) was set before 03:00 NY (about the London open) on 42 of 52 (Y1) and 43 of 50 (Y2) big days,
  most of them in the first hours after the 18:00 NY reopen. Only 2 (Y1) and 4 (Y2) started in the NY morning.
- Before a big day the Asia range is already wider (0.70 vs 0.44 x ATR in Y1; 0.82 vs 0.45 in Y2) and the previous day was wider (1.15 vs 1.00; 1.37 vs 0.98).
  This tells you a big day is more likely, **not which way**.
- **All swings of 0.5 x ATR or more** (zigzag, turn = 0.25 x ATR pullback): 457 in Y1, 422 in Y2, median 0.66–0.69 x ATR.
  Start window: evening 40% / 41% (inflated: the first swing of each day always starts at the reopen), NY morning 25% / 27%, London 21% / 15%,
  late Asia 10% / 9%, NY afternoon 3% / 8%. Busiest start hours after the reopen: 09:00 and 10:00 NY (6–10% each).
  Only 37% / 36% started after the previous day's high/low had been taken that day: most big swings do **not** begin with a "liquidity sweep".

## 3. Repeating behaviours (counts per year; `03_patterns.py`)
| Behaviour | Y1 (230 days) | Y2 (177 days) |
|---|---|---|
| Previous day's high traded | 59% | 49% |
| Previous day's low traded | 39% | 44% |
| ...after PDH traded, day closes above it | 55% | 51% |
| ...after PDL traded, day closes below it | 51% | 50% |
| Asia high taken 07:00 London → 12:00 NY | 67% | 63% |
| Asia low taken 07:00 London → 12:00 NY | 55% | 49% |
| Both Asia sides taken | 27% | 19% |
| First Asia break happens in the first London hour (07:00–08:00 London) | 46% | 36% |
| After the first break: price comes back to the Asia middle | **55%** | **49%** |
| After the first break: price reaches the opposite Asia side | 32% | 25% |
| Day closes beyond the side broken first | **56%** | **54%** |

**Does an earlier move predict a later one?** (15 pairs; "follow" = later move in the same direction; size in x ATR)
| Earlier → later | Y1 follow / avg | Y2 follow / avg |
|---|---|---|
| Overnight 18:00→08:00 NY → 08:00–16:00 NY | 54% / +0.039 | 56% / +0.045 |
| Day open → 10:00 NY → 10:00–16:00 | 55% / +0.033 | 53% / +0.055 |
| 08:00→10:00 NY → 10:00–16:00 | 53% / +0.022 | 53% / +0.047 |
| Day open → 15:00 → 15:00–16:00 | 57% / +0.012 | 54% / +0.024 |
| Asia 18:00→03:00 NY → London 03:00–08:00 | 58% / +0.036 | 50% / −0.002 (flips) |
| 08:30→09:00 (data reaction) → 09:00–12:00 | 55% / +0.032 | 44% / −0.012 (flips) |
| Previous day → today | 47% / +0.025 | 48% / +0.065 |
The "continue the day's direction into the close" pairs are positive in both years, but small (a few hundredths of a day's range).
Correlations are +0.08 to +0.21. On GBPUSD the same scan found nothing (46–51%).

**Around the US clock times** (median 30-minute range after the time, x ATR): 08:00 0.16 / 0.15; 08:30 0.19 / 0.15; **09:30 0.22 / 0.22**; 10:00 0.21 / 0.20.
The 09:30 stock open is the most active half hour in both years; the 08:30 data minute is bigger only on release days.

## 4. News days (`04_news.py`, `news_calendar.py`, `out_04_events.csv`)
No paid calendar is connected. Dates come from published schedules (BLS for CPI, jobs report and PPI; Federal Reserve for FOMC), including the
Oct–Nov 2025 shutdown delays. **Each date was checked in gold's prices**: 5-minute range from the release minute vs the same minute on
non-event days of the same weekday and design year (in x ATR). 49 of 73 dates show a jump of at least 2x normal.
- **Confirmed (2x or more):** almost all NFP and FOMC dates, most CPI dates in Y1.
- **Weak reaction (1.1–1.96x), date probably right but gold barely reacted:** NFP 2 May 2025; CPI 10 Apr 2025 (day after the tariff pause, gold already wild),
  13 May 2025, 13 Feb, 11 Mar, 10 Apr, 12 May 2026 (CPI 11 Mar 2026 was confirmed on GBPUSD, so these are weak reactions in a very volatile gold year, not wrong dates).
- **PPI: 14 of 19 dates show no clear jump.** Either PPI matters little to gold or some dates after Sep 2025 are wrong
  (25 Nov 2025, 14 Jan, 30 Jan, 27 Feb, 14 Apr, 13 May, 11 Jun 2026 were rebuilt from memory of the shutdown re-schedule). **Treat PPI dates as doubtful.**
- Not usable (first 2 weeks, no ATR yet, or holiday): NFP 4 Oct 2024, CPI 10 Oct 2024, PPI 11 Oct 2024, NFP 3 Apr 2026 (Good Friday, thin day).

Reaction, all usable scheduled dates (medians; x = share of ATR):
| Event (NY time) | Doha (US summer / winter) | 5-min jump Y1 / Y2 | Normal 5 min | Hour before | 4 h after Y1 / Y2 | Day Y1 / Y2 | First-15-min move continues 4 h later |
|---|---|---|---|---|---|---|---|
| NFP 08:30 | 15:30 / 16:30 | 13.4 $ (0.36x) / 22.9 $ (0.24x) | ~0.1x | 0.18 / 0.21x | 0.76 / 0.67x | 1.07 / 0.78x | 7 of 11 / 4 of 7 |
| US CPI 08:30 | 15:30 / 16:30 | 10.2 $ (0.25x) / 19.1 $ (0.13x) | ~0.1x | 0.22 / 0.14x | 0.68 / 0.53x | 0.96 / 0.74x | 6 of 11 / 3 of 8 |
| US PPI 08:30 | 15:30 / 16:30 | 5.9 $ (0.13x) / 11.6 $ (0.11x) | ~0.1x | 0.17 / 0.31x | 0.50 / 0.42x | 1.06 / 0.69x | 8 of 11 / 3 of 7 |
| FOMC 14:00 | 21:00 / 22:00 | 8.8 $ (0.20x) / 22.9 $ (0.23x) | 0.04–0.05x | 0.12 / 0.14x | 0.61 / 0.82x | 1.06 / 1.23x | 3 of 8 / 5 of 6 |
- **NFP is gold's biggest scheduled jolt** (3–4x a normal 5 minutes), then CPI and FOMC. FOMC days are the widest days (1.06 / 1.23 x ATR).
- The hour before NFP/CPI is quiet (0.14–0.22 x ATR vs 0.19–0.20 normal for 07:30–08:30), and before FOMC very quiet (0.12–0.14 vs 0.13–0.15 normal).
- **Unlike GBPUSD, gold's news days are not wider than normal days overall** (1.03 vs 0.94 x ATR in Y1; 0.84 vs 0.94 in Y2). Gold's biggest days in this period
  came from unscheduled news (tariffs in Apr 2025, record highs and the crash in early 2026).
- **Direction after the first 15 minutes is not consistent** between years for any event. No news-reaction rule is proposed.

## 5. Bad conditions (held in both years)
- **Fading breaks.** Every "it broke out, now trade it back" test lost or flipped: Asia false break (−39.3 R / −18.5 R), previous-day false break in NY (−0.4 R / +9.4 R).
- **NY afternoon** 12:00–16:00 NY (19:00–23:00 Doha in US summer): ranges fall to 0.11–0.20 x ATR per hour, and few swings start after 12:00 NY (3% / 8%).
- **23:00–00:00 NY** (06:00–08:00 Doha): dead.
- **Thin days:** US holiday early closes (gold stops at 13:30–14:45 NY), 24 Dec, data gaps. Removed from all studies, with the day after.
- **NY opening-range breakouts** (08:00–09:00) are a coin flip: +5.8 R / −1.8 R, and −1.5 R / −4.5 R at double cost.

---

## 6. Idea testing (design data, results per year; `05_ideas.py`, `06_momentum_robustness.py`, `08_asia_break_variants.py`, `09_v1_check.py`)
Fill model: enter at the close of the signal candle; stop and target checked on the following 1-minute bars; if both are hit in the same bar, the stop counts.
Forced close = close of the last 1-minute bar before 16:00 NY. Cost 0.40 USD per trade (double: 0.80 USD). 1 trade per day.
Each variant was written down before it was run. **Variants tried: 7 ideas + 32-cell robustness grid + 3 Asia-break variants = 42.**

| # | Variant | Y1 R (PF) | Y2 R (PF) | @0.80 Y1 / Y2 | Longest losing run Y1 / Y2 | Trades |
|---|---|---|---|---|---|---|
| M1 | Momentum at 10:00 NY (sign of price vs day open), stop 0.5 x ATR, exit 16:00 | +9.7 (1.17) | +15.1 (1.36) | +5.5 / +13.8 | 6 / 6 | 406 |
| M2 | Overnight trend at 08:00 NY, stop 0.5 x ATR, exit 16:00 | +18.6 (1.26) | +16.1 (1.30) | +14.3 / +14.8 | 8 / 5 | 407 |
| A1 | Asia breakout continuation, stop Asia middle, target 2R | +13.4 (1.12) | +21.6 (1.31) | +5.5 / +19.3 | 8 / 5 | 366 |
| A2 | Asia false break in London (fade), 2R | −39.3 (0.69) | −18.5 (0.77) | −59.5 / −23.3 | 10 / 7 | 270 |
| P1 | PDH/PDL false break 08–11 NY (GBPUSD v1), 2R | −0.4 (0.99) | +9.4 (1.28) | −6.3 / +7.8 | 9 / 5 | 141 |
| O1 | NY opening range 08:00–09:00 breakout, 1R | +5.8 (1.07) | −1.8 (0.98) | −1.5 / −4.5 | 7 / 9 | 391 |
| O2 | NY opening range 09:30–10:00 breakout, 1R | +5.6 (1.08) | +10.2 (1.18) | −2.0 / +7.7 | 5 / 5 | 372 |
| A1a | A1 with no target, hold to 16:00 NY | +42.0 (1.39) | +14.6 (1.20) | +34.2 / +12.3 | 8 / 6 | 366 |
| **A1b** | **A1 with target 1R (chosen for v1)** | **+15.8 (1.18)** | **+15.8 (1.27)** | **+8.0 / +13.6** | **7 / 5** | 366 |
| A1c | A1, signals only until 12:00 London | +4.5 (1.05) | +12.5 (1.25) | −2.0 / +10.9 | 7 / 6 | 269 |
(The tests in the table use only days with a 14-day ATR, so they start mid-October 2024. The final v1 check below starts on the first usable day.)

**Robustness grid for the momentum family** (entry 07/08/09/10 NY x stop 0.35/0.5/0.75/1.0 ATR x exit 12:00/16:00): with exit at **16:00 NY, 31 of 32 year-cells are positive**;
with exit at 12:00 NY results are near zero. Holding into the afternoon is what makes momentum work. **But** M2's profit is mostly on news days:
normal days +2.6 R (189 trades) in Y1 and +6.9 R (149) in Y2; news days +16.0 R (41) and +9.2 R (28), and the news part leans on PPI days, whose dates are partly doubtful.
That is why M2 is a backup and not v1.

**Why A1b for v1:** it is the simplest version of the finding that held best in both years (London breaks of the Asia range tend to continue; fading them loses).
Its profit comes from normal days in both years (+15.6 R / +8.2 R), longs and shorts are both positive in both years, and its drawdowns are the smallest of the family.
The 1R target was picked among 3 variants declared together; that is a selection step, so the edge is probably smaller than the numbers show.

### v1 quick check (exact rules from `strategy.md`, `09_v1_check.py`, all usable days from 2 Oct 2024)
| Period | Trades | Win rate | Total | Avg | PF | Max drawdown | Longest losing run | @0.80 cost |
|---|---|---|---|---|---|---|---|---|
| Y1 | 218 | 54.1% | +12.4 R | +0.057 R | 1.13 | −8.5 R | 7 | +4.2 R (PF 1.04) |
| Y2 | 157 | 56.7% | +15.8 R | +0.101 R | 1.27 | −10.3 R | 5 | +13.6 R (PF 1.23) |
| All 21 months | 375 | 55.2% | +28.2 R | +0.075 R | 1.18 | −10.3 R | 7 | +17.8 R (PF 1.11) |
- Longs: +6.0 R (Y1), +5.4 R (Y2). Shorts: +6.4 R, +10.4 R. **News days: −3.3 R (40 trades, Y1), +7.7 R (25, Y2): flips.** Normal days: +15.6 R, +8.2 R.
- Signals on 375 of 416 usable days. Entries: 117 in the 07:00 London hour (02:00 NY), most of the rest by 05:00 NY; Doha 09:00–13:00 typically.
- Stop size: median 17.8 USD (Y1 ~11 USD, Y2 ~31 USD); smallest 3.8 USD, where the 0.40 cost is ~10% of the risk.
- Bootstrap (A1b on ATR days): chance the true average is zero or below is 12% for Y1 alone, 8% for Y2 alone, 3.5% for both years together.

## 7. Conclusion
Gold differs from GBPUSD: it **continues** more than it reverses. The best-supported, simplest idea is to trade **with** the first London break of the Asia range.
It passes the quick-check bar (positive both years, positive at double cost, 375 trades), with two weak points: **Y1 at double cost is barely positive (+4.2 R, PF 1.04)**,
and the **longest losing run is 7** in Y1 (above the ideal 6; with a 55% win rate, runs of 7 are normal over 375 trades).
The edge is small (+0.06 to +0.10 R per trade). Hidden test A (Oct 2023 – Sep 2024) is the real check.

---

## 8. Round 2 (v2), 9 Oct 2026: all of Oct 2023 – Sep 2026 is now design data
After Agent 2 opened hidden tests A (Oct 2023 – Sep 2024) and B (Jul – Sep 2026) for v1, they became design data (README). The new hidden year
(Oct 2022 – Sep 2023, `data/hidden/`) was **not** opened. Sections 1–7 above are still the round-1 numbers (Y1/Y2 only); I did not redo them for A and B.
Agent 2's per-period v1 numbers are in `feedback.md`. The splits there (news, hour, weekday) flip between periods, so no filter is added.

**What the v1 test showed about costs:** before costs v1 made A +15.9 R, Y1 +20.6, Y2 +18.1, B +7.5 R (my replica). The median stop was 6.1 USD in A, 11.2 in Y1,
30.9 in Y2 and 26.4 in B. At 0.40 USD that is 0.07 R per trade in A, the whole edge. Shorts lost −18.8 R in A (gold up from ~1,850 to ~2,650).

**Round-2 variants** (`research/10_v2_check.py`, declared together before running; 0.40 USD / 0.80 USD cost):
| # | Variant | A | Y1 | Y2 | B | All @0.80 | Longest losing run | Trades A/Y1/Y2/B |
|---|---|---|---|---|---|---|---|---|
| V0 | v1 replica | −1.1 R | +12.3 | +15.8 | +6.5 | +5.0 R | 7 | 232/220/157/59 |
| V43 | v1 + minimum stop 8 USD (20 × cost) | +2.7 (+0.3 @0.80) | +22.6 | +15.8 | +6.5 | +37.0 R | 5 | 66/167/157/59 |
| V44 | V43 + 50-day trend rule (longs only above, shorts only below) | +3.4 | +18.0 | +15.8 | +2.1 | +34.0 R | 6 | 26/86/91/28 |
| **V45** | **stop at opposite Asia side, 1R, min stop 8 USD (v2)** | **+15.9 (+10.5)** | **+10.8 (+6.4)** | **+10.8 (+9.6)** | **+8.4 (+7.9)** | **+34.4 R** | **5** | **176/217/157/59** |

- V43 works only by skipping most of A (66 trades) and is flat there at double cost. V44 trades too little (26 trades in A) and lowers B.
- V45 is positive in every period at both costs. Bootstrap chance the average is ≤ 0: A 7%, Y1 18%, Y2 12%, B 7%, all 36 months 1%.
  Without the best 3 trades every period stays positive. Positive months: 25 of 36. Cost share of risk: 0.03 R (A), 0.02 (Y1), 0.01 (Y2/B).
- The wider stop also fixed most of the short-side problem without a direction filter: shorts A −0.3 R, Y1 −1.3, Y2 +7.6, B +3.0. Longs +16.2 / +12.1 / +3.2 / +5.4.
- Weak points: 46% of trades end at the 16:00 NY forced close (average +0.04 R), so v2 is partly a "hold the break into the afternoon" trade.
  Y1 is the weakest period (+0.05 R per trade, PF 1.16). Stops under 15 USD lost in Y1 (−3.6 R) but won in A (+8.4 R): no stable stop-size pattern.
