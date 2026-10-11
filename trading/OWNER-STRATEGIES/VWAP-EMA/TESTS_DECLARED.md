# VWAP + EMA: tests declared before running (Agent 1, 11 Oct 2026)

Everything below was written down **before** any backtest of these variants was run. The only thing
looked at beforehand was the descriptive study in `outputs/research_*.csv` (no trades simulated).

## Shared definitions (all variants)
- **Data:** design data only, 1-minute bid prices, 1 Jan 2019 – 30 Sep 2026. `data/hidden/` is never opened.
- **VWAP stand-in ("AP", average price):** our files have no volume, so AP = the running average of every 1-minute
  bar's typical price (high+low+close)/3 since the session anchor, each minute weighted equally. Reset every day.
  **Band:** AP ± 2 × the running standard deviation of those typical prices around AP.
- **Bars:** 5-minute or 15-minute bars aligned to the New York clock (:00, :05 … / :00, :15 …).
- **EMA:** exponential moving average of bar closes (standard formula, alpha = 2/(n+1)), running continuously
  across days (as on a normal chart). 5-minute bars use EMA 9 and 21; 15-minute bars use EMA 20 and 50.
- **ATR:** 14-bar average true range (Wilder) on the same bars.
- **Signals** are judged at a bar's close. **Entry** = that bar's closing price (i.e. the next minute).
- **Stop size limits:** if the stop is closer than 1.0 × ATR, it is moved out to exactly 1.0 × ATR from entry.
  If the stop is farther than 4 × ATR, the trade is skipped.
- **Exits** are checked minute by minute. If stop and target are both hit in the same minute, the stop counts.
  If the price opens beyond the stop, the exit is at that open (worse price).
- **Forced close:** any open trade is closed at the close of the 15:54 NY minute (= 15:55 NY; 22:55 Doha in US
  summer time, 23:55 Doha in US winter time). No trade is held overnight.
- **Max trades:** 2 per day, one at a time (a new signal only counts after the previous trade closed).
- **Gap rule:** a day is skipped if it has a hole of more than 15 minutes between the session anchor and 15:55 NY.
- **No news filter** (the owner decides about news days). Results on major US news days are reported separately
  where our news calendar has dates (Oct 2024 – Jun 2026 only).
- **Costs per trade (round trip):** Nasdaq 2.0 points, gold 0.40 USD, GBPUSD 1.5 pips, EURUSD 1.2 pips.
  Every variant is reported before costs, with standard costs and with double costs.

## Sessions (anchor → signal window → forced close)
| Code | Markets | AP anchor | Signal bars may END between | Forced close |
|---|---|---|---|---|
| NY0930 | Nasdaq | 09:30 New York | 10:00 – 14:30 New York | 15:55 New York |
| LON0800 | Gold, GBPUSD, EURUSD | 08:00 London | 08:30 – 12:00 London | 15:55 New York |
| NY0800 | Gold, GBPUSD, EURUSD | 08:00 New York | 08:30 – 12:00 New York | 15:55 New York |

## The three structures (long rules; shorts are the exact mirror)
**P = trend pullback.** At the signal bar: fast EMA > slow EMA (also true on the previous bar), close > AP, close > fast EMA.
The previous bar's low touched or went below the fast EMA (the pullback). The signal bar closes above the previous bar's
high (the resumption). Stop = the lower of the two bars' lows. Target = 2R (or none for "EOD" variants: stop or 15:55 NY).

**R = VWAP reclaim (rejection for shorts).** The 3 bars before the signal bar all closed below AP; the signal bar closes
above AP and above the fast EMA, with fast EMA > slow EMA. Stop = the lowest low of those 4 bars. Target = 2R.

**M = band mean reversion.** EMAs "flat": |fast EMA − slow EMA| < 0.25 × ATR at the signal bar. The previous bar's low went
below the lower band; the signal bar closes back above the lower band and closes up (close > open). Stop = lowest low of the
last 3 bars. Target = AP at the moment of entry (fixed price). Skip if the distance to the target is less than 1.0 × the risk.

## Variants (7 per session; Nasdaq 1 session, the others 2 sessions → 49 variants)
| ID | Structure | Bars | EMAs | Target |
|---|---|---|---|---|
| P5 | pullback | 5 min | 9 / 21 | 2R |
| P15 | pullback | 15 min | 20 / 50 | 2R |
| P15E | pullback | 15 min | 20 / 50 | none: stop or 15:55 NY |
| R5 | reclaim | 5 min | 9 / 21 | 2R |
| R15 | reclaim | 15 min | 20 / 50 | 2R |
| M5 | mean reversion | 5 min | 9 / 21 (flat filter) | AP |
| M15 | mean reversion | 15 min | 20 / 50 (flat filter) | AP |
Full variant name = MARKET_SESSION_ID, e.g. `XAUUSD_NY0800_P15`. **Round 1 count: 7 + 14 + 14 + 14 = 49.**

## Bar (owner's pass mark, all with standard costs unless said)
1 positive in ≥ 6 of 8 years (2019 … 2026); 2 no year worse than −8 R; 3 positive at double cost; 4 longs and shorts
both positive; 5 longest losing run ≤ 8; 6 ≥ +0.08 R per trade; 7 positive without the best 5 trades; 8 ≥ 40 trades a year
(average over 7.75 years, i.e. ≥ 310 trades in total).

## Selection rule (fixed in advance)
Per market, the chosen version is the variant passing the most bar points; ties are broken by total R with standard costs.

## Round 2 (allowed, limited)
After round 1, at most **2 refinements per market** may be tested, each written into this file (section "Round 2")
with its reason **before** it is run. A refinement replaces the round-1 pick only if it passes more bar points, or the
same number with higher R per trade with costs. Total budget: 49 + 8 = 57 variants.

## Round 1 result → picks (by the fixed selection rule)
| Market | Round-1 pick | Bar points | R with costs |
|---|---|---|---|
| NASDAQ | NY0930_R15 (VWAP reclaim, 15 min) | 6 / 8 | +30.0 |
| XAUUSD | NY0800_P15E (trend pullback, 15 min, hold to close) | 3 / 8 | +103.7 |
| GBPUSD | LON0800_M15 (band mean reversion, 15 min) | 2 / 8 | +0.5 |
| EURUSD | LON0800_M15 (band mean reversion, 15 min) | 1 / 8 | −6.4 |
Full table: `outputs/summary_<MARKET>.csv`.

## Round 2 (declared 11 Oct 2026, before running; 8 refinements → total 57 variants)
Reasons are chosen so they should hold in the future, not to fit past years.
| ID | Market | Change vs round-1 pick | Reason |
|---|---|---|---|
| NASDAQ_NY0930_R15E | Nasdaq | no 2R target: hold to stop or 15:55 NY | A reclaim of the day's average often starts a trend day; capping at 2R cuts the big days that pay for the losers (P15E beat P15 in round 1 the same way). |
| NASDAQ_NY0930_R30 | Nasdaq | 30-minute bars (EMA 20/50) | Larger bars = larger stops = smaller share of the fixed cost; fewer false reclaims from noise. |
| XAUUSD_NY0800_P15E1 | Gold | max 1 trade per day | A hold-to-close trend trade needs one clean trend; a second entry after a stop means the trend failed (round-1 losing run 12). |
| XAUUSD_NY0800_P30E | Gold | 30-minute bars (EMA 20/50) | Same cost/noise reason as R30. |
| GBPUSD_LON0800_M30 / EURUSD_LON0800_M30 | FX | 30-minute bars (EMA 20/50) | Mean reversion was the best structure before costs in BOTH pairs (+0.17 and +0.16 R per trade), but costs ate ~0.17 R per trade; bigger bars shrink the cost share. |
| GBPUSD_LONNY_M15 / EURUSD_LONNY_M15 | FX | signal window widened to 08:30 London → 12:00 New York (same 08:00 London anchor) | Same idea through the London/New York overlap: more trades (round 1 had only ~28 a year, below the 40 needed). |
