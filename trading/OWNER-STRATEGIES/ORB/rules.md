# Owner's ORB (Opening Range Breakout): the four frozen rule sets

Author: Agent 1 (Trading Research Lead), 11 Oct 2026. **Status: frozen, for Agent 2's backtest and the hidden 2016-2018 test.**
Built on design data Jan 2019 - Sep 2026 only. Chosen out of 332 tested variants (see `TESTS_DECLARED.md`), so the design-period
numbers are flattered by the choice. Code: `orb_common.py` (function `run`), settings in `final.py`.

*Past results do not guarantee future results. Trading carries a real risk of loss. This is research, not financial advice.*

## Rules shared by all four
1. **Prices:** one-minute bars (bid). Trading day = 17:00 New York to 17:00 New York; Sunday-evening bars belong to Monday.
2. **Opening range:** **RH** = highest high, **RL** = lowest low of the one-minute bars inside the range window (window below). Range = RH - RL.
3. **Orders:** when the range window ends, place a **buy stop just above RH** and a **sell stop just below RL** (a fill needs a price
   **beyond** the level, not just touching it). Fill = the level, or the bar's open if price jumped past the level (worse price).
   **The first order to fill is the only trade of the day; cancel the other at once.** Unfilled orders are cancelled when the order window ends.
4. **Stop loss:** the other side of the range (buy: RL; sell: RH). Risk (1R) = fill price to stop. Size the trade so that 1R = 1% of the account.
   If price jumps past the stop, the stop fills at that bar's open (the loss can exceed 1R).
5. **Same-bar rule (for testing):** if the bar that fills the entry also reaches the stop, it is a loss. If one bar breaks both RH and RL
   before any fill, count a full loss.
6. **Forced close:** any open trade is closed at the **close of the 15:59 New York bar (= 16:00 New York)**,
   = **23:00 Doha (US summer time) / 00:00 midnight Doha (US winter time)**. Nothing is held overnight.
7. **Minimum size:** skip the day if the range is smaller than 10 x the standard cost (GBPUSD 15 pips, EURUSD 12 pips, gold 4.00 USD,
   Nasdaq 20 points). The cost then is at most 10% of the risk.
8. **Data rule (testing):** skip a day with a hole of more than 15 minutes in the data from the start of the range to 15:59 New York.
9. **News days:** traded like any other day (owner decides). See `research.md` for how each version did on US release days.
10. **Costs used:** GBPUSD 1.5 pips, EURUSD 1.2 pips, gold 0.40 USD, Nasdaq 2.0 points per trade (round trip). Results also shown at 0 and 2x.

Time zones: Doha is UTC+3 all year. London (UTC+0 winter / UTC+1 summer) and New York (UTC-5 winter / UTC-4 summer, 2nd Sunday of March
to 1st Sunday of November) change clocks on different dates. **London-based windows are defined on the London clock; New York windows on the New York clock.**
"Mismatch weeks" = the 2-3 weeks a year when New York is on summer time and London is not (mid-March, late Oct / early Nov).

---

## 1. GBPUSD: "London-early 60-minute ORB, wide mornings only, hold to the New York close"
| Step | London time | New York time | Doha time |
|---|---|---|---|
| Range window | 07:00-07:59 | 02:00-02:59 (03:00-03:59 in mismatch weeks) | 10:00-10:59 (UK winter) / 09:00-09:59 (UK summer) |
| Orders live | 08:00-10:59 | 03:00-05:59 (04:00-06:59 in mismatch weeks) | 11:00-13:59 (UK winter) / 10:00-12:59 (UK summer) |
| Forced close | - | 16:00 | 00:00 (US winter) / 23:00 (US summer) |

- **Wide-morning filter:** trade only if today's range is **larger than the median of the 07:00-07:59 London ranges of the previous
  20 trading days** (days with missing data are left out of the 20; at least 15 needed). Otherwise no trade.
- Range also at least 15 pips (shared rule 7). Stop: other side of the range. **No profit target:** hold to 16:00 New York.
- Why: a wide first London hour means real orders are moving the pound; its breakout tends to carry through the London-New York overlap.
  A quiet first hour (squeeze) breakout fails more often on the pound (this agrees with GBPUSD v3, a squeeze ORB, failing on unseen data).

## 2. XAUUSD (gold): "London-early 15-minute ORB, target 1.5R"
| Step | London time | New York time | Doha time |
|---|---|---|---|
| Range window | 07:00-07:14 | 02:00-02:14 (03:00-03:14 in mismatch weeks) | 10:00-10:14 (UK winter) / 09:00-09:14 (UK summer) |
| Orders live | 07:15-10:59 | 02:15-05:59 (03:15-06:59 in mismatch weeks) | 10:15-13:59 (UK winter) / 09:15-12:59 (UK summer) |
| Forced close | - | 16:00 | 00:00 (US winter) / 23:00 (US summer) |

- Range at least **4.00 USD** (shared rule 7). Stop: other side of the range.
- **Take profit: 1.5 x the risk** from the fill price (buy: fill + 1.5 x risk; sell: fill - 1.5 x risk). No break-even move.
  96% of trades end (stop or target) before 09:00 New York; only 2 of 499 reached the 16:00 close.
- Different from gold v3 (a 7-hour Asia box held to the close): here the range is only the first 15 minutes of Europe, and profits are taken at 1.5R.

## 3. NASDAQ 100 (NSXUSD CFD): "New York cash-open 30-minute ORB, target 1R"
| Step | New York time | Doha time |
|---|---|---|
| Range window | 09:30-09:59 | 16:30-16:59 (US summer) / 17:30-17:59 (US winter) |
| Orders live | 10:00-13:29 | 17:00-20:29 (US summer) / 18:00-21:29 (US winter) |
| Forced close | 16:00 | 23:00 (US summer) / 00:00 (US winter) |

- Range at least **20 points** (shared rule 7). Stop: other side of the range. **Take profit: 1 x the risk.**
- The classic stock-market ORB: the first half hour of the cash session sets the day's first battle line.

## 4. EURUSD: "New York cash-open 5-minute ORB, only when the first 5 minutes are big, hold to the close"
| Step | New York time | Doha time |
|---|---|---|
| Range window | 09:30-09:34 | 16:30-16:34 (US summer) / 17:30-17:34 (US winter) |
| Orders live | 09:35-13:29 | 16:35-20:29 (US summer) / 17:35-21:29 (US winter) |
| Forced close | 16:00 | 23:00 (US summer) / 00:00 (US winter) |

- Range at least **12 pips** (shared rule 7). In practice this is a strong filter: only about 1 day in 12 qualifies
  (days when the US stock open shakes the euro hard). Stop: other side of the range. **No profit target:** hold to 16:00 New York.
- Weakest of the four: only about 20 trades a year (3 to 60 per year), and most of the profit came in 2022.

---

## Design-period results (Jan 2019 - Sep 2026, standard cost). Full tables in `out_final.txt`.
| | GBPUSD | Gold | Nasdaq 100 | EURUSD |
|---|---|---|---|---|
| Trades (per year) | 857 (111) | 499 (64; only 6-56 a year before 2025) | 1,759 (227) | 153 (20) |
| Win rate | 38% | 46% | 54% | 36% |
| R before cost / with cost / double cost | +131.1 / +82.9 / +34.8 | +70.4 / +40.7 / +11.0 | +118.7 / +72.7 / +26.7 | +62.1 / +49.6 / +37.2 |
| R per trade (with cost) | +0.097 | +0.082 | +0.041 | +0.324 |
| Positive years | 7 of 8 | 6 of 8 | 7 of 8 | 6 of 8 |
| Worst year | -0.5 (2021) | -4.1 (2024) | -7.1 (2020) | -2.7 (2021) |
| Longs / shorts | +33.5 / +49.4 | +13.1 / +27.6 | +58.9 / +13.8 | +18.3 / +31.3 |
| Longest losing run | 10 | 6 | 8 | 7 |
| Without best 5 trades | +42.6 | +33.2 | +67.7 | +12.1 |
| Worst drop from a peak | -19.5 R | -15.6 R | -18.0 R | -11.8 R |
| **Bar points missed** | losing run 10 (> 8) | fewer than 40 trades in 2019, 2021, 2022 (6, 24, 22) | +0.041 R/trade (< 0.08) | 3-60 trades a year (< 40) |

Trade lists: `trades_GBPUSD.csv`, `trades_XAUUSD.csv`, `trades_NASDAQ.csv`, `trades_EURUSD.csv`. Entry/exit times are the start of the
one-minute bar in which the fill happened (a 16:00 exit = close of the 15:59 bar), in New York and Doha time.
