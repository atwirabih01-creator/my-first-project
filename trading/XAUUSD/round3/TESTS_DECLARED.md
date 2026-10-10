# XAUUSD round 3 test register (Agent 1). Each stage is written BEFORE it is run; results are appended after.
Design data only: `trading/data/XAUUSD_M1.csv.gz` (+ EURUSD, NSXUSD design files as signals), 2019-01 .. 2026-09.
Hidden 2016-2018 never opened. Gappy days skipped (gap > 15 min inside the hours used, or < 1,300 bars). No clock fix.
Cost 0.40 USD per trade (and 0.80 USD stress). Judged per calendar year 2019 .. 2026.
Thresholds are fixed by logic, by the GBPUSD round-3 values, or by a past-only rolling median, never tuned on results.

## R0 - profile (`r0_profile.py`, `out_r0.txt`), facts used for scaling
- Median daily range (18:00-16:59 NY): 2019 13.5 USD (0.96% of price), 2020 25.4, 2021 21.0, 2022 23.2, 2023 19.5, 2024 30.8, 2025 51.5, 2026 103.4 USD (2.29%).
- So the 0.40 USD cost is **3.0% of a normal day's range in 2019, 1.3% in 2024, 0.4% in 2026**. Any edge must beat costs in the early, cheap, quiet years.
- Busiest NY hours every year: 08:00-11:00 NY (each ~0.30-0.40 of the day's range). Quietest: 23:00-00:00 and 18:00-19:00 NY.
- Hourly drift (signed move per hour, % of ATR): nothing stable except 18:00 NY (+, every year) = the bid-only reopen/spread artefact; ignored.

## Stage 1 - screening (signed move in % of ATR20 = mean daily range of the previous 20 full days; per year)
"ATR" below always means ATR20 measured on days before the signal day.
| ID | Family | Pre-declared question | Signal | Measured move |
|---|---|---|---|---|
| S0 | (base) | Follow the first London break of the Asia range (00:00-06:59 London), break window 07:00-11:59 London, every day | follow | break level -> 15:59 NY close |
| S1 | 1 Squeeze | S0 only when Asia range < 0.7 x median of the previous 20 Asia ranges (GBPUSD value, unchanged) | follow | same; plus dose-response buckets 0-0.6/0.6-0.8/0.8-1.0/1.0-1.3/>1.3 |
| S2 | 1 Squeeze | Quiet previous day: previous day range < 0.7 x median of previous 20 day ranges; follow the first break of the previous day's high/low 03:00-12:00 NY | follow | level -> 15:59 NY |
| S3 | 1 Squeeze | Quiet pre-New-York: range 03:00-08:19 NY < 0.7 x its own 20-day median; follow first break of that range 08:20-12:00 NY (COMEX open) | follow | level -> 15:59 NY |
| S4 | 2 Mood | S0 follow when ER10 (10-day efficiency ratio of daily closes) >= its past-250-day median, fade when below | switch | as S0 |
| S5 | 2 Mood | S0 follow only when the break is in the direction of the 20-day trend (prior close vs close 20 days earlier); counter-trend breaks are faded | switch | as S0 |
| S6 | 2 Mood | S0 follow when ATR5/ATR60 >= 1 (vol rising), fade when < 1 | switch | as S0 |
| S7 | 3 Cross | EURUSD % move 03:00->08:00 NY (dollar weakening = EUR up) predicts gold 08:00->11:00 NY, same sign | sign(EUR) | gold 08:00->11:00 |
| S8 | 3 Cross | Gold vs dollar divergence 02:00->08:00 NY: residual = gold % - b x EURUSD % (b = past-250-day regression of daily 02:00-08:00 moves). Top/bottom quartile of residual (past 250 days) -> fade | -sign(resid) | gold 08:00->15:59 |
| S9 | 3 Cross | Nasdaq move 09:30->10:30 NY predicts gold 10:30->15:59 NY (risk-off: Nasdaq down -> gold up) | -sign(NSX) | gold 10:30->15:59 |
| S10 | 3 Cross | EURUSD 15-min shock (> 2.5x median same block, past 20 d) with gold lagging (< 40% of its own usual reaction): gold catches up next 60 min, 03:00-12:00 NY | sign(EUR) | next 60 min |
| S11 | 4 News | 08:30 NY shock: abs(08:30->08:44 close) > 3x median of the same window over the previous 20 days. Follow vs fade | both | 08:45 -> 11:00 and -> 15:59 |
| S12 | 4 News | 10:00 NY shock (ISM, JOLTS, sentiment), same definition, 10:00->10:14 | both | 10:15 -> 15:59 |
| S13 | 4 News | 14:00 NY shock (FOMC, minutes), 14:00->14:14 | both | 14:15 -> 15:59 |
| S14 | 5 Time | London AM fix (10:30 London): move 10:00->10:30 London is reversed 10:30->12:00 London | fade | |
| S15 | 5 Time | London PM fix (15:00 London): move 14:00->15:00 London is reversed 15:00 London -> 15:59 NY | fade | |
| S16 | 5 Time | COMEX open momentum: move 08:20->08:50 NY continues 08:50->11:00 NY | follow | |
| S17 | 5 Time | Shanghai morning (09:00-11:30 Beijing = 01:00-03:30 UTC) move predicts London 07:00-12:00 London | follow | |
| S18 | 5 Time | Month-end (last trading day): fade the move 08:00 NY->10:00 NY (= into London PM fix) from 10:00 to 15:59 NY | fade | |
| S19 | 5 Time | Day-session vs night-session drift: sign of mean move Asia (18:00-02:00 NY), London (02:00-08:20), NY (08:20-15:59), per year | drift | |
| S20 | 5 Time | Intraday momentum: move 18:00 NY (prev) -> 12:00 NY predicts 12:00 -> 15:59 NY | follow | |
Pass mark for stage 1: same sign in >= 6 of 8 years AND mean >= +3% of ATR per signal (3% of ATR ~ the cost in 2019, the most expensive year).
For "both" tests the follow and fade halves are reported; fade = minus follow, so only one sign can pass.
Survivors go to stage 2 (full trade rules, stop/target, 0.40 USD cost).

## Stage 1 results (run 10 Oct 2026, `s1_screen.py`, `out_s1.txt`); 29 checks incl. sub-splits
Pass = same sign >= 6/8 years and |mean| >= 3% ATR.
- **S0 follow the first London break of the Asia range: +3.7% ATR, 6/8 years** (2019 -1.6, 2022 -0.9). Passes, barely; same as GBPUSD.
- **S1 quiet-Asia squeeze (GBPUSD's winner): FAILS on gold** (+2.0%, 2019 -11.1%). The dose-response is NOT the GBPUSD one: the busiest
  Asia nights (> 1.3x median) give the best follow-through (+9.4%, 7/8 years), the middle buckets are flat. On gold, a quiet night is not a coiled spring.
- S2 quiet previous day + PDH/PDL break: -4.1% (3/8). S3 quiet pre-NY range + break after the COMEX open: -3.6% (2/8): fails, the opposite if anything.
- S4 ER10 mood switch: 7/8 years but only +1.9% (fade half loses 5/8). Fail. S5 trend switch: +0.5%. Fail. Both "fade" halves lose: fading London's break is wrong in every mood, exactly as on GBPUSD.
- **S6 vol switch: fails as declared (-2.3%), because its fade half is the worst check of the round: fading the break when ATR5/ATR60 < 1 loses in 7/8 years
  (-5.2%).** Read the other way: **following the break when recent days are quieter than the 60-day norm earns +5.2% in 7/8 years**, more than when volatility is rising
  (+1.4%, 5/8). That IS the squeeze idea, measured over days instead of over one night. It was not declared in that direction, so it goes to stage 2 as a new declared test.
- S7-S10 cross-market: all fail (EUR leading gold: -0.4%; gold-dollar divergence fade: -2.5%; Nasdaq risk-off: -1.0%; EUR shock catch-up: 0.0%).
- S11 08:30 shocks: fail (flip by year). **S12 10:00 shock follow: +3.6%, 7/8 years, but only ~24 signals a year.** S13 14:00 shock: fade +2.4%, 6/8 (below 3%).
- S14-S18 fixes, COMEX open, Shanghai, month-end: all fail (|mean| < 1% or unstable). S16 COMEX-open follow and S20 intraday momentum are 7/8 but < 1% ATR (too small).
- S19: Asia-hours drift is +3.9% in 8/8 years only because of the 18:00 NY reopen hour (bid-only spread artefact); without it 5/8. Not used.

## Stage 2 (declared before running): structure of the London-break follow-through
| ID | Question |
|---|---|
| S21 | S0 split by ATR5/ATR60 buckets (<0.8, 0.8-0.9, 0.9-1.0, 1.0-1.1, 1.1-1.25, >1.25): is there a dose-response (quieter recent days -> better follow)? |
| S22 | 2x2: ATR5/ATR60 < 1 vs >= 1, crossed with Asia ratio < 1 vs >= 1: are "quiet regime" and "busy Asia night" the same effect or two? |
| S23 | Long vs short, per year, for S0 and for S0 with ATR5/ATR60 < 1 (the bull-market problem) |
| S24 | Generality: the ATR5/ATR60 < 1 condition applied to other breakouts: S3 base (break of 03:00-08:19 NY range after 08:20) and the first break of the previous day's high/low 03:00-12:00 NY (all days, not only quiet ones) |
| S25 | Other compression measures with the same logic, fixed in advance: ATR5/ATR20 < 1; previous-day range < ATR20 (inside-ish day); NR4 (prev day narrowest of 4) |
| S26 | Time stability: S0 with ATR5/ATR60 < 1 by half-year, and the share of the move made before 12:00 NY vs after |
Pass as stage 1 (6/8 years, >= 3% ATR). A dose-response is required before anything is turned into rules.

## Stage 2 results (`s2_structure.py`, `out_s2.txt`); 31 checks
- S21: **no dose-response for ATR5/ATR60** (bucket < 0.8 is +3.7%, 0.9-1.0 is +9.0%, 1.1-1.25 is -3.0%; every bucket 5-6/8 years). Weak support only.
- S22: three of the four cells are about +5%; the bad cell is "volatile recent weeks AND a quiet Asia night" (-4.5%, 3/8).
- S23: S0 longs +4.1% (5/8 years), shorts +3.2% (6/8). With ATR5/ATR60 < 1: longs +6.4% (7/8), shorts +3.7% (5/8). Shorts are the weaker side.
- S24: the compression filter does NOT help other breakouts (pre-NY range break and PDH/PDL break are better when ATR5/ATR60 >= 1, if anything). So it is not a general "squeeze" law on gold.
- **S25: ATR5/ATR20 < 1 (the last 5 days quieter than the last 20): S0 +4.6% ATR, positive in 8 of 8 years** (2019 +1.0, 2024 +1.2 weakest); the other half +2.9%, 4/8.
  Previous-day range < ATR20: +3.8%, 7/8. NR4: no help.
- S26: S0 with ATR5/ATR60 < 1 is negative in 3 of 16 half-years (2019b, 2022a, 2025b). Almost all of the follow-through is in place by 12:00 NY (5.0% of 5.2%).

## Stage 3 (declared before running): trade tests. Common rules unless stated:
buy stop at Asia high and sell stop at Asia low (Asia = 00:00-06:59 London), live 07:00-11:59 London, first fill only, both in one minute = no trade,
fill at the level or the bar open if gapped. Exit at the close of the 15:59 NY bar. Cost 0.40 USD (report 0.80 too). Stop and target in one minute = stop.
Stop distance = max(k x ATR20, 8 USD) from the fill, where 8 USD = 20 x cost (the stop is scaled by volatility, with the cost-based floor).
| ID | Stop | Target | Filter |
|---|---|---|---|
| T1 | opposite side of the Asia range; skip if < 8 USD (round-2 style) | none | none |
| T2 | 0.5 x ATR20 | none | none |
| T3 | 0.5 x ATR20 | none | ATR5/ATR20 < 1 (S25) |
| T4 | 0.5 x ATR20 | none | ATR5/ATR60 < 1 (S6 reversed) |
| T5 | 0.5 x ATR20 | none | previous-day range < ATR20 |
| T6 | 0.5 x ATR20 | 1R | ATR5/ATR20 < 1 |
| T7 | 0.5 x ATR20 | 2R | ATR5/ATR20 < 1 |
| T8 | 0.5 x ATR20 | none | Asia range > 1.3 x 20-day median (post-hoc from the S1 dose-response; labelled as such) |
| T9 | news: at 10:15 NY follow a 10:00 shock (S12 definition); stop 0.5 x ATR20; exit 15:59 NY | none | - |
Sensitivity (not for picking): T3 with k = 0.3 / 0.4 / 0.5 / 0.75 / 1.0.

## Stage 3 results (`s3_trades.py`, `out_s3.txt`); 9 trade tests + 1 sensitivity study
| Test | Trades/yr | Total R | R/trade | Years + | Worst year | Long / short R | Double cost | Without best 5 | Losing run |
|---|---|---|---|---|---|---|---|---|---|
| **T1 Asia-opposite stop, skip < 8 USD, hold to 15:59** | 125 | **+92.3** | **+0.095** | **7/8** | -2.3 (2025) | +42.5 / +49.8 | +65.3 | +63.6 | 8 |
| T2 0.5 ATR stop, all days | 199 | +77.3 | +0.050 | 6/8 | -7.1 | +33.0 / +44.2 | +32.4 | +50.3 | 10 |
| T3 0.5 ATR, ATR5/ATR20 < 1 | 105 | +48.4 | +0.059 | 8/8 | +1.7 | +15.5 / +33.0 | +25.2 | +28.7 | 8 |
| T4 0.5 ATR, ATR5/ATR60 < 1 | 106 | +56.6 | +0.069 | 7/8 | -4.5 | +27.8 / +28.8 | +32.6 | +36.6 | 8 |
| T5 0.5 ATR, prev day < ATR | 113 | +57.6 | +0.066 | 7/8 | -2.7 | +24.2 / +33.4 | +32.3 | +31.4 | 7 |
| T6 T3 + 1R target | 105 | +35.2 | +0.043 | 6/8 | -4.6 | +8.8 / +26.4 | +12.0 | +30.3 | 8 |
| T7 T3 + 2R target | 105 | +40.2 | +0.049 | 7/8 | -1.0 | +9.1 / +31.1 | +16.9 | +30.2 | 8 |
| T8 busy Asia > 1.3x median (post-hoc) | 48 | +68.6 | +0.186 | 7/8 | -3.1 | +17.2 / +51.4 | +57.8 | +44.1 | 6 |
| T9 10:00 NY shock follow | 24 | +13.7 | +0.073 | 7/8 | -0.6 | +7.0 / +6.7 | +8.3 | +2.9 | 6 |
- The compression filters (T3-T5) make the per-year record steadier but the edge per trade stays at +0.06-0.07 R: below the +0.08 bar. Targets (T6, T7) hurt.
- T3 stop-size sensitivity: k 0.3-1.0 all positive (+29 to +57 R), 6-8/8 years: not fragile, but small.
- **T1 is the strongest pre-declared test.** Its stop is the Asia box itself, and its 8 USD floor removes small boxes. Together with T8 and the S1 buckets this points at
  one gold-specific fact: **London follows through best after an ACTIVE Asia session, not a quiet one** (the reverse of GBPUSD). Gold has a real Asian market
  (Shanghai, India, Tokyo); when it moves at night, London tends to continue it.
- Warning: T1 is close to the round-2 idea that failed the Oct 2022 - Sep 2023 hidden year. Differences: stop order at the box (not a 15-min close), no 1R target
  (hold to 15:59 NY). Stage 4 must check that window.

## Stage 4 (declared before running): robustness of T1 (not for tuning; T1's rules stay unless something breaks)
| ID | Check |
|---|---|
| U1 | T1 by Asia-range / ATR20 bucket (< 0.3, 0.3-0.45, 0.45-0.6, > 0.6), per year: does R per trade rise with the box size relative to normal? |
| U2 | T1 with floors 12 and 16 USD (cost-scaled sensitivity) |
| U3 | T1 with 1R, 2R, 3R targets (sensitivity) |
| U4 | T1 in Oct 2022 - Sep 2023 (round-2 hidden year, now design data), by month; and at 0.80 cost |
| U5 | T1 + ATR5/ATR20 < 1 (one combination of the two findings) |
| U6 | T1 at double cost with a 16 USD floor (rule-consistent double cost) |
| U7 | T1 with exit at 11:59 NY instead of 15:59 NY |
| U8 | T1 on price-defined news days (08:30, 10:00 or 14:00 NY shock > 3x median) vs other days; long/short per year; weekday |
| U9 | T1 with the relative floor "Asia range >= 0.3 x ATR20" in place of 8 USD (keeps 8 USD as an absolute minimum too) - does the edge survive a scale-free rule? |

## Stage 4 results (`s4_robust.py`, `out_s4.txt`, trades `t1_trades.csv`); 9 checks
- U1 box size vs ATR: R/trade +0.10 (< 0.3 ATR), +0.04 (0.3-0.45), +0.10 (0.45-0.6), **+0.20 (> 0.6 ATR, 7/8 years)**. Rising at the top, not clean below.
- U2 floors: 12 USD +0.069 R/tr 5/8 years; 16 USD +0.123 R/tr 8/8 years (51 trades/yr, few before 2024). Not monotonic: the 8 USD floor is not "tuned", but the result depends on it.
- U3 targets: 1R +0.045 (worst year -14.8 R), 2R +0.067, 3R +0.086 (8/8). Letting winners run matters; no target kept.
- **U4 Oct 2022 - Sep 2023 (round-2 hidden year): -7.1 R on 59 trades (37% won), longs -9.8 R. T1 shares round 2's weak spot.** By month: Oct -1.2, Nov -3.0, Dec +2.3, Jan -1.1, Feb -5.9, Sep +1.7.
- U5 T1 + ATR5/ATR20 < 1: +0.115 R/tr, 63/yr, 6/8 years (worse spread over years than T1).
- U6 double cost with 16 USD floor: +43.1 R, +0.110 R/tr, 7/8 years.
- U7 exit at 11:59 NY: +78.6 R, +0.081 R/tr, 6/8 years: the afternoon adds a little.
- **U8: the profit sits on US-news-reaction days.** Days with an 08:30/10:00/14:00 NY shock > 3x normal: +85.2 R on 296 trades (+0.29 R/tr, 6/8 years);
  all other days +7.1 R on 673 trades (+0.01 R/tr, 4/8). The shock happens AFTER entry, so this is hindsight, not a filter. Weekday: Mon +37, Tue +7, Wed +3, Thu +47, Fri -1 R.
  Longs by year: 2021 -5.0, 2022 -9.4 (falling gold); shorts: 2025 -9.8 (gold +62%). Each side loses in the year that runs against it; the other side covers it.
- U9 scale-free floor (box >= 0.3 ATR20 and >= 8 USD): +77.0 R, +0.094 R/tr, 7/8 years: same picture.

## Stage 5 (declared before running): the London-break / US-news link
| ID | Check |
|---|---|
| V1 | On days with a London Asia-box break AND a 08:30 / 10:00 / 14:00 NY shock (> 3x median), how often does the shock go the same way as the break? Per year. 50% = no link. |
| V2 | News-confirmation trade: at the close of the shock window (08:44, 10:14 or 14:14 NY bar, first shock of the day only), if the shock goes the SAME way as the day's London break, enter in that direction; stop 0.5 x ATR20 (min 8 USD); exit 15:59 NY. Report also the "against" case followed in the shock direction. |

## Stage 5 results (`s5_news.py`, `out_s5.txt`); 3 checks
- **V1: the US news shock goes the same way as London's break 49.5% of the time (483 days; 45-60% by year). No link.**
  So U8 is not a direction edge: a trade with a fixed stop and no target always looks great on big-move days (wins run, losses are capped)
  and slightly bad on quiet days. Big-news days are simply where this kind of trade collects its winners.
- V2 news-confirmation trade (shock agrees with London's break): +14.8 R, +0.06 R/tr, 31/yr, +1.0 R without best 5. Shock against: +5.9 R, 4/8 years. Neither is usable.

## Decision: T1 is frozen as gold round-3 **v3** (exact rules in `strategy.md`, check script `v3_check.py`).
Total pre-declared checks this round: stage 1: 29, stage 2: 31, stage 3: 9 trades + 1 sensitivity, stage 4: 9, stage 5: 3 = **82 checks**.
