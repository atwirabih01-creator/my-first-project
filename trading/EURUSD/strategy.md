# EURUSD strategy

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
