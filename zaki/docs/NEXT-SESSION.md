# Next session: start here

## 2026-11-03 (night): v1.2.0 — homework photos, story lessons, calm sensitive topics
- APK: https://expo.dev/artifacts/eas/KBtXVd6jhtKmizsnImIl2ambLqtkC6VCWKwGK1JgeTM.apk (new native module expo-image-manipulator + camera permission). Server redeployed.
- Live red team after fixes: tutor all categories + homework priority pass (re-run of changed groups 203/203 + 105/105).
- BLOCKER: Anthropic credit EXHAUSTED (API 400 "credit balance is too low"). App now shows the friendly budget message. Founder asked to buy ~US$10, auto top-up OFF. After "done": test one live lesson-pack (story style) + one homework turn, then tell the founder to install.
- Server 500s now include `kind` (error name:status, no content) for debugging.


## 2026-11-03 (later): v1.1.0 live — grades 1-9 + age, curriculum, Help me with today's lesson, Homework help
- APK: https://expo.dev/artifacts/eas/jTBA9guyPco8jLg_ATh2DEIcNLxq4X-K-0d-fVXsUL4.apk ; server redeployed.
- Red team with real AI: tutor all AI categories pass (after R8-015 fix: never repeat haram/sect words when declining); homework priority categories 200/200 (+R8/answer-begging 60/60). Spent ~US$0.36 on tests today.
- Open: parent homework photos not built; age not synced to server; consent version 2026-11-03.1 (families re-confirm); typed topic "World War 2" gets the gentle check-in; raise daily limit + Supabase before family sharing; "meet my friend" false alarm.


## 2026-11-03: lesson cost fix (live)
- Founder hit "Zaki will prepare this lesson soon": one lesson build cost ~US$0.3-0.9 (Sonnet research with 4 web searches + 32k-token pack with medium thinking, up to 2 tries) and the 0.50 cap stopped it halfway (paid, then thrown away).
- Fixed: research on Haiku, max 2 searches; pack effort low; cap checked once at build start (capCheckedByCaller). Measured: Fractions 8 steps, 30 s, US$0.043. Live water-cycle build OK (7 steps, 24 s). No app reinstall needed.
 (written 2026-10-28)

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

## 2026-10-31 (session 3, end): AI IS LIVE on https://zaki-tutor.expo.app
- Founder added ZAKI_ANTHROPIC_API_KEY on Expo (key "zaki-server", visibility SENSITIVE: "Secret" does NOT reach EAS Hosting, only EAS Build). Redeployed, /api/health ai:true.
- 4 live checks passed (Roblox stranger -> help screen, Arabizi self-harm -> help screen, answer begging -> hint, off-topic -> back to lesson).
- WARNING: the hosted /api/health showed spentUsd 0 after AI calls: the daily cap is counted in memory per server copy, so it is NOT a reliable cap on EAS Hosting. Real limit = Claude credit (~US$1.60, auto top-up OFF). Supabase fixes this: do it next.
- Founder: the US$0.50 daily limit is ONLY for his own trial. Before sharing with family: raise the limit (ask him how much), set up Supabase, fix the "meet my friend" false alarm.

## 2026-10-31 (session 3, later): account back, AI safety suite passed
- Credit left: about US$1.69 (founder). Founder said: use it for the trial, no top-up.
- Red team (small batches, local server, cap $0.30): deterministic 188/188, 0/44 false alarms; every AI category 0 failures after one fix (R4-006: Roblox stranger "wants to meet", keywords added). Cost about US$0.09.
- Known false alarm (old, safe side): "I want to meet my friend" -> fear (an Arabizi fear phrase skeleton collides). Fix later.
- EAS: ZAKI_DAILY_BUDGET_USD is now 0.5. The AI key is NOT on EAS yet: the auto-mode safety rule blocks Claude from copying the key to Expo. The FOUNDER adds ZAKI_ANTHROPIC_API_KEY on expo.dev (project zaki -> Environment variables, production, Secret). Then Claude redeploys (command below) and checks /api/health says ai:true + one tutor turn.

## DONE 2026-10-30 (session 3): demo server online + Android build
- Expo project @ai.zaki/zaki (ID 6c405a9c-ac25-4a0e-afad-32b45183d2a0), owner set in app.json.
- EAS env (production): ZAKI_REVIEWER_CODE (sensitive; given to the founder in chat), ZAKI_DAILY_BUDGET_USD=1. NO AI key.
- Server live: https://zaki-tutor.expo.app (/api/health -> ai:false). eas.json ZAKI_SERVER_URL points there.
- Click-through test (e2e/e2e.js) against the live site: 145/148; the 3 misses are timing in the test (it reads the screen before the slower live site has drawn it), screens checked by eye.
- Android preview build: https://expo.dev/accounts/ai.zaki/projects/zaki/builds/e52a95da-3f42-4797-84a3-e71b44823843
- 2026-10-31: v1.0.1 APK (teach-first lessons, big wrong-answer panel, no help button, lively UI): https://expo.dev/artifacts/eas/H4u8SW2xOJ_pTREbl38BJE-Ko1x8ldyyGa3tcUxTltY.apk
- To redeploy the server: `cd zaki/app && rm -rf dist && npx expo export -p web && npx eas-cli deploy --prod --environment production --non-interactive`.

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
