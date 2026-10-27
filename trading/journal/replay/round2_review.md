# Round 2 review: history training (written by Sage, 27 Oct 2026)

30 blind historical cases, scored in `round2_scored.csv`. `pnl_pct` is the % result of each trade; it is
still not confirmed whether fees are taken off, so read the numbers as **before fees**.

**How much to trust this:** 5 team trades and 30 cases are far too few to prove anything. Read every
"helped / hurt" below as a lead to keep testing.

## 1. Scoreboard

| Group | Cases | Wins | Net % | $ per $1 lost | Note |
|---|---|---|---|---|---|
| Everything the skill picked | 30 | 23 (77%) | | 0.94 | Loses money on its own |
| Team TAKE | 5 | 4 | +1.43 | 2.03 | Good, but only 5 trades |
| Team SKIP | 25 | 19 (76%) | | 0.86 | |
| Hawk TAKE | 8 | 7 | +3.33 | about 3.4 | Only loss: 23 (-1.39) |
| Hawk SKIP | 22 | 16 | -4.48 | 0.75 | Skipping these was right |
| Atlas warns (all with Hawk SKIP) | 11 | 8 | -5.56 | 0.56 | 3 big losses: 02, 09, 13 |
| Sage vetoes of Hawk TAKE (15, 19, 29) | 3 | 3 | +1.90 | no losses | My vetoes cost money |

Two rounds together: Hawk TAKE 17 trades, 15 wins (88%).
(Note: I count 11 Atlas "warns" cases, not 10: 02, 04, 05, 09, 11, 13, 14, 16, 17, 21, 25.)

## 2. Report card

- **Hawk - A.** Best filter again (7 of 8). Skipped all six losers (01, 02, 09, 13, 24, 26). The one loss
  (23, a dip buy) was a normal-sized loss.
- **Atlas - B.** "Warns" marked the three biggest losers (02 -2.53, 09 -3.73, 13 -6.37), but also eight
  winners. "Supports" was 10 cases, 9 wins (only loss 23). Numbers were precise and dated, as asked.
- **Sage (me) - C.** No losing trade was added by me, but my rule-5 "not fresh" vetoes threw away three
  Hawk TAKE winners (15, 19, 29). Taking 5 of 30 is too few: forward we need about 100 trades.

## 3. What each trial rule did

| Rule | Effect this round | Cases | Verdict |
|---|---|---|---|
| 1. Hawk SKIP is final | Helped. Hawk SKIP group lost -4.48% (PF 0.75). Exception (low conf + supports) never came up; low-conf skips with neutral context (12, 27) both won small. | 01, 02, 09, 13, 24, 26 | Held 2/2 |
| 2. Warns + Hawk SKIP = hard skip | Helped. The 11 cases net -5.56%; avoided 02, 09, 13. "Warns + Hawk TAKE" part not tested. | 02, 09, 13 | Held 2/2 |
| 3. No fade of a bar closing at its extreme while BTC pushes against | Hurt slightly: both hits won small. Round 1: three hits, all lost. | 04 (+0.73), 16 (+0.61) | Unclear |
| 4. No dip buy in a BTC slide without a reversal bar | Hurt: both blocked dip buys won; the one dip buy it let through lost. | 14, 21 won; 23 lost | Unclear |
| 5a. Short only on a fresh BTC break (<=3 bars) | Hurt. Every "not fresh" case won: 03, 07, 28, 15, 19, 29 = 6 of 6, +4.50%. | 15, 19, 29 vetoed | Failed - dropped |
| 5b. Never short when BTC is already down >3% over 24 bars | Mostly helped: 09 and 13 lost big. 15 (-3.03%, right on the line) won. | 09, 13, 15 | Keep (trial) |
| 5c. One coin per BTC moment | No effect on result: both pairs (03/19, 08/20) won. Keep as a risk limit (same bet). | 03/19, 08/20 | Keep as risk limit |

Fees: still not settled. Atlas wrote "fees included" for case 18 only. Must be checked before any target
under 0.5% counts.

## 4. Main lessons

1. Hawk TAKE is the signal. The team should take nearly every Hawk TAKE and only block it on a hard,
   numbered limit, not on a soft "feels late" reason.
2. The big losses all came from cases both Hawk and Atlas disliked. That double "no" is the real
   protection; extra soft vetoes from me only cut volume.
3. Atlas "supports" + a Hawk SKIP that is not high confidence has won 3 of 3 over two rounds
   (R1-21, R2-03, R2-08) - a possible source of extra volume, to test.
