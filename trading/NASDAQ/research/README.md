# NASDAQ research scripts (Agent 1)

Design data ONLY: 2024-10-01 .. 2026-06-30 (`common.py` filters each chunk right after reading and asserts it).
Hidden test A (Oct 2023 - Sep 2024), hidden test B (Jul 2026 on) and `trading/data/hidden/` are never loaded.
No clock fix (file is already UTC). A filtered copy (design rows only) is cached in the session scratchpad.
Y1 = Oct 2024 - Sep 2025, Y2 = Oct 2025 - Jun 2026. Cost 2.0 points per trade (stress 4.0).

```
python3 01_ranges.py   > out_01_ALL.txt   # range per hour (NY + Doha), sessions, overnight vs cash session, weekday, calm/volatile, months
python3 02_open_gaps.py > out_02_ALL.txt  # 09:30 gaps + fills, opening drive 5/15/30/60 min, opening-range breaks, time of high/low
python3 03_news.py     > out_03_ALL.txt   # news dates checked in prices, earnings reaction days, behaviour per event type
python3 04_gap_fade.py > out_04_ALL.txt   # descriptive: big gaps faded? by threshold, year, direction, mood, crash, quarter
python3 05_variants.py > out_05_ALL.txt   # 4 PRE-DECLARED trading variants V1-V4 (writes out_05_V*.csv)
python3 06_v2_robustness.py > out_06_ALL.txt  # V2 (= strategy v1) sliced; threshold x stop neighbourhood (writes out_06_V2_trades.csv)
```
Run 02 before 03, and 03 before 04 (they pass a day table through the scratchpad).
Helpers: `common.py` (loader), `levels.py` (day table, holidays, gap checks, ATR), `news_calendar.py` (copied from XAUUSD + earnings), `sim.py` (quick-check engine).
