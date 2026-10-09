# EURUSD research scripts (Agent 1)

Design data only: **2024-10-01 .. 2026-06-30**. `common.py` reads the file in chunks, drops everything outside the design period
at once (hidden test A: Oct 2023 – Sep 2024; hidden test B: Jul 2026 on) and asserts nothing leaked. `data/hidden/` is never opened.
No clock fix (the data file is already correct UTC). Helpers copied/adapted from `trading/GBPUSD/research/` (not imported).
Optional: `EUR_CACHE=/path/file.pkl` keeps a cache of the already-filtered design rows to speed up re-runs.

```
python3 01_ranges.py > out_01.txt                       # hour / session / weekday / month ranges, Y1 vs Y2
for p in Y1 Y2; do EUR_PERIOD=$p python3 02_big_moves.py > out_02_$p.txt; EUR_PERIOD=$p python3 03_patterns.py > out_03_$p.txt; done
python3 07_predictability_scan.py > out_07_ALL.txt      # earlier move vs later move (Y1 / Y2 columns)
python3 05_hour_drift.py > out_05.txt                   # signed move by hour, day-part, weekday
python3 05b_weekday_pm.py > out_05b.txt                 # NY-afternoon drift by weekday, FOMC removed
python3 06_news.py > out_06.txt                         # news dates checked in prices; before / during / after (writes out_06_events.csv)
python3 08_regimes.py > out_08.txt                      # trending vs ranging, calm vs volatile (needs out_03_daily_Y1/Y2.csv)
python3 09_variants.py > out_09.txt                     # the 4 pre-declared rule variants (V0-V3), Y1 / Y2, 1.2 and 2.4 pip costs
```
Helpers: `common.py` (loader, gap check), `levels.py` (daily levels), `news_calendar.py` (release dates).
