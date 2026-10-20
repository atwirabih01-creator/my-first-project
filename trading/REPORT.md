# Trading Desk — Paper-Trading Report (updated 20 Oct 2026)

**Short version:** the three agents are built and run in paper mode only. We tested
**416 versions** in 8 rounds, on up to 3 years of real hourly prices across about 250 coins.
- **First goal (80% wins over 100+ trades, and profitable): not reached.**
- **New goal (profit after fees with small losses, at least $1.20 earned per $1 lost):** the best
  version made **+10% on a sealed exam** but earned $1.17 per $1 lost, just under the bar.

So, under your own rules, **nothing moves to real money.** Next step: forward paper trading on live prices.

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

## Rounds 4–6 (20 Oct 2026) — the 3 extra rounds you approved

**Stricter method:** practice on 72 markets over 24 months. Three *sealed* exam sets of ~60
never-seen markets each (A, B, C), one per round. Rules for passing were written down
before each exam.

| Round | Versions tried | Best on practice | Result |
|---|---|---|---|
| 4 | 12 + 12 draft + 36 grid | V52 (trailing stop, strict Sage): 109 trades, 80% wins | **Sealed exam A: 64 trades, 73% wins, −1.4%** ❌ |
| 5 | 60 random combinations | V079 "news-shock follow": 181 trades, **90% wins**, +5% | Failed the double check (one half of the markets lost money) → exam B kept sealed |
| 6 | 72 settings around V079 | none passed the double check | Exam C kept sealed |

**Total tested so far: 228 versions.** None passed.

**Why V079 isn't the answer:** it wins 90% of the time because it takes a tiny profit and
uses a very wide stop-loss. Its average loss (−8.4%) is about 7 times its average win (+1.2%),
so it needs about 87% wins just to break even. Small changes to its settings make it
collapse. That is a fragile setup, not a real edge.

**The consistent pattern across all six rounds:** versions that reach 80% in practice drop
to about 73–77% on new markets. At 80% wins, these designs barely break even after fees.

Sealed exams B and C are still untouched and available for a future, genuinely new idea.

## Rounds 7–8 — new goal: make money after fees, with losses kept small

Your rule (also in CLAUDE.md): on a sealed exam of never-seen coins, the version needs 100+
trades, a profit, at least $1.20 earned per $1 lost, an average loss no bigger than 1.5× the
average win, and a biggest drop of 10% or less. Sage now asks "did similar past trades make
money on average?" instead of "will this one win?".

| Round | Tried | Pick | Sealed exam | Pass? |
|---|---|---|---|---|
| 7 | 80 random "profit-first" versions | P069: follows sudden spikes, tight stop, trailing stop | **B** (59 coins): 205 trades, 41% wins, **+2.1%**, $1.09 per $1 lost, biggest drop 5.7% | ❌ (needed $1.20) |
| 8 | 108 variations of the two best leads | **Q051**: buys dips on 4-hour charts | **C** (61 coins): 192 trades, 59% wins, **+10.0%**, $1.17 per $1 lost, biggest drop 9.2% | ❌ (needed $1.20) |

**Total versions tested: 416.** For the first time, versions made money on sealed exams.
Neither passed your bar.

**Independent check of Q051 (Reality Checker):** the numbers reproduce exactly, and there is no
peeking at the future and no mixing of exam coins into practice. But:
- 5 trades produced 71% of the profit. Without them it is about +2.5%.
- All of the profit came from buy trades. Sell trades broke even.
- 4 of 9 quarters lost money.
- Statistically, there is about a 1-in-4 chance its true result is zero or a loss.
- The exam coins covered the *same months* as practice. The one truly new test left is
  **future live prices**.

**Status: all three sealed exams are now used.** The honest next step is forward paper trading:
run Q051 on live prices for a few months and see whether the profit holds.

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
