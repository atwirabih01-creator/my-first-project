# EURUSD round 3 test register (Agent 1). Each stage is written BEFORE it is run; results are appended after.
Design data only: `trading/data/EURUSD_M1.csv.gz` (+ GBPUSD, XAUUSD, NSXUSD design files as signals), Jan 2019 .. Sep 2026.
Hidden 2016-2018 never opened. Gappy days skipped (gap > 15 min inside the hours used, or < 1,300 bars). No clock fix.
Cost 1.2 pips per trade (2.4 pips stress). Judged per calendar year 2019 .. 2026.
Thresholds are fixed by logic, by the GBPUSD/XAUUSD round-3 values, or by a past-only rolling median, never tuned on results.

## Stage 0 - out-of-market test of GBPUSD v3 (declared before running)
| ID | Test |
|---|---|
| V0 | GBPUSD round-3 v3 "Quiet-Asia breakout" **exactly as written** (Asia box 00:00-06:59 London; trade only if box < 0.7 x median of previous 20 boxes; buy stop at box high / sell stop at box low live 07:00-11:59 London; stop = other side; target 2R; close 15:59 NY bar; min stop 3 pips as written; 1 trade/day), on EURUSD with 1.2-pip cost (and 2.4). Per year. |
| V0b | Descriptive only (no choosing): the same rules with quiet threshold 0.6 / 0.7 / 0.8 / 0.9 / 1.0 to see if EURUSD has the same dose-response as GBPUSD. |
A pass = meets the owner's bar. Whatever happens, V0 is reported first.

## Stage 1 - screening (signed move in pips before cost, per year). Pass: same sign >= 6 of 8 years AND |mean| >= 2 pips per signal.
"Asia break" = first break of the Asia box (00:00-06:59 London) between 07:00 and 11:59 London; move = break level -> close of 15:59 NY bar.
| ID | Family | Pre-declared question |
|---|---|---|
| S0 | base | Follow the first London break of the Asia box, every day |
| S1 | Squeeze | S0 when Asia box < 0.7 x previous-20 median (V0 without stop/target); plus buckets <0.6/0.6-0.8/0.8-1.0/1.0-1.3/>1.3 |
| S2 | Squeeze | S0 when ATR5/ATR20 < 1 (gold's best compression measure) |
| S3 | Squeeze | Quiet pre-New-York: range 03:00-08:19 NY < 0.7 x its previous-20 median -> follow first break of that range 08:20-12:00 NY |
| S4 | Squeeze | Quiet previous day (range < 0.7 x previous-20 median) -> follow first break of previous day's high/low 03:00-12:00 NY |
| S5 | Squeeze + cross | S1 only when GBPUSD's Asia box is ALSO quiet (< 0.7 x its median): a dollar-wide squeeze |
| S6 | Mood | S0 follow when ER10 >= past-250-day median, fade when below (both halves reported) |
| S7 | Mood | S0 follow when ATR5/ATR60 >= 1, fade when < 1 (both halves) |
| S8 | Cross | GBPUSD London-morning move 02:00->08:00 NY predicts EURUSD 08:00->11:00 NY (follow) |
| S9 | Cross | EUR-GBP divergence: residual = EURUSD % - GBPUSD % (03:00->10:00 NY); top quartile (past 250 d) -> EURUSD reverts 10:00->15:59 NY |
| S10 | Cross | Gold 03:00->08:00 NY predicts EURUSD 08:00->11:00 NY (gold up = dollar weak = EUR up) |
| S11 | Cross | Nasdaq 09:30->10:30 NY predicts EURUSD 10:30->15:59 NY (risk-on = EUR up) |
| S12 | Cross | GBPUSD breaks its Asia box first (07:00-11:59 London) while EURUSD is still inside its box: EURUSD from that minute to 15:59 NY in GBP's direction |
| S13 | News | 08:30 NY shock (|08:30->08:45| > 3 x median of same window, previous 20 days): follow vs fade, 08:45->11:00 and ->15:59 NY |
| S14 | News | 10:00 NY shock, 10:00->10:15, then 10:15->15:59 |
| S15 | News | 14:00 NY shock (FOMC), 14:00->14:15, then 14:15->15:59 |
| S16 | News | 14:15 Frankfurt shock (ECB decision time), 14:15->14:30 Frankfurt; FADE from 14:30 Frankfurt to 18:15 Frankfurt (round-1 finding: undone on 12 of 14 ECB days) |
| S17 | Time | London 4pm fix: fade 15:00->16:00 London move, 16:00 London -> 15:59 NY |
| S18 | Time | Month-end (last trading day): fade the 15:00->16:00 London move into the fix, 16:00 London -> 15:59 NY (GBPUSD: 7/8 years) |
| S19 | Time | NY lunch reversal: fade 08:00->12:00 NY move, 12:00->15:59 NY |
| S20 | Time | Round-1 V2 out-of-sample: Wednesday + Friday short 12:00->15:59 NY (found on Oct 2024-Jun 2026; 2019-2023 is new for it) |
| S21 | Time | Round-1 weekday effect out-of-sample: Monday long and Wednesday short, 17:00 NY -> 15:59 NY |
| S22 | Time | Intraday momentum: 17:00->10:00 NY move predicts 10:00->15:59 NY |
News days are found by price shocks at the release minute (big moves only), because no 8-year calendar is connected; this captures the
big releases (NFP, CPI, retail sales at 08:30; ISM etc. at 10:00; FOMC at 14:00; ECB at 14:15 Frankfurt) and ignores dull ones.

## Stage 0 results (`v0_gbp_v3_on_eur.py`, `out_v0.txt`, `v0_trades.csv`)
**GBPUSD v3 fails on EURUSD.** 307 trades, -41.5 R (-0.135 R/trade), 3 of 8 years positive (2019 -6.1, 2020 -9.8, 2021 +4.7, 2022 0.0,
2023 -9.8, 2024 -19.6, 2025 -6.2, 2026 +5.3), losing run 15, longs -26.2 R, shorts -15.3 R, -70 R at 2.4-pip cost.
V0b: no dose-response: every threshold 0.6..1.0 loses (-0.15 to -0.07 R/trade). On EURUSD a quiet Asia night is not a coiled spring.
This is a genuine out-of-market failure, and it is a warning for GBPUSD v3 too (its edge may be pound-specific or partly luck).

## Stage 1 results (`s1_screen.py`, `out_s1.txt`): 43 checks incl. sub-splits
- **PASS S9 EUR-GBP divergence fade:** when EURUSD has out/under-performed GBPUSD by a top-quartile amount from 03:00 to 10:00 NY,
  EURUSD moves back +3.5 p (10:00 -> 15:59 NY), 7/8 years (2023 -4.5 on 13 cases). ~54 signals/yr. (On GBPUSD the mirror test failed:
  the gap closes through the euro, not the pound.)
- **PASS S16 14:15 Frankfurt shock fade:** +5.5 p, 6/8 years, but only ~23 signals a year (2023 -6.4, 2026 -4.1).
- **PASS S21 Monday long (17:00 NY Sunday -> 15:59 NY Monday):** +5.6 p, 7/8. Suspect: it starts at the Sunday reopen, the bid-only
  spread artefact the README warns about. Must be re-measured from after the reopen before it counts.
- Near misses: S3 quiet pre-NY break follow +4.9 p but 5/8 (2019-2021 all negative); S14 10:00 shock follow +3.3 p 5/8; S13 08:30 shock fade
  (to 11:00) 7/8 but only +1.4 p; S8 GBP/S10 gold leading EUR 6/8 but < 1 p.
- Fails: S0 Asia-box break follow (+0.3 p, 4/8: unlike GBPUSD and gold, EURUSD's London break has no follow-through at all), S1 quiet Asia,
  S2, S4, S5 (squeezes), S6/S7 mood switches (both halves lose), S11 Nasdaq, S12 GBP-first breaks, S15 FOMC, S17 4pm fix, S18 month-end
  (3/8, unlike GBPUSD), S19 lunch, S20 Wed+Fri afternoon short (round-1 idea: 4/8 on 8 years; it was a 2024-26 effect only), S21 Wednesday short, S22.

## Stage 2 (declared before running): structure of the three survivors
| ID | Check |
|---|---|
| D1 | S9 dose-response: residual size bucket (past-250-day quantiles <50%, 50-75%, 75-90%, >90%), per year. A real effect should grow with the gap. |
| D2 | S9 by side: EUR out-performed (-> short EUR) vs EUR under-performed (-> long EUR), per year. |
| D3 | S9 control: fade EURUSD's own 03:00->10:00 move when it is top-quartile (no GBP). If that works as well, the GBP comparison adds nothing. |
| D4 | S9 control 2: fade GBPUSD's move when GBPUSD's own move is top quartile... replaced by: S9 measured on the synthetic EURGBP (EURUSD/GBPUSD) 10:00->15:59 NY. Does the pair as a whole close the gap, and through which leg? |
| D5 | S9 timing: residual over 02:00->08:00 NY then fade 08:00->15:59 NY; residual over 03:00->12:00 NY then fade 12:00->15:59 NY. |
| D6 | S9 path: share of the 10:00->15:59 reversion made by 12:00 NY. |
| D7 | S21 Monday long measured from 19:00 NY Sunday (after the reopen spread), from 00:00 London, and from 02:00 NY, to 15:59 NY. Plus Tuesday/Thursday/Friday long for comparison. |
| D8 | S16 restricted to Thursdays (ECB days are Thursdays) vs other days. |
| D9 | S3 dose-response by pre-NY-range ratio (<0.5, 0.5-0.7, 0.7-0.9, 0.9-1.2, >1.2). |
Pass: same as stage 1, plus a dose-response or a clear mechanism.

## Stage 2 results (`s2_structure.py`, `out_s2.txt`): 37 checks
- **S9 EUR-GBP divergence fade holds up:** D1 dose-response is a step: below the 75% line nothing (-0.4 p), 75-90% +3.6 p (6/8), top 10% +3.3 p.
  D3 control: fading EURUSD's own big 03:00-10:00 move WITHOUT the GBP comparison does not work (+0.8 p, 3/8), so the cross-market part is what matters.
  D3c: strongest when EURUSD's own move is also big (EUR moved hard, GBP did not follow): +6.4 p, 7/8. D4: the reversal is not EURGBP closing the
  gap (synthetic EURGBP only +1.2, 4/8); GBPUSD moves the same way as the EUR fade (+2.5 p). Reading: **a big euro move that the pound does not
  confirm is a one-off euro flow, and it is given back in the New York session.** D5: 2/3 of the give-back happens 10:00-12:00 NY (+2.9 p, 7/8);
  measured 02:00-08:00 it is weaker (5/8); measured to 12:00 it is gone (the give-back has happened by then).
  D2 warning: lopsided by side: EUR under-performed -> long +5.7 p (7/8); EUR out-performed -> short +1.4 p (5/8).
- **S21 Monday long is the bid-only artefact:** the Sunday reopen window 17:00-19:00 NY alone gives +3.0 p in 8/8 years; from 19:00 NY Sunday the
  Monday rise is +3.0 p, 5/8 (2022 -8.2). From 02:00 NY +1.3 p. **Dropped.**
- S16 ECB-time shock fade: Thursdays (ECB days) are NOT better than other days (+5.3 p 4/8 vs +5.5 p 6/8): it is a general 14:15 Frankfurt
  shock fade, ~17 a year outside Thursdays. Too few trades for the bar on its own.
- S3 quiet pre-NY break follow has a clean dose-response (ratio <0.5 +10.0 p, 0.5-0.7 +4.1, 0.7-0.9 +1.2, 0.9-1.2 -1.0, >1.2 -2.5), but by year
  it is a regime effect: 2019-2021 negative, 2022-2026 positive.

## Stage 3 (declared before running): trade tests. Common: EURUSD bid data + 1.2 pips cost (2.4 stress); stop and target in the same minute = stop;
## exit at the close of the 15:59 NY bar; ATR20 = mean daily range (17:00-17:00 NY) of the previous 20 valid days; min stop 2.4 pips; 1 trade/day per idea.
| ID | Rules |
|---|---|
| T1 | S9: at 10:00 NY (price = close of the 09:59 bar), residual = ln(EUR 10:00/03:00) - ln(GBP 10:00/03:00); if |residual| > its past-250-day 75% quantile, trade EURUSD opposite to the residual. Stop 0.3 x ATR20. No target. |
| T2 | T1 with a structural stop: beyond the 03:00-10:00 NY extreme of EURUSD on the side of the move (short: high + 1 pip; long: low - 1 pip). No target. Skip if that stop is < 0.15 x ATR20 or > 0.6 x ATR20. |
| T3 | T1 with target 1R |
| T4 | T1 with time exit at 12:00 NY (D5: most of the give-back is done by then) |
| T5 | T1 with stop 0.3 x ATR20 and target 2R |
| T6 | S3 squeeze in New York: pre-NY box 03:00-08:19 NY < 0.7 x previous-20 median -> buy stop / sell stop at the box edges live 08:20-11:59 NY; stop = other side; target 2R (GBPUSD v3 logic moved to the NY session) |
| T7 | S16: 14:15 Frankfurt shock (|14:15->14:30| > 3 x previous-20 median) -> fade at 14:30 Frankfurt; stop 0.3 x ATR20; exit 18:15 Frankfurt or 15:59 NY, whichever first |
Sensitivity (not for picking): T1 stop 0.2 / 0.3 / 0.4 / 0.5 x ATR20 crossed with target none / 1R / 2R; and the residual quantile 0.7 / 0.75 / 0.8 / 0.85.

## Stage 3 results (`s3_trades.py`, `out_s3.txt`): 7 trade tests + 2 sensitivity studies
| Test | Trades/yr | Total R | R/trade | Years + | Worst yr | Long / short R | 2.4-pip cost | No best 5 | Losing run |
|---|---|---|---|---|---|---|---|---|---|
| T1 S9 fade, 0.3 ATR stop, hold | 54 | +23.3 | +0.056 | 6/8 | -12.0 | +20.4 / +2.9 | 0.0 | +3.6 | 8 |
| **T2 S9 fade, stop beyond 03-10 extreme** | **29** | **+41.9** | **+0.184** | **6/8** | **-4.2** | **+30.4 / +11.6** | **+29.5** | **+20.4** | **6** |
| T3 0.3 ATR, 1R | 54 | +5.2 | +0.012 | 5/8 | -13.1 | +7.5 / -2.3 | -18.1 | +0.3 | 8 |
| T4 0.3 ATR, exit 12:00 NY | 54 | +5.1 | +0.012 | 5/8 | -11.2 | +1.9 / +3.1 | -18.2 | -12.4 | 7 |
| T5 0.3 ATR, 2R | 54 | +16.7 | +0.040 | 5/8 | -12.0 | +11.1 / +5.6 | -6.5 | +6.9 | 8 |
| T6 NY pre-open squeeze, 2R | 40 | +36.0 | +0.116 | 5/8 | -9.6 | +6.9 / +29.1 | +17.0 | +26.2 | 9 |
| T7 14:15 Frankfurt shock fade | 23 | +20.8 | +0.119 | 5/8 | -4.5 | +19.2 / +1.5 | +10.5 | -1.2 | 4 |
- T1 sensitivity: every stop/target cell is positive but small (+0.01 to +0.08 R); the residual quantile is fragile (0.70: +0.002 R; 0.85: +0.02 R).
  So the S9 signal with a plain ATR stop is real but thin. 2025 loses in every ATR-stop version (-11 to -14 R).
- **T2 is the best trade test.** The structural stop says: "if EURUSD makes a new extreme beyond its morning move, the move is not finished, get out."
  But its skip rule (stop < 0.15 or > 0.6 x ATR20) removes 191 of 419 signals, so it has only 29 trades a year (bar: 40).
- T6 is a regime effect (2019-2021 all negative, 2022-2026 all positive; shorts carry it). T7 is too few and depends on its best trades.

## Stage 4 (declared before running): can T2 reach 40 trades a year without fitting? plus two "excess activity fades" (post-hoc, labelled)
| ID | Check |
|---|---|
| U1 | T2's skipped signals, by reason (stop < 0.15 ATR / > 0.6 ATR): what would they have made with the structural stop? (diagnostic) |
| U2 | **T2b: bounded structural stop, no skips**: stop distance = structural distance, but at least 0.15 x ATR20 and at most 0.6 x ATR20 (the same two numbers T2 already used, now as limits instead of skip rules). |
| U3 | T2b sensitivity (not for picking): residual quantile 0.70 / 0.75 / 0.80 / 0.85; target none / 1R / 2R; per side per year |
| U4 | T2 + T7 run side by side (two independent ideas, each max 1 trade a day) |
| U5 | Post-hoc (from S1 buckets): FADE the first London break of the Asia box when the Asia box > 1.3 x its 20-day median; entry at the break level, stop = 0.3 x ATR20, exit 15:59 NY |
| U6 | Post-hoc (from D9): FADE the first break of the pre-NY box (03:00-08:19 NY) after 08:20 when the box > 1.2 x its 20-day median; same stop/exit as U5 |

## Stage 4 results (`s4_t2.py`, `out_s4.txt`): 6 checks + 1 sensitivity study
- **U1: T2's "skip" rule is a real confirmation step, not a filter that happens to fit.** Signals where EURUSD is still at (within 0.15 x ATR20 of) its
  morning extreme at 10:00 NY lose: 129 trades, -16.4 R, 2/8 years (the euro move has not stopped yet; fading it is catching a falling knife).
  Signals where price has already come back more than 0.6 x ATR20 are flat (+0.3 R on 62): the give-back has already happened.
- U2 T2b (no skips, bounded stop) +35.0 R, +0.084 R/trade, 54/yr, but negative without the best 5 at double cost and only +8.4 R without best 5:
  adding the two bad groups back dilutes it. U3: T2b is fragile to the quantile (0.70 and 0.80 much worse). Not used.
- U4 T2 + T7 side by side: 52/yr, +62.7 R, +0.156 R/trade, 6/8 years, worst -3.7 R, longs +49.6 / shorts +13.1, x2 cost +40.0, no best 5 +38.8, run 8.
  Meets almost the whole bar, but it is two ideas glued together after seeing the results, and T7 alone fails "without best 5". Labelled post-hoc.
- U5 (post-hoc) fade the London break of a WIDE Asia box: +0.10 R but 5/8 years and a losing run of 18. U6 fade wide pre-NY box breaks: -20 R. Both dropped.

## Stage 5 (declared before running): T2 robustness and a second checkpoint for the same idea (more trades with the same logic)
| ID | Check |
|---|---|
| W1 | T2 sensitivity (not for picking): residual quantile 0.60 / 0.65 / 0.70 / 0.75 / 0.80 / 0.85 |
| W2 | T2 sensitivity: stall threshold (lower bound) 0.10 / 0.15 / 0.20 / 0.25 x ATR20 crossed with upper bound 0.5 / 0.6 / 0.8 / none |
| W3 | Same idea, earlier checkpoint: residual 02:00 -> 08:00 NY (London morning), same quantile, same stall/stop rules, enter at 08:00 NY |
| W4 | T2 (10:00) and W3 (08:00) both live, max 1 trade a day (the 08:00 trade comes first; if taken, no 10:00 trade) |
| W5 | Same idea, later checkpoint: residual 03:00 -> 12:00 NY, enter 12:00 NY |
| W6 | T2 with target 1R / 2R (sensitivity) |
| W7 | T2 per weekday and with/without 08:30 / 10:00 NY shock days (news check, descriptive only) |

## Stage 5 results (`s5_t2.py`, `out_s5.txt`): 4 checks + 3 sensitivity studies
- W1 quantile: every value 0.60-0.85 is positive, and the edge per trade rises with the size of the gap (0.60 +0.120, 0.65 +0.140, 0.70 +0.162,
  0.75 +0.184 R) while trades fall (48 -> 29 a year): a dose-response, not a lone peak. **0.65 would meet every bar point (41/yr, +0.140 R, 6/8,
  worst -2.5 R, both sides +, losing run 8), but it would be chosen after looking; the pre-declared 0.75 stays.**
- W2 stall rule: lower bound 0.10-0.15 x ATR20 works, 0.20-0.25 weaker; upper bound matters little. 0.15 / 0.6 stay (pre-declared in T2).
  Lower bound 0.10 makes the shorts flat: the stall confirmation is what protects the shorts.
- **W3 (08:00 NY checkpoint) and W5 (12:00 NY checkpoint) fail** (0.0 R and -13.3 R). The effect belongs to the 10:00 NY check: the euro-only move
  built during the European day is given back in Europe's last two hours (10:00-12:00 NY = 15:00-17:00 London, including the 4pm fix and the
  London close). W4 (both checkpoints) is diluted by W3. Not used.
- W6 2R target: +37.8 R, 7/8 years, worst -0.2 R (sensitivity only; hold-to-close stays as declared).
- W7: Thursday +16.9 R and Friday +13.0 R carry most of it; Tuesday -0.3 R. Not filtered. US-shock days (08:30/10:00 NY) +0.10 R/trade vs +0.21 on other days.

## Stage 6 (declared before running): final checks of the chosen rules (T2 = round-3 v3), no rule changes
| ID | Check |
|---|---|
| X1 | Entry one minute late (close of the 10:00 NY bar instead of the 09:59 bar) |
| X2 | Half-year results (16 halves) and monthly-equity max drawdown |
| X3 | Bootstrap chance the true average is <= 0 |
| X4 | Typical size of the 75% threshold in percent per year (for a manual version) |
| X5 | Exit reasons, median stop in pips per year, trades per year |

## Stage 6 results (`v3_check.py`, `out_v3.txt`, `v3_trades.csv`): 5 checks
- X1 entry one minute late (all checks redone at that price): +37.4 R, +0.159 R/trade, 5/8 years; in pips +4.6 -> +3.3 per trade. **Sensitive to fill speed.**
- X2 half-years: 9 of 15 positive; worst half 2025b -8.3 R. Biggest drop -8.4 R.
- X3 bootstrap chance the true average is <= 0: 0.8% (before allowing for the ~110 checks of this round).
- X4 the 75% threshold has been 0.18-0.45% (median by year): 2020 0.45%, 2024-2026 about 0.18-0.22%. It must be adaptive (a fixed % would not work).
- X5 exits: 165 at 15:59 NY, 63 stops. Median stop 18-32 pips by year (min 7.2 pips, above the 2.4-pip floor). Trades per year 7 (2023, gappy) to 63 (2022).

## Decision: T2 frozen as EURUSD round-3 **v3 "Euro-only move fade"** (rules in `strategy.md`, check script `v3_check.py`).
Total pre-declared checks this round: stage 0: 2, stage 1: 43, stage 2: 37, stage 3: 7 trades + 2 sensitivity, stage 4: 6 + 1, stage 5: 4 + 3, stage 6: 5 = **110 checks**.
