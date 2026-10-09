# Day-trading research workspace

Shared by the **Trading Research Lead** (Agent 1) and the **Backtest & Performance Manager** (Agent 2).
Markets, in order: GBPUSD → XAUUSD → NASDAQ 100 → EURUSD. One market at a time.

## Price data (`data/`)
| File | Market | Prices |
|---|---|---|
| `GBPUSD_M1.csv.gz` | GBP/USD | bid |
| `XAUUSD_M1.csv.gz` | Gold | bid |
| `NSXUSD_M1.csv.gz` | Nasdaq 100 index (CFD) | bid |
| `EURUSD_M1.csv.gz` | EUR/USD | bid |

- One row per minute: `time_utc, open, high, low, close`. Period: 1 Oct 2023 → 30 Sep 2026 (3 years).
- Source: HistData.com (free). Refresh/extend with `python3 trading/tools/fetch_histdata.py GBPUSD 2023-10 2026-09`.
- **Times are UTC** and verified. HistData's raw clock is "London time minus 5 hours" (not EST, not New
  York time); the downloader converts it. Checked against Dukascopy's UTC prices (exact match in
  September and in the mid-March weeks when the US and UK clocks differ), and the US stock-open spike
  lands at 09:30 New York time in winter, in the mismatch weeks, and in summer.
  Do NOT apply any extra clock correction in your own scripts.

## Data periods (who may look at what)
| Period | Use | Who may load it |
|---|---|---|
| 2024-10-01 → 2026-06-30 (21 months) | **Design**: research, ideas, rules | Agent 1 and Agent 2 |
| 2023-10-01 → 2024-09-30 (12 months) | **Hidden test A**: never seen by anyone | **Agent 2 only**, and only after the rules are frozen |
| 2026-07-01 → 2026-09-30 (3 months) | **Hidden test B**: most recent months | **Agent 2 only**, after the rules are frozen |
Agent 1 must filter out everything outside the design period immediately after loading.

**Per-market exceptions (once a market's hidden tests have been opened, they are used up):**
- **XAUUSD from v2 on:** all of Oct 2023 – Sep 2026 is design data (hidden A and B were opened by Agent 2 for v1).
  The new hidden test is `data/hidden/XAUUSD_M1_2022-10_2023-09.csv.gz` (Oct 2022 – Sep 2023, clock checked
  against the NFP 08:30 NY spike). **Agent 2 only, after v2 is frozen. Agent 1 must never open `data/hidden/`.**
- **NASDAQ v1 extra check:** `data/hidden/NSXUSD_M1_2021-10_2023-09.csv.gz` (Oct 2021 – Sep 2023, includes the 2022
  bear market). Clock verified in every month (09:30 NY open). **Feb/Mar – Jul 2023 is gappy on almost every day**
  (same HistData problem as gold), so it is effectively Oct 2021 – Jan 2023 plus Aug – Sep 2023. Agent 2 only.
(GBPUSD v1 was built on Oct 2025–Jun 2026 only and was dropped; see `GBPUSD/feedback.md`.)
- Load: `pd.read_csv(path, parse_dates=["time_utc"])`.

## Data quality (check before trusting any result)
HistData sometimes has **missing hours**. Gold's Oct 2022 – Sep 2023 file is missing hours on most days from
Mar to Jul 2023; the main Nasdaq file has a few days, e.g. 24 and 28 Oct 2024, with gaps inside the New York session.
- Every backtest must **skip any day that has a gap of more than 15 minutes inside the hours the strategy uses**
  (and the day after, if levels come from that day), and report how many days were skipped and why.
- A normal day has ~1,380 bars for FX and ~1,320 for gold and Nasdaq (they have a daily 1-hour break).

## Time zones (all reports must show Doha AND New York time)
- Doha = UTC+3 all year. New York = UTC−5 (winter) / UTC−4 (summer, 2nd Sunday of March → 1st Sunday of November).
- Convert with pandas: `ts.dt.tz_localize("UTC").dt.tz_convert("Asia/Qatar")` and `"America/New_York"`.
- Do NOT use fixed offsets for New York, and do NOT define sessions in UTC: London and New York
  shift with their own summer time. Define session times in local London / New York time.

## Trading costs (data is bid-only, so add costs in every backtest)
The owner's broker is not known yet, so use these cautious round-trip costs (spread + slippage) per trade:
| Market | Cost per trade |
|---|---|
| GBPUSD | 1.5 pips (0.00015) |
| EURUSD | 1.2 pips (0.00012) |
| XAUUSD | 0.40 USD |
| Nasdaq 100 | 2.0 points |

## Folder per market (`trading/<MARKET>/`)
- `research.md`, `strategy.md`, `changelog.md`: Agent 1
- `backtest/`, `feedback.md`, `weekly-report.md`, `FINAL-STRATEGY.md`: Agent 2
