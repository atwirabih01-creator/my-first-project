# Day-trading project: where we stand (9 Oct 2026)

## In one sentence
All four markets were studied and tested properly, and **none of the strategies is proven yet**, so nothing has been
handed over to trade. This is the process working: each strategy looked good on its design data and was caught by the
hidden-data test before it could cost real money.

## Results by market
| Market | Best strategy found | Design years | Unseen data | Verdict |
|---|---|---|---|---|
| GBPUSD | "New York false break" of yesterday's high/low | profit in one year, loss in the other | loss (−22 R in 2024–25) | Dropped |
| Gold | "Follow London's break of the Asia range" (v1, v2) | profit both years | v1 flat, v2 loss in 2022–23 | Dropped |
| Nasdaq 100 | "Fade the big opening gap" | profit both years (+0.14 R per trade) | small profit (+0.04 R per trade), carried by a few trades | Dropped |
| EURUSD | no idea good enough to test | — | not used (still available) | Paused |
(R = the amount risked on one trade, 1% of the account.)

## What we learned
- Each edge belonged to one **market mood**: sideways (GBPUSD), rising (gold), trending (Nasdaq's winning side flipped).
- Simple, popular setups (Asia-range breakouts, opening-range breakouts, false breaks) do not hold up across years here.
- Solid timing facts (busiest hours, news behaviour) held every year, but they tell you *when* the market moves, not *which way*.

## Unused hidden data still available for a future test
- EURUSD: Oct 2023 – Sep 2024 and Jul – Sep 2026.
- GBPUSD: Oct 2023 – Sep 2024.

## Where the details are
Each market's folder has: `research.md` (the study), `strategy.md` (the rules), `feedback.md` (Agent 2's verdicts),
and `weekly-report.md` (week-by-week results; GBPUSD, gold and Nasdaq).
