# Wipe-out bounce study: audit result (Reality Checker, 30 Oct 2026). The PASS is WITHDRAWN.
- **Timing bug (look-ahead).**
  - Binance metrics `create_time` marks the START of a 5-minute window. The price implied by OI value ÷
    OI contracts matches the 1m close 5 minutes later.
  - So the signal used OI known only at the entry moment, not before it.
  - With OI lagged one snapshot (honest timing), 0 of 972 futures settings pass TRAIN, and D8/P5 drops
    to $0.94 per $1 lost.
  - Under the study's own rules: STOP, with no exam.
- **Fragile even before the fix.**
  - Changing which coins are taken when several fire at once fails the futures pass 39 times in 200.
  - Adding 0.05% slippage per side fails both fee sets.
- **Not a wipe-out signal.** OI value includes price, so "OI −5% with price −5%" means almost no positions
  were closed; the signal is mostly just a price drop.
- **The same timing assumption is in walkforward_oi.py.** That test already failed; the fix can only
  make it worse.
- **Rule for future tests:** use a metrics snapshot only if create_time ≤ signal-bar close − 10 min
  (that is, its window has closed).
- The json and CSV files here are kept for the record only and are INVALID as evidence.
