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

// ---------------------------------------------------------------------------------------
// Pictures for teach steps (pack version 4+). The app draws them itself (no images are
// downloaded). Labels are in the lesson language; numbers are plain digits (0-9).
// Every field and range is re-checked by server/visuals.ts; a bad picture is dropped (the
// step is kept).
// ---------------------------------------------------------------------------------------

export type VisualShape2D = "circle" | "bar";
/** One emoji + a short label (sequence and labeled pictures). */
export type VisualItem = { emoji: string; label: string };
/** A whole cut into `parts` equal parts, `shaded` of them coloured. */
export type FractionPart = { parts: number; shaded: number };

/** A pizza circle or a bar cut into 2-12 equal parts, 0..parts shaded. A fraction-looking
 *  `label` always equals `${shaded}/${parts}`. `interactive`: the child taps pieces to shade
 *  `shaded` of them. */
export type FractionVisual = { type: "fraction"; shape: VisualShape2D; parts: number; shaded: number; label?: string; interactive?: boolean };
/** Two same-size wholes side by side, to compare two fractions. */
export type FractionCompareVisual = { type: "fractionCompare"; a: FractionPart; b: FractionPart; shape: VisualShape2D };
/** `count` (1-20) copies of one emoji. `groups` splits them into equal groups (divides
 *  count); `crossedOut` (0..count) shows taking away. `interactive`: tap to count. */
export type ObjectsVisual = { type: "objects"; emoji: string; count: number; groups?: number; crossedOut?: number; label?: string; interactive?: boolean };
/** Tokens like ["3","+","4","=","7"] (max 9, each <= 6 chars). Arithmetic is re-checked. */
export type EquationVisual = { type: "equation"; parts: string[]; highlight?: number };
/** A number line from..to in steps (max 20 steps), with marked points and jump arrows. */
export type NumberLineVisual = { type: "numberLine"; from: number; to: number; step: number; marks?: number[]; jumps?: { from: number; to: number }[] };
/** 2-6 items shown with arrows between them (processes, life cycles). */
export type SequenceVisual = { type: "sequence"; items: VisualItem[] };
/** 2-6 labelled items (parts of something, groups, a vocabulary set). */
export type LabeledVisual = { type: "labeled"; items: VisualItem[] };
/** 2-6 bars, values 0-100. */
export type BarsVisual = { type: "bars"; bars: { label: string; value: number; emoji?: string }[] };
/** A clock face: hour 1-12, minute 0, 5, ... 55. */
export type ClockVisual = { type: "clock"; hour: number; minute: number };
export type ShapeName = "triangle" | "square" | "rectangle" | "circle" | "pentagon" | "hexagon";
/** A flat shape; `sideLabels` at most one per side. */
export type ShapeVisual = { type: "shape"; shape: ShapeName; sideLabels?: string[] };
/** Hundreds / tens / ones blocks for a number 1-999. */
export type PlaceValueVisual = { type: "placeValue"; number: number };
/** A vocabulary card: the word, an emoji and a short meaning. */
export type WordCardVisual = { type: "wordCard"; word: string; emoji: string; meaning: string };

/** One picture for a teach step, discriminated by `type`. */
export type Visual =
  | FractionVisual
  | FractionCompareVisual
  | ObjectsVisual
  | EquationVisual
  | NumberLineVisual
  | SequenceVisual
  | LabeledVisual
  | BarsVisual
  | ClockVisual
  | ShapeVisual
  | PlaceValueVisual
  | WordCardVisual;
export type VisualType = Visual["type"];
export const VISUAL_TYPES: readonly VisualType[] = [
  "fraction", "fractionCompare", "objects", "equation", "numberLine", "sequence",
  "labeled", "bars", "clock", "shape", "placeValue", "wordCard",
];

/** A quick, easy question right after a teach step (no score). 2-4 unique choices;
 *  `explain` is one short sentence shown after answering. Never repeats a check/test item. */
export type TryIt = { q: string; choices: string[]; answerIndex: number; explain: string };

/** One teach step. `title` (pack version 3+) is a short kid-friendly heading, e.g. "What is a
 *  fraction?". `visual` and `tryIt` (pack version 4+) are optional. */
export type TeachStep = { title?: string; text: string; example?: string; visual?: Visual; tryIt?: TryIt };

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
