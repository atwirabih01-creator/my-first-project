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

- One row per minute: `time_utc, open, high, low, close`. Period: 1 Oct 2025 → 30 Sep 2026 (12 months).
- Source: HistData.com (free). Refresh/extend with `python3 trading/tools/fetch_histdata.py GBPUSD 2025-10 2026-09`.
- **Times are UTC** and verified: they match Dukascopy's UTC prices exactly, and the US stock open
  spike lands at 09:30 New York time in both winter and summer.
- Load: `pd.read_csv(path, parse_dates=["time_utc"])`.

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
