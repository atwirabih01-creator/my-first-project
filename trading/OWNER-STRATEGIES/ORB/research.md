# Owner's ORB (Opening Range Breakout) on all four markets: research findings

Agent 1, 11 Oct 2026. Design data Jan 2019 - Sep 2026 (`trading/data/<SYMBOL>_M1.csv.gz`), hidden 2016-2018 never opened.
"R" = the amount risked on one trade (1% of the account). Results are with standard cost unless stated
(GBPUSD 1.5 pips, EURUSD 1.2 pips, gold 0.40 USD, Nasdaq 2.0 points). 2026 = Jan-Sep; 2023 has data holes from Feb to Jul.

## How it was tested
- 332 variants, all declared before running (`TESTS_DECLARED.md`): 240 in the core grid (5 session opens x 4 range lengths x
  3 targets x 4 markets), 88 single changes on each market's 2 best grid versions, 4 combinations.
- One trade a day, stop orders on both sides of the range, stop on the other side, everything closed at 16:00 New York.
  Ranges smaller than 10 x the cost were skipped (so the cost is never more than 10% of the risk).
- Scripts and outputs: `orb_common.py` (loader + simulator), `s1_grid.py` -> `out_s1.txt`, `out_s1_<SYM>.csv`;
  `s2_changes.py` -> `out_s2.txt`; `s3_combos.py` -> `out_s3.txt`; `final.py` -> `out_final.txt` + `trades_<MARKET>.csv`;
  `out_all_variants_ranked.csv` = every variant with its bar misses.

## The big picture (core grid, 60 versions per market)
| Market | Versions positive with cost | Median version | Best region |
|---|---|---|---|
| GBPUSD | 10 of 60 | -28.6 R | almost nothing works; only the first London hour with a "wide" filter |
| Gold | 34 of 60 | +11.5 R | the European open (07:00-08:00 London), short ranges |
| Nasdaq 100 | 38 of 60 | +13.8 R | the London-open hour held to the close, and the 09:30 NY 30-min range |
| EURUSD | 23 of 60 | -5.9 R | nothing robust; best ones trade rarely |

**Plain finding:** ORB has a real tailwind on **Nasdaq** and **gold** (most versions make money before choosing), and almost none on the
two currency pairs, where most versions lose after costs. This matches earlier rounds (GBPUSD round 2: London and NY ORBs lost).

### Things that held across markets
- **Holding to the New York close** earns more R in total than fixed targets, but wins only 20-35% of the time, so losing runs of
  13-25 trades are normal. **No hold-to-close version can meet the "losing run of 8 or less" bar.** 1R targets give short runs but
  thin profits (+0.04 R per trade), which then miss the "+0.08 R per trade" bar. These two bar points pull in opposite directions; 1.5R-2R is the compromise.
- **Entering on a 5-minute candle close** (instead of a stop order) was worse in 6 of 8 tests: it enters later, at a worse price, with a bigger risk.
- **"First-candle direction"** entries (go with the colour of the range) were worse everywhere (8 of 8 tests).
- **Stop at the range midpoint** or **0.10 x ATR** was worse in all 16 tests: the stop is too tight and gets hit by normal noise.
  The other side of the range is the right stop for ORB on these markets.
- **Previous day's trend filter** never helped (lost R in 8 of 8 tests).
- **Range size** matters, but the direction differs by market: on GBPUSD a *wide* first hour helps a lot; on Nasdaq (London hour, hold to close)
  and EURUSD (Frankfurt hour, hold to close) a *narrow* range helps. That inconsistency is a warning sign.

## GBPUSD
- Core grid: 10 of 60 versions positive. London 08:00 15-min / 1R: +33.1 R but 13-trade losing runs and **-22.8 R at double cost**.
  New York opens (08:00 and 09:30): all lose or are tiny.
- **Chosen:** 07:00 London (Frankfurt open) 60-min range, hold to 16:00 NY, only when the range is **wider than its 20-day median**.
  Without the filter the same setup was +76.1 R but lost 22.9 R in 2023, longs lost 29.5 R, and double cost was negative.
  The filter improved 6 of 8 years: **+82.9 R, 7 of 8 years positive, worst year -0.5 R, double cost +34.8 R, +0.097 R per trade,
  longs +33.5 / shorts +49.4, longest losing run 10 (miss), 111 trades a year.**
- Per year (R with cost): 2019 +27.4, 2020 +8.3, 2021 -0.5, 2022 +33.4, 2023 +1.8, 2024 +1.5, 2025 +1.5, 2026 +9.5.
  **Weakness:** 2023-2025 were only just positive (+1.5 to +1.8 R a year, and negative at double cost). Most profit came in 2019, 2022 and 2026.
- Weekday: Friday -23.8 R, Thursday +49.2 R (not used; small and found afterwards).
- News (US release days found afterwards by a price spike at 08:30 NY): 182 trades +0.154 R each vs +0.081 on other days. FOMC-type days (14:00 spike): 53 trades +0.299 each.
- The filter is the main risk: it was picked from 11 tried changes. Its reason (an active first hour means real flows; a quiet hour breakout fails) is
  supported by GBPUSD v3 (a squeeze ORB) failing on unseen data, but it is still a filter found on this data.

## XAUUSD (gold)
- Core grid: 34 of 60 positive. The European open dominates: 07:00 London 15-min range is positive with every target
  (1R +25.3, 2R +79.1, hold +146.7). 08:00 London 30-min hold-to-close: +144.7 R, 7 of 8 years, but -11.6 R in 2021 and a 16-trade losing run.
- **Chosen:** 07:00 London 15-min range, **target 1.5R**. **+40.7 R, 46% wins, +0.082 R per trade, 6 of 8 years, worst year -4.1 R (2024),
  double cost +11.0, longs +13.1 / shorts +27.6, longest losing run 6, +33.2 R without the best 5.** The only version of all 332 that
  meets every bar point except the trade count.
- **Big weakness, trade count:** because the range must be at least 4 USD, the number of trades follows the gold price:
  2019: 6, 2020: 56, 2021: 24, 2022: 22, 2023: 6, 2024: 41, 2025: 159, 2026: 185. **69% of all trades are in 2025-2026**, and 2026 is only +2.1 R
  on 185 trades (-5.8 R at double cost). So the evidence for "today's gold" rests mostly on 2025 (+13.8 R).
- Per year: 2019 -1.5, 2020 +12.4, 2021 +10.7, 2022 +3.7, 2023 +3.5, 2024 -4.1, 2025 +13.8, 2026 +2.1.
- News: US 08:30 release-spike days +0.189 R each (96 trades) vs +0.056 on other days. 96% of trades end before 09:00 NY,
  so the effect is from the day's mood, not the release itself.
- Neighbours: 5-min and 30-min ranges at the same open are weak (2-6 positive years), so 15 min is a narrow sweet spot. Watch for this.

## NASDAQ 100 (NSXUSD CFD, the index itself; not QQQ)
- Core grid: 38 of 60 positive, the best of the four markets.
- **The rule chose the 09:30 version (1 bar miss); the London-hour version is the strong backup (2 misses):**
  - **Chosen: 09:30 NY 30-min range, target 1R.** +72.7 R on 1,759 trades, 54% wins, **+0.041 R per trade (miss)**, 7 of 8 years,
    worst year -7.1 R (2020), double cost +26.7, longs +58.9 / shorts +13.8, losing run 8, worst drop -18.0 R.
    Per year: 2019 +9.4, 2020 -7.1, 2021 +7.3, 2022 +18.5, 2023 +2.6, 2024 +30.1, 2025 +9.6, 2026 +2.2.
  - Backup: **08:00 London 60-min range, hold to 16:00 NY** (the European-morning range on the US index): +204.3 R, +0.139 R per trade,
    7 of 8 years, double cost +137.9, longs +115 / shorts +89, but a **22-trade losing run** and -9.0 R in 2023 (25% wins), which are its 2 misses.
    With a "narrow range" filter +185 R, +0.269 R per trade, but only 13 trades in 2019. Strongest raw result in this study, but hard to sit through.
- Neighbours of the chosen one: 30-min/2R and 30-min/hold also positive (5-6 years); 5-min and 60-min ranges weaker. 15-min hold was hurt by 2020 and 2026.
- Earlier round 1 said 09:30 ORBs "flip between years"; with 8 years and a 1R target the 30-min version is positive in 7, but the edge per trade is small.
- News: 14:00 NY (FOMC-type) spike days lost: 109 trades -15.8 R (-0.145 each). US 08:30 release days about zero (+0.010 each). Other days +0.054 each.
  The owner decides about news; avoiding FOMC afternoons would have helped, but this was found afterwards.
- Weekday: Wednesday and Thursday slightly negative, Friday +42.6 R (not used).

## EURUSD
- Core grid: 23 of 60 positive, no version with both enough trades and steady years.
- **Chosen (fewest bar misses): 09:30 NY 5-min range, hold to 16:00 NY.** The 12-pip minimum range means it trades only when the US stock open
  moves the euro hard (about 1 day in 12). **153 trades, 36% wins, +49.6 R, +0.324 R per trade, 6 of 8 years, double cost +37.2, longs +18.3 /
  shorts +31.3, losing run 7. But +27.4 R of it came in 2022 alone and only 3-16 trades in most years.** Without the best 5 trades only +12.1 R.
- Per year: 2019 +2.5 (3 trades), 2020 +2.4, 2021 -2.7, 2022 +27.4, 2023 -0.3, 2024 +0.4 (5 trades), 2025 +9.8, 2026 +10.0 (5 trades).
- Backup with more trades: 07:00 London 60-min range, 1R target, wide-range filter: 98 a year, +51.2 R, 6 of 8 years, but -12.5 R in 2019 and +0.067 R per trade.
- News: all the profit came on days WITHOUT an 08:30 NY release spike (+0.502 R each); release days were zero.
- Honest view: EURUSD does not have a usable ORB in this data. The chosen version is a rare-event trade, not a daily strategy.

## What this means (ranking by evidence)
1. **Gold 07:00 London 15-min, 1.5R:** meets every quality point, but its trade count depends on the gold price; most evidence is from 2025-2026.
2. **GBPUSD 07:00 London 60-min, wide only, hold:** good numbers, but they lean on one filter and the last three full years were flat.
3. **Nasdaq 09:30 30-min, 1R:** the most trades and 7 of 8 years, but a thin edge (+0.04 R per trade): costs and slippage matter a lot.
   The London-hour hold-to-close version is stronger but has long losing runs.
4. **EURUSD 09:30 5-min, hold:** too few trades to trust.

All four were chosen from many tries, so expect the hidden 2016-2018 test to show smaller numbers.
