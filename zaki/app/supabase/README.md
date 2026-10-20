# Zaki's online storage (Supabase)

## What this is, in plain words

Today Zaki keeps everything in small files on the computer that runs Zaki's server, and on the phone itself. That is fine for testing, but those files can be lost, and two phones in one family cannot share them.

**Supabase** is an online database service: a private, locked filing cabinet on the internet. This folder holds the plans for Zaki's cabinet:

- `migrations/0001_init.sql`: the list of drawers (tables) and the locks on them.
- `migrations/0002_retention_schedule.sql`: a nightly clean-up job that throws away old chat text and old safety notes on time.
- `apply-migrations.mjs`: a small helper Claude uses to build the cabinet in your Supabase account.
- `tests/`: checks that the locks work. They run on a pretend database, not on your account.

**Nothing changes until you add the keys.** Without them, Zaki keeps working exactly as it does now. Once the keys are added, Zaki's server starts using the online cabinet on its own.

## What goes in the cabinet (and what never does)

| Kept | Never kept |
|---|---|
| The parent's **first name** and relationship ("mother", "father"…) | Surnames, phone numbers, emails, home address, location |
| The child's **nickname**, grade, language, avatar, daily time limit | The child's school, face photos, voice recordings |
| The lesson plan, lessons, test scores, study minutes | Payment details |
| Consent records (which version, when given, when withdrawn) | |
| Safety notes: only the **type** of worry and a short, cleaned snippet, never a name | |

Each child gets a **random code** (like `a3f9…`). The AI companies only ever see that code, never the name.

**How long things are kept**
- Chat text: about **90 days**, then deleted automatically every night.
- Photos of school pages: Zaki does **not** keep them by default. If that ever changes, they live in a locked photo folder and are deleted after about **30 days**.
- Safety notes: deleted about **30 days after the reviewer has dealt with them**. A note is **never** deleted while a case is still open with the authorities.
- Scores and lesson summaries: kept until the parent deletes them.

**Who can see what (the locks)**
- Each family can only see its **own** information. Not other families, not the shared settings.
- The independent **safety reviewer** can see safety notes and nothing else. Every time they open the list, it is written down.
- A safety note that **may involve someone at home** is **never** shown to the parent, unless the reviewer decides to share it.
- The **shared lesson library** (lessons built from typed topics, shared to save AI costs) has no family information in it. Families can read it; only Zaki's server can add to it. Lessons made from page photos are **never** put in the library.
- A parent can **download everything** Zaki holds about their family, and **delete everything** in one step from inside the app.

## Step by step: create your free account (about 10 minutes)

You only do steps 1 to 4. Claude does the rest.

### 1. Make the account
1. Go to **supabase.com** and click **Start your project**.
2. Sign up with GitHub or with your email. Choose the **Free** plan. Do not enter a card.

### 2. Create the project
1. Click **New project**.
2. **Organization**: the one Supabase made for you is fine.
3. **Project name**: `zaki`.
4. **Database password**: click **Generate a password**. Save it in your password manager. You will not need to give it to anyone.
5. **Region**: choose **Central EU (Frankfurt)**, also shown as `eu-central-1`.
   - *Why Frankfurt:* the data stays in the European Union, which has strong privacy laws, and our safety review asks for an EU region. Frankfurt is also one of the closest big regions to Lebanon and Qatar, so Zaki stays quick.
6. If you are asked about security options, keep the defaults (data API **on**, "automatic Row-Level Security" **on** if offered).
7. Click **Create new project** and wait 1–2 minutes until it says the project is ready.

### 3. Find the three values Zaki needs
1. In your project, click the **gear icon (Project Settings)** at the bottom of the left menu.
2. Click **Data API** (or **API**). Copy the **Project URL**. It looks like `https://abcdefghij.supabase.co`.
3. Click **API Keys**. You will see two kinds of keys:
   - The **publishable** key (older screens call it **anon public**). This one is safe to show in an app.
   - The **secret** key (older screens call it **service_role**). Click **Reveal** to see it. **This one is a master key. Treat it like a bank PIN.**
   - If your screen shows a **Legacy API keys** tab, the `anon` and `service_role` keys there work too.

### 4. Put the values in the Claude environment settings (never in the chat)
1. In Claude, open the **cloud environment menu** in the session's title bar, then click **Edit**.
2. Under **Environment variables**, add these lines, one per value:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=the publishable (anon) key
   SUPABASE_SERVICE_ROLE_KEY=the secret (service_role) key
   ```
3. **So Claude can build the cabinet**, add one more value for a short time:
   - In Supabase, click your **avatar (top right) → Account preferences → Access Tokens → Generate new token**. Name it `zaki-setup`.
   - Add it as `SUPABASE_ACCESS_TOKEN=...` in the same Environment variables box.
   - After Claude says the setup is done, go back to **Access Tokens** in Supabase and click **Revoke** on `zaki-setup`, then remove the line from the settings.
4. Under **Network access**, if it is set to a limited list, add `supabase.co`, `*.supabase.co` and `api.supabase.com` to the allowed domains.
5. Save, then **start a new Claude session** so it picks up the new values.

> **Never paste any of these keys into the chat**, an email, WhatsApp or a screenshot. If a key is ever shown by mistake, tell Claude. You can make a new key in Supabase (Project Settings → API Keys) and the old one stops working.

### 5. Tell Claude "the Supabase keys are in"
Claude will then:
1. Build the cabinet by running `0001_init.sql` and `0002_retention_schedule.sql` on your project.
2. Check that the locks work.
3. Switch Zaki's server over and confirm that it is saving to the cabinet.
4. Remind you to revoke the `zaki-setup` access token.

**No-token alternative:** if you would rather not create an access token, Claude can give you the two files. In Supabase, click **SQL Editor → New query**, paste the first file, click **Run**, then do the same with the second file.

## Things to know about the free plan
- **Cost: US$0.** Nothing here spends money. Anything paid (backups, a custom web address) is your decision, and Claude will ask first.
- A free project **goes to sleep after about a week with no use**. To wake it, open supabase.com and click **Restore**. Your data is kept.
- There is a size limit, which is plenty for a family pilot.
- **Backups:** before real children use Zaki, decide whether to pay for Supabase's daily backups. Claude will ask you at that point.

## The UAE network block (why Zaki is mostly safe from it)
In September 2025, two UAE mobile networks blocked Supabase's web addresses (`*.supabase.co`) for about 18 days. Logins and photo links broke for apps that talk to Supabase directly.

**Zaki's phone app does not talk to Supabase.** It only talks to Zaki's own server, and the server talks to Supabase. So a block like that in one country would not stop children's lessons. If we ever let the app or a parent website connect to Supabase directly (for example, a parent login or photo links), we should first add a **custom web address** for Supabase. That is a paid add-on, so Claude will ask you before doing it.

## Before any real child uses this
Online storage does not replace the safety gates in `docs/research/08-safety-review-phase0.md`. The consent form, named reviewer, lawyer answers and the other gates still have to be done first. Until then, the cabinet holds **test data only**.

---

### Technical notes (for Claude / engineers)
- Server only: `server/storage/index.ts` → `getStore()` picks `supabaseStore` when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set, otherwise `fileStore`. `ZAKI_STORAGE=file` forces files. A service key under an `EXPO_PUBLIC_*` name throws, because it would be bundled into the app.
- `SUPABASE_ANON_KEY` is not used yet. It is for a later signed-in parent area, where RLS (`zaki_my_family_ids()`) applies. Families link through `guardians.user_id = auth.uid()`. Reviewers are rows in `public.reviewers`, added by the server.
- Run migrations: `node supabase/apply-migrations.mjs 0001_init.sql 0002_retention_schedule.sql` (needs `SUPABASE_URL` + `SUPABASE_ACCESS_TOKEN`). It goes over HTTPS through the session proxy. `0002` needs `pg_cron`, which is available on the free plan.
- Local checks (no account): from a scratch folder with `@electric-sql/pglite` installed, run `PGLITE_MODULE=<that folder>/node_modules/@electric-sql/pglite/dist/index.js node supabase/tests/run-pglite.mjs`. `tests/supabase-shim.sql` fakes the Supabase roles and `auth.uid()`. Never run it on the real project.
- Photos (if ever stored): bucket `page-photos` (private, no policies, server only), path `<YYYY-MM-DD>/<id>.jpg`. `store.runRetention()` deletes day folders older than 30 days through the Storage API, so call it daily.
