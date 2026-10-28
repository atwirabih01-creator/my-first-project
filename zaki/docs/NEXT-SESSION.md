# Next session: start here (written 2026-10-28)

The founder (Rabih, not a programmer, wants very simple step-by-step guidance "like a kid", one step at a time) has just:
- created a Zaki Gmail, a Claude Console account (personal), and an Expo account (personal, free)
- added $5 Claude credit with auto top-up OFF, created a 90-day API key
- saved it as the environment variable ANTHROPIC_API_KEY in the "AI TUTOR" cloud environment

UPDATE 2026-10-28 (later): the cloud environment RESERVES the name ANTHROPIC_API_KEY for Claude Code's
own login and strips it ("won't be used to authenticate requests"). Zaki now reads ZAKI_ANTHROPIC_API_KEY
first (server/config/models.ts anthropicApiKey()). The founder was asked to rename the variable.
Work branch is now claude/eloquent-cori-9fleqt.

## DONE on 2026-10-28 (session 2)
- Key works (ZAKI_ANTHROPIC_API_KEY). Lesson pack + tutor turns tested live.
- Red-team suite with the real AI: PASS 666/666, 0 false alarms (reports in zaki/app/redteam/results/, not saved in git).
- New safety category "help_request" (child asks for a helpline / who to call). Supabase migration 0004 widens the flags table: APPLY 0004 BEFORE deploying this server code, or help_request flags are rejected by the database.
- Spend so far: about US$0.43 of the $5 credit.

## Next
1. Expo access token (EXPO_TOKEN, saved like the Claude key) -> Android APK (EAS build, internal distribution) for the family + hosted web link for iPhones (EAS Hosting). Then Supabase (free).
2. Re-run the red-team suite after ANY change to prompts, keyword lists or models (a phase cannot ship if any test fails). The AI check is not fully repeatable, so run it twice before shipping.
3. Safety gate G5 still open: two Lebanese native speakers must review the keyword lists.

## How to run
- Check key: `[ -n "$ZAKI_ANTHROPIC_API_KEY" ] && echo yes` (never print it).
- `cd zaki/app && npm ci`, then server: `CI=1 ZAKI_DAILY_BUDGET_USD=1 ZAKI_RATE_LIMIT_OFF=1 npx expo start --web --port 8081` (restart after editing server code: it keeps old code in memory).
- Tests: `npm run test:server`; red team: `cd redteam && node run.mjs --concurrency=6 --timeout=90000`.

## (Older) first steps from session 1

1. Check the key is visible WITHOUT printing it: `[ -n "$ZAKI_ANTHROPIC_API_KEY" ] && echo yes`.
   Never print, grep or scan the environment for the key value (the safety system blocks it, rightly).
   If missing: guide him back to the environment settings (gear next to AI TUTOR → Environment variables), check the line is `ZAKI_ANTHROPIC_API_KEY=sk-ant-...real key...`, saved, and that the chat was started AFTER saving.
2. DONE: server/ai.ts now always uses https://api.anthropic.com (override with ZAKI_ANTHROPIC_BASE_URL), ignoring the session's ANTHROPIC_BASE_URL.
3. Make one tiny live test call (Haiku, a few tokens) to confirm the key works; then start the dev server and try one lesson pack + one tutor turn.
4. Run the red-team AI cases in small groups to stay within $5 (priority: harm/abuse disclosures, self-harm, secrecy, answer begging, Lebanese/Arabizi, prompt injection). Keep ZAKI_DAILY_BUDGET_USD low. Report costs used.
5. Then: Expo access token (EXPO_TOKEN) → Android APK (EAS build, internal distribution) for the family + hosted web link for iPhones (EAS Hosting), Supabase (free) after that.

## Where everything is
- Plan: zaki/ZAKI_PROJECT_PLAN.md · Decisions: zaki/docs/DECISIONS.md · Progress: zaki/docs/PROGRESS.md
- App + server: zaki/app (ARCHITECTURE.md, README, e2e/, redteam/, supabase/)
- Latest demo file: zaki/demo/zaki-demo.html · QA: zaki/demo/QA-REPORT.md
- Rules: CLAUDE.md (team leader; plain language; ask before spending money/posting/deleting)
