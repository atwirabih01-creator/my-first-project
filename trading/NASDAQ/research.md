# NASDAQ 100: research (Agent 1, round 1, 9 Oct 2026)

**Data:** `trading/data/NSXUSD_M1.csv.gz` (Nasdaq 100 index CFD, 1-minute bid bars, UTC). **Only the design period
1 Oct 2024 – 30 Jun 2026 was loaded** (filtered right after reading, asserted). Y1 = Oct 2024 – Sep 2025, Y2 = Oct 2025 – Jun 2026.
Hidden test A (Oct 2023 – Sep 2024) and hidden test B (Jul 2026 on) were never opened.
All moves are measured in **% of price or in ATR units** (ATR = average 09:30–16:00 NY range of the previous 14 full sessions),
because the index moved a lot over the period. Scripts and full outputs: `research/` (see `research/README.md`).
Not financial advice.

**Clocks:** the cash (stock-market) session is 09:30–16:00 New York = **16:30–23:00 Doha in US summer time** (2nd Sunday of March to
1st Sunday of November, Doha = NY + 7 h) and **17:30–00:00 Doha in US winter time** (Doha = NY + 8 h).
The CFD also trades overnight, with a daily break 17:00–18:00 NY.

**Data quality (README rule):** 450 trading days in the design data; 22 are not full cash sessions: 13 US holidays on which the CFD
still printed some prices, 5 early closes (13:00 NY), and 4 days with gaps > 15 minutes inside 09:30–16:00 NY
(24 Oct 2024, 28 Oct 2024, 14 Nov 2024, and 12 Mar 2026 with a 60-minute hole). Good Friday 2025 and 2026, 25 Dec and 1 Jan have no prices at all.
For anything that needs yesterday's 16:00 close, the day after such a day is also skipped. Result: 399 usable days (Y1 222, Y2 177),
after a 10-day warm-up for the ATR in early Oct 2024.

---

## 1. When does it move? (`out_01_ALL.txt`)

Average range per clock hour, % of price (full sessions):

| NY hour | Doha (summer / winter) | Y1 | Y2 |
|---|---|---|---|
| 18:00–02:00 (Asia) | 01:00–09:00 / 02:00–10:00 | 0.15–0.26 | 0.19–0.32 |
| 03:00–04:00 (London open) | 10:00–12:00 / 11:00–13:00 | 0.28–0.30 | 0.28–0.30 |
| 05:00–07:00 | 12:00–15:00 / 13:00–16:00 | 0.22–0.28 | 0.25–0.31 |
| 08:00 (US data at 08:30) | 15:00 / 16:00 | 0.38 | 0.36 |
| **09:00 (incl. 09:30 open)** | **16:00 / 17:00** | **0.67** | **0.73** |
| **10:00** | **17:00 / 18:00** | **0.69** | **0.70** |
| 11:00 | 18:00 / 19:00 | 0.52 | 0.54 |
| 12:00–14:00 (lunch) | 19:00–22:00 / 20:00–23:00 | 0.43–0.47 | 0.39–0.44 |
| 15:00 (last hour) | 22:00 / 23:00 | 0.49 | 0.44 |

- The **first 30 minutes after 09:30 NY are the busiest half-hour of the day** (0.62% Y1, 0.69% Y2), then 10:00–10:30 (0.55 / 0.51%).
  Lunch (12:00–14:00 NY) is the quietest part of the cash session (≈ 0.30–0.35% per half-hour). The last half-hour picks up again (0.39 / 0.32%).
- The first cash hour (09:30–10:30) alone covers **half of the whole day's range** on average (50% both years).
- **Overnight vs cash session.** Close (16:00) → next open (09:30) vs open → close (09:30 → 16:00):
  the cash session moves more (average absolute move 0.78% vs 0.60–0.62%), but the overnight carries **34% (Y1) / 40% (Y2)** of the
  day-to-day variation. Most of the index's rise came overnight in Y2 (+20.9% summed overnight vs +4.2% in the cash session).
  The two parts are slightly opposed (correlation −0.12 Y1, −0.08 Y2): a first hint that the cash session takes back part of the overnight move.
- **Weekday:** no stable pattern. Mondays were up in the cash session on 71% (Y1) / 59% (Y2) of days, Thursdays were the weakest
  (44% / 43% up, average −0.24% both years). Ranges per weekday differ by less than 20% and the order changes between years.
  I do not build on weekdays (sample per weekday is 34–50 days, too small).
- **Calm vs volatile** (ATR above / below the design-period median, 1.28% per day): volatile days have ~1.5–1.8× the range.
  The cash session was up more often on volatile days (60% vs 45–54%), mostly the April 2025 rebound.
- **The crash:** ATR rose from ~1.2% to 3.5% in April 2025 (daily cash range 3.6% that month). Overnight moves summed −9.4%
  in April 2025 while the cash session summed +12.3%: in the crash, the overnight panics were bought back during the day.

## 2. The 09:30 open: gaps, opening drive, where big moves start (`out_02_ALL.txt`)

**Gaps.** Gap = 09:30 open minus yesterday's 16:00 close. Average size 0.61% (Y1) / 0.62% (Y2) = 0.40 / 0.45 ATR. 58% of gaps were up in both years.

How often the gap is "filled" (price touches yesterday's 16:00 close during 09:30–16:00):

| Gap size | Y1 down | Y1 up | Y2 down | Y2 up |
|---|---|---|---|---|
| < 0.1 ATR | 89% | 91% | 92% | 100% |
| 0.1–0.25 ATR | 69% | 76% | 67% | 78% |
| 0.25–0.5 ATR | 56% | 47% | 47% | 36% |
| > 0.5 ATR | 38% | 33% | 40% | 29% |

Small gaps are almost always filled (trivial: the level is close). **Big gaps are fully filled only about 1 day in 3**, so a full fill
cannot be the only exit of a strategy.

**Which way does the cash session go after a gap?** Share of days on which 09:30 → 16:00 moved WITH the gap:

| Gap size | Y1 down | Y1 up | Y2 down | Y2 up |
|---|---|---|---|---|
| 0.25–0.5 ATR | 44% | 60% | 42% | 73% |
| **> 0.5 ATR** | **38%** | **44%** | **40%** | **39%** |

**Big gaps (> 0.5 ATR) are partly taken back in all four boxes** (both years, both directions): the cash session went against
the gap on 56–62% of these days, by +0.14 to +0.22 ATR on average (medians +0.08 to +0.38). Medium gaps (0.25–0.5) do NOT
behave like this: gap-ups of that size continued in Y2 (73%).

**Opening drive.** Does the direction of the first 5 / 15 / 30 / 60 minutes continue to 16:00?
Only weakly, and not reliably: the first 15 minutes continued on 63% of days in Y1 but 53% in Y2 (rest-of-day +0.16 vs −0.02 ATR).
The first 30 and 60 minutes continued on 51–55% (≈ coin flip). An up start continued more often than a down start (58–68% vs 42–57%),
which is the rising market showing through, not an opening effect. **Not a usable edge on its own.**

**Opening-range breakouts** (first 15 / 30 / 60 min high-low, first break, then does price travel one more range before
returning to the other side?): 15-min range: reached in 37–59%, failed in 35–46%, with Y2 gap-up breaks clearly worse (37% vs 45%).
No direction or year is consistently good. **Rejected.**

**Where the day's high and low are set.** The cash-session high or low is made in the **first 30 minutes on 28–37% of days**
(low 34% / 37%, high 28% / 31%), and in the last 30 minutes on 11–17%. Midday sets the extreme on only 2–6% of days per half-hour.
So the big moves start at the open (often the reversal of an overnight move) or run into the close.

## 3. News days (`out_03_ALL.txt`)

Dates were built from the published schedules (BLS: jobs report NFP, CPI, PPI; Federal Reserve: FOMC; copied from the gold work,
including the Oct–Nov 2025 shutdown re-dates) and **checked in the prices**: the 5 minutes from the release minute vs the median day at
that minute (08:30 NY: 0.115%, 14:00 NY: 0.101%).
- FOMC 3.3×, NFP 3.8×, CPI 4.0×, PPI 2.9× normal (median). All dates confirmed except: **NFP 9 Jan 2026 (1.47×) and 8 May 2026 (1.42×)**
  (weak reaction, dates probably right but doubtful) and **NFP 3 Apr 2026** (Good Friday: no prices at all).
- **Big-tech earnings** (dates from Alpha Vantage, all after the 16:00 close, so the reaction is the next morning's gap):
  NVDA, AAPL, MSFT, GOOGL, 7 reports each. Next-morning gap: NVDA 0.58, AAPL 0.62, MSFT 0.61 ATR on average vs 0.42 on all days;
  GOOGL 0.34 (no bigger than normal). META and AMZN dates were not fetched (free-tier limit); they usually report on the MSFT / AAPL
  evenings (unverified).
- 10:00 NY releases (ISM, JOLTS, consumer sentiment) were **not** studied (no verified calendar).

Behaviour (cash session, ATR units, per year):

| Event | Y1 n | Y2 n | Abs. gap Y1 / Y2 | Big gap (> 0.5) share | Cash range vs normal | Note |
|---|---|---|---|---|---|---|
| Normal day | 171 | 141 | 0.39 / 0.45 | 26% / 34% | 1.00 / 1.05 | |
| CPI (08:30) | 11 | 8 | 0.56 / 0.43 | 55% / 50% | 0.98 / 0.93 | the move happens 08:30–09:30 (range 0.80 / 0.57% vs 0.34% normal), not after the open |
| NFP (08:30) | 6 | 6 | 0.56 / 0.62 | 50% / 67% | 1.25 / 1.50 | bigger cash-session range too |
| PPI (08:30) | 10 | 6 | 0.28 / 0.43 | 10% / 33% | 0.86 / 1.23 | small |
| FOMC (14:00) | 8 | 6 | 0.17 / 0.29 | 0% / 17% | 1.49 / 0.81 | 14:00–16:00 range 1.52% / 1.01% vs 0.62 / 0.57% normal: 1.8–2.5× |
| Earnings reaction | 13 | 9 | 0.53 / 0.43 | 54% / 33% | 1.28 / 1.21 | |

- Before an 08:30 release (08:00–08:29) the market is no quieter than usual (0.17–0.28% vs 0.20–0.22%).
- **On news-driven big gaps the fade is weaker** (section 4): big gaps on news/earnings days were taken back on 53% of days (+0.06 ATR),
  on normal days on 62% (+0.21 ATR). Samples are small (34 vs 92 days). I report this; I do **not** skip news days (the owner decides).

## 4. The strongest repeating behaviour: big opening gaps are partly faded (`out_04_ALL.txt`)

Move from the 09:30 open to the 15:59 close **against** the gap, ATR units (positive = gap partly taken back):

| Gap threshold | Y1 gap-down (→ long) | Y1 gap-up (→ short) | Y2 gap-down (→ long) | Y2 gap-up (→ short) |
|---|---|---|---|---|
| > 0.25 ATR | +0.10 (n49, 59%) | +0.13 (n69, 49%) | +0.08 (n44, 59%) | −0.01 (n60, 48%) |
| > 0.35 ATR | +0.12 (39, 59%) | +0.13 (55, 51%) | +0.03 (36, 53%) | +0.04 (50, 54%) |
| **> 0.5 ATR** | **+0.16 (24, 63%)** | **+0.22 (39, 56%)** | **+0.16 (25, 60%)** | **+0.14 (38, 61%)** |
| > 0.75 ATR | +0.18 (16, 63%) | +0.26 (16, 50%) | +0.21 (13, 62%) | +0.19 (20, 65%) |
| ≤ 0.25 ATR (contrast) | +0.01 (45) | −0.09 (59) | −0.02 (30) | +0.07 (43) |

For gaps > 0.5 ATR: calm stretches +0.11 ATR (60% of days), volatile stretches +0.23 (59%); in the Mar–May 2025 crash +0.21 (61%, n23),
outside it +0.16 (59%, n103). By quarter: positive in 5 of 7 quarters; flat in Q4 2024 (0.00) and **negative in Q2 2026 (−0.18, 39%)**,
the strong Apr–Jun 2026 rally in which gap-ups kept going.

**Why it should happen (plain words):** an opening gap is made overnight and in the pre-market by thin trading and by reactions to
news. At 09:30 the full stock market opens; big funds, market makers and index arbitrage trade against prices that ran too far
on thin volume, and many overnight traders take profits at the open. That pushes part of a large gap back. It is a reaction to the
size of the overnight move, so it should show up whether the market is rising or falling, and it did: for gap-ups and gap-downs,
in both years and in the crash. It is **not** a "buy the dip" idea: half the trades are shorts.

## 5. Rejected or weak ideas (numbers above)
- Opening drive continuation (first 5–60 min): 51–63%, changes between years. Rejected.
- Opening-range breakout (15 / 30 / 60 min): inconsistent by year and side. Rejected.
- Weekday effects: unstable, small samples. Not used.
- Fading medium gaps (0.25–0.5 ATR): Y2 gap-ups continued. Not used.

## 6. Trading tests (`out_05_ALL.txt`, `out_06_ALL.txt`)
Four variants were **written down before the first run** (`research/05_variants.py` header). All: gap > 0.5 ATR, trade against it,
one trade a day, forced close at the 15:59 NY bar, 2.0 points cost.

| Variant | Y1 n / R / PF / losing run | Y2 n / R / PF / losing run | At 4.0 cost Y1 / Y2 | Longs Y1 / Y2 | Shorts Y1 / Y2 |
|---|---|---|---|---|---|
| V1 enter 09:35, stop 0.5 ATR, target = gap fill | 63 / +11.2 / 1.44 / 5 | 64 / +9.1 / 1.38 / **9** | +10.3 / +8.3 | +5.5 / +6.9 | +5.8 / +2.2 |
| **V2 enter 09:35, stop 0.75 ATR, target = gap fill** | **63 / +11.9 / 1.74 / 4** | **64 / +6.1 / 1.35 / 6** | **+11.3 / +5.5** | **+5.7 / +3.8** | **+6.1 / +2.3** |
| V3 as V1, no target (hold to 15:59) | 63 / +17.8 / 1.67 / 5 | 64 / +12.7 / 1.49 / **10** | +16.9 / +12.0 | +6.5 / +6.5 | +11.3 / +6.3 |
| V4 wait for a 5-min close beyond the first 5-min candle | 39 / +8.8 / 1.64 / 5 | 45 / +0.1 / 1.01 / 6 | +8.2 / −0.5 | +4.2 / −1.8 | +4.6 / +2.0 |

All four are positive in Y1; V1–V3 in Y2. **V2 is the only one that meets every point of the bar** (V1 and V3 have losing runs of 9–10;
V4 is flat in Y2 with losing Y2 longs). V3 earns more, but its losing run of 10 fails the bar.
Reason for the wider stop (a reason that holds in the future, not only a better score): the first cash hour moves about 0.6 ATR on
an average day, so a 0.5 ATR stop sits inside normal opening noise; 0.75 ATR is outside it. The narrowest V2 stop was 135 points
(the 40-point minimum never binds).

**V2 robustness (same trades, sliced):**
- Calm 64 trades +7.2 R; volatile 63 trades +10.7 R. Crash Mar–May 2025: 23 trades +6.2 R.
- Per year x direction x calm/volatile: 7 of 8 boxes positive; Y1 longs in calm stretches −0.2 R (7 trades).
- By quarter: −0.2, +3.1, +4.4, +4.5, +5.6, +5.3, **−4.8 R (Q2 2026)**. Q2 2026 losses came from shorts (13 trades −4.8 R) in the strong rally.
- News: NFP days 10 trades −1.4 R, CPI days 10 trades −0.6 R, PPI 3 trades −0.1 R; earnings days 10 trades +3.7 R; normal days 93 trades +15.9 R.
- Without the best 3 trades: Y1 +6.0 R, **Y2 +0.9 R** (Y2 is thin).
- Neighbourhood (run only as a check, not to choose), Y1 / Y2 total R:

| | stop 0.5 ATR | stop 0.75 | stop 1.0 |
|---|---|---|---|
| gap > 0.4 ATR | +11.0 / +0.5 | +10.7 / +0.1 | +6.5 / −0.7 |
| gap > 0.5 ATR | +11.2 / +9.1 | **+11.9 / +6.1** | +7.1 / +4.5 |
| gap > 0.6 ATR | +10.4 / +7.4 | +9.3 / +5.3 | +5.4 / +4.2 |

  Smooth across stop size and for higher thresholds; **lowering the threshold to 0.4 wipes out Y2** (gaps of 0.4–0.5 ATR continued in Y2),
  consistent with section 4 (medium gaps are not faded).

**Variant count for NASDAQ: 11 rule sets** (4 declared + 7 extra neighbourhood cells). Descriptive tables are not counted.

## 7. Idea chosen and backups
**Chosen: "Fade the big opening gap" (strategy v1 = variant V2).** Evidence: the descriptive fade is present in all four
year x direction boxes before any trading rule was written, in calm and volatile stretches and in the crash.
Evidence strength: **moderate**. ~64 trades a year, average +0.14 R per trade; Y2 depends on a few good trades; the most recent quarter lost.

Backups (not yet tested as rules):
1. **Same fade, held to 15:59 with no target (V3):** more profit, but long losing runs. Could come back with a smaller risk per trade.
2. **FOMC afternoon:** 14:00–16:00 range 1.8–2.5× normal; only 14 events, direction unknown. Needs its own study.
3. **Overnight-panic reversal in high-ATR stretches:** in April 2025 the cash session bought back the overnight losses; a stronger
   version of the gap fade for volatile periods only. Small sample (one episode).

## 8. Honest doubts
- The edge is small (+0.1 to +0.2 R a trade) and Y2 is thin (+0.9 R without its best 3 trades).
- **Q2 2026 lost 4.8 R** when gap-ups kept running in a strong rally: the same "one market mood" risk that sank GBPUSD and gold.
  The idea is two-sided by construction, but a long one-way trend still hurts the side that fights it.
- News-driven gaps (NFP, CPI) faded less; I did not filter them out (owner's decision).
- The ATR warm-up needs 10 full sessions before the first trade; with the full file Agent 2 can start on 1 Oct 2024.
- CFD bid prices; the real index has no overnight trading, so the "gap" here is the CFD's price at 09:30 vs its 16:00 price,
  which is what a CFD trader sees. Futures (NQ) would be similar; the QQQ ETF opening print can differ by a few points.
