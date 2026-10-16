# 04 — Qatar legal and safety facts (plus regional overview)

*Phase 0 deep research for Zaki. Researched 2026-10-15 by the Legal Compliance Checker agent.*

> **This is research, not legal advice.** It summarises public sources found online on 15 October 2026. Laws, forms and phone numbers change. A Qatari lawyer must confirm all of this before real families use Zaki. Wherever a source was secondary (a law firm, a news article or a vendor blog) and not the official government text, this report says so.

How to read the labels:
- **Confirmed**: an official government source, or the law's own text, says it.
- **Partly confirmed**: reputable secondary sources (law firms, national news) agree, or an official source covers only part of it.
- **Not found**: no reliable source was found. It is still an open question.

---

## Plain-language summary

- **Children's data needs a government permission before you start.** Qatar's privacy law treats any data about children as "special" data. Before Zaki collects any child's data, the company must ask the privacy regulator for written permission. The request is a form plus a written risk review, sent by email. No official waiting time is published, so allow several weeks. (Confirmed.)
- **The regulator has a new name.** It is the **Personal Data Privacy Protection Department (PDPPD)**, part of the **National Cyber Security Agency (NCSA)**. Older articles call it the "National Data Privacy Office" or "NCGAA". (Confirmed.)
- **Sites for children have five extra rules.** Explain what children's data you collect. Get the parent's clear consent first. Show the parent the data on request. Delete it when the parent asks. Never require extra data to join a game or activity. (Confirmed from the law's text.) The law gives no age for a "child".
- **Data can be stored abroad, with care.** Qatar's law does not force ordinary data to stay inside Qatar. Using servers in Europe or the US is allowed in principle. But it must be written into the risk review and the permission request. A Qatar-based server (Google Cloud Doha or Microsoft Azure Qatar Central) would make the request easier to defend. Supabase still has no Middle East location. (Partly confirmed.)
- **The Ministry of Education is the biggest unknown.** Qatar requires licences for private tutoring and for "curriculum reinforcement" centres. No public rule says whether an AI homework app counts. Write to the Ministry and get the answer in writing before charging families. (Not found, so it remains an open question.)
- **The new QAR 500 online business licence may not fit.** It needs a .qa website address. News articles about the 194 allowed activities do not mention education. An education app may need a normal company registration plus Ministry of Education approval instead. (Partly confirmed.)
- **The child help line is 919 (Aman Centre).** It is free and open 24 hours a day. Aman also has a "Help Me" phone app that children can use themselves to ask for help. (Confirmed from Aman's own website.) The general emergency number is 999. (Partly confirmed: consistent news and guide sources; the Interior Ministry page could not be opened.)
- **Does Qatar's law even cover the Lebanon family pilot? Unclear.** The law does not say where it applies geographically. Because the founder (the person deciding how the data is used) is in Doha, there is a real chance it does apply, and then the permission rule applies too. Treat it as applying until a Qatari lawyer says otherwise. See section 1.11. (Fact-check, 2026-10-15.)
- **Around the region, the rules are similar but stricter in places.** Saudi Arabia, the UAE and Egypt have strong children's-data rules. The UAE's new Child Digital Safety law becomes fully enforceable in January 2027. Saudi Arabia licenses online-learning providers. Each country you launch in needs its own check.

---

## What this changes in the plan

| Plan section | What the plan says now | What to change | Why |
|---|---|---|---|
| §9.3 heading | "regulated by the National Cyber Security Agency (NCSA)" | Write: "regulated by the **Personal Data Privacy Protection Department (PDPPD)** of the National Cyber Security Agency (NCSA)". | NCSA's own October 2025 guidance and September 2026 press coverage use this name. |
| §9.3, first bullet | "Children's data is **likely** 'special nature' data" | Write "**is**". Then add: "Send the *Special Nature Processing Permission Request Form* with a DPIA (a written privacy risk review) and a processing record to PDPPD by email. **Do not process any real child's data, including in the pilot, until permission is granted.**" | Article 16 of the law lists children by name. |
| §9.3, second bullet | "publish a children's data policy and get parental consent" | Add all five Article 17 duties: notice; explicit guardian consent by electronic or other suitable means; give the parent a copy of the data on request; delete or stop on request; no extra data as a condition for joining an activity. | Plan lists only 2 of the 5. |
| §9.3, third bullet | "notify breaches within 72 hours" | Keep the 72 hours (it comes from NCSA guidance; the law itself just says "notify"). Add: "Notify both PDPPD **and affected families** when a breach could cause serious harm. Also check whether the National Incident Management Framework applies (it has a 2-hour NCSA rule for incidents with national-level impact)." | NCSA Advisory Note, October 2025. |
| §9.3, fourth bullet | "Answer data requests within 30 days" | Keep the 30 days as the target. Note that the official source confirms 30 days for erasure requests; consent withdrawal must be handled "promptly", meaning straight away. | Peninsula report on the NCSA Individuals' Rights Guidelines, April 2026. |
| §8.2 retention | Transcripts kept ~90 days, photos ~30 days | No change needed. Keep these periods, and write them into the DPIA and the processing record. | |
| §8.5 | "statement of compliance with Qatar's data law" | Add: "a children's data notice (Article 17) in Arabic and English". | |
| §9.1 | "Check whether the e-commerce licence (QAR 500, needs a .qa domain) covers education apps" | The details are correct: Decision No. 25 of 2026 (in force 16 March 2026; the licence service opened September 2026), QAR 500, a .qa or .com.qa domain, and the business must already be on the commercial register. But no source lists education among the 194 activities. Treat it as **unlikely to fit**. Ask the Single Window / MOCI and a lawyer. | |
| §9.2 | "Ask the Ministry of Education whether an AI tutoring app needs approval" | Keep, and make it a **hard gate before Phase 3**. Cite the Educational Services Law (**Law No. 18 of 2015**) and Ministerial Resolution 10 of 2017, which bring "curriculum reinforcement" services into licensing (licence about QAR 5,000 a year, per Al Tamimi; a bank guarantee of QAR 100,000–200,000 is also reported). | Higher risk than the plan suggests. |
| §10.1 Supabase row | "no Middle East region; nearest are Mumbai/Frankfurt" | Still true (official Supabase region list, checked today). Qatar law does **not** require local hosting for this kind of data. Note: "a Doha-hosted option (Google Cloud me-central1 or Azure Qatar Central) strengthens the special-nature permission request; decide after PDPPD feedback." | |
| §9.6 | "COPPA (US, amended rules effective April 2026)" | Write: "amended Rule **effective 23 June 2025; compliance deadline 22 April 2026** (a few provisions have different dates)". | "Effective April 2026" mixes up the two dates. |
| §9.6 | "GDPR (EU, parental consent under 16)" | Write: "under 16 by default; each EU country may lower this to 13–15". | |
| §14 | "Aman Centre helpline number" | **Resolved: 919**, 24/7, free, several languages. Also the "Help Me" app for children. Emergency: **999**. | |
| New | none | Add a regional section to §9 that links to the table below. Each new country needs its own legal check before launch. Lebanon pilot: see `06-lebanon-pilot.md`. | Scope update from the founder. |
| §12 Phase 3 gate (Lebanon pilot) | none | Add: "Until a Qatari lawyer confirms otherwise, assume Qatar's data law and its permission rule also cover the Lebanon family pilot, because the founder runs it from Doha." | Section 1.11 (territorial scope). |

---

## Detailed findings — Qatar

### 1. Personal Data Privacy Protection Law (Law No. 13 of 2016, "PDPPL")

#### 1.1 Who regulates it now — **Confirmed**
- The law is enforced by the **Personal Data Privacy Protection Department (PDPPD)**, which belongs to the **National Cyber Security Agency (NCSA)**. NCSA's guidance says this rests on **Amiri Decree No. 1 of 2021**.
  - Source: NCSA, *Advisory Note on Building a Comprehensive Data Privacy Program*, PDPPL-202501AN (E), v1.0, October 2025 (official PDF): https://ncsa.gov.qa/shared/document_library/94787172324409/33000/9737/1.0~b83017e6-db74-4592-a981-caae6512cbf8?mimetype=application%2Fpdf&filename=Advisory+Note+on+Building+a+Comprehensive+Data+Privacy+Program_EN_Final.pdf (checked 2026-10-15)
  - The Peninsula, 27 Sep 2026, says NCSA works "through its Personal Data Privacy Protection Department": http://thepeninsulaqatar.com/article/27/09/2026/qatar-seeks-to-further-advance-cybersecurity-for-safer-digital-future (checked 2026-10-15)
- **Website:** the privacy section has moved. The old portal `assurance.ncsa.gov.qa/en/privacy` now redirects (HTTP 301) to **https://ncsa.gov.qa/en/pages/personal-data-privacy-protection-department**. That page loads its content with JavaScript, so our tools could not read it. Open it in a normal browser to get the forms and email address.
- **Other names you will see:** "National Data Privacy Office (NDPO)" in Baker McKenzie and Qatar Living. "National Cyber Governance and Assurance Affairs (NCGAA)" in DLA Piper, updated January 2024. "Compliance and Data Protection Department (CDP/CDPD)" at the Ministry of Transport/MCIT in 2021-era sources. These are older or informal names for the same function. In forms and the privacy policy, use **PDPPD / NCSA**.
- **Separate regime:** companies set up inside the **Qatar Financial Centre (QFC)** fall under the QFC Data Protection Regulations 2021 and the QFC Data Protection Office, not the PDPPL.

#### 1.2 Are children's data "special nature" data? — **Confirmed (law text)**
- Article 16 lists personal data of a special nature: racial origin, **children**, health or physical or mental condition, religious beliefs, marital relationship, and criminal offences. The Minister may add more categories.
  - Source: full Arabic text of the law published by Al-Sharq, 3 Nov 2016: https://al-sharq.com/article/03/11/2016/بوابة-الشرق-تنشر-نص-قانون-حماية-خصوصية-البيانات-الشخصية (checked 2026-10-15). Also summarised in Qatar Living's 2026 guide: https://www.qatarliving.com/en/article/data-protection-privacy-law-compliance-qatar-businesses
- **The law does not define what age counts as a "child".** Article 1 has no age (law text; Mondaq commentary agrees). Zaki's users (6–12) are children under any reading.

#### 1.3 Permission to process special-nature data — **Confirmed that permission is required; process Partly confirmed; timeline Not found**
- Article 16: special-nature data "may not be processed unless a permit is obtained from the competent department". Procedures are set by ministerial decision, and the Minister may add safeguards.
- NCSA's October 2025 Advisory Note (section 7.8) sets out the steps:
  1. Identify every activity that processes special-nature data.
  2. Carry out a **Data Privacy Impact Assessment (DPIA)**, a written review of the risks and how you reduce them.
  3. Record a "permitted reason" **and** an "additional condition" for special-nature processing in your **Record of Processing Activities (RoPA)**.
  4. **Submit a request for permission to the PDPPD.**
  5. Add stronger security (encryption, access control, anonymisation) and review regularly.
- **Form and delivery:** the *Special Nature Processing Permission Request Form* goes in with the DPIA **by email** (The Peninsula, 27 Sep 2026). The email address was not visible in any source we could read. Get it from the NCSA page in a browser.
- **NCSA reference documents** (titles and codes from the official Advisory Note; download them from the NCSA site):
  - Special Nature Processing – Guideline (PDPPL-02050215E)
  - DPIA – Guideline (PDPPL-02050206E) and DPIA – Template
  - Record of Processing Activities – Guideline (PDPPL-02050212E)
  - Individuals' Rights – Guideline (PDPPL-02050205E)
  - Personal Data Breach Notifications – Guideline (PDPPL-02050217E)
  - Privacy Notice – Guideline (PDPPL-02050213E)
  - Data Privacy by Design and by Default – Guideline (PDPPL-02050208E) and Privacy by Design Assessment Tool
  - Controller and Processor – Guideline (PDPPL-02050209E)
  - Vendor Privacy Management Tool
- **How long it takes:** **Not found.** No official or secondary source gives a decision time. Plan for several weeks and ask the PDPPD directly.
- **Fines — Confirmed (law text, Arts. 23–25):** up to **QAR 5,000,000** for breaking Article 13 (security), Article 16 paragraph 3 (processing special-nature data without the permit) or Article 17 (children's sites) (Art. 24). Up to QAR 1,000,000 for breaking Articles 4, 8, 9, 10, 11, 12, **14 (breach notice)**, 15 and 22 (Art. 23). A company can separately be fined up to QAR 1,000,000 when an offence is committed in its name (Art. 25). These are criminal fines ("يعاقب بالغرامة"), not only administrative ones.

#### 1.4 Rules for websites directed at children (Article 17) — **Confirmed (law text)**
The owner or operator of "any website directed at children" must:
1. Post a notice saying what children's data is collected, how it is used, and the disclosure policy.
2. Get **explicit consent from the child's guardian**, "through electronic communication or any other suitable means".
3. When the guardian asks, and after checking their identity, describe the data and purpose and **give a copy of the data**.
4. When the guardian asks, **delete the data or stop processing it**.
5. Never make a child's participation in a game, prize or other activity depend on giving more data than it needs.
- Source: law text via Al-Sharq (above); Simmons & Simmons and Mondaq summaries agree.
- **Zaki is clearly "directed at children".** The law firms' doubt about which sites count does not help us.
- **Note:** Article 18 lets a "competent authority" exempt some processing from Articles 4, 9, 15 and 17 for certain public purposes. This does not apply to a private company.

#### 1.5 Cross-border transfers (Article 15) — **Confirmed (law text), with caveats**
- Article 15 is unusual. It **forbids the controller (the company in charge of the data) from blocking** cross-border data flows, unless the processing would break the law or cause serious harm to the data or to the person's privacy. Neither the law nor any official source found sets up a transfer-approval system (no "adequacy list" or standard contract clauses) for ordinary data.
- **But:** NCSA guidance treats a cross-border transfer as a trigger for a **DPIA**. The special-nature permission covers the processing wherever it happens. So the permission request must say that data goes to Supabase (EU or India), Anthropic and OpenAI (US), Vercel, Meta (WhatsApp) and Azure Speech, and how each is protected. (Qatar Living 2026; NCSA Advisory Note.)
- NCSA's October 2025 Advisory Note (cross-border section) also says the controller should "ensure the data importing entity established outside Qatar processes personal data in accordance with PDPPL requirements" **via appropriate contractual measures**. So: no approval system, but **signed data-processing contracts with each foreign provider are expected**. (Fact-check, 2026-10-15.)
- Chambers 2026 contradicts itself, calling transfers both "restricted" and "permitted in principle". Ask a lawyer.
  - https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/qatar (checked 2026-10-15)

#### 1.6 Requests from parents (data subject rights) — **Partly confirmed**
- Rights under the law include: to be told about processing, access, correction, erasure, withdrawing consent, objecting, being told about an inaccurate disclosure, and lawful processing (NCSA Advisory Note §7.5).
- **Deadline:** NCSA's *Individuals' Rights Guidelines* (reported April 2026) say controllers must answer **erasure requests within 30 days**. Consent withdrawal must be handled **"promptly"**, meaning right away.
  - https://www.thepeninsulaqatar.com/article/18/04/2026/explainer-ncsa-issues-guidelines-on-individuals-personal-data-privacy-protection-law-in-qatar (checked 2026-10-15)
  - Clyde & Co (2021) also reports 30 days for requests in general: https://www.clydeco.com/en/insights/2021/03/new-regulatory-guidelines-on-the-qatar-persona-1
- The guidance also says: check the requester's identity, and give reasons if you refuse. The plan's "30 days" is right. Make consent withdrawal take effect immediately in the app.

#### 1.7 Breach notification — **Confirmed: 72 hours (from NCSA guidance, not the law text)**
- Article 14: notify **both the individual and the competent department** of any breach of safeguards that could cause **serious harm**. The law text itself gives **no hour count**; the 72 hours comes from NCSA guidance (below), which NCSA presents as how Article 14 is applied.
- NCSA Advisory Note §7.6 (Oct 2025): "notifying the PDPPD and affected individuals **within 72 hours** if the breach is likely to result in serious harm". For incidents with **national-level cybersecurity impact**, notify NCSA **within 2 hours**.
- DLA Piper and Qatar Living say the 72 hours run from **when the controller becomes aware** of the breach.
- Processors (for example a cloud provider) must tell the controller **immediately** (Article 13, per Qatar Living).

#### 1.8 Record of processing (RoPA) — **Confirmed (as an NCSA expectation)**
- NCSA guidance expects a RoPA. For special-nature data, the permitted reason and additional condition must be written in it. Update RoPAs and DPIAs regularly (Advisory Note §§7.8, 8.1). There is a dedicated RoPA guideline (PDPPL-02050212E).
- No requirement to register with the regulator, and no legal duty to appoint a Data Protection Officer. But staff must be named as responsible for data protection (DLA Piper, updated 17 Jan 2024): https://www.dlapiperdataprotection.com/?c=QA&t=law

#### 1.9 DPIA expectations — **Confirmed**
- A DPIA is **required for the special-nature permission** and recommended "before proceeding with any new initiative". Triggers include special-nature data, new technology, automated decision-making, cross-border transfers and children's data. NCSA publishes a **DPIA Template** and a **Privacy by Design Assessment Tool**. Zaki has every trigger: children, AI, transfers abroad and photos.

#### 1.10 Recent changes, 2024–2026 — **Partly confirmed: no amendment to the law found**
- No amendment to Law 13/2016 and no new executive regulations were found up to October 2026 (Chambers 2026: "no recent developments" on transfers. The Peninsula, Sept 2026, still cites Law 13/2016 unchanged).
- **New guidance:** the NCSA Advisory Note (Oct 2025), the Individuals' Rights Guidelines (Apr 2026), and a reported NCSA cloud-privacy assessment tool (Apr 2026, secondary source only: https://captaincompliance.com/education/qatars-new-cloud-privacy-tool-a-game-changer-for-gcc-data-protection-in-the-ai-era/). The Peninsula's 27 Sep 2026 article also reports NCSA privacy workshops.
- **Related:** Law No. 11 of 2025 added Article 8 (bis) to the Cybercrime Law (14/2014). It makes publishing or sharing images or videos of people online without consent a crime. This matters for photo uploads: never show or share children's photos (Mondaq: https://www.mondaq.com/privacy-protection/1670196/qatar-introduces-new-penalties-for-privacy-violations).
- **Enforcement:** NCSA issued binding decisions against a company in the ICT (information and communications technology) sector in 2024 (Baker McKenzie: https://insightplus.bakermckenzie.com/bm/data-technology/qatar-data-protection-enforcement-update). Few fines have been made public.

#### 1.11 Does the PDPPL cover the Lebanon family pilot? (territorial scope) — **Added in fact-check, 2026-10-15. Law text checked; answer uncertain**

**What the law text says**
- **Article 2 (scope)** only describes *what kind of processing* is covered: personal data processed electronically, collected for electronic processing, or processed by a mix of electronic and paper methods. It **does not say where** the law applies, and it does **not** limit protection to Qatari citizens or residents. (Arabic text via Al-Sharq, 3 Nov 2016.)
- **Article 1** defines the protected "individual" (الفرد) simply as a natural person whose data is processed, and the "controller" as whoever decides how and why data is processed. No nationality or location test in either definition.
- **Article 2 exclusions:** the law does not apply to data processed by individuals "in a personal or family scope" (في نطاق شخصي أو عائلي), or to official statistics.
- **Article 16** (permit for special-nature data, including children) has **no exception** for data subjects who live abroad. If the law applies at all, the permit rule applies.
- No NCSA guidance found (Advisory Note Oct 2025; Controller and Processor Guideline v2.0, Sept 2022) addresses territorial scope.

**What commentators say**
- Chambers 2026: the PDPPL "does not contain explicit provisions regarding extraterritorial application" and is "primarily focused on processing activities within Qatar". Tsaaro: nothing in the law indicates its territorial reach. A few vendor blogs claim GDPR-style reach outside Qatar, but cite no article — not reliable.
- The PDPPL penalties are criminal fines. Qatar's Penal Code (Law 11/2004, Art. 13, unofficial English translation) treats a crime as committed in Qatar "if one of its constituent acts was committed in Qatar". *Our inference, not a lawyer's view:* if the founder makes the decisions and accesses the children's data from Doha, part of the "processing" happens in Qatar even though the servers are in the US/EU and the children are in Lebanon.

**Practical answer for Zaki**
1. **Likely yes, it can apply.** A controller based in Doha (the founder, or a Qatar company) who decides on and accesses the data from Qatar is the most natural target of a Qatari law with no territorial limit. Nothing in the text excludes children who live abroad. There is no official ruling either way.
2. **So the Qatar permit gate should be treated as applying to the Lebanon pilot** until a Qatari lawyer (or the PDPPD itself) says otherwise. Lebanon's own Law 81/2018 applies in addition (see `06-lebanon-pilot.md`).
3. **The "personal or family" exclusion is a weak escape route.** The pilot uses the founder's own family, but its purpose is to test a product that will be sold. Most readings of similar GDPR wording ("purely personal or household activity") would not cover product testing. Uncertain; ask the lawyer.
4. **Things that would make the answer clearer:** whether the company (if any) is registered in Qatar or elsewhere; whether anyone in Qatar actually views the children's data; whether the pilot is free and non-commercial.

**Still uncertain:** whether the PDPPD would accept or even process a permit request for data subjects outside Qatar; whether a non-Qatar company with a Doha-based founder is caught; whether the family exclusion helps. These are lawyer questions (see question 9a below).

### 2. Data hosting and localisation

| Question | Finding | Status |
|---|---|---|
| Must children's or education data stay in Qatar? | No general rule found. Chambers 2026 says "There is no general data localisation requirement", except perhaps for extremely sensitive data. The 2022 Cloud Policy Framework says "data residency shall no longer be a requirement". | Partly confirmed |
| Sector rules | Local hosting is required for **health** (Ministry of Public Health) and for **Qatar Central Bank** licensees. **No education-sector hosting rule found.** Government cloud policy applies to government bodies, not private apps. | Partly confirmed |
| Could the PDPPD ask for local hosting as a condition of the permission? | Possible. Article 16 lets the Minister add safeguards. Ask the regulator. | Open question |
| Google Cloud Doha | Region **me-central1 (Doha)** exists, with 3 zones (launched 2023). Includes Cloud SQL (a Postgres database) and Cloud Run. https://www.datacenterdynamics.com/en/news/google-launches-cloud-region-in-doha-qatar/ | Confirmed (secondary) |
| Microsoft Azure | **Qatar Central** region (Doha), launched Aug 2022 with Meeza. https://www.infoq.com/news/2022/09/aws-azure-middle-east/ | Confirmed (secondary) |
| AWS | No Qatar region. Nearest are Bahrain (me-south-1) and UAE (me-central-1). | Partly confirmed |
| Supabase | **No Middle East region.** The official list (checked 2026-10-15) has US, Canada, EU (Ireland, London, Paris, Frankfurt, Zurich, Stockholm), Mumbai, Singapore, Tokyo, Seoul, Sydney and São Paulo. https://supabase.com/docs/guides/platform/regions | Confirmed |

**What this means:** Supabase in Frankfurt is probably lawful, but it must be justified in the DPIA. Frankfurt (EU, under GDPR) is easier to defend than Mumbai. The AI calls to the US are the bigger transfer issue, so keep sending only minimal data to the AI. Keep a "move to Google Cloud Doha (Cloud SQL Postgres)" plan ready in case PDPPD asks for it.

### 3. Ministry of Education and Higher Education (MOEHE)

- **Tutor licensing — Confirmed (news).** In January 2026 MOEHE issued the first official ID cards for licensed private tutors (182 of 272 teachers approved). Tutors must show the card in licensed centres and in homes. The aim is to reduce unlicensed tutoring.
  - https://thepeninsulaqatar.com/article/07/01/2026/education-ministry-issues-first-official-identification-card-for-licensed-private-tutoring-teachers (checked 2026-10-15); also https://www.qatar-tribune.com/article/213561/front/moehe-issues-1st-official-id-card-for-licenced-tutoring-teachers
- **Legal basis — Partly confirmed.** The **Educational Services Law, Law No. 18 of 2015** (corrected in fact-check: Mondaq/vLex and Al-Sharq 2022 and Aug 2025 all say No. 18; "No. 8" appears only in one news item and looks like an error; Law No. 23 of 2015 is the separate private-schools law) and **Minister's Resolution No. 10 of 2017**. They bring entities offering "**curriculum reinforcement**", educational training, mental arithmetic and similar services into licensing as "Educational Centres". Licence about **QAR 5,000** for 1 year, renewal QAR 3,000; the decision within 60 days (Al Tamimi; Clyde & Co). Resolution 10/2017 also reportedly requires a **bank guarantee of QAR 100,000** (one service) or QAR 200,000 (more than one). Penalties under the law: up to 6 months in prison and/or a fine up to QAR 100,000 and/or licence cancellation; a centre may not advertise or take students before its licence is approved (Mondaq summaries; not checked against the official text).
  - https://www.tamimi.com/law-update-articles/educational-services-in-qatar-recent-updates ; https://www.mondaq.com/education/465824/qatar-legal-update-education-sector
  - In 2017 the Ministry said "private tuitions are banned by the law" without a licence, and it uses inspectors with legal powers (Peninsula, 24 Jan 2017).
- **AI tutoring apps / online platforms — Not found.** No MOEHE rule, statement or licence category for online-only or AI tutoring apps was found in English. The Arabic search found nothing either. The 2024 *Educational Institutions Licensing* platform covers nurseries, schools, kindergartens and "educational centres" in phases (https://qatar-tribune.com/article/149415/nation/moehe-activates-educational-institutions-licensing-platform).
- **Risk view:** an AI app that helps children with their school curriculum for a fee could be seen as a "curriculum reinforcement" educational service. **Treat a written MOEHE answer as a gate before the paid pilot.**
- **Who to ask:** MOEHE Private Education Affairs, specifically the **Educational Services Centers Department** (its director was quoted in the January 2026 tutor-card news). Private Schools Licensing Department phones listed in a December 2025 notice: 44044906 / 44044881. **Do not contact them yet.** The founder or the lawyer should decide who sends the question.

### 4. Company setup

- **Single Window (MOCI)** is the standard online route for commercial registration and licences. — Partly confirmed.
- **E-commerce licence — Partly confirmed.** **Ministerial Decision No. 25 of 2026** (published in the Official Gazette 15 March 2026, in force 16 March 2026, per Al Tamimi/Crowell; the licence service was launched in September 2026, QNA 16 Sep 2026). Applicants must already be on the **commercial register**, so this licence is an add-on, not a cheaper replacement for company registration. Fee **QAR 500**. Covers **194 approved activities** carried out entirely online. Requires a **.qa or .com.qa** domain from one of 8 registrars approved by the Communications Regulatory Authority. You apply through the Single Window, and **a submitted application cannot be withdrawn**. Examples given: fashion design, consulting, digital design, **AI consulting and solutions**, photography, translation. **Education and tutoring are not mentioned** in any article.
  - https://www.zawya.com/en/business/qatar-launches-e-commerce-licence-for-194-business-activities-982332 ; https://marhaba.qa/moci-launches-new-e-commerce-licence-covering-194-business-activities/ (18 Sep 2026) ; https://www.qatarliving.com/en/article/qatar-new-e-commerce-licence-194-activities (checked 2026-10-15)
  - **Don't apply until the activity list has been checked.** Applications can't be withdrawn, and "AI solutions" may not cover an education service to children.
- **Alternatives (Not verified in this research pass):** the **Qatar Financial Centre (QFC)** licenses non-financial tech and service firms. It has its own data protection law (closer to GDPR, with a written permit for sensitive data and up to USD 1.5M fines). It would *replace* the PDPPL regime, not add to it. **Qatar Science & Technology Park (QSTP)** is a free zone for tech companies. Ask the lawyer whether either is simpler for a children's EdTech app. MOEHE approval would probably still apply.

### 5. Aman Centre and emergency numbers — **Confirmed**

- **Aman (Protection and Social Rehabilitation Centre)** hotline: **919**. It runs **24/7**, is **free**, and takes calls in **several languages**. It serves women and children who are victims of violence or family breakdown. It is affiliated with the Ministry of Social Development and Family, under the Qatar Foundation for Social Work.
  - Aman FAQ: https://www.aman.org.qa/en/faq and "What is the hotline number?": https://www.aman.org.qa/en/node/312 (**fetched successfully in the fact-check**: the FAQ says "What is the hotline number? 919", that calls are received "24/7 in multiple languages", and that services are free of charge to all citizens and residents)
  - Hukoomi (government portal) service page: https://hukoomi.gov.qa/en/services/hotline-of-protection-and-social-rehabilitation-center-aman (listed in search; direct fetch blocked)
  - QNA, July 2024: hotline runs daily around the clock.
- **Can children use it themselves?** Aman's **"Help Me"** app lets **children** request help directly by text, voice or photo (Aman news item, 4 July 2018: https://www.aman.org.qa/en/news/aman-briefs-children-about-help-me-mobile-application). No source says a child is not allowed to call 919. Aman's awareness workshops in schools promote 919 to students. **Partly confirmed** that children can call themselves. A short courtesy check with Aman before launch is recommended.
- Other Aman contacts: +974 4409 0999, info@aman.org.qa. An older WhatsApp number (33850022) is unverified, so don't use it.
- **General emergency: 999** for police, ambulance and fire (Ministry of Interior). **992** for deaf users (SMS/email 992@moi.gov.qa). **Partly confirmed:** the MOI page below refused the connection during the fact-check; 999 is confirmed by consistent news reports (The Peninsula 2017 and 2021) and guides, but not re-read from an official page today.
  - https://portal.moi.gov.qa/UNCCPCJDoha/English/Emergency_Services.html ; Hamad Medical Corporation ambulance page.
- **For Zaki:** the safety script should say "If you are in danger, tell a trusted adult now, or call **999**. To talk to someone who helps children, call **919**." Show both in Arabic and English, and send the parent an alert.

### 6. COPPA and GDPR (to check the plan's wording)

- **COPPA amendments — Confirmed.** Final rule published 22 April 2025 in the Federal Register. **Effective 23 June 2025.** **General compliance deadline 22 April 2026**, with §312.11(d)(1), (d)(4) and (g) excluded (safe-harbour programmes). https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule . The plan's "effective April 2026" should say "compliance required from April 2026".
- **GDPR age of consent — Confirmed (statutory text).** Under Article 8, a parent must consent for children **under 16**. Member states may set a lower age, but **not below 13**. https://eur-lex.europa.eu/eli/reg/2016/679/oj . Zaki's users (6–12) need parental consent under any member state's rule.

---

## Regional overview (GCC + key Middle East markets)

*Short and indicative only. Each country needs its own local legal check before launch. Mostly secondary sources, checked 2026-10-15.*

| Country | Main law and regulator | Children / parental consent | Data leaving the country | Education licensing for online tutoring apps | Status |
|---|---|---|---|---|---|
| **Qatar** (home base) | PDPPL, Law 13/2016. **PDPPD at NCSA** | Children are "special nature" data, so a **permit** is needed. Article 17: guardian's explicit consent. No age defined. | Controller must not block flows. A DPIA is needed. No approval system. | MOEHE Educational Services Law and Res. 10/2017 ("curriculum reinforcement"). AI app status unknown. | See above |
| **Saudi Arabia** | PDPL (Royal Decree M/19 of 2021, amended M/148 2023; in force Sept 2023, enforced from Sept 2024). **SDAIA** | **Legal guardian consent**, with checks that the guardian is genuine (Implementing Reg. Art. 13). Age threshold unclear: the draft's 13–18 wording was dropped. | **Transfer Regulation** (2024): transfers allowed with adequacy or safeguards such as standard clauses; risk assessment for sensitive data. Draft changes were consulted on Apr–May 2025; whether they are final is unconfirmed. | **National eLearning Center (NeLC)** licences for e-learning institutions and programmes. Individuals must deliver through an accredited provider (Art. 6, checked). The regulation covers general (school) education as well as higher and vocational education. *Fact-check: the "5 working days" decision target could not be found on the NeLC regulation page; treat as unverified.* https://nelc.gov.sa/en/regulations-and-standards/elearning-regulation | Partly confirmed |
| **UAE** (mainland) | Federal Decree-Law 45/2021 (PDPL). **UAE Data Office**. Executive regulations **still not confirmed as issued**. A new Federal Authority for AI and Data was announced in June 2026. | **Child Digital Safety Law, Federal Decree-Law 26/2025**: in force 1 Jan 2026, **fully enforceable Jan 2027**. Platforms that target UAE users may not process data of **under-13s** without explicit, documented, **verifiable guardian consent**. Educational services may be exempted by Cabinet decision. https://www.wam.ae/en/article/15xvbqx-uae-government-issues-federal-decree-law-child | PDPL allows transfers to adequate countries or with safeguards. Details await the regulations. | **Private Teacher Work Permit** (MoHRE + MoE, Dec 2023) for individual tutors, covering online and in-person. Emirate regulators (**KHDA** Dubai, **ADEK** Abu Dhabi) may license education providers; platform rules not found. | Partly confirmed |
| UAE free zones | **DIFC** DP Law 2020 and **ADGM** DP Regulations 2021: separate GDPR-like regimes with their own commissioners | GDPR-style rules | Adequacy plus safeguards | n/a | Not verified this pass |
| **Kuwait** | **CITRA** Data Privacy Protection Regulation (2021), amended by Decision 26/2024. Chambers 2026 says it now covers **only CITRA licensees** (telecom and internet providers). There is no general data protection law. | Guardian consent for minors (under 18) per secondary sources | E-Transactions Law and CITRA cloud/classification rules | Not found | Partly confirmed, conflicting sources |
| **Bahrain** | PDPL, **Law 30/2018**. Personal Data Protection Authority (functions linked to the Ministry of Justice) | No child-specific rule found. Guardian consent for people who lack legal capacity (secondary) | **Only to approved countries** (Resolution 42/2022 list, reported as 83 countries; secondary sources say it **includes the USA and all EU countries**) or with PDPA approval or consent | Not found | Partly confirmed |
| **Oman** | PDPL, **Royal Decree 6/2022**; Executive Regulation (Ministerial Res. **34/2024**). Transition period extended by Ministerial Decision 6/2025; **fully enforceable from 5 February 2026** (CMS; corrected in fact-check, was "compliance from Feb 2025"). **MTCIT** | Processing a child's data is **prohibited without the guardian's consent** (unless in the child's best interest). Minimum data; guardian access; no sharing without consent. | **Explicit consent of the data subject** needed for transfers abroad (Executive Regulation) | Not found | Partly confirmed |
| **Egypt** | Law **151/2020**; Executive Regulations (Ministerial Decree **816/2025**, issued 1 Nov 2025 but only made public 25 Dec 2025; ~1-year grace, so enforcement starts around **1 Nov 2026 — i.e. now** — or end of 2026 if PDPC counts differently, per CMS). **Personal Data Protection Center (PDPC)** | **Children's data is always "sensitive"**. Needs a PDPC **licence** plus **parent/guardian consent**. No conditioning of games or activities on data (law text: https://eg.andersen.com/wp-content/uploads/2025/06/Law-No.-151-OF-2020.pdf) | Only to countries with equal protection **and with a PDPC licence or permit** | Not found | Confirmed (law text); regulations Partly |
| **Jordan** | **Law 24/2023** (Personal Data Protection Law; in force March 2024). Personal Data Protection Council and Unit (Ministry of Digital Economy) | Consent must be explicit and documented. For a person lacking legal capacity, **one parent or the legal guardian consents** (official translation, Art. 6). 72-hour breach notice to the Unit. | **Banned** where the recipient's protection is lower than Jordan's, except listed cases (Art. 15). Council permission for databases sent abroad. https://www.modee.gov.jo/EBV4.0/Root_Storage/EN/1/PDP_Law_-_English_Version-_officail_translation.pdf | Not found | Confirmed (official translation) |
| **Lebanon** (first family pilot) | **Law No. 81/2018** (Electronic Transactions and Personal Data) | See `06-lebanon-pilot.md` | See `06-lebanon-pilot.md` | See `06-lebanon-pilot.md` | Covered by a separate researcher |

**Key regional flags**
1. **Children's data counts as special or sensitive** in Qatar and Egypt, and has explicit guardian-consent rules in Saudi Arabia, the UAE, Oman and Jordan. Build **one strong, verifiable parental-consent flow** that meets the strictest market.
2. **Permits and licences before processing:** Qatar (PDPPD permit), Egypt (PDPC licence for sensitive data and for transfers), Oman (ministerial permit for sensitive categories; check whether children are included). Saudi Arabia needs NeLC e-learning licensing on the education side.
3. **Strictest transfer rules:** Egypt (licence), Bahrain (approved-country list), Oman (consent), Jordan (equal protection). Qatar is the most open, and this matters for using US-based AI.
4. **The UAE Child Digital Safety Law** (fully enforced from Jan 2027) is the most "online-safety-act-like" rule in the region. Read its implementing regulations before any UAE launch.
5. **Education regulators** (Qatar MOEHE, Saudi NeLC, UAE MoE/KHDA/ADEK) are the least clear part, everywhere. AI tutoring is not explicitly addressed in any market found.

Regional sources (checked 2026-10-15): Latham & Watkins (Saudi PDPL), https://www.lw.com/en/insights/2023/12/Saudi-Arabias-data-protection-law-enters-into-force ; Bird & Bird (Saudi children, consultation 2025), https://childreninthedigitalworld.twobirds.com/home/saudi-arabia ; Baker McKenzie (UAE CDS Law), https://www.bakermckenzie.com/en/insight/publications/2026/01/uae-issues-new-child-digital-safety-law ; Kennedys (UAE CDS in force), https://www.kennedyslaw.com/en/thought-leadership/article/2026/strengthening-child-safety-online-uae-child-digital-safety-law-now-in-force ; Morgan Lewis (UAE AI & Data Authority, June 2026), https://www.morganlewis.com/pubs/2026/06/uae-establishes-federal-authority-for-artificial-intelligence-and-data ; Gulf News (UAE tutor permit), https://gulfnews.com/living-in-uae/education/new-uae-rules-for-tuition-classes-how-to-apply-for-a-permit-free-of-cost-1.1702908224494 ; Chambers 2026 Kuwait, https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/kuwait ; PwC ME transfers (Bahrain), https://pwc.com/m1/en/publications/documents/2024/navigating-cross-border-data-transfers-key-regulations-in-the-middle-east.pdf ; Addleshaw Goddard and Clyde & Co (Oman ER), https://addleshawgoddard.com/en/insights/insights-briefings/2024/data-protection/executive-regulations-oman-personal-data-protection-law ; CMS (Egypt ER), https://cms.law/en/are/legal-updates/egypt-s-pdpl-executive-regulations-issued-one-year-compliance-countdown-begins .

---

## Questions for a Qatari lawyer

**Data protection (PDPPL)**
1. Please confirm the current PDPPD submission address, form version and usual decision time for a *Special Nature Processing Permission Request*. Can it be filed before the company is registered, or in the founder's name?
2. Does a small private pilot (5–20 families, free) need the full permission, or is there a pilot or sandbox route?
3. Is parental consent ("explicit consent", Art. 17) enough as the "additional condition" for special-nature processing, or is the permit always required as well? (The law text says permit; DLA Piper suggests consent may be an alternative.)
4. Will PDPPD accept hosting in Frankfurt (Supabase) and AI processing in the US (Anthropic, OpenAI) for children's data? Could it require Qatar hosting as a condition?
5. Does Article 15 (no blocking of cross-border flows) mean no transfer contract is needed? Or should we still sign data-processing agreements and standard clauses with each provider?
6. What does Qatar consider a "child" for the PDPPL: under 18 (as in Qatari child-protection law) or another age?
7. Is WhatsApp messaging to parents (Meta) treated as electronic direct marketing that needs separate prior consent?
8. Do photos of homework pages count as special-nature data, and do they fall under the new cybercrime Article 8 (bis) on images?
9. Is a Data Protection Officer or a local representative needed if the company is registered abroad?

9a. **Territorial scope (added in fact-check):** Does the PDPPL apply to a Doha-based founder or Qatar company processing data of children who live only in Lebanon, on US/EU servers? If yes, is the Article 16 permit needed before a small, free family pilot, and does the Article 2 "personal or family" exclusion cover it?

**Education**
10. Does an AI homework tutor for grades 1–6 count as an "educational service" or "curriculum reinforcement" under the Educational Services Law (2015) and Resolution 10/2017? Please confirm the law is No. 18 of 2015 and whether it has been amended.
11. If yes, what licence, fees, premises and staff requirements apply to an **online-only** provider? Can a free pilot run before licensing?
12. Can Zaki say it is "aligned with the Qatari curriculum" or use MOEHE textbook content without permission? (Copyright, and any MOEHE content rules.)

**Company**
13. Does any of the 194 activities in MOCI Decision 25/2026 cover an online education or AI tutoring service for children? If not, which commercial registration activity fits?
14. Is a QFC or QSTP set-up better for a children's EdTech start-up, given QFC's own data protection law and its permits?
15. Do we need a Qatari partner or a minimum capital amount for the chosen route? What are the costs and timelines?

**Safety and consumer**
16. Does Qatari law require online services for children to report suspected abuse (to Aman, police or others)? How should Zaki's safety-flag process work legally?
17. Do any consumer-protection rules apply to subscriptions for children's apps (refunds, Arabic contract terms, auto-renewal)?

**Regional (ask a local lawyer in each country before launch)**
18. **Saudi Arabia:** Does an AI tutoring app for children need an NeLC licence (or partnership with an accredited provider)? What age does SDAIA use for guardian consent? Were the 2025 amendments to the Implementing Regulation adopted?
19. **UAE:** Is Zaki a "digital platform" under the Child Digital Safety Law? Does any education exemption apply by Cabinet decision? Have the PDPL executive regulations been issued, and which body regulates now (UAE Data Office or the new AI & Data Authority)? Is a KHDA or ADEK licence needed?
20. **Egypt:** Zaki would need PDPC licences both for children's (sensitive) data and for transfers abroad. What is the realistic timeline and cost?
21. **Bahrain / Oman / Jordan:** Are the US and EU on Bahrain's approved-country list? Does Oman's transfer rule require explicit consent from the parent for each transfer? Does Jordan's "equal protection" test block US AI providers without a Council approval?
22. **Kuwait:** With CITRA's rules limited to telecom licensees, which rules (if any) apply to a foreign EdTech app serving Kuwaiti children?

---

## Fact-check (2026-10-15)

*Independent re-check by the Reality Checker agent. Sources were re-opened where possible; skeptical stance. Not legal advice.*

| Claim | Result | Evidence / correction |
|---|---|---|
| Regulator is PDPPD within NCSA | **Verified** | NCSA Advisory Note PDPPL-202501AN (E), Oct 2025, title page and "Legal mandate" (Amiri Decree 1/2021). Note: Chambers 2026 still speaks of MCIT/CDPD and says the department was "not yet formally designated" — outdated; NCSA's own document wins. |
| Art. 16 lists children as special-nature data; permit required | **Verified** (law text) | Al-Sharq Arabic text: "تعد بيانات شخصية ذات طبيعة خاصة، البيانات المتعلقة بالأصل العرقي، والأطفال…" and "لا يجوز معالجة… إلا بعد الحصول على تصريح". |
| Permit process (DPIA + RoPA + request to PDPPD; form by email) | **Verified** | Advisory Note §7.8; The Peninsula 27 Sep 2026 ("Special Nature Processing Permission Request Form alongside a DPIA", emailed; address hidden). Timeline: still not found. |
| Art. 17 five duties for children's websites | **Verified** (law text) | Notice; explicit guardian consent; description + copy on request after ID check; delete/stop on request; no extra data as condition of a game/prize/activity. |
| Art. 15 cross-border | **Verified, with addition** | Text confirmed. Added: NCSA expects contracts with foreign data importers. |
| 72-hour breach notice | **Corrected (source)** | 72 h comes from NCSA guidance (Advisory Note §7.6), not from Art. 14, which has no time limit. 2-hour NCSA rule for national-level incidents verified. |
| Fines up to QAR 5M | **Verified and made precise** | Arts. 23–25: QAR 5M for Arts. 13, 16(3), 17; QAR 1M for Arts. 4, 8–12, 14, 15, 22; QAR 1M company fine (Art. 25). Was "Partly confirmed", now Confirmed from law text. |
| No data-localisation rule | **Verified (secondary)** | Chambers 2026: "no general data localisation requirement"; Cloud Policy Framework 2022. Not in the law text either. |
| E-commerce licence Decision 25/2026, QAR 500, .qa, 194 activities | **Verified, date added** | Zawya, Qatar Living, QNA 16 Sep 2026. Added: Gazette 15 Mar 2026, in force 16 Mar 2026; commercial registration required first. Education still not shown among examples. |
| Educational Services Law: No. 8 or 18 of 2015? | **Corrected → Law No. 18 of 2015** | Mondaq/vLex ("Law No. 18 of 2015 Regulating the Provision of Educational Services"); Al-Sharq 2022 and Aug 2025. Resolution 10/2017 (curriculum reinforcement) verified. Bank guarantee detail added. |
| MOEHE tutor ID cards Jan 2026 (182 of 272) | **Verified** | The Peninsula 7 Jan 2026; Educational Services Centers Department director quoted. Online/app tutoring not mentioned. |
| Aman 919, free, 24/7 | **Verified (official)** | aman.org.qa FAQ fetched: "What is the hotline number? 919"; "24/7 in multiple languages"; services free of charge. Hukoomi page blocked (403). |
| Emergency 999 | **Partly verified** | MOI page refused connection; 999 for police/ambulance/fire consistent across The Peninsula 2017/2021 and guides. 992 for deaf users (secondary). |
| COPPA dates | **Verified** | Federal Register API: published 22 Apr 2025, effective 23 Jun 2025; compliance 22 Apr 2026 except §312.11(d)(1), (d)(4), (g). |
| GDPR Art. 8 (16 default, not below 13) | **Verified** (well-established statutory text) | Not re-fetched; no contradiction found. |
| Egypt PDPL + ER Nov 2025 | **Verified, detail added** | CMS: Decree 816/2025 issued 1 Nov 2025, made public 25 Dec 2025; grace to ~1 Nov 2026 (or end-2026). Children's data = sensitive, parental consent; transfers need licence. |
| UAE CDS Law 26/2025 | **Verified** | Clyde & Co: in force 1 Jan 2026; one-year compliance to Jan 2027 (Cabinet may extend); under-13 data only with verifiable parental consent; education platforms may be exempted by Cabinet decision. |
| Saudi guardian consent; NeLC licensing | **Verified; one detail unverified** | Bird & Bird (Exec. Reg. Art. 13, verify guardianship). NeLC regulation Arts. 3, 5, 6 checked. "5 working days" target **could not be verified**. |
| Oman | **Corrected** | Fully enforceable from **5 Feb 2026** after extension by MD 6/2025 (CMS) — not "Feb 2025". Guardian consent and transfer consent verified (secondary). |
| Bahrain | **Verified, detail added** | Resolution 42/2022 list of 83 countries reportedly includes USA and EU (secondary). |
| Jordan | **Verified** (official translation) | Law 24/2023; Art. 6 parent/guardian consent; Art. 15 transfers; 72-hour notice. |
| Kuwait | **Verified (secondary)** | Chambers 2026: CITRA regulation (as amended by Decision 26/2024) now covers only CITRA licensees. |
| **New: Does the PDPPL cover the Lebanon pilot?** | **Could not be settled — added as §1.11** | Law has no territorial clause; no exclusion for foreign data subjects; Doha-based controller makes application likely. Treat the permit gate as applying until a Qatari lawyer says otherwise. |

**Remaining uncertainties:** permit decision time and email address; territorial scope (§1.11); whether the "personal or family" exclusion helps the family pilot; whether education is among the 194 e-commerce activities; whether MOEHE treats an AI app as "curriculum reinforcement"; the QAR 5,000 MOEHE licence fee (law-firm source only); 999 not re-read from an official page.

---

*End of report. Not legal advice. Prepared from public sources on 2026-10-15; re-check before relying on any item.*
