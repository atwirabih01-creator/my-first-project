# XAUUSD research scripts (Agent 1)

Design data only: **2024-10-01 .. 2026-06-30**. `common.py` drops every row outside the design period while reading
(hidden test A: Oct 2023–Sep 2024; hidden test B: Jul 2026 on) and asserts nothing leaked. A filtered copy is cached in the
session scratchpad (`XAU_CACHE`) to speed up re-runs; it contains design rows only. No clock fix (the file is already UTC).
Y1 = Oct 2024–Sep 2025, Y2 = Oct 2025–Jun 2026; every script reports both.

```
python3 01_ranges.py        > out_01_ALL.txt   # range by hour (Doha + NY), session, weekday, month; $, %, x ATR
python3 02_big_moves.py     > out_02_ALL.txt   # big days and swings >= 0.5 ATR: when they start, what comes before
python3 03_patterns.py      > out_03_ALL.txt   # PDH/PDL and Asia sweeps, earlier-vs-later move scan, US clock times (writes out_03_daily.csv)
python3 04_news.py          > out_04_ALL.txt   # news dates checked in prices + reaction per event (writes out_04_events.csv)
python3 05_ideas.py         > out_05_ALL.txt   # 7 pre-declared ideas (M1, M2, A1, A2, P1, O1, O2)
python3 06_momentum_robustness.py > out_06_ALL.txt  # 32-cell momentum grid, M2 by quarter/news/weekday
#        out_07_size_split.txt: overnight-move size split (inline script, descriptive only)
python3 08_asia_break_variants.py > out_08_ALL.txt  # A1 baseline + A1a/A1b/A1c
python3 09_v1_check.py      > out_09_ALL.txt   # v1 rules exactly as in strategy.md (writes out_09_trades.csv)
```
Helpers: `common.py` (loader), `levels.py` (daily levels, ATR14), `news_calendar.py` (release dates), `sim.py` (quick-check engine, fill model).
