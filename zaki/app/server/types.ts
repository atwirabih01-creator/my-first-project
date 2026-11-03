// Shared server types. LessonPack / Question follow ARCHITECTURE.md exactly.

export type Lang = "en" | "ar";
export type Country = "LB" | "QA";
/** physics / chemistry / biology are for grades 7-9 (for grades 1-6 "science" covers them). */
export type Subject = "math" | "science" | "physics" | "chemistry" | "biology" | "english" | "arabic" | "social";

export const SUBJECTS: readonly Subject[] = ["math", "science", "physics", "chemistry", "biology", "english", "arabic", "social"];

export type Question = {
  id: string;
  q: string;
  choices: string[];
  answerIndex: number;
  hint1: string;
  hint2: string;
  similarExample: string;
  kind?: "math" | "text";
  mathExpr?: string;
};

/** One teach step. `title` (pack version 3+) is a short kid-friendly heading, e.g. "What is a fraction?". */
export type TeachStep = { title?: string; text: string; example?: string };

export type RecapItem = { q: string; choices: string[]; answerIndex: number };

export type LessonPack = {
  id: string;
  subject: Subject;
  topic: string;
  grade: number;
  lang: Lang;
  recap: RecapItem[];
  teachSteps: TeachStep[];
  checks: Question[];
  test: Question[];
  retestPool: Question[];
  summary: string[];
  flashcards: { front: string; back: string }[];
};

export type SafetyCategory =
  | "none"
  | "disclosure_harm"
  | "self_harm"
  | "sexual"
  | "violence_fear"
  | "help_request"
  | "personal_data"
  | "adult_topic"
  | "prompt_injection"
  | "off_topic"
  /** Politics, war as a subject, armed groups, religion/sect rulings, adult subjects: fixed
   *  "not part of our lessons" line, no safety screen, flagged, route "parent" (reviewer when
   *  someone at home is involved). */
  | "sensitive_topic";

/** Which set of help routes the app should show on the safety screen. */
export type HelpRouteKind = "home" | "self_harm" | "fear" | "general";

/** The `safety` object returned to the app (superset of the ARCHITECTURE.md contract). */
export type SafetyInfo = {
  flagged: boolean;
  category?: SafetyCategory;
  showSafetyScreen?: boolean;
  /** true = someone at home/family may be involved: the app must NOT alert the parent. */
  involvesHome?: boolean;
  /** Only true when it is OK to tell the parent (never when involvesHome or unclear). */
  alertParent?: boolean;
  /** "urgent" for danger/abuse/self-harm, "calm" for fear/sadness. */
  alertLevel?: "urgent" | "calm";
  /** Always true for flagged items: an independent reviewer sees it. */
  reviewerQueue?: boolean;
  helpRouteKind?: HelpRouteKind;
  /** Who is told when flagged: "reviewer" (independent reviewer only) or "parent"
   *  (parent AND reviewer). Always "reviewer" when involvesHome is true or unclear. */
  route?: "reviewer" | "parent";
};
