# Zaki app: architecture (Phase 1)

Plain version: the phone app (what the child and parent see) talks only to Zaki's own server. The server holds the secret AI keys, runs every safety check, and talks to the AI companies. The phone never holds a key.

## Parts
- `src/app/` screens (Expo Router). Child: start/ready check, home (today), lesson loop, classes, tests, flashcards, practice, help. Parent (behind parental gate): settings, add lesson (typed name or photo), WhatsApp simulator, reports.
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
5. `GET /api/health` → `{ ok, ai: boolean, moderation: "openai"|"fallback" }` (ai=false when no key is set; the app then shows a "demo mode, AI not connected" banner and uses bundled sample packs).

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
`ANTHROPIC_API_KEY` (required for real AI), `OPENAI_API_KEY` (optional, moderation). Never in code, never in the app.
`OPENAI_ZDR_APPROVED=true` must ALSO be set before any child text goes to OpenAI moderation (safety review gate G4). Optional: `ZAKI_FLAG_FILE` (path of the reviewer flag log, default `server/data/flags.jsonl`; `off` = memory only), `ZAKI_DISABLE_FALLBACKS=true`.
