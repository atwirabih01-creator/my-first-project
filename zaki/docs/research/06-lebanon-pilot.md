# 06 — Lebanon family pilot: law, safety help lines and local realities

*Phase 0 deep research for Zaki. Researched 2026-10-15 by the Legal Compliance Checker agent.*

> **This is research, not legal advice.** It summarises public sources found online on 15 October 2026. Laws, phone numbers and conditions in Lebanon change quickly, especially during the 2026 hostilities. A Lebanese lawyer should confirm the legal points before real children use Zaki, even in a family pilot. Nobody was contacted, nothing was signed up for, and no money was spent.

How to read the labels:
- **Confirmed**: an official source (the law's own text, a government website, or the organisation's own website) says it.
- **Partly confirmed**: reputable secondary sources agree, or an official source covers only part of it.
- **Not found / UNVERIFIED**: no reliable official source was found. Do not show it to children until checked.

All sources were checked on **2026-10-15** unless another date is given.

---

## Plain-language summary

- **Lebanon has a privacy law, and it covers your family pilot.** It is Law No. 81 of 2018. It applies to anyone who collects information about people, even someone living abroad. The only exception is purely personal use. A pilot for a future business is very likely not "personal use". (Confirmed from the law's text.)
- **Written permission from the parents means no government filing.** Normally you must notify Lebanon's Ministry of Economy and Trade before collecting personal data. The law skips this step when the person agrees in advance. For children, that means the parents agree in writing before the child starts. Keep the signed forms. (Confirmed from the law's text; how it works for children still needs a lawyer.)
- **Avoid health information.** Lebanon's law forbids collecting health information unless the person clearly agrees or a licence is obtained. If a child says "I'm sick", "I'm sad" or "someone hurt me", that may count as health information. So the parents' form should say this can happen. The app should keep as little of it as possible and delete it quickly. (Confirmed from the law's text; how it applies to a tutoring app is a question for a lawyer.)
- **Families must get answers within 10 days, not 30.** If a parent asks to see, correct or delete their child's data, Lebanon's law gives you 10 days. The plan's 30 days is too long for Lebanon. (Confirmed from the law's text.)
- **Sending data to US and EU servers is allowed.** Lebanon's law does not ban it, but the parents must be told where the data goes. (Confirmed from the law's text.)
- **Help lines for the safety script:** police emergency **112**; domestic violence police line **1745**; the national emotional support and suicide prevention line **1564** (24 hours, 7 days, confirmed on Embrace's own page); child protection charity **himaya: 03 414 964** (opening hours **not published**; UNHCR lists himaya's regional lines as **office hours only, Mon–Fri 8:30–16:00**); women and family charity **KAFA: 03 018 019** (24/7 according to Find A Helpline, not stated on KAFA's own site). All numbers were re-checked on 2026-10-15/16 against the organisations' own websites. **Lebanon has no working national child helpline** that a child can call (see the table below). So the child-facing message is "tell a grown-up you trust" plus 112 and 1564, which are the only lines confirmed to answer at all hours. (See the table below and the fact-check at the end.)
- **Lebanon is hard on apps right now.** In July 2026 the state power company supplied about **4 hours of power a day** on average. Since March 2026 there have also been serious hostilities, with displacement. Zaki must work with weak internet, use little data, and save progress if the connection drops. Most Lebanese phones are Android: about **73% Android against 27% iPhone** (StatCounter, September 2026; between 64% and 73% Android in every month of the past year). An iPhone-only pilot is fine for your family, but not for a wider Lebanese launch. (Partly confirmed.)
- **TestFlight is not allowed for children under 13.** Apple's TestFlight terms say children under 13 "are not permitted to use TestFlight". All Zaki pilot children are 6–12. So the **parent** must be the tester: install the TestFlight app and the Zaki beta with the **parent's own Apple Account**, on a device the parent controls, and do not invite the children's accounts. Ask a lawyer or Apple whether a child using a beta that a parent installed is acceptable. If not, Apple's "ad hoc" install on registered devices, which is part of the paid developer account, is an alternative. (Confirmed from Apple's terms.)
- **School language matters.** In Lebanon, many children learn math and science in **French or English**, not Arabic. Find out which language your family's children use at school. If it is French, Zaki (Arabic and English only) will not match their homework. (Partly confirmed.)

---

## What this changes in the plan

| Plan section | What the plan says now | What to change | Why |
|---|---|---|---|
| §9 heading and scope | "Qatar first; each new country needs its own check" | Add a **§9-LB "Lebanon family pilot"** section with the checklist at the end of this file. | The first real children are now in Lebanon, not Qatar. |
| §12 Phase 3 gate | "only after Section 9 items 1–3 are cleared" (all Qatar items) | Make the gate country-specific. **Lebanon family pilot:** the Lebanon checklist below, plus a lawyer's answer on whether Qatar's law also applies because the founder lives in Qatar. **Qatar families:** the Qatar items 1–3 still apply, unchanged. | Qatar company registration and the Qatar Ministry of Education do not govern Lebanese children. But the Qatar research (`04-qatar-legal.md`) says no real child's data should be processed until Qatar's regulator gives permission. Whether that covers a Qatar-resident founder with children in Lebanon is **unresolved**. |
| §8.1 safety script | "age-appropriate help route (Qatar's Aman Centre…)" | Make help routes **country-aware**. Choose them from the family's country. Lebanon, child-facing: trusted adult, 112, 1564, and himaya with the note "if nobody answers, call 112". Adult-facing: 1745, KAFA, himaya, and the regional child-protection lines (table below). | Qatar's 919 line is useless to a child in Lebanon. |
| §8.1 safety script | "If the parent may be the source of harm, the case goes to a human review queue" | For the family pilot, name **one reviewer in writing before the start**. It should ideally be someone outside the family, with a child-safeguarding background. Write down what happens if a relative may be the source of harm. | In a family pilot, the founder reviewing relatives' children is a conflict of interest and is emotionally hard. Decide this in advance, not during a crisis. |
| §8.2 privacy | "requests are answered within 30 days" | For Lebanon: **10 days** for correction or deletion (Art. 101). Answer access requests within **10 working days** (Art. 107). Simplest fix: use a 10-day target everywhere. | Law 81/2018 Arts. 101 and 107. |
| §8.2 privacy | "Verified parental consent" | For Lebanon, the consent form must include the **six items in Art. 88**. It must also cover health data (Art. 91), sending data abroad (Art. 96 item 12) and how long data is kept (Art. 90). Get the signature of the child's **legal guardian**. In Lebanon that may be the father under the family's religious personal-status law, so ask **both parents** to sign. | Plan and §3.1 assume "mom" consents. Under Lebanese personal-status laws, legal guardianship (*wilaya*) is often separate from day-to-day custody. Lawyer to confirm. |
| §2 decision 3 / §3.1 | Parent = "mom" throughout | Use "parent / guardian" in consent and data flows. | Same reason as above. |
| §10.1 Stack | "Next.js web app (PWA)… Native app later" | Already replaced by the founder's native-app decision (DECISIONS.md). For Lebanon, add: **offline-friendly and low-data design** (details in Finding 3.1). | Lebanon's power and internet situation. |
| §1 Languages | Arabic and English only | Keep for the pilot **if** the family's children study math and science in English or Arabic. If they study in French, either choose children on an English track, or add French as a planned language for Lebanon and other French-teaching schools. | Lebanese schools teach math and science in French or English (see Finding 3.4). |
| §8.1 moderation tests | "Arabic and Gulf-dialect test set, including Arabizi" | Add **Lebanese (Levantine) Arabic**, Lebanese Arabizi and **French/Arabic/English mixing** to the red-team and moderation test set before the pilot. | Lebanese children often mix three languages in one sentence. |
| §3.1 weekly summary | "weekly summary every Thursday" | Make the day configurable. Lebanon's weekend is Saturday–Sunday; the GCC weekend is Friday–Saturday. Use the family's time zone (Lebanon is UTC+2/UTC+3; Qatar is UTC+3). | Local habits. |
| §12 Phase 3 "Test 2–3 price points (QAR 49/79/99)" and §13 "50%+ would pay" | Pricing test | **Skip the price test with family.** Relatives are not neutral buyers. Keep learning and safety measures only. | Family answers about money are unreliable. |
| §14 | "Aman Centre helpline number" | Add: "Lebanon help lines (re-check every 3 months during the pilot, given the security situation)". | Numbers and services in Lebanon change at short notice. |

---

## Detailed findings

### 1. Lebanon data protection: Law No. 81 of 10 October 2018

**Main source (primary):** the English translation of Law 81/2018 as published in the Official Gazette, hosted by SMEX:
https://smex.org/wp-content/uploads/2018/10/E-transaction-law-Lebanon-Official-Gazette-English.pdf
Part V "Personal Data Protection", Articles 85–109. Checked 2026-10-15. The Arabic Gazette text is the legally binding version; this English text is a translation.

**Secondary sources:** DLA Piper, *Data Protection Laws of the World – Lebanon*, https://www.dlapiperdataprotection.com/?t=law&c=LB (page last modified 21 Dec 2022; it says it may not reflect recent updates). SMEX commentary: https://smex.org/an-ugly-new-data-protection-law-in-lebanon/

#### 1.1 Does the law apply to a small family pilot? — Confirmed (text); application is a lawyer question

- **Art. 85:** the law applies to "all automatic and non-automatic processing" of personal data. It does **not** apply to "processing related to the personal activities carried out by the individual exclusively for fulfillment of his/her needs".
- A pilot that tests a future paid product is very likely **not** purely personal, even with relatives. Treat the law as applying.
- **Founder in Qatar:** the law has no explicit rule on where the controller lives. But Art. 96 item 7 and Art. 98 item 4 refer to "the representative of the data processing officer… residing outside the Lebanese territory". So the law expects foreign controllers to be covered when they process data of people in Lebanon. **Partly confirmed.**
- **Effective date:** in force since 2019 (three months after publication). **Partly confirmed** (DLA Piper and others).

#### 1.2 Rules for collecting and using data — Confirmed (text)

- **Art. 87:** collect data "faithfully and for legitimate, specific and explicit purposes"; data must be appropriate, not go beyond the purpose, and be correct. No re-use for other purposes (except statistics, history or research). This supports the plan's minimal data list (first name or nickname, grade, language).
- **Art. 88:** the controller must tell people, **in the collection form itself**:
  1. who the controller is (or their representative);
  2. the purposes;
  3. which questions are mandatory and which are optional;
  4. what happens if they don't answer;
  5. who the data is sent to;
  6. the right to access and correct, and how to use it.
- **Art. 89:** if data is collected from someone else (for example, a parent typing a child's details), the person concerned must be informed, unless they already know. For the pilot, a short child-friendly explanation covers this.
- **Art. 90:** keeping data is only lawful for the period stated in the declaration or authorisation. With the consent exemption there is no declaration, so **write the retention periods into the consent form** (90 days for chats, 30 days for photos, as in plan §8.2).
- **Art. 93:** the controller must take security measures suited to the data and its risks. No specific technical list is given.
- **Art. 86:** people may object to automated analyses used about them. No judicial or administrative decision may rely only on automated profiling. This is relevant to "level tracking", but low risk for a homework tutor. Tell parents they can ask a human to look at any assessment.

#### 1.3 Children's data — Not found (no specific rule)

- The law has **no special rule for children**, no age of consent and no definition of consent. DLA Piper and SMEX both note that consent is undefined.
- The closest reference is **Art. 94(4)**: schools processing pupils' data for school purposes are exempt from permits. **Zaki is not a school, so this exemption does not apply.**
- In practice, consent for a minor (under 18) comes from the legal guardian. Under Lebanon's religious personal-status laws, guardianship over a child's affairs is often held by the father, separate from the mother's custody. **Lawyer to confirm**; until then, get both parents' signatures.

#### 1.4 Sensitive data (health, genetic, sexual life) — Confirmed (text)

- **Art. 91:** no data may be collected or processed if it reveals, even indirectly, **health status, genetic identity or sexual life**. Exceptions include: (1) the person "has explicitly agreed"; and (4) a licence under Art. 97.
- **Art. 97:** processing "pertaining to… cases of health, genetic identity, or sexual life" needs a **licence** by decision of the Minister of Public Health. The licence decision is due within 2 months. Silence means refusal.
- **Why it matters for Zaki:** the plan's safety script handles disclosures of self-harm, abuse or danger. A child's message about self-harm, illness or abuse may reveal health or sexual-life data.
- **Low-risk approach** (lawyer to confirm):
  - Zaki does not ask about health.
  - The consent form explicitly covers health information the child may volunteer and the safety alerts that follow.
  - Safety flags store a category and a short excerpt only, which is deleted after review.
  - No dedicated "health" feature is built.
- **Open question:** does incidental health data in a tutoring app make the whole service a "health" process that needs an Art. 97 licence? This could not be confirmed. See "Questions for a lawyer".

#### 1.5 Declaration ("permit") and licence with the Ministry of Economy and Trade — Confirmed (text); practice Partly confirmed

- **Art. 95:** apart from the exemptions in Art. 94, anyone collecting personal data must inform the **Ministry of Economy and Trade (MoET)**, which issues a receipt ("permit").
- **Art. 96** lists 14 items the declaration must contain. These include the purposes, data categories, recipients, retention period, the representative if the controller lives outside Lebanon, transfer to another state, and security measures.
- **Art. 94: no permit is needed** (among others) for:
  - (6) the clients and customers of companies and self-employed people, within their lawful activity;
  - **(7) "In case the person concerned agrees in advance to the processing of his/her personal data, unless there is a legal impediment."**
  - Art. 94 also allows a Council of Ministers decree to exempt low-risk processing. No such decree was found.
- **Conclusion for the pilot:** with **written prior consent from the parents or guardians**, a declaration to MoET is very likely **not required**. This is strengthened by the fact that no public MoET declaration process could be found. **Exception:** if a lawyer considers the processing to involve health data under Art. 97, a licence would be required regardless of the consent exemption.
- **Does MoET run the system in practice?** **Not found.** No official MoET declaration form, online portal or published list under Art. 98 was found (economy.gov.lb has no reachable page on it). A 2024 Euro-Med Monitor statement said the Ministry still had not set up the procedures about six years after the law: https://euromedmonitor.org/en/article/5630/ (secondary). **Partly confirmed** that the system is not working.
- **No data protection authority.** Lebanon has no independent regulator. MoET issues permits, the courts enforce the law, and there is "no administrative enforcement". (DLA Piper; **Partly confirmed**.)

#### 1.6 Sending data abroad (US/EU AI and cloud servers) — Confirmed (text)

- The law has **no ban** on and no adequacy test for transfers abroad. It only requires that a declaration mention "transfer of personal data to another State in any form" (Art. 96 item 12), and that the public list show it (Art. 98 item 8). DLA Piper: "The law is silent on cross-border transfers."
- **For the pilot:** name every provider and country in the consent form. That means Anthropic (US), OpenAI moderation (US), Supabase (EU region), Apple TestFlight (US), Meta WhatsApp (if used) and any speech provider. Use no-training and zero-retention settings as in plan §8.2.

#### 1.7 Rights of parents and children — Confirmed (text)

| Right | Article | Deadline / cost |
|---|---|---|
| Ask whether data is processed; get a copy in understandable form; details of purposes, sources and recipients | Art. 99 | Respond within **10 working days** (Art. 107 penalty). A fee no higher than the cost of copying is allowed (Art. 100). |
| Correct, complete, update or **erase** data that is wrong, out of date, no longer needed, or should not have been collected; tell third parties who received it | Art. 101 | **Free, within 10 days** of the request |
| Object to processing for legitimate reasons (including marketing) | Art. 92 | Not possible once the person has agreed (Art. 92(2)). Treat a withdrawal of consent as a deletion request anyway (good practice). |
| Go to court (judge of urgent matters) | Art. 102 | — |

- **Plan conflict:** plan §8.2 says "requests are answered within 30 days". **This is too long for Lebanon.** Change it to 10 days (or "10 working days, faster for deletion").

#### 1.8 Breach notification — Confirmed (absence)

- The law has **no breach-notification duty** (DLA Piper: "Not applicable"). But **Art. 106** punishes anyone who, "even if negligently", discloses personal data to unauthorised people. Keep the plan's 72-hour breach plan and tell the families directly.

#### 1.9 Penalties — Confirmed (text)

- **Art. 106:** a fine of **LBP 1 million–30 million and/or 3 months–3 years in prison** for:
  - processing without the required permit or licence;
  - breaking the collection rules (Arts. 87–93);
  - negligent disclosure.
- **Art. 107:** a fine of LBP 1–15 million for not answering access or correction requests within 10 working days.
- **Art. 108:** repeat offences increase penalties by one third to one half.
- **Art. 109:** prosecution for negligent disclosure (Art. 106, third case) and for Art. 107 offences needs a complaint by the person harmed.
- At the official rate of about LBP 89,500 per US dollar, the fines are now roughly **US$11–$335**. That is tiny, but **prison terms remain on the books**. The risk is legal and reputational, not financial.

#### 1.10 Amendments and implementing decrees to 2026 — Not found

- No amendment to Part V and no implementing decree (for example, the Art. 94 exemption decree or the Art. 97 ministerial licence decisions) was found in English or Arabic searches.
- Civil society reports call for a modern law and an independent authority:
  - SKeyes policy paper, Feb 2024: https://www.skeyesmedia.org/documents/bo_filemanager/Data-Protection-Report_AR.pdf
  - Council of Europe study: https://rm.coe.int/3692-1-2-study-pdp-lebanon-coe-108-/1680a1caa2
- **Status:** no bill was found as adopted by 2026-10-15. **Lawyer to confirm** nothing newer exists.

#### 1.11 Qatar overlap — Not found (open question)

- The founder lives in Qatar, and the Qatar research (`04-qatar-legal.md`) says children's data is "special nature" data needing regulator permission before any processing, "including in the pilot".
- Whether Qatar's Law 13/2016 applies to a Qatar-resident individual processing data of children in Lebanon, on servers outside Qatar, was **not** established. **Ask a Qatari lawyer before the pilot starts.**

---

### 2. Child-safety help routes in Lebanon (for the safety script)

| Service | Number | What it is | Hours | Can children call? | Languages | Source (checked 2026-10-15) | Status |
|---|---|---|---|---|---|---|---|
| **Internal Security Forces (police) emergency** | **112** | Police emergency / operations room | 24/7 (emergency line) | Yes; anyone can call an emergency number | Arabic (others not stated) | ISF official site footer "112 · 1745 Domestic Violence": https://www.isf.gov.lb/en (news dated 14/10/2026 on page) | **Confirmed** (number); hours and languages **Partly confirmed** |
| **ISF domestic violence line** | **1745** | Police reporting line for domestic violence (set up under Law 293/2014) | Not stated | Not stated | Not stated | ISF homepage banner "Call 1745 to report domestic violence": https://www.isf.gov.lb/ ; KAFA: https://kafa.org.lb/en/node/86 | **Confirmed** (number). Note: one ISF General Inspectorate page says **1744** (https://isf.gov.lb/internal_links/inspection-generale). The homepage and footer say 1745. **Use 1745**, and re-check before launch. |
| **National Lifeline (Embrace)**: emotional support and suicide prevention | **1564** | Run by Embrace with the Ministry of Public Health's National Mental Health Programme; anonymous; calls are recorded | **24 hours** since 18 March 2022 (Embrace report / Find A Helpline) | Not stated on the official page; Embrace data suggests some callers are under 18 | Arabic and English (Find A Helpline; not on official page) | https://embracelebanon.org/what-we-do/the-national-lifeline/ (page modified 2026-10-12); UNICEF Lebanon lists "National Psychological Support Hotline: 1564": https://www.unicef.org/lebanon/support-families-emergencies | **Confirmed** (number, purpose); hours **Partly confirmed**; children and languages **Partly confirmed** |
| **himaya** (child abuse NGO; mandated by the Ministry of Justice for legal child protection cases in the North) | **03 414 964** (from abroad: +961 3 414 964); also an online "e-helpline" form | Reporting child abuse; psychosocial and legal support | Not stated on the official site (a 2021 himaya presentation said 24/7) | Not stated | Not stated (site in English, French, Arabic) | https://www.himaya.org/ and https://www.himaya.org/content/who-we-are | **Confirmed** (number); hours **UNVERIFIED** |
| himaya North Lebanon & Akkar | +961 79 300 410 | Regional child protection case line | Not stated | Not stated | Not stated | UNICEF Lebanon: https://www.unicef.org/lebanon/support-families-emergencies | **Partly confirmed** (UN source, not himaya's own site) |
| **KAFA** (violence against women and children; family violence) | **03 018 019** | Helpline for emergency help; leave a message for questions | Not stated | Not stated | Arabic / English site | https://www.kafa.org.lb/en (header "Helpline 03 018 019") | **Confirmed** (number); hours **UNVERIFIED** |
| **Ministry of Social Affairs** | **1714** | Listed by UNICEF for complaints and reports about *sexual exploitation and abuse* | Not stated | Not stated | Not stated | UNICEF Lebanon page above. MoSA's own site (socialaffairs.gov.lb) could not be reached (connection reset) | **UNVERIFIED** as a child-protection line. Do not show it to children until MoSA confirms it. |
| Ministry of Social Affairs child protection unit / Higher Council for Childhood | — | Save the Children (2023) says abuse can be reported to 112 or the MoSA child protection unit | — | — | — | https://lebanon.savethechildren.net/node/166 | **Not found**: no dedicated public number found |
| Ministry of Public Health hotline | 1787 (UNICEF page); 1214 (Embrace page) | General health information | — | — | — | UNICEF and Embrace pages above | **Partly confirmed**. Two different numbers are given; not needed for the safety script. |

**Recommendation for the safety script (Lebanon):**
- **Immediate danger:** "Tell a grown-up you trust right now, or call **112**."
- **Feeling very sad or thinking of hurting yourself:** "**1564**. Kind people answer all day and all night."
- **Someone at home is hurting you:** "**himaya 03 414 964**" (a children's charity). Show **1745** as an adult-facing route in the parent alert and in the human-review steps, rather than to young children.
- **Before the pilot**, a trusted adult should call 1564 and himaya once, from a parent's phone and without giving any child's details. They should ask for hours, languages, and whether a child can call. (This is for the founder to decide; the researcher contacted no one.)
- Show numbers with the international form (+961) only for parents abroad. Children in Lebanon dial the short or local form.
- 2026 conditions: Lebanon has been in a humanitarian emergency since hostilities began on **2 March 2026** (OCHA flash updates, e.g. https://reliefweb.int/report/lebanon/lebanon-flash-update-1-escalation-hostilities-lebanon-5-march-2026). Help lines may have reduced capacity. Re-check numbers **monthly** during the pilot.
- Also expect **war-related distress** (fear, displacement, loss) to be a more common "disclosure" than abuse. The script needs a gentle, non-alarming response for "I'm scared of the bombs", which routes to the parent and to 1564, not to the police.

---

### 3. Practical Lebanon realities

#### 3.1 Electricity and internet — Partly confirmed

- **Electricity:** Électricité du Liban (EDL, the state power company) reported a national average of about **4 hours/day** on 13 July 2026, down from 7–9 hours at the end of February 2026 (Libnanews, secondary: https://en.libnanews.com/electricity-in-lebanon-promises-against-cuts/). Homes rely on private generators and solar.
- **Internet:** the state operator Ogero's exchanges have backup generators meant for only 4–8 hours a day, and internet outages have followed fuel shortages (L'Orient Today, older reporting: https://today.lorientlejour.com/article/1265636/). Freedom on the Net 2025 reports damaged telecom towers and months-long outages in hard-hit areas after 2024 (via ecoi.net: https://www.ecoi.net/en/document/2133574.html). **No 2026-specific outage data was found.**
- **Mobile data is expensive:** a high-usage mobile basket costs 4.45% of income per head (2025, Byblos Bank via Annahar: https://www.annahar.com/economy/296852/). **Partly confirmed.**
- **What this means for Zaki:**
  - Download each lesson pack ahead of time and keep it on the phone, so a lesson can continue offline.
  - Save progress after every step, so it resumes after a disconnect.
  - Queue answers and uploads, and send them when the connection returns.
  - Shrink photos on the phone before upload (for example, to about 200–400 KB).
  - Make voice optional and off by default on mobile data. Use text first.
  - Show a "no connection — your work is saved" message instead of an error.
  - Keep sessions short (already in the plan).
  - Expect the phone's battery saver to be on. Lebanese families charge on generator hours, so keep animations light.
  - Let parents choose "Wi-Fi only" for downloads.

#### 3.2 Devices — Partly confirmed

- **StatCounter, mobile operating system, Lebanon:** Android **72.9%**, iOS **27.1%** (September 2026 chart). Earlier 2026 months ranged from about 64–69% Android to 31–36% iOS. https://gs.statcounter.com/os-market-share/mobile/lebanon
- **Meaning:**
  - An iPhone-only family pilot is fine if the family's children use iPhones or iPads.
  - A wider Lebanese launch would miss roughly two in three phone users without Android.
  - Many children use a parent's or a shared device; plan §2 decision 9 already notes this.

#### 3.3 App Store, TestFlight and payments — Partly confirmed

- **App Store in Lebanon:** Apple has a Lebanon App Store storefront and a Lebanon Apple Support site (https://support.apple.com/en-lb/guide/app-store/toc). No official Apple list was fetched today. **Partly confirmed.**
- **TestFlight** (Apple official: https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/):
  - Up to 100 internal testers (people on your App Store Connect team) and up to 10,000 external testers (by email invite or public link).
  - The **first build for external testers needs Beta App Review**.
  - Builds last **90 days**.
  - Testers install the free TestFlight app. Apple's page lists no age or country limits.
  - Practical tip: invite the **parents' Apple Accounts** by email, not a public link. Install on a device the parent controls.
  - Whether children's Apple Accounts (under 13, in Family Sharing) can install TestFlight builds was **not confirmed**. Test it with one family first.
  - **Confirmed** (Apple); child-account detail **Not found**.
- **Payments (later):**
  - Online card payments in Lebanon run mostly on "fresh dollar" cards (cards linked to new US dollar accounts, which work abroad unlike the old frozen deposits). Card payments rose about 130% in the first eight months of 2026 (L'Orient Today: https://today.lorientlejour.com/article/1547050/).
  - Older lira-based cards are often declined by foreign sites.
  - Cash transfer services (OMT, Whish) are widely used, but not for App Store billing.
  - If Zaki charges through Apple in-app purchase, Apple handles billing. Parents need a fresh-dollar card or Apple gift cards.
  - **Partly confirmed.** Not needed for the family pilot (no payments).

#### 3.4 Language of instruction and curriculum (CERD/CRDP) — Partly confirmed

- **Primary grades (1–6):** TIMSS country profiles, written by Lebanese education authorities, say math and science in cycles 1–2 (grades 1–6) are taught in Arabic **and may also be taught in a foreign language (French or English)**. From grade 7, they are taught in French or English.
  - TIMSS 2015: https://timssandpirls.bc.edu/timss2015/encyclopedia/countries/lebanon/
  - TIMSS 2019: https://isc.bc.edu/timss2019/encyclopedia/pdf/Lebanon.pdf
- **In practice:** most private schools teach math and science in French or English from the early grades. English has been gaining since 2019–20. Private English-medium schools rose from 445 (2018–19) to 494 (2023–24), per CERD data reported by L'Orient Today (https://today.lorientlejour.com/article/1481686/). An older 2012–13 split showed private schools about 56% francophone and 44% anglophone (https://monthlymagazine.com/en/article/1685/).
- **The curriculum is changing:** the government adopted a new national curriculum by **Decree No. 3445**. It is competency-based, cycles shrink from three years to two, and history is merged into a "human and social sciences" book in elementary school. This was reported by L'Orient Today with a September 2026 date (https://today.lorientlejour.com/article/1547687/). The exact adoption date and the rollout by grade were **Not found**. CRDP's January 2025 newsletter describes the reform's committees (https://crdp.org/sites/default/files/inline-files/Newsletter%20French%20and%20English.pdf). Official CRDP framework text: **Not found**.
- **What it means for Zaki:**
  1. Ask which language each pilot child uses for math and science at school.
  2. Lebanese children study **Arabic, French and/or English as subjects**. Zaki's "English" and "Arabic" subjects fit; French does not exist in Zaki yet.
  3. Plan §1's "no fixed school system, match the child's book from photos" fits Lebanon well, given the reform underway.
  4. Social Studies in Lebanon (history, geography, civics) is a sensitive area: history teaching is politically contested. For the family pilot, focus on **Math + one language** as plan Phase 3 already says, and avoid generating Lebanese history content.

---

### 4. Does a family pilot change plan §9 / Phase 3 order?

Yes, in four ways.

1. **The gate moves.** Phase 3 was gated on Qatar items 1–3 (Qatar company registration, Qatar Ministry of Education, Qatar data permit). For Lebanese children the relevant law is Lebanon's Law 81/2018, which a family pilot can meet with written parental consent and data minimisation. **But** the Qatar data-permit question (§1.11 above) must be answered first, because the founder is in Qatar.
2. **The native iPhone app is needed earlier.** The plan had "native app later" (Phase 4). The family pilot now needs a TestFlight build by Phase 3. That means an Apple Developer account (paid; **ask the founder before spending**) and one Beta App Review, so allow 1–2 extra weeks.
3. **WhatsApp can wait.** With family members, the parent channel could be a simple in-app parent area plus the founder messaging parents personally. That lets Phase 2's Meta WhatsApp setup come after the first family sessions. This is optional, but it reduces cost and policy risk at the start.
4. **Measurement changes.** Drop the price test. Keep usage, learning and safety measures. Treat feedback as friendly and biased, and plan a second, non-family pilot before drawing conclusions.

---

## Before the family pilot: checklist

Keep it short. Tick every item before the first child session.

**Legal and consent**
- [ ] A lawyer (Qatar) answers: does Qatar's data law apply to this Lebanon pilot? If yes, follow `04-qatar-legal.md` first.
- [ ] A lawyer (Lebanon) gives a quick view on the five questions below. Ideally this is one short consultation.
- [ ] A **written consent form in Arabic (and English)** is signed by **both parents / the legal guardian** of each child *before* first use. It contains:
  - who runs Zaki and how to reach them (name, email, phone);
  - what Zaki is for;
  - what data is collected: first name or nickname, grade, language, chats, photos of homework, scores;
  - which items are optional, and what happens if they say no;
  - **every company that receives data and its country** (Anthropic US, OpenAI US, Supabase EU, Apple, any voice provider, WhatsApp if used);
  - how long data is kept (chats about 90 days, photos about 30 days, summaries until deleted);
  - the right to see, correct and delete, **answered within 10 days**, free;
  - an explicit agreement that a child may mention health or safety matters, and what Zaki does then (parent alert, human review, help numbers);
  - who reviews flagged sessions (named person);
  - that this is a test version that can make mistakes;
  - how to stop at any time.
- [ ] A short **child-friendly explanation** (read aloud by the parent): "Zaki is a computer helper, not a person. Mom and Dad can see your lessons."
- [ ] Keep signed forms safely, for example scanned in a private folder. Write a one-page **record**: what data, why, where it is stored, who sees it, how long. This is Art. 96 content you'd need anyway if a declaration were ever required.

**Data minimisation and settings**
- [ ] Collect only nickname, grade and language. No surname, school, photos of faces, or location.
- [ ] AI providers set to no-training / zero retention where available; data-processing terms accepted.
- [ ] Safety flags store a category plus a minimal excerpt, which is deleted after review. No health questions in the app.
- [ ] A way to export and delete one family's data within 10 days (it can be manual by the founder during the pilot).

**Safety**
- [ ] Country-aware help routes in the app, set to **Lebanon**: 112, 1564, himaya 03 414 964 (child-facing); 1745 and KAFA 03 018 019 (parent and reviewer-facing). Do not show MoSA 1714 until verified.
- [ ] A trusted adult has phoned 1564 and himaya to confirm hours and whether children can call (founder's decision; the researcher did not call).
- [ ] A **named reviewer** for flagged sessions, ideally not a relative, plus a written plan for "the concern involves a family member".
- [ ] Red-team suite run, including **Lebanese Arabic, Arabizi and French mixing**, and "war fear" messages. Zero failures.
- [ ] The secrecy test passes: Zaki never says "keep this between us".

**Product and practical**
- [ ] Confirm each child's school language for math and science (Arabic / English / French) and their grade. Start with Math + one language.
- [ ] Offline-friendly basics: saved progress, retry on reconnect, compressed photo upload, voice optional.
- [ ] TestFlight build approved (Beta App Review); parents' Apple Accounts invited by email; tested on the actual family devices.
- [ ] Session caps and break reminders on; reminders set in Lebanon time.
- [ ] A one-page "what to do if something goes wrong" sheet for the parents, with the founder's contact details.

---

## Questions for a lawyer

**Lebanese lawyer**
1. For a pilot with a few related children, does Art. 94(7) (prior consent) exempt us from declaring to the Ministry of Economy and Trade? Must the consent come from the father as legal guardian (*wali*), from both parents, or is the mother's consent enough under the family's personal-status law?
2. If a child volunteers health, self-harm or abuse information, is Art. 91(1) "explicit agreement" by the guardian enough? Or does the service need an Art. 97 licence from the Minister of Public Health? Has any Art. 97 ministerial decision been issued?
3. Has the Ministry of Economy and Trade published any declaration form, portal or Art. 98 list, or any Council of Ministers exemption decree? Has Part V of Law 81/2018 been amended since 2018?
4. Does Lebanese law (for example, Law 422/2002 on juveniles at risk, or the Penal Code) create a **duty to report** if an adult (the founder or reviewer) learns through the app that a child is in danger? To whom (juvenile judge, prosecutor, UPEL, ISF)?
5. Does the controller need a representative in Lebanon (Art. 96 item 7) when the founder lives in Qatar, even if no declaration is filed?

**Qatari lawyer**
6. Does Qatar's Law No. 13 of 2016 apply when a Qatar-resident individual (no company yet) processes data of children who live in Lebanon, on servers in the US/EU? If yes, is the PDPPD "special nature" permission needed before this small family pilot?
7. Should the pilot run under a company (Qatar or elsewhere) rather than the founder personally, to limit personal liability?

---

## Sources (all checked 2026-10-15)

**Law and regulation**
- Law 81/2018, Official Gazette English translation (SMEX): https://smex.org/wp-content/uploads/2018/10/E-transaction-law-Lebanon-Official-Gazette-English.pdf
- DLA Piper, Lebanon (modified 21 Dec 2022): https://www.dlapiperdataprotection.com/?t=law&c=LB
- SMEX commentary: https://smex.org/an-ugly-new-data-protection-law-in-lebanon/
- Euro-Med Monitor on non-implementation: https://euromedmonitor.org/en/article/5630/Lebanon:-Data-protection-law-fails-to-protect-people%E2%80%99s-privacy-and-data
- SKeyes, "Towards a modern data protection law in Lebanon" (Feb 2024, Arabic): https://www.skeyesmedia.org/documents/bo_filemanager/Data-Protection-Report_AR.pdf
- Council of Europe study: https://rm.coe.int/3692-1-2-study-pdp-lebanon-coe-108-/1680a1caa2

**Help lines**
- ISF: https://www.isf.gov.lb/ , https://www.isf.gov.lb/en , https://isf.gov.lb/internal_links/inspection-generale
- Embrace National Lifeline: https://embracelebanon.org/what-we-do/the-national-lifeline/ ; Find A Helpline: https://findahelpline.com/organizations/the-lifeline-1564
- himaya: https://www.himaya.org/ , https://www.himaya.org/content/who-we-are
- KAFA: https://www.kafa.org.lb/en , https://kafa.org.lb/en/node/86
- UNICEF Lebanon, Support for Families in Emergencies: https://www.unicef.org/lebanon/support-families-emergencies
- Save the Children Lebanon (2023): https://lebanon.savethechildren.net/node/166
- OCHA Lebanon flash updates (2026): https://reliefweb.int/report/lebanon/lebanon-flash-update-1-escalation-hostilities-lebanon-5-march-2026

**Local realities**
- StatCounter Lebanon mobile OS: https://gs.statcounter.com/os-market-share/mobile/lebanon
- Libnanews on EDL supply (2026): https://en.libnanews.com/electricity-in-lebanon-promises-against-cuts/
- L'Orient Today on Ogero and power: https://today.lorientlejour.com/article/1265636/
- Annahar / Byblos Bank internet affordability (2025): https://www.annahar.com/economy/296852/
- L'Orient Today on card payments (2026): https://today.lorientlejour.com/article/1547050/
- Apple TestFlight overview: https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/
- TIMSS 2015 / 2019 Lebanon profiles: https://timssandpirls.bc.edu/timss2015/encyclopedia/countries/lebanon/ , https://isc.bc.edu/timss2019/encyclopedia/pdf/Lebanon.pdf
- L'Orient Today on English in schools: https://today.lorientlejour.com/article/1481686/ ; on curriculum reform (Decree 3445): https://today.lorientlejour.com/article/1547687/
- CRDP newsletter (Jan 2025): https://crdp.org/sites/default/files/inline-files/Newsletter%20French%20and%20English.pdf
