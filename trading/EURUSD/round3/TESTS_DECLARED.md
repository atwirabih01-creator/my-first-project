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
