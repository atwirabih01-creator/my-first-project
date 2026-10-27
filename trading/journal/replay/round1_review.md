# Round 1 review: history training (written by Sage, 27 Oct 2026)

24 blind historical cases. The selection skill picked all of them, and the team voted TAKE or SKIP before
anyone saw what happened next. Results come from `round1_scored.csv` (the `pnl_pct` column is the trade's
% result; this file does not say whether fees were taken off, so treat the numbers as **before fees** until
that is checked).

**How much to trust this:** 24 cases and 13 team trades are far too few to prove anything. A 77% win rate
on 13 trades could easily be anything from about 50% to 90% in a bigger sample. Everything below is a
*lead to test*, not a finding.

## 1. Scoreboard

| Group | Cases | Wins | Win rate | $ earned per $1 lost | Note |
|---|---|---|---|---|---|
| Everything the skill picked | 24 | 17 | 71% | 0.67 | Loses money on its own |
| Team TAKE | 13 | 10 | 77% | 1.25 | Made money, but only just |
| Team SKIP | 11 | 7 | 64% | 0.44 | Skipping these was right |
| Hawk TAKE | 9 | 8 | 89% | about 19 (one tiny loss) | Best single filter |
| Hawk SKIP | 15 | 9 | 60% | about 0.4 | |
| Atlas supports | 3 | 3 | 100% | no losses | Very small group |
| Atlas warns | 8 | 5 | 62% | 0.34 | Few losses, but huge ones |
| Sage overrides of Hawk's low-confidence SKIPs | 5 | 3 | 60% | 0.47 | Net -2.96% |

## 2. What worked

- **Avoiding the big losers.** The four worst trades in the round (19: -5.34%, 14: -4.59%, 17: -3.11%,
  02: -2.08%) were all skipped. Together they would have cost -15.1%, which is more than everything the
  team earned.
- **Hawk's chart reading.** When Hawk said TAKE, 8 of 9 won and the only loss was small (-0.27%).
- **Atlas + Hawk agreeing on "no".** When Atlas warned *and* Hawk skipped (02, 11, 14, 16, 18, 19), the
  trades would have lost -9.2% in total. Both saying no is a strong no.
- **Atlas "supports" cases** (06, 20, 21) all won, including 21, where Atlas outvoted a low-confidence
  Hawk skip.

## 3. What failed

- **My overrides.** I took five trades Hawk had skipped with low confidence, arguing that "the base rate is
  80%" when the context was neutral. The base rate *is the thing that loses money* (PF 0.67), so it is not a
  reason to trade. Those overrides gave 3 small wins and 2 large losses (13: -1.74%, 23: -3.90%), net -2.96%.
  The only override with a real reason, 21 (Atlas supports), won. Without the four "base rate" overrides
  the team result would have been 8 wins, 1 loss (9 trades), with the loss only -0.27%.
- **Skipping case 10.** Hawk said TAKE and I skipped it because Atlas warned. It won (+0.57%). Atlas warning
  alone was not a good reason: both cases where Atlas warned but Hawk said TAKE (03, 10) won.
- **Too cautious on "flush" breakdown shorts.** Hawk's second-flush rule skipped 07, 08, 09, 11, 14, 17 and 18.
  Five of those won (+5.2%) and two lost (-7.7%), so skipping was right on balance, but only narrowly and it
  threw away many wins.
- **Fees not settled.** Several targets are under 0.5% (05: 0.41%, 24: 0.42%). If fees are about 0.1% each
  way, these wins nearly disappear. Hawk raised this; I did not resolve it.

## 4. Report cards

**Atlas (market context): B-.** Good at spotting the most dangerous moments: the top three warnings (19, 14,
16) included the two biggest losses. Correct to say a warning should *add weight*, not decide alone. Weak
spots: "warns" was right on only 3 of 8, and 13 of 24 calls were "neutral", which gave the team little to
work with. Next round: say *which direction* BTC is pushing against the trade and how hard, in numbers.

**Hawk (chart): A-.** Best member this round. TAKE calls were almost perfect, and every high-confidence
SKIP that lost money was caught (14, 19). Weak spots: low-confidence skips were a coin flip (4 wins, 2
losses), and the flush rule is too broad (see above). The fee check was a good catch.

**Sage (decision, me): C.** I turned a nearly clean Hawk list into a weaker one by overriding on "base
rate" and by giving a lone Atlas warning a veto it had not earned. The cluster discipline (one bet per BTC
moment) was sound. Lesson for me: when I break a tie, I need a *reason from the chart or the market*, not
the skill's probability.

## 5. Case by case: losses we took

**R1-04 (SEI short, -0.27%, taken; Hawk TAKE low, Atlas neutral).** The signal bar closed at 94% of its
range, right at its high, and BTC rose 0.95% in the last three bars (+0.66% on the last bar alone). The
price was being pulled up by the market, not tiring. It did not hit the stop; it drifted and the 12-bar time
limit closed it at a small loss, the same pattern as the 24 Oct ETH lesson.

**R1-13 (XRP short, -1.74%, taken; my override of a Hawk low SKIP).** A fresh 39-bar high breaking out of a
very quiet base (volume 0.13-0.5x for 15 bars), closing at 97% of the bar with no wick, while BTC rose
1.3% over the last three bars and 1.8% over 24. Hawk named exactly this ("closes at the very top, no wick;
BTC rising"). A clean breakout from a quiet base, with the market pushing the same way, is a breakout and
not a top.

**R1-23 (ORDI dip buy, -3.90%, taken; my override of a Hawk low SKIP).** A staircase of lower highs and
lower closes for 9 bars (107.1 down to 100.0), rising volume on the falls (1.4x to 2.4x), no reversal bar,
and BTC sliding steadily the whole time (-1.1% over 24 bars, never bouncing). Compare with the winning dip
buy 20: that one had a rejected low and a quiet inside bar before entry. 23 had nothing to show that buyers
had arrived. The meme coin's 3.9% stop was hit in full.

**What the three have in common:** in each, BTC was moving *against* our trade during the last few bars, and
the coin's own chart showed no sign of stopping (close at the extreme, or no reversal bar). Two of the three
were trades Hawk had already said no to.

## 6. Case by case: big losses we skipped (good skips)

**R1-02 (NEIRO short, -2.08%).** A two-bar burst on 3.9x then 3.6x volume, closing at 89% of the bar, while
BTC jumped 1.15% in the last three bars. Same pattern as 04 and 13: fading a market-driven rally that closes
at its high.

**R1-14 (BOME short, -4.59%).** The third heavy selling bar in a row (6.8x, 6.8x, 5.7x volume), -11% in 12
bars, RSI 17. BTC had already fallen 4.1% over 24 bars, so the market's drop was *old*, not fresh. Compare
08/09/18 (won): there BTC's break was only 2-3 bars old. Shorting late in an old move needed a brand new
low, and the bounce took the stop.

**R1-17 (FLOKI short, -3.11%).** A single -4.4% crash bar on 4.6x volume after a quiet bar, coin already
-13% over 48 bars, the stop just above the broken 103-104 floor. Same BTC moment as 11 (PEPE, which won).
Honest note: on the chart, 17 and 11 look very similar and I cannot find a clean difference. This is the
reason for the "one trade per BTC moment" limit: we cannot tell which coin in a group will bounce.

**R1-19 (NEAR dip buy, -5.34%).** Buying a 7% crash bar (6.2x volume, closing near its low) while BTC was
falling hard (-6.2% over 24 bars, -2.4% in the last bar). The stop was 5.1% away, more than 2.5 times the
target. Both agents warned at high confidence. Clear skip, and correct.

## 7. Patterns to test next round (small samples, may be luck)

- **Fade + close at the extreme + BTC pushing against us (at least 0.9% in 3 bars):** 02, 04, 13. All
  three lost. No winning fade had all three features. (Threshold picked after seeing results, so it must be
  confirmed on new cases.)
- **Dip buy while BTC slides and no reversal bar:** 19, 23 lost. The winning dip buys (01, 20) came with BTC
  roughly flat over 24 bars.
- **Flush shorts:** fresh BTC break (2-3 bars old) won 4 of 5 (08, 09, 11, 18 won; 17 lost). Old BTC move
  (14) lost big.

Rules for next rounds are in `trading/journal/lessons.md` under "History training round 1 (27 Oct 2026)".
