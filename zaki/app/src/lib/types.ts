// Shared app-side types. The LessonPack / Question shapes follow ARCHITECTURE.md exactly.

export type Lang = 'en' | 'ar';
export type Country = 'LB' | 'QA';
export type Subject = 'math' | 'science' | 'english' | 'arabic' | 'social';

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

export type LessonPack = {
  id: string;
  subject: Subject;
  topic: string;
  grade: number;
  lang: Lang;
  recap: { q: string; choices: string[]; answerIndex: number }[];
  teachSteps: { text: string; example?: string }[];
  checks: Question[];
  test: Question[];
  retestPool: Question[];
  summary: string[];
  flashcards: { front: string; back: string }[];
};

export type Source = { title: string; url?: string };

export type Safety = { flagged: boolean; category?: string; showSafetyScreen?: boolean };

export type AvatarId = 'lion' | 'fox' | 'cat' | 'panda' | 'turtle' | 'rocket' | 'star' | 'owl';

export type ChildProfile = {
  id: string; // random childRef, never a name
  nickname: string;
  grade: number; // 1-6
  lang: Lang;
  avatar: AvatarId;
  createdAt: string;
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

export type CachedPack = { pack: LessonPack; sources: Source[]; savedAt: string; demo: boolean };

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
  childRef?: string;
  excerpt: string;
  status: 'new' | 'seen' | 'referred' | 'resolved';
  note?: string;
};
