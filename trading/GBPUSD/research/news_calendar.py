"""Major release dates in the development period (Oct 2025 - Jun 2026).
Source: built from published schedules (BLS 2026 schedule pages, Fed FOMC calendar, BoE MPC calendar,
ONS release pattern) plus memory of the Oct-Nov 2025 US government shutdown delays.
Every date is CHECKED against the price data in 04_news.py (a spike at the release minute)."""
# (date, local release time, timezone, label)
EVENTS = [
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
