# Zaki app: architecture (Phase 1)

Plain version: the phone app (what the child and parent see) talks only to Zaki's own server. The server holds the secret AI keys, runs every safety check, and talks to the AI companies. The phone never holds a key.

## Parts
- `src/app/` screens (Expo Router). Child: start/ready check, home (today), lesson loop, classes (with full review), tests (+ exams), exam, flashcards, practice, help, safety, break. Parent (behind parental gate): settings (incl. lesson order / unlock), add lesson (typed name or photo), exam builder, Ask Zaki for grown-ups, progress, WhatsApp simulator.
- Shared pure code that both the server and the app's offline/demo mode use (no AI, no secrets, no Node APIs): `server/keywordScan.ts` + `server/normalize.ts` + `server/data/safetyKeywords.ts` (safety words), `server/shuffle.ts`, `server/examMix.ts`, `server/samples/` (demo packs), `src/lib/helpRoutes.ts` (help numbers).
- `src/app/api/*+api.ts` server routes (run on the server, deployable to EAS Hosting). They only call code in `server/`.
- `server/` all AI + safety logic (never imported by screens).
- `src/lib/` app-side helpers: API client, local storage of fake profile/progress, i18n (en/ar), help-route table.

## API contract (JSON over POST)
All requests include `childRef` (random id, never a name), `grade` (1–6), `lang` ("en"|"ar"), `country` ("LB"|"QA").
All responses may include `safety: { flagged: boolean, category?: string, showSafetyScreen?: boolean }`.
If `safety.showSafetyScreen` is true the app must immediately show the fixed safety screen (help routes from the table, not from the AI).

**Full `safety` object (server v1, all fields optional except `flagged`):**
```ts
safety: {
  flagged: boolean;
  category?: "disclosure_harm"|"self_harm"|"sexual"|"violence_fear"|"personal_data"|"adult_topic"|"prompt_injection"|"off_topic";
  showSafetyScreen?: boolean;
  route?: "reviewer"|"parent";   // always present when flagged
  involvesHome?: boolean;         // true when someone at home/family is (or may be) involved
  alertParent?: boolean;          // same meaning as route === "parent"
  alertLevel?: "urgent"|"calm";   // urgent: harm/self-harm; calm: fear, sadness, war worry, grief
  reviewerQueue?: boolean;        // true: the independent reviewer sees it
  helpRouteKind?: "home"|"self_harm"|"fear"|"general"; // which rows of src/lib/helpRoutes.ts to show
}
```
**Routing rule (safety review, red-team R3/R4):** when `flagged` is true, `route` is `"reviewer"` whenever `involvesHome` is true **or it is unclear who is involved**. The app must then NOT alert the parent, must not show the message in the parent area or WhatsApp reports, and sends it only to the independent reviewer. `route: "parent"` (parent AND reviewer) only when the risk is clearly outside the family (e.g. a stranger online) or when nobody else is involved (e.g. self-harm with no home person named).
When a fixed safety text applies, `reply` already contains it (en/ar, from `server/data/safetyMessages.ts`), never AI-written.
`country` is optional on `/api/tutor` only: missing = "not set by the parent" (help screen shows "tell a grown-up you trust" only).

1. `POST /api/lesson-pack` body `{ subject, topic, grade, lang, country, pageImages?: string[] (base64 jpeg, max 3) }`
   → `{ pack: LessonPack, sources: {title,url}[], verify: { checked:number, removed:number }, demo?: true }` (errors: 400 bad input/image, 422 `invalid_pack` / `photo_rejected` / `ai_refused`, 429 rate limit, 413 too large)
   Builds a lesson pack with research from trusted educational sources (web search restricted to an allow-list), grounded on uploaded page text if given. Every math answer key is re-checked by our own code; disagreeing items are removed.
2. `POST /api/tutor` body `{ packId, pack, step: "recap"|"teach"|"check"|"chat", history: {role:"child"|"zaki", text}[], message, lang, grade, country?, childRef?, questionId? }`
   → `{ reply: string, hintLevel?: number, safety, demo?: true }`
   `questionId` (optional) = the check/test item on screen, so exactly its answer is protected. `hintLevel` 1/2/3 counts Zaki turns in `history` (send the history of the current question only); 3 = similar worked example.
   Child message moderated first; reply moderated before return. Golden rule enforced (never gives final answers to homework/test items).
3. `POST /api/check-answer` body `{ pack, questionId, answer, attempt? }` (`answer` = choice index or choice text; `attempt` 1,2,3… = which try; recap items use ids `recap-0`, `recap-1`) → `{ correct: boolean, feedbackKey: "right"|"hint1"|"hint2"|"example" }` (deterministic, no AI).
4. `POST /api/parent-message` body `{ text, lang, country }` (WhatsApp simulator) → `{ reply, intent, plan?: {subject,topic,dueDate?,sessions,studyTime?}, action?: "send_report"|"show_plan"|"pause_reminders"|"opt_out"|"request_deletion", studyTime? }`. The server never changes data itself; the app performs `action` (deletion must be confirmed behind the parental gate). Only handles parent-service jobs; anything else gets a fixed polite redirect.
5. `GET /api/health` → `{ ok, ai: boolean, moderation: "openai"|"fallback", budget: { date, limitUsd, spentUsd, remainingUsd, safetyReserveUsd, reached, childTurnLimit } }` (ai=false when no key is set; the app then shows a "demo mode, AI not connected" banner and uses bundled sample packs).
6. `POST /api/exam` body `{ subject, lang, grade, count (5-30, default 15), lessons: [{ lessonKey, pack }] (1-8 saved lessons) }` → `{ questions: (Question & { lessonKey })[], added, demo?, budgetReached? }`. Always mixes questions from the lessons (balanced per lesson, de-duplicated, re-shuffled; `server/examMix.ts`, no AI). With AI on and budget left it adds up to 3 NEW questions; math ones must pass `verify.ts`, all pass the keyword check, else they are dropped. The app falls back to the same local mix offline.
7. `POST /api/parent-ask` body `{ message, lang, country?, history?: {role:"parent"|"zaki", text}[], pageImages?: string[] (max 3) }` → `{ reply, demo?, budgetReached?, blocked? }`. For the PARENT (behind the gate): adult-level explanations of grade 1-6 school topics + homework-help tips (fixed system prompt `server/parentAsk.ts`). No medical/legal/religious rulings, no links/phone numbers (reply post-checked), photo text = DATA, moderation on message and reply, counts toward the budget, never receives child names. A worrying message gets a fixed text with help numbers from the table.

8. `GET /api/review/flags` (header `x-reviewer-code`) → `{ flags: [{ id, ts, category, route, involvesHome, speaker, lang, childRef, excerpt, status: "new"|"seen"|"referred"|"resolved", note }] }` and `POST /api/review/flags/:id` body `{ status, note? }` → `{ flag }`. For the independent safety reviewer only (`server/review.ts`, flags via `getStore()`). Code: env `ZAKI_REVIEWER_CODE`; with no AI key (demo) and no code set, the demo code `2468` works; with AI on and no code: 503. Constant-time compare. `flagsForParent()` is the only parent-facing view: route `parent` (or reviewer-shared) flags, category + time only, never excerpts, never reviewer-route flags.
9. FAMILY IDENTITY (decision (a), `server/family.ts`): `POST /api/family/register` body `{ guardians: [{firstName, relationship}] (1-2), consentVersion, country?, reportLang? }` → `{ familyId, familyKey, consentId }`. The key (32 random bytes) is returned ONCE; only its SHA-256 is stored (`families/<id>.json` or `public.family_keys`, migration `0003_family_keys.sql`, service role only). Every family route verifies the key FIRST (constant time) before any family data is read or written: `POST /api/family/sync` `{ familyId, familyKey, children: [{childRef, nickname, grade, lang, avatar, dailyLimitMin, progress?}] }`, `POST /api/family/export` `{ familyId, familyKey }`, `POST /api/family/consent` `{ familyId, familyKey, action: "withdraw"|"give", consentId?, consentVersion? }`, `POST /api/delete-family` `{ familyId, familyKey }` → deletes the family; its children's flags are kept (open referrals) with no childRef/familyId. The app registers on consent (real server only), keeps the key on the device (never exported), and syncs children + progress (no chat text, no photos).

## Consent, reviewer, export/delete (app)
- CONSENT (once per family, before any lesson or AI call): `/parent/consent` behind the gate, plain-language sections in en/ar (`src/lib/consentText.ts`, `CONSENT_VERSION`). Two guardians each type a first name + relationship and tick "I agree", OR one guardian ticks an explicit "the other parent/guardian agrees (or I am the only legal guardian)". Stored: version, time, date, mode, first names + relationship only. `api.ts` refuses lesson/tutor calls without active consent; the child's Ready screen and lessons show "A grown-up needs to set up Zaki first". Settings shows the status and can withdraw (AI stops until consent is given again).
- REVIEWER INBOX `/reviewer` (start screen → "Safety reviewer"): code-protected; online it uses the routes above, in demo/offline it shows the flags kept on this device. Local flags follow the same rule: route "reviewer" for possible home involvement/unclear/help-button, never shown in the parent area (Progress shows only route-"parent" notes, without the child's words) and never included in the family export.
- EXPORT/DELETE `/parent/data` behind the gate: download a JSON file (web download / phone share sheet) of profiles, settings, plans, progress, lessons, exams, consent and parent safety notes. Delete needs the typed word DELETE / احذف, calls `/api/delete-family` with the family key (if registered), then wipes the device (local flags kept only without child link or text).

## Daily spending cap (`server/budget.ts`)
- `ZAKI_DAILY_BUDGET_USD` (default 1.00) for the whole server per UTC day; `ZAKI_CHILD_DAILY_AI_TURNS` (default 40) Ask-Zaki AI turns per child per day.
- Every Claude call goes through `callClaude(params, { purpose: "lesson"|"tutor"|"safety" })`: it refuses to start when over budget (`BudgetExceededError`) and records the estimated cost from the reply's token usage x prices in `server/config/models.ts` (Sonnet 5.5 $2/$10 per MTok, cache read $0.10; Haiku 5.5 $0.10/$0.50; web search $10 per 1,000).
- Safety classifier calls may use an extra 10% reserve. Keyword safety (no AI) ALWAYS runs, whatever the budget.
- Over budget: `/api/lesson-pack` → `{ budgetReached: true }` (the app adds the lesson to the plan as "ready tomorrow" and retries on a later app start); `/api/tutor` → fixed friendly reply pointing to practice/flashcards, `budgetReached: true`.
- State: memory + `server/data/budget.json` (gitignored; `ZAKI_BUDGET_FILE` to move it), or the online database's `budget_daily` / `child_turns_daily` through `getStore()` when Supabase is configured (shared by every server instance).

## Shared lesson library (`server/library.ts`)
- A pack built from a TYPED topic only is saved under `subject|normalized topic|grade|lang` through `getStore().libraryGet/libraryPut`: `server/data/library/` (gitignored; `ZAKI_LIBRARY_DIR`) or the `library` table when Supabase is configured. The next request for the same key gets it back re-shuffled with `fromLibrary: true` and no AI cost; the parent sees "Ready instantly (from Zaki's library)".
- Packs built from page PHOTOS are never stored or served from the library (private to the family).

## App rules (client)
- PASS-TO-UNLOCK (`src/lib/unlock.ts`): within each subject the grown-up's lessons are an ordered queue. Only the first lesson not yet passed (test >= 80%) is open; later ones show "Pass the "X" test to unlock". Passed lessons stay open for full review (teach steps, checks, test retake with a new shuffle; all from the saved pack, no AI). The grown-up can reorder or unlock early in Settings (behind the gate). Home "Start" opens the current open lesson.
- Exams built by the grown-up are stored on the device; the child takes them in Tests (practice runs before the date), same timing rules as tests; results are broken down per lesson and weak lessons are offered for review.
- "I need help" is never blocked (it is also inside the "Leave the test?" box).

## LessonPack shape
```ts
type LessonPack = {
  id: string; subject: "math"|"science"|"english"|"arabic"|"social";
  topic: string; grade: number; lang: "en"|"ar";
  recap: { q: string; choices: string[]; answerIndex: number }[];
  teachSteps: { text: string; example?: string }[];
  checks: Question[]; test: Question[]; retestPool: Question[];
  summary: string[]; flashcards: { front: string; back: string }[];
};
type Question = { id: string; q: string; choices: string[]; answerIndex: number;
  hint1: string; hint2: string; similarExample: string; kind?: "math"|"text"; mathExpr?: string };
```

## Secrets (environment variables, server only)
`ZAKI_ANTHROPIC_API_KEY` or `ANTHROPIC_API_KEY` (required for real AI; the ZAKI_ name wins, for cloud dev environments that reserve the plain name), `OPENAI_API_KEY` (optional, moderation). Never in code, never in the app.
Spending/limits: `ZAKI_DAILY_BUDGET_USD`, `ZAKI_CHILD_DAILY_AI_TURNS`. Rate limiter: `TRUST_PROXY=1` only behind a proxy that overwrites `X-Forwarded-For`; `ZAKI_RATE_LIMIT_OFF=1` works only when `NODE_ENV` is not production (local tests).
`OPENAI_ZDR_APPROVED=true` must ALSO be set before any child text goes to OpenAI moderation (safety review gate G4). Optional: `ZAKI_FLAG_FILE` (path of the reviewer flag log, default `server/data/flags.jsonl`; `off` = memory only), `ZAKI_DISABLE_FALLBACKS=true`.

## Online storage (Supabase)
Plain version: Zaki can save families' data in a private online database (Supabase, EU/Frankfurt) instead of files on the server. It switches on when the keys are added, and works as before without them. Founder steps: `supabase/README.md`.
- **Switch:** `server/storage/index.ts` → `getStore()`. Uses `supabaseStore` when `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set, otherwise `fileStore` (JSON under `server/data`: `flags.jsonl`, `budget.json`, `library/`, `families/`, same formats as today). `ZAKI_STORAGE=file` forces files. The service key is server-only. An `EXPO_PUBLIC_*SERVICE*` variable makes `getStore()` throw. `server/storage/supabaseClient.ts` is the only file that imports `@supabase/supabase-js`.
- **Integrated (this round):** safety flags (`safety.ts` → `addFlag`; reviewer inbox → `listFlags`/`reviewFlag`), the shared library (`libraryGet/Put`), and the budget (only when the store kind is `supabase`; otherwise `budget.json` as before) all go through `getStore()`. Added to the interface: `setFamilyKeyHash` / `getFamilyKeyHash` (family identity, `0003_family_keys.sql`) and `unlinkChildren` (family deletion keeps flags without the child link). Everything works with no Supabase env (fileStore).
- **Interface (`ZakiStore`):** flags (`addFlag`, `listFlags`, `reviewFlag`, `parentAlerts`), library (`libraryGet/Put`), budget (`budgetGet`, `budgetAdd`, `childTurnTake`), families (`createFamily`, `getFamily`, `addConsent`, `withdrawConsent`, `upsertChild`, `listChildren`, `syncProgress`, `getProgress`), parent rights (`exportFamily`, `deleteFamily`), and `runRetention`.
- **Schema:** `supabase/migrations/0001_init.sql`. Row-Level Security is on for every table, so a family sees only its own rows (`guardians.user_id = auth.uid()`). Reviewers (`public.reviewers`) can read `flags` only, and the logged `zaki_reviewer_queue()` / `zaki_review_flag()` functions record each view. Families never read `flags` directly. `zaki_my_parent_alerts()` returns route-`parent` (or reviewer-shared) items without the child's words. `library` can be read by signed-in families and written by the service role only. `budget_daily` / `child_turns_daily` are service role only. `lesson_packs` has a check that photo packs never get a `library_key`. No surnames, school, location, contact details or photos are stored. Deleting a family cascades everything but keeps its flags with `family_id = null`, so an open referral survives.
- **Retention:** `zaki_run_retention()` deletes chat text after 90 days and reviewed/closed flags 30 days after review (never `referred` or pending). It is scheduled nightly by `0002_retention_schedule.sql` (pg_cron). Photos, if ever stored, go in the private bucket `page-photos` at `<YYYY-MM-DD>/<id>.jpg`. `store.runRetention()` removes them after 30 days through the Storage API, so call it daily.
- **Checks:** `node --import tsx --test server/storage/__tests__/*.test.ts` covers the interface on fileStore, plus env selection and supabaseStore mapping with a fake client. `supabase/tests/run-pglite.mjs` applies the SQL to PGlite and runs RLS smoke tests.
