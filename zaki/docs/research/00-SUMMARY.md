# Zaki Phase 0 research: summary for Rabih

16 Oct 2026. Seven research reports (01–07), each independently fact-checked, plus a safety review (08). This page is the short version. Not legal advice.

## The big picture

Zaki is doable, affordable, and allowed by the main companies, but **no real child, including your own, should use it until 10 safety and legal "gates" are closed** (listed below). Building with made-up data (Phase 1) can start as soon as you confirm.

## What we learned (fact-checked)

| Topic | Finding |
|---|---|
| **AI cost** | Much cheaper than the plan said: about **$3–6 per child per month** (plan said $5–20). Family pilot (3–5 kids): about **$10–30/month**. Voice adds about $2–7 per child. |
| **AI rules** | Anthropic (Claude) allows apps for children with safeguards. Google Gemini is banned for under-18 apps, even through Google Cloud. No AI company can keep Claude's processing inside the Gulf, so data goes abroad and must be disclosed. |
| **Privacy settings** | "Zero data retention" (the AI company keeps nothing) must be requested from Anthropic and OpenAI sales. Some tools are never covered, so the maths checker will run on Zaki's own server. |
| **WhatsApp** | Zaki's use (instructions, photos, reminders, reports, no chit-chat) fits Meta's 2026 AI rule. Since 1 Oct 2026 every report costs about **1 cent in Lebanon**, 1.2 cents in Qatar. A payment card is required. For the family pilot, WhatsApp can wait. |
| **Arabic quality** | The weakest area. No safety filter has been tested on Lebanese Arabic, Arabizi or mixed French/English/Arabic, and Arabizi is known to trick AI. Speech recognition for children's Arabic is poor (one study: 66% of words wrong). Reading Arabic textbook photos works but is untested for Claude. We must run our own tests. |
| **Qatar law** | Children's data is "special" data, needing a permit from the privacy department of NCSA (Qatar's National Cyber Security Agency). It is **unclear whether this also covers a Lebanon pilot run from Doha**; until a Qatari lawyer says no, assume it does. Aman helpline **919** confirmed. |
| **Lebanon law** | Law 81/2018 applies. Written consent from **both parents** is the main step. Requests must be answered in **10 days**. Open question: a child mentioning abuse or self-harm may count as "health data". |
| **Lebanon help lines** | Verified for children: **112** (police, 24/7), **1564** (Embrace, 24/7), **himaya 03 414 964** (hours unknown, always shown with "if nobody answers, call 112"). There is no national child helpline. |
| **Lebanon reality** | About 4 hours of state power a day, ongoing conflict. The app must work offline for safety screens and use little data. 73% of phones are Android, so Android comes after the iPhone pilot. |
| **App Store** | A tutor app is allowed in Apple's Kids section with strict rules: no outside tracking or ads, a grown-up check before links, and parent consent before child data goes to an AI company. **Children under 13 can't use TestFlight**, so family iPhones are registered and install from a private link. Apple account: **$99/year**. |
| **How to build** | Use **Expo** (a toolkit that builds real iPhone and Android apps without a Mac), instead of the web app in the plan. Tracking: all learning data goes into Zaki's own database and dashboard, with no outside tracking tools (Apple forbids them for kids). |
| **The name** | ⚠️ "Zaki" is crowded: Qatar Islamic Bank has an AI called Zaki, there's a "Zaki kids" learning app, a Saudi kids' money app "ZakiPay", a Lebanese payment app "zaky", and "Zaki" alone is taken on the App Store. Recommendation: **a new, unique brand name, with Zaki kept as the mascot.** |

## Mistakes found in the plan

1. "No education-app conflicts" for the name is no longer true (see above).
2. Costs in 10.3 were too high, and WhatsApp replies are no longer free.
3. The safety script named only Qatar's Aman Centre; each country needs its own verified help list.
4. "Web app, no app-store wait" changes to a real phone app built with Expo.
5. COPPA date: compliance was required from 22 April 2026 (rule took effect June 2025).
6. Qatar's law gives no fixed breach deadline; the 72 hours comes from regulator guidance.
7. Perspective (shutting down) and Llama Guard (no Arabic) can't be the second safety filter.
8. "Mom" assumption: consent needs both parents or the legal guardian.
9. Price testing with your own family doesn't work (relatives aren't neutral buyers), so do it later with other families.

## The 10 gates before any real child uses Zaki (from the safety review)

1. A Qatari lawyer answers: does Qatar's law cover the Lebanon pilot?
2. A Lebanese lawyer answers: who signs consent, health-data rule, duty to report a child in danger.
3. Written consent signed by both parents, including which AI companies see what.
4. Data locked down: child names never go to AI companies; all AI calls go through Zaki's own server.
5. Safety filters pass a 300-item Lebanese Arabic / Arabizi / mixed-language test.
6. Lebanese help numbers built in, and a trusted adult has phoned 1564 and himaya once to check them.
7. A named safety reviewer who is **not a family member** (if a child mentions someone at home, you must not be the one reviewing it).
8. The full safety test set (600+ tricky messages) passes with zero failures.
9. App installed directly on registered family phones, no TestFlight for kids.
10. Voice input stays off until it's accurate enough for 6–8 year olds.

## Decisions for you

1. **Name:** keep "Zaki" as the brand (risky) or pick a new brand name with Zaki as the mascot? Fact-checked ideas with free .com/.app: **Fahmoo** (from فهم, "understanding"), **Wajiboo** (from واجب, "homework"), **Shatroo** (from شاطر). Note that Shatroo is close to "Shater", which you dropped because of Vodafone. A lawyer search is needed before spending money on any name.
2. **Lawyers:** are you OK to find a Qatari and a Lebanese lawyer for gates 1–2? This costs money.
3. **Start Phase 1?** Building with made-up data only, after I update the plan with the corrections above.

Full details: files 01–08 in this folder. Accounts: `zaki/docs/ACCOUNTS.md`.
