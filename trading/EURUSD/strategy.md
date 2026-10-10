# EURUSD strategy

# ROUND 3 (10 Oct 2026): v3 "Euro-only move fade": CURRENT VERSION, sent to Agent 2

**Version:** v3 (2026-10-10). Author: Agent 1. Status: **proposed, frozen for Agent 2's backtest and the 2016-2018 hidden test.**
Built on design data Jan 2019 - Sep 2026 only (hidden 2016-2018 never opened). Every test of this round was written down before it ran, and its result is
logged in `round3/TESTS_DECLARED.md` (110 checks). Quick-check code `round3/v3_check.py`; trades `round3/v3_trades.csv`; summary `round3/out_v3.txt`.
Not financial advice. Trading carries real risk of loss.

## First: GBPUSD's v3 applied unchanged to EURUSD FAILS
The GBPUSD round-3 rules (quiet Asia night < 0.7 x normal, then a London breakout with stop orders at the box edges, 2R target), copied exactly with the EURUSD
1.2-pip cost: **307 trades, -41.5 R (-0.135 R per trade), positive in only 3 of 8 years**
(2019 -6.1, 2020 -9.8, 2021 +4.7, 2022 0.0, 2023 -9.8, 2024 -19.6, 2025 -6.2, 2026 +5.3), longs and shorts both lose, losing run 15.
No quiet threshold (0.6 to 1.0) works. On EURUSD a quiet Asia night is not a coiled spring. This is a real out-of-market failure and a warning for the GBPUSD rules too.

## The idea in plain words
EURUSD and GBPUSD usually move together, because most of their daily moves come from the US dollar. On some days, between the London open and
10:00 New York time, the **euro moves a lot more than the pound** (or the other way round). That extra move is a euro-only flow (European orders,
a European headline), not a dollar move. When Europe heads home (10:00-12:00 NY is 15:00-17:00 London, with the 4pm London fix and the London close),
that euro-only move tends to be **given back**. We trade EURUSD against the euro-only move, but only once the move has visibly stalled (price has
already come off its morning extreme). Our stop goes just past that extreme. A new extreme would mean the move is still alive and we were wrong.
Evidence:
- The bigger the euro-vs-pound gap, the better each trade (dose-response).
- Fading EURUSD's own big moves without the pound comparison does NOT work, so the pound comparison is what matters.
- Signals where the move had not stalled yet lose in 6 of 8 years.
- The same check at 08:00 or 12:00 NY does not work. The effect belongs to Europe's last hours.

## Clocks (all steps use New York's own clock)
| Step | New York | Doha (US summer time) | Doha (US winter time) |
|---|---|---|---|
| Start of the "morning" window | 03:00 | 10:00 | 11:00 |
| Check and entry | 10:00 | 17:00 | 18:00 |
| Forced close (close of the 15:59 bar) | 16:00 | 23:00 | 00:00 (midnight) |
US summer time = 2nd Sunday of March to 1st Sunday of November (Doha = New York + 7 h); US winter time: Doha = New York + 8 h.
(03:00 NY is 08:00 London most of the year, 07:00 London in the 2-3 mismatch weeks; the rules use the New York clock, so nothing changes in those weeks.)

## Rules (1-minute charts of EURUSD AND GBPUSD; at most one trade a day)
1. **Trading day** = 17:00 New York to 17:00 New York. Sunday-evening bars belong to Monday.
2. **Mark before the day (daily list):** **ATR20** = the average of (high - low) of the previous 20 full trading days of EURUSD (days with at least 1,300
   one-minute bars). Keep a list of the daily **gap** values (rule 4) for the past 250 trading days; **Threshold** = the 75th percentile of the size of those
   gaps (ignore the sign; at least 100 past days needed, else no trade). In 2019-2026 the threshold was 0.18%-0.45%.
3. **Mark at 03:00 NY:** EURUSD price **E0** and GBPUSD price **G0** = the close of the 02:59 NY one-minute bar of each.
4. **At 10:00 NY (the setup):** **E1**, **G1** = the close of the 09:59 NY bar of each. **Euro move** = E1/E0 - 1; **pound move** = G1/G0 - 1.
   **Gap** = euro move - pound move (the test used ln(E1/E0) - ln(G1/G0), which is practically the same). Also mark **Morning High** and **Morning Low** =
   the highest high and lowest low of EURUSD's 1-minute bars from 03:00 to 09:59 NY.
   - If the size of the gap is **not larger** than the Threshold: no trade today.
   - Gap **positive** (the euro did better than the pound): the plan is to **SELL** EURUSD. Gap **negative**: the plan is to **BUY** EURUSD.
5. **Confirmation (the move has stalled):** the stop distance (rule 7) measured from E1 must be **at least 0.15 x ATR20** (price has already come back off the
   morning extreme) and **at most 0.6 x ATR20** (the give-back has not already happened). Otherwise no trade today.
6. **Entry:** at market at 10:00 NY (test price: the close of the 09:59 NY bar = E1). Buys fill at the ask (chart price + spread).
7. **Stop loss:** SELL: Morning High + 1 pip. BUY: Morning Low - 1 pip. Never moved. (Smallest seen 7.2 pips; skip if below 2.4 pips.)
8. **Take profit:** none. No partial profit, no break-even move.
9. **Forced close:** at 16:00 NY (test price: the close of the 15:59 NY bar). Nothing is held overnight.
10. **Size:** risk 1% of the account: position size = 1% of balance / (stop distance in pips x pip value).
11. **No-trade days:** EURUSD has a hole of more than 15 minutes between 19:00 NY (previous evening) and 16:00 NY, or GBPUSD has one between 03:00 and 10:00 NY,
    or either has fewer than 1,300 one-minute bars that day (holidays, half days). **News days are traded** (the owner decides whether to skip them).
12. **Daily limit:** 1 trade. After it closes, stop for the day.

## Agent 1 quick check (design data Jan 2019 - Sep 2026, cost 1.2 pips; stop first if stop and exit fall in the same minute)
| Year | Trades | Win rate | Total R | R per trade | PF | Biggest drop | Longest losing run |
|---|---|---|---|---|---|---|---|
| 2019 (from May; threshold warm-up) | 23 | 52% | +9.7 | +0.42 | 2.69 | -1.7 | 2 |
| 2020 | 39 | 44% | +13.2 | +0.34 | 1.89 | -5.2 | 6 |
| 2021 | 20 | 50% | +0.9 | +0.04 | 1.12 | -3.8 | 4 |
| 2022 | 63 | 54% | +5.1 | +0.08 | 1.21 | -6.5 | 5 |
| 2023 (Feb-Jul data holes) | 7 | 43% | -0.5 | -0.08 | 0.81 | -1.3 | 2 |
| 2024 | 27 | 67% | +9.6 | +0.35 | 2.58 | -3.0 | 3 |
| 2025 | 32 | 41% | -4.2 | -0.13 | 0.72 | -8.4 | 5 |
| 2026 (Jan-Sep) | 17 | 47% | +8.2 | +0.48 | 2.03 | -3.4 | 3 |
| **All** | **228** | **50%** | **+41.9** | **+0.184** | **1.50** | **-8.4** | **6** |
Avg win +1.09 R, avg loss -0.74 R (165 trades end at 16:00 NY, 63 at the stop). Median stop 18-32 pips by year.
**Longs 112 trades +30.4 R; shorts 116 trades +11.6 R** (shorts lost in 2021, 2023, 2025). At 2.4-pip cost: +29.5 R (+0.129 R/trade, 5 of 8 years positive).
Without the best 5 trades: +20.4 R. Entry one minute late: +37.4 R, +0.159 R/trade, 5 of 8 years. Half-years: 9 of 15 positive (worst 2025 H2 -8.3 R).
Bootstrap chance the true average is zero or less: 0.8% (before allowing for the 110 checks made this round).

## Target bar: what it meets and misses (honest)
| Point | Result | Met? |
|---|---|---|
| Positive in >= 6 of 8 years | 6 of 8 (2023 -0.5 R on 7 trades, 2025 -4.2 R) | Yes |
| No year worse than -8 R | worst -4.2 R | Yes |
| Positive at double cost (2.4 pips) | +29.5 R (5 of 8 years) | Yes |
| Longs and shorts both positive | +30.4 / +11.6 R | Yes (shorts thinner) |
| Longest losing run <= 8 | 6 | Yes |
| >= +0.08 R per trade | +0.184 R | Yes |
| Positive without the best 5 trades | +20.4 R | Yes |
| >= 40 trades a year | **about 29 a year** (7 to 63) | **No** |

## Known weaknesses and doubts
- **Too few trades (29 a year).** A looser gap threshold (65th percentile instead of 75th) would give 41 a year and still meet every other point (+0.14 R/trade,
  6/8 years, worst year -2.5 R). But I would be choosing it after seeing the results, so I did not adopt it. All thresholds from 60% to 85% are positive.
- **It was the best of 110 checks.** Some of the edge may be luck. The idea came from the stage-1 screen (S9), and the "stalled" rule came with the first
  trade test (T2), before the stage-4 checks that support it.
- **The mirror test failed on GBPUSD** (fading the pound's own extra move did not work there). So the effect is a euro-side effect, and I can only guess why
  (European orders that get unwound into the London close).
- **Timing matters:** entering one minute late cuts the average from +4.6 to +3.3 pips per trade. It works only at the 10:00 NY check; the 08:00 and 12:00
  checks fail, which is consistent with the story but also narrows it.
- Profit is uneven by weekday (Thursday +16.9 R, Friday +13.0 R, Tuesday -0.3 R; not filtered) and better on days without a big US news shock.
- Needs two charts (EURUSD and GBPUSD) and a running list of 250 daily gap values: a spreadsheet job, not something to do by eye.
- For the 2016-2018 hidden test the threshold needs 100 days of history, so trades start around May 2016 (same warm-up as 2019 here).

## Other findings this round (8 years, per year; details in `round3/TESTS_DECLARED.md`)
- **Squeeze:** GBPUSD's quiet-Asia breakout fails (above). Quiet pre-New-York box breakout (T6): +0.12 R but a regime effect (2019-2021 all lose, 2022-2026 all win).
- **Mood switches** (trend or volatility decides follow vs fade): both halves lose. EURUSD's London break of the Asia box has **no follow-through at all**
  (+0.3 pips, 4/8 years), unlike GBPUSD and gold.
- **Cross-market:** GBPUSD, gold or Nasdaq moving first does not predict EURUSD (< 1 pip). The only cross-market effect is the euro-vs-pound gap (this v3).
- **News:** 08:30, 10:00 and 14:00 NY shocks: follow or fade flips by year. A 14:15 Frankfurt shock (ECB time) fade is +0.12 R but only 23 a year, and
  it is negative without its best 5 trades. Thursday ECB days are no better than other days.
- **Calendar:** London 4pm fix, month-end fix (works on GBPUSD, not here: 3/8), NY lunch reversal, intraday momentum all fail.
  Round 1's "Wednesday + Friday afternoon short" fails on 8 years (4/8, a 2024-26 effect only). The "Monday rises" effect is the bid-only Sunday-reopen
  artefact (17:00-19:00 NY alone: +3 pips in 8/8 years; after 19:00 NY it is 5/8).

## Backup ideas (not ready)
1. v3 at the 65th-percentile threshold (41 trades a year; meets every point but chosen after looking). Agent 2 could run it as a labelled second check.
2. 14:15 Frankfurt shock fade (+0.12 R, 23 a year, depends on its best trades). Run beside v3 it gives 52 trades a year, +0.156 R, but that is two ideas glued together after the fact.

---

## Status (round 1, 9 Oct 2026): **no v1 proposed. Nothing met the bar.**
Author: Agent 1 (Trading Research Lead). Research: `research.md`. Not financial advice.

I studied the 21 design months (Oct 2024 – Jun 2026), split into Y1 (Oct 2024 – Sep 2025) and Y2 (Oct 2025 – Jun 2026),
and tested **4 rule variants**, each written down before it was run (`research.md` section 8, code `research/09_variants.py`).
**None is positive in both years with a per-trade edge of about +0.10 R, a positive result without the best 3 trades in each
year, a positive result at double cost, and both directions working.** I am not sending a v1 to Agent 2, so hidden test A
(Oct 2023 – Sep 2024) and hidden test B (Jul – Sep 2026) stay unused for EURUSD.

### Bar check of the closest candidate (V2, "Wed + Fri New York afternoon short")
| Bar | Y1 | Y2 | Pass? |
|---|---|---|---|
| Positive at 1.2 pips | +5.3 R (87 trades) | +6.5 R (57 trades) | yes |
| Per-trade edge ≥ +0.10 R | +0.06 R | +0.12 R | **no (Y1)** |
| Positive at 2.4 pips | +2.3 R | +4.0 R | yes, barely |
| Positive without best 3 trades | −2.4 R | +1.3 R | **no (Y1)** |
| Longest losing run ≤ 7 | 5 | 7 | yes |
| Longs and shorts each not negative | shorts only | shorts only | **no (one direction by design)** |
| Clear market reason | weak (maybe position-squaring before the Wednesday triple rollover and the weekend) | | **no** |
| Found how | by scanning 25 weekday x day-part cells | | data-mined |

## Settled points (apply to any future EURUSD version)
1. **Day** = 17:00 New York to 17:00 New York. Sunday bars before 17:00 NY belong to Monday. Friday is Monday's "previous day".
2. **Forced-close price** = the close of the last 1-minute bar before the forced-close time.
   Do not use exits at 16:59 NY on bid data: the bid price drops as spreads widen into the 17:00 NY rollover, which flatters shorts.
3. **Thin days:** a day with fewer than 1,300 one-minute bars, and the day after it, are not traded. In the design data:
   1 Oct 2024, 25 Dec 2024, 25 Dec 2025, 12 May 2026 (US CPI hours missing), 22 May 2026, and the day after each.
4. **Gaps:** skip any day with a gap of more than 15 minutes inside the hours the strategy uses.
5. **Minimum stop:** 2.4 pips (20 x the 1.2-pip cost).
6. **Times:** Doha = New York + 7 h in US summer time (2nd Sunday of March to 1st Sunday of November), + 8 h in US winter time.

## If the team leader or owner still wants something tested
The only candidate worth a hidden-data look is V2 below. I do **not** recommend it, because it fails the per-trade-edge and
"without best 3" checks in Y1 and has only one direction. It is written out exactly so nobody has to guess.

**V2 (NOT SENT): "Wednesday + Friday New York afternoon short"**
| Event | New York | Doha (US summer) | Doha (US winter) |
|---|---|---|---|
| Entry (open of the 12:00 bar) | 12:00 | 19:00 | 20:00 |
| Forced close (close of the 15:59 bar) | 16:00 | 23:00 | 00:00 (midnight) |
- Days: Wednesday and Friday only (New York calendar date of the 12:00 bar). News days are not skipped (FOMC Wednesdays included).
- Mark before: ADR20 = average high-low range of the previous 20 full trading days (17:00–17:00 NY days).
- Entry: sell at the open of the 12:00 NY 1-minute bar. One trade per day.
- Stop: entry + 0.40 x ADR20 (minimum 2.4 pips). No target, no break-even.
- Exit: stop, or the close of the 15:59 NY bar.
- Risk 1% of the account per trade (position size = 1% / stop distance).

## Backup ideas (none ready)
1. **ECB-day fade:** the first 15-minute move after the 14:15 Frankfurt decision was undone 4 hours later on 12 of 14 ECB days.
   Only ~8 ECB days a year, so it can never give enough trades on its own.
2. **Monday up / Wednesday down** (62–64% up Mondays, 36–38% up Wednesdays in both years). Data-mined, not steady by quarter.
3. **Volatility timing:** big days follow a wide Asia range and start before London. Direction is still unknown in advance.
