// Shared server types. LessonPack / Question follow ARCHITECTURE.md exactly.

export type Lang = "en" | "ar";
export type Country = "LB" | "QA";
export type Subject = "math" | "science" | "english" | "arabic" | "social";

export const SUBJECTS: readonly Subject[] = ["math", "science", "english", "arabic", "social"];

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

export type RecapItem = { q: string; choices: string[]; answerIndex: number };

export type LessonPack = {
  id: string;
  subject: Subject;
  topic: string;
  grade: number;
  lang: Lang;
  recap: RecapItem[];
  teachSteps: { text: string; example?: string }[];
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
  | "personal_data"
  | "adult_topic"
  | "prompt_injection"
  | "off_topic";

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
};
