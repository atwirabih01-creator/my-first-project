# Round 2 - Atlas market context (blind, 27 Oct 2026, PAPER)

Method: numbers computed from the case file only (answers/ not opened). BTC 3-bar = close vs 3 bars before;
24-bar = last vs first of the 24 closes; "for/against" = vs our trade side. "Fresh" = BTC's move began <=3 bars
ago; "extended" = it began earlier. Close position = where the signal bar closed in its range (0 = low, 1 = high).
Rule 3 = fade + bar closes in its top/bottom 10% + BTC >=0.9% against in 3 bars. Rule 4 = dip buy with BTC down
>1% over 24 bars and no rejected low / inside bar. Rule 5 = flush short needs a fresh BTC break, BTC not down >3%
over 24 bars, one coin per BTC moment. Same BTC moment: 03 = 19, 08 = 20 (identical BTC series).

R2-01 | context: neutral | BTC 3-bar -0.25% (for), 24-bar -0.18% | rules hit: 5 (no BTC break) | Meme flush 14.3x vol alone; BTC flat; long lower wick (close 0.41)
R2-02 | context: warns | BTC 3-bar +0.08% (against), 24-bar +1.51% | rules hit: 5 (no BTC break) | Breakdown short while BTC rose 1.5% over 24 bars; only 2.0x vol
R2-03 | context: supports | BTC 3-bar -1.04% (for), 24-bar -1.53% | rules hit: 5 (same moment as 19; BTC slide began ~7 bars ago) | BTC dropping with us, -0.79% last bar; downtrend, 3.2x vol; pick 03 or 19
R2-04 | context: warns | BTC 3-bar +1.51% (against), 24-bar +1.26% | rules hit: 3 (close 1.00, BTC +1.51%) | Fading inside bar at its high while BTC rips higher; coin +6% 48 bars
R2-05 | context: warns | BTC 3-bar +0.00% (against), 24-bar +1.34% | rules hit: none | Shorting strong uptrend: RSI 75, +15% over 48 bars, vol 0.93x, 1.5x volatility
R2-06 | context: supports | BTC 3-bar -2.87% (for, fresh: -2.8% in 2 bars), 24-bar -2.70% | rules hit: 5 passes (fresh, 24-bar under 3%) | Fresh BTC break, 11.5x vol flush, close 0.15; near the 3% limit
R2-07 | context: neutral | BTC 3-bar -1.60% (for, extended ~7 bars), 24-bar -2.46% | rules hit: 5 (not fresh) | BTC slide already 7 bars old; coin RSI 20, -7.5% over 48 bars
R2-08 | context: supports | BTC 3-bar -1.63% (for, fresh: all in last bar), 24-bar -1.29% | rules hit: 5 (same moment as 20) | Fresh BTC break, meme 8.7x vol flush close 0.16; pick 08 or 20
R2-09 | context: warns | BTC 3-bar -1.69% (for, extended 7 bars), 24-bar -4.08% | rules hit: 5 (BTC down >3% over 24) | Late short: BTC -4.1%, coin -11% 48 bars, RSI 17
R2-10 | context: neutral | BTC 3-bar +0.15% (for), 24-bar +0.30% | rules hit: none | Chasing +4.2% meme breakout, RSI 67; BTC flat; stop 2.7x target
R2-11 | context: warns | BTC 3-bar +0.70% (against), 24-bar +2.18% | rules hit: none (near 3: close 0.80) | Fading meme while BTC climbs steadily; low vol 0.8x, RSI 71
R2-12 | context: neutral | BTC 3-bar -0.43% (against), 24-bar -0.29% | rules hit: 4 passes (inside bar, BTC24 > -1%) | Dip buy in uptrend on inside bar; BTC drifting down 5 bars
R2-13 | context: warns | BTC 3-bar -3.97% (for), 24-bar -11.78% | rules hit: 5 (BTC down >3% over 24) | Crash already deep: BTC -11.8%, coin -22.6%, volatility 6x normal
R2-14 | context: warns | BTC 3-bar -0.26% (against), 24-bar -2.57% | rules hit: 4 (BTC -2.57%, close 0.12, no reversal bar) | Dip buy into BTC slide with no rejection; coin -11.9% 48 bars
R2-15 | context: neutral | BTC 3-bar -1.42% (for, fresh: last bar), 24-bar -3.03% | rules hit: 5 borderline (24-bar -3.03% just over 3%) | Fresh BTC break but BTC already 3% down; 4.6x vol flush
R2-16 | context: warns | BTC 3-bar +1.53% (against), 24-bar +1.60% | rules hit: 3 (close 0.96, BTC +1.53%) | Fading 6.3x vol up-bar at its high while BTC rallies; RSI 77
R2-17 | context: warns | BTC 3-bar +0.05% (against), 24-bar +1.81% | rules hit: 5 (no BTC break) | Coin-only -6% crash, BTC up 1.8%; coin already -17.9% over 48 bars
R2-18 | context: supports | BTC 3-bar -0.99% (for, fresh: began 3 bars ago), 24-bar -0.19% | rules hit: 5 passes | Fresh BTC dip from flat; close at low 0.03; target 0.49% (fees included)
R2-19 | context: supports | BTC 3-bar -1.04% (for), 24-bar -1.53% | rules hit: 5 (same moment as 03; slide began ~7 bars ago) | Same BTC as 03; 3.7x vol, close 0.26; only one of 03/19
R2-20 | context: supports | BTC 3-bar -1.63% (for, fresh: last bar), 24-bar -1.29% | rules hit: 5 (same moment as 08) | Same BTC as 08; 4.5x vol flush close 0.16; only one of 08/20
R2-21 | context: warns | BTC 3-bar -1.14% (against), 24-bar -1.00% | rules hit: 4 borderline (BTC24 -0.9999%; close 0.18, no reversal) | Meme dip buy into 6-bar BTC slide, no rejection; coin -8.8% 48 bars
R2-22 | context: supports | BTC 3-bar -0.75% (for, fresh: -0.8% in 2 bars), 24-bar -1.09% | rules hit: 5 passes | Fresh BTC push down; 10.8x vol flush, downtrend, RSI 30
R2-23 | context: supports | BTC 3-bar -0.03% (against, flat), 24-bar -0.78% | rules hit: 4 passes (BTC24 > -1%; close 0.48 rejects low) | Dip buy in uptrend, BTC flat, half of bar recovered; target 0.47%
R2-24 | context: neutral | BTC 3-bar -0.35% (for), 24-bar +0.09% | rules hit: 5 (no real BTC break, slow 6-bar drift) | Small 5.4x vol breakdown; BTC barely moving; target only 0.40%
R2-25 | context: warns | BTC 3-bar +1.07% (against), 24-bar +1.41% | rules hit: none (near 3: close 0.78) | Fading meme while BTC pushes +1.1% in 3 bars; low volatility 0.58x
R2-26 | context: neutral | BTC 3-bar -1.87% (for, fresh: -2.7% in 2 bars after spike), 24-bar -2.93% | rules hit: 5 passes, at the 3% edge | BTC fresh drop but coin bar weak (-0.68%), buyers' share 0.54
R2-27 | context: neutral | BTC 3-bar +0.07% (against), 24-bar -0.45% | rules hit: none (close 0.91 but BTC flat) | Fading quiet up-bar, vol 0.91x, BTC flat; coin slope turning up +0.42
R2-28 | context: neutral | BTC 3-bar -0.99% (for, extended ~7 bars), 24-bar -2.20% | rules hit: 5 (not fresh; BTC -3.3% off 24-bar high) | Late in BTC slide; 7.2x vol but close mid-range 0.55
R2-29 | context: neutral | BTC 3-bar -0.63% (for, extended ~6 bars), 24-bar -1.47% | rules hit: 5 (not fresh) | Stair-step BTC decline; coin RSI 18 already stretched; 6.1x vol
R2-30 | context: neutral | BTC 3-bar -0.40% (for), 24-bar -0.77% | rules hit: 5 (no BTC break; BTC +0.03% last bar) | Meme 9.7x vol breakdown alone; BTC slow drift, close mid 0.48

## Observations
1. The set is 19 breakdown/flush shorts, 6 fade shorts, 4 dip buys and 1 breakout buy; only 7 cases have BTC clearly pushing with us now
   (03/19, 06, 08/20, 18, 22). Two pairs share one BTC moment, so under rule 5 at most 5 of those can be taken.
2. Rule 3 hits exactly 04 and 16; 11 and 25 are near misses (BTC against, but close at 0.78-0.80, not top 10%).
   All six fades have BTC flat-to-rising against us, so the fade group as a whole leans "warns".
3. Several shorts are coin-only flushes with no BTC break (01, 02, 17, 24, 30) or come late in a BTC slide
   (07, 09, 13, 28, 29). Rule 5 thresholds are close calls on 15 (-3.03%), 26 (-2.93%) and 21 (rule 4, -1.00%):
   thin evidence, these results will test where the lines should sit.
