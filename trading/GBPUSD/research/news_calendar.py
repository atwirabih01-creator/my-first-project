"""Major release dates in the design period (Oct 2024 - Jun 2026).
Source: built from published schedules (BLS 2026 schedule pages, Fed FOMC calendar, BoE MPC calendar,
ONS release pattern) plus memory of the Oct-Nov 2025 US government shutdown delays.
Every date is CHECKED against the price data in 04_news.py (a spike at the release minute)."""
# (date, local release time, timezone, label)
EVENTS_Y1 = [
    *[(d, "08:30", "America/New_York", "NFP") for d in
      ["2024-10-04", "2024-11-01", "2024-12-06", "2025-01-10", "2025-02-07", "2025-03-07", "2025-04-04", "2025-05-02",
       "2025-06-06", "2025-07-03", "2025-08-01", "2025-09-05"]],
    *[(d, "08:30", "America/New_York", "US CPI") for d in
      ["2024-10-10", "2024-11-13", "2024-12-11", "2025-01-15", "2025-02-12", "2025-03-12", "2025-04-10", "2025-05-13",
       "2025-06-11", "2025-07-15", "2025-08-12", "2025-09-11"]],
    *[(d, "14:00", "America/New_York", "FOMC") for d in
      ["2024-11-07", "2024-12-18", "2025-01-29", "2025-03-19", "2025-05-07", "2025-06-18", "2025-07-30", "2025-09-17"]],
    *[(d, "12:00", "Europe/London", "BoE") for d in
      ["2024-11-07", "2024-12-19", "2025-02-06", "2025-03-20", "2025-05-08", "2025-06-19", "2025-08-07", "2025-09-18"]],
    *[(d, "07:00", "Europe/London", "UK CPI") for d in
      ["2024-10-16", "2024-11-20", "2024-12-18", "2025-01-15", "2025-02-19", "2025-03-26", "2025-04-16", "2025-05-21",
       "2025-06-18", "2025-07-16", "2025-08-20", "2025-09-17"]],
]
EVENTS_Y2 = [
    # US jobs report (NFP) 08:30 New York. Sep-2025 report delayed by shutdown to 20 Nov; Oct+Nov combined on 16 Dec.
    *[(d, "08:30", "America/New_York", "NFP") for d in
      ["2025-11-20", "2025-12-16", "2026-01-09", "2026-02-11", "2026-03-06", "2026-04-03", "2026-05-08", "2026-06-05"]],
    # US CPI 08:30 New York. Sep-2025 CPI on 24 Oct (shutdown special release); Oct CPI cancelled; Nov CPI 18 Dec.
    *[(d, "08:30", "America/New_York", "US CPI") for d in
      ["2025-10-24", "2025-12-18", "2026-01-13", "2026-02-13", "2026-03-11", "2026-04-10", "2026-05-12", "2026-06-10"]],
    # FOMC statement 14:00 New York
    *[(d, "14:00", "America/New_York", "FOMC") for d in
      ["2025-10-29", "2025-12-10", "2026-01-28", "2026-03-18", "2026-04-29", "2026-06-17"]],
    # Bank of England decision 12:00 London
    *[(d, "12:00", "Europe/London", "BoE") for d in
      ["2025-11-06", "2025-12-18", "2026-02-05", "2026-03-19", "2026-04-30", "2026-06-18"]],
    # UK CPI 07:00 London
    *[(d, "07:00", "Europe/London", "UK CPI") for d in
      ["2025-10-22", "2025-11-19", "2025-12-17", "2026-01-21", "2026-02-18", "2026-03-25", "2026-04-22", "2026-05-20", "2026-06-17"]],
]
EVENTS = EVENTS_Y1 + EVENTS_Y2
