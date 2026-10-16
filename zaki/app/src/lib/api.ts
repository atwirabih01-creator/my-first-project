// App-side API client. Talks ONLY to Zaki's own server (relative /api/* routes).
// If the server is unreachable or reports ai:false, everything falls back to a
// client-side DEMO MODE (bundled sample packs, local answer checks, scripted replies).
import { getDemoPack } from './demoPacks';
import type { HelpKind } from './helpRoutes';
import { kindFromCategory } from './localSafety';
import { translate } from './i18n';
import type { Country, Lang, LessonPack, Question, Safety, Source, Subject } from './types';

type SafetyHandler = (kind: HelpKind) => void;
let safetyHandler: SafetyHandler | null = null;
let demoMode = false;

export function setSafetyHandler(fn: SafetyHandler | null) {
  safetyHandler = fn;
}
export function setDemoMode(on: boolean) {
  demoMode = on;
}
export function isDemoMode() {
  return demoMode;
}

/** Call for every API response. Returns true when the safety screen was triggered. */
function handleSafety(safety: Safety | undefined): boolean {
  if (safety?.showSafetyScreen) {
    safetyHandler?.(kindFromCategory(safety.category));
    return true;
  }
  return false;
}

async function request<T>(path: string, body?: unknown, timeoutMs = 20000): Promise<T> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = setTimeout(() => controller?.abort(), timeoutMs);
  try {
    const res = await fetch(path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller?.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('json')) throw new Error('Not JSON');
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

// ---------- health ----------
export type Health = { ok: boolean; ai: boolean; moderation?: string };

export async function getHealth(): Promise<Health | null> {
  try {
    const h = await request<Health>('/api/health', undefined, 5000);
    if (typeof h?.ai !== 'boolean') return null;
    return h;
  } catch {
    return null;
  }
}

type Common = { childRef: string; grade: number; lang: Lang; country: Country };

// ---------- lesson pack ----------
export type LessonPackResult = {
  pack: LessonPack;
  sources: Source[];
  demo: boolean;
  safetyStopped?: boolean;
};

function isValidPack(p: unknown): p is LessonPack {
  const x = p as LessonPack;
  return !!x && Array.isArray(x.teachSteps) && Array.isArray(x.test) && Array.isArray(x.checks) && Array.isArray(x.summary);
}

export async function fetchLessonPack(
  req: Common & { subject: Subject; topic: string; pageImages?: string[] },
): Promise<LessonPackResult> {
  if (!demoMode) {
    try {
      const data = await request<{ pack: LessonPack; sources?: Source[]; safety?: Safety }>(
        '/api/lesson-pack',
        req,
        90000,
      );
      if (handleSafety(data.safety)) {
        const d = getDemoPack(req.subject, req.lang, req.grade);
        return { ...d, demo: true, safetyStopped: true };
      }
      if (isValidPack(data.pack)) {
        return {
          pack: { ...data.pack, recap: data.pack.recap ?? [], retestPool: data.pack.retestPool ?? [], flashcards: data.pack.flashcards ?? [] },
          sources: (data.sources ?? []).map((s) => ({ title: s.title })),
          demo: false,
        };
      }
    } catch {
      // fall through to demo
    }
  }
  // Small pause so the friendly "researching" animation is visible in demo mode too.
  await new Promise((r) => setTimeout(r, 1200));
  const d = getDemoPack(req.subject, req.lang, req.grade);
  return { ...d, demo: true };
}

// ---------- check answer (deterministic) ----------
export type FeedbackKey = 'right' | 'hint1' | 'hint2' | 'example';

/** Same ladder as /api/check-answer: wrong #1 -> hint1, #2 -> hint2, #3+ -> similar example. */
export function localCheck(q: Question, answer: number, wrongSoFar: number): { correct: boolean; feedbackKey: FeedbackKey } {
  const correct = answer === q.answerIndex;
  if (correct) return { correct, feedbackKey: 'right' };
  const n = wrongSoFar + 1;
  return { correct, feedbackKey: n === 1 ? 'hint1' : n === 2 ? 'hint2' : 'example' };
}

export async function checkAnswer(
  pack: LessonPack,
  q: Question,
  answer: number,
  wrongSoFar: number,
): Promise<{ correct: boolean; feedbackKey: FeedbackKey }> {
  const local = localCheck(q, answer, wrongSoFar);
  if (demoMode) return local;
  try {
    const data = await request<{ correct: boolean; feedbackKey?: FeedbackKey; safety?: Safety }>(
      '/api/check-answer',
      { pack, questionId: q.id, answer, attempt: wrongSoFar + 1 },
      8000,
    );
    handleSafety(data.safety);
    if (typeof data.correct !== 'boolean') return local;
    // The hint ladder is driven by the app so it always matches the child's attempts.
    const ladder: FeedbackKey = local.feedbackKey === 'right' ? 'hint1' : local.feedbackKey;
    return { correct: data.correct, feedbackKey: data.correct ? 'right' : ladder };
  } catch {
    return local;
  }
}

// ---------- tutor chat ----------
export type ChatTurn = { role: 'child' | 'zaki'; text: string };

const ANSWER_BEGGING = /(answer|tell me|what is it|just say|الجواب|الاجابة|الإجابة|قل لي|قولي|شو الجواب|el jawab|eljawab)/i;
const OFF_TOPIC = /(game|youtube|tiktok|fortnite|minecraft|roblox|movie|love you|friend|لعبة|يوتيوب|فيلم|بحبك|صاحبي|صديقي)/i;

function demoTutorReply(message: string, pack: LessonPack | null, lang: Lang): string {
  const note = translate(lang, 'demoNote');
  if (!message.trim()) return translate(lang, 'demoChatHello');
  if (ANSWER_BEGGING.test(message)) return `${translate(lang, 'demoChatAnswer')}\n${note}`;
  if (OFF_TOPIC.test(message) || !pack) return `${translate(lang, 'demoChatOff')}\n${note}`;
  const steps = pack.teachSteps;
  const step = steps[Math.abs(hash(message)) % Math.max(steps.length, 1)];
  const text = step ? `${step.text}${step.example ? ` ${step.example}` : ''}` : pack.summary[0] ?? '';
  return `${translate(lang, 'demoChatStep', { step: text })}\n${note}`;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export async function askTutor(
  req: Common & { pack: LessonPack | null; step: 'recap' | 'teach' | 'check' | 'chat'; history: ChatTurn[]; message: string },
): Promise<{ reply: string; demo: boolean; safetyStopped: boolean }> {
  if (!demoMode && req.pack) {
    try {
      const data = await request<{ reply: string; safety?: Safety }>(
        '/api/tutor',
        { ...req, packId: req.pack.id },
        30000,
      );
      if (handleSafety(data.safety)) return { reply: '', demo: false, safetyStopped: true };
      if (typeof data.reply === 'string' && data.reply.trim()) return { reply: data.reply, demo: false, safetyStopped: false };
    } catch {
      // fall back to demo reply
    }
  }
  await new Promise((r) => setTimeout(r, 500));
  return { reply: demoTutorReply(req.message, req.pack, req.lang), demo: true, safetyStopped: false };
}

// ---------- parent message (WhatsApp simulator) ----------
export type ParentPlan = { subject: Subject; topic: string; dueDate?: string; sessions?: number };

export async function sendParentMessage(
  text: string,
  lang: Lang,
  country: Country,
): Promise<{ reply: string | null; plan?: ParentPlan; demo: boolean }> {
  if (!demoMode) {
    try {
      const data = await request<{ reply: string; plan?: ParentPlan; safety?: Safety }>(
        '/api/parent-message',
        { text, lang, country },
        30000,
      );
      if (typeof data.reply === 'string') return { reply: data.reply, plan: data.plan, demo: false };
    } catch {
      // fall through
    }
  }
  return { reply: null, plan: demoParsePlan(text), demo: true };
}

const SUBJECT_WORDS: [Subject, RegExp][] = [
  ['math', /(math|maths|رياضيات|حساب|كسور|fraction)/i],
  ['science', /(science|علوم|water|ماء|plant|نبات)/i],
  ['english', /(english|انجليزي|إنجليزي|انكليزي)/i],
  ['arabic', /(arabic|عربي|العربية)/i],
  ['social', /(social|history|geography|اجتماعيات|تاريخ|جغرافيا)/i],
];

/** Very small demo parser: "Math test on fractions Sunday" -> plan. */
export function demoParsePlan(text: string): ParentPlan | undefined {
  const found = SUBJECT_WORDS.find(([, re]) => re.test(text));
  if (!found) return undefined;
  let topic = text
    .replace(/\b(test|lesson|on|about|has|a|the|for|sunday|monday|tuesday|wednesday|thursday|friday|saturday|tomorrow|today)\b/gi, ' ')
    .replace(/(اختبار|درس|عن|يوم|الأحد|الاثنين|الثلاثاء|الأربعاء|الخميس|الجمعة|السبت|غدا|غدًا|اليوم)/g, ' ')
    .replace(found[1], ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!topic) topic = text.trim();
  const isTest = /(test|exam|quiz|اختبار|امتحان|فحص)/i.test(text);
  let dueDate: string | undefined;
  if (isTest) {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    dueDate = d.toISOString().slice(0, 10);
  }
  return { subject: found[0], topic: topic.slice(0, 60), dueDate, sessions: 2 };
}
