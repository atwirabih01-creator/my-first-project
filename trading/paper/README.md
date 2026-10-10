# Paper trading (practice, no real money)

**No orders are placed anywhere.** After each US close, `paper_trader.py` reads that day's live 1-minute prices
(Hyperliquid's free public data for xyz:XYZ100 = Nasdaq 100 and xyz:GOLD, the same markets the Liquid / Co-Invest
connector offers), applies the written rules exactly, and records the simulated trade in `journal.csv`.

| Strategy | Grade | Rules |
|---|---|---|
| Nasdaq 100 "Fade the big opening gap" | B | `trading/NASDAQ/FINAL-STRATEGY.md` |
| Gold "Follow London's break of the Asia box" | B | `trading/XAUUSD/FINAL-STRATEGY.md` |

- **Checked:** replaying Sep 2026 on the backtest data gives exactly Agent 2's trades (`python3 trading/paper/paper_trader.py validate`).
- **Schedule:** a routine runs it every weekday at 16:20 New York (23:20 Doha in US summer, 00:20 in US winter),
  and writes `weekly-report.md` every Sunday morning (Doha).
- **Costs:** the same as the backtests (Nasdaq 2.0 points, gold 0.40 USD), plus a column "after est. fees" that assumes
  0.05% of the position value per side. That is an assumption; replace it with your broker's real fee.
- **Upgrade / stop rules** are in each FINAL-STRATEGY.md grade box (e.g. Nasdaq goes to A after 6+ months above +0.10 R
  per trade over 50+ trades).
- The price source keeps only ~3.5 days of 1-minute prices, so a missed run is caught up only within that window.

Why not paper orders on the Co-Invest connector? Its rules require the owner to approve every single order at the time
it is placed, and a scheduled routine is not allowed to approve trades. This journal gives the same answer without that.
