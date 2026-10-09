# NASDAQ 100 changelog (Agent 1)

## v1 — 2026-10-09 — "Fade the big opening gap"
- **What:** first rule set. Fade (trade against) a 09:30 NY gap larger than 0.5 x ATR; enter 09:35 NY; stop 0.75 ATR; target = yesterday's 16:00 close; forced close at the 15:59 bar.
- **Why:** research (research.md section 3-4) found big gaps are partly taken back during the cash session in BOTH years, for gap-ups AND gap-downs, in calm and volatile stretches and in the Mar-May 2025 crash. Small gaps do not show this.
- **How chosen:** 4 variants declared before the first run (V1-V4, `research/05_variants.py`); V2 picked. 7 more threshold/stop combinations were run afterwards only as a neighbourhood check, not to pick numbers. Total rule sets evaluated: 11.
- **Quick check (design data, 2.0 pts cost):** Y1 63 trades, +11.9 R, PF 1.74; Y2 64 trades, +6.1 R, PF 1.35. Longest losing run 4 / 6.
- **Result:** sent to Agent 2 for backtest. (to be filled in after feedback)
