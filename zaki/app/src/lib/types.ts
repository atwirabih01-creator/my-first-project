// Shared app-side types. The LessonPack / Question shapes follow ARCHITECTURE.md exactly.
import type { SchoolCountry, SchoolProgram, TeachStep } from '../../server/types';

export type Lang = 'en' | 'ar';
export type Country = 'LB' | 'QA';
/** physics / chemistry / biology are for grades 7-9 (see src/lib/curriculum.ts). */
export type Subject = 'math' | 'science' | 'physics' | 'chemistry' | 'biology' | 'english' | 'arabic' | 'social';

export type Question = {
  id: string;
  q: string;
  choices: string[];
  answerIndex: number;
  hint1: string;
  hint2: string;
  similarExample: string;
  kind?: 'math' | 'text';
  mathExpr?: string;
};

/**
 * Teach-step pictures and "Try it!" questions (pack version 4). The shapes come straight from
 * the server (server/types.ts: plain types, nothing runs). The app checks every field again
 * before drawing (src/lib/visuals.ts): anything it does not understand is simply not shown.
 */
export type { TeachStep, TryIt, Visual, VisualItem } from '../../server/types';

/**
 * The child's SCHOOL country and program (round 7, both optional). Zaki then teaches in that
 * program's order, method, notation and terms. Not the family `Country` (help lines, consent).
 */
export type { SchoolCountry, SchoolProgram } from '../../server/types';

export type LessonPack = {
  id: string;
  subject: Subject;
  topic: string;
  grade: number;
  lang: Lang;
  recap: { q: string; choices: string[]; answerIndex: number }[];
  /** `title` (optional): a short heading for the step, e.g. "What is a fraction?" (server C1).
   *  `visual` / `tryIt` (pack version 4): a picture and a small "Try it!" question for the step. */
  teachSteps: TeachStep[];
  checks: Question[];
  test: Question[];
  retestPool: Question[];
  summary: string[];
  flashcards: { front: string; back: string }[];
};

export type Source = { title: string; url?: string };

export type Safety = { flagged: boolean; category?: string; showSafetyScreen?: boolean; route?: 'reviewer' | 'parent'; involvesHome?: boolean };

export type AvatarId = 'lion' | 'fox' | 'cat' | 'panda' | 'turtle' | 'rocket' | 'star' | 'owl';

export type ChildProfile = {
  id: string; // random childRef, never a name
  nickname: string; // first name or nickname only, never a full name
  grade: number; // 1-9
  /** 5-16. Optional: older profiles have none (then grade + 5 is assumed, see curriculum.effectiveAge). */
  age?: number;
  lang: Lang;
  avatar: AvatarId;
  createdAt: string;
  /** Country of the child's school (optional; older profiles have none). NOT the family country. */
  schoolCountry?: SchoolCountry;
  /** The child's school program (optional; older profiles have none = general approach). */
  program?: SchoolProgram;
};

export type ChildSettings = {
  dailyLimitMin: number; // default 30
  studyTime: string; // "17:00"
  reportLang: Lang;
  country: Country;
  dyslexiaFont: boolean;
  paused: boolean;
};

export type PlanItem = {
  id: string;
  subject: Subject;
  topic: string;
  kind: 'lesson' | 'test';
  dueDate?: string; // YYYY-MM-DD for tests
  addedAt: string;
  packKey?: string; // lesson key for a cached pack
  sessions?: number;
  /** Grown-up unlocked this lesson early (pass-to-unlock override). */
  unlocked?: boolean;
  /** Waiting for tomorrow: today's AI limit was reached when it was added. */
  pending?: boolean;
};

export type TestResult = {
  lessonKey: string;
  date: string; // YYYY-MM-DD
  at: string; // ISO time
  score: number;
  total: number;
  passed: boolean;
  seconds: number;
  attempt: number; // 1 = first test, 2-3 = retests that day
};

export type LessonRecord = {
  key: string;
  subject: Subject;
  topic: string;
  startedAt: string;
  passDates: string[]; // distinct YYYY-MM-DD dates passed
  wrongChecks: number;
  needsGrownUp?: boolean; // used all retries today
  lastActivity: string;
};

export type Session = { date: string; minutes: number; lessonKey?: string; at: string };

export type AnswerReport = { at: string; lessonKey?: string; text: string };

export type ChildProgress = {
  stars: number;
  lessons: Record<string, LessonRecord>;
  tests: TestResult[];
  sessions: Session[];
  usage: Record<string, number>; // date -> minutes used
  reports: AnswerReport[];
  bestTestSeconds: Record<string, number>;
  examResults?: ExamResult[];
};

export type CachedPack = {
  pack: LessonPack;
  sources: Source[];
  savedAt: string;
  demo: boolean;
  /** Lesson rules version the pack was made with (server `packVersion`). Missing = 1 (made before versions). */
  packVersion?: number;
  /** Already re-made once under these rules (MIN_PACK_VERSION): never re-fetched again for the same rules. */
  refreshedFor?: number;
  /** Made from page photos: the photos are not kept, so it is never re-made from the topic name alone. */
  fromPhotos?: boolean;
};

/**
 * Homework photos a grown-up took for one child (parent area -> child home).
 * Kept ON THIS DEVICE only. `photos` are storage refs (see src/lib/homeworkPhotos.ts), never the
 * pictures themselves, so the main saved state stays small. Removed when the child taps
 * "I finished", when the grown-up deletes it, or 30 days after it was added.
 */
export type HomeworkTask = {
  id: string;
  subject: Subject;
  /** Optional note from the grown-up for Zaki (max 300), e.g. "only exercise 3". */
  note?: string;
  photos: string[];
  createdAt: string; // ISO time
};

export type LessonStatus = 'new' | 'learning' | 'learned' | 'mastered';

export type ExamQuestion = Question & { lessonKey: string };

/** A combined exam the grown-up built from several saved lessons (parent area). */
export type Exam = {
  id: string;
  subject: Subject;
  title: string;
  date: string; // YYYY-MM-DD
  lessonKeys: string[];
  lessonTopics: Record<string, string>;
  questions: ExamQuestion[];
  createdAt: string;
  addedByAi?: number;
};

export type ExamResult = {
  examId: string;
  date: string;
  at: string;
  score: number;
  total: number;
  seconds: number;
  practice: boolean;
  perLesson: Record<string, { correct: number; total: number }>;
};

/** Family consent (once per family, before any lesson or AI use). First names only. */
export type ConsentRecord = {
  version: string;
  at: string; // ISO time
  date: string; // YYYY-MM-DD shown on the form
  mode: 'two-guardians' | 'one-with-agreement';
  guardians: { firstName: string; relationship: string }[];
  /** One guardian confirmed the other guardian agrees (or that they are the only legal guardian). */
  otherGuardianAgrees?: boolean;
  withdrawnAt?: string;
};

/** A safety flag kept on this device (demo/offline). route "reviewer" is NEVER shown to parents. */
export type LocalFlag = {
  id: string;
  ts: string;
  category: string;
  route: 'reviewer' | 'parent';
  /** Who seems involved: someone at home, someone outside the home, or unclear. */
  involvement?: 'home' | 'outside' | 'unclear';
  childRef?: string;
  excerpt: string;
  status: 'new' | 'seen' | 'referred' | 'resolved';
  note?: string;
  /** No safety screen was shown (calm line only: sensitive topic, or the child's own fear). */
  noScreen?: boolean;
};
