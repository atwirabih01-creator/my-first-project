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

## 2026-10-30: BUILD THE ANDROID APP IN DEMO MODE (AI connects later)
- The founder's Claude (Anthropic) account is ON HOLD since 2026-10-29 for "unusual activity", most likely the large red-team runs (3,000+ child-safety test messages). The founder requested a review (about 10 days).
- So: do NOT use ZAKI_ANTHROPIC_API_KEY, do NOT put it on the hosted server, do NOT run the red-team suite with the AI. When the account is back: run safety tests in SMALL batches only, and tell the founder first.
- Plan now (needs EXPO_TOKEN in the environment):
  1. `cd zaki/app && npm ci`; `npx eas-cli whoami` to check the token.
  2. `npx eas-cli init` (project "zaki"), then put the server online WITHOUT the AI key: set ZAKI_REVIEWER_CODE (random, tell the founder) and ZAKI_DAILY_BUDGET_USD=1 on EAS; `npx expo export -p web && npx eas-cli deploy --prod`. Check /api/health says ai:false.
  3. Put that URL in eas.json `ZAKI_SERVER_URL`; `npx eas-cli build -p android --profile preview --non-interactive`; give the founder the install link (Android: allow install from this source).
  4. Later, when the account is back: `eas env:create` the key on the server + redeploy. Phones switch to the real AI with no reinstall.
- Founder tests as a child first, then shares with family and his brother.

## 2026-10-29 status
- The Claude key in ZAKI_ANTHROPIC_API_KEY became INVALID (401) on 2026-10-29. Founder must create a new key and replace it, and add EXPO_TOKEN. Then: re-run the red-team suite WITH the AI (twice) before building.
- Child-safety fixes done (see PROGRESS.md). Open, needs people not code: Arabic child texts speak to boys only (needs a Lebanese reviewer or a girl/boy setting); Supabase so the hosted server keeps safety alerts.
- The founder decided: no lawyer checks for the family test (DECISIONS.md).

## Android app (prepared 2026-10-29)
- Ready in the code: android package com.zaki.tutor, eas.json profile "preview" (APK, internal), app.config.js reads ZAKI_SERVER_URL into expo-router `origin` (the phone sends /api/* there). Android bundle and server export both build.
- Waiting on the founder: EXPO_TOKEN in the AI TUTOR environment, then a NEW chat.
- Then (builder): `npx eas-cli init` -> set server env on EAS (ZAKI_ANTHROPIC_API_KEY from this session's env without printing it, ZAKI_DAILY_BUDGET_USD=1, ZAKI_REVIEWER_CODE) -> `npx expo export -p web && npx eas-cli deploy --prod` -> test /api/health + one tutor turn on the live URL -> put the URL in eas.json ZAKI_SERVER_URL -> `npx eas-cli build -p android --profile preview` -> give the founder the install link.
- Before the family uses it: Supabase (without it, the hosted server keeps safety flags and the spending cap only in memory) + the open safety gates (G2, G3, G5, G6, G7).

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
