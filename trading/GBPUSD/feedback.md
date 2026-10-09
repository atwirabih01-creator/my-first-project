# GBPUSD: feedback from Agent 2 to Agent 1 (newest on top)

> **Team leader note (9 Oct 2026, after this feedback):** the clock problem in section 2 is now fixed in the data
> files themselves. HistData's raw clock is "London time minus 5 hours", and `trading/tools/fetch_histdata.py` now
> converts it correctly (verified against Dukascopy UTC prices, including mid-March). Do **not** apply any extra clock
> fix in scripts. `backtest_v1.py` was updated (`fix_clock` off) and re-run: identical results. The "rawclock"
> comparison files were removed. The main data files now cover **Oct 2023 – Sep 2026**; see `trading/README.md` for
> which periods are design data and which are hidden.

---

## v1 "New York false break of yesterday's high/low": tested 9 Oct 2026

### Verdict: **DROP**
v1 made a small profit in the 12 months it was built and checked on (+14.2 R over 96 trades), but in the untouched year
before that (Oct 2024 – Sep 2025) the exact same rules **lost 21.9 R**: 31% of trades won, there was a 9-trade losing run,
and the account fell 23%. Over 24 months the rules lose money (−7.7 R over 190 trades). The hidden Jul–Sep 2026 profit is too
thin to outweigh that (+4.4 R over 32 trades; about a 1-in-4 chance it was luck). The edge looks like it belongs to one market mood, not to GBPUSD itself.

### 1. Consistency check (my code vs. your quick check): **they match**
I wrote my own backtest from the rules text only (`backtest/backtest_v1.py`). On the same data, handled the same way, I get
**66 trades, 48.5% won, +12.58 R, profit factor 1.38, worst drop −3.89 R**. Your figures: 66 / 48% / +12.6 R / 1.38 / −3.9 R.
All 66 trade dates and directions are the same. The only differences are on 14 trades that were closed at 16:00 NY, and they
add up to just 0.04 R. They come from one unclear point in the rules:
- **Forced-close price.** You used the open of the 16:00 bar, and I used the close of the 15:59 bar. Rule 11 should say which.

Two more readings could change trades, so the rules text should settle them:
- **Bars before Sunday 17:00 NY.** The feed sometimes shows a few Sunday bars from 16:00 NY. If those count as their own
  "day", Monday's PDH/PDL comes from a one-hour stub, and the dev total drops to +12.15 R. Rule 1 should say "bars before
  Sunday 17:00 NY belong to Monday's day". (This turned out to be caused by the clock problem below.)
- **The day after a holiday or a data gap** (26 Dec 2025, 28 Sep 2026). The "previous day" then has only a few hours
  of prices, so PDH/PDL is not real. I skipped these days. Rule 12 should say so.

### 2. A data problem that affects your research too: the clock is 1 hour off in 4 weeks a year
The price file is converted as if its times were New York time with US summer time. That is right most of the year, but
**in the weeks when the US is on summer time and the UK is not, the times are 1 hour early.** In 2025–26 those weeks are
27–31 Oct 2025 and 9–27 Mar 2026. The evidence:
- The FOMC decision on 18 Mar 2026 (14:00 NY) shows its spike at 13:00.
- The BoE decision on 19 Mar 2026 (08:00 NY) shows its spike at 07:00.
- The Sunday open shows at 16:00 NY in exactly those 4 weeks, and at 17:00 everywhere else.

This probably also explains why your news check found **US CPI 11 Mar 2026 "doubtful"**. After adding 1 hour to those
weeks, FOMC lands on 14:00 and every Sunday open lands on 17:00. **Effect on v1 (design months):** 2 trades disappear
(19 and 23 Mar 2026), and 4 enter at a different time with a different result (30 and 31 Oct 2025, 10 and 11 Mar 2026). The design-months total falls from +12.58 R to **+9.85 R**. The most
important change is 11 Mar 2026, which flips from +1.90 R to −1.33 R. I used the corrected clock for all results below.
Your session and news statistics for March and late October should be re-run with the fix. (The fix is in `load()` in
my script, and it is a data correction, not a rule change.) The team leader should also get `trading/tools/fetch_histdata.py`
fixed, because it affects all four markets.

### 3. The numbers (1.5-pip cost on every trade, 1% risk, corrected clock)
| Period | Trades | Win rate | Avg win / avg loss | Total | Profit factor | Biggest drop | Longest losing run | Runs of 3+ losses |
|---|---|---|---|---|---|---|---|---|
| Design months, Oct 2025 – Jun 2026 | 64 | 48.4% | +1.41 / −1.02 R | +9.85 R | 1.29 | −4.64 R (−4.7%) | 4 | 4 |
| Hidden, Jul – Sep 2026 | 32 | 46.9% | +1.33 / −0.92 R | +4.37 R | 1.28 | −3.37 R (−3.3%) | 3 | 1 |
| 12 months combined | 96 | 47.9% | +1.38 / −0.99 R | +14.22 R | 1.29 | −4.64 R (−4.7%) | 4 | 5 |
| **Extra check: Oct 2024 – Sep 2025** | 94 | **30.9%** | +1.54 / −1.02 R | **−21.89 R** | **0.67** | **−26.21 R (−23.4%)** | **9** | 10 |
| All 24 months | 190 | 39.5% | +1.44 / −1.01 R | −7.67 R | 0.93 | −26.21 R (−23.4%) | 9 | 15 |

The extra year is the same free HistData source, downloaded with the project tool into the main data file, now 3 years (originally a separate
file, main data untouched). I checked it before trusting it: same number of bars per day, similar daily ranges, and the
US jobs-report spike sits at 08:30 NY. Without my clock fix it gives the same answer (−21.8 R), so the loss is not caused
by the fix.

**How fragile the hidden-period profit is:**
- The bootstrap test (re-shuffling the trades many times) says there is a **27% chance** the true average is zero or below.
  For the 12 months combined it is 12.5%, and for the extra year it is 96% that the average is zero or below.
- With 3 pips of cost instead of 1.5, the hidden period comes to −0.41 R.
- Without its 3 best trades, the hidden period comes to −1.24 R.

### 4. What worked (12 months Oct 2025 – Sep 2026)
- **Small drops, short losing runs** in this period: the worst drop was −4.6 R and the longest losing run was 4. The idea
  of trading only when the 15-minute candle closes back inside, with the stop beyond the sweep's extreme, keeps losses
  controlled (an average loss of −0.99 R, so stops were rarely jumped).
- **Both directions earned money in the design months:** longs +5.52 R (37 trades) and shorts +4.33 R (27).
- **News days were not a problem** in the design months: 13 trades, +3.66 R. In the hidden months: 6 trades, −0.57 R.
  For the hidden months I labelled news days myself, because your list stops at June. I used the published schedules
  and kept a date only if the price showed a release spike. Treat these labels as medium confidence: 10 and 11 Sep both
  spiked at 08:30, so one of them may be a different release.
- **Every hidden month was positive**, but only just: Jul +1.02 R, Aug +0.38 R, Sep +2.96 R.

### 5. What did not work
- **The year before lost heavily.** It was positive in only 4 of 12 months (Oct 2024 +0.2 R, Dec 2024 +0.8 R,
  Jan 2025 +6.9 R, May 2025 +0.4 R; the other 8 were negative). The worst stretch was Jul–Sep 2025: −15.1 R over 26 trades.
  Longs lost −20.5 R (51 trades, 25% win rate). The losing runs were 9 (31 Jul – 21 Aug 2025), 7, three of 6, and two of 5.
  That breaks the owner's "no long losing streaks" requirement.
- **Stops are hit more often than targets:** 40 stops against 30 targets in the 12 months, and 54 against 22 in the extra year.
  The 2R target is often not reached before 16:00 NY.
- **Tiny stops are not realistic.** The smallest stop was 2.9 pips. With 1.5 pips of cost, such a trade loses about 1.5 R
  when stopped, and real slippage at 08:30 NY news is often bigger than that.
- **The "patterns" inside the results do not repeat:**

| Pattern | Design months | Hidden months | Extra year |
|---|---|---|---|
| Wednesday | −5.6 R | +2.0 R | +9.1 R |
| Thursday | −1.0 R | −4.1 R | −14.3 R |
| Stops over 15 pips | +8.8 R | −1.2 R | −2.8 R |
| Stops of 8 pips or less | +1.7 R | +4.6 R | −11.8 R |

  Filtering on any of these would be fitting the rules to noise. **Please don't fix v1 by adding weekday or
  stop-size filters.**

### 6. Is the sample big enough?
**No.** That is about 8 trades a month, so 64 design trades and 32 hidden trades are too few to tell a +0.15 R edge from
luck. On 32 trades, a ±0.3 R swing in the average is normal chance. To trust an edge this small you need roughly
200 or more trades, and it has to be positive in each separate period, not only on the total.

### 7. Suggestions (most important first)
1. **Re-do the research on at least 2 years, with the corrected clock.** The 9 design months were one sideways market
   (your own research says so), and a fade-the-break idea fits that kind of market and fails when it changes. The data for
   Oct 2024 – Sep 2025 is now in the main data file, so you can use it as design data. I have already shown v1's
   result on it, so it no longer counts as a hidden check.
2. **If you rebuild this idea, design a market-mood switch on purpose rather than fitting one to the losses.** Look at
   whether failed breaks work only when the previous days were range-bound, using a measure that is known before the
   trade (for example, how much of the last 5 days' range was net movement). Keep it to one simple condition, and decide it
   on the design data only. Also consider a minimum stop (for example 8–10 pips) or a cost check at 3 pips, so the edge
   does not depend on tiny stops. And please settle the three unclear points in section 1.
3. **A new hidden check is needed for any v2.** Oct 2023 – Sep 2024 is now reserved as the next hidden period. Please do
   not download or look at it. Only I will open it, once your rules are frozen. A v2 will be judged on being positive
   in every period, not only on the total, and on its longest losing run.

Files: `backtest/backtest_v1.py`, `backtest/trades_v1.csv` (12 months, corrected clock), `backtest/summary_v1.txt`,
`backtest/trades_v1_prior.csv` + `summary_v1_prior.txt` (extra year), `backtest/weekly_v1.csv`.
