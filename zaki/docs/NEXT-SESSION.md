# Next session: start here (written 2026-10-28)

The founder (Rabih, not a programmer, wants very simple step-by-step guidance "like a kid", one step at a time) has just:
- created a Zaki Gmail, a Claude Console account (personal), and an Expo account (personal, free)
- added $5 Claude credit with auto top-up OFF, created a 90-day API key
- saved it as the environment variable ANTHROPIC_API_KEY in the "AI TUTOR" cloud environment

UPDATE 2026-10-28 (later): the cloud environment RESERVES the name ANTHROPIC_API_KEY for Claude Code's
own login and strips it ("won't be used to authenticate requests"). Zaki now reads ZAKI_ANTHROPIC_API_KEY
first (server/config/models.ts anthropicApiKey()). The founder was asked to rename the variable.
Work branch is now claude/eloquent-cori-9fleqt.

## First thing to do in the new session
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
