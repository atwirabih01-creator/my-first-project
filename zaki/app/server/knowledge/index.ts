// Zaki's "background experience": finds the teacher notes (server/knowledge/*.ts) that match a
// lesson request, a typed topic, a homework question or the text read from a page photo, and
// turns one entry into a compact brief for a prompt. Never shown to users as a catalog.
//
// Matching (findKnowledge):
//  1. EXACT: the topic equals an entry's English or Arabic topic name (normalized: case,
//     punctuation, Arabic letter variants and diacritics; also the name without its
//     "(...)" part, e.g. "Comparing numbers").
//  2. FUZZY: normalized tokens, stopwords removed, light stemming (EN plural/-ing/-ed; AR
//     article and clitics, common suffixes), compared with the entry's topic names (weight 3),
//     vocabulary (2) and key idea (1). Rare words count more (IDF over all entries). The score
//     mixes "how much of the request the entry explains" and "how much of the entry's topic
//     name the request contains".
//  3. Subject must match; science <-> physics/chemistry/biology also match (a little lower).
//     Same grade first, then grade +-1 (a little lower). Other grades never match.
//  4. A minimum score: a weak, accidental overlap returns [].
// Everything is precomputed once at module load; a lookup scans only the entries of the
// allowed subjects and grades (about 10-60) with set lookups.

import type { SchoolProgram, Subject } from "../types";
import { normalizeBase } from "../normalize";
import { ARABIC_KNOWLEDGE } from "./arabic";
import { BIOLOGY_KNOWLEDGE } from "./biology";
import { CHEMISTRY_KNOWLEDGE } from "./chemistry";
import { ENGLISH_KNOWLEDGE } from "./english";
import { MATH_KNOWLEDGE } from "./math";
import { PHYSICS_KNOWLEDGE } from "./physics";
import { SCIENCE_KNOWLEDGE } from "./science";
import type { KnowledgeEntry, ProgramKey } from "./types";

export type { KnowledgeEntry, ProgramKey } from "./types";

export const ALL_KNOWLEDGE: readonly KnowledgeEntry[] = [
  ...MATH_KNOWLEDGE,
  ...SCIENCE_KNOWLEDGE,
  ...PHYSICS_KNOWLEDGE,
  ...CHEMISTRY_KNOWLEDGE,
  ...BIOLOGY_KNOWLEDGE,
  ...ENGLISH_KNOWLEDGE,
  ...ARABIC_KNOWLEDGE,
];

/** Stable id of an entry, used in logs and the lesson-pack verify stats: "grade|subject|topic". */
export function knowledgeId(e: Pick<KnowledgeEntry, "grade" | "subject" | "topic">): string {
  return `${e.grade}|${e.subject}|${e.topic}`;
}

// ---------------------------------------------------------------------------------------
// Text normalization for matching
// ---------------------------------------------------------------------------------------

const STOPWORDS = new Set(
  [
    // English
    "a", "an", "the", "and", "or", "of", "to", "in", "on", "at", "for", "with", "by", "from", "as", "is", "are", "be",
    "was", "were", "it", "its", "this", "that", "these", "those", "we", "you", "i", "my", "our", "your", "me", "us",
    "what", "how", "why", "which", "who", "do", "does", "did", "can", "about", "into", "up", "out", "than", "then",
    "so", "if", "not", "no", "yes", "all", "some", "any", "more", "most", "each", "every", "one", "two", "both",
    "lesson", "lessons", "today", "class", "learn", "learned", "learning", "teach", "explain", "please", "help",
    "homework", "question", "questions", "exercise", "page", "book", "grade", "unit", "chapter", "topic",
    "find", "write", "work", "answer", "show", "use", "using", "make", "get", "let", "lets", "let's", "has", "have",
    "will", "would", "should", "there", "their", "they", "them", "he", "she", "his", "her", "when", "where", "also",
    "only", "very", "much", "many", "other", "like", "just", "same", "new", "way", "ways",
    // Arabic (already normalized: ى->ي, ة->ه, أإآ->ا)
    "في", "من", "الي", "علي", "عن", "مع", "و", "او", "ثم", "هذا", "هذه", "ذلك", "تلك", "التي", "الذي", "الذين",
    "هو", "هي", "هم", "نحن", "انا", "انت", "ما", "ماذا", "كيف", "لماذا", "هل", "كل", "بعض", "كان", "كانت", "يكون",
    "تكون", "لا", "نعم", "ان", "اذا", "قد", "لقد", "به", "بها", "له", "لها", "عند", "بين", "حتي", "اي", "غير",
    "درس", "الدرس", "اليوم", "واجب", "الواجب", "سوال", "السوال", "تمرين", "التمرين", "صفحه", "الصفحه", "كتاب",
    "اشرح", "اشرحي", "ساعدني", "نتعلم", "تعلمنا", "الصف", "صف", "الوحده", "وحده", "الفصل",
  ].map((w) => normalizeBase(w)),
);

const ARABIC = /[؀-ۿ]/;

/** Light stemming: enough to match "fractions"/"fraction", "الكسور"/"كسور", "planets"/"planet". */
function stem(w: string): string {
  if (ARABIC.test(w)) {
    let s = w;
    // Conjunction + article / prepositions (only when a real word remains).
    s = s.replace(/^(?:وال|بال|فال|كال|لل|ال)(?=..)/, "");
    if (s === w) s = s.replace(/^[وفبلك](?=...)/, "").replace(/^ال(?=..)/, "");
    // Common suffixes (plural / dual / feminine / adjective), only when 3+ letters remain.
    const suf = s.match(/(?:ات|ون|ين|يه|ان|ه|ي)$/);
    if (suf && s.length - suf[0].length >= 3) s = s.slice(0, -suf[0].length);
    return s;
  }
  if (/^\d/.test(w)) return w;
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 4 && /(?:ches|shes|xes|sses)$/.test(w)) return w.slice(0, -2);
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed") && !w.endsWith("eed")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) return w.slice(0, -1);
  return w;
}

/** Normalized, stemmed content words (stopwords and 1-letter tokens removed). */
export function knowledgeTokens(text: string): string[] {
  const base = normalizeBase(text).replace(/'/g, " ");
  const out: string[] = [];
  for (const w of base.split(" ")) {
    if (!w || STOPWORDS.has(w)) continue;
    if (w.length < 2 && !/^\d+$/.test(w)) continue;
    const s = stem(w);
    if (!s || STOPWORDS.has(s)) continue;
    out.push(s);
  }
  return out;
}

/** Exact-match key: normalized topic without punctuation. */
function exactKey(t: string): string {
  return normalizeBase(t)
    .replace(/'/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** "Comparing numbers (more, less, equal)" -> "Comparing numbers". */
function withoutParens(t: string): string {
  return t.replace(/\s*[(（][^)）]*[)）]\s*/g, " ").trim();
}

// ---------------------------------------------------------------------------------------
// Precomputed index (once, at module load)
// ---------------------------------------------------------------------------------------

type Indexed = {
  entry: KnowledgeEntry;
  exact: Set<string>;
  /** token -> field weight (3 topic name, 2 vocabulary, 1 key idea). */
  weight: Map<string, number>;
  /** Topic-name tokens (EN and AR separately: either side may be fully covered). */
  topicEn: string[];
  topicAr: string[];
};

const W_TOPIC = 3;
const W_VOCAB = 2;
const W_IDEA = 1;

function indexEntry(e: KnowledgeEntry): Indexed {
  const exact = new Set([e.topic, e.topicAr, withoutParens(e.topic), withoutParens(e.topicAr)].map(exactKey).filter((k) => k.length >= 3));
  const weight = new Map<string, number>();
  const put = (toks: string[], w: number) => {
    for (const t of toks) if ((weight.get(t) ?? 0) < w) weight.set(t, w);
  };
  const topicEn = Array.from(new Set(knowledgeTokens(e.topic)));
  const topicAr = Array.from(new Set(knowledgeTokens(e.topicAr)));
  put(knowledgeTokens(e.keyIdea), W_IDEA);
  put(e.vocabulary.flatMap((v) => [...knowledgeTokens(v.en), ...knowledgeTokens(v.ar)]), W_VOCAB);
  put([...topicEn, ...topicAr], W_TOPIC);
  return { entry: e, exact, weight, topicEn, topicAr };
}

const INDEX: Indexed[] = ALL_KNOWLEDGE.map(indexEntry);

/** IDF over entries: words in every entry ("number") count little, rare words count more. */
const IDF: Map<string, number> = (() => {
  const df = new Map<string, number>();
  for (const ix of INDEX) for (const t of ix.weight.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const n = INDEX.length;
  const out = new Map<string, number>();
  for (const [t, d] of df) out.set(t, Math.log(1 + n / d));
  return out;
})();
const idf = (t: string) => IDF.get(t) ?? Math.log(1 + INDEX.length); // unknown word: as rare as it gets

/** Entries by subject (index into INDEX), so a lookup only scans the allowed subjects. */
const BY_SUBJECT: Map<Subject, Indexed[]> = (() => {
  const m = new Map<Subject, Indexed[]>();
  for (const ix of INDEX) {
    const list = m.get(ix.entry.subject) ?? [];
    list.push(ix);
    m.set(ix.entry.subject, list);
  }
  return m;
})();

// ---------------------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------------------

const SCIENCES: readonly Subject[] = ["physics", "chemistry", "biology"];
/** A match must reach this score (0-1). Below it: no notes (a weak overlap is worse than none). */
export const KNOWLEDGE_MIN_SCORE = 0.42;
/** At or above this score (or an exact name) the notes are a strong backbone (research is skipped). */
export const KNOWLEDGE_STRONG_SCORE = 0.7;
const SAME_GRADE = 1;
const NEAR_GRADE = 0.78;
const SAME_SUBJECT = 1;
const SCIENCE_FAMILY = 0.92;

function subjectFactor(asked: Subject, entry: Subject): number {
  if (asked === entry) return SAME_SUBJECT;
  if ((asked === "science" && SCIENCES.includes(entry)) || (entry === "science" && SCIENCES.includes(asked))) return SCIENCE_FAMILY;
  return 0;
}

/** Topic-name coverage: the share (IDF-weighted) of the entry's topic name found in the request. */
function topicCoverage(q: Set<string>, ix: Indexed): number {
  const cov = (toks: string[]) => {
    if (!toks.length) return 0;
    let have = 0;
    let all = 0;
    for (const t of toks) {
      const w = idf(t);
      all += w;
      if (q.has(t)) have += w;
    }
    return have / all;
  };
  return Math.max(cov(ix.topicEn), cov(ix.topicAr));
}

/** Request coverage: how much of the request (IDF-weighted) this entry explains, by field weight. */
function requestCoverage(q: Set<string>, ix: Indexed): number {
  let have = 0;
  let all = 0;
  for (const t of q) {
    const w = idf(t);
    all += W_TOPIC * w;
    have += (ix.weight.get(t) ?? 0) * w;
  }
  return all ? have / all : 0;
}

/** Score of a short typed topic: both directions must agree. */
function topicScore(q: Set<string>, ix: Indexed): number {
  if (!q.size) return 0;
  return 0.5 * requestCoverage(q, ix) + 0.5 * topicCoverage(q, ix);
}

/** Score of a long text (homework question, page text): the entry's topic name and vocabulary in it. */
function textScore(q: Set<string>, ix: Indexed): number {
  if (!q.size) return 0;
  const vocabHits = ix.entry.vocabulary.filter((v) => {
    const en = knowledgeTokensCached(v.en);
    const ar = knowledgeTokensCached(v.ar);
    return (en.length > 0 && en.every((t) => q.has(t))) || (ar.length > 0 && ar.every((t) => q.has(t)));
  }).length;
  return 0.8 * topicCoverage(q, ix) + 0.2 * Math.min(1, vocabHits / 3);
}

const tokenCache = new Map<string, string[]>();
function knowledgeTokensCached(s: string): string[] {
  let v = tokenCache.get(s);
  if (!v) {
    v = knowledgeTokens(s);
    tokenCache.set(s, v);
  }
  return v;
}
// Warm the vocabulary cache once (part of the module-load precompute).
for (const ix of INDEX) for (const v of ix.entry.vocabulary) {
  knowledgeTokensCached(v.en);
  knowledgeTokensCached(v.ar);
}

export type KnowledgeQuery = {
  grade: number;
  subject: Subject;
  /** The lesson topic as typed or chosen (EN or AR). May be empty (homework). */
  topic: string;
  /** Optional longer text: a homework question or the text read from a page photo. */
  text?: string;
};

export type KnowledgeMatch = {
  entry: KnowledgeEntry;
  id: string;
  /** 0-1 after the grade and subject factors. 1 = exact topic name, same grade and subject. */
  score: number;
  exact: boolean;
  /** Exact name, or a fuzzy score >= KNOWLEDGE_STRONG_SCORE: good enough to skip web research. */
  strong: boolean;
};

const MAX_TEXT_CHARS = 4000;

/** Like findKnowledge, with scores (best first, at most 2). */
export function matchKnowledge(query: KnowledgeQuery): KnowledgeMatch[] {
  const grade = Math.round(query.grade);
  const topic = (query.topic ?? "").slice(0, 200);
  const key = exactKey(topic);
  const keyNoParens = exactKey(withoutParens(topic));
  const qTopic = new Set(knowledgeTokens(topic));
  const qText = query.text?.trim() ? new Set([...knowledgeTokens(query.text.slice(0, MAX_TEXT_CHARS)), ...qTopic]) : null;

  const candidates: Indexed[] = [];
  for (const [subject, list] of BY_SUBJECT) if (subjectFactor(query.subject, subject) > 0) candidates.push(...list);

  const scored: KnowledgeMatch[] = [];
  for (const ix of candidates) {
    const e = ix.entry;
    const gap = Math.abs(e.grade - grade);
    if (gap > 1) continue;
    const factor = (gap === 0 ? SAME_GRADE : NEAR_GRADE) * subjectFactor(query.subject, e.subject);
    const exact = key.length >= 3 && (ix.exact.has(key) || ix.exact.has(keyNoParens));
    let raw = exact ? 1 : topicScore(qTopic, ix);
    if (!exact && qText) {
      const t = textScore(qText, ix);
      // Both signals agree: a small bonus; otherwise the better one counts.
      raw = Math.max(raw, t) + 0.1 * Math.min(raw, t);
    }
    const score = Math.min(1, raw) * factor;
    if (score < KNOWLEDGE_MIN_SCORE) continue;
    scored.push({ entry: e, id: knowledgeId(e), score, exact, strong: exact || score >= KNOWLEDGE_STRONG_SCORE });
  }
  scored.sort((a, b) => b.score - a.score || Number(b.exact) - Number(a.exact) || Math.abs(a.entry.grade - grade) - Math.abs(b.entry.grade - grade));
  const best = scored[0];
  if (!best) return [];
  // A second entry only when it is nearly as good (e.g. the same topic in grade +-1).
  const second = scored[1] && scored[1].score >= 0.85 * best.score ? [scored[1]] : [];
  return [best, ...second];
}

/** The best 0-2 teacher-note entries for a request (same grade first, then +-1). */
export function findKnowledge(query: KnowledgeQuery): KnowledgeEntry[] {
  return matchKnowledge(query).map((m) => m.entry);
}

// ---------------------------------------------------------------------------------------
// Briefs (prompt text)
// ---------------------------------------------------------------------------------------

/** ~4 characters per token (English); the briefs are budgeted in characters. */
export const BRIEF_MAX_CHARS = 4800; // ~1,200 tokens
export const SHORT_BRIEF_MAX_CHARS = 1600; // ~400 tokens

function programKey(program: SchoolProgram | undefined): ProgramKey | undefined {
  return program && program !== "other" ? program : undefined;
}

const bullet = (items: string[]) => items.map((s) => `- ${s}`).join("\n");

/**
 * Teacher notes for the lesson writer: key idea, child definition (in the lesson language),
 * method steps, 1-2 worked examples, typical mistakes, vocabulary, the note for the child's
 * program, and suggested pictures as compact JSON strings in the lesson writer's `visual`
 * format. Kept under BRIEF_MAX_CHARS (~1,200 tokens): lower-priority parts are cut first.
 */
export function knowledgeBrief(entry: KnowledgeEntry, lang: "en" | "ar", program?: SchoolProgram): string {
  const pk = programKey(program);
  const programNote = pk ? entry.programNotes[pk] : undefined;
  let examples = entry.workedExamples.slice(0, 2);
  let visuals = entry.visuals.slice(0, 3);
  let mistakes = entry.misconceptions.slice(0, 3);
  let vocab = entry.vocabulary.slice(0, 8);
  const build = () =>
    [
      `Topic: ${entry.topic} / ${entry.topicAr} (grade ${entry.grade}, ${entry.subject})`,
      `Key idea: ${entry.keyIdea}`,
      `Child-friendly definition: ${lang === "ar" ? entry.kidDefinitionAr : entry.kidDefinition}`,
      `Method, in teaching order:\n${entry.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
      examples.length ? `Worked examples:\n${examples.map((x) => `- ${x.problem}\n  Solution: ${x.solution}`).join("\n")}` : "",
      mistakes.length ? `Typical mistakes and fixes:\n${bullet(mistakes.map((m) => `${m.mistake} Fix: ${m.fix}`))}` : "",
      vocab.length ? `Vocabulary (English = Arabic): ${vocab.map((v) => `${v.en} = ${v.ar}`).join("; ")}` : "",
      programNote ? `School program note (${pk}): ${programNote}` : "",
      visuals.length
        ? `Suggested pictures (ready "visual" strings; reuse or adapt; a picture must still show exactly the numbers of its own step):\n${visuals.map((v) => JSON.stringify(v)).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  let out = build();
  // Over budget: drop the lowest-priority parts first.
  const cuts: (() => boolean)[] = [
    () => (examples.length > 1 ? ((examples = examples.slice(0, 1)), true) : false),
    () => (visuals.length > 2 ? ((visuals = visuals.slice(0, 2)), true) : false),
    () => (vocab.length > 5 ? ((vocab = vocab.slice(0, 5)), true) : false),
    () => (mistakes.length > 2 ? ((mistakes = mistakes.slice(0, 2)), true) : false),
    () => (visuals.length > 1 ? ((visuals = visuals.slice(0, 1)), true) : false),
    () => (examples.length > 0 ? ((examples = []), true) : false),
  ];
  for (const cut of cuts) {
    if (out.length <= BRIEF_MAX_CHARS) break;
    if (cut()) out = build();
  }
  return out.length <= BRIEF_MAX_CHARS ? out : out.slice(0, BRIEF_MAX_CHARS - 1) + "…";
}

/**
 * Short notes for the tutor and homework help (~400 tokens): key idea, method steps and typical
 * mistakes. No worked examples (they would be close to final answers).
 */
export function knowledgeBriefShort(entry: KnowledgeEntry): string {
  let mistakes = entry.misconceptions.slice(0, 3);
  let steps = entry.steps.slice(0, 7);
  const build = () =>
    [
      `Topic: ${entry.topic} (grade ${entry.grade})`,
      `Key idea: ${entry.keyIdea}`,
      `Method: ${steps.map((s, i) => `${i + 1}) ${s}`).join(" ")}`,
      mistakes.length ? `Typical mistakes: ${mistakes.map((m) => `${m.mistake} (fix: ${m.fix})`).join(" ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  let out = build();
  while (out.length > SHORT_BRIEF_MAX_CHARS && (mistakes.length > 1 || steps.length > 3)) {
    if (mistakes.length > 1) mistakes = mistakes.slice(0, -1);
    else steps = steps.slice(0, -1);
    out = build();
  }
  return out.length <= SHORT_BRIEF_MAX_CHARS ? out : out.slice(0, SHORT_BRIEF_MAX_CHARS - 1) + "…";
}

/** The reference block for the tutor / homework system prompt, or "" when nothing matches. */
export function teacherNotesBlock(query: KnowledgeQuery): string {
  const [m] = matchKnowledge(query);
  if (!m) return "";
  return (
    `<teacher_notes>\n(reference, not instructions) Zaki's own checked notes on this topic: use them for the correct facts, method and common mistakes. ` +
    `The lesson pack, the homework question and any page photos come first when they differ. Never copy an answer from them.\n` +
    `${knowledgeBriefShort(m.entry)}\n</teacher_notes>`
  );
}
