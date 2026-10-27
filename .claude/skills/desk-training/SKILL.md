---
name: desk-training
description: Train the 3-agent crypto desk (Atlas, Hawk, Sage) as a team on a $500 PAPER account - a daily study session with scored forecast calls, a review after every closed trade, and a weekly report card. Use for the daily study run, when a team trade closes, for the weekly review, or when the owner asks how the agents' training is going. PAPER ONLY.
---

# Desk training: Phase 1, the team learns together

Owner's decision (27 Oct 2026): before any real money, the three agents must be properly trained.
- **Phase 1 (now): team training.** Atlas, Hawk and Sage study the market and paper trade together
  on a **$500 paper account** (`python3 trading/account.py`).
- **Phase 2: individual work.** Only after Phase 1 graduates do the agents also work on their own.
- **Real money:** never without the owner's explicit OK, and only after the locked 80-wins-out-of-100 goal
  in CLAUDE.md is met.

Paper only. Never call any Co-Invest order or enable tool. Never invent a headline, number or source.

## Graduation from Phase 1 (checked by `account.py`)
- At least 50 closed team trades.
- Balance above $500.
- $1.20+ earned per $1 lost.
- Biggest drop of 10% or less.
- At least 60 scored forecast calls, with 60% or more right.

## The memory the team trains from
`trading/journal/lessons.md`: every agent reads it before every session, and every review adds to it.
Proven lessons, meaning ones confirmed 3 or more times, are copied into the relevant agent's file in
`.claude/agents/`, so they become part of that agent's skill.

## 1. Daily study session (once a day, the 12:10 UTC desk run)
Run it even when the scanner has no candidate. This is the practice that builds the skill.
1. **Atlas** reads `lessons.md`, then studies the market. Cover:
   - BTC and ETH trend, and money flows (ETF flows, stablecoins).
   - The meme coin sector and social buzz.
   - Funding rates, and the next 48h calendar.
   - Brief: market weather, three sourced, dated facts, and what would change the view.
2. **Hawk** reads `lessons.md` and Atlas's brief, then studies the real 4h and daily charts of BTC,
   ETH and the strongest-moving meme coin.
   - For each: direction for the next 24h, the key levels, and how sure he is.
   - If one chart has a real setup, he writes a full plan: entry, stop where the idea is wrong,
     small target, and hold time.
3. **Sage** reads `lessons.md`, both briefs and the gate (`journal/gate.json`).
   - Agrees or disagrees with each 24h direction.
   - Decides on any plan with the Step 3 checklist in `.claude/skills/trading-desk/SKILL.md`.
4. **Record:**
   - **Calls:** only where all three agree: `python3 calls.py add SYMBOL up|down 24 "reason"`.
     Make 2 or 3 calls a day; "no clear view" is allowed and is not recorded.
   - **Approved plans:** `python3 desk_journal.py add` or `limit`, as in the trading-desk skill.
   - **Session file:** `journal/YYYY-MM-DD-study.md`.

## 2. Review after every closed team trade (version HWK) or scored call
Within the next desk run, the team answers in 4 lines. Append the answers to `lessons.md`:
- What we expected and why.
- What actually happened, with the real numbers.
- Was it a good decision with an unlucky result, or a bad decision? Which agent's part failed: research,
  chart plan or final check?
- One concrete lesson, as a rule someone could follow next time.

## 3. Weekly report card (Sunday's 12:10 run)
Sage writes `journal/YYYY-MM-DD-week.md` with:
- Account balance and the trades of the week.
- Forecast-call hit rate.
- What each agent did well and badly.
- Which lessons were confirmed or proven wrong.
- One change to try next week.
Edit agent files or this skill when a lesson is proven, and log each change in `journal/CHANGELOG.md`.

## Reporting to the owner
Only when `account.py` prints `GRADUATED=yes`, when a desk version passes the 80/100 goal, or when
something truly blocks the work.
