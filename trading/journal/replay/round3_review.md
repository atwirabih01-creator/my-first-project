# Round 3 review: history training (written by Sage, 27 Oct 2026)

30 blind historical cases, scored in `round3_scored.csv`. `pnl_pct` is after futures fees.
**How much to trust this:** 6 team trades and 5 Hawk TAKEs are far too few to prove anything on their own.
The three-round totals (84 cases) are the better guide, and even they are small.

## 1. Scoreboard (round 3)

| Group | Cases | Wins | Net % | $ per $1 lost (PF) |
|---|---|---|---|---|
| Everything the skill picked | 30 | 22 (73%) | -4.47 | 0.77 |
| Team TAKE | 6 | 4 | -3.12 | 0.43 |
| Hawk TAKE (04, 06, 07, 20, 22) | 5 | 4 | +0.38 | 1.20 |
| Hawk SKIP | 25 | 18 | -4.85 | 0.73 |
| - of which high-confidence SKIP | 14 | 9 | -4.92 | 0.60 |
| - of which medium-confidence SKIP | 10 | 9 | +2.03 | 1.58 (the one loss was 18) |
| Atlas supports | 6 | 4 | -3.12 | 0.43 |
| Atlas neutral | 9 | 8 | +2.84 | 2.45 |
| Atlas warns | 15 | 10 | -4.19 | 0.66 |

Three rounds (84 cases): Hawk TAKE 22 trades, 86% wins, PF 3.42. Hawk SKIP 62: 69%, PF 0.62.
Team TAKE 24: 75%, PF 0.98. The gap between Hawk TAKE and Team TAKE is entirely Sage's overlays.

## 2. Report card

- **Hawk - A-.** 4 of 5 TAKEs won and his skips lost money as a group again. His one loss (04) was a
  high-confidence call that looked like his winners; see below.
- **Atlas - C.** "Warns" again sat on the losing group (PF 0.66), which is useful. But "supports" this
  round was PF 0.43: it tagged all six team trades, including both losers. Three rounds: supports PF 1.42,
  neutral 1.13 - a mild help, not a decider.
- **Sage (me) - D.** My only decision that changed anything this round was the rule-7 rescue of 18
  (-3.50), which turned a small-profit round for Hawk into a losing round for the team. Over three rounds
  every overlay I added (overrides, rule-5 "fresh" vetoes, rule-7 rescues) cost money. My hard limits in
  round 3 (05, 19, 25 and same-bet 10, 14) only blocked cases Hawk had already skipped, so they changed nothing.

## 3. Why 04 and 18 lost (from the bars)

Only the bars before entry are in the case file, so the reading below is about what was visible at entry.

**R3-04 BONK short, -1.93 (stopped).** The signal bar fell from 102.34 to 99.69 and closed at 100.00 on
4x volume, with a fresh BTC drop (-1.7% in one bar). Three warning signs:
- The coin had been going sideways for 12 bars in a tight 100.5-102.3 box; the break went only about 0.8%
  below the box floor (100.47). A shallow break of a quiet range is easy to undo.
- The stop (101.96) sat *inside* that box, below its top (102.34). A simple return into the old range -
  which happens often after a one-bar break - reaches the stop without the idea being truly wrong.
- Entry was a bounce already (next open 100.16 vs close 100.00), and the target (99.48) needed a fresh
  low below the signal bar.
Honest view: 04 looks very like the winners 06 and 22. With an 86% hit rate, about 1 in 7 Hawk TAKEs
will lose; this may simply be that one. It does not justify a new veto.

**R3-18 ARB short, -3.50 (stopped).** This is the clearer lesson. The signal bar alone was a 5.4% flush
(104.85 to 99.19) on 6x volume, after the coin had already fallen 9.6% over 48 bars, RSI 28.
- This coin had flushed three times already in the window (bars -32/-31, -27, -8/-7) and every time it
  snapped back within 1-3 bars (e.g. bar -27 low 103.68, closed 106.59; bar -7 low 102.56, back to 104.9
  by bar -4). The pattern was "flush then V-bounce", not "flush then keep falling".
- The stop (103.33, +3.4%) was inside the old trading range, so a normal bounce took it out; the loss was
  2.7x the target, the worst size the rules allow.
- Hawk had said exactly this ("one-bar 5.4% flush, late, stop inside old range") and skipped. Rule 7 let
  Atlas's "supports" overrule him. That was the mistake, and it is why rule 7 is dropped.

## 4. What each rule did across three rounds

| Rule | Result | Verdict |
|---|---|---|
| Hawk SKIP is final | Hawk SKIP lost money 3/3 rounds (3-round PF 0.62) | Held 3/3 - proven |
| Warns + Hawk SKIP = skip | Warns group lost 3/3 rounds (PF 0.52) | Held 3/3 - covered by "Hawk decides" |
| Rule 3 (no fade vs BTC push) | R1 helped, R2 hurt, R3 only hit Hawk skips | Unclear - Hawk's judgment, not a gate |
| Rule 4 (no dip buy in BTC slide) | Mixed; R3 only hit Hawk skips | Unclear - Hawk's judgment, not a gate |
| Rule 5 "fresh BTC break" veto | Threw away Hawk winners in R2 | Failed - dropped earlier |
| BTC 24-bar >3% against idea | R3: blocked 05 (lost), 19 and 25 (won); all Hawk skips | Unproven - keep as a soft note, not a block |
| Rule 6 trial: Hawk TAKE stands | 5 trades, 4 wins, PF 1.20 | Held - adopted |
| Rule 7 trial: Atlas supports rescues Hawk med/low SKIP | 18 lost -3.50 | Failed - dropped |
| One coin per BTC moment / max 3 open | Risk limit, not a profit rule | Keep always |
