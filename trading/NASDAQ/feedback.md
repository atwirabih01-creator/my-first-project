# NASDAQ 100: feedback from Agent 2 to Agent 1 (newest on top)

---

## v1 "Fade the big opening gap": hidden year C (Oct 2021 – Sep 2023) and FINAL verdict, 9 Oct 2026

### Final verdict: **DROP**
The unchanged v1 was run on two more years nobody had seen (C, including the whole 2022 bear market). It made **+3.1 R over 80 trades
(+0.04 R per trade, PF 1.11)**, and −1.4 R without its 3 best trades. Across **all unseen data (C + A + B): 169 trades, +6.7 R,
+0.04 R per trade, PF 1.12, about a 1 in 4 chance of no edge at all (bootstrap 26%)**, against +0.14 R per trade in the design years.
Each unseen period is negative without its 3 best trades, and the long side has no edge on unseen data (84 trades, +0.1 R).
It does not lose money, but it does not show an edge you can rely on, so it is not handed to the owner.

### 1. How it was run
- `backtest/backtest_v1.py --with-c`: **the same rules and code**. I only added the 2021–23 US holidays and early closes from the published
  NYSE/Nasdaq calendars, the C earnings dates (labels only), and joined `data/hidden/NSXUSD_M1_2021-10_2023-09.csv.gz` in front of
  the main file (one continuous run, Oct 2021 – Sep 2026). Outputs: `trades_v1_withC.csv`, `days_v1_withC.csv`, `summary_v1_withC.txt`
  (`analyze_withC.py`), `weekly_v1_withC.csv`.
- **C days: 516.** Traded 80; gap too small 278. **Missing price data: 109 days with a hole of more than 15 minutes** (Jan 2, Feb 6,
  Mar 23, Apr 19, May 22, Jun 21, Jul 19), 3 more days skipped as the day after one, and 9 days of ATR warm-up in early Aug 2023 after
  the gap. Holidays 14, early closes 3, day after a holiday or early close 10. ATR warm-up at the start: 10 days (1–14 Oct 2021).
  So C is really Oct 2021 – Feb 2023 plus mid-Aug – Sep 2023.
- In the joined run A gets 2 trades in early Oct 2023 that were warm-up before (3 Oct and 6 Oct 2023, −0.42 R together): A is now
  63 trades, +1.91 R (the A-only run was 61 trades, +2.33 R). Macro news days (NFP/CPI/PPI/FOMC) are not labelled in C.

### 2. Key numbers (2.0 points cost)
| Period | Trades | Win rate | Avg win / loss | Total | PF | Max drawdown | Longest losing run | 3+ loss runs | Chance avg ≤ 0 | Without best 3 |
|---|---|---|---|---|---|---|---|---|---|---|
| **C hidden** Oct 21 – Sep 23 | 80 | 48.8% | +0.78 / −0.67 | **+3.11 R** | 1.11 | −8.2 R (−7.9%) | 5 | 8 | 33% | **−1.37 R** |
| C1: Oct 21 – Dec 22 (bear market) | 65 | 47.7% | +0.80 / −0.67 | +1.91 R | 1.08 | −8.2 R (−7.9%) | 5 | 6 | 40% | −2.57 R |
| C2: 2023 (Jan–Feb, Aug–Sep) | 15 | 53.3% | +0.72 / −0.65 | +1.20 R | 1.26 | −2.3 R | 3 | 2 | 34% | −2.01 R (sample too small) |
| A hidden (joined run) | 63 | 52.4% | +0.67 / −0.67 | +1.91 R | 1.10 | −4.6 R (−4.5%) | 4 | 2 | 37% | −2.18 R |
| B hidden | 26 | 53.8% | +0.62 / −0.58 | +1.64 R | 1.23 | −1.4 R | 4 | 1 | 33% | −1.94 R |
| **All unseen C + A + B** | 169 | 50.9% | +0.71 / −0.66 | **+6.67 R** | 1.12 | −8.2 R (−7.9%) | 5 | 11 | **26%** | +2.19 R |
| Design Y1 + Y2 | 128 | 59.4% | +0.68 / −0.65 | +17.81 R | 1.53 | −8.3 R (−8.0%) | 6 | 5 | 2% | +11.74 R |
| All 5 years | 297 | 54.5% | +0.69 / −0.65 | +24.48 R | 1.28 | −8.3 R (−8.0%) | 6 | 16 | 3% | +18.41 R |

**Cost stress (total R at 0 / 2 / 4 / 6 points):** C +3.93 / +3.11 / +2.29 / +1.48; C1 +2.55 / +1.91 / +1.27 / +0.64;
C2 +1.38 / +1.20 / +1.02 / +0.84; unseen C+A+B +8.47 / +6.67 / +4.87 / +3.07.

**Long vs short:**
| Period | Longs (after gap down) | Shorts (after gap up) |
|---|---|---|
| C | 47 tr, 43% won, **−2.19 R** (−2.67 at 4.0) | 33 tr, 58% won, +5.30 R |
| C1 bear market | 39 tr, 41% won, **−2.92 R** | 26 tr, 58% won, +4.83 R |
| C2 2023 | 8 tr, +0.74 R | 7 tr, +0.46 R |
| A | 26 tr, −0.42 R | 37 tr, +2.33 R |
| B | 11 tr, +2.70 R | 15 tr, −1.05 R |
| **Unseen C + A + B** | **84 tr, 50% won, +0.09 R (−0.83 at 4.0)** | 85 tr, 52% won, +6.58 R |
The side that works flips with the market's mood: buying gap-downs failed in the 2022 bear market, shorting gap-ups failed in the
2026 rally (Q2 2026 −4.8 R, B −1.1 R).

**Exits:** C target 26 (32%) +23.5 R, stop 16 (20%) −16.2 R, 16:00 close 38 (48%) **−4.3 R**. All unseen data: 16:00 closes 86 trades −3.2 R.
Over 5 years, 151 of 297 trades (51%) ended at 16:00, −3.9 R in total.

**C by quarter:** 2021Q4 +4.56, 2022Q1 +0.67, **2022Q2 −3.60, 2022Q3 −2.62**, 2022Q4 +2.90, 2023Q1 +0.66, 2023Q3 +0.54.
12 of 19 months positive; without its best month (Nov 2021, +2.59 R) C is +0.52 R. Unseen C+A+B: 20 of 34 months positive,
**−1.44 R without its 3 best months.**
**Days after big-tech earnings:** C +3.02 R (9 trades), so the A/B weakness (−4.0 R) was not a real pattern. Do not build on it.

### 3. Against the team leader's bar for WORKS (unseen data C + A + B)
| Requirement | Result | Pass? |
|---|---|---|
| Positive at 2.0 points | C +3.11, A +1.91, B +1.64 | Yes, but tiny |
| Positive at 4.0 points | C +2.29, A +1.12, B +1.46 | Yes, but tiny |
| Longs and shorts not clearly negative | Longs C −2.19 (bear market −2.92), unseen total +0.09; shorts B −1.05 | **Borderline: longs have no edge** |
| Longest losing run ≤ 7 | 5 in C, 6 over 5 years | Yes |
| Not carried by a month or a handful of trades | C −1.37, A −2.18, B −1.94 without best 3; C+A+B −1.44 without best 3 months | **No** |
| Clear evidence of an edge | +0.04 R per trade, 26% chance of none | **No** |

### 4. What this means, and suggestions
- **Big Nasdaq gaps are only partly taken back, and not reliably enough to pay.** The design years (+0.14 R per trade) were the best
  two years of five, not typical ones. On unseen data the edge is about a quarter of that.
- **Do not rescue v1 by trading only shorts.** Shorts were positive on unseen data overall (+6.6 R), but they lost in B and in
  Q2 2026, and choosing a side after seeing all five years would be fitting to the past. All the Nasdaq hidden data is now used up.
- **If Nasdaq is revisited**, a genuinely new idea is needed, judged first before costs, and on new data (a forward paper test, or
  years before Oct 2021).
- My recommendation to the team leader: **move on to the next market (EURUSD).**

*Past results do not guarantee future results.*

---

## v1 "Fade the big opening gap": tested 9 Oct 2026

### Verdict: **IMPROVE** (not ready for the owner)
In the year nobody had seen, **hidden year A (Oct 2023 – Sep 2024), v1 made only +2.3 R over 61 trades** (52.5% won, PF 1.12,
+0.04 R per trade). That is about a third of a chance (34%) of being no edge at all, and the whole profit comes from April 2024
and from the 3 best trades: **without them A is −1.8 R.** Hidden B (Jul – Sep 2026) is the same: +1.6 R over 26 trades, −1.9 R
without its best 3. It is not DROP, because nothing broke: every period is positive at every cost up to 6 points, the losing runs
are short, and the idea is simple and two-sided. But the edge on unseen data is too small to call proven.

### 1. Consistency check (my code vs. your quick check): **match, with 2 small and 1 expected difference**
My own backtest, written from the rules text only: `backtest/backtest_v1.py` (New York time by time-zone conversion, US holidays
and early closes from the NYSE/Nasdaq calendars, 1-minute walk, stop first when both are hit in the same minute, 2.0 points cost).
- **Design data only** (`--design`, as you had it, output `backtest/trades_v1_designonly.csv`): **the same 127 trades** (same dates,
  directions, entries, stops, exits). Y1 63 trades, 60.3%, **+11.85 R** (yours +11.86); Y2 64 trades, 59.4%, **+6.00 R** (yours +6.05).
  125 of 127 trades agree to within 0.0001 R.
- **The 2 differences are stop slippage:** on 1 Aug 2025 and 31 Mar 2026 the 1-minute bar *opened* beyond the stop. Your code fills
  at the stop price; mine fills at that bar's open (−151.9 instead of −150.5 points, and −262.3 instead of −250.0 points),
  as your own rule 12 says ("If price jumps past the stop, the loss can be more than 1R"). Effect: −0.06 R in total.
- **On the full 36-month file, Y1 has 1 extra trade: 4 Oct 2024 (−0.06 R; Y1 becomes 64 trades, +11.81 R).** With the data cut at
  1 Oct 2024 that day is in your ATR warm-up; with the full history the ATR exists. Not a rule difference.
- Rule 4 ("already filled in the first 5 minutes") never happened in 36 months: every day with a gap above 0.5 ATR was traded.

**Rule wording to make clearer** (none changed a trade here, but a person trading by hand could read them differently):
- **Rule 1, data holes:** say *"more than 15 consecutive missing 1-minute bars between 09:30 and 15:59 NY"*. Holes found: 12 Aug 2024
  (29 min), 24 Oct 2024 (240), 28 Oct 2024 (180), 14 Nov 2024 (180), 12 Mar 2026 (60). **Friday 25 Sep 2026 is missing completely**
  in the data file (only the evening of the 24th is there), so 25 and 28 Sep 2026 were skipped.
- **Rule 2, the 14 days:** say *"the 14 previous days that have any price data (holiday sessions count in the 14 and are then dropped)"*.
- **Rule 7, target fill:** add *"the target fills at PC exactly, even if price jumps past it"* (that is what both tests do).
- **Rule 6/12, stop fill:** your test code should fill at the bar's open when the bar opens past the stop, as the text says.
- **Clock note for the owner:** in US winter time the forced close is 00:00 in Doha, which is already the next calendar day there.

### 2. Key numbers (2.0 points cost)

| Period | Trades | Win rate | Avg win / loss | Total | PF | Max drawdown | Longest losing run | 3+ loss runs | Chance avg ≤ 0 | Without best 3 |
|---|---|---|---|---|---|---|---|---|---|---|
| **A hidden** Oct 23 – Sep 24 | 61 | 52.5% | +0.67 / −0.66 | **+2.33 R** | 1.12 | −4.6 R (−4.5%) | 4 | 2 | 34% | **−1.76 R** |
| Y1 design | 64 | 59.4% | +0.73 / −0.62 | +11.81 R | 1.74 | −3.6 R (−3.5%) | 4 | 2 | 3% | +5.96 R |
| Y2 design | 64 | 59.4% | +0.62 / −0.67 | +6.00 R | 1.34 | −8.3 R (−8.0%) | 6 | 3 | 16% | +0.85 R |
| **B hidden** Jul – Sep 26 | 26 | 53.8% | +0.62 / −0.58 | **+1.64 R** | 1.23 | −1.4 R (−1.4%) | 4 | 1 | 33% | **−1.94 R** |
| Hidden A + B | 87 | 52.9% | +0.65 / −0.64 | +3.97 R | 1.15 | −4.6 R (−4.5%) | 4 | 3 | 29% | −0.12 R |
| **All 36 months** | 215 | 56.7% | +0.67 / −0.64 | +21.78 R | 1.37 | −8.3 R (−8.0%) | 6 | 8 | 3% | +15.71 R |

("Chance avg ≤ 0" = bootstrap: the trades re-drawn at random 10,000 times; how often the average came out at zero or below.)

**Cost stress (total R):**
| Cost per trade | A | Y1 | Y2 | B | All |
|---|---|---|---|---|---|
| 0.0 points (before costs) | +3.10 | +12.41 | +6.52 | +1.83 | +23.85 |
| **2.0 points (rule)** | **+2.33** | +11.81 | +6.00 | +1.64 | +21.78 |
| 4.0 points | +1.56 | +11.21 | +5.49 | +1.46 | +19.71 |
| 6.0 points | +0.78 | +10.60 | +4.98 | +1.27 | +17.64 |
Costs are not the problem: stops are 150–300 points, so 2 points is only about 0.01 R per trade. The weakness in A is there before costs.

**Long (after gap down) vs short (after gap up):**
| Period | Longs | Shorts |
|---|---|---|
| A | 24 tr, 58% won, **0.00 R** (−0.34 R at 4.0) | 37 tr, 49% won, +2.33 R |
| Y1 | 24 tr, +5.72 R | 40 tr, +6.09 R |
| Y2 | 26 tr, +3.76 R | 38 tr, +2.24 R |
| B | 11 tr, +2.70 R | 15 tr, **−1.05 R** |
| All | 85 tr, 61% won, +12.17 R | 130 tr, 54% won, +9.61 R |

**Exits (all 36 months):** target 65 trades (30%) +58.9 R; stop 37 (17%) −37.4 R; **16:00 close 113 (53%) +0.3 R** (A +0.1, Y1 −0.2,
Y2 −0.6, B +1.0). Only 1 stop filled noticeably worse than the stop (−1.06 R).

Full detail: `backtest/summary_v1.txt`; trades `backtest/trades_v1.csv`; every day and why it was or was not traded `backtest/days_v1.csv`;
week by week `weekly-report.md` and `backtest/weekly_v1.csv`.

### 3. What worked (with numbers)
- **Never a losing period**, at any cost: A, Y1, Y2 and B are all positive at 0, 2, 4 and 6 points.
- **Losing runs are short:** longest 6 (ending 19 May 2026), 4 in both hidden periods. Only 8 runs of 3+ losses in 36 months.
- **Drawdown is moderate:** worst −8.3 R (−8.0%) in spring 2026; −4.6 R in A.
- **Longs after big gap-downs** made money in Y1, Y2 and B (+5.7, +3.8, +2.7 R, 58–67% won).
- **The design years are not one lucky month:** Y1 9 of 12 months positive, +8.3 R without its best month; Y2 6 of 9, +3.0 R without its best.
- **A bigger threshold is not needed and a smaller one is worse:** all 4 gap-size bands above 0.5 ATR made money overall
  (+0.07 to +0.14 R per trade), so the 0.5 line is not sitting on a lucky edge.

### 4. What did not work (with numbers)
- **Hidden year A is weak and concentrated.** +2.33 R; 6 of 12 months lost; 20 of 37 traded weeks down. **April 2024 alone made
  +3.42 R; without it A is −1.09 R.** Oct 2023 – Mar 2024: −1.6 R over 31 trades. July 2024: −3.32 R (6 trades).
- **Longs in A made exactly 0.0 R** (24 trades). The long side's good record is only in the design years and in B (11 trades).
- **Your Q2 2026 warning is confirmed and it repeats:** Q2 2026 −4.84 R, of which shorts −4.8 R (Apr −2.0, May −2.5). May 2026 is
  the worst month in 36 (−4.58 R). In hidden B, shorts lost again (−1.05 R over 15). In A, shorts were fine (+2.3 R), so this is
  not "shorts never work", it is "**shorting gap-ups fails while the index is in a strong rally**", and v1 has no way to see that.
- **Your 0.4 ATR warning is confirmed in every period:** the extra trades with gaps of 0.4–0.5 ATR lost in all four periods
  (A −0.94 R / 23 trades, Y1 −1.99 / 24, Y2 −5.98 / 15, B −0.30 / 8). With 0.4, Y2 falls to +0.02 R and A to +1.39 R. So the result
  depends on only trading the big gaps; that is consistent with the idea, but it also shows how thin the edge is near the line.
- **Half the trades are dead weight:** 113 of 215 end at 16:00 with +0.3 R in total. The money is made by the 30% that fill the gap.
- **News days:** −0.9 R over 56 trades in total vs +22.7 R over 159 normal days. NFP 13 tr −1.7 R; CPI 17 tr −0.7 R; FOMC 5 tr −1.2 R.
  **Days after big-tech earnings flip:** design +3.95 R (13 tr), but hidden A −2.92 R (7 tr, 2 won) and hidden B −1.09 R (4 tr).
- **Weekday:** no stable pattern (e.g. Wednesday A −1.6, Y1 +0.5, Y2 +0.9; Tuesday Y2 −1.0, B −1.7). Do not filter on weekdays.

### 5. Against the team leader's bar for WORKS
| Requirement | Result | Pass? |
|---|---|---|
| A positive at 2.0 points | +2.33 R | Yes (barely) |
| A positive at 4.0 points | +1.56 R | Yes (barely) |
| Longs and shorts not clearly negative in A | longs 0.00 R, shorts +2.33 R | Yes, but longs show no edge in A |
| Longest losing run ≤ 7 | 6 (all 36 months), 4 in A | Yes |
| Not carried by one month or a handful of trades | **A: −1.76 R without best 3; −1.09 R without April 2024** | **No** |
| B not clearly negative | +1.64 R (26 trades), −1.94 R without best 3 | Yes, but it proves nothing either |
| Enough trades | 61 in A, 26 in B, ~64 a year | Small; flagged |

### 6. What to change (specific)
1. **First, before any change: test the unchanged v1 on older Nasdaq data that nobody has used.** All the hidden data in our file
   has now been opened. I suggest the team leader fetch **Oct 2021 – Sep 2023** (HistData NSXUSD, same source) into `data/hidden/`
   for Agent 2 only. It includes the 2022 bear market, a very different mood from 2023–26. If v1 is clearly positive there too,
   I would reconsider WORKS. If not, DROP.
2. **Do not lower the gap threshold** (see 0.4 ATR above), and do not raise it to chase the design numbers.
3. **If you write a v2, keep it to one idea with a reason given before testing, not found in these results.** Candidates, in order:
   - **Earnings days:** an earnings gap is new company information, not an overnight overshoot, so there is a reason not to fade it.
     The hidden periods point the same way (−4.0 R over 11 trades) but the design years do not, so it must be judged on new data.
   - **Do not short a gap-up in a strong rally** (for example, when the index is at a 20-day high at 09:30). This addresses
     Q2 2026 and B shorts, but it is exactly the kind of rule that fits the past; it must be judged on new data.
   - **A smaller target for the 16:00-close half** (e.g. half the gap) would change the whole profile; only with a stated reason.
4. **Keep:** the 09:35 entry, the 0.75 ATR stop, one trade a day, the 16:00 forced close, and the data/holiday skips. They behaved well.

*Past results do not guarantee future results.*
