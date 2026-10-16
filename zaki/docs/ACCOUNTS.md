# Zaki: accounts to create (step by step)

Written for Rabih. Updated 2026-10-16 after the Phase 0 research.

**Rules for every account**
- Use one dedicated email for Zaki (for example a new Gmail like `zaki.app.team@gmail.com`), so everything stays together.
- Turn on two-step login (a code on your phone) wherever it is offered.
- **Never paste a password or secret key into the chat with Claude.** When a step gives you a "key" (a long secret code), Claude will tell you exactly where to paste it: the private settings of this Claude environment (**Environment settings → Environment variables**), never into the code or the chat.
- Nothing below costs money unless it says **💳 costs money**. Claude will not pay for anything; you decide.

---

## Now: for Phase 1 (building and testing with made-up children)

### 1. GitHub: already done ✅
This is where the project is stored. Nothing to do.

### 2. Expo (free): builds the phone app without a Mac
1. Go to **expo.dev** → **Sign up**.
2. Use the Zaki email, pick a username (e.g. `zakiapp`), confirm the email.
3. On your iPhone, install the free app **Expo Go** from the App Store. With it you can try Zaki on your own phone while it's being built, with no Apple developer account yet.
4. Later Claude will ask you for an "access token": in Expo go to **Account settings → Access tokens → Create**. Paste it only into the environment settings, as `EXPO_TOKEN`.

### 3. Supabase (free to start): Zaki's private database and login
1. Go to **supabase.com** → **Start your project** → sign up with GitHub (easiest).
2. Click **New project**. Name: `zaki-dev`. Region: **Central EU (Frankfurt)** (closest allowed option; there is no Middle East region).
3. Choose a strong database password and save it in your password manager (not in the chat).
4. When it's ready, go to **Project Settings → API**. Claude will ask for the "Project URL" and the two keys; paste them only into the environment settings as `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.

### 4. Anthropic (Claude API): Zaki's teacher brain. 💳 costs money (small)
1. Go to **console.anthropic.com** → sign up with the Zaki email.
2. Create an **organisation** called "Zaki".
3. **Billing → Add credits.** 💳 Start small: **$10–20** is enough for all of Phase 1 testing. Turn **auto-reload off** so it can never charge more than you added. *(Claude will ask you before this step.)*
4. **API keys → Create key**, name it `zaki-dev`. Paste it only into the environment settings as `ANTHROPIC_API_KEY`.
5. Later (before real children): email Anthropic sales to ask for **zero data retention** and their child-safety system prompt. Claude will draft that email for you.

### 5. OpenAI: only for the free safety filter
1. Go to **platform.openai.com** → sign up with the Zaki email.
2. The safety filter ("moderation") is free, but OpenAI may ask for a payment card or $5 credit to activate the account. 💳 If so, add the minimum. *(Claude will ask you first.)*
3. **API keys → Create new secret key**, name it `zaki-moderation`. Paste only into the environment settings as `OPENAI_API_KEY`.

---

## Later: before your family uses Zaki (Phase 3)

### 6. Apple Developer Program 💳 US$99 per year
Needed to install Zaki on your family's iPhones and, later, publish to the App Store.
- Join as an **individual** for now (fast). Switch to a company account later.
- Needs your Apple Account with two-step login, and a payment card.
- Note: children under 13 can't use Apple's test app (TestFlight), so your family's iPhones will be **registered by device** and get Zaki from a private install link.

### 7. Meta Business + WhatsApp (can wait)
For the family pilot, WhatsApp is optional. Reports can show inside the parent area of the app first. When you want WhatsApp:
- A **new SIM card** used only for Zaki (not on the normal WhatsApp app).
- A Meta Business account at **business.facebook.com**.
- A payment card on file. Since 1 Oct 2026 Meta charges about **1 cent per report** in Lebanon, and stops delivering replies without a card.
- Full business verification needs company papers, which can wait.

### 8. Not needed for now
- **Vercel**: the plan's web host. With the phone-app approach, Zaki's server can live inside Supabase, so Vercel is not needed for now.
- **Google Play** (💳 US$25 once): later, when you add Android (most Lebanese phones are Android).
- **Domains** (💳): only after you choose the final name.
