# EURUSD: feedback from Agent 2 to Agent 1 (newest on top)

---

## v3 "Euro-only move fade": backtest and hidden test 2016-2018, 10 Oct 2026

### Verdict: **DROP** (owner's document graded **C: Experimental**)
On the 3 hidden years nobody had opened (2016-2018) the frozen rules made **-2.4 R on 63 trades (-0.04 R per trade, PF 0.92)**,
were positive in **only 1 of 3 years** (2016 +5.6, 2017 -7.9, 2018 -0.1), lost **-6.1 R at double cost**, and had a **losing run of 8**.
The design result (+41.9 R, +0.185 R per trade) did not carry over to unseen data. The idea may still hold something on the long side,
but nothing here is proven, and the hidden years are now used up for EURUSD.

### 1. How it was run
- My own script `backtest/backtest_v3.py`, written from the round-3 rules text (your `round3/` code was not imported or copied).
  Analysis: `backtest/analyze_v3.py` -> `backtest/summary_v3.txt`. Trades: `backtest/trades_v3.csv` (both periods, column `period`
  H = hidden, D = design). Every day and why it was or was not traded: `backtest/days_v3.csv`. Entry 1 minute late: `backtest/late_v3.csv`.
  Side-check 65th percentile: `backtest/trades_v3_p65.csv`. Weekly table: `backtest/weekly_v3_table.md`.
- Cost 1.2 pips per trade (stress 2.4). Entry = close of the 09:59 NY bar, R = (direction x (exit - entry) - cost) / stop distance,
  so a full stop costs slightly more than 1 R. Stop and forced close in the same minute -> stop. Exit at 16:00 NY (close of the 15:59 bar).
- The two periods are run **separately**, each with its own warm-up; nothing from 2019+ leaks into 2016-2018. No clock fix.
- **Warm-up:** the 100-gap minimum needs 100 trading days. Hidden: data starts 4 Jan 2016, the first day the rule allows is
  **23 May 2016** (100 trading days, about 4.5 months), first trade 25 May 2016. Design: first allowed day 1 Apr 2019, first trade 22 May 2019.
- Hidden data quality: only 3 thin days (< 1,300 bars) and **no day with a hole** in the hours used. Design: 131 thin days (mostly the
  Feb - Jul 2023 holes) and 11 hole days.

### 2. Consistency check against your quick check (design 2019 - Sep 2026)
- Yours: 228 trades, +41.9 R. Mine: **226 trades, +41.91 R. 226 trades are the same days, same direction, same stop, and the same R to
  the 5th decimal.** The 2 missing are **23 Aug 2023 and 6 Sep 2023** (yours: -0.79 R and +0.80 R, together +0.01 R).
- Why: right after the Feb - Jul 2023 data hole, the 250-day window holds only about 100-110 gap values, so the threshold is sensitive to
  exactly which hole days count. On those 2 days my threshold was 0.398% and 0.379% against gaps of 0.365% and 0.367%; yours was lower.
- A rule point to make explicit: "the past 250 trading days" (a calendar window, days without a value are just missing, which is what
  you coded and I now use) versus "the last 250 gap values". My first run used the second reading: it reached back into 2022 after the hole
  and dropped 7 trades (221 trades, +40.6 R). In 2016-2018 there are no long holes, so **both readings give the same hidden result**.
- Gap formula: I used the rules text (E1/E0 - 1) - (G1/G0 - 1); you used logs. No trade changed because of it.

### 3. Results (cost 1.2 pips)
| Period | Trades | Win | Avg win / loss | Total | R per trade | PF | Max drop | Longest losing run | Chance avg <= 0 |
|---|---|---|---|---|---|---|---|---|---|
| 2016 (hidden, from 23 May) | 18 | 44% | +1.76 / -0.85 | **+5.58 R** | +0.310 | 1.66 | -4.0 R | 5 | 19% |
| 2017 (hidden) | 27 | 41% | +0.60 / -0.91 | **-7.88 R** | -0.292 | 0.46 | -8.5 R | 8 | 97% |
| 2018 (hidden) | 18 | 50% | +0.77 / -0.78 | **-0.06 R** | -0.003 | 0.99 | -3.4 R | 3 | 52% |
| **Hidden 2016-2018** | **63** | **44%** | +0.99 / -0.86 | **-2.36 R** | **-0.038** | **0.92** | **-11.1 R (-10.7%)** | **8** | **62%** |
| 2019 (from May) | 23 | 52% | +1.29 / -0.52 | +9.74 R | +0.424 | 2.69 | -1.7 R | 2 | 5% |
| 2020 | 39 | 44% | +1.64 / -0.67 | +13.19 R | +0.338 | 1.89 | -5.2 R | 6 | 7% |
| 2021 | 20 | 50% | +0.81 / -0.73 | +0.87 R | +0.044 | 1.12 | -3.8 R | 4 | 42% |
| 2022 | 63 | 54% | +0.87 / -0.84 | +5.08 R | +0.081 | 1.21 | -6.5 R | 5 | 28% |
| 2023 (Feb-Jul holes) | 5 | 40% | +0.72 / -0.66 | -0.53 R | -0.107 | 0.73 | -1.3 R | 2 | 63% |
| 2024 | 27 | 67% | +0.87 / -0.67 | +9.56 R | +0.354 | 2.58 | -3.0 R | 3 | 2% |
| 2025 | 32 | 41% | +0.82 / -0.78 | -4.15 R | -0.130 | 0.72 | -8.4 R | 5 | 79% |
| 2026 (Jan-Sep) | 17 | 47% | +2.01 / -0.88 | +8.15 R | +0.479 | 2.03 | -3.4 R | 3 | 13% |
| Design 2019-2026 | 226 | 50% | +1.10 / -0.74 | +41.91 R | +0.185 | 1.50 | -8.4 R (-8.1%) | 6 | 1% |
| All 2016-2026 | 289 | 49% | +1.08 / -0.77 | +39.55 R | +0.137 | 1.35 | -11.1 R (-10.7%) | 8 | 2% |

### 4. What worked (with numbers)
- **Your design numbers are real and reproducible** (226 of 228 trades identical).
- **Longs held up on hidden data:** 23 trades, +5.5 R (+0.24 R per trade), still +4.2 R at 2.4 pips. Design longs +30.4 R. Across 11 years
  longs made +35.9 R on 135 trades; shorts made +3.7 R on 154 trades.
- 2016 was clearly positive (+5.6 R), and costs are small relative to the stops (median stop 21 pips hidden, 24 pips design).

### 5. What did not work (with numbers)
- **Hidden total negative:** -2.4 R at 1.2 pips, -6.1 R at 2.4 pips (1 of 3 years positive at both costs). Without the best 5 trades: -15.0 R.
  Bootstrap: 62% chance the true average in such years is zero or less.
- **Shorts lost -7.9 R on hidden data** (40 trades, 40% won), almost all of it in **2017: shorts -9.6 R on 20 trades**. 2017 was a year
  of a strong, steady euro rally (EURUSD about 1.04 -> 1.20). Selling the euro after it out-ran the pound fought that trend. Shorts were
  also the weak side in design (2021, 2023, 2025 negative). This is the same pattern as Nasdaq v1: the fade side that fights a strong trend breaks.
- **Friday:** hidden -2.8 R on 16 trades (design Friday was +13.0 R). Weekday effects flip between periods; do not filter on them.
- **US winter time:** hidden -2.6 R on 17 trades; design winter only +4.6 R on 74 trades, summer +37.3 R on 152. Most of the edge sits in
  US summer-time months in both periods (hidden summer +0.3 R only).
- **Entry 1 minute late:** hidden +1.8 R (vs -2.4 on time; noise either way), design +37.2 R (vs +41.9). The timing sensitivity is real.
- **The story does not describe most trades.** In 51 of 63 hidden trades and 159 of 226 design trades, the **pound** moved more than the
  euro over 03:00-10:00 NY: the "gap" was mostly a pound move that the euro did not follow, and the trade bets that the euro catches up.
  The truly euro-led trades (euro moved more than the pound) were 12 hidden trades, -4.4 R; design 67 trades, +7.9 R (+0.12 R each).
  So "euro-only move given back" is not the main mechanism in the data. The data says "EURUSD partly follows the pound's morning move
  in the afternoon", which is a different idea and should be researched as such, on design data only.
- Thin sample: about 24 trades a year on hidden data (May 2016 - Dec 2018), 30 a year on design.

### 6. Side-check only (not graded): 65th-percentile threshold
Hidden 96 trades, -0.6 R (-0.006 R per trade), 2016 +4.0, 2017 -4.8, 2018 +0.2, longest losing run **12**, -6.2 R at 2.4 pips.
Design 317 trades +43.1 R (+0.136). It does not rescue the idea; a looser threshold adds trades but not edge on unseen data.

### 7. What to look at next (on design data only; the 2016-2018 data is now used up for EURUSD)
1. Re-state the mechanism from section 5 (pound leads, euro follows) and test whether that version is stronger and steadier than the
   "euro-led" story, with a pre-declared rule. Treat any result with care: it is a re-cut of the same signal.
2. Look at a **trend guard for shorts** (e.g. do not sell EURUSD when it is above its own 50- or 100-day average), declared before testing,
   checked on all 8 design years. 2017 is now known, so it cannot be used to judge that guard.
3. Count trades honestly: at 24-30 trades a year, even a real edge of +0.15 R needs 3-4 years to show itself. Consider whether this is
   a strategy the owner can realistically verify.
4. Any new EURUSD version will need **new unseen data** (from Oct 2026 on: the owner's own forward test, or an older data source such as
   2012-2015 that nobody has opened).

### Verdict
**DROP.** Positive on design data, negative on the 3 hidden years (1 of 3 positive, negative at double cost, shorts broke in a trending
year). The owner gets it as **grade C: Experimental**, because it is the best EURUSD rule tested so far, with clear warnings.
