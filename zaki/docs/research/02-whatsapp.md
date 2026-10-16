# Research 02: WhatsApp Business Platform (parent channel)

Checked: 15 October 2026. All sources are official Meta pages unless marked otherwise. Each finding is labelled **Confirmed**, **Partly confirmed** or **Not found**.

---

## Plain-language summary

- **Zaki's planned use of WhatsApp is allowed.** Since 15 January 2026, Meta's rule bans companies whose main product *on WhatsApp* is a general AI assistant, like ChatGPT. A business that uses AI behind the scenes for a specific service (taking mom's instructions, reading class-page photos, sending reminders and reports) is not covered by that ban. Meta decides on edge cases, so Zaki's WhatsApp side must clearly look and act like a service desk, not a chatbot.
- **Messages from mom are free. Zaki's typed replies within 24 hours are free only up to 1,000 a month per Zaki phone number.** Since **1 October 2026** Meta charges again for these replies ("service messages") after the first 1,000 per number each month, at the same price as a utility message for the parent's country. Ready-made "update" messages (Meta calls them utility templates) are now charged **even inside the 24-hour window**. *(Fact-check 2026-10-15: corrected; the earlier text said both were free.)*
- **A report sent when mom hasn't written in the last 24 hours costs about 1.2 US cents in Qatar.** A promotional message costs about 3.4 cents. Since July 2026 Qatar has its own price list; it is no longer grouped with "Rest of Middle East".
- **The first pilot (the founder's family in Lebanon) will cost almost nothing on WhatsApp.** Lebanon is in Meta's "Rest of Middle East" price group: about 0.9 US cents per report, whether or not mom wrote in the last 24 hours. Zaki's typed replies are free for the first 1,000 a month per number, then also about 0.9 cents each. A payment method must be on file, or Meta stops delivering these replies. Lebanon has no WhatsApp Business restrictions. Price depends on the *parent's* phone country, not on whether Zaki's own number is Lebanese or Qatari.
- **Prices differ a lot across the Gulf.** Kuwait is the most expensive: about 4.4 cents per report message. Egypt is the cheapest at about 0.4 cents. There is a table further down.
- **Meta charges nothing to use the WhatsApp connection itself.** You only pay per paid message, and you need a card on file for that.
- **A small pilot can start without a registered company.** Before Meta checks the business, Zaki can start conversations with up to 250 different parents a day and can register up to 2 phone numbers. Replies to moms who wrote first don't count toward that limit. To grow past that, Meta must verify the business with documents that show its legal name, so a registered Qatar company is needed in practice.
- **The Zaki phone number cannot also be used in the normal WhatsApp app.** A Qatar mobile number is fine. It needs a fresh SIM, or a number taken off WhatsApp first.
- **Meta has no special rules for children's education on WhatsApp.** WhatsApp's own minimum age is 13, which matches the plan: children never use WhatsApp, and only parents do.

## What this changes in the plan

| Plan section | What the plan says | Status | Correction |
|---|---|---|---|
| 2 #3, 8.4 | "Meta's Jan 2026 rules ban general AI chatbots on WhatsApp" | **Mostly right, needs nuance** | The rule (Meta Terms §4.7, live since 15 Jan 2026) bars *AI Providers* when general AI is the **primary** thing offered. Businesses using AI for their own service are fine. Keep "no chit-chat" as Zaki's own safety rule. Meta doesn't require it word for word, but it's the best protection against being treated as an AI Provider. |
| 10.3 | "Report templates cost roughly $0.01–0.025 each in Qatar (unconfirmed)" | **Now confirmed, narrower** | Qatar utility = **$0.0120**, marketing = **$0.0341**, service = **$0.0120** per delivered message (USD, Meta rate card effective 1 Oct 2026). Since 1 Oct 2026 utility templates are charged **even inside the 24h window**. |
| 10.3 | "Replies within 24 hours of mom's message are free" | **Outdated (corrected 2026-10-15)** | Since 1 Oct 2026: free-form replies are free only for the first **1,000 per business phone number per month**, then charged at the service rate (equal to the country's utility rate, e.g. Qatar $0.0120, Lebanon $0.0091). Utility templates inside the window are now charged at the utility rate. A payment method is required, or Meta stops delivering service messages. |
| 10.1 | "Meta WhatsApp Cloud API directly (no reseller fee)" | **Confirmed, with conditions** | No platform fee from Meta. The plan should still note: (a) the number can't be live on the WhatsApp app; (b) new accounts can start conversations with **only 250 unique parents per rolling 24h** and get **2 phone numbers**, until business verification; (c) verification needs company documents. |
| 3.1 / 9 | "verified consent" during onboarding | **Add a guardrail** | Meta policy forbids asking people to share "personal ID card numbers, or other sensitive identifiers" on WhatsApp. Any ID check (e.g., a Qatar ID) must happen **in the web app**, never over WhatsApp. |
| 3.1 | Commands REPORT, PAUSE, PLAN, HELP, DELETE MY DATA | **Good; add one** | Meta expects an easy opt-out. Add **STOP** (and Arabic equivalents, e.g. "إيقاف") as a full WhatsApp opt-out, separate from PAUSE. HELP already meets the "human escalation path" rule. |
| 8.4 | "Reports use approved utility templates" | **Right, with a warning** | Reports stay "utility" only if they are **non-promotional**. Any upsell ("upgrade to Premium!") gets the template re-labelled as marketing, which costs about 3x more in Qatar. Meta can now do this without notice. |
| 3.1, 12 (Phase 3 pilot) | Pilot assumed to be in Qatar | **Update** | The first pilot is the founder's family in **Lebanon (+961)**: "Rest of Middle East" rates (utility $0.0091, marketing $0.0392, authentication $0.0091). The pilot can even start on Meta's **free test number**, which needs no payment method (statement from before the 1 Oct 2026 change; not re-checked, so confirm that free-form replies still deliver from a test number with no card). A real number is needed once outside families join. See 2.4. |
| 3.1 (implicit) | Single-country Qatar pricing | **Expand** | The founder now targets the GCC/Middle East. See the regional table below: Kuwait costs about 3.7x Qatar per report. |

---

## 1. The AI rule (January 2026)

### 1.1 Exact wording. Status: Confirmed

Source: *Meta Terms for WhatsApp Business Platform*, Section 4 "Platform Use", §4.7 "AI Providers". Last modified 23 September 2026. https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform (the old URL https://www.whatsapp.com/legal/business-solution-terms now redirects here). Checked 2026-10-15.

> "Providers and developers of artificial intelligence or machine learning technologies, including but not limited to large language models, generative artificial intelligence platforms, general-purpose artificial intelligence assistants, or similar technologies as determined by Meta in its sole discretion ("AI Providers"), are strictly prohibited from accessing or using the WhatsApp Business Platform, whether directly or indirectly, for the purposes of providing, delivering, offering, selling, or otherwise making available such technologies when such technologies are the primary (rather than incidental or ancillary) functionality being made available for use, as determined by Meta in its sole discretion; provided, however, that such technologies may be made available to businesses in certain countries as set forth here."

> "Notwithstanding the foregoing, you may retain an AI Provider as your Solution Provider. In such cases, you may not directly or indirectly allow WhatsApp Business Platform Data, including any anonymous, aggregate, or derived forms of WhatsApp Business Platform Data, to be used to create, develop, train, or improve any machine learning or artificial intelligence systems, models, or technologies, including large language models (collectively, "AI Models"); provided that you may use WhatsApp Business Platform Data to fine-tune an AI Model that is for your exclusive use, so long as this does not result in WhatsApp Business Platform Data being used to create, develop, train, or improve any other AI Models."

(The text was obtained in short exact fragments through a page reader, because the page loads by script. Re-read the live page once before launch.)

The countries where general AI assistants are still allowed (because local law requires it) are listed at https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/ai-providers (checked 2026-10-15). It confirms the date: *"Effective January 15, 2026 … 'AI Providers' are only permitted to offer general-purpose AI assistants on the WhatsApp Business Platform where Meta is legally required to permit this use case."* As of the 12 May 2026 update, only **Brazil** is listed, from 11 March 2026. Italy, the EU and the EEA were listed until 12 May 2026. **No Middle East country is on the list.** The same page says: *"This does NOT change how or what Meta charges all other businesses using the WhatsApp Business Platform."*

The *WhatsApp Business Messaging Policy* (https://whatsappbusiness.com/policy/, last updated 23 Sep 2026; business.whatsapp.com/policy redirects here) does **not** mention AI by name. It says:

> "You may use automation when responding during the 24-hour window, but must also have available prompt, clear, and direct escalation paths. These escalation paths include: In-Chat Human Agent transfer, Phone number, Email, Web support (on the business website), In-store visits …, or Support form."

### 1.2 Is Zaki allowed? Verdict: **Yes, allowed, with low-to-medium risk that depends on design.**

Reasons:
1. On WhatsApp, Zaki offers a parent service: taking instructions, receiving photos, setting reminders, sending reports and confirmations. AI is used inside that service. In the rule's words it is "incidental or ancillary", not "the primary functionality being made available".
2. Zaki is an education business that *uses* an AI vendor (Anthropic), not a developer selling AI access. The terms explicitly allow "retain[ing] an AI Provider as your Solution Provider".
3. Meta's own explanation, plus press coverage, separates general assistants (ChatGPT, Perplexity, removed from WhatsApp in January 2026) from businesses using AI for customer service. That coverage is *secondary, not official*: e.g. Gulf News https://gulfnews.com/technology/no-more-chatgpt-and-perplexity-on-whatsapp-meta-bans-major-ai-chatbots-from-2026-1.500316016.
4. The risk is that Meta decides "in its sole discretion". If parents could ask Zaki-on-WhatsApp anything ("write my email", "what's the capital of France?"), it would start to look like a general assistant. The tutoring itself (an AI that teaches) must stay in the web app.

### 1.3 Design guardrails (to keep Zaki inside the rules)

1. **Narrow intents only.** The WhatsApp bot handles a fixed list of jobs: instruction intake, class-page photos, reminders, reports, plan, pause/stop, delete data, help. Anything else gets a polite fixed reply in Arabic and English, with no AI-generated answer: "I can only help with Ali's study plan here. For lessons, open the Zaki app: [link]. For a person, type HELP."
2. **No open Q&A, even about school subjects.** If mom asks "what is a fraction?", Zaki doesn't answer it on WhatsApp. It offers to add a fractions lesson to the child's plan.
3. **Mostly fixed wording.** Use buttons and quick replies (WhatsApp's "interactive reply buttons") and fixed confirmation wording. Use AI to *understand* mom's message, not to chat back at length.
4. **A human is always reachable.** HELP hands over to a person (an in-chat human agent, or a phone number or email), stated in the welcome message. This is an explicit Policy requirement whenever automation is used.
5. **No training on WhatsApp data.** WhatsApp messages and photos must not be used to train or improve any AI model, including the vendor's. Use Anthropic's commercial API, which by default doesn't train on customer content (confirm in research file 01), and the zero-retention option where available. Don't send WhatsApp content to the "second-opinion" OpenAI check. Fine-tuning a model for Zaki's exclusive use would be allowed, but isn't planned.
6. **Branding.** Profile description: "Zaki: study plans and progress reports for parents." Not "AI assistant" or "chat with AI".
7. **Monitor.** Log unhandled-intent rates. If many parents try to chat, tighten the redirect.

Fallback if Meta ever objects: WhatsApp would send only reminders and reports (templates), and all instruction intake would move to the parent web app. Keep that path possible in the design.

---

## 2. Pricing

### 2.1 Pricing model. Status: Confirmed

Source: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing (also at developers.facebook.com/docs/whatsapp/pricing). Checked 2026-10-15.

- *"Effective July 1, 2025, Meta charges on a per-message basis."* Charges apply only when a **template** message is delivered. The old conversation-based pricing is gone.
- Categories: **Marketing, Utility, Authentication** (templates). **Service** = free-form replies inside the window, which are not templates.
- Non-template messages *"can only be sent in an open 24-hour customer service window, which opens and resets with each user message."*
- **Since 1 Oct 2026 (corrected 2026-10-15):** *"Meta resumed charging, on a per-message basis, for messages that were previously free: Service messages, which became free as of Nov. 1, 2024 … Utility messages sent in response to users (thus in an open customer service window), which became free as of July 1, 2025."* And: *"Meta provides every business phone number with a free tier of 1,000 service messages per month … Meta charges as of the 1,001st service message per month."* Unused free messages don't roll over. Businesses with no payment method on file by 30 Sep 2026: *"Meta will stop delivering service messages as of when they become charged on October 1, 2026."*
- Still free: messages from users to the business, and everything inside a "free entry point" window (only opened by click-to-WhatsApp ads or Page buttons, which Zaki doesn't plan to use).
- The customer service window opens or resets for 24 hours each time the parent messages or calls the business.
- Volume discounts apply to utility and authentication by monthly volume per country (Qatar's first discount starts above 100,000 utility messages a month, so it's irrelevant for the pilot).
- Meta may change prices only on 1 Jan, 1 Apr, 1 Jul or 1 Oct. Notice is at least 1 month for rate-card changes, 3 months for pricing add-ons and 6 months for pricing-model changes.
- *"Businesses are responsible for reviewing the category assigned to their approved templates. Whenever a template is used, a business accepts the charges associated with the category applied to the template at time of use."*
- **Corrected 2026-10-15: the claim is TRUE.** Meta's official pricing page ("This page reflects pricing updates that became effective as of October 1, 2026") confirms that service messages are paid from 1 Oct 2026, with 1,000 free per business number per month. The earlier "treat as false" verdict came from a stale reading of the page.

### 2.2 Qatar rates (USD, per delivered message). Status: Confirmed

Source: Meta's official rate card (USD list rates file titled "effective October 1, 2026"; corrected from "1 July 2026", and Qatar's numbers are the same in both), also read through the official pricing calculator data service on whatsappbusiness.com (https://whatsappbusiness.com/products/platform-pricing/#rates, data at `whatsappbusiness.com/wp-json/wab/v1/pricing`). Checked 2026-10-15. The developer page also confirms: *"Effective July 1, 2026 … Qatar\* – Higher utility and authentication rates … \* Until June 30, 2026, messages to users in these markets were charged the respective regional rates … These markets have been moved out of regional rate pricing to be standalone on rate cards."*

| Qatar (+974) | Rate |
|---|---|
| Marketing | **$0.0341** |
| Utility (outside the 24h window) | **$0.0120** (0–100k/month), then volume discounts down to $0.0090 |
| Authentication | $0.0120 |
| Service (free-form reply inside the 24h window) | **$0.0120** after the first 1,000 per business number per month (free before that) |
| Utility template inside the 24h window | **$0.0120** (charged since 1 Oct 2026) |

Note (corrected 2026-10-15): the public calculator's "Service" figure equal to the utility rate is **correct**. It is the price after the 1,000 free service messages each month. The developer docs were updated for 1 Oct 2026 and now agree.

### 2.3 Middle East / GCC rates (USD, per delivered message, official rate card effective 1 Oct 2026). Status: Confirmed

Same source and date as 2.2.

| Country | Rate-card bucket | Utility | Marketing |
|---|---|---|---|
| **Lebanon (+961), first pilot** | Rest of Middle East | **$0.0091** (authentication also $0.0091) | **$0.0392** |
| Qatar | Qatar (own list since 1 Jul 2026) | $0.0120 | $0.0341 |
| Saudi Arabia | Saudi Arabia (own list) | $0.0107 | $0.0576 |
| UAE | United Arab Emirates (own list) | $0.0157 | $0.0576 |
| Kuwait | Kuwait (own list since 1 Oct 2026) | **$0.0440** | **$0.0792** |
| Oman | Oman (own list since 1 Oct 2026) | $0.0247 | $0.0341 |
| Bahrain | Rest of Middle East | $0.0091 | $0.0392 |
| Jordan | Rest of Middle East | $0.0091 | $0.0392 |
| Egypt | Egypt (own list) | $0.0036 | $0.0644 |
| (Iraq, for reference) | Iraq (own list since 1 Oct 2026) | $0.0079 | $0.0341 |

Lebanon has no list of its own: the official calculator rejects "LB" as a market, and Meta's country-code table places Lebanon (+961) in "Rest of Middle East". Service messages cost the same as the utility rate in every country listed (after 1,000 free per business number per month). Utility templates are charged inside and outside the 24-hour window. Meta's current country-code table lists "Rest of Middle East" as 4 markets: Bahrain, Jordan, Lebanon and Yemen. Iraq, Kuwait and Oman moved to their own lists on 1 Oct 2026.

**Rough cost example.** 50 Qatar families, 20 reports a month each = 1,000 × $0.012 = **about $12 a month**. Since 1 Oct 2026 this is the normal case, not the worst case, because reports are charged even inside the 24-hour window. Free-form replies add cost only beyond 1,000 a month per Zaki number (e.g. 2,000 replies = 1,000 × $0.012 = $12 more). WhatsApp is still a small cost compared with AI.

### 2.4 Extra country restrictions on business numbers (requested scope)

- **Messaging:** no GCC or Middle East country above is restricted. Meta bars only Cuba, Iran, North Korea, Syria, and Crimea/Donetsk/Luhansk (https://developers.facebook.com/documentation/business-messaging/whatsapp/support, "Country restrictions", checked 2026-10-15). **Confirmed.**
- **Calls placed by the business:** not available from **Egypt** business numbers (and not from the US, Canada, Vietnam or Nigeria). Parents can still call the business (https://developers.facebook.com/documentation/business-messaging/whatsapp/calling, checked 2026-10-15). **Confirmed.** Not needed for Zaki.
- **Local data storage:** Cloud API can store message data at rest in-country for **Bahrain (BH)** and **UAE (AE)**. Qatar and Saudi Arabia aren't on the list (https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/registration, `data_localization_region`, checked 2026-10-15). **Confirmed.** This may matter for the data-hosting questions in plan Section 9.
- **Lebanon:** not on Meta's restricted list, so the platform can be used both *by* a Lebanese business and *to* message Lebanese parents. No Lebanon-specific WhatsApp Business rule was found in Meta's sources. **Confirmed** (absence checked on the support and policy pages).
- **Lebanese (+961) or Qatari (+974) number for Zaki's business account:** Meta treats both the same. Requirements: owned by Zaki, able to receive an SMS or voice call for the one-time code, not in use on the normal WhatsApp app, and two-step PIN set. **Price is set by the recipient's country code** (*"Rates vary based on … the recipient WhatsApp phone number's country calling code"*), so the business number's country does **not** change cost. Practical advice (not from Meta): use a **dedicated new SIM**, not a family member's personal number, and keep it active. In Lebanon, prepaid lines that run out of credit and lapse could lock you out of re-verification. A Qatar number looks right for the eventual Qatar/GCC brand. Either works for the Lebanon pilot. **Confirmed** (Meta rules); local SIM advice **not found** in Meta sources.
- **Family pilot without paying anything:** Meta's test business number *"[has] relaxed messaging limits and [doesn't] require a payment method on file in order to send template messages"* (…/about-the-platform). That's enough to try the flows with the founder's own family. It shows a generic test name, so use a real number for anything beyond family. The exact recipient cap for test numbers wasn't stated on the pages read. **Partly confirmed.**
- **Local laws** (e.g., consumer voice-calling limits in some Gulf states, telecom rules on SIM ownership): **not found** in Meta sources. Check with the Qatar lawyer and telecom operator if needed.

### 2.5 AI Provider pricing (for completeness). Status: Confirmed

From 16 Feb 2026, Meta charges *AI Providers* (general-assistant companies) for every free-form message, **only** in countries where it must allow them (now Brazil). This doesn't apply to Zaki. If Meta ever classed Zaki as an AI Provider, Zaki would simply be banned in Qatar, not charged, which is why the guardrails in 1.3 matter.

---

## 3. Getting started with the Cloud API directly

| Item | Finding | Status | Source (checked 2026-10-15) |
|---|---|---|---|
| Cost of the API | Meta charges only per paid message. No fee for access or hosting is listed on the pricing page. A payment method is needed before sending paid templates and, since 1 Oct 2026, for free-form replies too (otherwise Meta stops delivering them). | Partly confirmed (no fee is listed; "free" isn't stated in one sentence) | developers.facebook.com/documentation/business-messaging/whatsapp/pricing |
| Accounts needed | A Facebook or managed Meta account, developer registration, a Meta app with the WhatsApp use case, and a **business portfolio** (*"You must have a business portfolio to use the platform"*). A test WhatsApp Business account and **free test number** are created automatically. | Confirmed | …/whatsapp/get-started ; …/whatsapp/about-the-platform |
| Business verification needed to start? | **No.** It's needed to grow: new portfolios are capped at a **250** messaging limit and **2** registered phone numbers. Verification (or 2,000 good-quality delivered template messages in 30 days) lifts the limit to 2,000, then automatically to 10k, 100k and unlimited. The number cap rises to 20. | Confirmed | …/whatsapp/messaging-limits ; …/whatsapp/business-phone-numbers/phone-numbers |
| What the messaging limit means | *"the maximum number of unique WhatsApp user phone numbers your business can deliver messages to, outside of a customer service window, within a moving 24-hour period."* Replies to moms who wrote first don't count. | Confirmed | …/whatsapp/messaging-limits |
| Verification documents | Meta's list is in Help Center article https://www.facebook.com/business/help/159334372093366 (it loads by script and couldn't be read). Partner guides say documents must show the **legal business name** plus the address or phone: business registration or licence, articles of incorporation, tax documents, bank statement, or a utility bill. In practice this means a **registered company** (Qatar Commercial Registration). Whether an individual or freelancer licence is accepted in Qatar: not found. | Partly confirmed (secondary: 360dialog https://docs.360dialog.com/docs/resources/meta-business-verification, Telnyx https://support.telnyx.com/en/articles/16300025-whatsapp-documents-accepted-for-meta-business-verification) | as listed |
| Phone number | Must be *"owned by you"*, have a country code, *"be able to receive voice calls or SMS"*. Mobile numbers are recommended; short codes aren't allowed. *"Registered numbers … cannot be used with WhatsApp Messenger"*, and *"Numbers already in use with WhatsApp cannot be registered unless they are deleted first."* A **Qatar (+974) mobile number is fine.** Qatar isn't restricted. A two-step PIN is required. (Meta also offers a "WhatsApp Business app users" onboarding route, via Embedded Signup, that keeps an existing Business-app number. It's mainly for partners, so it's not recommended for Zaki.) | Confirmed | …/whatsapp/business-phone-numbers/phone-numbers |
| Display name | Required when registering. It's checked against Meta's display-name guidelines automatically when the account reaches a higher messaging limit. It can be changed 10 times per 30 days. The guidelines article (facebook.com/business/help/757569725593362) couldn't be read. The common rule is that the name must clearly relate to the business, e.g. "Zaki" or "Zaki Tutor", matching the website and brand. | Partly confirmed | …/whatsapp/display-names |
| Template approval | Automated and manual review, *"can take up to 24 hours"*. Variables need sample values. Common rejections: badly formed variables, requesting sensitive IDs, duplicates. Since 9 Apr 2025, a template submitted as utility that Meta thinks is marketing is **approved as MARKETING**. Meta can also re-label it later, without notice for repeat abusers. | Confirmed | …/whatsapp/templates/template-review ; …/whatsapp/templates/template-categorization |
| What counts as "utility" | *"Must be non-promotional"* and *"specific to or requested by the user (clearly related to their order, account, services, or transactions)"*. The "Account Alerts or Updates" type covers updates *"specific to purchased or subscribed products/services"*. Zaki's session reports, reminders and weekly summaries fit **if they contain no offers**. | Confirmed | …/whatsapp/templates/template-categorization |
| Opt-in | *"You may only contact people on WhatsApp if: (a) they have given you their mobile phone number … and (b) you have received opt-in permission …"*. Opt-in must name the business and the purpose. Best practice is separate opt-in per message category, plus clear opt-out. | Confirmed | whatsappbusiness.com/policy ; …/about-the-platform |
| Speed | 80 messages/second per number by default. | Confirmed | …/about-the-platform |

Meta also now offers its own **"Meta Business Agent"** (AI agents with human handoff, built into WhatsApp). It's an option to know about, but it would put child-related data processing in Meta's hands. Not recommended without further review.

---

## 4. Minors, education and child data

| Topic | Finding | Status |
|---|---|---|
| WhatsApp minimum age | *"You must be at least 13 years old to register for and use our Services on your own."* Higher in some countries. A parent-managed account option exists where available. https://www.whatsapp.com/legal/terms-of-service (checked 2026-10-15). | Confirmed |
| Business Platform rules on minors | The Policy's only explicit under-18 rule is for "Regulated Verticals" (alcohol, gambling, OTC drugs, and similar): *"may not be sent to people under 18 years of age."* In general: *"You must ensure – through technical and organizational measures – that messages are gated per legal age … and comply with all applicable … age, privacy and safety country and regulatory requirements."* | Confirmed |
| Education-specific rules | None in the Business Messaging Policy or the Meta Terms. | Not found (searched; none exist on 2026-10-15) |
| Child data rules | No child-specific clause. General duties: *"must secure all necessary notices, permissions, and consents … including maintaining a published privacy policy"*. *"Don't share or ask people to share … personal ID card numbers, or other sensitive identifiers"* (this includes asking for documents that contain them). *"You may not forward or otherwise share information from a customer chat with any other customer."* *"Don't use any data obtained from us about a person … other than the content of message threads, for any purpose other than as reasonably necessary to support messaging with that person."* | Confirmed |
| Prohibited content | Includes services that are *"exploitative, inappropriate, or exert undue pressure on targeted groups"*, plus offensive or sexual content. Relevant to how reports talk about a child's results: keep the tone supportive, not shaming. | Confirmed |

**What this means for Zaki:**
- Only adults (parents) use WhatsApp; children never do. This fits the 13+ age rule and the age-gating duty. Onboarding should confirm that the WhatsApp user is the parent or guardian.
- Class-page photos may show other children's names or faces. Keep the plan's "remove names and faces" step, and never send one family's content to another.
- Collect consent and any identity checks **in the web app**, not on WhatsApp.
- Publish the privacy policy (Arabic and English) before the first real parent message.

---

## Sources (all checked 2026-10-15)

Official Meta:
- Meta Terms for WhatsApp Business Platform (§4.7 AI Providers), last modified 23 Sep 2026: https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform (redirect from https://www.whatsapp.com/legal/business-solution-terms)
- WhatsApp Business Messaging Policy, last updated 23 Sep 2026: https://whatsappbusiness.com/policy/ (redirect from https://business.whatsapp.com/policy)
- Pricing on the WhatsApp Business Platform: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing
- AI Providers pricing policy: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/ai-providers
- Official rate calculator (rate card effective 1 Jul 2026): https://whatsappbusiness.com/products/platform-pricing/#rates
- Messaging limits: https://developers.facebook.com/documentation/business-messaging/whatsapp/messaging-limits
- Business phone numbers: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers
- Registration (local storage): https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/registration
- Display names: https://developers.facebook.com/documentation/business-messaging/whatsapp/display-names
- Template review: https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-review
- Template categorization: https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization
- Send messages / customer service window: https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages
- Get started: https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started
- About the platform: https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform
- Support / country restrictions: https://developers.facebook.com/documentation/business-messaging/whatsapp/support
- Calling availability: https://developers.facebook.com/documentation/business-messaging/whatsapp/calling
- WhatsApp Terms of Service (age): https://www.whatsapp.com/legal/terms-of-service
- Business verification help (could not be read, loads by script): https://www.facebook.com/business/help/2058515294227817 and https://www.facebook.com/business/help/159334372093366

Secondary (used only where marked):
- Gulf News on the January 2026 ban: https://gulfnews.com/technology/no-more-chatgpt-and-perplexity-on-whatsapp-meta-bans-major-ai-chatbots-from-2026-1.500316016
- 360dialog verification guide: https://docs.360dialog.com/docs/resources/meta-business-verification
- Telnyx verification documents: https://support.telnyx.com/en/articles/16300025-whatsapp-documents-accepted-for-meta-business-verification

---

## Fact-check (2026-10-15)

Independent re-check by a second researcher. Rates were checked against two official Meta sources: the calculator data service (`whatsappbusiness.com/wp-json/wab/v1/pricing`, queried for each market and category) and Meta's downloadable USD rate-card file linked from the developer pricing page (titled "Cost per message in USD on the WhatsApp Business Platform, effective October 1, 2026").

**Verified**
- Rate table, all rows exactly (marketing / utility, USD): Rest of Middle East (Lebanon, Bahrain, Jordan) 0.0392 / 0.0091; Qatar 0.0341 / 0.0120 (utility tiers down to 0.0090); Saudi Arabia 0.0576 / 0.0107; UAE 0.0576 / 0.0157; Kuwait 0.0792 / 0.0440; Oman 0.0341 / 0.0247; Egypt 0.0644 / 0.0036; Iraq 0.0341 / 0.0079. Authentication equals utility in each market. Kuwait ÷ Qatar utility ≈ 3.7x, and Qatar marketing ÷ utility ≈ 2.8x ("about 3x" is fair).
- Lebanon (+961) is in "Rest of Middle East". The current table lists that group as Bahrain, Jordan, Lebanon and Yemen.
- Per-message pricing since 1 Jul 2025, and price set by the recipient's country calling code.
- Qatar on its own rate list since 1 Jul 2026. Kuwait, Oman and Iraq on their own lists since 1 Oct 2026.
- AI Providers rule effective 15 Jan 2026. Exempt markets: Italy 16 Feb–12 May 2026, 29 European countries 11 Mar–12 May 2026, Brazil from 11 Mar 2026. Updated 12 May 2026. "This does NOT change how or what Meta charges all other businesses." AI Provider charging from 16 Feb 2026.
- Meta Terms for WhatsApp Business Platform: last modified 23 Sep 2026. The meaning of §4.7 (AI Providers barred when AI is the "primary" functionality, Meta's sole discretion, "Solution Provider" allowed, no training on platform data, exclusive fine-tuning allowed) matches a reading of the live page.
- Messaging limit: new business portfolios start at 250 unique users outside the service window per moving 24 hours, rising to 2,000 via verification or 2,000 good-quality messages in 30 days, then 10k / 100k / unlimited. Phone numbers: "initially capped at two", rising to 20 after verification or reaching the 2,000 limit. Number requirements (owned, SMS or voice, not on WhatsApp Messenger, two-step PIN) are as stated.

**Corrected**
- "Messages from mom, and Zaki's replies within 24 hours, are free; utility templates inside the window are free" → **Since 1 Oct 2026, service (free-form) messages are charged after 1,000 free per business phone number per month, and utility templates are charged even inside the 24h window.** Source: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing ("Meta resumed charging … Service messages … Utility messages sent in response to users"). Changed in the summary, the "what this changes" table, §2.1, §2.2, §2.3 and the cost example.
- "Treat the 1 Oct 2026 paid-service-message claim as false" → **True** (official page, see above).
- Qatar "Service, and utility inside window = $0" → service $0.0120 after the free 1,000; utility inside window $0.0120.
- Rate-card date "effective 1 Jul 2026" → **effective 1 Oct 2026** (the official file title). The figures were already the current ones.
- The calculator "Service = utility rate" was described as a contradiction → it is correct.
- Price-change notice "at least one month" → 1 month for rate cards, 3 months for add-ons, 6 months for pricing-model changes.
- New requirement added: without a payment method, Meta stops delivering service messages.

**Could not verify**
- The exact word-for-word text of §4.7 quoted in 1.1: the terms page loads by script, and neither the page reader nor a raw download returned the clause text. The meaning matches, but re-read the live page in a browser before relying on the quote.
- Whether Meta's free test number can still send free-form replies with no payment method after 1 Oct 2026 (flagged on line 30).
- Business-verification document list (Meta help article loads by script; still only partner sources).
- Non-official sources still in use: Gulf News (ban coverage), 360dialog and Telnyx (verification documents). Earlier secondary claims about the 1 Oct change (Zoho, LINK Mobility, respond.io) were right but are not needed now that Meta confirms it.
