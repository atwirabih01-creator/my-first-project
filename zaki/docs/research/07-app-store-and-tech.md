# 07: App Store path, store rules and the right technical approach

Research date: 2026-10-15. All sources were checked on 2026-10-15 unless noted.
Status labels: **Confirmed** (official source says it), **Partly confirmed** (official source covers part of it, or only a non-official source), **Not found** (no official source found).

---

## Plain-language summary

- **Zaki can go on the Apple App Store, and it can be listed in the Kids section.** Apple has no rule against an AI tutor for children. But the Kids section has strict rules: no ads, no outside tracking tools, and a "grown-ups only" check (a "parental gate", such as a sum an adult must solve) before any settings, payments or links that leave the app, including the WhatsApp link to mom. Zaki's plan already follows most of these rules.
- **Zaki must ask parents before sending a child's work to the AI company.** Apple's newest rule says apps must say clearly when personal data goes to an outside AI service (for Zaki: Anthropic) and get clear permission first. This fits in the parent consent step Zaki already plans.
- **Build the app with "Expo", not as a website.** Expo is a toolkit that makes real iPhone and Android apps from one set of code. Apple's computers build the app online, so you do not need a Mac. Arabic right-to-left layout and voice both work. A website wrapped to look like an app is more likely to be rejected by Apple.
- **For the family pilot in Lebanon, put the app straight onto the family's own iPhones and iPads.** Apple's beta-testing app (TestFlight) works in Lebanon, but Apple's terms do not allow children under 13 to use it. The simplest route is to register each family device (up to 100 iPhones and 100 iPads a year) and install Zaki from a private link. No Apple review is needed for this.
- **Accounts and costs:** an Apple developer account costs US$99 a year. Open it in your own name now: it is quick and needs no company. Switch it to a company account later, once a company exists. Google Play is a one-time US$25 later on. Expo is free to start and US$19 a month once you build often. You do not need to buy a Mac.
- **"Track everything properly" is allowed if Zaki keeps its own records.** Every lesson, answer, score and session is saved in Zaki's own database (Supabase), and that powers a full learning dashboard for you and the reports for mom. Apple and Google also give free download and crash numbers without adding anything to the app. Do not add outside tracking tools such as Google/Firebase Analytics, Facebook or Mixpanel, or any advertising tool.
- **Payments change once Zaki is in the app stores.** If mom pays inside the app, it must go through Apple's own payment system, and Apple takes a share: 15% if Zaki joins Apple's Small Business Program (free to join, for developers earning under US$1 million a year; you must sign up for it in App Store Connect), otherwise 30% (15% on subscriptions after a subscriber's first paid year). Checked 2026-10-16. Outside the US, the app is not allowed to send people to pay somewhere else. This matters for the pricing tests in Phase 4.
- **US age-check laws (Texas, Utah, Louisiana) do not reach Lebanon or the Gulf**, as far as Apple's pages show. The easiest path is to offer Zaki only in Middle East stores at first.

---

## What this changes in the plan

| Plan section | What it says now | Change needed | Why |
|---|---|---|---|
| 10.1 "App" row | Next.js web app that installs on the phone (PWA); "No app-store wait. Native app later if needed." | **WRONG now.** Use **Expo (React Native, TypeScript)** for one native app on iPhone/iPad (and Android later from the same code). Build in the cloud with EAS Build and send to Apple with EAS Submit (Expo's online build and upload services). No Mac needed. | Founder decision (native App Store app). Expo builds iOS without a Mac. A wrapped website risks a "minimum functionality" rejection under Apple rule 4.2. |
| 10.1 "Hosting" row | Vercel Pro hosts the app | The child app no longer runs on Vercel. Keep Vercel (or Supabase Edge Functions, Supabase's small server programs) only for server-side code: AI calls, the WhatsApp webhook (the address Meta sends WhatsApp messages to), and the founder's private admin dashboard. Vercel Pro (US$20/month) can wait until those are live. | The app installs on the phone, so the server only runs back-end work. |
| 10.1 "Database" row | Supabase, Frankfurt/Mumbai | Keep Supabase. **Add:** plan for a Supabase custom domain (a paid add-on on a paid Supabase plan). From 2 Sep 2025 the UAE (Etisalat and Du networks) blocked `*.supabase.co` for about 18 days; Supabase's temporary proxy domain restored the database API, Realtime and Edge Functions, but login callbacks and stored-file links stayed broken. (The custom-domain idea is our own conclusion; Supabase's post lists custom domains as an option for a separate India block.) | Supabase blog, 26 Mar 2026 (below); re-checked 2026-10-16. |
| 8.3 Design | "Use only private, aggregated analytics" | Make it concrete: **first-party events in Supabase plus the store consoles only. No third-party analytics or crash tools inside the app.** See Section 4 below. | Apple 1.3 / 5.1.4 and Google Families data rules. |
| 8.4 Platform rules | "If published to app stores later: follow Apple's Kids Category (ages 6–8 / 9–11) and Google Play's Families policy." | Now, not later. **Add:** (a) Apple Kids Category lets you choose **one** age band (5 and under, 6–8 or 9–11). Zaki covers grades 1–6 (about 6–12), so pick one band. Age 12 is outside all bands. (b) The words "For Kids" and "For Children" are allowed in the store listing **only** if Zaki is in the Kids Category. (c) The parental gate must also cover the WhatsApp/mom link. (d) Get explicit parental permission before child data goes to Anthropic/OpenAI (5.1.2(i)). (e) Include a "Report this answer" button (Google requires this for AI apps). (f) Answer Apple's age-rating questions with the AI chat in mind. (g) Account deletion must be possible inside the app. | Quoted rules below. |
| 9 Legal/business | Qatar company registration | **Add:** Apple Developer account. Individual now; switch to organisation after a company exists. Organisation needs a legal entity, a D-U-N-S number (a free business ID from Dun & Bradstreet that can take up to 30 days), a domain email and a working website. | Apple enrolment page. |
| 10.3 Costs | AI, WhatsApp, hosting | **Add:** Apple US$99/year; Google Play US$25 once; Expo US$0 (free plan) → US$19/month (Starter); Apple/Google take a commission on in-app subscriptions: Apple 15% for Small Business Program members (enrolment required; under US$1M proceeds/year), otherwise 30% in a subscriber's first paid year then 15%; Google Play 15% on auto-renewing subscriptions and on the first US$1M/year in "remaining markets" (Lebanon/GCC) (verified 2026-10-16, see Fact-check). | Official price pages. |
| 12 Phase 0 | Accounts: GitHub, Vercel, Supabase, Anthropic, Meta | **Add:** Expo account (free) and Apple Developer Program (individual, US$99). The founder needs his own iPhone or iPad for testing. Google Play can wait. | — |
| 12 Phase 1 | Clickable prototype (web) | Build the prototype as the Expo app and run it on the founder's iPhone through an Expo development build. | Same code goes to the store later. |
| 12 Phase 3 | Private pilot, 5–10 families | **Family pilot (Lebanon):** Expo "internal distribution", which uses Apple's ad hoc installs: register each family device and install from a private link. No Apple review, no TestFlight, no age problem. **Wider pilot:** TestFlight external testing installed under a **parent's** Apple Account (children under 13 cannot use TestFlight). The first external build needs a light Apple review. | TestFlight terms; Expo docs. |
| 12 Phase 4 | Pricing, payments | **Paid features unlocked inside the app must use Apple In-App Purchase** (3.1.1), behind the parental gate. Outside the US storefront the app cannot point users to cheaper payment elsewhere (3.1.3). Pricing tests in QAR must match Apple price points. Remove "Later: native app" (it is now). | Quoted rules below. |
| 14 Re-verify list | — | **Add:** "Ask Apple App Review (via App Store Connect contact) to confirm, before launch, that a Kids Category app may send pseudonymous lesson text to an AI processor with parental consent." | A grey area. See 1.4. |

---

## 1. Apple: Kids Category, AI and age rules

### 1.1 Guideline 1.3 Kids Category: **Confirmed**
Source: App Review Guidelines, https://developer.apple.com/app-store/review/guidelines/#kids-category (page footer "Last updated June 8, 2026"; checked 2026-10-15)

> "These apps must not include links out of the app, purchasing opportunities, or other distractions to kids unless reserved for a designated area behind a parental gate. Keep in mind that once customers expect your app to follow the Kids Category requirements, it will need to continue to meet these guidelines in subsequent updates, even if you decide to deselect the category."

> "In addition, Kids Category apps may not send personally identifiable information or device information to third parties. Apps in the Kids Category should not include third-party analytics or third-party advertising. This provides a safer experience for kids. In limited cases, third-party analytics may be permitted provided that the services do not collect or transmit the IDFA or any identifiable information about children (such as name, date of birth, email address), their location, or their devices. This includes any device, network, or other information that could be used directly or combined with other information to identify users and their devices. Third-party contextual advertising may also be permitted in limited cases provided that the services have publicly documented practices and policies for Kids Category apps that include human review of ad creatives for age appropriateness."

Meaning for Zaki: joining the Kids Category is effectively **one-way**. Once in, Zaki has to keep following these rules even if it later leaves the category.

### 1.2 Guideline 5.1.4 Kids: **Confirmed**
Source: https://developer.apple.com/app-store/review/guidelines/#kids (checked 2026-10-15)

> "(a) … Apps may ask for birthdate and parental contact information only for the purpose of complying with these statutes, but must include some useful functionality or entertainment value regardless of a person's age. Apps intended primarily for kids should not include third-party analytics or third-party advertising. This provides a safer experience for kids."

> "(b) In limited cases, third-party analytics and third-party advertising may be permitted provided that the services adhere to the same terms set forth in Guideline 1.3. Moreover, apps in the Kids Category or those that collect, transmit, or have the capability to share personal information (e.g. name, address, email, location, photos, videos, drawings, the ability to chat, other personal data, or persistent identifiers used in combination with any of the above) from a minor must include a privacy policy and must comply with all applicable children's privacy statutes. For the sake of clarity, the parental gate requirement for the Kid's Category is generally not the same as securing parental consent to collect personal data under these privacy statutes."

> "As a reminder, Guideline 2.3.8 requires that use of terms like "For Kids" and "For Children" in app metadata is reserved for the Kids Category. Apps not in the Kids Category cannot include any terms in app name, subtitle, icon, screenshots or description that imply the main audience for the app is children."

Note: "intended primarily for kids" means the no-third-party-analytics rule applies to Zaki **even outside the Kids Category**.

### 1.3 Kids apps page: parental gates and age bands: **Confirmed**
Sources: https://developer.apple.com/app-store/kids-apps/ and https://developer.apple.com/kids/ (no page date; checked 2026-10-15)

> "Select an age band in App Store Connect: Choose whether your app or game is appropriate for ages 5 and under, 6-8, or 9-11."

> "[Parental gates] are adult-level tasks that must be completed in order to continue using your app or game. Parental gates aim to prevent kids from engaging in certain activities without their parent's knowledge — such as buying Apple In-App Purchases without permission, or following link outs to content outside of your app or game (such as external websites, social networks, or other apps). If your app is intended for pre-literate children, consider using a voiceover prompt to help kids know that they need to involve their parent."

> "Kids apps should not transmit personally identifiable information or device information to third parties — even in sections intended for adults — unless the parent explicitly consents."

The phrase "unless the parent explicitly consents" is the key opening for Zaki's AI calls (see 1.4).

### 1.4 Can an AI chat tutor be in the Kids Category? **Partly confirmed**
- **No rule bans it.** Nothing in 1.3, 5.1.4 or the kids pages forbids an AI tutor. (Confirmed by absence in the official text.)
- **The grey area:** 1.3 says Kids apps "may not send personally identifiable information or device information to third parties." Zaki sends the child's lesson text to Anthropic. Apple's kids page allows this when "the parent explicitly consents," and 5.1.2(i) (below) requires disclosure and explicit permission for third-party AI. I found **no official example and no reported rejection** of a Kids Category app over an AI service (searched 2026-10-15). Reported 1.3 rejections are about ad and tracking code (e.g. the AdSupport framework, ATT) found in the app. (Not found / non-official: GitHub facebook/react-native#47200, RevenueCat community thread.)
- **How to stay safe:**
  1. The app talks only to **Zaki's own server**, never directly to Anthropic or OpenAI from the phone.
  2. The server sends only the lesson text and a random child ID. No name, no device information, no location, no phone number.
  3. Remove names and personal details from what the child types before it is sent.
  4. Get explicit, logged parental consent that names "Anthropic (AI)" and "OpenAI (moderation)" in Arabic and English.
  5. List these in the privacy policy and in App Store privacy labels.
  6. Before launch, ask App Review to confirm.
- **Age rating and AI: Confirmed.** Apple developer news, 24 Jul 2025 (https://developer.apple.com/news/?id=ks775ehf):
  > "As a reminder, you must consider how all app features, including AI assistants and chatbot functionality, impact the frequency of sensitive content appearing within your app to make sure it receives the appropriate rating."

### 1.5 Option B: not in the Kids Category, but rated for kids: **Confirmed**
Zaki could list under **Education**, rated 4+ or 9+. Advantages: no age-band limit, so ages 6–12 are fine, and links and purchases are less restricted. Disadvantages:
- The listing **cannot say "for kids" or imply children are the main audience** (2.3.8 / 5.1.4).
- The no-third-party-analytics rule still applies because Zaki is "intended primarily for kids" (5.1.4(a)).

Since Zaki is clearly a kids product, **recommendation: aim for the Kids Category.** Choose the band at submission: 6–8 or 9–11. Plan 8.3 already matches nearly all the rules.

### 1.6 Guideline 5.1.2(i): sharing with third-party AI: **Confirmed**
Source: https://developer.apple.com/app-store/review/guidelines/#data-use-and-sharing (checked 2026-10-15)

> "Unless otherwise permitted by law, you may not use, transmit, or share someone's personal data without first obtaining their permission. You must provide access to information about how and where the data will be used. You must clearly disclose where personal data will be shared with third parties, including with third-party AI, and obtain explicit permission before doing so. … You must receive explicit permission from users via the App Tracking Transparency APIs to track their activity. … Your app may not require users to enable system functionalities (e.g. push notifications, location services, tracking) in order to access functionality…"

Zaki must not use App Tracking Transparency (the iPhone pop-up asking to track you) at all. A kids app should never track.

### 1.7 New age ratings (4+/9+/13+/16+/18+): **Confirmed**
- Apple developer news, 24 Jul 2025 (https://developer.apple.com/news/?id=ks775ehf):
  > "The updated age rating system adds 13+, 16+, and 18+ to the existing 4+ and 9+ ratings."

  The questionnaire also has new required questions on "In-app controls", "Capabilities", "Medical or wellness topics" and "Violent themes".
- Upcoming requirements page (https://developer.apple.com/news/upcoming-requirements/): developers had to answer the new questions by **31 Jan 2026**.
- **Newer (added in fact-check 2026-10-16):** Apple news 9 Jul 2026 (https://developer.apple.com/news/?id=tlur8uvi) added **social media questions** to the age rating questionnaire; "beginning in September 2026, responses will be required when submitting new apps or updates". Zaki has no social features, but the questions must still be answered at submission.
- Age ratings reference (https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions): "Messaging and Chat", "User-Generated Content", "Parental Controls" and "Age Assurance" are listed under 4+. "Unrestricted Web Access" raises the rating to 16+. **Zaki must not include a free web browser.**

### 1.8 Declared Age Range API and US/other age-assurance laws: **Confirmed**
The Declared Age Range API is an Apple tool that tells an app a user's age band, without the birthday.
- Apple Age assurance Q&A (https://developer.apple.com/support/age-assurance/):
  > "In certain regions, where legally required, Apple uses age assurance methods to confirm an Apple Account holder's age and shares age categories with you."

  > "the Declared Age Range API is available worldwide, and people using your app can decide whether their age information is shared."

  > "there are no changes to the App Review process."

  Feature versions: iOS 26 (basic API), 26.2 (expanded API and PermissionKit), 26.4 (significant-update sheets).
- **Texas SB 2420:** Apple news "Update for Apps Distributed in Texas", 3 Jun 2026 (https://developer.apple.com/news/?id=sg176nne; corrected link, see Fact-check): "Due to a recent court ruling lifting an injunction on Texas law SB 2420, new Apple Accounts in Texas are now subject to the law". From **4 Jun 2026**, new Texas accounts need age assurance and parent or guardian consent for under-18 downloads, In-App Purchases and "significant changes"; parents can revoke consent. Developers use the Declared Age Range API plus the Significant Change API (PermissionKit). (Earlier, on 23 Dec 2025, https://developer.apple.com/news/?id=8jzbigf4, Apple had paused its Texas plans because of the injunction.) Press reports say the appeal is still ongoing, so this could change again.
- **Utah and Louisiana:** Apple news, 24 Feb 2026 (https://developer.apple.com/news/?id=f5zj08ey):
  > "For users with new Apple Accounts in Utah as of May 6, 2026, and in Louisiana as of July 1, 2026, age categories will be shared with the developer's app when requested through the Declared Age Range API."
- **Brazil, Australia, Singapore:** the same page says that from 24 Feb 2026 Apple blocks 18+ apps for unconfirmed adults. This does not affect a 4+ kids app.
- **Lebanon and the GCC: Not found.** No Apple page lists age-assurance duties for Lebanon or the GCC. **Recommendation:** at launch, offer Zaki only in Middle East storefronts (Lebanon and the GCC are all available: LBN, QAT, ARE, SAU, KWT, BHR, OMN; Confirmed at https://developer.apple.com/help/app-store-connect/reference/pricing-and-availability/app-store-pricing-and-availability-start-times-by-country-or-region/). That keeps Zaki out of the US state laws for now. Zaki can still use the Declared Age Range API as an optional helper.
- **Generative-AI-specific App Store rule: Not found.** The 8 Jun 2026 update (https://developer.apple.com/news/?id=a233fmpw) revised the "kid and teen safety guidance in the introduction" ("Make sure kids are getting age-appropriate experiences inside your app"). The AI changes were in the Developer License Agreement (Foundation Models), not in the Review Guidelines. Guideline 4.7 mentions "chatbots", but for software not built into the app.

### 1.9 Other Apple rules that matter for Zaki: **Confirmed** (same guidelines page)
- **4.2 Minimum Functionality:** "Your app should include features, content, and UI that elevate it beyond a repackaged website. If your app is not particularly useful, unique, or "app-like," it doesn't belong on the App Store." 4.2.2 also lists "web clippings".
- **3.1.1 In-App Purchase:** "If you want to unlock features or functionality within your app, (by way of example: subscriptions …) you must use in-app purchase."
- **3.1.3:** "Apps in this section cannot, within the app, encourage users to use a purchasing method other than in-app purchase, except for apps on the United States storefront…"
- **5.1.1(v):** "If your app supports account creation, you must also offer account deletion within the app."
- **SDK minimum: Confirmed.** Since 28 Apr 2026, uploads must be built with Xcode 26 or later using the iOS 26 SDK. Expo's cloud builds handle this (https://developer.apple.com/news/upcoming-requirements/). **Next step (fact-check 2026-10-16):** starting April 2027, uploads must be built with the iOS 27 / iPadOS 27 SDK (Apple news 9 Sep 2026, https://developer.apple.com/news/?id=k1mtkt1k). Using PermissionKit's significant-change features needs the iOS 26.2 SDK / Xcode 26.2 or later (age assurance Q&A).

---

## 2. Private family pilot on iPhone/iPad

### 2.1 TestFlight: **Confirmed**
TestFlight is Apple's app for installing test versions of apps.
- https://developer.apple.com/testflight/: internal testers are "up to 100" team members with an App Store Connect role. External testers are "up to 10,000". For external testers, your "first build approved by App Review for TestFlight"; you also need a beta description and review info. Public links are available.
- https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/:
  > "You can test a build for up to 90 days."

  > "A review is required only for the first build. Subsequent builds may not require a full review."
- **Age limit: Confirmed (important).** TestFlight terms, https://www.apple.com/legal/internet-services/itunes/testflight/:
  > "Children under the age of 13, or equivalent minimum age in the relevant jurisdiction, are not permitted to use TestFlight."

  So the parent's Apple Account must be the tester (on a shared family iPad, or on the child's device under the parent's account). Children cannot use TestFlight with their own accounts.
- **Lebanon: Partly confirmed.** No official TestFlight country list exists. An Apple staff forum answer (older) says TestFlight has no territory restrictions (https://developer.apple.com/forums/thread/682057). The terms say betas "may not be available … in all countries." Lebanon is a normal App Store storefront (Confirmed). **Practical answer: expected to work; test it with one family device first.**

### 2.2 Better for the first family pilot: ad hoc ("internal distribution"): **Confirmed**
- Expo docs, https://docs.expo.dev/build/internal-distribution/: EAS builds an ad hoc version and "only those devices in the list at build time will be able to install it."

  > "This method requires a paid Apple Developer account."

  It needs each device's ID (UDID). People install from a shareable link. Adding a new device means making a new build. For new or recently renewed Apple memberships, Apple "can take up to 24–72 hours to finish processing a newly registered device", so the first build that includes it may fail and must be retried.
- Apple, https://developer.apple.com/help/account/devices/devices-overview/: you can register "up to 100 … per product family, per membership year". Disabling a device does not free its slot.
- Why it fits: no TestFlight age problem, no beta review, and it works on the child's own iPad. The limit is plenty for one family plus 5–10 pilot families.

### 2.3 Apple Developer Program: individual vs organisation: **Confirmed**
Source: https://developer.apple.com/programs/enroll/ (checked 2026-10-15)
- Price:
  > "The Apple Developer Program is 99 USD per membership year. Prices may vary by region…"
- Individual: Apple Account with two-factor authentication, legal age, legal name. "Your name will be displayed as the seller name of your apps on the App Store."
- Organisation:
  > "Your organization must be a legal entity that can enter into contracts with Apple. We do not accept DBAs, fictitious business names, trade names, or branches."

  It also needs a D-U-N-S number, a work email on the company domain, and a public website. "Your organization's name will be displayed as the seller name."
- Switching later: **Confirmed.** https://developer.apple.com/help/account/membership/updating-your-account-information/ says you can request a move from individual to organisation if you are the founder and have a D-U-N-S number.
- Lebanon enrolment: **Partly confirmed.** Apple enrols in "more than 220 countries or regions" except where sanctions apply. No Lebanon-specific statement was found. Card payment from Lebanon should be tested.
- **Recommendation:** enrol as an **individual now** (fast, no company needed, fine for the pilot). Move to an **organisation before public launch**, once the company exists. Parents trust a company name as seller more, and it is needed for a business anyway. Start the free D-U-N-S request early because it can take up to 30 days.

---

## 3. Google Play (later)

### 3.1 Families policy: **Confirmed**
Source: https://support.google.com/googleplay/android-developer/answer/9893335 (no page date; checked 2026-10-15)
- You must declare the target audience in Play Console. False declarations lead to removal.
- "Apps that solely target children must not transmit Android advertising identifier (AAID)". The same applies to SIM Serial, Build Serial, BSSID, MAC, SSID, IMEI and IMSI.
- "Apps that solely target children may not request location permission, or collect, use, and transmit precise location."
- "You must disclose the collection of any personal and sensitive information from children in your app."
- Ads only through "Families Self-Certified Ads SDKs". Zaki has no ads, so this does not apply.
- **Teacher Approved:** "All apps that comply with Google Play Families policies can opt in to be rated for the Teacher Approved program." Inclusion is not guaranteed.
- "Designed for Families" is the old programme name. It is now the Families policy, so update wording in plan 8.4.
- Data practices (https://support.google.com/googleplay/android-developer/answer/11043825): child apps must only use SDKs (add-on code libraries) "approved for use in child-directed services".
- Policy deadlines (https://support.google.com/googleplay/android-developer/table/12921780): from 2026-08-26, anonymous chat apps cannot target children (Zaki is not anonymous chat). From 2026-09-30, apps must be registered for Android developer verification.

### 3.2 AI-generated content policy: **Confirmed**
https://support.google.com/googleplay/android-developer/answer/13985936: AI chatbot apps must "contain in-app user reporting or flagging features that allow users to report or flag offensive content", and must prevent content that exploits or abuses children.

### 3.3 Closed testing rule and account: **Confirmed**
- https://support.google.com/googleplay/android-developer/answer/14151465: personal accounts created after 13 Nov 2023 need a closed test with "a minimum of 12 testers" opted in for **14 consecutive days** before going to production. **Still current** on 2026-10-15.
- The page does not mention organisation accounts. It is described as a personal-account requirement, so organisation accounts are likely not covered: **Partly confirmed**.
- Internal testing (https://support.google.com/googleplay/android-developer/answer/9845334): "up to 100 testers per app", and it "might not be subject to standard Play policy or security reviews". This is good for a family pilot on Android.
- Fee: US$25 one-time (https://support.google.com/googleplay/android-developer/answer/6112435). Organisation accounts need a D-U-N-S number (https://support.google.com/googleplay/android-developer/answer/13628312; the 6112435 page itself does not mention D-U-N-S): **Confirmed**.
- **Recommendation:** if Android is needed before a company exists, a personal account plus 12 testers for 14 days is doable with family and friends. Otherwise wait and open an organisation account.

---

## 4. "Track everything properly" within the kids rules

Rule of thumb from 1.3/5.1.4 and the Google Families rules: **no third-party analytics, ad or tracking code inside the app; no advertising ID; no device fingerprinting.** Rejections have happened just because ad-related code was *present* in an app, even if switched off (Partly confirmed via developer reports: RevenueCat community thread; GitHub invertase/react-native-firebase#4494).

| Option | Kids-app fit | Verdict |
|---|---|---|
| **Zaki's own event table in Supabase** (first-party) | Data goes only to Zaki's own database (Supabase processes it on Zaki's behalf). Use a random child ID; no device IDs or IP stored. Covered by parent consent and the privacy policy. | **USE. This is the main dashboard.** |
| **App Store Connect App Analytics** | Built in, no code in the app. Data only from users who agreed to share ("Usage data includes only users who have agreed to share their diagnostics and usage information with you"; https://developer.apple.com/app-store-connect/analytics/). Confirmed. | **USE** for downloads, sessions, retention and crashes. |
| **Google Play Console statistics / Android vitals** | Built in, no code in the app. | **USE** later. |
| **TelemetryDeck** | Privacy-focused (anonymised, EU-based by its own claims), but still a **third party**. No official statement about Kids Category or COPPA (the US children's privacy law) was found (Not found). | **Do not use** in the Kids build unless TelemetryDeck confirms in writing that it qualifies under 1.3's "limited cases". It adds little beyond Supabase events anyway. |
| **PostHog self-hosted** | If self-hosted, the data stays first-party ("the data processor is you", PostHog GDPR docs). But it is heavy to run (Docker, recommended only up to ~300k events/month) and needs real server skills. PostHog Cloud is a third party. | **Not now.** Too much to operate for a non-programmer. |
| Firebase/Google Analytics, Meta SDK, AppsFlyer, Adjust, Mixpanel, Amplitude, session replay, any ad SDK, IDFA/ATT prompt, AAID | Third-party trackers, ad identifiers. | **Never** in Zaki. |
| Third-party crash tools (Sentry, Crashlytics) | Send device information to a third party. | **Avoid.** Use Apple's built-in crash reports (Xcode Organizer / App Store Connect) and Android vitals instead. |

**Recommended setup (gives the founder a full learning dashboard):**
1. **One `events` table in Supabase.** The app writes an event for each step: session start/end; each loop step (recap, lesson, check, summary, test, retry); each question (subject, lesson, correct or not, time taken, hints used, "explain again" taps); test scores; mastery changes; voice vs text use; safety flags; parent-set reminders met or missed. Each event carries only `child_id` (random), `family_id`, time, app version and language. No name, device ID or location.
2. **Server-side AI log.** The server records AI tokens, cost, latency and verifier results per session. This never touches the phone.
3. **Founder dashboard.** Start with saved queries in the Supabase dashboard. Later, add a small private admin web page (founder login only) with charts: weekly active kids, sessions per week (pilot goal: 3+/week), mastery per subject, test pass rates, time per loop step, drop-off points, AI cost per child, and flags to review within 24 hours.
4. **Mom's reports** come from the same events (WhatsApp + parent area). One source of truth.
5. **Store consoles** for downloads and crashes.
6. **Before every upload,** check that the app does not contain the `AdSupport` or `AppTrackingTransparency` frameworks (add this to the pre-submission checklist).

This gives full learning tracking while staying inside Apple 1.3/5.1.4 and Google Families rules. Parents must be told about it in the consent and privacy notice.

---

## 5. Technical approach for a non-programmer using Claude Code

| | **Expo (React Native)** | **Swift / SwiftUI** | **Next.js PWA + Capacitor wrapper** |
|---|---|---|---|
| Build iPhone app without a Mac | **Yes.** EAS Build runs in Expo's cloud; EAS Submit sends to TestFlight from Windows/Linux (https://docs.expo.dev/build/introduction/, https://docs.expo.dev/submit/ios/). Confirmed. | **No.** Xcode runs only on a Mac. | Needs Xcode (a Mac) or a paid cloud build service. Partly confirmed. |
| Android from same code | Yes | No (separate rewrite) | Yes |
| Arabic right-to-left | Supported. Right-to-left is on by default and follows `I18nManager`; `forcesRTL` option; switching direction at run time needs an app reload (https://docs.expo.dev/guides/localization/). Confirmed. | Excellent | Excellent (it is a web page) |
| Voice | `expo-speech` reads text aloud using the device's voices (BCP-47 language codes like `ar-SA`), but **on iPhone it makes no sound in silent mode** (https://docs.expo.dev/versions/latest/sdk/speech/, SDK 58). Confirmed. Recommendation: play cloud voice audio (Azure, per plan) and record the child's voice for cloud speech-to-text. | Best native access | Web speech features in a wrapped web page are less reliable. Partly confirmed. |
| Apple acceptance (4.2) | Real native app, low risk | Lowest risk | **Highest risk:** "repackaged website" / "web clippings" (4.2, 4.2.2) |
| Reuse plan's Next.js stack | No (new app code), but same Supabase and AI server | No | Partly. Needs Next.js static export (`output: 'export'`), which loses server features inside the app (https://nextjs.org/docs/app/guides/static-exports). Partly confirmed. |
| Fit with Claude Code | Very good: TypeScript, huge community, cloud builds | Good code, but the founder can't build or test without a Mac | Good, but more workarounds |
| Cost | Expo Free: "Up to 15 Android and 15 iOS builds" (monthly reset per Expo docs); Starter US$19/month incl. US$45 build credit; iOS build US$2 after credits (https://expo.dev/pricing). Confirmed. | Mac ≈ US$600+ | Similar to Expo plus a build service |

**Recommendation: Expo (React Native + TypeScript), latest SDK (58 as of today), with EAS Build, EAS Submit and EAS internal distribution.**
- Keep Supabase (database, login, file storage) and put the AI, moderation and WhatsApp code on the server (Supabase Edge Functions or Vercel).
- A real iPhone or iPad is needed for testing. A Mac is not.
- Note: on individual Apple accounts, only the Account Holder (the founder) can create signing credentials for EAS (the digital keys Apple uses to confirm the app is his) (https://docs.expo.dev/app-signing/apple-developer-program-roles-and-permissions/). The founder logs in once and Expo stores them.

**New Section 10.1 "App" row (proposed):** "Native app built with Expo (React Native, TypeScript) for iPhone/iPad, Android later from the same code. Built and submitted in the cloud with Expo EAS (no Mac needed). Pilot installs by Expo internal distribution, then TestFlight. Supabase stays the back end; AI, moderation and WhatsApp run server-side only."

---

## Sources (all checked 2026-10-15)
- Apple App Review Guidelines (last updated 8 Jun 2026): https://developer.apple.com/app-store/review/guidelines/
- Apple Kids apps: https://developer.apple.com/app-store/kids-apps/ ; https://developer.apple.com/kids/
- Apple updated age ratings news (24 Jul 2025): https://developer.apple.com/news/?id=ks775ehf
- Apple age ratings reference: https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions
- Apple upcoming requirements: https://developer.apple.com/news/upcoming-requirements/
- Apple age assurance Q&A: https://developer.apple.com/support/age-assurance/
- Apple news, Brazil/Australia/Singapore/Utah/Louisiana (24 Feb 2026): https://developer.apple.com/news/?id=f5zj08ey
- Apple news, Texas update (3 Jun 2026): https://developer.apple.com/news/?id=sg176nne ; earlier Texas pause (23 Dec 2025): https://developer.apple.com/news/?id=8jzbigf4
- Apple news, age rating social media questions (9 Jul 2026): https://developer.apple.com/news/?id=tlur8uvi ; new OS submissions / April 2027 SDK (9 Sep 2026): https://developer.apple.com/news/?id=k1mtkt1k
- Apple Small Business Program: https://developer.apple.com/app-store/small-business-program/ ; Apple subscriptions (85% after one year): https://developer.apple.com/app-store/subscriptions/
- Google Play service fees: https://support.google.com/googleplay/android-developer/answer/112622
- Apple news, guidelines update (8 Jun 2026): https://developer.apple.com/news/?id=a233fmpw
- TestFlight: https://developer.apple.com/testflight/ ; https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/
- TestFlight terms: https://www.apple.com/legal/internet-services/itunes/testflight/
- Apple storefront list: https://developer.apple.com/help/app-store-connect/reference/pricing-and-availability/app-store-pricing-and-availability-start-times-by-country-or-region/
- Apple enrolment: https://developer.apple.com/programs/enroll/ ; https://developer.apple.com/help/account/membership/updating-your-account-information/
- Apple devices limit: https://developer.apple.com/help/account/devices/devices-overview/
- Apple App Analytics: https://developer.apple.com/app-store-connect/analytics/
- Google Play Families policy: https://support.google.com/googleplay/android-developer/answer/9893335
- Google Play Families data practices: https://support.google.com/googleplay/android-developer/answer/11043825
- Google Play policy deadlines: https://support.google.com/googleplay/android-developer/table/12921780
- Google Play AI-generated content: https://support.google.com/googleplay/android-developer/answer/13985936
- Google Play testing requirement: https://support.google.com/googleplay/android-developer/answer/14151465
- Google Play test tracks: https://support.google.com/googleplay/android-developer/answer/9845334
- Google Play account setup: https://support.google.com/googleplay/android-developer/answer/6112435
- Expo pricing: https://expo.dev/pricing
- Expo internal distribution: https://docs.expo.dev/build/internal-distribution/
- Expo localization (RTL): https://docs.expo.dev/guides/localization/
- Expo speech: https://docs.expo.dev/versions/latest/sdk/speech/
- Expo submit iOS: https://docs.expo.dev/submit/ios/
- Next.js static exports: https://nextjs.org/docs/app/guides/static-exports
- Supabase regional blocks (26 Mar 2026): https://supabase.com/blog/navigating-regional-network-blocks
- Non-official (context only): https://developer.apple.com/forums/thread/682057 ; https://github.com/invertase/react-native-firebase/issues/4494 ; https://community.revenuecat.com/sdks-51/we-rejected-depends-on-adsupport-guideline-1-3-safety-kids-category-729
