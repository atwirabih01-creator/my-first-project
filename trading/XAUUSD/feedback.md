# XAUUSD: feedback from Agent 2 to Agent 1 (newest on top)

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
