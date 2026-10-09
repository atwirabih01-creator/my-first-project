# EURUSD research (Agent 1), round 1

**Data used:** HistData 1-minute bid prices, correct UTC clock (no clock fix), **design period only: 1 Oct 2024 to 30 Jun 2026**.
The file is read in chunks and each chunk is filtered at once; asserts in `research/common.py` stop the run if a single bar from
hidden test A (Oct 2023 – Sep 2024) or hidden test B (Jul 2026 on) gets through. `data/hidden/` was never opened.

- **Y1** = Oct 2024 – Sep 2025 (258 full days). EURUSD fell from 1.107 to 1.018 (Jan 2025), then rose to 1.17–1.19. A strong trend year,
  and a wide one (average day 86.5 pips, April 2025 tariff shock 140).
- **Y2** = Oct 2025 – Jun 2026 (191 full days). Sideways-to-down, 1.13–1.21, ended at 1.142. **Much quieter** (average day 65.3 pips).
- **Rule for this report:** a finding counts only if it shows in **both** years (and both directions where it has a direction).
- **Day** = 17:00 New York to 17:00 New York. Sunday bars before 17:00 NY belong to Monday. Sessions are set on London's or New York's own clock.
- **Times:** Doha = New York + 7 h in US summer time (2nd Sunday of March to 1st Sunday of November), New York + 8 h in US winter time.
  (Late March and late October have 1–3 weeks where London and New York clocks are out of step; the scripts handle that automatically.)
- **1 pip = 0.0001.** Cost used: 1.2 pips per trade (2.4 pips as the double-cost test).
- Scripts and raw outputs: `trading/EURUSD/research/` (see its `README.md`).

**Data quality (design period):** 5 days have fewer than 1,300 bars: 1 Oct 2024 (partial start), 25 Dec 2024, 25 Dec 2025, **12 May 2026
(missing 07:59–10:00 NY, i.e. the US CPI release)**, 22 May 2026 (three missing hours). These days and the day after each are left out of
level-based studies and of every test. No other gap over 15 minutes falls inside trading hours (the two 61-minute gaps on 31 Mar 2025 and
30 Mar 2026 are the Sunday re-open after the UK clock change).

---

## A. Summary: what held in both years and what did not

| Finding | Y1 | Y2 | Holds? |
|---|---|---|---|
| Busiest hours 08:00–11:00 NY; 10:00 NY is the peak hour | 26.9 pips | 21.2 pips | **Yes** |
| Quiet hours 13:00 NY – 01:00 NY (hourly range ~8–15 pips) | yes | yes | **Yes** |
| London breaks at least one side of the Asia range (07:00–12:00 London) | 92% | 91% | **Yes** |
| First Asia break comes in the 07:00–08:00 London hour | 64% | 58% | **Yes** |
| After the first Asia break price returns to the Asia middle | 70% | 69% | **Yes** |
| ...but the day closes beyond the broken level | 52% | 51% | **Yes: coin flip** |
| Earlier move predicts a later move (11 pairs) | no | no | **Yes: no usable edge** (largest average follow-through 3.5 pips, signs flip) |
| Big days trend (open-to-close / range): big vs other days | 0.66 vs 0.43 | 0.55 vs 0.40 | **Yes** |
| Big days start before London (evening or Asia) | 46 of 64 | 32 of 47 | **Yes** (direction unknown in advance) |
| Big days follow a wider Asia range | 31 vs 24 | 34 vs 21 | **Yes** (descriptive only) |
| News days wider than other days (median) | 90 vs 75 | 64 vs 57 | **Yes** |
| US data (NFP, CPI) and FOMC are the biggest releases for EURUSD; euro-area flash CPI hardly moves it | yes | yes | **Yes** |
| ECB days: the first 15-min move is undone over the next 4 hours | 7 of 8 | 5 of 6 | Yes, but **only 14 events** |
| Day breaks PDH → closes back below | 45% | 49% | Coin flip, no fade edge |
| Day breaks PDL → closes back above | 41% | 44% | Slight lean to continuation, too weak to trade (see V3) |
| Monday is an up day / Wednesday a down day | 62% / 36% up | 64% / 38% up | Same sign both years, **but found by scanning, no clear reason** |
| Wed + Fri NY afternoon drifts down (12:00–16:00 NY, FOMC removed) | −5.5 / −2.8 pips | −2.8 / −2.1 pips | Same sign, **small, data-mined** (see V1/V2) |
| Published "home-hours" effect (EUR weakens in European hours, rises in US hours) | not seen | not seen | **No** |
| London moved 30+ pips → NY reverses | 62% | 61% | Same sign, but the average NY move is only −0.5 / −0.8 pips. Not usable |
| 17:00–19:00 NY "rise" (+1 to +2 pips per hour, t ≈ 3) | yes | yes | **Price-data artefact** (bid price recovering after the rollover spread widening). Not tradable |

**Main lesson, same as GBPUSD:** EURUSD's *timing* is very stable (when it moves, how much, when big moves start), but its *direction*
after any simple, well-known event is a coin flip in both years. The few direction effects that keep their sign in both years are small
(2–6 pips a day against a 1.2-pip cost) and come from scanning many cells, not from a clear market reason.

---

## 1. When does EURUSD move?

### By hour (average high-low range inside each hour, pips; full days only)
| New York | Doha (US summer / winter) | Y1 avg | Y1 median | Y2 avg | Y2 median | Note |
|---|---|---|---|---|---|---|
| 18:00–23:00 | 01:00–06:00 / 02:00–07:00 | 10–15 | 8–12 | 8–11 | 6–9 | Asia: quiet (Tokyo open 20:00 NY a little busier) |
| 00:00–01:00 | 07:00–08:00 / 08:00–09:00 | 9–12 | 8–10 | 8–10 | 7–8 | |
| 02:00 | 09:00 / 10:00 | 18.4 | 16.0 | 13.9 | 12.8 | Frankfurt + London open |
| 03:00 | 10:00 / 11:00 | 22.1 | 18.9 | 15.7 | 14.3 | London morning peak |
| 04:00 | 11:00 / 12:00 | 19.3 | 17.1 | 15.0 | 12.8 | |
| 05:00–07:00 | 12:00–14:00 / 13:00–15:00 | 16–17 | 14–15 | 12–15 | 11–13 | London lunch / pre-NY |
| **08:00** | **15:00 / 16:00** | **26.8** | 21.3 | **19.3** | 15.9 | US data at 08:30 |
| 09:00 | 16:00 / 17:00 | 23.8 | 20.4 | 18.0 | 16.1 | US stocks open 09:30 |
| **10:00** | **17:00 / 18:00** | **26.9** | **24.4** | **21.2** | **19.3** | **peak hour both years** |
| 11:00 | 18:00 / 19:00 | 21.7 | 19.0 | 17.0 | 15.0 | London 4pm fix and London close |
| 12:00–16:00 | 19:00–23:00 / 20:00–00:00 | 10–17 | 8–15 | 8–13 | 7–12 | fading |
| 17:00 | 00:00 / 01:00 | 8.3 | 6.4 | 7.5 | 6.7 | rollover: wide spreads, least net movement (cleanness 0.39) |

### By session (local clocks)
| Session | Doha (summer / winter) | Y1 avg / median | Y2 avg / median | Made the day's high / low (Y1; Y2) |
|---|---|---|---|---|
| Asia 00:00–07:00 London | 02:00–09:00 / 03:00–10:00 | 32.2 / 25.4 | 25.3 / 22.1 | 20%/15%; 19%/16% |
| Frankfurt hour 07:00–08:00 London | 09:00–10:00 / 10:00–11:00 | 18.9 / 16.2 | 14.6 / 13.0 | 4%/4%; 6%/3% |
| London morning 08:00–12:00 London | 10:00–14:00 / 11:00–15:00 | 38.0 / 31.7 | 28.5 / 25.7 | 16%/12%; 10%/12% |
| London full 08:00–16:30 London | 10:00–18:30 / 11:00–19:30 | 64.2 / 57.7 | 48.7 / 43.6 | 44%/41%; 41%/40% |
| London–NY overlap 08:00 NY – 16:00 London | 15:00–18:00 / 16:00–19:00 | 46.1 / 41.6 | 34.5 / 32.8 | 24%/22%; 24%/20% |
| New York 08:00–17:00 NY | 15:00–00:00 / 16:00–01:00 | 61.7 / 55.9 | 47.0 / 41.9 | 49%/49%; 55%/55% |
| NY afternoon 12:00–17:00 NY | 19:00–00:00 / 20:00–01:00 | 33.0 / 27.2 | 26.5 / 21.3 | 22%/21%; 24%/29% |
| Evening 17:00 NY – 00:00 London | 00:00–02:00 / 01:00–03:00 | 14.6 / 10.4 | 12.3 / 10.1 | 8%/17%; 8%/13% |
**Whole day:** Y1 average 86.5, median 77.3 (middle half 59–101); Y2 average 65.3, median 59.1 (middle half 45–76).

### By weekday (median day range, pips; share of up days)
| | Mon | Tue | Wed | Thu | Fri |
|---|---|---|---|---|---|
| Y1 range | 76.9 | 75.5 | 76.4 | 85.0 | 76.8 |
| Y2 range | 61.2 | 58.2 | 59.3 | 59.0 | 58.5 |
| Y1 up days | 62% | 52% | **36%** | 46% | 54% |
| Y2 up days | 64% | 50% | **38%** | 41% | 45% |
- Range: no weekday stands out in both years (Thursday was widest only in Y1).
- Direction: Monday up / Wednesday down kept its sign in both years (about 90 days each). By quarter it is not steady
  (Wednesday was positive in Q3 and Q4 2025; Monday negative in Q4 2024 and Q3 2025). I found it by scanning 5 weekdays × 5 day-parts,
  so part of it is likely luck. Monday's rise sits mostly in the Asia session (+7.9 / +3.8 pips on average).
### By month (average day range)
Widest: Apr 2025 (140, tariff shock), Nov 2024 (96), Mar 2026 (97). Quietest: Dec 2025 (49), Oct 2024 (50), Nov 2025 (52).

## 2. Where do big moves come from?
**Big days** = top 25% of days in each year (Y1 ≥ 101 pips, 64 days; Y2 ≥ 76 pips, 47 days). `research/out_02_*.txt`.
- Direction: up 59% (Y1, a rising year), 53% (Y2). No useful lean.
- They trend: open-to-close is 66% (Y1) / 55% (Y2) of the range, against 43% / 40% on other days.
- **They start early:** the starting extreme was set in the evening or Asia session on 46 of 64 (Y1) and 32 of 47 (Y2) big days.
  Only 8 and 2 started in the NY morning.
- 36 of 64 and 27 of 47 started with no sweep of an Asia or previous-day level.
- Before big days the Asia range is wider (31 vs 24; 34 vs 21 pips) and the previous day was wider (86 vs 75; 67 vs 57).
  **None of this tells the direction.**
**All moves of 40+ pips** (a swing ends after a 20-pip pullback; Y1 751 moves, Y2 295; median about 52 pips):
- Biggest start window: NY morning 08:00–12:00 NY (33% Y1, 26% Y2), then London morning (20%, 22%) and Asia (19%, 21%).
- After 12:00 NY: 10% (Y1) and 6% (Y2).
- Start at a sweep of an Asia/previous-day level: 48% (Y1) and 47% (Y2), which is about what chance gives.

## 3. Repeating behaviours (counts per year)
| Behaviour | Y1 (256 days) | Y2 (187 days) |
|---|---|---|
| Asia range (median) | 25.6 pips | 22.2 pips |
| Asia high taken 07–12 London | 60% | 55% |
| Asia low taken 07–12 London | 53% | 58% |
| Both Asia sides taken 07–12 London | 21% | 22% |
| Neither Asia side taken all day | 0% | 0% |
| First break runs 10+ pips before any return to the Asia middle | 62% | 52% |
| First break runs 20+ pips before any return to the Asia middle | 42% | 35% |
| Returns to the Asia middle later | 70% | 69% |
| Reaches the opposite Asia side later | 45% | 49% |
| Day closes beyond the first broken level | 52% | 51% |
| PDH traded / closed back below | 48% / 45% | 42% / 49% |
| PDL traded / closed back above | 45% / 41% | 52% / 44% |
| Outside day / inside day | 9% / 16% | 11% / 17% |
| London 08:00 open price traded again after 10:00 London | 77% | 82% |
| NY (08:00–17:00 NY) continues London's direction (08:00 London → 08:00 NY) | 46% | 52% |
| Rest of the day continues London's first hour (08–09 London) | 48% | 53% |

**Does an earlier move predict a later one?** (`out_07_ALL.txt`, 11 pairs, about 443 days): all correlations between −0.07 and +0.09.
"Follow the earlier direction" was right 47–53% of the time; average follow-through −5.1 to +3.5 pips, with the sign flipping between
the years on 5 of 11 pairs. The NY first hour (08–09 NY → 09–12 NY) fade that GBPUSD showed is −3.3 / −0.3 pips here: not stable.

**Direction by hour** (`out_05.txt`): no hour has a move of more than 2 pips on average in both years with the same sign, except
the 17:00–18:00 NY hours (+1.2 / +0.8 and +1.8 / +1.0 pips). That is the bid price recovering after the spread widens at the 17:00 NY
rollover (our data are bid prices only), not a real move you could trade. The 16:00 NY hour drifts slightly down in both years for
the same reason, so **any rule that exits at 16:59 NY on bid data will look a little too good for shorts.** My tests exit at 15:59 NY.

## 4. News days
No paid calendar is connected. US dates (NFP, CPI, FOMC) are those already checked for GBPUSD (including the Oct–Nov 2025 shutdown delays).
ECB, euro-area flash HICP and HCOB flash PMI dates were built from the ECB meeting calendar and the Eurostat / S&P Global release
patterns. **Each date was checked in EURUSD prices** (5-minute range from the release minute vs the same minutes on all other days).
Full table: `research/out_06.txt` and `out_06_events.csv`.

| Event (release time) | Doha (summer / winter) | 5-min jump Y1 / Y2 (median pips) | Normal | Hour before | Hour after Y1 / Y2 | 4 h after Y1 / Y2 | Day range Y1 / Y2 |
|---|---|---|---|---|---|---|---|
| US NFP (08:30 NY) | 15:30 / 16:30 | 49.2 / 27.3 | 6.3 | 17 / 9 | 63 / 40 | 78 / 48 | 103 / 67 |
| US CPI (08:30 NY) | 15:30 / 16:30 | 44.2 / 26.0 | 6.3 | 12 / 11 | 49 / 27 | 89 / 39 | 97 / 48 |
| FOMC (14:00 NY) | 21:00 / 22:00 | 29.0 / 20.6 | 3.4 | 14 / 11 | 53 / 47 | 71 / 67 | 99 / 97 |
| ECB decision (14:15 Frankfurt) | 15:15 / 16:15 | 19.5 / 12.8 | 4.5 | 14 / 20 | 53 / 31 | 63 / 43 | 78 / 87 |
| ECB press conference (14:45 Frankfurt) | 15:45 / 16:45 | 10.7 / 10.1 | 5.5 | | 41 / 23 | | |
| German flash PMI (09:30 Frankfurt) | 10:30 / 11:30 | 13.9 / 7.1 | 4.7 | 25 / 19 | 22 / 17 | 36 / 23 | 69 / 64 |
| Euro-area flash PMI (10:00 Frankfurt) | 11:00 / 12:00 | 8.1 / 4.4 | 4.9 | | 20 / 13 | 35 / 26 | 69 / 64 |
| Euro-area flash CPI (11:00 Frankfurt) | 12:00 / 13:00 | 5.1 / 5.0 | 4.4 | 19 / 12 | 17 / 13 | 48 / 34 | 95 / 56 |
(Frankfurt and Doha differ by 1 hour in European summer time and 2 hours in winter.)

- **News days are wider** in both years: median 90 vs 75 pips (Y1), 64 vs 57 (Y2). US-news days are the widest (98 / 65).
- **US releases matter far more than euro-area ones** for EURUSD. Euro-area flash CPI barely moves it at the release minute (ratio about 1.1x),
  because Germany and the big countries publish their own numbers earlier.
- **Direction after the first 15 minutes** (did minutes 15–240 continue it?): NFP 58% / 50%, US CPI 42% / 43%, FOMC 25% / 83% (flips),
  PMIs 33–56%. **No usable direction.**
- **ECB days:** the first 15-minute move after the 14:15 decision was undone by 4 hours later on **12 of 14** ECB days
  (7 of 8 in Y1, 5 of 6 in Y2), in both directions (7 first moves up, 7 down). The press conference at 14:45 seems to reverse the
  knee-jerk. Interesting, but 14 events in 21 months is far too few to build on or to trust.
- **Hour before:** quieter than usual before NFP / US CPI (median 9–17 pips), not before FOMC or ECB.

**Date checks:** 87 of 143 events show a jump of at least 2x normal. All NFP, FOMC and all but two US CPI dates are confirmed.
Doubtful or unconfirmed:
- **US CPI 12 May 2026: no data** (the hours around the release are missing). US CPI 10 Apr 2026: small jump (1.65x), but the biggest of the surrounding weekdays, so the date is right.
- **ECB decision** 30 Jan 2025, 24 Jul 2025, 30 Oct 2025, 11 Jun 2026: dull at 14:15 (1.1–1.6x). The dates are the published meeting dates;
  the decision was fully expected and the move came at the press conference or not at all. ECB press conference 5 Feb 2026 shows no jump at all (0.56x).
- **Euro-area flash CPI:** 15 of 20 dates are below 2x, so prices cannot confirm them. 2025-08-01, 2026-04-30 and 2026-06-02 were not even the
  most active day of their week at 11:00 Frankfurt. Treat the whole euro-area CPI list as **unverified**.
- **Flash PMI:** 18 of 21 euro-area and 8 of 21 German dates below 2x. 24 Jul 2025, 16 Dec 2025, 23 Apr 2026 (euro-area) look wrong or dull.
  Treat the PMI list as **partly unverified**.

## 5. Calm vs volatile, trending vs ranging (`out_08.txt`)
Measures known before the day starts: **ER5** = net move of the last 5 days / their high-low range (≥ 0.5 = trending, same cut-off as GBPUSD);
**VOLR** = average range of the last 5 days / last 60 days (≥ 1 = volatile).

| Year | Mood | Days | Median range | Asia break holds (day closes beyond) | PDH break closes back | PDL break closes back | NY continues London | Wed+Fri NY pm drift | Other days NY pm drift |
|---|---|---|---|---|---|---|---|---|---|
| Y1 | ranging | 145 | 79.5 | 48% | 40% | 47% | 51% | −5.5 | +3.8 |
| Y1 | trending | 93 | 82.5 | 57% | 49% | 38% | 42% | −7.9 | −0.9 |
| Y2 | ranging | 97 | 58.9 | 57% | 53% | 37% | 57% | −6.8 | −0.6 |
| Y2 | trending | 90 | 60.6 | 46% | 44% | 52% | 47% | −3.1 | +3.8 |
| Y1 | calm | 135 | 80.3 | 54% | 45% | 43% | 47% | −6.5 | +1.8 |
| Y1 | volatile | 103 | 81.9 | 49% | 41% | 45% | 48% | −6.4 | +2.2 |
| Y2 | calm | 136 | 56.7 | 56% | 50% | 43% | 51% | −6.7 | +0.5 |
| Y2 | volatile | 51 | 66.7 | 39% | 47% | 46% | 53% | −1.2 | +4.3 |
- Trending and ranging stretches **flip** between the years for every breakout/fade measure (e.g. Asia break holds 57% in trending Y1 but 46% in
  trending Y2). A "mood switch" would not have helped here either.
- The only measure with the same sign in all 8 cells is the Wed + Fri NY-afternoon drift (−1.2 to −7.9 pips). It is tested below.

## 6. Where EURUSD differs from GBPUSD
| | EURUSD | GBPUSD |
|---|---|---|
| Typical day | 86.5 (Y1) / 65.3 (Y2) pips | 95.0 / 87.0 pips |
| Y2 calmer than Y1 by | **25%** | 8% |
| Peak hour | 10:00 NY, with 08:00 NY almost as big | 10:00 NY |
| First Asia break in the 07–08 London hour | 64% / 58% | 71% / 66% |
| Biggest release | US NFP / CPI (home releases are minor) | BoE decision (home release is the biggest) |
| PDH/PDL break, day closes back | 41–49% (lean to continuation in both years) | flipped between years (44–57%) |
| GBPUSD's v1 idea (NY false break of PDH/PDL) | **loses in both years** (V0 below) | lost in Y1, won in Y2 |
| Shared | Stable timing, coin-flip direction, big days start before London, afternoon is dead | same |

## 7. Ideas considered
- **Data-driven candidates with the same sign in both years:** (a) Wed + Fri NY-afternoon weakness, (b) Monday up / Wednesday down,
  (c) ECB-day reversal of the first reaction, (d) slight continuation after PDH/PDL breaks. None has a strong market reason I can defend:
  (a) might come from position-squaring before the Wednesday triple-rollover (a long-EUR position pays three days of interest
  difference) and before the weekend, but I cannot prove it, and the size (2–6 pips) is close to the cost.
- **Known ideas checked and not found:** the published "home-hours" effect (EUR weakens in European hours), intraday momentum
  (morning move predicts the afternoon), Asia-range breakout/fade, London-move continuation into NY.

## 8. Rule variants tested (each fixed in writing before it was run). `research/09_variants.py`, output `out_09.txt`
Fill: market entry at the stated price, stop checked on every following 1-minute bar, forced close at the close of the 15:59 NY bar
(avoids the rollover-spread artefact). Costs 1.2 pips per trade, 2.4 pips as the double-cost test. Days skipped: incomplete days, the day
after one, and any day with a gap of more than 15 minutes inside the hours the rule uses. Minimum stop 2.4 pips (20 x cost).

| # | Variant | Y1 trades / win / total / per trade | Y2 trades / win / total / per trade | Y1 / Y2 at 2.4 pips | Without best 3 (Y1 / Y2) | Longest losing run | Long vs short |
|---|---|---|---|---|---|---|---|
| V0 | GBPUSD v1 replica: NY 08–11 false break of PDH/PDL, 2R | 92 / 40% / −9.5 R / −0.10 | 74 / 36% / −11.3 R / −0.15 | −21.9 / −25.9 | −15.3 / −17.1 | 7 / 9 | Y2 longs −16.6 R |
| V1 | Wed + Fri NY-afternoon short, 12:00 → 15:59 NY, stop 0.25 x ADR20 (median 20.5 pips) | 87 / 49% / +4.2 R / **+0.05** | 57 / 47% / +8.6 R / +0.15 | −0.6 / +4.6 | **−5.0** / +0.3 | 5 / 7 | shorts only |
| V2 | Same, stop 0.40 x ADR20 (median 32.9 pips) | 87 / 52% / +5.3 R / **+0.06** | 57 / 47% / +6.5 R / +0.12 | +2.3 / +4.0 | **−2.4** / +1.3 | 5 / 7 | shorts only |
| V3 | PDH/PDL breakout continuation: NY 08–11, 15-min close beyond, stop 0.25 x ADR20, 2R | 129 / 44% / −4.0 R / −0.03 | 86 / 41% / −7.1 R / −0.08 | −11.3 / −13.3 | −9.9 / −12.9 | 7 / 6 | shorts −6.8 / −10.6 R |

(ADR20 = average daily high-low range of the previous 20 full trading days. V3 was declared after V0–V2, from the research finding
that PDH/PDL breaks lean slightly toward continuation.)

**Result: nothing meets the bar.**
- V0 and V3 lose in both years: trading the previous-day levels in New York, either way (fade or follow), has no edge after costs.
- V1/V2 are positive in both years, but the Y1 edge is only +0.05 to +0.06 R per trade, Y1 turns **negative without its best 3 trades**,
  Y1 is about zero at double cost, it trades **one direction only**, and it was found by scanning 25 weekday x day-part cells.
  This is exactly the profile that shrank to nothing on unseen data for Nasdaq.

## 9. Conclusion
EURUSD, like GBPUSD, has **reliable timing and no reliable direction** for the simple setups tested. 4 rule variants were tested;
none passes. **I am not sending a v1 to Agent 2**, so hidden test A (Oct 2023 – Sep 2024) stays unused.
