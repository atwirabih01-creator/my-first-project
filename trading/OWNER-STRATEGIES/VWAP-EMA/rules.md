# Owner's strategy "VWAP + EMA": the four frozen rule sets (v1, 11 Oct 2026)

Written by Agent 1 (Trading Research Lead) for Agent 2 to test. Frozen: do not change without a changelog entry.
Built on design data 2019 – Sep 2026 only. *Research, not financial advice. Trading carries real risk of loss.*

## Read this first: what "VWAP" means here
Real VWAP weights every price by the volume traded. Our 1-minute price files have **no volume**, so every rule below uses
a **"session average price" (AP)** instead: the running average of each 1-minute bar's typical price (high + low + close) / 3,
starting at the anchor time, every minute weighted equally, reset every day. On a chart this looks and behaves very much like
an anchored VWAP, but it is **not identical** (on a busy news minute real VWAP leans harder toward that price). If the owner
uses a real VWAP on their platform, results can differ slightly; the owner's own backtest should use the same AP formula,
or check the difference.
**Band (used by GBPUSD and EURUSD only):** AP ± 2 × the running standard deviation of the typical prices around AP since the anchor.

## Common rules (all four markets)
- **Indicators:** EMA = exponential moving average of bar closes (standard chart EMA, kept running across days). ATR = 14-bar
  average true range (Wilder smoothing) on the same bars.
- **Bars** are aligned to the New York clock (15-min bars start at :00 :15 :30 :45; 30-min bars at :00 :30).
- A signal is judged when a bar **closes**. **Entry** = the closing price of that bar (enter immediately, market order).
- **Risk:** 1% of the account per trade. Position size = 1% of account ÷ (distance from entry to stop).
- **Stop size limits:** if the rule's stop is closer than 1 × ATR, move it out to exactly 1 × ATR from entry. If it is farther than
  4 × ATR, skip the trade.
- **Forced close:** close any open trade at **15:55 New York** (22:55 Doha in US summer time, 23:55 Doha in US winter time).
  Nothing is ever held overnight.
- **Skip the day** if the price feed has a hole of more than 15 minutes between the anchor time and 15:55 New York (data rule
  for backtests; live, skip if your platform's prices are broken).
- **News:** no news filter. Trades are taken on news days (owner decides; see research.md for how news days behaved).
- **Costs** used in the tests (round trip per trade): Nasdaq 2.0 points, gold 0.40 USD, GBPUSD 1.5 pips, EURUSD 1.2 pips.

**Time zones:** Doha = UTC+3 all year. New York is UTC−5 in US winter time and UTC−4 in US summer time (2nd Sunday of March →
1st Sunday of November), so **Doha = New York + 8 h in winter, + 7 h in summer**. London is UTC+0 in UK winter and UTC+1 in UK
summer, so **Doha = London + 3 h in UK winter, + 2 h in UK summer**. For a few weeks in March and Oct/Nov the US and UK clocks
change on different dates; rules are always defined in the **local** London or New York time named in each rule.

---
## 1. NASDAQ 100: "VWAP reclaim, ride to the close" (NASDAQ_NY0930_R15E)
- **Chart:** 15-minute bars. EMA 20 (fast) and EMA 50 (slow). AP anchored at **09:30 New York** (the stock market open;
  16:30 Doha in summer, 17:30 in winter).
- **Time window:** signal bars that **close** between **10:00 and 14:30 New York** (17:00 – 21:30 Doha summer / 18:00 – 22:30 winter).
- **Long setup (wait):** the 3 bars before the signal bar all **closed below AP** (all three on the same day, after 09:30).
- **Long confirmation (signal bar):** it closes **above AP**, **above the EMA 20**, and the **EMA 20 is above the EMA 50** at that close.
- **Entry:** buy at the signal bar's close.
- **Stop loss:** the lowest low of the 4 bars (the 3 setup bars + the signal bar); then apply the 1×–4× ATR stop-size limits.
- **Take profit:** none. The trade stays open until the stop is hit or the forced close at 15:55 New York. No break-even rule.
- **Short:** exact mirror (3 bars closed above AP; signal bar closes below AP and below EMA 20; EMA 20 below EMA 50; stop = highest high of the 4 bars).
- **Daily limit:** max 2 trades a day, one at a time (a new signal only counts on a bar that closes after the previous trade ended).

## 2. GOLD (XAUUSD): "EMA trend pullback after the New York open, ride to the close" (XAUUSD_NY0800_P15E1)
- **Chart:** 15-minute bars. EMA 20 and EMA 50. AP anchored at **08:00 New York** (15:00 Doha summer / 16:00 winter).
- **Time window:** signal bars that **close** between **08:30 and 12:00 New York** (15:30 – 19:00 Doha summer / 16:30 – 20:00 winter).
- **Long setup (pullback bar = the bar before the signal bar):** EMA 20 above EMA 50 on that bar, and its **low touched or went below the EMA 20**.
- **Long confirmation (signal bar):** EMA 20 still above EMA 50; the bar closes **above AP**, **above the EMA 20**, and **above the
  pullback bar's high** (the resumption). Both bars on the same day.
- **Entry:** buy at the signal bar's close.
- **Stop loss:** the lower of the two bars' lows; then the 1×–4× ATR limits.
- **Take profit:** none: stop or forced close at 15:55 New York.
- **Short:** exact mirror (EMA 20 below EMA 50; pullback bar's high touched/above EMA 20; signal bar closes below AP, below EMA 20 and below the pullback bar's low; stop = higher of the two highs).
- **Daily limit:** **1 trade a day**. After it closes (win or loss), stop for the day.

## 3. GBPUSD: "VWAP band snap-back in the London morning" (GBPUSD_LON0800_M15)
- **Chart:** 15-minute bars. EMA 20 and EMA 50. AP and ±2 standard-deviation bands anchored at **08:00 London**
  (10:00 Doha in UK summer / 11:00 in UK winter).
- **Time window:** signal bars that **close** between **08:30 and 12:00 London** (10:30 – 14:00 Doha UK summer / 11:30 – 15:00 UK winter).
- **Market must be flat:** the gap between EMA 20 and EMA 50 is smaller than 0.25 × ATR at the signal bar.
- **Long setup:** the bar before the signal bar traded **below the lower band** (its low < AP − 2 SD).
- **Long confirmation (signal bar):** closes back **above the lower band** and closes **up** (close > open). Both bars on the same day.
- **Entry:** buy at the signal bar's close.
- **Stop loss:** the lowest low of the last 3 bars (signal bar and the 2 before it); then the 1×–4× ATR limits.
- **Take profit:** the AP value at the moment of entry (a fixed price; it does not move afterwards).
  **Skip** if that target is less than 1 × the risk away.
- **Short:** mirror (previous bar's high above the upper band; signal bar closes back below the upper band and closes down; stop = highest high of the last 3 bars; target = AP).
- **Daily limit:** max 2 trades, one at a time. Forced close 15:55 New York if neither stop nor target was hit.

## 4. EURUSD: "VWAP band snap-back in the London morning, 30-minute chart" (EURUSD_LON0800_M30)
Same rules as GBPUSD (section 3), with **30-minute bars** (EMA 20 and EMA 50, ATR 14 on 30-minute bars).
Anchor 08:00 London, signal bars closing 08:30 – 12:00 London, target = AP, stop = lowest low / highest high of the last 3 bars.
Chosen by the pre-declared rule (most bar points), but it trades only ~6 times a year and loses money: see the warning below.

---
## Honest summary for Agent 2 (design data 2019 – Sep 2026, with standard costs)
| Market | Trades | R with costs | R per trade | Bar points | Misses |
|---|---|---|---|---|---|
| Nasdaq | 710 | +54.4 | +0.077 | 6 / 8 | 2019 −10.5 R (limit −8); R per trade just under +0.08 |
| Gold | 1,213 | +103.9 | +0.086 | 6 / 8 | 2021 −28.1 R; losing run 12; drawdown 57.6 R; profit mostly 2022-26 |
| GBPUSD | 227 | +0.5 | +0.002 | 2 / 8 | almost everything: no edge after costs |
| EURUSD | 50 | −6.7 | −0.134 | 2 / 8 | almost everything: loses money, too few trades |
None of these has been tested on unseen data. The 2016–2018 hidden files have never been used for any VWAP + EMA design, so
they are a fair unseen test for these frozen rules (Agent 2 only).
