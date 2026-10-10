# Round 3 test register (Agent 1). Written BEFORE each test is run; results appended after.
Design data only: 2019-01 .. 2026-09. Hidden 2016-2018 never opened. Cost 1.5 pips/trade.
Judged per calendar year 2019..2026. Thresholds are fixed by logic or by a past-only median, never tuned on results.

## Stage 1 - screening (cheap "does the next window move the predicted way?" checks, in pips, per year)
| ID | Family | Question (pre-declared) | Signal | Measure |
|---|---|---|---|---|
| S1 | Mood | Asia-range break: follow when last-10-day efficiency ratio (ER10) >= its past-250-day median, fade when below | first London break of Asia range 08:00-12:00 London | GBPUSD move from break to 15:59 NY, signed |
| S2 | Mood | same, mood = ATR5/ATR100 >= 1 (follow) / < 1 (fade) | as S1 | as S1 |
| S3 | Mood | same, mood = Asia range / past-20-day median Asia range >= 1 (follow) / < 1 (fade) | as S1 | as S1 |
| S4 | Cross-market | GBP vs EUR divergence: residual = GBPUSD % move minus EURUSD % move, 03:00-10:00 NY. Top-quartile (past 250 d) residual -> GBPUSD reverts 10:00-15:59 NY | sign(-residual) | GBPUSD 10:00->15:59 NY |
| S5 | Cross-market | Nasdaq 03:00->09:30 NY move predicts GBPUSD 09:30->15:59 NY (risk-on = GBP up) | sign(NSX move) | GBPUSD move |
| S6 | Cross-market | Gold 03:00->08:00 NY move predicts GBPUSD 08:00->11:00 NY | sign(gold) | GBPUSD move |
| S7 | Cross-market | EURUSD London-morning move (02:00->08:00 NY) predicts GBPUSD 08:00->11:00 NY | sign(EUR) | GBPUSD move |
| S8 | Volatility | Quiet Asia (Asia range < 0.7 x past-20-day median): follow first London break of Asia range | follow | break -> 15:59 NY |
| S9 | Volatility | Previous day is NR7 (narrowest of 7): follow first break of previous-day high/low 03:00-12:00 NY | follow | break -> 15:59 NY |
| S10 | News | 08:30 NY shock: |08:30->08:45 move| > 3 x median of same window over past 20 days -> follow vs fade, 08:45->11:00 and ->15:59 NY | both reported | GBPUSD move |
| S11 | News | 07:00 London shock (UK data), same definition, 07:15 London -> 12:00 London | both | |
| S12 | News | 12:00 London shock (BoE days etc.), same definition, 12:15 -> 15:59 NY | both | |
| S13 | News | 14:00 NY shock (FOMC etc.), 14:15 -> 15:59 NY | both | |
| S14 | Time of day | London 4pm fix reversal: move 10:00->11:00 NY (= 15:00->16:00 London) is reversed 11:00->15:59 NY | fade | |
| S15 | Time of day | Month-end (last trading day): fade the move into the 16:00 London fix | fade | |
| S16 | Time of day | Hourly drift: average signed GBPUSD move per NY hour, sign stable in 7/8 years? | per hour | |
| S17 | Time of day | Intraday momentum: move 17:00->10:00 NY predicts 10:00->15:59 NY | follow | |
| S18 | Time of day | Friday afternoon: Friday 10:00->15:59 NY fades the week's move so far (Mon open -> Fri 10:00) | fade | |
| S19 | Time of day | NY lunch reversal: move 08:00->12:00 NY reverses 12:00->15:59 NY | fade | |
Pass mark for stage 1: same sign in >= 6 of 8 years AND average gross move >= 2 pips per signal. Survivors go to stage 2 (full trade rules with stop/target and 1.5-pip cost).

## Stage 1 results (run 10 Oct 2026, `s1_screen.py`, `out_s1.txt`)
- Passed (>= 6/8 years same sign, >= 2 pips): **S0 follow first London break of the Asia range** (+5.5 p, 6/8; 2023 and 2026 flat),
  S1a/S2a (follow only in trending / high-vol mood: +5 p, 6/8, but each has a bad year), S8 quiet-Asia follow (+7.6 p, 6/8, only ~40/yr),
  **S15 month-end fix fade** (+9.4 p, 7/8, only ~11/yr).
- Clear fails: every "fade" half of the mood switches (S1b, S2b, S3b) lost in **0 of 8 years positive**: fading the London break of Asia is wrong in every mood.
  So a mood switch that flips to fading is harmful; the mood only changes how strongly the follow works.
- Failed: S4 (GBP-EUR divergence), S5-S7 (Nasdaq / gold / EUR leading), S9 (NR7), S10-S13 (news-shock follow or fade: flips by year), S14 (4pm fix), S16 (hourly drift; only 17:00-18:00 NY "rises", which is the bid-only rollover artefact), S17, S18, S19.
- Bug note: S0/S8 measured the first break after 08:00 London, but a break between 07:00 and 08:00 makes the 08:00 entry price unrealistic. Stage 2 uses orders from 07:00 London.

## Stage 2 - full trade tests of the S0 family (declared before running). Orders: buy-stop at Asia high, sell-stop at Asia low,
## placed at 07:00 London, live until 12:00 London, first fill only (other cancelled). Fill = level, or bar open if price gaps through.
## Exit 15:59 NY close unless stop/target. Cost 1.5 pips. Stop and target in the same minute = stop.
| ID | Stop | Target | Note |
|---|---|---|---|
| T1 | opposite side of Asia range | none (15:59 NY close) | base |
| T2 | Asia middle | none | tighter |
| T3 | opposite side of Asia range | 2R | |
| T4 | T1 with mood filter ER10 >= past-250-day median (trending only) | none | test whether mood adds |
| T5 | T1 with ATR5/ATR100 >= 1 | none | |

## Stage 2 results (`s2_asia_break.py`, `out_s2.txt`)
T1 +66 R over 1,826 trades (+0.036 R/trade), 4/8 years positive, losing run 14, negative at 3-pip cost. T2-T5 worse or no better.
**The Asia-break follow-through is real as a drift (+5.5 pips gross) but too small and too noisy to trade.** Dropped.
Research R1 (`r1_variance_ratio.py`): at 15-60 minute scales GBPUSD is a near-perfect random walk in every session and year
(variance ratio 0.84-1.15, no block consistently below or above 1). Simple mean-reversion or momentum by session has no structural basis.

## Stage 3 screening (declared before running): prior-day / multi-day / weekday conditions -> session moves
Predictors: P1 previous day's direction; P2 previous day's close location in its range (top/bottom third);
P3 5-day move; P4 20-day move; P5 previous day range > 1.5x ATR20 (big day) follow its direction; P6 weekday (mean move);
Targets (NY clock): Asia 19:00-02:00, London 02:00-08:00, NY morning 08:00-12:00, NY afternoon 12:00-15:59.
P7 weekend gap (Friday 16:59 NY close vs first Sunday price) fade until 02:00 NY Monday.
Pass mark: same sign in >= 7 of 8 years and >= 2 pips average.

## Stage 3 results (`s3_screen.py`, `out_s3.txt`)
37 checks. Only P7 (fade the weekend gap until 02:00 NY Monday) passed: +6.1 p, 7/8 years, ~36 trades/yr. **Rejected anyway:** the Sunday
open on bid-only data is exactly the rollover/spread artefact the README warns about, and the first Sunday price is not tradable.
Everything else (previous day, 5- and 20-day trend, weekday, big-day follow) was 6/8 or worse and < 2.5 p.

## Stage 4 (declared before running): cross-market confirmation of the London Asia-range break, and month-end flows
| ID | Question |
|---|---|
| S20 | S0 split: at GBPUSD's first London break of its Asia range, has EURUSD already broken its own Asia range the same way (dollar-driven move) -> follow; GBP alone -> ? |
| S21 | Month-end: trade INTO the London 4pm fix (15:00->16:00 London) in the direction opposite to the Nasdaq's month-to-date move (rebalancing: equity gains abroad -> USD sold) |
| S22 | Month-end post-fix fade (S15) at full trade level with stop (fix-hour extreme + 3 p) and exit 15:59 NY |

## Stage 4 results (`s4_screen.py`, `out_s4.txt`)
- S20: when EURUSD has already broken its own Asia range the same way, GBPUSD's follow-through is NEGATIVE (-1.5 p, 2/8 years). When EUR has not, +3.4 p (5/8). Not stable enough; the "dollar-confirmed break" idea fails.
- S21: my hypothesis (USD sold into the month-end fix after Nasdaq gains) was WRONG in 67% of 84 month-ends (-5.6 p, 2/8 years). The reverse
  (USD bought) shows +5.6 p in 6/8 years, but flipping a hypothesis after seeing the answer is data-mining, so it is logged, not used.
- S22 not run separately (folded into later month-end check).

## Stage 5 (declared before running)
| ID | Question |
|---|---|
| S23 | Hour shock: any NY clock hour 02:00-13:00 whose move is > 2.5x the median of the same hour over the past 20 days -> next 2 hours fade or follow? |
| S24 | Round numbers (Osler 2003, order clustering): first touch of a 0.0050 level (e.g. 1.2700, 1.2750) between 03:00 and 14:00 NY, after price was >= 15 pips away at the 60 minutes before. Does price bounce X pips before going X pips through (X = 10, 15, 20)? Control: the same test on levels offset by 0.0025 (1.2725, 1.2775). Edge must exceed the control in >= 6 of 8 years. |

## Stage 5 results (`s5_screen.py`, `out_s5.txt`)
- S23 hour shocks: nothing (4/8 years either way).
- S24 round numbers: the OPPOSITE of the "bounce" hypothesis, and consistent: at 0.0050 levels price goes **through first** more often than
  at control levels. Bounce-first rate: round 46-47% vs control 51-52% (X = 10/15/20), round below control in 5/8 (X=10) and 7/8 years (X=15, 20).
  This matches Osler's second finding (stop-loss orders cluster just beyond round numbers, so crossing one tends to accelerate).
  The absolute edge is small (about 53% through-first at 1:1), which at 1.5-pip cost is not enough on its own.

## Stage 6 (declared before running): profile of the round-number "push-through" (research measurement, not yet rules)
For first touches as in S24 (03:00-14:00 NY), enter in the approach direction at the level (stop order), stop S pips behind entry,
target T x S, else exit 15:59 NY. Grid S = 10, 15, 20, 25; T = 1, 2, none (time exit). Same on control levels.
Purpose: see whether round levels beat control in most years in EVERY cell (a real effect should not depend on the setting).
Choice of the setting later is by logic (stop >= 20x cost guideline, cost share), not by the best cell.

## Stage 6 results (`s6_round.py`, `out_s6.txt`)
Round levels beat the control levels in 5-7 of 8 years in every one of the 12 cells (a real, setting-independent effect of about +1.3 pips per touch),
but the absolute result of trading the push-through is about zero before costs (-0.7 to +0.6 pips) and negative after costs in every cell.
**Real effect, not tradable at 1.5-pip cost.** Dropped.

## Stage 7 (declared before running): "magnet" levels (first-passage test)
At check time t (08:00 NY and 10:00 NY), if price is D >= 15 pips from a reference level, does price reach the reference before it moves
another D pips away (before 15:59 NY)? A pure random walk gives 50%. References: R1 London 08:00 open, R2 NY midnight open (00:00 NY),
R3 day open 17:00 NY, R4 Asia middle (00:00-07:00 London), R5 previous day's close (16:59 NY). Pass: > 53% in >= 7 of 8 years.

## Stage 7 results (`s7_magnet.py`, `out_s7.txt`): no magnet. All 10 checks 46-52% (random walk = 50%). The popular "midnight open" level is,
if anything, the opposite of a magnet (46-47%: price keeps moving away). Dropped.

## Stage 8 (declared before running): short-horizon cross-market catch-up
S26: in each clock-aligned 15-minute block from 03:00 to 12:00 NY, if EURUSD moved more than 2.5x its median 15-min move (same block, past 20 days)
and GBPUSD moved less than 40% of EURUSD's move in the same direction (lagging), does GBPUSD catch up over the next 60 minutes?
S27: the mirror: GBPUSD shock (> 2.5x) while EURUSD moved < 40% of it (pound-specific move): next 60 minutes, follow or fade?

## Stage 8 results (`s8_catchup.py`, `out_s8.txt`)
S26: no catch-up (-0.2 p). S27: a pound-only 15-minute shock is followed by a small give-back: fading it earns +0.9 p over 60 min, 7/8 years.
Consistent but far below the 1.5-pip cost.
S27b (declared now): dose-response check only: does the give-back grow with the shock size (2.5x / 4x / 6x) and with time (60 / 180 min / to 15:59 NY)?
If it does not grow, the effect is too small to use.
S27b result: no dose-response (bigger shocks do not revert more; longer holding does not add). Dropped.

## Stage 9 (declared before running): expansion-day continuation (uses the round-2 fact that big days start early and trend)
S28: at 08:00 NY and at 10:00 NY, ratio = day's range so far (from 17:00 NY) / ATR20 of full days. Price location = where price sits in the range so far.
If location is in the top quarter -> long, bottom quarter -> short, hold to 15:59 NY. Report by ratio bucket (<0.5, 0.5-0.8, 0.8-1.1, >1.1).
Hypothesis: follow-through grows with the ratio (expansion days trend). If it shrinks/flips at > 1.1, that is exhaustion (fade).
S28 result: no pattern by bucket, no dose-response. Dropped.

## Stage 10 (declared before running): trade-level checks of the two stage-1 survivors not yet traded
| ID | Rules |
|---|---|
| T6 | S8 "volatility compression": T1 (orders at Asia high/low from 07:00 London, stop = other side, exit 15:59 NY) only when Asia range < 0.7 x median of the past 20 Asia ranges |
| T7 | T6 with target 2R |
| T8 | S15 month-end fix reversal: last trading day of the month. At 16:00 London, if the 15:00-16:00 London move is >= 5 pips, trade the other way at the 16:00 London price (close of the 15:59 London bar). Stop = the pre-fix hour's extreme (high for shorts, low for longs) + 3 pips, at least 10 pips. Exit 15:59 NY. |

## Stage 10 results (`s10_trades.py`, `out_s10.txt`)
- **T7 (quiet Asia breakout, 2R target): 300 trades, +43.5 R, +0.145 R/trade, 6/8 years positive, worst year -5.8 R, longs and shorts both +21.8 R,
  +33.7 R without the best 5, +17.3 R at 3-pip cost, losing run 9.** Best result so far, and its settings (0.7 x median, 2R) were fixed before seeing it.
- T6 (same, no target): +34.4 R but losing run 13, one -15 R year, negative without best 5. Worse.
- T8 month-end fix reversal: +20.4 R on 70 trades, but only shorts work (longs -4.4 R), negative without the best 5. Too thin.

## Stage 11 (declared before running): sensitivity of T7 (NOT for choosing settings; T7's 0.7 / 2R stay unless the area around them is unstable)
Asia-range ratio threshold 0.6 / 0.7 / 0.8 / 0.9 / 1.0 x target 1.5R / 2R / 2.5R / 3R / none. Report total R, years positive, losing run.

## Stage 11 results (`s11_sens.py`, `out_s11.txt`)
Clear dose-response: the quieter the Asia session, the better each trade (0.6 > 0.7 > 0.8 > 0.9 = 1.0, where 1.0 is "every day" and loses).
At 0.6-0.8 every target choice is positive. 2R sits inside the positive area (not on a lone peak). T7's pre-declared 0.7 / 2R are kept.
At 0.6 the result is better per trade but has only ~18 trades/yr; at 0.8 it has ~66/yr but fails at 3-pip cost. 0.7 is the balance and was chosen before.

## Final candidate = T7, written up as round-3 v3 (`v3_quiet_asia.py`). Total pre-declared checks in round 3: 47
(S0-S28 incl. sub-splits: 36 screening checks; T1-T8: 8 trade tests; stage-6 grid and stage-11 grid counted as 2 sensitivity studies; R1 variance ratio: 1).
