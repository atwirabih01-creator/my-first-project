# Copy-paste prompt: day-trading research request

```
ROLE
Act as a professional intraday DAY TRADER and quantitative researcher. This is NOT long-term investing. Every trade opens and closes the same day.

MY SITUATION
- I trade a prop-firm (funded account) challenge, then a funded account that pays out each time I reach the profit target.
- Risk per trade: 1% of the account. Maximum daily loss: 3%. Maximum overall loss: 5%.
- Goal: steady DAILY profits with 1–2 trades per day, trading 3–4 days per week (no more), and 2–4 winning days per week.
- Holding time: 1 hour minimum, 4 hours maximum. Never hold overnight.
- Reward-to-risk: mainly 1:2 or 1:3.
- My time zone is Doha (UTC+3, no daylight saving).
  - I can sit at my laptop to analyse, mark charts and place market or limit orders ONLY from 09:00–12:00 and 16:00–18:00 Doha time.
  - Outside those hours I can only check positions and move stop loss / take profit from my phone.
- Note: London changes its clocks on the last Sunday of October and March, and New York on the first Sunday of November and second Sunday of March. Session opens shift by 1 hour against Doha. Account for this.

MARKETS
GBPUSD, XAUUSD (gold), NAS100, GBPJPY. Treat EACH market separately. Do not force one strategy onto all four.

STEP 1 — Use these four markets only.

STEP 2 — Study each market deeply, session by session (Asian, London, New York), using real historical intraday data:
- What each market typically does in each session (range, direction, volatility by hour in Doha time, by weekday).
- What it sweeps: Asian high/low, previous-day high/low, London high/low. How often, in which session, and what happens after (reversal vs continuation).
- Which session usually makes the day's high and low.
- What ALWAYS or very often repeats. Show percentages, and confirm each pattern holds in at least two separate time periods before calling it "repeating".

STEP 3 — Backtest at least 5 well-known, proven day-trading strategies on EACH market, over at least 4–6 months (longer is better), on the 1H, 30-minute, 15-minute and 5-minute timeframes. Examples: Asian range breakout, Asian sweep and reversal, New York opening-range breakout, trend pullback, VWAP pullback, fair value gap retrace, break and retest, previous-day high/low sweep. Show a results table for each market × strategy × timeframe:
- number of trades, win rate, average profit per trade in R (multiples of the amount risked), profit factor, maximum drawdown, longest losing streak.

STEP 4 — Every entry must happen inside my laptop windows (09:00–12:00 or 16:00–18:00 Doha). Management after that must be possible from a phone: preset stop loss and take profit, plus a simple time-based exit.

STEP 5 — Don't just copy a strategy from somewhere. First study the market, then BUILD each market's strategy from the behaviour that repeats in Step 2.

STEP 6 — Respect the rules above: 1–4 hour holds, 1:2 or 1:3 targets, 1% / 3% / 5% risk limits, 1–2 trades a day, 3–4 trading days a week, aiming for 2–4 winning days a week.

STEP 7 — Run a proper, supervised backtest:
- Use 1-minute data to decide whether the stop or the target was hit first. If both are hit in the same minute, count it as a LOSS.
- Subtract realistic spread and commission from every trade. Buy limit orders fill only when the ASK price reaches them. Short trades exit on the ASK.
- Split the data: build the strategy on one period, check it on a second period, then do a final test ONCE on a sealed period never used before (at least 6 months, covering both summer and winter clock seasons). Write the final rules down BEFORE the final test.
- Check for look-ahead bias (using information not yet available at the time of the trade).
- Measure how much of each result could be luck, given how many strategy versions were tried.
- Apply my prop rules day by day: 1% risk, stop trading for the day before −3% is possible, account fails at −5%. Report how often the account would fail.

STEP 8 — Deliver ONE single strategy for EACH market (4 in total), each including:
- Exact step-by-step rules in Doha time: what to mark before the window, entry trigger, timeframe, stop loss, take profit, time exit, position sizing for 1% risk with a worked lot-size example.
- Confluences and confirmations needed before entering.
- Results: win rate, average R per trade, max drawdown, losing streak, trades per week, trading days per week, winning days per week.
- Weekly P&L breakdown (a table of every week tested) and monthly P&L.
- A daily/payout view: average winning day vs losing day, how many trading days on average to reach a payout target of +1%, +2% and +4%, and how often the account would hit −5% first.
- Risks, what to avoid, when to step back (news days, losing-streak rules, drawdown rules), and when to be fully confident.
- An honest verdict: PROVEN, WEAK, or NO EDGE. If a market has no strategy that survives the final sealed test, say so plainly instead of inventing one.

STYLE
- Keep it simple: few indicators, clean rules I can follow on a chart.
- Explain in plain language. I am not a programmer.
- No mistakes allowed: show the evidence behind every claim, and never present a strategy as proven unless it passed the sealed test.
```
