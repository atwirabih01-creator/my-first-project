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
};

export type CachedPack = { pack: LessonPack; sources: Source[]; savedAt: string; demo: boolean };

export type LessonStatus = 'new' | 'learning' | 'learned' | 'mastered';
