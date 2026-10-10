"""NASDAQ v1 on hidden period H (Jan 2016 - Dec 2018), round 3 (Agent 2, 10 Oct 2026).

A small wrapper: it imports backtest_v1.py and runs its main() UNCHANGED, after pointing it at the hidden 2016-2018 file
and adding the 2016-2018 US stock-market holidays and early closes (published NYSE / Nasdaq calendars).
No clock fix (README: the 2016-2018 files were clock-corrected and re-verified on 10 Oct 2026).
Outputs go to backtest/hidden_H/ (so the existing trades_v1*.csv files are not overwritten):
  hidden_H/trades_v1.csv, hidden_H/days_v1.csv.   Then run analyze_H.py.
Macro news (NFP/CPI/PPI/FOMC) and earnings are NOT labelled in H (no calendar for those years loaded): label = "normal".
"""
import sys
from pathlib import Path
import pandas as pd

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.argv = [sys.argv[0]]          # no flags: the plain v1 code path
import backtest_v1 as bt  # noqa: E402

bt.DATA = HERE.parents[1] / "data" / "hidden" / "NSXUSD_M1_2016-2018.csv.gz"
bt.PERIODS = [("H", "2016-01-01", "2018-12-31")]
bt.HOLIDAYS |= {
    # 2016
    "2016-01-01", "2016-01-18", "2016-02-15", "2016-03-25", "2016-05-30", "2016-07-04", "2016-09-05", "2016-11-24", "2016-12-26",
    # 2017
    "2017-01-02", "2017-01-16", "2017-02-20", "2017-04-14", "2017-05-29", "2017-07-04", "2017-09-04", "2017-11-23", "2017-12-25",
    # 2018 (5 Dec 2018: markets closed for President G.H.W. Bush's national day of mourning)
    "2018-01-01", "2018-01-15", "2018-02-19", "2018-03-30", "2018-05-28", "2018-07-04", "2018-09-03", "2018-11-22",
    "2018-12-05", "2018-12-25",
}
bt.EARLY_CLOSES |= {"2016-11-25", "2017-07-03", "2017-11-24", "2018-07-03", "2018-11-23", "2018-12-24"}
OUT = HERE / "hidden_H"
OUT.mkdir(exist_ok=True)
bt.HERE = OUT                      # only used for output paths
assert "hidden" in str(bt.DATA)

if __name__ == "__main__":
    bt.main()
