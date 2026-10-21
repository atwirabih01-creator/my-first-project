---
name: trading-desk
description: Run one session of the 3-agent crypto / meme-coin trading desk — Atlas studies, Hawk analyses, then the setup is backtested and all three must agree (Sage decides last). Use when the owner asks to run the desk, research the market, find trades, or paper trade. PAPER ONLY.
---

# Trading Desk — one session

The owner's rule (CLAUDE.md, 21 Oct 2026): the agents **think, they don't follow a habit**.
Every idea goes through three steps, in order. The aim is **consistency** — steady results
across crypto and especially meme coins — **not big trades**.

You (the main assistant) are the team leader. Subagents can't call each other, so you run the
steps one after another and pass each agent the previous agent's full written output.

## Safety (never bend these)
- **Paper only.** Never call any Co-Invest order tool (`execute_order`, `execute_orders_batch`,
  `close_position`, `modify_position`, `execute_tpsl`, `enable_trading`, `enable_automated_trading`, …).
  If the owner later asks for real orders, stop and ask first (CLAUDE.md "Always ask first").
- Never invent a headline, number or source. If a connector is limited or fails, say so.
- Ideas are recorded in the desk journal (`trading/journal/`), not sent anywhere.

## Step 1 — Atlas studies (subagent type "Atlas (Trading Researcher)")
Brief Atlas to produce a **research brief**:
1. **Market weather:** Bitcoin trend and mood; big news of the last 24–48h (Fed / rates, regulation,
   ETF flows, liquidations, exchange events). Sources: Bigdata.com `bigdata_search` (best news source),
   Co-Invest `get_news` (also lists unusual-volume coins), WebSearch.
2. **Meme-coin scan:** which meme coins have unusual volume, social buzz or news. Sources:
   LunarCrush `cryptocurrencies` (sector "meme"; free plan is limited — ignore coins with ~zero volume),
   Co-Invest `get_news` unusual activity, Twelve Data / Binance prices.
3. **Where money is flowing:** ETF inflows/outflows, stablecoin volume, large liquidations
   (from Bigdata.com news), Coinversa Pulse where the free plan allows.
4. **Shortlist 3–6 coins** (meme coins first, plus BTC/ETH/SOL for context), each with: bias
   (bullish/bearish/neutral), the 3 strongest reasons **with sources and dates**, and what would prove
   the view wrong. Label anything thin as thin. No price targets yet.

## Step 2 — Hawk analyses (subagent type "Hawk (Trading Sniper)")
Give Hawk the full research brief. For each shortlisted coin Hawk produces an **analysis**:
1. Look at real price data (Twelve Data `get_time_series` / `get_quote`, or
   `python3 trading/live_desk.py` output): trend on 4-hour and daily charts, recent high/low,
   typical 4-hour range, volume vs normal.
2. Name which known setup (if any) fits right now: `dip` (buy/sell the dip in a trend, 4h),
   `spike` (follow a sudden volume spike with a trailing stop), `breakout` (new 4h high/low on volume).
   Check whether it is actually firing: `cd trading && python3 check_setup.py SYMBOL SETUP --live`.
3. If a setup fits: a precise **trade plan** — direction, entry (now, or a limit price with an expiry
   time), stop-loss, profit target, maximum hold time — with the target at least 3× the 0.30% cost.
4. If nothing fits cleanly: say "no trade" for that coin. Waiting is a valid answer.

## Step 3 — Backtest and agreement (Sage decides; subagent type "Sage (Trading Professor)")
1. For every trade plan, run the backtest of that exact setup:
   `cd trading && python3 check_setup.py SYMBOL SETUP --side long|short` (≈1 minute each).
   It reports past results on the coin, on meme-coin peers and on all coins: trades, win rate,
   profit per $1 lost, profitable months, share of profit from the 5 best trades, biggest drop.
2. Give Sage the research brief, Hawk's analysis and the backtest output. Sage approves a plan only if
   **all** of these hold:
   - Atlas's bias and Hawk's direction agree, and the reasons are sourced.
   - **Consistency:** on meme peers (or the coin itself if it has 30+ past trades) the setup made a
     profit after fees, earned ≥ $1.20 per $1 lost, was profitable in at least 60% of months, and the
     5 best trades are less than half of the profit.
   - The owner's target is 80 wins of 100 with profit after fees, so favour plans whose target is hit far
     more often than the stop, as long as the backtest still shows a profit.
   - Risk: at most 3 paper trades open at once, at most 2% of the paper account at risk per trade,
     no two open trades that are really the same bet (e.g. three meme coins all long at once).
   - No major scheduled event (e.g. Fed decision) inside the hold time, unless the plan is about it.
3. **All three must agree.** If any one says no, there is no trade. Sage writes one line per plan:
   APPROVED or REJECTED, with the reason.

## Recording approved plans
- Enter-now plans: `python3 trading/desk_journal.py add SYMBOL long|short "atlas" "hawk" "sage" SETUP`
- "Enter only if price reaches a zone" plans (Sage-approved in advance):
  `python3 trading/desk_journal.py limit SYMBOL long|short LOW HIGH EXPIRES_HOURS "atlas" "hawk" "sage" SETUP`
  — they wait in `journal/pending.csv` and fill automatically from real prices on the next `update`.

## Record it (always, even when there is no trade)
Write `trading/journal/YYYY-MM-DD-HHMM.md` with: the research brief (short), Hawk's plans, the
backtest numbers, each agent's vote, and Sage's decision. For approved plans also append one row to
`trading/journal/paper_trades.csv`:
`opened_utc,symbol,side,entry,stop,target,max_hold_hours,setup,atlas_reason,sage_reason,status`
with status `open`. At the start of each session, update open rows: mark `win` / `loss` / `expired`
using current prices, and add the result in %.

## Report to the owner
Plain words, no jargon: what the team studied, what it found, what (if anything) it would paper
trade and why, and the running paper record (trades, wins, profit). Never claim something works
without the journal numbers to back it.
