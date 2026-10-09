# GBPUSD research (Agent 1)

**Data used:** HistData 1-minute bid prices, **1 Oct 2025 to 30 Jun 2026 only** (the "development period").
July to September 2026 was not loaded or looked at; it is kept hidden for Agent 2's check.
191 full trading days studied (3 short days removed: 1 Oct 2025 partial start, 25 Dec 2025 holiday,
18 May 2026 data gap). Over the period GBPUSD moved sideways in a wide band (1.302 to 1.384; it started at 1.348 and ended at 1.326).

**How a "day" is counted:** the normal forex day, from 17:00 New York to 17:00 New York the next day
(= 00:00 Doha in US summer time, 01:00 Doha in US winter time).
**Times:** Doha is always UTC+3. New York is UTC-4 in US summer time (2nd Sunday of March to 1st Sunday of
November) and UTC-5 in US winter time. So **Doha = New York + 7 hours in summer, + 8 hours in winter.**
Sessions are defined on London's or New York's own clock, so their summer-time changes are handled.
**1 pip = 0.0001.** All scripts are in `trading/GBPUSD/research/` (see its README to re-run).

---

## 1. When does GBPUSD move?

### By hour (average high-to-low range inside each hour, pips)
| New York | Doha (summer / winter) | Avg range | Median | What happens |
|---|---|---|---|---|
| 19:00-01:00 | 02:00-08:00 / 03:00-09:00 | 9-13 | 8-11 | Asia: quiet |
| 02:00 | 09:00 / 10:00 | 20.5 | 17.6 | Frankfurt + London open (07:00-08:00 London) |
| 03:00 | 10:00 / 11:00 | 21.7 | 20.1 | London morning |
| 04:00 | 11:00 / 12:00 | 20.5 | 17.7 | London morning |
| 05:00 | 12:00 / 13:00 | 16.2 | 15.2 | London lunch dip |
| 06:00-07:00 | 13:00-14:00 / 14:00-15:00 | 19-21 | 17 | pre-New York |
| 08:00 | 15:00 / 16:00 | 24.8 | 22.9 | US data at 08:30 |
| 09:00 | 16:00 / 17:00 | 24.3 | 22.5 | US stock market opens 09:30 |
| **10:00** | **17:00 / 18:00** | **29.1** | **25.8** | **busiest hour** (10:00 US data, run-up to London 4pm fix) |
| 11:00 | 18:00 / 19:00 | 21.6 | 20.0 | London fix, London closes |
| 12:00-16:00 | 19:00-23:00 / 20:00-00:00 | 10-17 | 9-16 | fading New York afternoon |

The "cleanness" of an hour (how much of the range became net movement) is 0.45-0.56 in every hour except the 17:00 NY rollover hour (0.32).
No hour is clearly "cleaner" than another; the busy hours are bigger, not tidier.

### By session (same day, pips)
| Session (local clock) | Doha (summer / winter) | Avg | Median | Made the day's high | Made the day's low |
|---|---|---|---|---|---|
| Asia 00:00-07:00 London | 02:00-09:00 / 03:00-10:00 | 31.6 | 27.4 | 20% | 13% |
| Frankfurt hour 07:00-08:00 London | 09:00-10:00 / 10:00-11:00 | 20.7 | 17.6 | 7% | 3% |
| London morning 08:00-12:00 London | 10:00-14:00 / 11:00-15:00 | 39.2 | 34.6 | 12% | 17% |
| London full 08:00-16:30 London | | 65.0 | 59.6 | 39% | 48% |
| London-NY overlap 08:00 NY-16:00 London | 15:00-18:00 / 16:00-19:00 | 67.1 | 61.4 | 36% | 28% |
| New York 08:00-17:00 NY | 15:00-00:00 / 16:00-01:00 | 60.8 | 55.4 | 51% | 46% |
| NY afternoon 12:00-17:00 NY | 19:00-00:00 / 20:00-01:00 | 33.8 | 28.4 | 23% | 20% |
(The "made the day's high/low" columns overlap because the sessions overlap.)

**Whole day:** average range 87.0 pips, median 80.2 (middle half of days: 62-105 pips).

### By weekday
| Day | Avg range | Median | Avg open-to-close move | Days |
|---|---|---|---|---|
| Mon | 83.1 | 71.4 | 42.6 | 38 |
| Tue | 85.3 | 76.0 | 40.5 | 39 |
| Wed | 88.6 | 81.4 | 46.9 | 38 |
| **Thu** | **95.9** | **85.8** | 48.4 | 37 |
| Fri | 82.4 | 77.7 | 38.7 | 39 |
Thursday is the widest day (BoE decisions are on Thursdays: 6 of them sit here). Monday has the lowest median.
Differences between the other days are small and could be chance with ~38 days each.

### By month (avg daily range)
Oct 83, Nov 79, Dec 74, Jan 91, Feb 87, **Mar 118**, Apr 91, May 82, Jun 77. March 2026 was a high-volatility month;
results that depend on March alone should be treated with care.

---

## 2. Where do the big moves come from?

**Big days** (top 25% of days, range of 104.7 pips or more, 48 days):
- Up 52% / down 48%: no direction bias.
- On big days the price **trends**: the open-to-close move is a median 63% of the day's range (only 39% on other days).
- The main move usually **starts early**: the day's starting extreme (the low on up days, the high on down days)
  was set in the evening or Asia session on 31 of 48 big days (65%); in Frankfurt/London morning on 14 (29%);
  in New York only 3 (6%). In other words, a big day usually doesn't "start" at the NY open; it is already running.
- At the starting extreme, 25 of 48 (52%) had just traded through the Asia high/low and/or the previous day's
  high/low (a "sweep"); 23 (48%) had no such level.
- Warning signs before big days: a wider Asia range (median 37.0 vs 26.5 pips) and a wider previous day (90.0 vs 79.5).

**All moves of 50+ pips inside a day** (measured with a swing filter: a swing ends when price comes back 25 pips; 336 moves on 157 of 191 days, median size 66 pips, median length about 4 hours):
- Where they start: **NY morning 08:00-12:00 NY: 97 (29%)**, London morning: 79 (24%), Asia: 62 (18%),
  evening before Asia: 37, Frankfurt hour: 23, London midday: 22, NY afternoon: 16 (5%).
- By New York hour, starts peak from 02:00 to 10:00 NY (22-32 per hour), then collapse after 11:00 NY (13, then 6 or fewer).
- 171 of 336 (51%) started at a point where price had just gone beyond the Asia high/low and/or the previous day's
  high/low. Of these, 74 swept both an Asia level and the previous-day level at once.
  Caution: the day's turning points often lie beyond these levels by definition, so this number is only a hint, not proof.

---

## 3. What repeats? (counts out of 191 days unless stated)

### Asia range (00:00-07:00 London)
- Asia range: average 31.6 pips, median 27.4 (middle half 21-36).
- **London (07:00-12:00 London) takes out at least one side of the Asia range on 183/191 = 96% of days.**
  Asia high taken 60%, Asia low taken 62%, both 26%. Both sides taken by the end of the day: 50%.
- First break comes at 07:00-08:00 London on 66% of days, 08:00-09:00 on 21%.
- **After the first break, price usually comes back:** it returned to the middle of the Asia range later that day
  in 146/190 = 77% of cases, and reached the opposite Asia side in 94/190 = 49%.
  But the break also runs first: it went 10+ pips beyond the level before any return in 55% of cases, 20+ pips in 38%, 30+ in 27%.
  The day closed beyond the broken level in 48%. So a break is close to a coin flip as to where the day ends.
- **Trading the break (continuation) lost money in a quick check** (section 7): -32 R over 172 trades.
- Trading the failed break (reversal) was roughly break-even: about 0 R over 161-163 trades.

### Previous day's high (PDH) and low (PDL)
- PDH taken during the day: 84/191 = 44%; on 46 of those 84 (55%) the day closed back below it.
- PDL taken: 103/191 = 54%; on 58 of those 103 (56%) the day closed back above it.
- Outside day (both taken): 14%. Inside day (neither): 16%.

### London vs New York
- New York morning (08:00-12:00 NY) trades beyond the London session's (08:00 London-08:00 NY) high or low on 90% of days.
  Afterwards price came back to the middle of the London range on 56%; the day closed beyond the level on 47%. A coin flip.
- New York kept London's direction on 48% of days (coin flip). When London had moved 30+ pips, New York kept the direction 25/43 = 58%, average +10 pips (small sample, weak).
- London first hour (08:00-09:00 London): the rest of the day kept its direction 47% of the time.
- London 4pm fix (16:00 London = 11:00 NY): the afternoon continued the 08:00 NY-to-fix move only 46% of the time (no usable edge).
- The London 08:00 opening price was traded again after 10:00 London on 166/191 = 87% of days: price rarely runs away from the London open for good.

### Does an earlier move predict a later one? (section 07 of the scripts)
Eleven simple "earlier move vs later move" pairs were tested (previous day, Asia, London first hour, London morning,
NY first hour, etc.). **None showed a useful link**: correlations ran from -0.15 to +0.10, and "follow the earlier
direction" was right 45-52% of the time. The strongest was a weak tendency for London's first hour to be partly undone by
12:00 London (correlation -0.15; fading it was right 53% of the time, about 1.6 pips on average, far too small after costs).
**Plain conclusion: on GBPUSD in this period, simple direction-guessing from earlier moves does not work.** Any edge must
come from *where* price reacts (key levels), not from *which way* it has been going.

---

## 4. News days

**No paid economic calendar is connected** (the FMP calendar requires a higher plan). Dates were built from the
published schedules (US Bureau of Labor Statistics 2026 schedule pages, Federal Reserve and Bank of England
meeting calendars, the usual ONS UK CPI pattern) and from known shutdown delays in Oct-Nov 2025 (September jobs
report moved to 20 Nov 2025; Oct+Nov jobs report on 16 Dec 2025; September CPI on 24 Oct 2025; October CPI cancelled).
**Every date was then checked in the price data**: a real release shows a jump in the 5 minutes from the release
minute. **34 of 37 dates showed a 5-minute range at least 2x normal.** The 3 doubtful ones: US CPI 11 Mar 2026
(1.1x), UK CPI 21 Jan 2026 (1.9x), UK CPI 22 Apr 2026 (1.4x). These may be right with a dull reaction, or the date may be off;
confidence is medium on those three, high on the rest. Full list: `research/news_calendar.py`, results: `research/out_04.txt`.

| Event (release time) | Doha time (summer / winter) | Events | 5-min jump after release (median) | Normal for that 5 min | Range 1h after | Range 4h after | First 15 min direction kept for the next 3h45 |
|---|---|---|---|---|---|---|---|
| US jobs report NFP (08:30 NY) | 15:30 / 16:30 | 8 | 30.2 pips | 6.8 | 55.4 | 66.3 | 4/8 |
| US CPI (08:30 NY) | 15:30 / 16:30 | 8 | 24.5 | 6.8 | 37.8 | 50.9 | **1/8 (usually reversed)** |
| FOMC decision (14:00 NY) | 21:00 / 22:00 | 6 | 25.5 | 4.3 | 43.5 | 57.5 | 3/6 |
| Bank of England (12:00 London) | 14:00 (London summer) / 15:00 (London winter) | 6 | 26.8 | 5.5 | 47.2 | 91.5 | 2/6 |
| UK CPI (07:00 London) | 09:00 / 10:00 | 9 | 18.9 | 5.8 | 28.0 | 36.7 | **8/9 (usually kept)** |

- **News days are wider days:** median daily range 97.6 pips on news days (35 days) vs 77.6 on normal days (156).
  By type: BoE days 136 (widest), FOMC 111, NFP 96, UK CPI 88, US CPI 71 (US CPI days were not wider than normal).
- **Before the news:** in the hour before NFP the median range was 12.5 pips, below the 17-23 pips usual for that hour: a quiet wait.
  Before FOMC and BoE the hour before was not quiet (median 23-24 pips), partly because other events fell nearby.
- **Behaviour after the first reaction:** UK CPI's first 15-minute move kept going in 8 of 9 cases; US CPI's first move was
  undone in 7 of 8 cases. Samples are tiny (8-9 events), so treat these as observations, not rules.
- News days are **not** removed from any test. The owner decides that. In the chosen idea, news days are reported separately.

---

## 5. Bad conditions (when it fakes out or does nothing)
- **Dead hours:** 12:00 NY to 02:00 NY (19:00/20:00 to 09:00/10:00 Doha). Hourly ranges of 9-17 pips, mostly 10-13: costs (1.5 pips)
  eat a large share of any move. Large moves almost never start after 12:00 NY (only 16 of 336 big moves started in the NY afternoon).
- **Fake-outs are the normal case, not the exception:** breaks of the Asia range, the London range and the previous day's
  high/low each ended back inside on roughly half of days or more (sections 3). Buying breakouts without anything else lost money.
- **The 17:00 NY hour** (00:00/01:00 Doha) has a 12.4-pip range but almost no net movement (cleanness 0.32): spread widening at the daily rollover, not real movement.
- **Holiday days** (25 Dec, 1 Jan) are thin; 25 Dec had only 261 one-minute bars.
- **Narrow Asia sessions are NOT a reliable sign of a big London move** in this data: big days had *wider* Asia ranges (median 37 vs 26.5).

---

## 6. Idea chosen for v1: New York false break of the previous day's high or low

**What it is (plain words):** many traders leave their stop-loss orders just above yesterday's high and just below
yesterday's low. When New York opens (08:00-11:00 NY), with US data and big volume, price often pushes through one of these
levels, triggers those orders, and then, if no real buyers (or sellers) follow, falls back to the other side of the level.
We wait for that failure to be **confirmed by a 15-minute candle closing back on the other side**, then trade back the
other way, with the stop just beyond the extreme of the fake move.

**Why it should keep working:** it is based on how orders sit in the market (stops around obvious levels) and on the fact,
measured above, that breaks of obvious levels in GBPUSD fail about half the time or more. The New York morning is when the
largest share of big moves starts (29%) and when volume is highest, so false moves there are large enough to beat costs.

**Evidence (development data only, quick check with costs of 1.5 pips per trade):**
- 66 trades in 9 months (about 7 a month), 48% winners, +12.6 R total (R = amount risked), average +0.19 R per trade,
  profit factor 1.38, worst losing run -3.9 R.
- Both halves positive: Oct-mid Feb +7.9 R (34 trades), mid Feb-Jun +4.7 R (32 trades). 7 of 9 months positive (Feb -0.3 R, Apr -0.6 R).
- Nearby settings give similar results (target 1.5R / 3R, signal window ending 10:00 or 12:00 NY, exit at 12:00 NY: +8 to +16 R).
  But using 5-minute candles (+4.7 R) or 30-minute candles (+1.2 R) instead of 15-minute ones weakens it a lot.
- News days: +5.8 R from 14 trades; normal days +6.8 R from 52 trades.
- **How strong is this? Weak to moderate.** The average result is only about 1.2 standard errors above zero; a bootstrap
  gives about an 11% chance the true average is zero or worse. I also tried about 11 idea/setting combinations before picking
  this one, which raises the chance that it is luck. It is the most promising idea found, not a proven one.
  The hidden Jul-Sep 2026 period is the real test.

**Ideas tested and rejected (all with the same costs):**
| Idea | Trades | Result |
|---|---|---|
| Asia range breakout in London (stop at Asia middle, target 2R or 1R) | 172 | -32 R / -37 R: **clearly negative** |
| Asia range false break in London (15-min close back inside, target opposite side or 2R) | 161 | -7.5 R / -0.8 R: break-even, no edge |
| Same with 5-minute candles | 167 | -19.5 R |
| Previous-day high/low false break during London | 82 | -3.7 R |
| False break of a level that is both Asia AND previous-day extreme, London | 82 | -20.6 R |
| False break of the London range during New York | 130 | -24.3 R |

## 7. Backup ideas (if v1 fails)
1. **Asia false break in London, with the target at the Asia middle** instead of the far side. Supported by the 77% return-to-middle count,
   but the stop has to sit beyond the sweep, so the reward is small; a quick estimate suggests it is only marginal after costs.
2. **UK CPI follow-through**: trade in the direction of the first 15 minutes after UK CPI (8 of 9 kept going). Very small sample; only 9 days a year.
3. **US CPI fade**: trade against the first 15-minute move after US CPI (7 of 8 reversed). Same small-sample problem; could be combined with backup 2 as a "news reaction" strategy if the owner wants to trade news.
