# Trading Desk — Paper-Trading Report (19 Oct 2026)

**Short version:** the three agents are built and running in paper mode only. We tested
**36 versions** on 3 years of real hourly prices across 28 markets. **None reached the goal**
(80%+ wins over 100+ paper trades on fresh data *and* making money). So, under your own
rule, **nothing moves to real money.**

## The team

| Agent | Role | What it checks | Says "yes" when… |
|---|---|---|---|
| 🔭 **Atlas** — The Researcher | Reads the market | Trend, who is buying vs selling (money flow), strength vs Bitcoin, whether the whole crypto market is rising, news & unusual volume | Its score is at least 0.75 out of 1 in the trade's direction, and Bitcoin is going the same way |
| 🎯 **Hawk** — The Sniper | Picks the exact moment | 3 triggers: *pullback* (dip then buyers return), *breakout* (new high on big volume), *shock* (a sudden spike on huge volume, like after a big tweet) | A trigger fires; it then sets the entry, stop-loss, profit target and time limit |
| 🦉 **Sage** — The Professor | Final judge & risk | Compares the idea with the most similar past trades to estimate the chance of winning; refuses to chase; stands aside in crashes and in extreme swings | Chance of winning is **80% or more** and the risk checks pass |

A trade happens **only when all three say yes.**

## How the testing worked (so the results can be trusted)

- Prices: Binance's free public data. 13 markets first (Bitcoin, Ethereum, Solana, BNB, XRP,
  Dogecoin, Shiba Inu, Pepe, WIF, Bonk, Floki, Euro/Dollar, Gold), later 15 new ones.
- Costs: 0.30% per trade (fees + slippage), always included.
- History was split into a **school** period (Sage learns), a **tryout** period (versions are
  compared, the best is picked) and a **final exam** on data nobody has looked at.
- Each paper trade uses 10% of a $10,000 paper account.

## Results

| Round | What changed | Best version | Tryout | Final exam on unseen data |
|---|---|---|---|---|
| 1 (V01–V12) | 12 styles on hourly charts | — | Sage almost never reached 80% confidence | Not usable (1 trade) |
| 2 (V13–V24) | 4-hour charts, fee-aware targets, smarter Sage | **V19** | 126 trades, **83% wins**, +4.0% | **94 trades, 73% wins, −3.6%** ❌ |
| 3 (V25–V36) | Month-by-month learning, crash guard, buy-only tests | **V32** | 228 trades, 79% wins, +0.8% (18 months) | **273 trades on 15 new markets, 77% wins, −2.0%** ❌ |

## What we learned

1. **A high win rate is easy; a high win rate that makes money is not.** Several versions won
   75–80% of trades but still lost money, because the few losing trades were 3–4× bigger than
   the typical win, and fees eat small wins.
2. **Results fade on new data.** V19 looked great in tryouts (83%) and dropped to 73% on the exam.
   That is normal in trading and exactly why the exam exists.
3. **Sharp sell-offs (Feb 2026) cause most of the damage.**
4. **No version got close to "80% wins *and* profitable" on fresh data.**

## Independent check (Reality Checker)

An independent checker re-ran the tests and confirmed every headline number. It found **no
peeking at future prices** and no bug that changes the conclusion. Minor notes:
- Round 1's pick was based on just 1 trade, so Round 1's exam tells us nothing (Rounds 2–3 are fine).
- The "biggest drop" figures understate risk slightly (they count only closed trades).
- The strategy design needs about 78% wins just to break even, so 80% leaves almost no profit.
- With cheaper fees (0.10% per side) the fresh exam would be about +0.8% instead of −2%,
  but the win rate stays at 77% at any fee level, so the 80% goal fails either way.

## Data limits (honest list)

- **No X/Twitter feed is connected**, so the agents can't read tweets yet. Hawk's "shock"
  trigger spots the *price and volume footprint* a market-moving tweet leaves, not the tweet.
- Alpha Vantage news-sentiment and Coinversa whale/positioning data need paid plans
  (Coinversa Starter is $29/month). Not bought — that needs your OK.
- Forex/CFDs were tested only through Euro/Dollar and Gold proxies on Binance.

## Recommendation

- **Do not trade real money.** The 80% goal was not met.
- If you'd like to continue, the most promising next step is to stop aiming at win rate alone and
  aim at **"makes money after fees, with small losses"** (e.g. 55–65% wins with wins bigger than
  losses). The "breakout runner" style (V04/V14) made money at 42–46% wins in tryouts (before Sage's filter, and not yet exam-tested).
- Keep the desk running in paper mode (`python3 live_desk.py`) for a few months to build a real
  forward track record.

## Files

- `agents.py` — the three agents · `paper_lab.py`, `round2.py`, `round3.py`, `fresh_exam.py` — the tests
- `live_desk.py` — today's votes on live prices (paper only, places no orders)
- `results/` — every version's numbers and every exam trade
- `.claude/agents/trading-*.md` — the agents' role files
