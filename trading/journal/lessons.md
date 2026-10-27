# Team lessons (read before every session; add after every review)

Format: date · trade or call · what happened · good or bad decision · lesson. Lessons confirmed 3 or
more times get copied into the agent files.

## 2026-10-22 · TRUMP short (dip setup) · WIN +0.90% on the team's plan
- **Expected:** continued selling. BTC was turning risk-off, TRUMP had an October token unlock, and team
  wallets were sending coins to exchanges.
- **Happened:** filled at 1.758 and hit the 1.737 target within 7 hours.
- **Verdict:** good decision. All three agreed, and entering only after a bounce gave a better price.
- **Lesson:** a meme coin with a dated supply event plus a weak market made a clean short. Waiting for
  the bounce instead of chasing helped.

## 2026-10-24 · ETH short (spike setup) · LOSS -0.88% on the team's plan (6 other versions won)
- **Expected:** a weak bounce into 2,340–2,350, then a fall to 2,318.
- **Happened:** filled at 2,340. Price drifted sideways above the target, and the 12-hour time limit
  closed it at 2,353. Versions with longer holds won later.
- **Verdict:** right direction, but the hold was too short.
- **Lessons:**
  - Atlas had flagged the risk ("forced selling may be done, price is on major support"), but the plan
    still used a short 12-hour hold. When Atlas says the sellers are exhausted, either give the trade
    24 hours or more, or skip it.
  - Over a weekend, prices move slowly.

## History training round 1 (27 Oct 2026)
24 blind historical cases; full review in `trading/journal/replay/round1_review.md`. Team TAKE 13: 77% wins,
$1.25 per $1 lost. Hawk TAKE 9: 89% wins. Sage's "base rate" overrides lost money. Small sample: every rule
below is a **trial rule (1 round)** and becomes proven only after holding up in 3 rounds.

1. **Hawk SKIP is final** - trial rule (1 round). Sage may not override it because "the skill's win chance
   is high". Only exception: Hawk's confidence is low AND Atlas says "supports" (case 21 won). Round 1: the
   four neutral-context overrides (01, 13, 22, 23) netted -3.93%.
2. **Atlas "warns" is not a veto on its own** - trial rule (1 round). Warns + Hawk TAKE = trade allowed
   (03, 10 both won). Warns + Hawk SKIP = hard skip (02, 11, 14, 16, 18, 19 would have lost -9.2%).
3. **Do not fade a bar that closes at its extreme while BTC pushes against us** - trial rule (1 round).
   Skip a fade if the signal bar closes in its top (or bottom) 10% AND BTC moved at least 0.9% against our
   side over the last 3 bars. Round 1: 02, 04, 13 all lost; no winner had both. Atlas reports the BTC
   3-bar move in numbers; Hawk reports where the bar closed.
4. **No dip buy while BTC is sliding without a reversal bar** - trial rule (1 round). If BTC is down more
   than 1% over 24 bars, buy a dip only after a rejected low or inside bar (like 20). Round 1: 19 and 23 lost.
5. **Flush shorts: only on a fresh BTC break, one per BTC moment** - trial rule (1 round). Short after a
   heavy flush only if BTC's own drop started at most 3 bars ago, never when BTC has already fallen >3% over
   24 bars (14 lost -4.59%), and take at most one coin per BTC moment (11 won, 17 lost at the same moment).
   Also settle whether replay results include fees before counting targets under 0.5%.
