# XAUUSD: feedback from Agent 2 to Agent 1 (newest on top)

---

## v2 "Go with London's break of the Asia range, wide stop" (1R, 8 USD minimum stop): tested 9 Oct 2026

### Verdict: **DROP**
In the one year nobody had seen, **hidden year C (Oct 2022 – Sep 2023), v2 lost 9.1 R over 74 trades** (43% won, PF 0.72), and
11.7 R at double cost. This time it is **not a cost problem**. Before any costs, C lost 6.5 R. Trading every first London break that
year (any stop size, v1 or v2 stop) lost 21.7 R / 9.3 R before costs. The behaviour the whole idea rests on ("gold keeps going after
the London break") held from Oct 2023 to Sep 2026, during gold's rise from about 1,800 to over 5,000 USD, and reversed in 2022–23.
A rule that works in one market mood and fails in another is what we dropped GBPUSD v1 for.

### 1. Consistency check (my code vs. your quick check): **exact match**
`backtest/backtest_v2.py` is my own v1 script, extended to v2: stop at the opposite side of the Asia range, a minimum stop of 8 USD
(only the first break counts), and year C joined in front of the main file. It was run on the main file only (`--design`), as you had it:
- **609 of 609 of your trades match**: same dates, directions and stops, same exit type, and R within 0.00005 per trade.
  Y1 217 / +10.78 R, Y2 157 / +10.77 R, B 59 / +8.42 R, the same as yours.
- **One extra trade: 2 Oct 2023 (+0.96 R, A becomes 177 trades, +16.91 R).** You skip it because it is the first day in the main
  file, so there is no previous day to check the thin-day rule. With year C joined in front, the previous day exists and is a full day,
  so the rules allow the trade. Same cause as the 1–2 Oct 2024 difference in v1. Not a rule problem.
- Clock check on C: every C news date (NFP, CPI, PPI, FOMC, built from the published 2022–23 schedules) shows the release-minute price jump.

### 2. Data warning on hidden year C
The C price file **is missing whole hours on almost every day from 20 Feb to 28 Jul 2023** (e.g. 06:00, 08:00, 10:00, 12:00, 14:00,
16:00 NY absent). The rules' thin-day check (< 1,300 bars) skips those days, so **no trades were possible for about 5.5 months**.
C's usable sample is Oct 2022 – 17 Feb 2023 plus Aug – Sep 2023: **130 signal days, 74 trades (56 skipped for a stop under 8 USD;
the median stop in C was 8.5 USD).** I checked the traded days: their trading hours are complete. I tried to fill the gap from
Dukascopy, but its server refused (rate limit), and mixing two price feeds would weaken the test anyway. **74 trades is a small
sample**, but it is not close: the chance that v2's true average in C is above zero is about 10% (bootstrap), and the before-cost
result over all 130 signal days points the same way.

### 3. Key numbers

**At 0.40 USD cost, 8 USD minimum (the v2 rules):**
| Period | Trades | Win rate | Avg win / loss | Total | PF | Max drawdown | Longest losing run | 3+ loss runs | Chance avg ≤ 0 | Without best 3 | Ended at 16:00 NY |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **C hidden** | 74 | 43.2% | +0.72 / −0.76 | **−9.09 R** | 0.72 | −13.9 R (−13.2%) | 5 | 6 | 90% | −12.02 R | 28 (38%), −5.3 R |
| A (seen) | 177 | 55.9% | +0.77 / −0.76 | +16.91 R | 1.28 | −6.7 R (−6.6%) | 5 | 5 | 7% | +13.95 R | 58 (33%), −0.1 R |
| Y1 (seen) | 217 | 55.8% | +0.66 / −0.72 | +10.78 R | 1.16 | −10.7 R (−10.3%) | 5 | 10 | 18% | +7.80 R | 103 (47%), +11.5 R |
| Y2 (seen) | 157 | 54.8% | +0.62 / −0.60 | +10.78 R | 1.25 | −11.9 R (−11.4%) | 5 | 7 | 12% | +7.78 R | 88 (56%), −1.6 R |
| B (seen) | 59 | 54.2% | +0.72 / −0.54 | +8.42 R | 1.57 | −2.5 R (−2.5%) | 2 | 0 | 7% | +5.44 R | 31 (53%), +0.7 R |
| All 4 years | 684 | 54.1% | +0.69 / −0.70 | +37.80 R | 1.17 | −14.1 R (−13.5%) | 5 | 28 | 3% | +34.80 R | 308 (45%) |

**Cost stress tests (total R per period: C / A / Y1 / Y2 / B):**
| Cost per trade, minimum stop | C | A | Y1 | Y2 | B |
|---|---|---|---|---|---|
| 0.00 USD, 8 USD (before costs) | **−6.45** (74) | +22.37 | +15.18 | +12.00 | +8.94 |
| 0.40 USD, 8 USD (v2) | **−9.09** (74) | +16.91 | +10.78 | +10.78 | +8.42 |
| 0.80 USD, 8 USD (same rules) | **−11.73** (74) | +11.45 | +6.38 | +9.55 | +7.91 |
| 0.80 USD, 16 USD (rule scaled 20× cost) | +0.42 (**10 trades**) | +6.16 (50) | +11.88 (147) | +9.55 (157) | +7.91 (59) |
| 1.20 USD, 24 USD (rule scaled 20× cost) | no trades | +4.27 (16) | +5.02 (88) | +10.68 (151) | +8.45 (58) |
| 1.20 USD, 8 USD (same rules) | **−14.37** (74), losing run 10 | +5.98 | +1.98 | +8.33 | +7.40 |
With the scaled minimum, the rule trades almost never when gold is below about 2,000 USD (10 trades in C, 16 in A), so it cannot be judged there.

**Long / short:** longs C −8.8 R (38% won), A +16.2, Y1 +12.1, Y2 +3.2, B +5.4. Shorts C −0.3, A +0.7, Y1 −1.3, Y2 +7.6, B +3.0.
**News days:** −10.1 R over 115 trades in total (C −3.6, A +3.2, Y1 −9.9, Y2 +2.3, B −2.1). CPI days −7.6 R over 33 trades.
**C by month:** Oct −1.1, Nov −1.4, Dec −0.4, Jan −1.7, **Feb −7.4 (10 trades, 1 won)**, Aug +2.5, Sep +0.3. 5 of 7 months lost, so
the loss is not one bad month: without Feb, C is still −1.7 R over 64 trades.
**Forced close:** 45% of all trades end at 16:00 NY. These made money only in Y1 (+11.5 R); in C they lost 5.3 R.
Full detail: `backtest/summary_v2.txt`; trades `backtest/trades_v2.csv`; every signal day before the minimum-stop rule `backtest/signals_v2.csv`.

### 4. Against the team leader's bar for WORKS
| Requirement | Result | Pass? |
|---|---|---|
| C positive at 0.40 USD | −9.09 R | **No** |
| C positive at 0.80 USD | −11.73 R | **No** |
| Longest losing run ≤ 7 | 5 (every period at 0.40) | Yes |
| Not carried by one month / few trades | Seen years: yes. C: losses spread over 5 of 7 months | Yes (but C is losing) |
| Enough trades in C | 74 (small, because of the data gap and the 8 USD minimum) | Borderline |

### 5. What this means, and suggestions
- **Do not tweak v2 again on Oct 2023 – Sep 2026.** 45 variants have been tried, and every hidden period has now been used. Anything
  tuned further would be fitted to gold's 2023–26 bull market.
- **The "go with the London break" family is regime-dependent.** Your backup ideas (M2, A1a, M1) rest on the same "gold continues"
  finding, and you noted they may fail together. I would treat them as dropped too, unless one is first shown to work in 2022–23
  before costs.
- **If gold is revisited**, a genuinely new idea is needed. It should be judged on data nobody has used: e.g. Oct 2021 – Sep 2022
  (another non-bull gold year) and/or a forward paper test. It should also be checked before costs first, so cost fixes are not
  mistaken for an edge.
- **Data:** ask the team leader to re-source Feb – Jul 2023 (another provider) before C or 2022–23 is used for anything else, and to
  check older HistData gold years for the same hour gaps.
- My recommendation to the team leader: move on to the next market (NASDAQ 100), as with GBPUSD.

*Past results do not guarantee future results.*

---

## v1 "Go with London's break of the Asia range" (1R): tested 9 Oct 2026

### Verdict: **IMPROVE** (not ready for the owner)
The idea is real: **before costs** it made money in all four periods, including hidden year A, which nobody had seen
(A +16.9 R, Y1 +20.6 R, Y2 +18.1 R, B +7.5 R). But the edge is only about +0.07 to +0.13 R per trade. In hidden year A, gold was
cheaper and calmer, the stops were tiny (a typical stop of 6 USD), and the 0.40 USD cost ate all of it: **−0.2 R over 233 trades,
and −17.3 R at double cost**. The main judge (hidden A) fails, so this is not WORKS. It is not DROP, because the behaviour held in
an untouched year and the failure has one clear, fixable cause.

### 1. Consistency check (my code vs. your quick check): **exact match**
My own backtest, written from the rules text only, is `backtest/backtest_v1.py`. It builds 15-minute candles from 1-minute bars,
walks each trade on 1-minute bars, counts the stop first when both are hit in one minute, and uses London/New York clocks
through time-zone conversion.
- Run on design data only, as you had it (`--design`, output `backtest/trades_v1_designonly.csv`): **375 trades, the same 375
  dates, directions, entries and stops, and the same exits.** The R values differ by at most 0.00005 R per trade.
  Result: Y1 218 trades, 54.1%, +12.37 R; Y2 157 trades, 56.7%, +15.84 R. Your figures: 218 / 54.1% / +12.4 R and 157 / 56.7% / +15.8 R.
- On the full 36-month file, Y1 has **2 extra trades** (1 Oct 2024 +0.93 R and 2 Oct 2024 −1.03 R; Y1 becomes 220 trades,
  +12.27 R). This is not a rule difference. With the data cut at 1 Oct 2024, that day looks "thin" (partial start), so it and the
  day after are skipped. With the full history, both are normal days.
- Small differences in how things are recorded, not results: I log the entry time as the candle's close (e.g. 03:30 NY), and you log
  the last minute inside it (03:29). The price is the same.

**Rule wording to make clearer** (none of these changed a trade in this test, but a person trading by hand could read them differently):
- **Rule 11, "the day after a thin day":** 25 Dec and 1 Jan have no prices at all. I treated "the day after" as *the next trading
  day that has prices* (so 26 Dec and 2 Jan are skipped after a thin 24 Dec / 31 Dec). Proposed wording: *"…and no trade on the
  next trading day that has prices."*
- **Rule 6, stop slippage:** twice in 36 months, a 1-minute bar opened beyond the stop, so the fill was worse than the stop (I used the
  bar's open). Proposed addition: *"If price jumps past the stop, the loss can be more than 1R."*
- **Rule 5, entry price:** the test uses the bid close of the signal candle, and the 0.40 USD cost covers the spread. Proposed
  addition: *"Buy orders fill at the ask price, which is the chart price plus the spread."*

### 2. Key numbers (0.40 USD cost)

| Period | Trades | Win rate | Avg win / avg loss | Total | PF | Max drawdown | Longest losing run | 3+ loss runs | At 0.80 USD | Chance true avg ≤ 0 | Without best 3 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **A hidden** Oct 23–Sep 24 | 233 | 54.5% | +0.87 / −1.05 | **−0.21 R** | 1.00 | −9.2 R (−9.0%) | 5 | 8 | **−17.30 R** (PF 0.85) | 51% | −3.16 R |
| Y1 design | 220 | 54.1% | +0.92 / −0.96 | +12.27 R | 1.13 | −8.6 R (−8.4%) | 7 | 9 | +3.94 R | 20% | +9.30 R |
| Y2 design | 157 | 56.7% | +0.83 / −0.86 | +15.84 R | 1.27 | −10.3 R (−9.9%) | 5 | 7 | +13.61 R | 8% | +12.85 R |
| **B hidden** Jul–Sep 26 | 59 | 55.9% | +0.89 / −0.88 | +6.54 R | 1.29 | −3.2 R (−3.1%) | 3 | 2 | +5.59 R | 17% | +3.57 R |
| Hidden A+B | 292 | 54.8% | +0.88 / −1.02 | +6.33 R | 1.05 | −9.2 R (−9.0%) | 5 | 10 | −11.71 R | 35% | +3.36 R |
| **All 36 months** | 669 | 55.0% | +0.88 / −0.96 | +34.44 R | 1.12 | −15.3 R (−14.6%) | 7 | 26 | +5.83 R (PF 1.02; drop −26%) | 8% | +31.45 R |

("Chance true avg ≤ 0" = bootstrap: the trades re-drawn at random 10,000 times; how often the average came out at zero or below.)
Full detail: `backtest/summary_v1.txt`. Week by week: `weekly-report.md` and `backtest/weekly_v1.csv`.

### 3. What worked (with numbers)
- **The direction of the idea holds.** Before costs: A +16.9 R (+0.07 R/trade), Y1 +20.6 R (+0.09), Y2 +18.1 R (+0.12), B +7.5 R (+0.13).
  The win rate was 54–57% in every period, so it is steady, not one lucky stretch.
- **Losing runs are acceptable:** longest 7 (ending 29 Jan 2025, design data); 5 in hidden A; 3 in hidden B.
- **No single month or handful of trades carries the result** in Y1, Y2 or B: without the best 3 trades, each is still positive.
  The best month is about half of Y1's total (May 2025 +7.3 of +12.3 R), so Y1 is the most concentrated.
- **Hidden B (most recent) was positive every month:** Jul +2.5 R, Aug +2.4 R, Sep +1.7 R.
- **Longs held in all four periods:** A +17.6 R, Y1 +6.9 R, Y2 +5.4 R, B +1.4 R.

### 4. What did not work (with numbers)
- **Costs vs. small stops.** Typical stop: A 6.1 USD (0.27% of price), Y1 11.2 USD, Y2 30.9 USD, B 26.4 USD. Cost as a share of
  risk: A 0.073 R per trade, Y1 0.038 R, Y2 0.014 R, B 0.016 R. In A the cost equals the whole edge. Break-even cost in A is about
  0.40 USD, exactly what we charge, while the other periods could carry about 1.00 USD. **v1 only works when gold is expensive and volatile, as it is now.**
- **Stops under 10 USD:** 290 trades, −12.5 R overall (A −2.9 R, Y1 −9.5 R). Stops 10 USD and up: +47 R overall.
- **Shorts in a strong up-year:** A shorts 107 trades, 46% won, **−17.8 R**, with 8 of 12 months negative for shorts. Shorts over 36 months: +3.1 R.
- **News days:** 115 trades, −0.7 R in total, and they flip: A −2.2, Y1 −3.3, Y2 +7.7, B −3.0. By event: CPI −1.1, NFP −2.1, PPI −3.0, FOMC +5.1.
- **Year A month by month:** 6 of 12 months lost. Oct 2023 −5.9 R; Jan 2024 −4.1 R; Sep 2024 −3.1 R.
- **Largest drawdown over 36 months:** −15.3 R (−14.6%) from 12 Jul 2024 to 5 Dec 2024, across the end of A and the start of Y1.
  At double cost it is −28.8 R (−26%).
- **Entry hour, weekday:** no stable pattern. For example, the 09:00 London hour: A −12.3, Y1 −7.3, Y2 +2.1, B +2.9. Wednesday: Y1 −9.5, Y2 +10.4.
  **Do not filter on these.** They flip, so they would be curve-fitting.

### 5. What to change (specific)
1. **Add a minimum-stop rule set from the cost, not from these results.** For example: *"Skip the day if the stop (entry to MID)
   is smaller than 20 times the round-trip cost"* (8 USD at 0.40 USD). For information only, because year A is now opened and
   cannot prove it: with stops ≥ 8 USD, A has 66 trades, +2.7 R (+0.3 R at double cost); Y1 +22.6 R; Y2 +15.8 R; B +6.5 R.
   The same idea measured as % of price (stop ≥ 0.3% of price) **fails in A (−6.4 R)**. So the problem is the dollar cost, not
   calm markets. Choose the multiple once, write down why, and do not tune it.
2. **Find the owner's real gold spread.** The verdict depends on the cost. At 0.40 USD, today's stops (25–30 USD) leave a margin;
   a broker charging 0.80 USD or more would need larger stops.
3. **Consider (do not assume) a trend condition for shorts**, e.g. no shorts when gold is above its 50-day average. Shorts lost
   17.8 R in rising year A. Test it only if it is declared before looking. Y2/B shorts were good, so it may simply cost profit.
4. **Do not add hour, weekday or news filters.** They flip between periods (section 4).
5. **How a v2 can still be proven:** year A and B are now used. A v2 needs data nobody has used:
   (a) an older year, **Oct 2022 – Sep 2023** (gold roughly 1,620–2,080 USD, small stops, so a hard test for the cost rule), downloaded by
   the team leader and kept closed until v2 is frozen; and/or (b) a forward paper test from Oct 2026 (at least 3 months, ~55 trades).
   v2 should pass both before WORKS. It also needs to stay positive at 0.80 USD cost.

### 6. Why IMPROVE and not WORKS (checked against the team leader's bar)
| Requirement | Result | Pass? |
|---|---|---|
| Positive in hidden A | −0.21 R | **No** |
| Positive in hidden B | +6.54 R | Yes (but 59 trades; 17% chance it is luck) |
| Positive at double cost in hidden A | −17.30 R | **No** |
| Longest losing run ≤ 7 | 7 (design), 5 (A), 3 (B) | Yes |
| Not carried by one month or a few trades | OK in Y1/Y2/B; A has nothing to carry | Yes |

*Past results do not guarantee future results.*
