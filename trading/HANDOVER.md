# Day-trading project: handover

Prepared by the team leader, 11 Oct 2026 (Doha). Research by Agent 1 (Trading Research Lead), testing and grading by Agent 2 (Backtest & Performance Manager).

**What you are getting:** one strategy per market, each with the reasons, the test results and the full A-to-Z rules (Doha and New York times), graded honestly. All week-by-week results and every single trade are in **`TRADING-RESULTS.xlsx`**.

*Past results do not guarantee future results. Trading carries a real risk of loss. This is not financial advice.*

## 1. Results at a glance

1 R = the 1% of your account risked on one trade. **Unseen** = years nobody looked at when the rules were written (the real judge). **Study** = years the rules were built on.

| Market | Strategy | Grade | Unseen years | Study years | Longest losing run |
|---|---|---|---|---|---|
| **NASDAQ** | Fade the big opening gap (v1) | **B: Promising** | 250 trades, +11.0 R (+0.044 per trade) | 128 trades, +17.8 R (+0.139 per trade) | 6 |
| **GOLD** | Follow London's break of the Asia box (v3) | **B: Promising (bottom of B)** | 81 trades, +1.9 R (+0.023 per trade) | 973 trades, +90.3 R (+0.093 per trade) | 8 |
| **GBPUSD** | Quiet-Asia breakout (v3) | **C: Experimental (demo only)** | 136 trades, -6.3 R (-0.046 per trade) | 296 trades, +39.4 R (+0.133 per trade) | 8 |
| **EURUSD** | Euro-only move fade (v3) | **C: Experimental (demo only)** | 63 trades, -2.4 R (-0.038 per trade) | 226 trades, +41.9 R (+0.185 per trade) | 8 |

**Grades:** A = proven on unseen data. B = made money on unseen data, but the edge is small or uneven: practise it first. C = lost money on unseen data: practice account only, never real money.

### Results per year

**NASDAQ:** 2016 -0.1 (unseen), 2017 -2.5 (unseen), 2018 +6.9 (unseen), 2021 +4.6 (unseen), 2022 -2.7 (unseen), 2023 +1.4 (unseen), 2024 +1.5 (part unseen), 2025 +17.6, 2026 +2.1 (part unseen)

**GOLD:** 2016 +4.2 (unseen), 2017 -2.8 (unseen), 2018 +0.4 (unseen), 2019 -1.5, 2020 +18.1, 2021 +9.5, 2022 +2.5, 2023 +8.2, 2024 +31.4, 2025 -2.3, 2026 +24.4

**GBPUSD:** 2016 -9.5 (unseen), 2017 -3.0 (unseen), 2018 +6.2 (unseen), 2019 -7.1, 2020 +6.3, 2021 +5.2, 2022 +15.5, 2023 +5.5, 2024 +6.9, 2025 +10.6, 2026 -3.4

**EURUSD:** 2016 +5.6 (unseen), 2017 -7.9 (unseen), 2018 -0.1 (unseen), 2019 +9.7, 2020 +13.2, 2021 +0.9, 2022 +5.1, 2023 -0.5, 2024 +9.6, 2025 -4.2, 2026 +8.2

(Nasdaq was not simulated for 2019 - Sep 2021. Partial years: 2023 has a data gap Feb - Jul; 2026 ends in Sep.)

## 2. What to do next

1. **Nasdaq and gold (grade B):** check about 20 trades from the `Trades` sheets on your broker's chart, then follow the live practice journal (below) or practise them yourself on a demo account for at least 3 months. Each strategy's grade box says exactly what upgrades it to A and when to stop using it.
2. **GBPUSD and EURUSD (grade C):** practice account only. They lost money on unseen years.
3. **Tell us your broker and its costs.** All four results depend on real trading costs; gold and the currency pairs especially.
4. **Going live is your decision**, after your own backtest and practice.

## 3. Live practice trading (running now)

Every weekday after the US close (23:20 Doha in US summer, 00:20 in winter) a routine reads that day's live 1-minute prices for the Nasdaq 100 and gold and records what each grade-B strategy would have done. **No orders are placed.** Every Sunday morning you get a short report. Journal: `trading/paper/journal.csv`; details: `trading/paper/README.md`.

| Date | Market | What happened | Result |
|---|---|---|---|
| 2026-10-08 | GOLD | no trade: no breakout by 11:59 London | - |
| 2026-10-08 | NASDAQ | no trade: gap not bigger than 0.5 x ATR | - |
| 2026-10-09 | GOLD | no trade: no breakout by 11:59 London | - |
| 2026-10-09 | NASDAQ | SHORT at 16:35 Doha, closed 23:00 (15:59 close) | +0.11 R |

## 4. How we tested (so you can trust the numbers)

- **Data:** 1-minute prices, Jan 2016 - Sep 2026 per market (about 11 years). Every file's clock was checked against US news releases and the 09:30 New York stock open, including the weeks when US and UK clocks differ. Days with missing prices (mostly Feb - Jul 2023) were skipped.
- **Two separate agents:** Agent 1 built each strategy; Agent 2 rewrote the test from the written rules alone. Every strategy's trades matched between the two.
- **Unseen years:** each strategy was judged on years it had never seen. Many ideas that looked good on the study years failed there: over 290 ideas and variations were tried across the four markets. These four are the best found.
- **Costs** were charged on every trade, and every strategy was also tested at double cost.

## 5. The four strategies in full

---

<a id='nasdaq'></a>

## NASDAQ 100: Final strategy for this round, "Fade the big opening gap" (v1)

Prepared by Agent 2 (Backtest & Performance Manager), 10 Oct 2026; updated the same day with the hidden 2016-2018 test (round 3). Written for someone who has never seen the strategy.

> ## Grade: **B: Promising** (not proven) — re-checked on 3 more hidden years (2016-2018) on 10 Oct 2026, grade unchanged
> **What B means:** it made money on price data that nobody used to build the rules, but the edge is small and uneven.
> It is **not** a proven strategy (that would be grade A). My test verdict was **DROP**, so it must not be traded with real money
> before your own checks.
>
> **The evidence in five lines:**
> - Tested on about 8 years (Jan 2016 – Dec 2018 and Oct 2021 – Sep 2026), 378 trades, **+28.8 R**. Every period made money at the
>   normal cost. Longest losing run 6 trades; worst drop from a peak 8.3 R (about 8% of the account).
> - **New this round:** on 2016-2018, which nobody had seen, the unchanged rules made **+4.3 R on 81 trades (+0.05 R per trade)**.
>   But 2016 (−0.1 R) and 2017 (−2.5 R) were slightly negative; all of the profit came in 2018 (+6.9 R).
> - On **all unseen data together (2016-18, Oct 21 – Sep 24, Jul – Sep 26): 250 trades, +11.0 R, only +0.04 R per trade**, roughly
>   **a 1 in 5 chance the real edge is zero**. Selling gap-ups is close to zero there (+1.3 R on 130 trades; −1.0 R at double cost).
> - The two years the rules were built on (+0.14 R per trade) are still the best of all, not typical ones.
>
> **What would upgrade it to A:** at least 6 more months of new data (your own backtest and demo trading from now on) that is
> clearly positive, at more than +0.10 R per trade over 50+ trades, with both longs and shorts positive.
> **What would downgrade it (stop using it):** any calendar quarter on new data that loses more than **−4.8 R**, the worst quarter
> seen in 8 years (Apr – Jun 2026), or a losing run longer than 8 trades.

*Past results do not guarantee future results. Trading carries a real risk of loss. This is not financial advice.*

---

### 1. Why it works (the idea in plain words)
The Nasdaq 100 index trades almost 24 hours a day, but most buying and selling happens when the US stock market is open,
**09:30 to 16:00 New York time**. Overnight, with few traders, the price can drift far from yesterday's 16:00 price. The difference
between yesterday's 16:00 price and today's 09:30 price is called the **gap**.

When the full stock market opens, part of a **big** overnight gap is often taken back: an overshoot built on thin trading gets
corrected. This strategy trades **against** a big gap: it **sells after a big gap up** and **buys after a big gap down**, aiming for
price to come all the way back to yesterday's 16:00 price.

Honest note: in 5 years the gap came all the way back on about 3 trades in 10. On about half of the trades neither the target nor
the stop was reached, and those trades together made about nothing. The profit comes from the full gap fills being a little
bigger and a little more common than the stop-outs.

---

### 2. Backtest results

**How it was tested:** a computer program walked through every minute of Nasdaq 100 price data (1-minute candles, from HistData)
from Jan 2016 to Dec 2018 and from Oct 2021 to Sep 2026, following the rules below exactly (the same program for both). Every trade has a **cost of 2.0 index points** taken off (spread and
slippage). If the stop and the target were both touched in the same minute, the test counted the stop. 1 R = the 1% of the account
risked on each trade. The trade lists are `backtest/hidden_H/trades_v1.csv` (2016-2018) and `backtest/trades_v1_withC.csv` (Oct 2021 – Sep 2026),
so you can check any trade by hand.

**Periods:** H, C, A and B were **not** used to build the rules (hidden tests). Y1 and Y2 were used to build them.
H (2016-2018) was opened for the first time on 10 Oct 2026, with the rules unchanged.

| Period | Trades | Win rate | Avg win / avg loss | Total | Per trade | Profit factor* | Biggest drop | Longest losing run |
|---|---|---|---|---|---|---|---|---|
| **H 2016** (hidden) | 11 | 54.5% | +0.57 / −0.70 R | **−0.1 R** | −0.01 R | 0.97 | −2.0 R (−2.0%) | 3 |
| **H 2017** (hidden) | 14 | 35.7% | +0.57 / −0.59 R | **−2.5 R** | −0.18 R | 0.54 | −3.4 R (−3.3%) | 5 |
| **H 2018** (hidden) | 56 | 58.9% | +0.68 / −0.67 R | **+6.9 R** | +0.12 R | 1.45 | −3.4 R (−3.4%) | 3 |
| **H all, Jan 2016 – Dec 2018** (hidden) | 81 | 54.3% | +0.65 / −0.65 R | **+4.3 R** | +0.05 R | 1.18 | −5.6 R (−5.5%) | 5 |
| **C** Oct 2021 – Sep 2023 (hidden; 2022 bear market) | 80 | 48.8% | +0.78 / −0.67 R | **+3.1 R** | +0.04 R | 1.11 | −8.2 R (−7.9%) | 5 |
| **A** Oct 2023 – Sep 2024 (hidden) | 63 | 52.4% | +0.67 / −0.67 R | **+1.9 R** | +0.03 R | 1.10 | −4.6 R (−4.5%) | 4 |
| Y1 Oct 2024 – Sep 2025 (design) | 64 | 59.4% | +0.73 / −0.62 R | +11.8 R | +0.18 R | 1.74 | −3.6 R (−3.5%) | 4 |
| Y2 Oct 2025 – Jun 2026 (design) | 64 | 59.4% | +0.62 / −0.67 R | +6.0 R | +0.09 R | 1.34 | −8.3 R (−8.0%) | 6 |
| **B** Jul – Sep 2026 (hidden) | 26 | 53.8% | +0.62 / −0.58 R | **+1.6 R** | +0.06 R | 1.23 | −1.4 R (−1.4%) | 4 |
| All hidden before this round (C + A + B) | 169 | 50.9% | +0.71 / −0.66 R | +6.7 R | +0.04 R | 1.12 | −8.2 R (−7.9%) | 5 |
| **All hidden (H + C + A + B)** | 250 | 52.0% | +0.69 / −0.66 R | **+11.0 R** | **+0.04 R** | 1.14 | −8.2 R (−7.9%) | 5 |
| Design (Y1 + Y2) | 128 | 59.4% | +0.68 / −0.65 R | +17.8 R | +0.14 R | 1.53 | −8.3 R (−8.0%) | 6 |
| All periods (about 8 years) | 378 | 54.5% | +0.68 / −0.65 R | +28.8 R | +0.08 R | 1.26 | −8.3 R (−8.0%) | 6 |

Without its 3 best trades: H +0.8 R, all hidden +6.5 R. Chance the true average is zero or less (a statistics reshuffle check):
H 25%, all hidden 18%, design 2%.

*Profit factor = money won ÷ money lost. Above 1 means profit; 1.1 is thin, 1.5 or more is solid.

**With higher costs** (total R for H / C / A / Y1 / Y2 / B; and all hidden H + C + A + B):
- 2.0 points (the test): +4.3 / +3.1 / +1.9 / +11.8 / +6.0 / +1.6; all hidden +11.0
- 4.0 points: +1.7 / +2.3 / +1.1 / +11.2 / +5.5 / +1.5; all hidden +6.6
- 6.0 points: −0.9 / +1.5 / +0.3 / +10.6 / +5.0 / +1.3; all hidden +2.1

Costs matter little since 2021, because the stops are large (typically 150–320 points). In 2016-2018 the index was 4,000–7,700
points and the stops were much smaller (median 61 points), so costs mattered more: at 6 points H turns slightly negative.

**Buying vs selling:**
- **2016-2018 (H):** longs 36 trades, +9.6 R (69% won); **shorts 45 trades, −5.3 R** (2016 −1.5, 2017 −3.7, 2018 −0.1: a rising market).
- All hidden data together (H + C + A + B): longs 120 trades +9.7 R, shorts 130 trades +1.3 R (−1.0 R at 4.0 points).
- Longs (buying after a gap down), Oct 2021 – Sep 2026: 134 trades, +9.6 R in total. But on hidden data: 84 trades, +0.1 R, which is **no edge**.
  In the 2022 bear market the longs lost 2.9 R.
- Shorts (selling after a gap up), Oct 2021 – Sep 2026: 163 trades, +14.9 R in total, and +6.6 R on hidden data. But they lost 4.8 R in Apr – Jun 2026
  and 1.1 R in Jul – Sep 2026, both during strong rallies.

**How trades ended, H (2016-2018):** target 28 (35%) +21.4 R; stop 14 (17%) −14.5 R; closed at 16:00 39 (48%) −2.6 R.
**How trades ended (Oct 2021 – Sep 2026):** target reached 92 trades (31%), +83.0 R; stop hit 54 (18%), −54.6 R;
closed at 16:00 New York 151 (51%), −3.9 R.

**Quarters:** worst Apr – Jun 2026 −4.8 R, Apr – Jun 2022 −3.6 R, Jul – Sep 2022 −2.6 R. Best Oct – Dec 2025 +5.6 R.

**Missing data:** the price file has holes on almost every day from March to July 2023, so those days were skipped (109 days).
Other skipped days were US holidays, half days, a few days with missing data, and the day after any of those.
**2016-2018:** clean data (4 days with a hole). But the rule "no trade if the stop is under 40 points" skipped **85 days** with a big
enough gap (40 in 2016, 42 in 2017, 3 in 2018), because the index was low (about 4,000–6,500) and its daily range in points was small.
That is why 2016 and 2017 have only 11 and 14 trades.

#### Week-by-week table, Jan 2016 – Dec 2018 (hidden period H, opened 10 Oct 2026)

*The full week-by-week table is in `TRADING-RESULTS.xlsx` (one sheet per market).*

#### Week-by-week table, Oct 2021 – Sep 2026 (running total starts at 0 again in Oct 2021)

*The full week-by-week table is in `TRADING-RESULTS.xlsx` (one sheet per market).*

### 3. Step by step, A to Z

#### 3.1 Clocks (all rule times are New York time)
The US moves its clocks; Doha does not. **US summer time** runs from the 2nd Sunday of March to the 1st Sunday of November
(Doha = New York + 7 hours). The rest of the year is **US winter time** (Doha = New York + 8 hours).

| Step | New York | Doha (US summer time) | Doha (US winter time) |
|---|---|---|---|
| Yesterday's close to note (last 1-minute candle, 15:59) | 15:59 → 16:00 | 22:59 → 23:00 | 23:59 → 00:00 |
| US stock market opens: measure the gap | 09:30 | 16:30 | 17:30 |
| First 5-minute candle ends: decide and enter | 09:35 | 16:35 | 17:35 |
| Close anything still open | 15:59 (close of that candle, i.e. 16:00) | 22:59 → 23:00 | 23:59 → 00:00 (midnight) |

#### 3.2 Which days to trade
Trade only when **today and the previous trading day were both full US stock-market days** (09:30 – 16:00 New York).
**Do not trade:**
- US stock-market holidays (the index may still show prices on some of them), e.g. New Year, Martin Luther King Day, Presidents' Day,
  Good Friday, Memorial Day, Juneteenth, Independence Day, Labor Day, Thanksgiving, Christmas. Check the NYSE holiday calendar.
- US half days (market closes at 13:00 New York): usually the day after Thanksgiving, 24 December, and sometimes 3 July.
- **The day after** any of the days above.
- Any day when your chart has a hole of more than 15 minutes in the 09:30 – 16:00 session (yesterday or today).
- News days: in the test, US jobs report (NFP) and inflation (CPI) days were traded like any other day. Together they were slightly
  negative (31 trades, −1.7 R; these days were not labelled in period C). Skipping them is your choice; the rules do not require it.

#### 3.3 The evening before (or before 09:30 New York): mark two things
Chart: **Nasdaq 100 (US100 / NAS100 / USTEC at your broker), 1-minute candles.**

**(1) PC, the previous close.** The closing price of yesterday's **15:59 New York** 1-minute candle
(22:59 Doha in US summer time, 23:59 in US winter time). Draw a horizontal line there. This is your **target**.

**(2) ATR, the normal daily range.** Use the **last 14 trading days** before today:
1. For each day, read the 09:30 – 16:00 New York session's **highest high**, **lowest low**, and **09:30 opening price**.
   (On a 1-minute chart: the first candle at 09:30 and every candle up to 15:59. A 30-minute chart works for high and low if your
   broker's candles start at 09:30 New York.)
2. Day range in % = (high − low) ÷ 09:30 open × 100. Example: high 23,500, low 23,200, open 23,300 → 300 ÷ 23,300 × 100 = 1.29%.
3. Leave out any of the 14 days that was a holiday, a half day or had a data hole. You need at least 10 good days; otherwise, no trade.
4. **ATR %** = the average of the good days' range %. Write it down (for example 1.62%).
   A simple spreadsheet with the columns date / high / low / open / range % makes this a 5-minute job.

#### 3.4 At 09:30 New York (16:30 Doha summer / 17:30 Doha winter): the gap
- **O** = the opening price of the 09:30 1-minute candle.
- **ATR in points** = ATR % × O ÷ 100. Example: 1.62% × 28,420 ÷ 100 = 460 points.
- **Gap** = O − PC. Example: 28,420 − 29,018 = −598 points (a gap down).
- **Is it big enough?** Only trade if the gap's size (ignore the minus sign) is **more than half the ATR**.
  Example: 598 > 0.5 × 460 = 230 → yes.
- **Direction:** gap **up** → you will **SELL (short)**. Gap **down** → you will **BUY (long)**.

#### 3.5 Wait for the first 5-minute candle (09:30:00 – 09:34:59 New York)
Do nothing for 5 minutes. **Skip the day** if, during these 5 minutes, price already touched PC (for a short: the low reached PC;
for a long: the high reached PC). This never happened in the 8 tested years, but check it anyway.
There is no other confirmation signal. The big gap itself is the signal.

#### 3.6 Entry at 09:35 New York (16:35 Doha summer / 17:35 Doha winter)
Enter with a **market order** at the close of the 09:34 1-minute candle (that is, right at 09:35).

#### 3.7 Stop loss and take profit (place both immediately)
- **Stop loss** = **0.75 × ATR in points** away from your entry: **above** the entry for a short, **below** it for a long.
  Example: 0.75 × 460 = 345 points. If this distance is under 40 points, do not trade. (This never happened from 2021 on, but it skipped 85 days in 2016-2018,
  when the index was much lower. At today's prices it does not matter.)
- **Take profit** = **PC exactly** (yesterday's 15:59 close).
- **Position size**, so the stop costs exactly 1% of the account:
  size = (1% of your balance) ÷ (stop distance in points × value of 1 point per lot at your broker).
  Example: balance 10,000 USD, risk 100 USD, stop 345 points, broker pays 1 USD per point per lot → 100 ÷ 345 = 0.29 lots.
- Because the target is the gap fill and not a fixed multiple of the risk, a win can be smaller or bigger than 1R.
  On average, wins were +0.69 R and losses −0.65 R.

#### 3.8 Managing the trade
- **Do nothing.** Do not move the stop, do not move it to break-even, do not take partial profits. The test did none of this.
- If price jumps past your stop, the loss can be a little more than 1R (rare in 5 years; the worst stop-out was −1.06 R).

#### 3.9 Closing time and daily limits
- **Close the trade at 16:00 New York at the latest** (the close of the 15:59 candle = 23:00 Doha in US summer time,
  00:00 midnight Doha in US winter time). Never hold overnight.
- **One trade per day, maximum.** After it closes (target, stop or 16:00), stop for the day.

#### 3.10 Worked example: Friday 17 July 2026 (US summer time)
- PC (16 Jul, 15:59 New York = 22:59 Doha): **29,018.2**. ATR %: 1.66% → ATR at today's open = **470.9 points**.
- 09:30 New York (16:30 Doha): O = **28,419.8**. Gap = 28,419.8 − 29,018.2 = **−598.5** (a gap down of 1.27 ATR, bigger than
  0.5 × 470.9 = 235.5) → **BUY**.
- First 5-minute candle did not reach 29,018.2 → trade allowed.
- Entry at 09:35 New York (16:35 Doha): **28,365.6**. Stop = 28,365.6 − 0.75 × 470.9 = **28,012.4** (353.2 points). Target **29,018.2**.
- Neither was hit. Closed at 16:00 New York (23:00 Doha) at 28,584.4: +218.8 points − 2.0 cost = **+0.61 R**.

#### 3.11 Checklist before every trade (tick all)
- [ ] Today and the previous trading day are both full US market days (no holiday, no half day, no data hole). Not the day after a holiday or half day.
- [ ] PC (yesterday's 15:59 New York close) is marked on the chart.
- [ ] ATR % worked out from at least 10 of the last 14 full days; ATR in points = ATR % × today's 09:30 open ÷ 100.
- [ ] Gap = 09:30 open − PC, and its size is **more than 0.5 × ATR**.
- [ ] Direction: gap up → sell; gap down → buy.
- [ ] The first 5-minute candle (09:30 – 09:34) did **not** touch PC.
- [ ] It is 09:35 New York (16:35 Doha summer / 17:35 Doha winter). No trade taken yet today.
- [ ] Stop at 0.75 × ATR from the entry (at least 40 points). Target at PC. Size = 1% risk.
- [ ] Alarm set for 15:59 New York (22:59 Doha summer / 23:59 Doha winter) to close the trade if it is still open.

---

### 4. Known weaknesses (read these before trading it)
1. **The edge is thin.** On all hidden data (250 trades, about 6 years) it is about +0.04 R per trade: on a 10,000 USD account risking
   100 USD per trade, that is about +4 USD per trade on average, with large swings around it. Roughly a 1 in 5 chance it is zero.
   2016 and 2017 were slightly negative; only 2018 made money in the newest hidden test.
2. **Shorts lose in strong rallies.** In 2016-2018 (a mostly rising market) selling gap-ups lost 5.3 R on 45 trades. Selling gap-ups lost 4.8 R in Apr – Jun 2026 (May 2026 was the worst month in 5 years, −4.6 R)
   and lost again in Jul – Sep 2026 (−1.1 R). When the index keeps making new highs, gap-ups tend to keep going.
3. **Longs lose in bear markets.** Buying gap-downs lost 2.9 R in Oct 2021 – Dec 2022 (the 2022 bear market) and made nothing on all
   hidden data together (84 trades, +0.1 R). When the market keeps falling, gap-downs tend to keep going.
4. **About half of all trades end at the 16:00 close** with neither stop nor target hit (151 of 297). Together they lost a little
   (−3.9 R). These trades tie up your evening (until 23:00 or midnight Doha) for nothing on average.
5. **Small sample.** It trades only about 60 – 65 days a year. One good or bad month changes a year's result a lot: hidden year A was
   −1.1 R without April 2024. Losing stretches of several months are normal (e.g. Apr – Sep 2022: −6.2 R).
6. **Evening hours in Doha.** Entry is 16:35 or 17:35 Doha, and the forced close is 23:00 or midnight Doha.
7. **Fixed 40-point minimum stop.** The rule is written in points, not in %. When the index was low (2016-2017) it blocked most trades.
   At today's prices (about 20,000+) it never blocks a trade, but it shows the rules were written for today's price level.
8. **Data:** the test used one free data source (HistData bid prices). Your broker's prices, spread and session times may differ
   slightly, which can change individual trades.

---

### 5. Before you use it: your own checks
1. **Repeat the backtest by hand** on at least 20 trades from the lists (`backtest/trades_v1_withC.csv` and `backtest/hidden_H/trades_v1.csv`): same dates, same direction,
   similar entry, stop and target on your broker's chart. Note any differences.
2. **Demo-trade it** (a practice account, no real money) for at least 3 months, following the checklist exactly. Compare with the test:
   about 1 trade in 4 days, roughly half the trades closing at 16:00, wins around +0.7 R and losses around −0.65 R.
3. Only then decide, yourself, whether to go live, and with how much risk. Given grade B, consider risking less than 1% at first.

*Past results do not guarantee future results. A strategy that made money in the past can lose money in the future.
Trading carries a real risk of loss. This is not financial advice.*

---

<a id='gold'></a>

## XAUUSD (gold): Final strategy for this round, "Follow London's break of the night box" (v3)

Prepared by Agent 2 (Backtest & Performance Manager), 10 Oct 2026. Written for someone who has never seen the strategy.

> ## Grade: **B: Promising** (not proven; at the very bottom of B)
> **What B means:** it made money on price data that nobody used to build the rules, but the edge is small and uneven.
> It is **not** a proven strategy (that would be grade A). My test verdict was **IMPROVE**, so it must not be traded with real money
> before your own checks and a demo period.
>
> **The evidence in five lines:**
> - Tested on almost 11 years (Jan 2016 - Sep 2026), 1,054 trades: **+92.2 R** in total, 48% of trades won, longest losing run 8,
>   worst drop from a peak 18.0 R (about 17% of the account).
> - On the 3 years nobody had seen (2016-2018): **only 81 trades, +1.9 R, +0.02 R per trade**. That is close to zero: there is roughly
>   **a 40% chance the real edge in such years is zero or less**. At double the trading cost those years lose 1.3 R.
> - Almost all of the profit is from the 8 years the rules were built on (2019-2026, +90.3 R), when gold was more expensive and moved more.
> - Most of the profit came on **big US news days** and on **Mondays and Thursdays**. Those are not things you can choose in advance.
> - It lost 7.2 R from Oct 2022 to Sep 2023, and it had a stretch of over 2 years (Apr 2022 - May 2024) without a new account high.
>
> **What would upgrade it to A:** at least 6 months of new data from now on (your own backtest from Oct 2026, then demo trading),
> with 80 or more trades, **+0.10 R per trade or better**, still positive if you take off 0.80 USD per trade, and Tuesdays, Wednesdays and Fridays together
> not losing.
> **What would downgrade it (stop using it):** a drop of more than **18 R** from a peak (the worst in 11 years), **10 losses in a row**
> (the worst seen is 8), or the first 100 demo trades below **-5 R**.

*Past results do not guarantee future results. Trading carries a real risk of loss. This is not financial advice.*

---

### 1. Why it works (the idea in plain words)
Gold trades almost 24 hours a day. Unlike currencies such as the pound, gold has a **real Asian market** (Shanghai, India, Tokyo, Hong Kong).
During the Asian night, before London opens, gold builds a price range: the **night box**.

When gold moves a lot during the Asian night, it is usually reacting to real buying or selling or to news. When London opens
(07:00 London time), the big banks join, and they often push price out of the night box and keep going in that direction for the rest of the day.

This strategy does not guess the direction. It places **an order on both sides of the box** and lets London's first break decide:
- If price breaks **above** the box, we buy. If it breaks **below**, we sell.
- The **stop loss** is the other side of the box: if price crosses the whole night's range against us, the idea was wrong.
- There is **no profit target**: a winning trade is held until **16:00 New York**, the end of the US trading day. The few big trending days
  (often US news days) pay for the many small losses.
- Small boxes (under **8 USD**) are skipped: there, the trading cost eats too much of the risk, and on gold a quiet night does not lead to a good London move.

**Honest note:** a bit less than half the trades win (48%). Most trades end at the 16:00 New York close with a small gain or loss; about a third
hit the stop. The profit comes from the winners being slightly bigger than the losers (average win +1.04 R, average loss -0.78 R). In 2016-2018,
when gold was cheaper and calmer, there were no big winners (the best trade was +1.9 R), and the result was about zero.

---

### 2. Backtest results

**How it was tested.** One-minute gold prices (HistData.com, bid prices) from Jan 2016 to Sep 2026. Every trade was walked minute by
minute by a program (`backtest/backtest_v3.py`). Cost: **0.40 USD per trade** (spread and slippage), taken off every trade. If the stop
was touched in the same minute as the entry, it counts as a loss. Days with missing data or holidays were skipped. Agent 1 (who wrote the
rules) and I (who tested them) wrote separate programs and got **the same 973 trades** on 2019-2026.

**R** = the amount risked on one trade (1% of the account). +1 R = won the amount risked; -1 R = lost it.

#### Key numbers
| | Hidden years 2016-2018 (the judge) | Design years 2019-2026 | All 11 years |
|---|---|---|---|
| Trades | **81** | 973 | 1,054 |
| Win rate | 48% | 47% | 48% |
| Average win / average loss | +0.73 R / -0.63 R | +1.07 R / -0.79 R | +1.04 R / -0.78 R |
| Total | **+1.9 R** | +90.3 R | +92.2 R |
| Per trade | **+0.02 R** | +0.09 R | +0.09 R |
| Profit factor (wins / losses) | 1.07 | 1.22 | 1.21 |
| Worst drop from a peak | -8.5 R (-8.2%) | -18.0 R (-17.1%) | -18.0 R (-17.1%) |
| Longest losing run | 4 | 8 | 8 |
| Runs of 3+ losses | 4 | 61 | 65 |
| At double cost (0.80 USD) | **-1.3 R** | +63.1 R | +61.8 R |
| At triple cost (1.20 USD) | -4.5 R | +35.9 R | +31.4 R |
| Without the 5 best trades | **-7.2 R** | +61.6 R | +63.5 R |
| Chance the true edge is zero or less | **40%** | 0.6% | 0.8% |

#### Per year (0.40 USD cost)
| Year | Data | Trades | Win rate | Total R | R per trade | Profit factor | Worst drop | Longest losing run | At 0.80 USD | Days skipped (box < 8 USD) |
|---|---|---|---|---|---|---|---|---|---|---|
| 2016 | hidden | 59 | 49% | +4.2 | +0.07 | 1.23 | -3.9 | 4 | +2.0 | 161 |
| 2017 | hidden | 11 | 45% | -2.8 | -0.25 | 0.34 | -2.8 | 2 | -3.2 | 227 |
| 2018 | hidden | 11 | 45% | +0.4 | +0.04 | 1.11 | -2.3 | 3 | -0.1 | 233 |
| 2019 | design | 31 | 48% | -1.5 | -0.05 | 0.87 | -4.8 | 4 | -2.7 | 202 |
| 2020 | design | 141 | 46% | +18.1 | +0.13 | 1.30 | -8.2 | 6 | +13.6 | 82 |
| 2021 | design | 129 | 41% | +9.5 | +0.07 | 1.15 | -9.5 | 7 | +4.6 | 101 |
| 2022 | design | 121 | 47% | +2.5 | +0.02 | 1.04 | -12.8 | 5 | -1.9 | 116 |
| 2023 (data holes Feb-Jul) | design | 53 | 40% | +8.2 | +0.16 | 1.38 | -10.6 | 8 | +6.2 | 76 |
| 2024 | design | 174 | 51% | +31.4 | +0.18 | 1.43 | -6.4 | 7 | +25.9 | 43 |
| 2025 | design | 192 | 47% | -2.3 | -0.01 | 0.97 | -14.0 | 5 | -5.8 | 7 |
| 2026 (Jan-Sep) | design | 132 | 55% | +24.4 | +0.19 | 1.65 | -6.2 | 5 | +23.2 | 0 |
Positive years: 7 of 11 (2017, 2019, 2025 lost; 2018 is +0.4 R on 11 trades). **Oct 2022 - Sep 2023: -7.2 R on 60 trades** (37% won).
The number of trades depends on the gold price: about 10-60 a year when gold was 1,100-1,400 USD, 170-190 a year at 2,300 USD and above.

#### Other splits (all 11 years, 0.40 USD cost)
- **Buys vs sells:** buys +37.2 R (563 trades), sells +55.0 R (491). In the hidden years buys lost 3.9 R and sells made 5.8 R.
  Buys lost in 2021-22, sells lost in 2025; each time the other side made up for it.
- **Day of the week:** Monday +41.3 R, Tuesday +7.0, Wednesday +4.0, **Thursday +42.6**, Friday -2.7. Without Mondays and Thursdays the
  other 624 trades made only +8.3 R. In the hidden years Thursday was the worst day (-4.0 R). So do not read too much into the weekday split.
- **US news days** (days with a big price jump at 08:30, 10:00 or 14:00 New York, found afterwards): 2019-2026 +87.3 R on 301 trades;
  all other days +3.0 R on 672 trades. In 2016-2018 news days were -0.7 R. You cannot know in advance which days will have a big reaction.
- **How trades end:** 705 closed at 16:00 New York (+452 R together), 349 hit the stop (-360 R). 2 stops filled worse than the stop price (price jumped).
- **Months:** 63 of 107 months with trades were positive.
- **Long flat stretches:** Apr 2022 - May 2024 (774 days) and Jun 2025 - Jul 2026 (397 days) without a new account high.

#### A data note
The 2016-2018 price file was one hour late in the few weeks a year when the US and UK change their clocks on different dates (mid-March,
late Oct / early Nov). I corrected it. Without the correction those years show +2.7 R on 76 trades instead of +1.9 R on 81: the verdict is the same.

#### Week-by-week table, Jan 2016 - Sep 2026

*The full week-by-week table is in `TRADING-RESULTS.xlsx` (one sheet per market).*

### 3. Step by step, A to Z

#### 3.1 Clocks
The night box and the order window follow **London's clock**; the forced close follows **New York's clock**. Doha does not change its clock,
so the Doha times move when London or New York change theirs.

| Season | Night box (Doha) | Orders live (Doha) | Forced close (Doha) | Same in New York time |
|---|---|---|---|---|
| **Summer** (UK and US both on summer time: last Sunday of March to last Sunday of October) | 02:00-08:59 | 09:00-13:59 | **23:00** | box 19:00-01:59, orders 02:00-06:59, close 16:00 |
| **Winter** (both on winter time: first Sunday of November to second Sunday of March) | 03:00-09:59 | 10:00-14:59 | **00:00 midnight** | box 19:00-01:59, orders 02:00-06:59, close 16:00 |
| **Gap weeks** (US already/still on summer time, UK not: 2nd Sunday of March to last Sunday of March, and last Sunday of October to 1st Sunday of November) | 03:00-09:59 | 10:00-14:59 | **23:00** | box 20:00-02:59, orders 03:00-07:59, close 16:00 |

In London time it is always: **box 00:00-06:59, orders 07:00-11:59, close 16:00 New York.** Gold reopens each evening at 18:00 New York
(01:00 Doha in US summer, 02:00 Doha in US winter); the box belongs to the next morning's trading day. Monday's box is built on Monday morning
(Sunday night's prices are part of Monday).

#### 3.2 Which days to trade
- **Every weekday** (Monday to Friday) if the night box is at least 8 USD.
- **Skip** holidays and short days: Christmas, New Year, Good Friday, US holidays when the market closes early (e.g. Thanksgiving Friday,
  4 July if the US market is shortened), and any day your platform had a data/connection gap of more than 15 minutes since 18:00 New York.
- **News days are traded** (US jobs report, inflation (CPI), Fed decisions). In the test, they made most of the money; but they also produce
  sharp stop-outs (see the losing example in 3.10). That choice is yours; the test traded them.

#### 3.3 Before the order window: mark the night box (1-minute chart)
1. Open a **1-minute** gold chart (XAUUSD) on your broker's platform.
2. Find the **highest high** and the **lowest low** of all 1-minute candles from **00:00 to 06:59 London time** (Doha: see table).
   Draw two horizontal lines: **Box High** and **Box Low**.
3. **Box size** = Box High - Box Low. **If it is under 8 USD, no trade today.** Done for the day.
   (If your broker charges more than 0.40 USD for a round trip (spread + commission), the minimum is 20 x your cost.)

#### 3.4 What to wait for
Nothing else: you wait for price to break out of the box after 07:00 London.

#### 3.5 Entry: two orders at 07:00 London (09:00 Doha summer / 10:00 Doha winter)
1. Place a **buy stop** order at **Box High**.
2. Place a **sell stop** order at **Box Low**.
3. Size each order for **1% risk** (see 3.7).
The **confirmation is the fill**: the first order that fills is today's trade. **Cancel the other order at once.**
If price jumps past the level, you are filled at the next available price (a little worse). Buy orders fill at the ask price (chart price + spread).

#### 3.6 Stop loss and take profit
- **Stop loss:** the other side of the box. Bought at Box High: stop at **Box Low**. Sold at Box Low: stop at **Box High**.
  Place it **as soon as you are filled.**
- **Take profit: none.** The trade stays open until the stop is hit or until 16:00 New York.
- **Never move the stop.** No break-even, no partial profit.

#### 3.7 Position size (1% risk)
Risk per ounce = the box size (entry to stop). Ounces = (1% of your balance) / (box size). Round **down** to your broker's lot step.
Most brokers: 1 lot = 100 ounces, 0.01 lot = 1 ounce (check yours).
Example: 10,000 USD account, box 37.78 USD: 100 / 37.78 = 2.6 ounces, round down to **0.02 lots** (2 ounces), real risk 75.56 USD.

#### 3.8 Managing the trade
Nothing to do: the stop stays where it is. Do not close early because of fear or a small profit; the strategy depends on letting the
big days run to 16:00 New York.

#### 3.9 When to stop for the day, and when to close no matter what
- **One trade a day.** After it ends (stop or 16:00 New York), stop for the day.
- **If neither order has filled by 11:59 London** (13:59 Doha summer / 14:59 Doha winter), **cancel both.** No trade today.
- **Close any open trade at 16:00 New York** (**23:00 Doha** in US summer, **00:00 midnight Doha** in US winter). Never hold overnight.
- If both box lines are broken in the same minute (never happened in 11 years), do not trade.

#### 3.10 Worked examples (real trades from the test)
**Winning example: Tuesday 1 Sep 2026 (UK and US summer time).**
1. Night box, 00:00-06:59 London = 02:00-08:59 Doha = 19:00 Monday - 01:59 New York: **Box High 4,461.28, Box Low 4,423.50**. Box size **37.78 USD** (over 8: trade).
2. At 07:00 London (09:00 Doha, 02:00 New York): buy stop at 4,461.28, sell stop at 4,423.50. Size for 1% risk on a 37.78 USD stop.
3. At **08:30 London = 10:30 Doha = 03:30 New York** price broke below the box: **sold at 4,423.50.** Buy stop cancelled. Stop loss at 4,461.28.
4. Price never came back to the stop. At **16:00 New York = 23:00 Doha** the trade was closed at **4,327.07**.
5. Result: 96.43 USD per ounce, minus 0.40 USD cost = 96.03 USD per ounce, **+2.54 R** (about +254 USD on a 10,000 USD account at exactly 1% risk; with the rounded-down 2 ounces from 3.7, +192 USD).

**Losing example: Friday 28 Aug 2026 (summer time).** Box 4,571.09 - 4,609.69 (38.60 USD). Bought at the Box High at 07:57 London (09:57 Doha,
02:57 New York). At **10:05 New York (17:05 Doha)**, just after a 10:00 US news release, price fell through the Box Low: **stopped at 4,571.09, -1.01 R.**

You can check both days on any 1-minute gold chart; your broker's prices will differ by a few cents.

#### 3.11 Checklist before every trade (tick all)
- [ ] Today is a normal weekday (not a holiday or short day), and my platform has had prices without gaps since 18:00 New York.
- [ ] I know today's clock: UK summer or winter (for the box and orders) and US summer or winter (for the 16:00 New York close).
- [ ] I marked Box High and Box Low from the 1-minute candles of 00:00-06:59 London.
- [ ] Box size is at least 8 USD (or 20 x my broker's round-trip cost).
- [ ] Buy stop at Box High and sell stop at Box Low placed at 07:00 London, each sized for 1% risk (rounded down).
- [ ] When one fills, I cancel the other at once and place the stop at the opposite side of the box.
- [ ] No target. I will not move the stop.
- [ ] If nothing fills by 11:59 London, I cancel both orders.
- [ ] I will close the trade at 16:00 New York (23:00 or 00:00 Doha), whatever it shows.
- [ ] This is my only trade today.

---

### 4. Known weaknesses (read these before trading it)
- **The hidden test was weak and about break-even.** On 2016-2018 it made +1.9 R on 81 trades, which could easily be luck. It lost money there at
  double cost. The strong numbers come from the years the rules were built on.
- **The profit depends on big US news days that cannot be filtered in advance.** In 2019-2026, days with a big US news reaction made +87 R;
  all other days together made about +3 R. The news does not go the same way as London's break more often than a coin flip; a trade with no target
  simply wins big on big days. If gold goes quiet, expect a long flat or losing stretch.
- **Long flat stretches.** Over 2 years without a new account high (Apr 2022 - May 2024), and 13 months (Jun 2025 - Jul 2026). You need patience
  and money you can leave alone through that.
- **It struggled in calmer, falling gold:** -7.2 R from Oct 2022 to Sep 2023; 2025 -2.3 R; 2017 -2.8 R; 2019 -1.5 R.
- **Two weekdays carry it.** Monday and Thursday made +84 of the +92 R; the other three days were about flat. This did not repeat in the hidden years.
- **Drops and losing runs:** worst drop 18 R (about 17% of the account at 1% risk). Win rate under 50%: runs of 5-8 losses are normal.
- **Trade count depends on the gold price.** With gold above 2,500 USD almost every day qualifies (about 130-190 trades a year). If gold fell back to
  1,500 USD, most days would be skipped.
- **Picked from many ideas.** Agent 1 ran 82 declared checks and v3 was the best; part of its design-year edge may be luck from that search.
- **Late nights in Doha.** The forced close is 23:00 or midnight Doha. If you cannot be there, set an automatic close (time-based) on your platform,
  or the trade will run past the rules.
- **Data:** the test used free bid-only prices. Your broker's prices, spread and fills will differ a little.

---

### 5. Before you use it: your own checks
1. **Backtest it yourself by hand.** Pick 20-30 days from `backtest/trades_v3.csv` (columns: date, Doha and New York entry time, direction,
   box high/low, entry, stop, exit, R). Open your broker's 1-minute gold chart, mark the box, and check that you get the same trade and
   roughly the same result. Include some losing days and some "no trade" days from `backtest/days_v3.csv`.
2. **Then test on new days (from Oct 2026), by hand, before trading them.** This is the honest test nobody has done yet.
3. **Demo first:** trade it on a demo account for at least 3-6 months (about 50-100 trades at current gold prices). Use the upgrade and
   downgrade rules in the grade box at the top.
4. **Check your broker's cost.** If the spread + commission for a round trip is more than 0.40 USD, raise the minimum box to 20 x your cost.
5. Only after that, decide yourself whether to go live, with 1% risk per trade or less.

*Past results do not guarantee future results. Trading carries a real risk of loss. This is not financial advice.*

---

<a id='gbpusd'></a>

## GBPUSD: Final strategy for this round, "Quiet-Asia breakout" (v3)

Prepared by Agent 2 (Backtest & Performance Manager), 10 Oct 2026 (corrected the same day; see the note below the grade box).
Written for someone who has never seen the strategy.

> ## Grade: **C: Experimental** (not proven, not promising on unseen data)
> **What C means:** the only evidence that it works comes from the price data the rules were built on. On price data nobody had seen
> when the rules were written, it **lost money**. It is the best GBPUSD idea tested so far, which is why you still get it, but it is
> **for study and demo trading only, not for real money.** My test verdict was **DROP**.
>
> **The evidence in five lines:**
> - On the 3 years nobody had seen (2016-2018): 136 trades, **-6.3 R** (about -6% of the account). Only 1 of 3 years positive
>   (2016 -9.5 R, 2017 -3.0 R, 2018 +6.2 R). Worst drop from a peak: 16.0 R (about 16%). Longest losing run: 8.
> - At double cost (3 pips instead of 1.5), those 3 years lose **17.4 R**.
> - On the 7.75 years the rules were built on (2019 - Sep 2026) it made +39.4 R, but it was picked as the best of 47 ideas tested on
>   those years, so that number flatters it.
> - The same rules on **EURUSD** (a close cousin of the pound) lost **41.5 R** over 2019-2026 (Agent 1's test).
> - **The result is fragile:** a one-hour clock error in about 12 weeks of the 2016-2018 data changed 22 of the 136 trades and moved
>   the hidden result from +8.4 R to -6.3 R. When so few trades decide whether a strategy wins or loses, there is no reliable edge.
>
> **What would upgrade it (to B):** at least 50 new demo trades (about 15 months at this pace), at your real broker cost, positive at
> more than +0.10 R per trade, with no losing run longer than 8. Even then it would stay "promising", not proven.
> **Stop the demo (drop it for good):** a losing run of **9 or more**, or any calendar quarter worse than **-9.8 R** (the worst seen,
> Oct-Dec 2016), or an all-in broker cost above 1.5 pips per trade at 07:00 London.

> **Correction note (10 Oct 2026):** the first version of this document (grade B) used a 2016-2018 price file whose clock was one hour
> late in the 2-3 weeks a year when the US and UK change their clocks on different dates. The team leader fixed the file and the test was
> re-run. Corrected: 136 trades, -6.3 R (before: 139 trades, +8.4 R). The 2019-2026 results did not change. All numbers below are corrected.

*Past results do not guarantee future results. Trading carries a real risk of loss. This is not financial advice.*

---

### 1. Why it might work (the idea in plain words)
During the Asian night the pound usually moves in a box of about 25-40 pips. Some nights it is unusually quiet, with a box much smaller
than normal. When London opens (07:00 London time), the big banks and funds arrive, and the idea is that after a quiet night the price
breaks out of the night's box and keeps going.

The strategy does not guess the direction. It places two waiting orders: one to **buy** if price rises above the night's high, and one to
**sell** if price falls below the night's low. Whichever is triggered first is the trade, and the other order is cancelled. The stop loss
is the other side of the box, so it is small; the take profit is twice the stop distance.

Honest note: it wins only about **4 trades in 10** (about 3.5 in 10 on the unseen years). It needs a win rate of about 36% just to
break even after costs, because each win is about +1.9 R and each loss about -1.1 R. On 2019-2026 it was above that; on 2016-2018 it
was below. Because the stop is small (typically 18 pips), the trading cost (1.5 pips) takes about 0.08 R from every trade.
On the unseen years, "quieter night = better trade" did **not** hold: every level of quietness lost money.

---

### 2. Backtest results

**How it was tested:** a computer program walked through every minute of GBPUSD price data (1-minute candles, HistData bid prices) from
Jan 2016 to Sep 2026, following the rules below exactly. Every trade has a **cost of 1.5 pips** (spread and slippage) taken off. If the stop
and the target were both touched in the same minute, the test counted the stop. 1 R = the 1% of the account risked per trade. The trade
list is in `backtest/trades_v3.csv` (date, Doha / New York / London time, direction, entry, stop, target, exit, result), so you can check
any trade by hand. The test program was written independently of the researcher's; on the 296 days both programs trade, every trade matches.

**Periods:** **hidden** = 2016-2018, not used to build the rules (the real test). **design** = 2019 - Sep 2026, used to build the rules.

| Period | Trades | Win rate | Avg win / avg loss | Total | Per trade | Profit factor* | Biggest drop | Longest losing run | Total at 3-pip cost |
|---|---|---|---|---|---|---|---|---|---|
| 2016 (hidden) | 44 | 30% | +1.80 / -1.06 R | **-9.5 R** | -0.22 R | 0.71 | -10.4 R | 8 | -12.2 R |
| 2017 (hidden) | 51 | 35% | +1.84 / -1.09 R | **-3.0 R** | -0.06 R | 0.92 | -10.9 R | 6 | -7.6 R |
| 2018 (hidden) | 41 | 41% | +1.91 / -1.09 R | **+6.2 R** | +0.15 R | 1.24 | -5.4 R | 3 | +2.4 R |
| 2019 (design) | 45 | 31% | +1.89 / -1.08 R | -7.2 R | -0.16 R | 0.79 | -9.2 R | 5 | -12.3 R |
| 2020 (design) | 46 | 39% | +1.86 / -0.97 R | +6.3 R | +0.14 R | 1.23 | -6.7 R | 8 | +3.2 R |
| 2021 (design) | 36 | 42% | +1.80 / -1.04 R | +5.2 R | +0.14 R | 1.24 | -5.5 R | 5 | +2.2 R |
| 2022 (design) | 36 | 50% | +1.86 / -1.00 R | +15.5 R | +0.43 R | 1.86 | -3.3 R | 4 | +13.3 R |
| 2023 (design; Feb-Jul data holes) | 17 | 47% | +1.90 / -1.08 R | +5.5 R | +0.33 R | 1.57 | -5.3 R | 5 | +4.1 R |
| 2024 (design) | 41 | 44% | +1.81 / -1.12 R | +6.9 R | +0.17 R | 1.27 | -7.8 R | 7 | +2.0 R |
| 2025 (design) | 42 | 45% | +1.86 / -1.08 R | +10.6 R | +0.25 R | 1.43 | -4.5 R | 4 | +7.4 R |
| 2026 Jan-Sep (design) | 33 | 33% | +1.84 / -1.08 R | -3.4 R | -0.10 R | 0.86 | -6.2 R | 4 | -6.5 R |
| **All hidden 2016-2018** | **136** | **35%** | +1.85 / -1.08 R | **-6.3 R** | **-0.05 R** | 0.93 | **-16.0 R (-15.7%)** | **8** | **-17.4 R** |
| All design 2019 - Sep 2026 | 296 | 41% | +1.85 / -1.05 R | +39.4 R | +0.13 R | 1.21 | -11.4 R (-11.2%) | 8 | +13.4 R |
| All 10.75 years | 432 | 39% | +1.85 / -1.06 R | +33.1 R | +0.08 R | 1.12 | -18.6 R (-18.5%) | 8 | -4.1 R |

*Profit factor = money won ÷ money lost. Above 1 means profit; below 1 means loss; 1.5 or more is solid.

**How likely is a real edge?** Resampling the trades 10,000 times: on the hidden years there is about a **2 in 3 chance the real average
is zero or less**. Over all 10.75 years together it is about 1 in 7, and that includes the design years, which flatter it.

**How fragile is it?** The clock correction (one hour, in roughly 12 weeks spread over 3 years) changed 22 hidden trades: 11 trades
disappeared (mostly winners), 8 new ones appeared (7 of them losers) and 3 moved. That swung the hidden result by 14.7 R. The reason:
moving the night box by one hour changes which nights count as "quiet", and the 20-day "normal night" carries the change forward for
about a month. A real edge should not flip from profit to loss on such a small change.

**Losing streaks:** streaks of 3 or more losses in a row happened 12 times in the 3 hidden years and 38 times in 10.75 years. The longest
was 8 (twice: once in 2016, once in 2020). Expect several runs of 4-6 losses every year.

**Buying vs selling:** all years: longs +15.1 R (215 trades), shorts +18.0 R (217). Hidden years: longs **-4.8 R** (64), shorts **-1.5 R** (72).

**By weekday (all 10.75 years):** Mon +0.2 R (74 trades), Tue -2.2 R (95), **Wed +34.8 R** (88), **Thu +18.6 R** (82), **Fri -18.4 R** (93).
Hidden years: Mon -1.0, Tue -3.4, Wed +7.5, Thu +6.4, **Fri -15.8 R** (30 trades, only 20% wins). Without Wednesdays, all 10.75 years
together are about zero (-1.7 R on 344 trades). The rules do not filter weekdays, because this was found after the test.

**How trades ended (all years):** target reached 160 trades (37%), +306.1 R; stop hit 254 (59%), -276.1 R; closed at 15:59 New York
18 (4%), +3.1 R.

**When the orders were filled:** 86% of trades are filled in the first London hour (07:00-07:59 London), about half in the first 15 minutes.
Only 4 of 432 fills were at a worse price than the box edge because price jumped past it.

**News days:** US jobs report (NFP) and US interest-rate decision (FOMC) days were traded like any other day. All years: 47 trades, +0.9 R
(about zero); hidden years: 14 trades, -3.2 R. Skipping them is your choice; the rules do not require it.

**Brexit vote (June 2016), reported separately:** on 23 June 2016 (vote day) and 24 June (result night, when the pound fell more than
1,600 pips during Asia) the night was not quiet, so **no trade** either day. The 7 Oct 2016 "flash crash" night was also skipped.
After the vote, nights stayed wild for weeks, so the 20-day "normal" was very high and July 2016 had 7 trades with wide stops (34-50 pips):
together -2.3 R. Hidden total without 23 Jun - 31 Jul 2016: still **-5.0 R**, so Brexit does not explain the loss.

**Worst stretches:** worst quarter Oct-Dec 2016 (-9.8 R), then Oct-Dec 2019 (-6.2 R); worst month Aug 2021 (-5.5 R); worst week -5.5 R.
Fewer than half of the months with a trade were positive (55 of 116). Of the 90 hidden weeks with a trade, 51 lost money.

**Missing data:** the 2019-2026 file has holes on most days from Feb to Jul 2023, so those days were skipped. The first 20 days of each file
were skipped (warm-up for the 20-day median). The 2016-2018 file is clean.

#### Week-by-week table, Jan 2016 - Sep 2026

*The full week-by-week table is in `TRADING-RESULTS.xlsx` (one sheet per market).*

### 3. Step by step, A to Z

#### 3.1 Clocks
The rules use **London's clock** for the night box and the order window, and **New York's clock** for the forced close.
Doha never changes its clock, but the UK and the US do:
- **UK summer time:** last Sunday of March to last Sunday of October (London = Doha - 2 hours). **UK winter time:** the rest (London = Doha - 3 hours).
- **US summer time:** 2nd Sunday of March to 1st Sunday of November. **US winter time:** the rest.

| Step | London | New York (normal weeks) | Doha, UK summer (late Mar - late Oct) | Doha, UK winter (late Oct - late Mar) |
|---|---|---|---|---|
| Night box: watch, do nothing | 00:00 - 06:59 | 19:00 (evening before) - 01:59 | 02:00 - 08:59 | 03:00 - 09:59 |
| Place both orders | 07:00 | 02:00 | 09:00 | 10:00 |
| Cancel any unfilled order | 12:00 (end of the 11:59 candle) | 07:00 | 14:00 | 15:00 |

| Forced close (any open trade) | New York | Doha, US summer (2nd Sun Mar - 1st Sun Nov) | Doha, US winter |
|---|---|---|---|
| Close at the end of the 15:59 candle | 16:00 | 23:00 | 00:00 (midnight) |

**The "odd" weeks (2-3 a year):** from the 2nd to the last Sunday of March, and from the last Sunday of October to the 1st Sunday of
November, the US is on summer time but the UK is not. In those weeks London is only 4 hours ahead of New York: the box is 20:00 - 02:59
New York, orders go in at 03:00 New York and expire at 08:00 New York. **The Doha times do not change** in those weeks: use the
"UK winter" column (box 03:00 - 09:59, orders 10:00, expiry 15:00) and the "US summer" forced close (23:00 Doha).
Simplest: put a London clock on your phone or chart and always follow it for the box and the orders.

#### 3.2 Which days to trade
- Any Monday to Friday. **One trade per day at most.**
- **Do not trade** on short days and holidays (Christmas Day, New Year's Day, and any day your chart shows clearly fewer candles than
  normal), or when your chart has a hole of more than 15 minutes between 19:00 New York the evening before and 16:00 New York.
- News days (US jobs report, US rate decision, UK data) were **traded** in the test. Skipping them is your choice.
- **Fridays:** in the test, Friday trades lost money in both periods (all years: 96 trades, -18.6 R). The rules still trade Fridays,
  because this was found after the test. If you want to skip Fridays, decide that **before** you start demo trading and keep to it.

#### 3.3 Every day: build the "normal night" list (5 minutes)
Chart: **GBPUSD, 1-minute candles** (a 5-minute chart gives the same high and low).
Keep a simple spreadsheet with one row per weekday: date, Asia High, Asia Low, **Asia range in pips** = (High - Low) × 10,000.
- **Asia box** = the highest high (Asia High) and lowest low (Asia Low) of all candles from **00:00 to 06:59 London time**.
- **Normal night** = the **median** of the Asia ranges of the **previous 20 weekdays** (not today). Median = put the 20 numbers in order and
  take the average of the 10th and 11th. In a spreadsheet: `=MEDIAN(` the 20 cells above `)`.
- Count every previous weekday whose box you can see in full, including holidays like Good Friday. Skip a day only if your chart has a hole
  in it during the box. You need 20 days before the first trade.

#### 3.4 Before 07:00 London: is tonight quiet? (the setup)
- **Quiet** = today's Asia range is **smaller than 0.7 × the normal night**. Example: normal night 26.8 pips → 0.7 × 26.8 = 18.8 pips.
  Today's box is 16.7 pips → quiet → trade today. If it is 18.8 pips or more → **no trade today**, close the chart.

#### 3.5 At 07:00 London (09:00 Doha in UK summer / 10:00 Doha in UK winter): place two orders
- **Buy stop** at the **Asia High**, with stop loss at the **Asia Low**, take profit at **Asia High + 2 × (Asia High - Asia Low)**.
- **Sell stop** at the **Asia Low**, with stop loss at the **Asia High**, take profit at **Asia Low - 2 × (Asia High - Asia Low)**.
- **Position size** for each order (so the stop costs 1% of the account):
  size in lots = (1% of balance) ÷ (box size in pips × value of 1 pip per lot). For GBPUSD, 1 pip on 1 standard lot is about 10 USD.
  Example: balance 10,000 USD, risk 100 USD, box 16.7 pips → 100 ÷ (16.7 × 10) = **0.60 lots**.
- If the box is under 3 pips, do not trade (never happened in 10.75 years; the smallest was 5.9 pips).

#### 3.6 Wait for the confirmation: the first order to be filled
- The confirmation **is** the fill: price trades beyond one side of the box. There is no other signal to wait for.
- **As soon as one order fills, cancel the other one.** (Many platforms let you link them as "one cancels the other", OCO.)
- If price jumps past the level, your fill may be a little worse than the box edge; keep the stop and target where they are calculated
  from the actual fill price (target = fill ± 2 × distance from fill to stop).
- If both sides are broken within the same minute, the test took no trade (happened 3 times in 10.75 years).
- **If nothing fills by 12:00 London** (14:00 Doha UK summer / 15:00 Doha UK winter), cancel both orders. No trade today.

#### 3.7 Stop loss and take profit (already attached to the orders)
- **Long (bought at Asia High):** stop = Asia Low; target = entry + 2 × (entry - Asia Low).
- **Short (sold at Asia Low):** stop = Asia High; target = entry - 2 × (Asia High - entry).
- A stop-out costs about -1.1 R after costs; a target is about +1.9 R.

#### 3.8 Managing the trade
- **Do nothing.** No break-even move, no partial profits, no moving the stop or target. The test did none of this.

#### 3.9 Closing time and daily limits
- **Close any open trade at 16:00 New York** (end of the 15:59 candle) = **23:00 Doha in US summer time, 00:00 midnight Doha in US winter time.**
  Never hold overnight. In the test only 4% of trades were still open by then.
- **One trade per day.** After it closes (stop, target or 16:00 New York), stop for the day.

#### 3.10 Worked example: Tuesday 23 June 2026 (UK and US summer time)
- **Box (00:00 - 06:59 London = 02:00 - 08:59 Doha = 19:00 - 01:59 New York):** Asia High **1.32496**, Asia Low **1.32329**,
  range **16.7 pips**.
- **Normal night:** median of the previous 20 weekdays' ranges = **26.8 pips**; 0.7 × 26.8 = 18.8. 16.7 < 18.8 → **quiet, trade today**.
- **07:00 London (09:00 Doha, 02:00 New York):** buy stop 1.32496 (stop 1.32329, target 1.32830); sell stop 1.32329 (stop 1.32496,
  target **1.31995**). Size for 1% risk on 10,000 USD: 100 ÷ (16.7 × 10) = 0.60 lots.
- **07:37 London (09:37 Doha, 02:37 New York):** price fell below 1.32329 → **sold at 1.32329**. Buy stop cancelled.
- **15:36 London (17:36 Doha, 10:36 New York):** the target **1.31995** was reached. +33.4 pips - 1.5 pips cost = 31.9 pips ÷ 16.7 = **+1.91 R**.
- For contrast, the next day (Wed 24 June 2026) was also quiet: bought at 1.32043 at 07:10 London (09:10 Doha) and stopped out at 1.31867
  at 07:57 London (09:57 Doha): **-1.09 R**.

#### 3.11 Checklist before every trade (tick all)
- [ ] Monday to Friday, not a holiday or short day, no hole in my chart from 19:00 New York yesterday to now.
- [ ] Asia box (00:00 - 06:59 **London**) marked: High ______ Low ______ Range ______ pips.
- [ ] Normal night (median of the previous 20 weekdays) = ______ pips. 0.7 × normal = ______.
- [ ] Today's range is **smaller** than 0.7 × normal. (If not: no trade today.)
- [ ] It is 07:00 London (09:00 Doha UK summer / 10:00 Doha UK winter). No trade taken yet today.
- [ ] Buy stop at Asia High and sell stop at Asia Low placed, each with its stop (other side) and target (2 × box), linked as one-cancels-the-other.
- [ ] Size = 1% risk on the box size. My broker's spread + commission is not more than 1.5 pips.
- [ ] Alarm at 12:00 London to cancel unfilled orders (14:00 / 15:00 Doha).
- [ ] Alarm at 16:00 New York to close the trade if still open (23:00 Doha US summer / 00:00 Doha US winter).

---

### 4. Known weaknesses (read these before trading it)
1. **It lost money on the unseen years.** 2016-2018: -6.3 R on 136 trades, only 2018 positive. Roughly a 2 in 3 chance the real edge
   is zero or less. At 3 pips cost the unseen years lose 17.4 R.
2. **It is fragile.** A one-hour clock shift in about 12 weeks of data changed 22 trades and moved the unseen result by 14.7 R
   (from +8.4 R to -6.3 R). The answer depends on a handful of trades.
3. **It failed on EURUSD:** the same rules lost 41.5 R over 2019-2026 there, so the "quiet night, then breakout" idea is not a general
   market habit. If it works at all, it may be pound-specific, or the 2019-2026 profit may be partly luck.
4. **The main reason to believe in it did not repeat.** On 2019-2026, the quieter the night, the better the trade. On 2016-2018 every
   level of quietness lost money.
5. **The edge is very sensitive to cost.** The stop is small (typically 18 pips), so 1.5 pips of cost is about 0.08 R per trade.
   Over all 10.75 years at 3 pips cost it loses (-4.1 R).
6. **Wednesday and Thursday carry all the profit.** Over all years, Monday + Tuesday + Friday together lost 20.3 R; Wednesday + Thursday
   made +53.4 R. Fridays lost in both periods (all years -18.4 R). There is no clear reason for this, so it may not last.
7. **Losing years happen often:** 2016, 2017, 2019 and 2026 so far were negative (4 of 11 years). With only about 40 trades a year, a whole
   year can be negative by chance. Fewer than half of the months with a trade are positive.
8. **Early-morning fills:** about half the trades fill in the first 15 minutes of the London open, when spreads can be wider at some brokers.
   The test used bid prices; on a real chart a buy stop triggers on the ask price, about one spread earlier, so a few trades may differ.
9. **It was the best of 47 ideas tried in this round.** Picking the best of many makes it look better than it is on the data it was picked on.
10. **Data:** one free data source (HistData bid prices), whose older files needed a clock correction. Your broker's prices will differ
    slightly, which can change individual trades, and this test shows that small changes can matter.

---

### 5. Before you use it: your own checks
Grade C means: **do not trade it with real money.** If you want to follow it anyway, treat it as a study:
1. **Check your broker's cost** for GBPUSD at 07:00 - 08:00 London: spread plus commission per round trip. If it is more than 1.5 pips,
   do not bother: the test says it does not survive higher costs.
2. **Repeat the backtest by hand** on at least 20 trades from the list (`backtest/trades_v3.csv`), including 23 June 2026 above: same box,
   same "quiet" decision, same direction, similar entry, stop and target on your broker's chart. Note any differences. Also check a few
   days the test did **not** trade (`backtest/days_v3.csv` gives the reason for every day). Include some days in 2016-2018.
3. **Demo-trade only** (a practice account, no real money), following the checklist exactly. It trades about once a week, so it takes
   about 15 months to collect 50 trades. Expect losing runs of 4-8 trades. Compare with the test: about 4 wins in 10, wins near +1.9 R,
   losses near -1.1 R.
4. Only with clearly positive demo results (see the upgrade rule in the grade box) would it become worth a second look.

*Past results do not guarantee future results. A strategy that made money in the past can lose money in the future.
Trading carries a real risk of loss. This is not financial advice.*

---

<a id='eurusd'></a>

## EURUSD: Final strategy for this round, "Euro-vs-pound gap fade" (v3, called "Euro-only move fade" by the research team)

Prepared by Agent 2 (Backtest & Performance Manager), 10 Oct 2026. Written for someone who has never seen the strategy.

> ## Grade: **C: Experimental** (not proven, not promising on unseen data)
> **What C means:** it made money only on the price data that was used to build the rules. On the 3 years that nobody had seen,
> it **lost money**. It is **not** a proven strategy (grade A) and not a promising one (grade B). My test verdict was **DROP**.
> It is handed over only because every round must end with the best EURUSD rule tested so far. **Do not trade it with real money.**
>
> **The evidence in five lines:**
> - On the 3 years nobody had seen (2016-2018): **63 trades, -2.4 R, 44% won**. Only 2016 made money (+5.6 R); 2017 lost 7.9 R,
>   2018 was flat (-0.1 R). With double trading costs those years lose 6.1 R.
> - On the 8 years the rules were built on (2019 - Sep 2026): 226 trades, +41.9 R, 6 of 8 years positive. That looks good, but it was
>   the best of 110 ideas tried on that same data, so part of it is luck.
> - Longest losing run 8 trades (hidden years). Worst drop from a peak: 11.1 R (about 11% of the account), all of it in 2016-2018.
> - Buying held up on unseen data (+5.5 R on 23 trades); **selling lost 7.9 R**, nearly all in 2017 while the euro rose all year.
> - It trades rarely: about 2 trades a month. Even a real edge would take years to show itself.
>
> **What would upgrade it to B:** at least 50 new trades from Oct 2026 on (your own backtest of new months and demo trading; that is
> about 2 years at this pace) that are positive at **+0.10 R per trade or better**, and still positive at 2.4 pips cost.
> **What would rule it out completely:** a drop of more than **12 R** from a peak (worse than anything in 11 years), or
> **10 losses in a row** (the worst seen is 8).

*Past results do not guarantee future results. Trading carries a real risk of loss. This is not financial advice.*

---

### 1. Why it might work (the idea in plain words)
The euro (EURUSD) and the British pound (GBPUSD) are both priced against the US dollar, and most days they move together,
because most of their moves come from the dollar. Over the European morning (03:00 to 10:00 New York time, which is the London
morning) they sometimes drift apart by an unusual amount: one moves a lot, the other hardly moves.

The research team's idea: such a gap is often a one-sided flow (orders or news in one currency only), and in Europe's last trading
hours (10:00 to 12:00 New York is 15:00 to 17:00 London, with the 4 pm London fix and the London close) part of the gap closes again.
The strategy trades EURUSD in the direction that **closes the gap**:
- If the euro did **better** than the pound over the morning, **sell** EURUSD.
- If the euro did **worse** than the pound, **buy** EURUSD.

Two honest notes from the test:
- In about 3 trades out of 4, it was actually the **pound** that moved and the euro that stayed still. So most trades are a bet
  that the euro **catches up with an earlier pound move** in the afternoon, rather than the euro giving back its own move.
- The trade is only taken once the move has visibly stalled (price has already come back a bit from its morning extreme), with the
  stop just beyond that extreme. If the extreme breaks, the idea was wrong.

---

### 2. Backtest results

**How it was tested:** a computer program walked through every minute of EURUSD and GBPUSD price data (1-minute candles, from
HistData) from Jan 2016 to Sep 2026, following the rules below exactly. Every trade has a **cost of 1.2 pips** taken off (spread and
slippage). If the stop was touched in the last minute before the 16:00 close, the stop counted. 1 R = the 1% of the account risked.
The trade list is in `backtest/trades_v3.csv` (column `period`: H = hidden, D = design), so you can check any trade by hand.
`backtest/days_v3.csv` shows every day, why it was or was not traded, and that day's threshold and ATR.

**Periods:** 2016-2018 were **hidden** (nobody had looked at them; this is the real test). 2019 - Sep 2026 were used to build the rules.
Each period needs about 100 trading days of history before the first trade: trades start 23 May 2016 and 1 Apr 2019.

#### Key numbers (1.2 pips cost)
| Period | Trades | Win rate | Avg win / avg loss | Total | Per trade | Profit factor* | Biggest drop | Longest losing run |
|---|---|---|---|---|---|---|---|---|
| **Hidden 2016-2018** (the real test) | 63 | 44.4% | +0.99 / -0.86 R | **-2.4 R** | **-0.04 R** | 0.92 | -11.1 R (-10.7%) | 8 |
| Design 2019 - Sep 2026 | 226 | 50.4% | +1.10 / -0.74 R | +41.9 R | +0.19 R | 1.50 | -8.4 R (-8.1%) | 6 |
| All, May 2016 - Sep 2026 | 289 | 49.1% | +1.08 / -0.77 R | +39.6 R | +0.14 R | 1.35 | -11.1 R (-10.7%) | 8 |

*Profit factor = money won ÷ money lost. Above 1 means profit; 1.1 is thin, 1.5 or more is solid. Below 1 means it lost.

#### Per year (1.2 pips cost)
| Year | Trades | Win rate | Total | Per trade | Profit factor | Biggest drop | Longest losing run |
|---|---|---|---|---|---|---|---|
| 2016 (hidden, from May) | 18 | 44% | **+5.6 R** | +0.31 R | 1.66 | -4.0 R | 5 |
| 2017 (hidden) | 27 | 41% | **-7.9 R** | -0.29 R | 0.46 | -8.5 R | 8 |
| 2018 (hidden) | 18 | 50% | **-0.1 R** | -0.00 R | 0.99 | -3.4 R | 3 |
| 2019 (from May) | 23 | 52% | +9.7 R | +0.42 R | 2.69 | -1.7 R | 2 |
| 2020 | 39 | 44% | +13.2 R | +0.34 R | 1.89 | -5.2 R | 6 |
| 2021 | 20 | 50% | +0.9 R | +0.04 R | 1.12 | -3.8 R | 4 |
| 2022 | 63 | 54% | +5.1 R | +0.08 R | 1.21 | -6.5 R | 5 |
| 2023 (Feb-Jul data missing) | 5 | 40% | -0.5 R | -0.11 R | 0.73 | -1.3 R | 2 |
| 2024 | 27 | 67% | +9.6 R | +0.35 R | 2.58 | -3.0 R | 3 |
| 2025 | 32 | 41% | -4.2 R | -0.13 R | 0.72 | -8.4 R | 5 |
| 2026 (Jan-Sep) | 17 | 47% | +8.2 R | +0.48 R | 2.03 | -3.4 R | 3 |

#### Other splits
- **Higher costs** (total R at 0 / 1.2 / 2.4 pips): hidden +1.4 / -2.4 / **-6.1**; design +54.2 / +41.9 / +29.6.
  At 2.4 pips: hidden 1 of 3 years positive, design 5 of 8.
- **Buying vs selling:** hidden longs 23 trades +5.5 R, shorts 40 trades **-7.9 R** (2017 shorts alone -9.6 R).
  Design longs 112 trades +30.4 R, shorts 114 trades +11.6 R. All years: longs +35.9 R, shorts +3.7 R.
- **Without the best trades:** hidden without its best 5 trades: -15.0 R. Design without its best 5: +20.4 R.
- **Chance the true average is zero or less** (a statistics check that reshuffles the trades): hidden 62%, design 1%.
  The design figure does not allow for the 110 ideas tried on the same data.
- **How trades ended:** hidden: closed at 16:00 New York 39 (62%) +23.4 R, stop hit 24 (38%) -25.7 R. Design: 16:00 close 163 (72%)
  +109.0 R, stop 63 (28%) -67.1 R. Stops were 11-68 pips (median 21) on hidden data, 7-78 pips (median 24) on design data.
- **Weekday** (trades, R): hidden Mon 11 +0.4, Tue 14 -0.4, Wed 8 +0.6, Thu 14 -0.1, **Fri 16 -2.8**; design Mon 36 +9.6,
  Tue 40 -0.3, Wed 49 +2.8, Thu 59 +16.9, Fri 42 +13.0. The best days are not the same in the two periods.
- **US summer vs winter time:** hidden summer 46 trades +0.3 R, winter 17 trades -2.6 R; design summer 152 trades +37.3 R, winter
  74 trades +4.6 R.
- **News days** (days with a big 08:30 New York price jump, e.g. US jobs or inflation reports; no exact calendar was available):
  hidden 10 trades -0.6 R, normal days 53 trades -1.7 R; design 42 trades +6.9 R, normal days 184 trades +35.1 R. No clear difference.
- **Entering 1 minute late** (at 10:01): hidden +1.8 R, design +37.2 R (instead of -2.4 / +41.9). Timing matters.
- **Half-years positive:** 12 of 21. Hidden months positive: 8 of 25.
- **Side-check (not used for the grade):** the same rules with a looser threshold (65th instead of 75th percentile) gave 96 hidden
  trades, -0.6 R, with a losing run of 12. It does not fix anything.

#### Data notes
- Feb - Jul 2023: the price files have holes on most days, so those days were skipped (131 thin days and 11 days with holes in the
  design data). The hidden 2016-2018 data is clean (3 thin days, no holes).
- The research team's own quick check gave 228 design trades, +41.9 R. This independent test found 226 of those 228 trades exactly
  (same day, direction, stop and result); the other 2 (Aug and Sep 2023, together +0.01 R) depend on how the data holes are counted.

#### Week-by-week table, Jan 2016 - Sep 2026

*The full week-by-week table is in `TRADING-RESULTS.xlsx` (one sheet per market).*

### 3. Step by step, A to Z

#### 3.1 Clocks (all rule times are New York time)
The US moves its clocks; Doha does not. **US summer time** runs from the 2nd Sunday of March to the 1st Sunday of November
(Doha = New York + 7 hours). The rest of the year is **US winter time** (Doha = New York + 8 hours).

| Step | New York | Doha (US summer time) | Doha (US winter time) |
|---|---|---|---|
| A "trading day" starts (also the daily-candle start) | 17:00 the evening before | 00:00 | 01:00 |
| Note the two "start" prices (close of the 02:59 candle) | 02:59 → 03:00 | 09:59 → 10:00 | 10:59 → 11:00 |
| The morning window runs | 03:00 – 09:59 | 10:00 – 16:59 | 11:00 – 17:59 |
| Check the setup and enter | 10:00 | 17:00 | 18:00 |
| Close anything still open (close of the 15:59 candle) | 16:00 | 23:00 | 00:00 (midnight) |

#### 3.2 Which days to trade
Any Monday to Friday, at most **one trade a day**. **Do not trade:**
- Holidays and short days, when the market is half empty: 25 December, 1 January, and any day your EURUSD or GBPUSD chart is mostly flat or empty.
- Any day when your EURUSD chart has a hole of more than 15 minutes between 19:00 New York the evening before and 16:00 New York,
  or your GBPUSD chart has one between 03:00 and 10:00 New York.
- News days were traded in the test (no clear difference). Skipping them is your choice.

#### 3.3 What you need: two charts and one spreadsheet
**Charts:** EURUSD and GBPUSD, **1-minute candles**, set so you can read New York time (or convert from Doha time with the table above).

**The spreadsheet (one row per trading day).** The rules need two numbers that you cannot see on a chart: the **threshold** (how big a
euro-vs-pound gap is "unusual") and the **ATR20** (EURUSD's normal daily range). A spreadsheet works them out for you:

| Column | What to type or calculate | Example (5 Feb 2026) |
|---|---|---|
| A Date | the trading day | 05-Feb-2026 |
| B E0 | EURUSD close of the **02:59 New York** candle | 1.17989 |
| C G0 | GBPUSD close of the **02:59 New York** candle | 1.36200 |
| D E1 | EURUSD close of the **09:59 New York** candle | 1.17979 |
| E G1 | GBPUSD close of the **09:59 New York** candle | 1.35362 |
| F Euro move | `=D/B-1` | -0.0085% |
| G Pound move | `=E/C-1` | -0.6153% |
| H **Gap** | `=F-G` | **+0.6068%** |
| I Gap size | `=ABS(H)` | 0.6068% |
| J **Threshold** | `=PERCENTILE.INC(I of the 250 rows above this one, 0.75)` (leave blank if fewer than 100 rows above) | **0.2100%** |
| K Day high | EURUSD highest price of the trading day (17:00 → 17:00 New York) | (fill in after 17:00 New York) |
| L Day low | EURUSD lowest price of the trading day | |
| M Day range (pips) | `=(K-L)*10000` | |
| N **ATR20** (pips) | `=AVERAGE(M of the 20 rows above this one)` | **82.9** |
| O Morning high | EURUSD highest price 03:00 – 09:59 New York | 1.18218 |
| P Morning low | EURUSD lowest price 03:00 – 09:59 New York | 1.17802 |

How to fill it:
- Rows **B to E** are filled in during the day (at 10:00/11:00 Doha and at 17:00/18:00 Doha). **K, L, M** are filled in after the trading
  day ends (17:00 New York = 00:00/01:00 Doha). Leave holiday or half-empty days (25 Dec, 1 Jan, etc.) out of the ATR (column M blank).
- A daily candle on a broker that uses "New York close" daily candles (most MetaTrader brokers with server time GMT+2/GMT+3) gives
  you K and L directly.
- **Starting the spreadsheet:** you need at least 100 days (ideally 250) of history before the first trade. You do not have to type a
  year of prices: `backtest/days_v3.csv` already has the gap (`gap_pct`), threshold (`threshold_pct`) and ATR (`atr_pips`) for every
  day up to 30 Sep 2026. Copy the last 250 rows of `gap_pct` (as gap sizes) and the last 20 day ranges into your sheet and continue from there.
  (Your broker's prices will differ very slightly; that is fine.)

#### 3.4 Before 10:00 New York: mark
1. **At 03:00 New York** (10:00 Doha summer / 11:00 Doha winter): write down **E0** and **G0**, the closing prices of the 02:59 candles.
2. Watch nothing else. The morning window (03:00 – 09:59 New York) is just recorded.

#### 3.5 At 10:00 New York (17:00 Doha summer / 18:00 Doha winter): the setup
1. Write down **E1** and **G1** (closes of the 09:59 candles), and EURUSD's **Morning High** and **Morning Low** (03:00 – 09:59 New York).
2. The spreadsheet gives you the **Gap**. Compare its size with today's **Threshold** (worked out from the previous days only).
   - Gap size **not larger** than the Threshold → **no trade today.**
   - Gap **positive** (euro did better than the pound) → plan to **SELL** EURUSD.
   - Gap **negative** (euro did worse than the pound) → plan to **BUY** EURUSD.

#### 3.6 Confirmation: has the move stalled?
- Work out the **stop**: SELL → Morning High + 1 pip. BUY → Morning Low − 1 pip.
- **Stop distance** = the distance in pips from E1 to that stop.
- Trade only if the stop distance is **at least 0.15 × ATR20** (price has already come back from the morning extreme) **and at most
  0.6 × ATR20** (the give-back has not already happened), and at least 2.4 pips. Otherwise **no trade today.**

#### 3.7 Entry
Enter **at market right at 10:00 New York** (17:00 / 18:00 Doha). Do not wait: in the test, entering one minute late cut the profit
by about 10% on design data.

#### 3.8 Stop loss, take profit and size (place the stop immediately)
- **Stop loss:** the stop from 3.6. Never moved.
- **Take profit:** **none.** The trade is closed at 16:00 New York unless the stop is hit first.
- **Position size** (1% risk): size = (1% of your balance) ÷ (stop distance in pips × pip value).
  Example: balance 10,000 USD, risk 100 USD, stop 24.9 pips, 10 USD per pip per standard lot → 100 ÷ (24.9 × 10) = **0.40 lots**.

#### 3.9 Managing the trade
Do nothing. No break-even, no partial profit, no moving the stop. In the test 7 trades in 10 lasted until the 16:00 close.

#### 3.10 When to stop and when to close no matter what
- **Close at 16:00 New York** (23:00 Doha summer / 00:00 midnight Doha winter) at the latest. Never hold overnight.
- **One trade per day.** After it closes, stop for the day.

#### 3.11 Worked examples (real trades from the test)
**Winner: Thursday 5 February 2026 (US winter time, Doha = New York + 8 h)**
- 02:59 New York (10:59 Doha): EURUSD **E0 = 1.17989**, GBPUSD **G0 = 1.36200**.
- 09:59 New York (17:59 Doha): EURUSD **E1 = 1.17979**, GBPUSD **G1 = 1.35362**.
- Euro move = 1.17979 ÷ 1.17989 − 1 = −0.0085%. Pound move = 1.35362 ÷ 1.36200 − 1 = −0.6153%.
  **Gap = −0.0085% − (−0.6153%) = +0.6068%**. Threshold that day 0.2100% → the gap is bigger → **SELL** (the pound fell, the euro did not).
- Morning High 1.18218 → **stop 1.18228**. Stop distance = 1.18228 − 1.17979 = **24.9 pips**. ATR20 = 82.9 pips:
  0.15 × 82.9 = 12.4 and 0.6 × 82.9 = 49.7, and 24.9 is in between → **confirmed**.
- Sell at 10:00 New York (18:00 Doha) at **1.17979**, stop 1.18228, no target.
- The stop was never hit. Closed at 16:00 New York (00:00 Doha) at **1.17808**: +17.1 pips − 1.2 cost = 15.9 pips = **+0.64 R**.

**Loser: Monday 2 March 2026 (US winter time)**
- E0 1.17161, G0 1.33618; E1 1.17167, G1 1.34119. Euro +0.005%, pound +0.375% → **gap −0.370%** (threshold 0.204%) → **BUY**.
- Morning Low 1.16949 → stop **1.16939**, distance 22.8 pips (ATR20 57.2: between 8.6 and 34.3 → confirmed).
- Bought at 10:00 New York (18:00 Doha) at 1.17167. Stop hit at 10:37 New York (18:37 Doha): −22.8 pips − 1.2 cost = **−1.05 R**.

**Hidden-years example: Thursday 18 August 2016 (US summer time)** — the best hidden trade:
euro +0.002%, pound +0.613%, gap −0.612% (threshold 0.576%) → BUY at 1.13159, stop 1.13042 (11.7 pips; ATR20 74.4), closed 16:00 New York
(23:00 Doha) at 1.13644 → **+4.04 R**. Without its 5 best trades like this one, the hidden years lose 15 R.

#### 3.12 Checklist before every trade (tick all)
- [ ] It is a normal weekday, not a holiday or half-empty day; no data holes on my EURUSD/GBPUSD charts in the hours used.
- [ ] My spreadsheet has at least 100 earlier days of gaps and the last 20 day ranges.
- [ ] E0 and G0 (02:59 New York closes) and E1 and G1 (09:59 New York closes) are written down.
- [ ] Gap size is **bigger** than today's Threshold.
- [ ] Direction: gap positive → SELL; gap negative → BUY.
- [ ] Stop = Morning High + 1 pip (sell) or Morning Low − 1 pip (buy).
- [ ] Stop distance is between 0.15 × ATR20 and 0.6 × ATR20 (and at least 2.4 pips).
- [ ] It is 10:00 New York (17:00 Doha summer / 18:00 Doha winter). No trade taken yet today.
- [ ] Size = 1% risk (or less, see grade C). No take profit.
- [ ] Alarm set for 15:59 New York (22:59 Doha summer / 23:59 Doha winter) to close the trade.

---

### 4. Known weaknesses (read these before doing anything with it)
1. **It lost money on the unseen years.** 2016-2018: -2.4 R on 63 trades, only 1 of 3 years positive, -6.1 R at double cost.
   All of its good results come from the years used to build it.
2. **Selling into a rising euro fails.** In 2017 the euro rose most of the year; the sell trades lost 9.6 R. The sell side was also the
   weak side in 2021, 2023 and 2025.
3. **It depends on a few big winners.** Wins at the 16:00 close can be +2 to +4 R; without its 5 best trades the hidden years lose 15 R.
4. **Very few trades:** about 2 a month (24 to 30 a year). A bad year can be just bad luck, and a good year can be just good luck. You
   will need years, not months, to know if it works.
5. **The story behind it is shaky.** In 3 trades out of 4 the pound moved and the euro did not; the team's explanation ("the euro gives
   back its own move") fits only the other quarter, and those trades lost money on the hidden years.
6. **Exact timing matters.** Entry must be right at 10:00 New York; one minute late cost about 10% of the design profit.
7. **It needs a spreadsheet** (gap, threshold, ATR) and two charts every day. Mistakes in copying prices change the decision.
8. **Evening hours in Doha:** entry at 17:00 or 18:00 Doha, forced close at 23:00 or midnight Doha.
9. **Data:** the test used one free data source (HistData bid prices). Your broker's prices and spread will differ slightly.

---

### 5. Before you use it: your own checks
1. **Repeat the backtest by hand** on at least 10 trades from `backtest/trades_v3.csv` (5 hidden, 5 design): same dates, same direction,
   similar E0/E1/G0/G1, morning high/low and stop on your broker's charts. Note any differences.
2. **Do not trade it with real money.** It is grade C. If you want to follow it, keep a **paper log** (or demo account) from now on,
   with the checklist, for at least 50 trades (about 2 years). Compare with the test: about 2 trades a month, 7 in 10 closing at 16:00,
   wins around +1.0 R and losses around -0.8 R.
3. Only if that log is clearly positive (see "What would upgrade it to B" at the top) is it worth another look by the team.

*Past results do not guarantee future results. A strategy that made money in the past can lose money in the future.
Trading carries a real risk of loss. This is not financial advice.*

