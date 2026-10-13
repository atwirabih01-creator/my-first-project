# XAUUSD London / New York box strategy - agreed rules

All times New York, 5-minute chart, risk 1-1.5% per trade, one trade per day.

## London
1. Asian range: highest / lowest price 20:00-00:00.
2. From 02:00 price sweeps the Asian high (look for sells) or low (look for buys).
3. Box: 03:00-04:00 highest / lowest wick.
4. Break: a candle closes outside the box on the side opposite the sweep.
5. Fibonacci on the move after the break; enter when a candle wicks into the
   0.5-0.75 zone and closes back out. Stop beyond the box. Target: other side of Asia.
6. Cancelled if the box is broken on both sides. No entry by 09:30 -> New York setup.

## New York (only if no London trade)
Box 09:30-10:30, first clear close outside sets direction, same entry and stop.
Target: nearest order block, fair value gap or liquidity (the test uses nearest
untouched swing / session high or low at least 1R away).

## Owner corrections (keep these)
- 2026-10-13: Trades on 29 Sep, 1 Oct and 7 Oct 2026 rejected: "the break was not a
  full body close and was not clear, and we didn't see many red candles and a pullback".
  So: the break candle must be a strong full-body candle closing clearly outside the box
  (test: body >= 50% of candle, close >= 15% of box height beyond it), and price must push
  on with several candles making new lows/highs (test: 3) before the pullback entry.
  The 29 Jul 2026 London sell was accepted.
