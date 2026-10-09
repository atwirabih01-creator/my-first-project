# GBPUSD research scripts (Agent 1)

Design data only: **2024-10-01 .. 2026-06-30**. `common.py` reads the file in chunks, drops everything outside the
design period at once (hidden test A: Oct 2023–Sep 2024; hidden test B: Jul 2026 on) and asserts nothing leaked.
No clock fix is applied (the data file is already correct UTC).

Choose the period with `GBP_PERIOD=Y1` (Oct 2024–Sep 2025), `Y2` (Oct 2025–Jun 2026) or `ALL` (default). Example:
```
for p in ALL Y1 Y2; do for s in 01_ranges 02_big_moves 03_patterns 04_news 06_ny_session; do
  GBP_PERIOD=$p python3 $s.py > out_${s:0:2}_$p.txt; done; done
GBP_PERIOD=ALL python3 04_news.py > out_04_ALL.txt   # (re)writes out_04_events.csv for all 21 months; run it LAST
python3 07_predictability_scan.py > out_07_ALL.txt   # earlier move vs later move, Y1/Y2 columns
python3 10_ny_first_hour.py      > out_10_ALL.txt   # NY first hour fade, by size and year
python3 11_v2_check.py           > out_11_ALL.txt   # round 2: v1 replica + mood switch + min stop, per year, 1.5 and 3 pip costs
python3 12_other_families.py     > out_12_ALL.txt   # round 2: F1-F3; then: python3 12_other_families.py F4 >> out_12_ALL.txt
```
Round-1 scripts `05_idea_checks.py`, `08_level_sweeps.py`, `09_pd_sweep_ny_robustness.py` are kept for the record
(they now run on the 21 design months). Helpers: `common.py`, `levels.py` (daily levels, incl. `prev_complete`),
`news_calendar.py` (release dates, checked against price spikes in `04_news.py`).
