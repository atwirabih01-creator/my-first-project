# GBPUSD research scripts (Agent 1)

All scripts use ONLY 2025-10-01 .. 2026-06-30 (filter in `common.py`, applied right after loading).
Run from this folder, in order (each writes an `out_*.txt` / `out_*.csv` next to it):

```
python3 01_ranges.py                > out_01.txt   # range by hour / session / weekday / month
python3 02_big_moves.py             > out_02.txt   # where big days and 50+ pip legs start
python3 03_patterns.py              > out_03.txt   # Asia range, previous-day high/low, London/NY behaviour
python3 04_news.py                  > out_04.txt   # news dates checked against price spikes; news vs normal days
python3 05_idea_checks.py           > out_05.txt   # quick un-tuned checks: Asia sweep reversal, Asia breakout
python3 06_ny_session.py            > out_06.txt   # NY vs London range, London 4pm fix
python3 07_predictability_scan.py   > out_07.txt   # does an earlier move predict a later one?
python3 08_level_sweeps.py          > out_08.txt   # one fixed sweep-and-reclaim template on 5 level types
python3 09_pd_sweep_ny_robustness.py > out_09.txt  # neighbours of the chosen idea (not used to tune)
```
Helpers: `common.py` (loading, time zones, trading day = 17:00-17:00 New York), `levels.py` (daily levels),
`news_calendar.py` (release dates).
