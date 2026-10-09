"""Major release dates in the EURUSD design period (Oct 2024 - Jun 2026).
US NFP / US CPI / FOMC: copied from trading/GBPUSD/research/news_calendar.py (already checked in GBPUSD prices; includes
the Oct-Nov 2025 US shutdown delays). ECB decisions (14:15 Frankfurt time), euro-area flash HICP (11:00 Frankfurt) and
HCOB euro-area flash PMI (10:00 Frankfurt) are built from the published ECB meeting calendar and Eurostat / S&P Global
release patterns. No paid calendar is connected. EVERY date is checked in the EURUSD prices by 06_news.py
(jump at the release minute vs the same minute on other days). Doubtful dates are listed in research.md."""
CET = "Europe/Berlin"
NY = "America/New_York"
EVENTS = [
    *[(d, "08:30", NY, "NFP") for d in
      ["2024-10-04", "2024-11-01", "2024-12-06", "2025-01-10", "2025-02-07", "2025-03-07", "2025-04-04", "2025-05-02",
       "2025-06-06", "2025-07-03", "2025-08-01", "2025-09-05",
       "2025-11-20", "2025-12-16", "2026-01-09", "2026-02-11", "2026-03-06", "2026-04-03", "2026-05-08", "2026-06-05"]],
    *[(d, "08:30", NY, "US CPI") for d in
      ["2024-10-10", "2024-11-13", "2024-12-11", "2025-01-15", "2025-02-12", "2025-03-12", "2025-04-10", "2025-05-13",
       "2025-06-11", "2025-07-15", "2025-08-12", "2025-09-11",
       "2025-10-24", "2025-12-18", "2026-01-13", "2026-02-13", "2026-03-11", "2026-04-10", "2026-05-12", "2026-06-10"]],
    *[(d, "14:00", NY, "FOMC") for d in
      ["2024-11-07", "2024-12-18", "2025-01-29", "2025-03-19", "2025-05-07", "2025-06-18", "2025-07-30", "2025-09-17",
       "2025-10-29", "2025-12-10", "2026-01-28", "2026-03-18", "2026-04-29", "2026-06-17"]],
    # ECB monetary policy decision, press release 14:15 Frankfurt time (press conference 14:45)
    *[(d, "14:15", CET, "ECB") for d in
      ["2024-10-17", "2024-12-12", "2025-01-30", "2025-03-06", "2025-04-17", "2025-06-05", "2025-07-24", "2025-09-11",
       "2025-10-30", "2025-12-18", "2026-02-05", "2026-03-19", "2026-04-30", "2026-06-11"]],
    # ECB press conference 14:45 Frankfurt time (same dates; the decision itself is usually expected)
    *[(d, "14:45", CET, "ECB press conf") for d in
      ["2024-10-17", "2024-12-12", "2025-01-30", "2025-03-06", "2025-04-17", "2025-06-05", "2025-07-24", "2025-09-11",
       "2025-10-30", "2025-12-18", "2026-02-05", "2026-03-19", "2026-04-30", "2026-06-11"]],
    # Euro-area flash HICP (inflation), 11:00 Frankfurt time
    *[(d, "11:00", CET, "EZ flash CPI") for d in
      ["2024-10-31", "2024-11-29", "2025-01-07", "2025-02-03", "2025-03-03", "2025-04-01", "2025-05-02", "2025-06-03",
       "2025-07-01", "2025-08-01", "2025-09-02",
       "2025-10-01", "2025-10-31", "2025-12-02", "2026-01-07", "2026-02-04", "2026-03-03", "2026-03-31", "2026-04-30", "2026-06-02"]],
    # HCOB euro-area flash PMI, 10:00 Frankfurt time (German flash PMI 09:30)
    *[(d, "10:00", CET, "EZ flash PMI") for d in
      ["2024-10-24", "2024-11-22", "2024-12-16", "2025-01-24", "2025-02-21", "2025-03-24", "2025-04-23", "2025-05-22",
       "2025-06-23", "2025-07-24", "2025-08-21", "2025-09-23",
       "2025-10-24", "2025-11-21", "2025-12-16", "2026-01-23", "2026-02-20", "2026-03-24", "2026-04-23", "2026-05-21", "2026-06-23"]],
    # German flash PMI 09:30 Frankfurt time, same days as the euro-area flash PMI (usually the bigger EURUSD reaction)
]
EVENTS += [(d, "09:30", CET, "DE flash PMI") for d, hm, tz, lab in EVENTS if lab == "EZ flash PMI"]
