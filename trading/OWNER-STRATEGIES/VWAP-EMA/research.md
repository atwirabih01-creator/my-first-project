# Owner's strategy "VWAP + EMA": research and test results (Agent 1, 11 Oct 2026)

*Research, not financial advice. Trading carries real risk of loss. All numbers below come from the design data
(1-minute prices, Jan 2019 – Sep 2026). No unseen (hidden) data was opened.*

## 1. What was asked
Test the owner's own idea, **VWAP + EMA**, on all four markets, adapting it to each market, and hand over the single best
version per market with exact rules, graded honestly against the owner's bar.

## 2. Important limitation: no volume, so "VWAP" is a stand-in
Our minute files have no volume. Everywhere below, **"AP" (session average price)** replaces VWAP: the running average of every
1-minute bar's typical price (high+low+close)/3 since a fixed anchor time, each minute counted equally, reset daily.
Real VWAP gives more weight to busy minutes (opens, news), so on those minutes it leans further toward the traded price. The two
lines are usually close but not identical; results with a real VWAP could differ somewhat.
Anchors tested: Nasdaq 09:30 New York (stock open); gold and FX both 08:00 London and 08:00 New York.

## 3. What the data says before any trading rule (descriptive study, `outputs/research_<MARKET>.csv`)
Measured per year 2019–2026 on every clean day (gappy days skipped: Nasdaq 196 weekdays, gold 190, GBPUSD 131-133, EURUSD 129-132,
mostly Feb–Jul 2023, Mar 2020 for Nasdaq, and holidays).

| Market / anchor | Typical range anchor → 15:55 NY | Typical 5-min ATR | Cost as share of a 5-min ATR | AP crossings per day (5-min closes) | Days where the 15:55 close is on the same side of AP as 1 h after the anchor |
|---|---|---|---|---|---|
| Nasdaq / 09:30 NY | 219 points (70 in 2019 → 367 in 2026) | 21 points | 0.06 – 0.27 | about 7 | 54 – 63 % |
| Gold / 08:00 London | 29 USD (12 → 79) | 2.0 USD | 0.08 – 0.54 | about 12 | 46 – 57 % |
| Gold / 08:00 NY | 25 USD | 2.4 USD | 0.06 – 0.45 | about 8.5 | 48 – 58 % |
| GBPUSD / 08:00 London | ~80 pips | ~6 pips | 0.19 – 0.34 | about 11.5 | 44 – 58 % |
| GBPUSD / 08:00 NY | ~63 pips | ~6 pips | 0.18 – 0.30 | about 8.4 | 47 – 56 % |
| EURUSD / 08:00 London | ~59 pips | ~4 pips | 0.19 – 0.37 | about 11.8 | 43 – 54 % |
| EURUSD / 08:00 NY | ~47 pips | ~5 pips | 0.18 – 0.33 | about 8.5 | 50 – 55 % |

What this means in plain words:
- **Price crosses its session average 7 – 12 times a day.** Being above or below "VWAP" on its own says little: one hour after the
  anchor, the day finishes on the same side only a little more than half the time (about 50 – 60 %).
- **The move from one hour after the anchor to the close, in the direction of the AP side, is about zero on average** in every
  market (between −11 % and +6 % of the day's range, sign changing from year to year). In the FX New York session and gold's New
  York session it is slightly **negative** in most years (the afternoon tends to drift back), which hints at mean reversion there.
- **Costs are large compared with 5-minute moves**, especially in FX and 2019 gold (a quarter to half of one 5-minute bar's
  average range). This is why fast 5-minute versions were expected to struggle, and they did.
- When price is above AP **and** the 5-minute EMA 9 is above EMA 21 one hour after the open ("both agree"), the next move was
  slightly positive on average for Nasdaq in all 8 years (+0.07 to +0.69 of a 5-minute ATR), and mixed for the others.

## 4. Tests (all pre-declared in `TESTS_DECLARED.md`; 57 variants in total)
Three ways to combine VWAP and EMA, each on 5- and 15-minute bars, in 1 – 2 sessions per market:
**P** trend pullback (EMA trend + price above AP, buy a dip to the EMA then a resumption bar), **R** VWAP reclaim/rejection
(3 bars on one side of AP, then a close back across with EMAs agreeing), **M** band mean reversion (EMAs flat, price pokes outside
AP ± 2 standard deviations and closes back inside; target AP). Round 1 = 49 variants; round 2 = 8 refinements (2 per market),
written down with reasons before running.

### Result of all 57 variants (R with standard costs over 2019 – Sep 2026; bar points out of 8)
| Variant | Trades | Win % | R before cost | R with cost | R double cost | R/trade | Long R | Short R | Losing run | + years | Worst year | Bar pts |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| EURUSD_LON0800_P5 | 3385 | 33.1 | -28.44 | -759.33 | -1490.23 | -0.22 | -461.74 | -297.6 | 16 | 0 | -150.34 | 1 |
| EURUSD_LON0800_P15 | 1331 | 36.0 | 52.19 | -113.79 | -279.77 | -0.08 | -88.73 | -25.06 | 10 | 2 | -35.17 | 1 |
| EURUSD_LON0800_P15E | 1312 | 24.5 | 39.36 | -124.92 | -289.2 | -0.1 | -67.19 | -57.72 | 26 | 2 | -70.73 | 1 |
| EURUSD_LON0800_R5 | 1234 | 37.3 | 140.26 | -97.58 | -335.41 | -0.08 | -53.78 | -43.8 | 12 | 3 | -48.46 | 1 |
| EURUSD_LON0800_R15 | 706 | 37.1 | 50.03 | -36.02 | -122.07 | -0.05 | -26.38 | -9.64 | 18 | 2 | -23.21 | 1 |
| EURUSD_LON0800_M5 | 236 | 42.4 | -7.2 | -75.94 | -144.68 | -0.32 | -38.08 | -37.86 | 9 | 1 | -22.21 | 0 |
| EURUSD_LON0800_M15 | 201 | 46.8 | 32.66 | -6.42 | -45.51 | -0.03 | 6.23 | -12.65 | 6 | 4 | -8.69 | 1 |
| EURUSD_NY0800_P5 | 3432 | 34.1 | -44.63 | -639.72 | -1234.8 | -0.19 | -349.63 | -290.09 | 19 | 0 | -151.56 | 1 |
| EURUSD_NY0800_P15 | 1477 | 38.6 | -6.89 | -153.68 | -300.47 | -0.1 | -85.65 | -68.03 | 10 | 1 | -37.38 | 1 |
| EURUSD_NY0800_P15E | 1441 | 35.7 | 40.12 | -103.96 | -248.04 | -0.07 | -101.82 | -2.14 | 16 | 2 | -27.38 | 1 |
| EURUSD_NY0800_R5 | 1118 | 35.2 | -12.17 | -193.48 | -374.79 | -0.17 | -84.05 | -109.43 | 12 | 0 | -67.9 | 1 |
| EURUSD_NY0800_R15 | 777 | 40.0 | 5.68 | -68.76 | -143.2 | -0.09 | -54.89 | -13.87 | 10 | 1 | -22.83 | 1 |
| EURUSD_NY0800_M5 | 285 | 44.9 | 6.66 | -67.74 | -142.14 | -0.24 | -30.55 | -37.19 | 10 | 1 | -23.23 | 0 |
| EURUSD_NY0800_M15 | 215 | 39.5 | -2.74 | -31.29 | -59.84 | -0.15 | -20.25 | -11.04 | 9 | 3 | -11.94 | 0 |
| EURUSD_LON0800_M30 | 50 | 44.0 | 0.7 | -6.68 | -14.06 | -0.13 | -5.24 | -1.44 | 8 | 3 | -5.54 | 2 |
| EURUSD_LONNY_M15 | 553 | 43.2 | 34.39 | -57.32 | -149.03 | -0.1 | -13.1 | -44.21 | 9 | 1 | -16.52 | 1 |
| GBPUSD_LON0800_P5 | 3397 | 35.3 | 173.64 | -460.72 | -1095.09 | -0.14 | -184.11 | -276.61 | 13 | 0 | -112.95 | 1 |
| GBPUSD_LON0800_P15 | 1302 | 33.6 | -30.2 | -169.25 | -308.29 | -0.13 | -92.8 | -76.45 | 13 | 1 | -62.72 | 1 |
| GBPUSD_LON0800_P15E | 1276 | 23.9 | -42.22 | -178.77 | -315.32 | -0.14 | -111.13 | -67.64 | 25 | 2 | -74.96 | 1 |
| GBPUSD_LON0800_R5 | 1209 | 33.8 | 9.9 | -188.27 | -386.44 | -0.16 | -88.09 | -100.18 | 21 | 1 | -42.63 | 1 |
| GBPUSD_LON0800_R15 | 708 | 31.4 | -67.06 | -140.79 | -214.53 | -0.2 | -72.89 | -67.91 | 14 | 0 | -30.64 | 1 |
| GBPUSD_LON0800_M5 | 275 | 38.5 | -24.66 | -96.35 | -168.04 | -0.35 | -49.32 | -47.03 | 9 | 1 | -29.39 | 0 |
| GBPUSD_LON0800_M15 | 227 | 46.7 | 38.19 | 0.49 | -37.21 | 0.0 | 1.26 | -0.77 | 8 | 4 | -7.36 | 2 |
| GBPUSD_NY0800_P5 | 3448 | 35.4 | 71.28 | -473.75 | -1018.78 | -0.14 | -280.8 | -192.94 | 14 | 0 | -98.95 | 1 |
| GBPUSD_NY0800_P15 | 1415 | 41.9 | 111.6 | -14.94 | -141.49 | -0.01 | 2.07 | -17.01 | 14 | 2 | -13.32 | 1 |
| GBPUSD_NY0800_P15E | 1374 | 37.3 | 91.99 | -31.88 | -155.75 | -0.02 | -18.51 | -13.37 | 14 | 2 | -27.4 | 1 |
| GBPUSD_NY0800_R5 | 1195 | 35.2 | -5.33 | -177.26 | -349.18 | -0.15 | -113.03 | -64.23 | 12 | 0 | -34.14 | 1 |
| GBPUSD_NY0800_R15 | 764 | 41.1 | -6.14 | -69.14 | -132.13 | -0.09 | -32.2 | -36.93 | 12 | 0 | -21.28 | 1 |
| GBPUSD_NY0800_M5 | 253 | 47.8 | 27.84 | -28.64 | -85.12 | -0.11 | -5.34 | -23.3 | 7 | 1 | -9.35 | 1 |
| GBPUSD_NY0800_M15 | 181 | 38.1 | -18.11 | -40.83 | -63.55 | -0.23 | -21.46 | -19.38 | 9 | 1 | -14.99 | 0 |
| GBPUSD_LON0800_M30 | 40 | 35.0 | -7.18 | -11.95 | -16.73 | -0.3 | -1.81 | -10.14 | 7 | 2 | -6.8 | 2 |
| GBPUSD_LONNY_M15 | 569 | 39.4 | -5.39 | -89.01 | -172.62 | -0.16 | -60.92 | -28.09 | 10 | 1 | -23.93 | 1 |
| NASDAQ_NY0930_P5 | 3266 | 35.7 | 26.68 | -222.58 | -471.84 | -0.07 | -92.22 | -130.36 | 15 | 2 | -82.74 | 1 |
| NASDAQ_NY0930_P15 | 1369 | 43.3 | 83.27 | 26.48 | -30.3 | 0.02 | 49.24 | -22.76 | 10 | 4 | -10.52 | 2 |
| NASDAQ_NY0930_P15E | 1358 | 41.7 | 95.18 | 38.73 | -17.72 | 0.03 | 58.38 | -19.65 | 10 | 4 | -15.33 | 1 |
| NASDAQ_NY0930_R5 | 1242 | 40.7 | 117.36 | 31.52 | -54.32 | 0.02 | 14.7 | 16.82 | 10 | 4 | -25.27 | 3 |
| NASDAQ_NY0930_R15 | 710 | 45.4 | 62.21 | 29.98 | -2.26 | 0.04 | 25.68 | 4.29 | 8 | 6 | -7.06 | 6 |
| NASDAQ_NY0930_M5 | 215 | 43.3 | 4.65 | -18.82 | -42.3 | -0.09 | -10.58 | -8.25 | 8 | 2 | -11.15 | 1 |
| NASDAQ_NY0930_M15 | 224 | 40.6 | -6.59 | -20.82 | -35.05 | -0.09 | -10.73 | -10.09 | 9 | 2 | -11.31 | 0 |
| NASDAQ_NY0930_R15E | 710 | 43.8 | 86.64 | 54.4 | 22.16 | 0.08 | 41.64 | 12.76 | 8 | 7 | -10.48 | 6 |
| NASDAQ_NY0930_R30 | 317 | 50.5 | 25.24 | 12.78 | 0.32 | 0.04 | 2.38 | 10.4 | 5 | 6 | -10.1 | 6 |
| XAUUSD_LON0800_P5 | 3268 | 33.3 | -5.18 | -785.69 | -1566.2 | -0.24 | -401.29 | -384.4 | 15 | 0 | -177.44 | 1 |
| XAUUSD_LON0800_P15 | 1192 | 36.9 | 113.73 | -38.71 | -191.15 | -0.03 | -9.09 | -29.62 | 10 | 3 | -22.57 | 1 |
| XAUUSD_LON0800_P15E | 1171 | 21.3 | 88.64 | -62.22 | -213.09 | -0.05 | -62.21 | -0.02 | 33 | 2 | -46.5 | 1 |
| XAUUSD_LON0800_R5 | 1236 | 33.7 | 14.27 | -241.96 | -498.19 | -0.2 | -129.15 | -112.81 | 13 | 0 | -64.11 | 1 |
| XAUUSD_LON0800_R15 | 706 | 37.0 | 63.29 | -28.07 | -119.42 | -0.04 | -31.4 | 3.33 | 13 | 3 | -31.21 | 1 |
| XAUUSD_LON0800_M5 | 236 | 44.5 | 7.02 | -62.42 | -131.86 | -0.26 | -32.7 | -29.72 | 10 | 0 | -23.42 | 0 |
| XAUUSD_LON0800_M15 | 140 | 42.1 | -0.69 | -27.98 | -55.26 | -0.2 | -15.71 | -12.27 | 11 | 2 | -14.31 | 0 |
| XAUUSD_NY0800_P5 | 3304 | 35.4 | 54.64 | -384.77 | -824.17 | -0.12 | -226.88 | -157.89 | 12 | 0 | -113.18 | 1 |
| XAUUSD_NY0800_P15 | 1456 | 41.3 | 107.44 | -7.58 | -122.6 | -0.0 | -35.88 | 28.3 | 12 | 4 | -38.18 | 1 |
| XAUUSD_NY0800_P15E | 1422 | 37.9 | 216.52 | 103.65 | -9.21 | 0.07 | 11.58 | 92.08 | 12 | 5 | -32.28 | 3 |
| XAUUSD_NY0800_R5 | 969 | 36.9 | 42.33 | -78.08 | -198.5 | -0.08 | -69.86 | -8.23 | 18 | 1 | -19.81 | 1 |
| XAUUSD_NY0800_R15 | 665 | 42.4 | 41.68 | -7.2 | -56.09 | -0.01 | 3.26 | -10.46 | 8 | 4 | -16.31 | 2 |
| XAUUSD_NY0800_M5 | 206 | 44.2 | 1.36 | -43.31 | -87.97 | -0.21 | -15.48 | -27.82 | 5 | 2 | -16.38 | 1 |
| XAUUSD_NY0800_M15 | 212 | 40.1 | -13.78 | -39.64 | -65.5 | -0.19 | -20.87 | -18.76 | 11 | 2 | -12.75 | 0 |
| XAUUSD_NY0800_P15E1 | 1213 | 37.5 | 200.03 | 103.92 | 7.81 | 0.09 | 15.88 | 88.04 | 12 | 6 | -28.12 | 6 |
| XAUUSD_NY0800_P30E | 1053 | 40.2 | 58.06 | -5.29 | -68.64 | -0.0 | -4.23 | -1.07 | 12 | 5 | -36.9 | 1 |

**Main lessons from the full table**
- **5-minute versions lose everywhere** after costs (e.g. pullback on 5 min: −223 R Nasdaq, −785 R gold London, −461 R GBPUSD London).
  Before costs most are near zero: the signals have no edge large enough to pay the spread on small stops.
- **Trend pullbacks and reclaims fail in FX** in both sessions, all years. FX best structure before costs was the band
  mean reversion on 15 minutes (+0.17 R per trade GBPUSD, +0.16 EURUSD) but costs (~0.17 R per trade) remove it.
- **What worked:** "hold to the close" exits on 15-minute bars in the two trending markets: Nasdaq (reclaim of AP) and gold
  (pullback after the New York open). Cutting winners at 2R was worse in both.

## 5. The four chosen versions (rules in `rules.md`; trades in `trades_<MARKET>.csv`; weeks in `outputs/weekly_<MARKET>.csv`)

```
===== NASDAQ NY0930 R15E =====
variant         NASDAQ_NY0930_R15E
skipped_days                   196
trades                         710
win%                          43.8
R_gross                  86.637176
R_net                     54.40121
R_net2x                  22.165245
R/tr_net                  0.076621
long_R                   41.639181
short_R                   12.76203
n_long                         359
lose_run                         8
R_no_best5               12.308329
trades/yr                91.612903
2019                    -10.485389
2020                       2.08097
2021                     16.393988
2022                     15.050083
2023                      2.361808
2024                     17.202279
2025                       0.89341
2026                     10.904061
pos_years                        7
worst_year              -10.485389
bar_pts                          6
missed                         2,6
max drawdown (R): 22.4
per year (R with costs; long/short split):
dir    long  short  total_net  gross  net_2x  trades   win%
year                                                       
2019  -6.80  -3.68     -10.49   1.04  -22.01     109  40.37
2020  11.48  -9.40       2.08   6.85   -2.68      98  44.90
2021   0.47  15.93      16.39  20.28   12.51      87  49.43
2022   6.22   8.83      15.05  17.82   12.28     104  46.15
2023   1.51   0.85       2.36   4.49    0.23      56  42.86
2024   9.52   7.68      17.20  20.14   14.27      88  42.05
2025   7.61  -6.71       0.89   3.58   -1.79      99  38.38
2026  11.63  -0.73      10.90  12.45    9.36      69  47.83
```

```
===== XAUUSD NY0800 P15E1 =====
variant         XAUUSD_NY0800_P15E1
skipped_days                    190
trades                         1213
win%                           37.5
R_gross                  200.032353
R_net                    103.920282
R_net2x                    7.808211
R/tr_net                   0.085672
long_R                    15.876631
short_R                   88.043651
n_long                          673
lose_run                         12
R_no_best5                 48.80368
trades/yr                156.516129
2019                      -2.454093
2020                       1.075516
2021                     -28.120683
2022                      23.785594
2023                      11.030435
2024                      57.251399
2025                      16.258247
2026                      25.093866
pos_years                         6
worst_year               -28.120683
bar_pts                           6
missed                          2,5
max drawdown (R): 57.6
per year (R with costs; long/short split):
dir    long  short  total_net  gross  net_2x  trades   win%
year                                                       
2019   0.03  -2.48      -2.45  21.61  -26.51     157  30.57
2020  -6.51   7.58       1.08  14.97  -12.82     172  36.05
2021  -4.68 -23.44     -28.12 -15.47  -40.77     154  35.06
2022   5.14  18.64      23.79  38.54    9.03     171  40.94
2023 -15.93  26.96      11.03  20.31    1.75      97  35.05
2024  25.06  32.19      57.25  68.05   46.45     157  45.86
2025  10.10   6.16      16.26  23.67    8.84     171  39.18
2026   2.67  22.43      25.09  28.35   21.84     134  35.82
```

```
===== GBPUSD LON0800 M15 =====
variant         GBPUSD_LON0800_M15
skipped_days                   133
trades                         227
win%                          46.7
R_gross                  38.189206
R_net                     0.490249
R_net2x                 -37.208709
R/tr_net                   0.00216
long_R                    1.261656
short_R                  -0.771407
n_long                         105
lose_run                         8
R_no_best5               -11.93816
trades/yr                29.290323
2019                       9.79454
2020                     -5.596775
2021                     -2.878373
2022                      0.702971
2023                      6.174531
2024                     -7.359172
2025                     -1.563131
2026                      1.215658
pos_years                        4
worst_year               -7.359172
bar_pts                          2
missed                 1,3,4,6,7,8
max drawdown (R): 19.2
per year (R with costs; long/short split):
dir   long  short  total_net  gross  net_2x  trades   win%
year                                                      
2019  6.87   2.93       9.79  15.30    4.29      35  57.14
2020 -3.46  -2.14      -5.60  -2.23   -8.96      28  35.71
2021 -3.20   0.32      -2.88   1.63   -7.39      29  41.38
2022 -2.32   3.02       0.70   5.03   -3.62      33  45.45
2023  3.44   2.74       6.17   9.97    2.38      22  59.09
2024 -6.55  -0.81      -7.36   1.04  -15.76      39  41.03
2025  3.08  -4.65      -1.56   1.89   -5.01      19  47.37
2026  3.39  -2.18       1.22   5.56   -3.13      22  50.00
```

```
===== EURUSD LON0800 M30 =====
variant         EURUSD_LON0800_M30
skipped_days                   132
trades                          50
win%                          44.0
R_gross                   0.703893
R_net                    -6.680106
R_net2x                 -14.064104
R/tr_net                 -0.133602
long_R                   -5.238698
short_R                  -1.441408
n_long                          23
lose_run                         8
R_no_best5              -14.319548
trades/yr                 6.451613
2019                     -0.813013
2020                     -5.092364
2021                       1.22426
2022                     -5.538191
2023                      -0.27546
2024                     -0.735267
2025                      3.689522
2026                      0.860407
pos_years                        3
worst_year               -5.538191
bar_pts                          2
missed                 1,3,4,6,7,8
max drawdown (R): 13.9
per year (R with costs; long/short split):
dir   long  short  total_net  gross  net_2x  trades   win%
year                                                      
2019 -1.42   0.61      -0.81   0.60   -2.23       8  50.00
2020 -0.85  -4.24      -5.09  -3.65   -6.53      11  27.27
2021  2.15  -0.93       1.22   2.00    0.45       5  60.00
2022 -4.43  -1.11      -5.54  -5.00   -6.08       5   0.00
2023 -1.13   0.85      -0.28   0.01   -0.56       2  50.00
2024 -1.18   0.44      -0.74   0.73   -2.20       8  50.00
2025  0.59   3.10       3.69   4.21    3.17       6  66.67
2026  1.02  -0.16       0.86   1.80   -0.08       5  60.00
```

### News days (only Oct 2024 – Jun 2026 have a checked calendar: US jobs report, US CPI, Fed decision days)
- **Nasdaq:** 23 trades on those days, +7.8 R (+0.34 R per trade) vs +0.10 R per trade on other days. Small sample, but news days
  did not hurt; trend days after the reclaim often come from news.
- **Gold:** 34 trades on those days, −0.8 R (−0.02 R per trade) vs +0.24 R per trade on other days. News days added nothing; the
  rule enters at 08:30 NY, exactly at most US releases, often into the first spike. The owner may want to look at this.
- **GBPUSD / EURUSD:** only 3 and 1 trades on these days (the window ends at 12:00 London, before US data) → nothing to measure.
No news filter is applied in any rule (owner's decision).

### Day of the week (2019 – 2026, R with costs)
Nasdaq: Monday +30.3, Wednesday +20.3, Thursday +14.9, Tuesday −7.3, Friday −3.8. Gold: Monday +42.1, Friday +29.5, Thursday +24.9,
Tuesday +6.2, Wednesday +1.2. Not used as a rule: no reason why it should repeat, and filtering by day would be fitting the past.

## 6. Verdict per market (against the owner's bar)
Bar: 1 ≥ 6 of 8 years positive · 2 no year worse than −8 R · 3 positive at double cost · 4 longs and shorts both positive ·
5 losing run ≤ 8 · 6 ≥ +0.08 R per trade · 7 positive without best 5 trades · 8 ≥ 40 trades a year.

| Market | Version | Bar points | Misses | My honest view |
|---|---|---|---|---|
| **Nasdaq** | VWAP reclaim, 15 min, ride to close | 6 / 8 | 2 (2019 −10.5 R), 6 (+0.077 R per trade, just under 0.08) | The best of the four. Positive in 7 of 8 years, both directions positive, still +22 R at double cost, max drawdown 22 R. Thin edge (about 0.08 R per trade); 2019 (low-volatility year, costs relatively large) lost. Worth an unseen test on 2016–2018. |
| **Gold** | EMA pullback after NY open, 15 min, 1 trade a day, ride to close | 6 / 8 | 2 (2021 −28.1 R), 5 (losing run 12) | Big total (+104 R) but uneven: 2019–2021 together −29.5 R, 2024 alone +57 R; max drawdown 57.6 R (more than half the account at 1% risk). Mostly shorts (+88 R) — longs only +16 R. Only +7.8 R at double cost. Treat as experimental. |
| **GBPUSD** | Band snap-back, London morning, 15 min | 2 / 8 | 1, 3, 4, 6, 7, 8 | No edge after costs (+0.5 R in 227 trades; +38 R before costs). Not tradable as is. |
| **EURUSD** | Band snap-back, London morning, 30 min | 2 / 8 | 1, 3, 4, 6, 7, 8 | Loses (−6.7 R) and trades ~6 times a year. Picked only by the fixed rule (2 bar points vs 1 for the 15-min version, which lost −6.4 R on 201 trades). Neither is usable. |

**Overall:** VWAP + EMA, as tested here, is not a strong edge on its own. It works best as a **trend-day tool on markets that trend
intraday (Nasdaq, and gold in recent years)**, using 15-minute bars and letting winners run to the close. In FX it does not beat costs.

## 7. Backup ideas (not tested; for a next round)
1. Nasdaq: combine the reclaim with the existing gap-fade knowledge (only trade the reclaim in the direction of the opening gap fill).
2. Gold: entry at 08:30 NY lands on US data releases; a rule to wait for the first 15-min bar after a release (owner decides on news).
3. FX: use the 17:00 New York rollover as the AP anchor (whole FX day average) on 30-60 minute bars, to cut the cost share further.
4. Real VWAP: if the owner's platform has volume-weighted VWAP (futures or index CFD with tick volume), re-test with it.

## 8. Checks done
- Independent spot check (`scripts/04_spotcheck.py`, `outputs/spotcheck.txt`): 8 random trades (Nasdaq and gold) rebuilt from
  raw minutes with a separate method; entry prices and every entry condition matched.
- No look-ahead: signals use only finished bars; entries at the signal bar's close; exits checked minute by minute starting the
  next minute; if stop and target hit in the same minute the stop counts; gaps through the stop fill at the worse price.

## Files
`TESTS_DECLARED.md` (plan, written before running) · `rules.md` (frozen rules) · `trades_<MARKET>.csv` (every trade: date, direction,
entry/exit in NY and Doha time, prices, R before cost / with cost / double cost, US news flag) · `scripts/` (vwlib.py helpers,
01 research, 02 backtest, 03 final stats, 04 spot check; run from inside `scripts/`) · `outputs/` (summaries, all trades per variant gzipped in `outputs/trades/`, weekly results, stats).
