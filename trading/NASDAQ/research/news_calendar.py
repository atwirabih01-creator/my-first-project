# Copied from trading/XAUUSD/research/news_calendar.py and extended for NASDAQ.
"""Gold-relevant US releases in the design period (Oct 2024 - Jun 2026), all in New York local time.
Built from published schedules (BLS release calendars for CPI / jobs report / PPI, Federal Reserve FOMC calendar)
and the known Oct-Nov 2025 US government shutdown delays. No paid calendar is connected.
Every date is CHECKED against the gold price data in 04_news.py (5-minute jump at the release minute vs normal).
PPI dates after Sep 2025 are less certain (shutdown reshuffled them); they are flagged by the price check if wrong.
"""
NFP = ["2024-10-04", "2024-11-01", "2024-12-06", "2025-01-10", "2025-02-07", "2025-03-07", "2025-04-04", "2025-05-02",
       "2025-06-06", "2025-07-03", "2025-08-01", "2025-09-05",
       "2025-11-20", "2025-12-16", "2026-01-09", "2026-02-11", "2026-03-06", "2026-04-03", "2026-05-08", "2026-06-05"]
CPI = ["2024-10-10", "2024-11-13", "2024-12-11", "2025-01-15", "2025-02-12", "2025-03-12", "2025-04-10", "2025-05-13",
       "2025-06-11", "2025-07-15", "2025-08-12", "2025-09-11",
       "2025-10-24", "2025-12-18", "2026-01-13", "2026-02-13", "2026-03-11", "2026-04-10", "2026-05-12", "2026-06-10"]
PPI = ["2024-10-11", "2024-11-14", "2024-12-12", "2025-01-14", "2025-02-13", "2025-03-13", "2025-04-11", "2025-05-15",
       "2025-06-12", "2025-07-16", "2025-08-14", "2025-09-10",
       "2025-11-25", "2026-01-14", "2026-01-30", "2026-02-27", "2026-04-14", "2026-05-13", "2026-06-11"]
FOMC = ["2024-11-07", "2024-12-18", "2025-01-29", "2025-03-19", "2025-05-07", "2025-06-18", "2025-07-30", "2025-09-17",
        "2025-10-29", "2025-12-10", "2026-01-28", "2026-03-18", "2026-04-29", "2026-06-17"]

EVENTS = ([(d, "08:30", "NFP") for d in NFP] + [(d, "08:30", "US CPI") for d in CPI] +
          [(d, "08:30", "US PPI") for d in PPI] + [(d, "14:00", "FOMC") for d in FOMC])

# ---- NASDAQ additions (Agent 1, 9 Oct 2026) ----
# Big-tech earnings, all reported AFTER the 16:00 NY close (source: Alpha Vantage EARNINGS "reportedDate", "post-market").
# The market reaction is the NEXT trading day's 09:30 gap. META and AMZN were not fetched (free-tier rate limit);
# META usually reports the same evening as MSFT and AMZN the same evening as AAPL, so those evenings are covered in practice (unverified).
EARN = {
    "NVDA": ["2024-11-20", "2025-02-26", "2025-05-28", "2025-08-27", "2025-11-19", "2026-02-25", "2026-05-20"],
    "AAPL": ["2024-10-31", "2025-01-30", "2025-05-01", "2025-07-31", "2025-10-30", "2026-01-29", "2026-04-30"],
    "MSFT": ["2024-10-30", "2025-01-29", "2025-04-30", "2025-07-30", "2025-10-29", "2026-01-28", "2026-04-29"],
    "GOOGL": ["2024-10-29", "2025-02-04", "2025-04-24", "2025-07-23", "2025-10-29", "2026-02-04", "2026-04-29"],
}
