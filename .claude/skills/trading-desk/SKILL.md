---
name: trading-desk
description: Run one session of the 3-agent crypto / meme-coin trading desk — scanner finds candidates, Atlas studies, Hawk analyses, the gate blocks known losers, Sage decides; all three must agree. Use when the owner asks to run the desk, research the market, find trades, or paper trade, and on every scheduled desk wake-up. PAPER ONLY.
---

# Trading Desk — one session

Owner's locked goal (CLAUDE.md): one desk version reaches **80 wins out of 100 closed paper trades**,
with **profit after fees** (≥ $1.20 earned per $1 lost) and a **biggest drop ≤ 10%**. The agents
**think**: Atlas studies → Hawk analyses → Sage checks and decides. All three must agree. Aim: consistency.

How proof works: the backtest only **blocks known losers** (`trading/journal/gate.json`); the agents'
judgment is proven **forward** on the paper scoreboard.

## Safety (never bend these)
- **Paper only.** Never call any Co-Invest order or enable tool (`execute_*`, `close_*`, `modify_*`,
  `enable_*`, `update_leverage`, deposit/withdraw). Never spend money or sign up for anything.
- Never invent a headline, number or source. If a connector is limited or fails, say so.

## Step 0 — housekeeping and scan (cheap, no AI agents)
```
cd trading
python3 desk_journal.py update     # fill waiting plans, close finished paper trades from real prices
python3 desk_journal.py score      # scoreboard
python3 scanner.py                 # 40 coins; writes journal/latest_scan.json
```
- If `journal/gate.json` is missing or older than 7 days: `python3 gate.py` (a few minutes).
- **If the scan has no candidates and no waiting plan needs a decision: stop here.** Write one line in
  `journal/scan_log.md` and end the session. Most sessions end here; that is normal.
- Count open ideas (`journal/paper_trades.csv`, status `open`, distinct `idea_id`). If 3 are open, stop:
  no new ideas until one closes.

## Step 1 — Atlas studies (agent "Atlas (Trading Researcher)")
Give Atlas the scan candidates. Atlas researches **each candidate coin** and the market weather:
news of the last 24–48h (Bigdata.com `bigdata_search`, one topic per search), unusual volume
(Co-Invest `get_news`, read-only), social buzz (LunarCrush meme sector), money flows. For each
candidate: bias, 3 sourced reasons with dates, what would prove it wrong, and a clear
"supports / doesn't support the scanner's direction". Thin evidence is flagged.

## Step 2 — Hawk analyses (agent "Hawk (Trading Sniper)")
Give Hawk the scan and Atlas's brief. Only for candidates Atlas supports, Hawk studies the real
4-hour and daily chart and writes a plan: direction, entry (now, or a zone with an expiry time),
stop-loss at the price where the idea is **truly wrong** (the hard exit), a **small target the price
reaches often**, and a max hold time. Everything else: "no trade — wait".

## Step 3 — Sage checks and decides (agent "Sage (Trading Professor)")
Give Sage the scan, Atlas's brief and Hawk's plans. Sage approves a plan only if:
- Atlas and Hawk agree on direction, with sourced, dated reasons.
- The gate does **not** mark this setup/side/coin group as a known loser (the scan row's
  `versions_allowed` is not empty). For a deeper look Sage may run
  `python3 check_setup.py SYMBOL SETUP --side long|short --desk`.
- The plan's loss if wrong is no more than ~3× its target (so 80% wins still leaves a profit after fees).
- Risk: at most 3 open ideas; no two open ideas that are really the same bet; no major scheduled
  event (e.g. a Fed decision) inside the hold time unless the plan is about it.
One line per plan: APPROVED or REJECTED, and why.

## Record approved plans
- Enter now:
  `python3 desk_journal.py add SYMBOL long|short "atlas" "hawk" "sage" SETUP STOP TARGET HOLD_HOURS`
- Enter only if price reaches a zone:
  `python3 desk_journal.py limit SYMBOL long|short LOW HIGH EXPIRES_HOURS "atlas" "hawk" "sage" SETUP STOP TARGET HOLD_HOURS`
SETUP is the scan's `situation`. The journal records Hawk's exact plan as version **HWK**, plus every
desk version (D01…) that is not a known loser for this setup. All are scored automatically from real prices.

## Write it down, save it
- Session file `journal/YYYY-MM-DD-HHMM-session.md`: scan, brief, plans, votes, decisions.
- Every 5th session with trades: review the scoreboard. You may improve the agents' files or this skill,
  or add NEW versions (D15, …) in `desk_journal.py`. Never change an existing version's numbers; log
  the change in `journal/CHANGELOG.md`.
- Commit and push to the working branch.

## Report to the owner
Only when a version shows PASSED=True in `desk_journal.py score`, or something truly blocks the work.
Then in plain words: what passed, the numbers, and that real money still needs the owner's OK.
