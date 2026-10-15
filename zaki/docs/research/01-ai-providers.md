# Phase 0 research 01: AI providers (Anthropic, OpenAI, Google)

Checked: 2026-10-15. All sources are official provider pages unless marked otherwise.
Status labels: **Confirmed** (an official page says it), **Partly confirmed** (official page says part of it, or only a non-official source), **Not found** (no official page says it).

---

## Plain-language summary

- **Claude (Anthropic) can be used for a children's homework app.** Anthropic's rules do not set a minimum age and do not ban apps for under-13s. They do require safety steps: content filtering, age checks, monitoring and reporting, safety guidance for children, telling users they are talking to an AI, and following child-privacy laws.
- **The AI is much cheaper than the plan says.** The new small Claude model (Haiku 5.5) costs about one-tenth of the old price. With current prices, AI costs about **$2–3 per child per month** in the lean setup and **$4–6** if everything runs on the bigger model. The plan's estimate was $5–20.
- **"Zero data retention" (the provider keeps nothing) is not a switch you can turn on yourself.** You have to ask each company's sales team, and they decide whether to approve it. Without it, Anthropic deletes data within 30 days and never uses it to train its AI.
- **One planned feature is not covered by zero data retention.** The "re-check the maths in real code" step uses Anthropic's code-running tool, which keeps data for up to 30 days. Fix: run that checking code on our own server, or send it only the bare question with no child details.
- **OpenAI's free safety filter is a good fit.** It is free, checks both text and pictures, and keeps no copy of what it checks. But OpenAI says apps must not send personal data of children **under 13** to OpenAI unless zero data retention is in place first. So we either get OpenAI's approval or never send children's messages to OpenAI.
- **Google's Gemini cannot be used, and that includes Google Cloud.** Both the Gemini API and Google Cloud's business AI terms ban use in any app likely to be used by under-18s. Google Cloud does have a Doha (Qatar) data centre, but Gemini and Claude do not run there.
- **A family pilot of 3–5 children would cost about $10–30 a month in AI.** There is also roughly $5 each time we run the full safety test set.
- **The phone app must never hold the AI "keys".** All AI calls should go through our own server. Both Anthropic and OpenAI say secret keys must not be put inside apps. Anthropic does offer a special iPhone sign-in ("App Attest"), but our safety checks need a server anyway.
- **No major AI provider keeps Claude inside the Gulf.** Claude runs only in the US or "anywhere in the world". Children's messages will be processed outside Qatar and the GCC, so we must record this as a cross-border transfer under Gulf data laws. OpenAI has a UAE option, but only after special approval.

## What this changes in the plan

| Plan section | What it says now | What it should say | Status |
|---|---|---|---|
| 10.3 Costs | AI $5–10 lean, ~$20 heavy per child/month. 50 kids ~$300–1,200; 500 kids ~$2,600–11,500 | **Lean ~$2–3, heavy ~$4–6 per child/month** (with prompt caching; up to ~$15 heavy if caching fails). AI cost alone: 50 kids ~$100–300, 500 kids ~$1,000–3,000. Other running costs (hosting, WhatsApp, voice) come on top | **Outdated (too high)** |
| 7 Accuracy | "Verifier (Haiku 5.5 with Anthropic's code-execution tool)" | Code execution is **not** covered by zero data retention (keeps data up to 30 days). Either run the Python checker on our own server (Claude's "client-side tool" route), or send it only the anonymised question text | **Needs change** |
| 8.2 Privacy | "Use the AI providers' zero-data-retention / no-training settings" | No-training is automatic on Anthropic's business terms. Zero data retention needs a **request to Anthropic sales**, and OpenAI has its own approval process. Even with it, these features stay outside it: code execution, Files API, Batch API, Agent Skills, Managed Agents, and web search/fetch "dynamic filtering". Anthropic may keep flagged conversations up to 2 years whatever the setting | **Needs detail** |
| 8.1 / 10.1 Moderation | OpenAI omni-moderation on every child message | OK technically (free, text + images, no retention on that endpoint). But OpenAI says **no personal data of under-13s without ZDR in place first**. Apply for OpenAI ZDR before the pilot, or strip personal data before sending. OpenAI makes **no official claim about Arabic quality**, so our own Arabic/Gulf/Arabizi test set is essential | **Needs condition** |
| 7 Gemini note | "Re-check if using Google Cloud (Vertex AI) terms later" | **Resolved: Google Cloud terms also ban it** (Service Specific Terms §20(d)). Vertex AI is now called "Gemini Enterprise Agent Platform" | **Answered** |
| 10.1 Database note | "alternative: Google Cloud Doha region" | Doha region (`me-central1`) exists for normal cloud services (servers, storage). Gemini and Claude are **not** offered there | **Confirmed, with limit** |
| 7 Models | Sonnet 5.5 main, Haiku 5.5 light | Names correct. Haiku 5.5 is now so cheap that it can do most tutoring turns. Keep each Haiku request under 100,000 tokens (above that the price is 5x) | **Confirmed** |
| 7 Second opinion | "OpenAI's small model" | Current small model: **gpt-6-luna**, $0.10 in / $0.50 out per million tokens | **Update name** |
| 8.5 / 8.1 | Zaki says it's an AI each session | Required by Anthropic's usage policy: disclosure at the start of each chat session or in the interface | **Confirmed** |
| 10.3 (new) | n/a | **Family pilot (Lebanon), 3–5 kids: ~$10–15/month lean, ~$20–30/month heavy**, plus ~$5 per full red-team test run | **New** |
| 10.1 Stack (now a native iOS app) | "Next.js web app (PWA)", AI called from server routes | Keep **all AI calls on our server**: no API keys in the app, so moderation, safety script, parent alerts and daily caps can't be bypassed. Anthropic's App Attest (direct iPhone-to-Claude calls) exists but would skip our safety layer. Don't use it for children's chats | **Needs change** |
| 14 | Re-verify Anthropic usage policy | A new Anthropic Usage Policy takes effect **12 Nov 2026**. Re-read it after that date | **New item** |

---

## 1. Anthropic (Claude)

### 1.1 Rules for organisations serving minors

Source: Anthropic, "Guidelines for organizations serving minors", https://support.claude.com/en/articles/9307344 (last updated 16 Mar 2026; checked 2026-10-15).

- **Allowed, with safeguards. Confirmed.** Organisations may let minors use their products built on Claude if they follow the guidelines and applicable laws. The page sets **no minimum age and does not mention under-13s**. A kids' app for ages 6–12 is not banned. The conditions are the safeguards below plus legal compliance. (The page does not say "under-13 is allowed" in so many words. It is simply not restricted.)
- **Required safeguards. Confirmed.** The page lists:
  - "Age verification systems to ensure only intended users can access the product"
  - "Content moderation and filtering to block inappropriate or harmful content"
  - "Monitoring and reporting mechanisms to identify and address potential issues"
  - "Educational resources and guidance for minors on safe and responsible use"
  - Anthropic **may provide a child-safety system prompt**, which should be used as part of a wider set of measures. **Action:** ask Anthropic for it when we open the account.
- **AI disclosure. Confirmed.** "Organizations must disclose to their users that they are interacting with an AI system rather than a human."
- **Legal compliance. Confirmed.** Organisations must follow all child-safety and data-privacy rules (COPPA is the example) and should say so publicly, e.g. on their website.
- **Enforcement. Confirmed.** Anthropic runs periodic audits. A high rate of violations can lead to required changes, then suspension.
- **No pre-approval step. Partly confirmed.** The page describes no application or approval process.

Usage Policy: https://www.anthropic.com/legal/aup (shows "Effective November 12, 2026", with a link to the previous version; checked 2026-10-15).
- Defines a minor as anyone under 18. Strong bans on anything that sexualises, grooms or exploits minors. **Confirmed.**
- Consumer-facing chatbots "must disclose to users that they are interacting with AI rather than a human … at the beginning of each chat session or in the product interface." **Confirmed.**
- "High-risk" education uses are only admissions, ranking, consequential grading, licences, and misconduct decisions. Tutoring and homework help are **not** listed as high-risk. "General information or educational content" is excluded. **Confirmed.** Zaki's internal quizzes are not admission or graduation exams, so the extra "human must review" rule should not apply. Keep it that way: never present Zaki's scores as official grades.

Commercial Terms: https://www.anthropic.com/legal/commercial-terms (effective 17 Jun 2025; checked 2026-10-15).
- "Anthropic may not train models on Customer Content from Services." **Confirmed:** no training on our data, by default.
- No age restriction on the customer's end users. **Confirmed** (none found).

### 1.2 Data retention, zero data retention (ZDR) and the data agreement

Source: "API and data retention", https://platform.claude.com/docs/en/manage-claude/api-and-data-retention (checked 2026-10-15).

- **How to get ZDR. Confirmed.** "To request ZDR for your organization, contact the Anthropic sales team." It is enabled per organisation by the account team. **It is not self-serve.** The page sets no published minimum size, but in practice it needs a sales conversation and their approval. **Who qualifies: Not found** (no public criteria).
- **Standard retention without ZDR. Confirmed.** Anthropic's privacy centre says "we automatically delete inputs and outputs on our backend within 30 days" (https://privacy.claude.com/en/articles/7996866, updated 1 Jul 2026). The docs page also says conversation content "is not retained by default" except for some top models (Fable/Mythos) that require 30-day retention. The two pages word it differently. Plan on **up to 30 days**.
- **Flagged content. Confirmed.** Even with ZDR, conversations flagged by Anthropic's safety systems may be kept **up to 2 years** (safety scores up to 7 years). This matters for the privacy policy: a child's harmful-content disclosure could be flagged.
- **Feature eligibility for ZDR. Confirmed** (from the eligibility table):

| Feature | ZDR eligible? | Note |
|---|---|---|
| Messages API (normal chat), prompt caching, vision/PDF inline, thinking, effort, structured outputs (qualified) | Yes | Prompt caching keeps only temporary in-memory data |
| **Code execution tool** | **No** | "Container data retained up to 30 days" |
| **Files API** | **No** | Kept until deleted or expired |
| **Batch API** | **No** | 29-day retention |
| Agent Skills, MCP connector, Managed Agents | No | |
| Web search / web fetch | Yes, **but** "dynamic filtering" is not eligible | The newest search tool versions (`_20260209`) use dynamic filtering. Use the basic versions for research, or accept that only search queries (no child data) are involved |
| Client-side tools (we run the code ourselves) | Yes | This is the ZDR-safe way to run the maths checker |

- **Also:** under ZDR, calls cannot come straight from the browser (no CORS). Calls must go through our own server. That matches the plan (Next.js server routes).
- **Code execution.** Docs: https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool (checked 2026-10-15) state `zdr: not-eligible`. Containers last 30 days. Supported on Haiku 5.5 and Sonnet 5.5. **Confirmed.**
- **Data Processing Addendum. Confirmed.** https://www.anthropic.com/legal/data-processing-addendum (effective 24 Feb 2025). It "forms part of the Anthropic Commercial Terms", so it applies automatically by reference and **no separate signature is needed**. It includes EU Standard Contractual Clauses and UK/Swiss addenda, and a sub-processor list at anthropic.com/subprocessors with a 15-day objection window. There is no Qatar- or GCC-specific transfer clause (**Not found**). Our lawyer should check that it is enough for Qatar's PDPPL cross-border rules.

### 1.3 Current models and prices

Sources: claude-api skill (cached 2026-10-06), confirmed against https://platform.claude.com/docs/en/about-claude/pricing (checked 2026-10-15). **Confirmed.** Prices are USD per million tokens. A token is a word-piece; 1 million tokens is roughly 700,000 English words, and fewer in Arabic.

| Model (API id) | Input | Cache write (5 min) | Cache read | Output | Batch (50% off) in/out |
|---|---|---|---|---|---|
| Claude Haiku 5.5 (`claude-haiku-5-5`), prompts ≤100K | $0.10 | $0.125 | $0.01 | $0.50 | $0.05 / $0.25 |
| Claude Haiku 5.5, prompts >100K | $0.50 | $0.625 | $0.05 | $2.50 | $0.25 / $1.25 |
| Claude Sonnet 5.5 (`claude-sonnet-5-5`) | $2.00 | $2.50 | **$0.10** (0.05x) | $10.00 | $1 / $5 |
| Claude Opus 5.5 (`claude-opus-5-5`) | $4.00 | $5.00 | $0.20 (0.05x) | $20.00 | $2 / $10 |
| Claude Fable 5.1 (top model) | $10 | $12.50 | $0.25 | $50 | not ZDR (needs 30-day retention) |
| (older) Claude Haiku 4.5 | $1.00 | $1.25 | $0.10 | $5.00 | |

- **Prompt caching. Confirmed.** A 5-minute cache write costs 1.25x input and a 1-hour write costs 2x. Reads cost 0.1x (0.05x on Sonnet 5.5 and Opus 5.5). It stacks with the batch discount. The minimum cacheable prompt for Haiku 5.5 and Sonnet 5.5 is 286 tokens.
- **Batch API. Confirmed.** 50% off. **Not ZDR-eligible** (kept 29 days). Use it only for jobs with no child data, e.g. building general question banks from textbook pages with names removed.
- **US-only processing. Confirmed.** `inference_geo: "us"` costs 1.1x. The default is "global".
- **Code execution tool. Confirmed.** Free when used together with web search or web fetch. Otherwise each organisation gets **1,550 free hours per month**, then $0.05 per container-hour. Our verifier will almost certainly stay inside the free hours.
- **Web search. Confirmed.** $10 per 1,000 searches, plus tokens.
- **Haiku 5.5 notes** (from the skill): "thinking" is on by default at medium effort. It can be turned off at high effort or below. Refusals have no automatic fallback. Sonnet 5.5 cannot fully disable thinking; it uses `between_tools` mode instead.

## 2. OpenAI

### 2.1 Under-18 API guidance

Source: https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance (no date shown; checked 2026-10-15).

- Apps serving under-18s are allowed. The developer is "solely responsible" for compliance with child-protection and privacy laws, including COPPA. **Confirmed.**
- **Under-13: conditional. Confirmed.** "You should not use OpenAI services to process any personal data of children under 13 … without first implementing zero data retention in our API."
- Suggested safeguards: age-appropriate AI disclosures, content filters, monitoring and reporting with escalation for high-risk chats, and age assurance where required. Use current flagship models. **Confirmed.**
- Parental consent, age prediction and safety identifiers are not mentioned on this page. **Not found.**

### 2.2 Moderation (omni-moderation-latest)

Sources: https://developers.openai.com/api/docs/guides/moderation and https://developers.openai.com/api/docs/pricing (checked 2026-10-15).

- **Free. Confirmed.** "The moderation endpoint is free to use", and the pricing page lists `omni-moderation-latest` as Free.
- **Text and images. Confirmed.** It does not handle audio. There are 13 categories. Image checks cover only: self-harm (3 types), sexual, violence, violence/graphic. **`sexual/minors`, harassment, hate and illicit are text-only.** So image moderation alone will not catch everything, and we still need the plan's second classifier.
- **Languages / Arabic. Partly confirmed.** The official guide makes **no language or Arabic claims**. OpenAI's Sept 2024 launch post (https://openai.com/index/upgrading-the-moderation-api-with-our-new-multimodal-moderation-model/) returned "403 Forbidden" when fetched. Secondary sources say it reported better multilingual accuracy, especially in low-resource languages. An arXiv study (2505.04640) found gaps on Moroccan Darija dialect. **Conclusion: assume nothing about Gulf Arabic or Arabizi. Our own test set decides.**
- **Data retention for moderation. Confirmed.** https://developers.openai.com/api/docs/guides/your-data: `/v1/moderations` is ZDR-eligible, with **no abuse-monitoring retention, no application-state retention, and no training use**. General API abuse logs are kept up to 30 days. ZDR and "Modified Abuse Monitoring" need OpenAI's approval via sales.
- **Practical reading.** The moderation endpoint itself keeps nothing. But the under-13 rule is written about "OpenAI services" in general. To be safe, apply for OpenAI ZDR before the pilot. If it is refused, strip names before sending, or use a different second classifier.

### 2.3 Small model for the "second-opinion" check

Sources: https://developers.openai.com/api/docs/models and /pricing (checked 2026-10-15). **Confirmed.**

- **gpt-6-luna**, OpenAI's "most efficient model for focused, high-volume tasks": $0.10 in / $0.01 cached / $0.50 out per million tokens. Older cheap option: gpt-5-nano at $0.05 / $0.40.
- A second-opinion check on one lesson pack's answer key costs well under $0.001.

## 3. Google (Gemini API and Google Cloud / Vertex AI)

- **Gemini API terms. Confirmed.** https://ai.google.dev/gemini-api/terms (last updated 2026-04-28). "You must be 18 years of age or older to use the APIs." The APIs may not be used in a service "directed towards or is likely to be accessed by individuals under the age of 18." The plan is correct.
- **Google Cloud / Vertex AI terms. Confirmed: also banned.** Google Cloud Service Specific Terms, https://cloud.google.com/terms/service-terms (last modified 12 Oct 2026), §20(d) Age Restrictions: "Customer will not, and will not allow End Users to, use a Generative AI Service as part of a website, Customer Application, or other online service that is directed towards or is likely to be accessed by individuals under the age of 18." The services list (https://cloud.google.com/terms/services) names "Generative AI on Gemini Enterprise Agent Platform (formerly Generative AI on Vertex AI)" and the "Gemini Enterprise Agent Platform API (formerly Vertex AI API)" as Generative AI Services, and adds "any generative AI features or functionality of a Service".
  - **Side effect. Partly confirmed.** This likely also covers **Claude accessed through Google Cloud**, and Google's generative voice products (e.g. Chirp 3 HD voices, Gemini TTS) if we considered them for voice. Use Claude directly from Anthropic, not through Google Cloud.
  - Google Cloud does promise not to train on customer data (§18). **Confirmed.**
- **Doha region. Confirmed.** `me-central1` = Doha, Qatar (https://cloud.google.com/compute/docs/regions-zones). Dammam, Saudi Arabia = `me-central2`.
- **Gemini / Claude in Doha. Confirmed: not available.** On the Vertex/Agent Platform locations page (https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations), the Middle East tables (Tel Aviv, Doha, Dammam) show **no Gemini or Claude models supported**. Only embeddings models (all three) and Virtual Try-On (Doha) are offered there.

## 4. GCC data residency: where AI processing can stay in-region

(Added at the founder's request: GCC is a key market.) Checked 2026-10-15.

| Route | GCC in-region option for the AI model? | Source | Status |
|---|---|---|---|
| Anthropic direct (Claude API) | **No.** Processing is "global" or "us" only. Data storage location is "us" only | https://platform.claude.com/docs/en/manage-claude/data-residency | Confirmed |
| Claude on AWS Bedrock | **No in-region.** UAE (`me-central-1`) and Bahrain (`me-south-1`) accept Haiku/Sonnet/Opus 5.5 only through **Global cross-region inference**: "data may be processed in any commercial Region". No Geo (regional) profile covers the Middle East. No Saudi AWS region appears in the table | https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html | Confirmed |
| Claude on Google Cloud (Vertex) | **No.** Not offered in Doha, Dammam or Tel Aviv. Also see the under-18 ban above | Vertex locations page (above) | Confirmed |
| Claude on Microsoft Foundry (Azure) | **No.** Only "Global Standard" or "US Data Zone". Sonnet 5.5 is Global only | https://platform.claude.com/docs/en/build-with-claude/claude-in-microsoft-foundry | Confirmed |
| OpenAI direct | **Yes, UAE** (`ae.api.openai.com`): regional storage and processing, but needs extra approval plus ZDR or Modified Abuse Monitoring | https://developers.openai.com/api/docs/guides/your-data | Confirmed (which endpoints, e.g. moderation, are served there: Not found) |
| Azure OpenAI in UAE North / Qatar Central | Unclear. Only Microsoft Q&A forum answers, which conflict | learn.microsoft.com Q&A (not official docs) | Not found |
| Plain cloud servers/storage in GCC | Yes: Google Cloud Doha and Dammam; AWS UAE and Bahrain; Azure Qatar Central and UAE North | Google regions page; Bedrock page region list; Azure regions list | Confirmed (Google, AWS); Partly (Azure) |

**What it means:** we can keep stored family data (database, photos) inside the GCC if a lawyer says we must. But each Claude call will be processed outside the GCC (global, or the US for 10% more). This must be documented as a cross-border transfer for Qatar's PDPPL, and later Saudi and UAE data laws, and named in the privacy policy.

## 5. Recomputed AI cost per child per month (plan Section 10.3)

### Assumptions (simple)

- 20 sessions a month, 15 minutes each, about **15 back-and-forth turns** per session (one a minute).
- Each turn re-sends Zaki's instructions, the lesson pack and the child's memory notes (~8,000 tokens), one homework photo (~1,600 tokens) and the chat so far (~1,900 tokens on average). **Prompt caching** means this repeated part is billed at the cheap "cache read" price after the first turn.
- Each turn adds ~300 new tokens and Zaki's reply is ~400 tokens (including some hidden "thinking"). Arabic text uses more tokens than English; the 50% buffer below covers this.
- About **8 new lesson packs** a month. Each is built by Sonnet 5.5 (~10,000 tokens in, ~12,000 out including thinking), checked by a maths verifier (Haiku), given a second opinion by gpt-6-luna, and uses ~5 web searches.
- 4 parent reports a month (small Haiku jobs). Moderation is free. Voice (Azure Speech) is **not** included.
- Then **+50% buffer** for longer chats, cache misses (a child pausing over 5 minutes), retries, and Arabic token overhead.

### Results (USD per child per month)

| Item | Lean (80% of tutoring turns on Haiku 5.5, 20% on Sonnet 5.5, with caching) | Heavy (all Sonnet 5.5, with caching) |
|---|---|---|
| Tutoring chats (20 sessions) | $0.55 | $2.25 |
| Lesson packs (8 × build + verify + second opinion) | $1.15 | $1.45 |
| Web research (40 searches) | $0.40 | $0.40 |
| Parent reports | ~$0.01 | ~$0.05 |
| **Subtotal** | **~$2.10** | **~$4.15** |
| **With +50% buffer** | **~$3** | **~$6** |
| Heavy, if caching is not working | n/a | ~$10 (≈$15 with buffer) |

For reference, one 15-minute session costs about **$0.007 on Haiku 5.5** and **$0.11 on Sonnet 5.5** with caching ($0.41 without caching).

### Scale (AI only)

| Kids | Lean | Heavy |
|---|---|---|
| 50 | ~$150/month | ~$300/month (up to ~$750 without caching) |
| 500 | ~$1,500/month | ~$3,000/month (up to ~$7,500 without caching) |

### Family pilot (founder's family in Lebanon, 3–5 children, AI only)

| Children | Lean | Heavy | Heavy without caching |
|---|---|---|---|
| 3 | ~$9/month | ~$18/month | ~$45/month |
| 5 | ~$15/month | ~$30/month | ~$75/month |

Add about **$5 per full run** of the 200-prompt red-team test suite on Sonnet 5.5 (≈200 × 10,000 tokens in + 500 out). If it runs on every prompt change, budget **~$20–50/month** during building. Anthropic and OpenAI both list Lebanon as a supported country (section 6).

**Main takeaways:** (1) Caching is the biggest single saving on Sonnet, nearly 4x. (2) Lesson-pack building, not chatting, is now the largest cost in the lean setup. (3) The Batch API would halve pack-building cost, but it is not ZDR-eligible, so use it only for content with no child data. (4) AI may no longer be "about 90% of running cost". Fixed costs (Vercel $20, Supabase, WhatsApp, voice) will be a bigger share at small scale.

## 6. Calling the AI from a children's mobile app (iOS)

(Added at the founder's request: Zaki will be a native App Store app and the first pilot is in Lebanon. App Store rules are covered by a separate researcher.)

- **Never put API keys in the app. Confirmed.**
  - Anthropic: "Store API keys in a secrets manager, rotate them periodically, and disable or delete any key you suspect has leaked." Static API keys are for "servers where you control secret storage" (https://platform.claude.com/docs/en/manage-claude/authentication).
  - OpenAI: "Never deploy your key in client-side environments like browsers or mobile apps." OpenAI also says a key "leaked inside an app in an app store" is disabled immediately (https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety and https://help.openai.com/en/articles/8304786; both via search summary, because the pages returned 403. API overview: "Don't … expose it in any client-side code such as browsers or apps", https://developers.openai.com/api/reference/overview). **Partly confirmed** (official pages, text seen via search results).
- **Anthropic App Attest. Confirmed.** For iOS/macOS apps "where the app calls the Claude API directly with no back end or proxy". Each genuine install gets a 1-hour token that works only for Messages API calls. **Not recommended for Zaki's child chats:** a direct phone-to-Claude path would skip our moderation, safety script, parent alerts, daily limits and logging. Our system prompt would also have to live in the app. The minors guidelines require moderation and monitoring, which naturally sit on our server.
- **Under ZDR, Anthropic doesn't support browser (CORS) calls** and says to route through a backend proxy. This mainly affects web pages, but it points the same way: use our own server. **Confirmed.**
- **Recommended pattern:** iPhone app → our server (checks parent consent, daily cap, moderation, builds the prompt) → Claude / OpenAI → moderation of the reply → app. Keys live only in the server's secret store.
- **Countries. Confirmed.** Lebanon, Qatar, UAE, Saudi Arabia, Bahrain, Kuwait and Oman are all on Anthropic's supported list (https://www.anthropic.com/supported-countries) and OpenAI's (https://developers.openai.com/api/docs/supported-countries). Anthropic's policy also counts where users are *physically located*, so pilot users in Lebanon are fine.
- **Lebanon data law** (personal data rules for the pilot) was not researched here. Flag for the legal researcher.

## 7. Sources (all checked 2026-10-15)

- Anthropic minors guidelines: https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors
- Anthropic Usage Policy: https://www.anthropic.com/legal/aup
- Anthropic Commercial Terms: https://www.anthropic.com/legal/commercial-terms
- Anthropic DPA: https://www.anthropic.com/legal/data-processing-addendum
- Anthropic API data retention and ZDR: https://platform.claude.com/docs/en/manage-claude/api-and-data-retention
- Anthropic commercial retention (privacy centre): https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data
- Anthropic pricing: https://platform.claude.com/docs/en/about-claude/pricing
- Anthropic code execution tool: https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool
- Anthropic data residency: https://platform.claude.com/docs/en/manage-claude/data-residency
- Claude in Microsoft Foundry: https://platform.claude.com/docs/en/build-with-claude/claude-in-microsoft-foundry
- OpenAI under-18 guidance: https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance
- OpenAI moderation guide: https://developers.openai.com/api/docs/guides/moderation
- OpenAI data controls: https://developers.openai.com/api/docs/guides/your-data
- OpenAI pricing / models: https://developers.openai.com/api/docs/pricing, https://developers.openai.com/api/docs/models
- OpenAI moderation launch post (could not load, 403): https://openai.com/index/upgrading-the-moderation-api-with-our-new-multimodal-moderation-model/
- Non-official, for context only: Portkey benchmark https://portkey.ai/blog/openai-omni-moderation-latest-benchmark/ ; Darija study https://arxiv.org/pdf/2505.04640
- Gemini API terms: https://ai.google.dev/gemini-api/terms
- Google Cloud Service Specific Terms: https://cloud.google.com/terms/service-terms
- Google Cloud services summary: https://cloud.google.com/terms/services
- Google Cloud regions: https://cloud.google.com/compute/docs/regions-zones
- Vertex / Agent Platform generative AI locations: https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations
- AWS Bedrock regional availability: https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html
- Anthropic authentication / App Attest: https://platform.claude.com/docs/en/manage-claude/authentication
- Anthropic supported countries: https://www.anthropic.com/supported-countries
- OpenAI supported countries: https://developers.openai.com/api/docs/supported-countries
- OpenAI API key safety: https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety ; https://help.openai.com/en/articles/8304786-how-can-i-keep-my-openai-accounts-secure ; https://developers.openai.com/api/reference/overview
