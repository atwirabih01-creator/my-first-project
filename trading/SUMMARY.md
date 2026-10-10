# Day-trading project: where we stand (10 Oct 2026, after round 3)

## Your strategy documents (one per market, graded honestly)
| Market | Strategy | Grade | Where |
|---|---|---|---|
| **Nasdaq 100** | Fade the big opening gap | **B: Promising** | `NASDAQ/FINAL-STRATEGY.md` |
| **Gold** | Follow London's break of the Asia box (v3) | **B: Promising** (bottom of B) | `XAUUSD/FINAL-STRATEGY.md` |
| GBPUSD | Quiet-Asia breakout (v3) | C: Experimental (demo only) | `GBPUSD/FINAL-STRATEGY.md` |
| EURUSD | Euro-only move fade (v3) | C: Experimental (demo only) | `EURUSD/FINAL-STRATEGY.md` |

Grades: **A** = proven on unseen data; **B** = made money on unseen data but the edge is small/uneven;
**C** = only worked on the data it was built on (lost on unseen data).

- **Nasdaq gap fade:** made money in **every** unseen period (2016–18, 2021–23, 2023–24, Jul–Sep 2026): 250 unseen trades,
  +11.0 R, but only +0.04 R per trade; still positive at double cost. Closest thing to an A.
- **Gold v3:** +90 R on 2019–26 (6 of 8 years), but only +1.9 R on 81 unseen 2016–18 trades; profit relies on big US news days.
- **GBPUSD v3 / EURUSD v3:** positive 2019–26, but lost on the unseen 2016–18 years.

## Data
Jan 2016 – Sep 2026 per market (minute prices, clock checked including the US/UK mismatch weeks).
All hidden (unseen) data has now been used for all four markets; further proof must come from new data (demo / forward test).

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
