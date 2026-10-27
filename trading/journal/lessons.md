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

## History training (rounds 1-2, 27 Oct 2026)
Reviews: `trading/journal/replay/round1_review.md`, `round2_review.md`. Round 2: team TAKE 5 (4 wins, PF 2.03),
Hawk TAKE 8 (7 wins); two rounds Hawk TAKE 15/17. Team took too few trades (5/30). Small samples: a rule is
proven only after holding in 3 rounds.

1. **Hawk SKIP is final** - held 2/2 rounds. Hawk SKIP group lost money both rounds (R2: -4.48%, PF 0.75).
2. **Warns + Hawk SKIP = hard skip** - held 2/2 rounds (R2 avoided 02, 09, 13: -12.6%). Warns + Hawk TAKE
   is still allowed (untested in R2).
3. **No fade of a bar closing in its top/bottom 10% while BTC moved >=0.9% against in 3 bars** - unclear
   (R1: 3 hits lost; R2: 04, 16 hits won small). Keep testing.
4. **No dip buy while BTC is down >1% over 24 bars without a reversal bar** - unclear (R2: blocked 14, 21
   won; let 23 through, lost). Keep testing.
5. **Flush shorts** - "fresh BTC break within 3 bars" **failed - dropped** (R2: all 6 "not fresh" cases won,
   incl. vetoed Hawk TAKEs 15, 19, 29). Kept: never short when BTC is already down >3% over 24 bars
   (09, 13 lost big); one coin per BTC moment stays as a risk limit (same bet).
6. **NEW trial: Hawk TAKE stands** unless a hard limit hits: loss >3x target, BTC 24-bar >3% against the
   idea, a scheduled event in the hold time, or the open-ideas/same-bet limit. No soft vetoes by Sage.
7. **NEW trial: Atlas "supports" + Hawk SKIP with low or medium confidence = may take** if all hard limits
   pass (R1-21, R2-03, R2-08 all won). High-confidence Hawk SKIP stays final. Aim: more volume.
Open: confirm whether replay `pnl_pct` includes fees before counting targets under 0.5%.

**Fact (team leader, 27 Oct):** replay outcomes (pnl_pct) are AFTER futures fees: about 0.08% when the
target is hit and 0.13% when stopped, plus 0.01–0.02% slippage. The old "target ≥ 0.90%" rule was for
0.30% spot fees and does not apply to the futures breakout setup.
