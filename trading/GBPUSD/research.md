# GBPUSD research (Agent 1), round 2

**Data used:** HistData 1-minute bid prices with the corrected UTC clock, **design period only: 1 Oct 2024 to 30 Jun 2026 (21 months)**.
The file is read in chunks and every chunk is filtered at once. Asserts in `research/common.py` stop the run if any bar from
hidden test A (Oct 2023 – Sep 2024) or hidden test B (Jul 2026 onward) gets through. Neither hidden period was looked at.
No clock fix is applied in the scripts: the data is already correct.

**Two design years** are compared throughout:
- **Y1** = Oct 2024 – Sep 2025 (254 usable days). GBPUSD trended: down from 1.337 (1 Oct 2024) to 1.216 (17 Jan 2025), then up to 1.374 (1 Jul 2025), then a sharp drop in July.
- **Y2** = Oct 2025 – Jun 2026 (189–192 usable days). Sideways: month-end closes stayed between 1.315 and 1.368.

**Rule for this report:** a finding counts only if it shows in **both** years. Findings that flip between the years are treated as noise.

**Usable days:** 449 full trading days (5 removed: 1 Oct 2024 partial start, 7 Nov 2024 data gap at the FOMC hour,
25 Dec 2024, 25 Dec 2025, 18 May 2026 data gap). Days whose previous day was one of these are also left out of level-based studies.
**Day** = 17:00 New York to 17:00 New York. Weekend bars (e.g. Sunday bars before 17:00 NY) belong to Monday.
**Times:** Doha = New York + 7 h in US summer time (2nd Sunday of March to 1st Sunday of November), + 8 h in US winter time.
Sessions are defined on London's or New York's own clock. **1 pip = 0.0001.**
Scripts: `trading/GBPUSD/research/`. Run any script with `GBP_PERIOD=Y1`, `Y2` or `ALL`. Outputs are in `out_NN_<period>.txt`.

---

## A. Summary: what held and what did not

| Finding | Y1 | Y2 | Holds? |
|---|---|---|---|
| Busiest hours are 08:00–11:00 NY; 10:00 NY is the peak hour | 29.8 pips | 29.1 pips | **Yes** |
| Dead hours 12:00 NY – 02:00 NY (hourly range ~10–18 pips) | yes | yes | **Yes** |
| London breaks at least one side of the Asia range (07:00–12:00 London) | 95% | 96% | **Yes** |
| First Asia break comes in the 07:00–08:00 London hour | 71% | 66% | **Yes** |
| After the first Asia break, price returns to the Asia middle that day | 70% | 77% | **Yes** |
| ...but the day closes beyond the broken level (true breakout) | 52% | 48% | **Yes: coin flip** |
| Earlier move predicts later move (11 pairs tested) | no | no | **Yes: no edge, both years** |
| NY morning trades beyond the London range | 91% | 89% | **Yes** |
| ...and afterwards closes beyond it | 50% | 49% | **Yes: coin flip** |
| Big days trend (open-to-close / range): big vs other days | 0.66 vs 0.44 | 0.63 vs 0.38 | **Yes** |
| Big days start before NY (evening/Asia/London) | 58 of 64 | 46 of 48 | **Yes** |
| Big days follow a wider Asia range and a wider previous day | 35 vs 27; 98 vs 83 | 34 vs 26; 91 vs 80 | **Yes** (descriptive only) |
| News days are wider than normal days (median) | 99.5 vs 83.0 | 97.6 vs 77.7 | **Yes** |
| Bank of England days are the widest news days | 120 | 136 | **Yes** |
| PDH broken → day closes back below it | **47%** | **55%** | **No (flips)** |
| PDL broken → day closes back above it | **44%** | **57%** | **No (flips)** |
| Widest weekday | Wed/Thu/Mon similar | Thursday | **No** |
| UK CPI: first 15-min move keeps going | **3 of 12** | **8 of 9** | **No (flips)** |
| US CPI: first 15-min move is undone | 7 of 12 | 6 of 8 | Weak / small sample |
| London moved 30+ pips → NY continues | **49%** | **60%** | **No** |

**The main lesson:** GBPUSD's *timing* is very stable (when it moves, how big, when big moves start), but its *direction* after any
simple event is a coin flip in both years. "False break" behaviour at the previous day's high/low was real in the sideways year (Y2)
and absent in the trending year (Y1). That is exactly why v1 worked on Y2 and failed on Y1.

---

## 1. When does GBPUSD move? (held in both years)

### By hour (average high-low range inside each hour, pips, 21 months; Y1 / Y2 in brackets for the key hours)
| New York | Doha (summer / winter) | Avg | Median | Note |
|---|---|---|---|---|
| 19:00–01:00 | 02:00–08:00 / 03:00–09:00 | 10–14 | 9–12 | Asia: quiet |
| 02:00 | 09:00 / 10:00 | 20.9 | 18.1 | Frankfurt + London open |
| 03:00 | 10:00 / 11:00 | 23.2 (24.6 / 21.5) | 21.1 | London morning |
| 04:00 | 11:00 / 12:00 | 21.4 | 19.3 | |
| 05:00–07:00 | 12:00–14:00 / 13:00–15:00 | 18–20 | 16–18 | London lunch, pre-NY |
| 08:00 | 15:00 / 16:00 | 26.9 (28.6 / 24.6) | 23.1 | US data at 08:30 |
| 09:00 | 16:00 / 17:00 | 25.2 | 22.5 | US stocks open 09:30 |
| **10:00** | **17:00 / 18:00** | **29.5 (29.8 / 29.1)** | **26.6** | **peak hour** |
| 11:00 | 18:00 / 19:00 | 23.1 | 20.8 | London fix, London close |
| 12:00–16:00 | 19:00–23:00 / 20:00–00:00 | 11–18 | 9–17 | fading |
| 17:00 | 00:00 / 01:00 | 12.3 | 10.9 | rollover: wide spreads, almost no net movement (cleanness 0.29–0.33) |

### By session (21 months)
| Session (local clock) | Doha (summer / winter) | Avg | Median | Made day's high | Made day's low |
|---|---|---|---|---|---|
| Asia 00:00–07:00 London | 02:00–09:00 / 03:00–10:00 | 32.6 | 27.8 | 19% | 13% |
| Frankfurt hour 07:00–08:00 London | 09:00–10:00 / 10:00–11:00 | 21.6 | 19.3 | 8% | 3% |
| London morning 08:00–12:00 London | 10:00–14:00 / 11:00–15:00 | 41.4 | 37.0 | 14% | 16% |
| London full 08:00–16:30 London | | 68.9 | 63.1 | 40% | 45% |
| London–NY overlap 08:00 NY – 16:00 London | 15:00–18:00 / 16:00–19:00 | 71.6 | 64.5 | 37% | 31% |
| New York 08:00–17:00 NY | 15:00–00:00 / 16:00–01:00 | 64.0 | 57.8 | 50% | 47% |
| NY afternoon 12:00–17:00 NY | 19:00–00:00 / 20:00–01:00 | 34.3 | 29.1 | 24% | 20% |
Each year's session numbers are within about 10% of these (Y1 slightly wider; Y1 day average 95.0, Y2 87.0 pips).
**Whole day, 21 months:** average 91.6 pips, median 82.9 (middle half 66–108).

### By weekday (21 months): does NOT hold as a pattern
Mon 80.4, Tue 76.4, Wed 87.5, Thu 86.4, Fri 80.3 (median pips). Y1's widest days were Wed/Thu/Mon (82–90), Y2's was Thursday (86).
Only "Tuesday is a bit quieter" and "Wed/Thu a bit wider" appear in both years, by small margins. Not usable.

### By month
Wide months: Jan 2025 (113 avg), Apr 2025 (127, US tariff shock), Mar 2026 (118). Quiet: Oct 2024 (77), Dec 2025 (74), Jun 2026 (77).

---

## 2. Where do big moves come from? (held in both years)
**Big days** = top 25% of days (108+ pips over 21 months; 111 days).
- Direction: 59% up in Y1, 52% in Y2. Close to even.
- They trend: open-to-close is 63–66% of the range, against 38–44% on other days.
- **They start early:** the starting extreme (the low of an up day, the high of a down day) was set before New York on 58 of 64 (Y1) and
  46 of 48 (Y2) big days. Most were in the evening/Asia session (40 and 31). Only 5 and 2 started in the NY morning.
- About half started with no sweep of the Asia or previous-day level at all (34 of 64; 23 of 48).
- Wider Asia range and wider previous day beforehand (see table A). **But knowing this does not tell you the direction.**

**All moves of 50+ pips** (swing ends after a 25-pip pullback; Y1 521 moves, Y2 336 moves; median about 67 pips, about 4 hours long):
- Start in the NY morning (08:00–12:00 NY): 29% in Y1, 30% in Y2. The single biggest window both years.
- After 12:00 NY: only about 6% in both years.
- Start at a sweep of an Asia/previous-day level: 50% (Y1) and 52% (Y2). That is about what you get by chance, because turning
  points tend to sit beyond these levels anyway.

## 3. Repeating behaviours (counts per year)
| Behaviour | Y1 (254 days) | Y2 (189 days) |
|---|---|---|
| Asia range (median) | 28.4 pips | 27.3 pips |
| Asia high taken 07–12 London | 66% | 61% |
| Asia low taken 07–12 London | 57% | 63% |
| Both Asia sides taken 07–12 London | 28% | 28% |
| First break runs 10+ pips before any return to the Asia middle | 61% | 56% |
| First break runs 20+ pips before any return to the Asia middle | 44% | 38% |
| Returns to the Asia middle later | 70% | 77% |
| Reaches the opposite Asia side later | 50% | 51% |
| Day closes beyond the first broken level | 52% | 48% |
| PDH traded | 50% | 44% |
| PDL traded | 46% | 54% |
| Outside day / inside day | 11% / 14% | 14% / 15% |
| London 08:00 open price traded again after 10:00 London | 79% | 86% |
| NY continues London's direction | 48% | 49% |
| Rest of the day continues London's first hour | 50% | 48% |
| NY afternoon continues the 08:00 NY → 4pm-fix move | 50% | 48% |

**Does an earlier move predict a later one?** (`07_predictability_scan.py`, 11 pairs, 443–444 days): correlations −0.10 to +0.10.
"Follow the earlier direction" was right 46–51% of the time. Average follow-through was −3 to +2 pips, which is less than the trading cost.
The only pair with the same sign in both years was "NY 08–09 → 09–12 NY" (fade worked: −2.8 and −2.9 pips). Split by size of the first hour,
the effect is not stable (`10_ny_first_hour.py`), so it is not usable.

## 4. News days (dates re-checked with the corrected clock)
No paid calendar is connected; the FMP calendar needs a higher plan. Dates come from published schedules: the BLS schedule, the Fed and
BoE meeting calendars, and the ONS UK CPI pattern. The Oct–Nov 2025 shutdown delays are included. **Each date was checked in the price data:**
84 of 87 events show a 5-minute jump at the release minute of at least 2x normal.
- **US CPI on 11 Mar 2026 is now confirmed (2.75x).** The earlier doubt came from the old clock problem.
- Still doubtful (1.4–1.9x, dull reaction or wrong date): UK CPI 17 Sep 2025, UK CPI 21 Jan 2026, UK CPI 22 Apr 2026, US CPI 10 Jun 2026.
- 7 Nov 2024 (FOMC + BoE) is excluded because the data is missing the FOMC hour.
- Full list: `research/news_calendar.py`. Per-event results: `research/out_04_events.csv`.

| Event (release time) | Doha (summer / winter) | 5-min jump Y1 / Y2 (median) | Normal | 4-hour range after, Y1 / Y2 | Day range Y1 / Y2 |
|---|---|---|---|---|---|
| US NFP (08:30 NY) | 15:30 / 16:30 | 51.7 / 30.2 | 6–8 | 89 / 66 | 101 / 96 |
| US CPI (08:30 NY) | 15:30 / 16:30 | 43.8 / 26.3 | 6–8 | 77 / 51 | 97 / 71 |
| FOMC (14:00 NY) | 21:00 / 22:00 | 25.9 / 22.0 | 4 | 76 / 75 | 99 / 111 |
| BoE (12:00 London) | 14:00 / 15:00 (London summer / winter) | 45.9 / 30.8 | 5.5 | 70 / 92 | 120 / 136 |
| UK CPI (07:00 London) | 09:00 / 10:00 (London summer / winter) | 24.0 / 18.9 | 5.8 | 49 / 46 | 92 / 88 |

- News days are wider in both years: median 97.8 vs 80.7 pips over 21 months.
- The hour before the release is quieter than usual for NFP and UK CPI (median 10–17 pips). Not for FOMC and BoE.
- **Direction after the first 15 minutes is not consistent:** UK CPI follow-through was 3/12 in Y1 and 8/9 in Y2; US CPI follow-through
  was 5/12 and 2/8. The round-1 "news reaction" backup ideas are therefore **dropped as noise**.

## 5. Bad conditions (held in both years)
- 12:00 NY to 02:00 NY (19:00/20:00 to 09:00/10:00 Doha): small ranges, costs eat a big share, and only about 6% of big moves start after 12:00 NY.
- The 17:00 NY rollover hour: spread noise, no real movement.
- Breaks of Asia, London and previous-day levels end beyond the level only about half the time in both years. Pure breakout trading has no edge.
- Holiday days (25 Dec) and data-gap days are thin. The day after them has no proper "previous day".

---

## 6. Round 2 idea testing (all on the 21 design months, results per design year)
Fill model: enter at the close of the signal candle. Stop and target are checked on the following 1-minute bars; if both are hit in the same bar, the stop counts.
Costs 1.5 pips (and 3 pips as a stress test). Code: `11_v2_check.py`, `12_other_families.py`. **7 rule variants were tried in round 2** (round 1 tried about 11).

| # | Variant (decided before seeing its result) | Y1 @1.5 | Y2 @1.5 | Y1 @3 | Y2 @3 | Longest losing run | Trades |
|---|---|---|---|---|---|---|---|
| 0 | v1 replica (baseline, matches Agent 2 exactly) | −21.9 R | +9.8 R | −33.2 | +1.1 | 9 | 158 |
| 1 | v1 + market mood: trade only if the last 5 days were range-bound (ER5 < 0.5) | −15.7 R | +10.8 R | −22.0 | +6.2 | 9 | 85 |
| 2 | v1 + minimum stop 8 pips | −17.7 R | +14.4 R | −27.8 | +7.1 | 9 | 158 |
| 3 | v1 + mood + minimum stop (the planned v2) | −14.9 R | +14.6 R | −20.3 | +10.9 | 9 | 85 |
| F1 | Asia false break in London, 2R | −27.9 R | +1.8 R | −63.0 | −26.4 | 10 | 362 |
| F2 | Asia breakout in London, 2R | −11.0 R | −34.4 R | −30.2 | −50.3 | 11 | 398 |
| F3 | London opening-range (08–09 London) breakout | −25.0 R | −11.5 R | −39.0 | −23.6 | 13 | 401 |
| F4 | NY opening-range (08–09 NY) breakout | +2.2 R | −18.3 R | −10.6 | −29.0 | 8 | 389 |

ER5 = how much of the last 5 full days' high-to-low range became net movement (0 = went nowhere, 1 = went straight). The cut-off of 0.5 was fixed in advance.
On the design data the median ER5 was 0.43–0.45, and I looked at that distribution only, not at results, before fixing the cut-off.

**Result: none of the 7 variants is positive in both years.**
- The mood switch did not rescue the false-break idea. Even on "range-bound" days, Y1 lost −15.7 R with a 27% win rate.
  So the Y1 failure is not explained by the 5-day trend measure.
- Breakout versions lose in at least one year, mostly in both.

## 7. Conclusion
On 21 months of corrected data, GBPUSD shows **stable timing but no stable direction** after any of the simple, well-known setups I tested.
I found no idea that meets the bar (positive in both years, still positive at 3-pip costs, losing run ≤ 6, about 150+ trades).
**Recommendation: pause GBPUSD and move to XAUUSD**, keeping the timing findings above. They also tell us where *not* to trade:
the afternoon, the rollover hour, and breakout entries.
Ideas I have not tested and could try if GBPUSD is reopened: a volatility-timing approach, for example trading only on days with a wide
Asia range plus a rule that captures the early trend of big days. Today I have no evidence that the direction of those days can be known in advance.
