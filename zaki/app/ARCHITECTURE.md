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

1. `POST /api/lesson-pack` body `{ subject, topic, grade, lang, country, pageImages?: string[] (base64 jpeg, max 3) }`
   → `{ pack: LessonPack, sources: {title,url}[], verify: { checked:number, removed:number } }`
   Builds a lesson pack with research from trusted educational sources (web search restricted to an allow-list), grounded on uploaded page text if given. Every math answer key is re-checked by our own code; disagreeing items are removed.
2. `POST /api/tutor` body `{ packId, pack, step: "recap"|"teach"|"check"|"chat", history: {role:"child"|"zaki", text}[], message, lang, grade, country }`
   → `{ reply: string, hintLevel?: number, safety }`
   Child message moderated first; reply moderated before return. Golden rule enforced (never gives final answers to homework/test items).
3. `POST /api/check-answer` body `{ pack, questionId, answer }` → `{ correct: boolean, feedbackKey: "right"|"hint1"|"hint2"|"example" }` (deterministic, no AI).
4. `POST /api/parent-message` body `{ text, lang, country }` (WhatsApp simulator) → `{ reply, plan?: {subject,topic,dueDate?,sessions} }`. Only handles parent-service jobs; anything else gets a fixed polite redirect.
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
