// Zaki storage: one interface, two back ends.
//  - fileStore     : today's behaviour (JSON files under server/data, gitignored). Default.
//  - supabaseStore : the private online database, switched on by env vars
//                    (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY). Server only.
// Data rules (plan 8.2, safety review): no surnames, school, location, photos, phone or email.
// Children are known by a random childRef; flags carry only a category + scrubbed excerpt.
import type { LibraryEntry } from "../library";
import type { Country, Lang, SafetyCategory, Subject } from "../types";

export type { LibraryEntry };

export type StorageKind = "file" | "supabase";

// ---------------------------------------------------------------- safety flags
export type FlagRoute = "reviewer" | "parent";
export type FlagStatus = "pending_review" | "reviewed" | "referred" | "closed";

export type FlagInput = {
  category: SafetyCategory | "politics" | "other";
  /** "reviewer" whenever someone at home may be involved or it is unclear (R3). */
  route: FlagRoute;
  involvesHome: boolean;
  alertLevel?: "urgent" | "calm";
  speaker: "child" | "tutor" | "parent";
  lang?: Lang;
  country?: Country;
  layers: string[];
  /** Random app-side id only. Never a name. */
  childRef?: string;
  familyId?: string;
  /** Short, PII-scrubbed excerpt (max 200 chars). */
  excerpt: string;
};

export type StoredFlag = FlagInput & {
  id: string;
  ts: string;
  status: FlagStatus;
  sharedWithParent: boolean;
  reviewerNote?: string;
  reviewedAt?: string;
};

export type FlagReview = { status: FlagStatus; reviewerNote?: string; sharedWithParent?: boolean; reviewer?: string };

// ---------------------------------------------------------------- budget
export type SpendPurpose = "lesson" | "tutor" | "safety";
export type BudgetDay = { date: string; spentUsd: number; byPurpose: Record<SpendPurpose, number> };

// ---------------------------------------------------------------- families
export type Relationship = "mother" | "father" | "guardian" | "other";

export type Family = {
  id: string;
  createdAt: string;
  /** Set by the parent; null = not set. Never from location. */
  country: Country | null;
  reportLang: Lang;
  settings: Record<string, unknown>;
};

export type Guardian = { id: string; familyId: string; firstName: string; relationship: Relationship; createdAt: string };

export type ConsentKind = "main" | "ai_processing" | "extra_sharing";
export type Consent = {
  id: string;
  familyId: string;
  guardianId?: string;
  kind: ConsentKind;
  version: string;
  method: "in_app_gate" | "paper" | "whatsapp";
  givenAt: string;
  withdrawnAt?: string;
};

export type Child = {
  familyId: string;
  /** Random id used everywhere (API `childRef`). */
  childRef: string;
  nickname: string;
  grade: number;
  lang: Lang;
  avatar: string;
  dailyLimitMin: number;
};

// ---------------------------------------------------------------- progress sync
// Shapes mirror src/lib/types.ts (PlanItem, TestResult, Session, Exam, ExamResult, ChildProgress)
// so the app can send what it already keeps on the phone.
export type SyncPlanItem = {
  id: string;
  subject: Subject;
  topic: string;
  kind: "lesson" | "test";
  dueDate?: string;
  addedAt: string;
  packKey?: string;
  sessions?: number;
  unlocked?: boolean;
  pending?: boolean;
  status?: "new" | "learning" | "learned" | "mastered" | "pending";
};

export type SyncTestResult = {
  lessonKey: string;
  date: string;
  at: string;
  score: number;
  total: number;
  passed: boolean;
  seconds: number;
  attempt: number;
  /** Optional per-question results. */
  perQuestion?: { id: string; correct: boolean; tries?: number }[];
};

export type SyncSession = { date: string; minutes: number; lessonKey?: string; at: string };

export type SyncExamResult = {
  examId: string;
  date: string;
  at: string;
  score: number;
  total: number;
  seconds: number;
  practice: boolean;
  perLesson: Record<string, { correct: number; total: number }>;
};

export type SyncExam = {
  id: string;
  subject: Subject;
  title: string;
  date: string;
  lessonKeys: string[];
  lessonTopics: Record<string, string>;
  questions: unknown[];
  createdAt: string;
  addedByAi?: number;
};

export type SyncPack = {
  packKey: string;
  subject: Subject;
  topic: string;
  grade: number;
  lang: Lang;
  source: "typed" | "photo";
  /** Only for typed packs; always dropped for photo packs. */
  libraryKey?: string;
  pack: unknown;
  sources: { title: string; url?: string }[];
  demo?: boolean;
  savedAt?: string;
};

export type SyncChat = { at: string; role: "child" | "zaki"; kind?: "chat" | "answer_report"; lessonKey?: string; text: string };

/** Everything the phone keeps for one child; sent whole and stored idempotently. */
export type ProgressSnapshot = {
  plan: SyncPlanItem[];
  tests: SyncTestResult[];
  sessions: SyncSession[];
  exams: SyncExam[];
  examResults: SyncExamResult[];
  packs?: SyncPack[];
  /** PII-scrubbed chat text and answer reports (deleted after ~90 days). */
  chat?: SyncChat[];
  /** Small non-personal leftovers: stars, per-lesson records, usage, best times. */
  state: { stars?: number; lessons?: Record<string, unknown>; usage?: Record<string, number>; bestTestSeconds?: Record<string, number> };
};

export type FamilyExport = {
  exportedAt: string;
  storage: StorageKind;
  data: unknown;
};

export type RetentionReport = { chat: number; flags: number; photos: number; other: number };

export const RETENTION = { chatDays: 90, photoDays: 30, reviewedFlagDays: 30 } as const;

// ---------------------------------------------------------------- the interface
export interface ZakiStore {
  readonly kind: StorageKind;

  // Safety flags (reviewer queue). Parents never get reviewer-route flags from here.
  addFlag(f: FlagInput): Promise<StoredFlag>;
  listFlags(opts?: { status?: FlagStatus }): Promise<StoredFlag[]>;
  reviewFlag(id: string, review: FlagReview): Promise<StoredFlag | null>;
  /** Words-free alert list for one family: route "parent" (or shared by the reviewer). */
  parentAlerts(familyId: string): Promise<{ id: string; ts: string; category: string; status: FlagStatus; childRef?: string }[]>;

  // Shared lesson library (typed topics only, no family link).
  libraryGet(key: string): Promise<LibraryEntry | null>;
  libraryPut(entry: LibraryEntry): Promise<void>;

  // Daily AI spending cap.
  budgetGet(day: string): Promise<BudgetDay>;
  /** Adds spend; returns the new day total. */
  budgetAdd(day: string, purpose: SpendPurpose, usd: number): Promise<number>;
  /** One Ask-Zaki AI turn; false (nothing counted) when the cap is reached. */
  childTurnTake(day: string, childRef: string, limit: number): Promise<boolean>;

  // Families, grown-ups, consent, children, progress.
  createFamily(input: { country?: Country | null; reportLang?: Lang; guardian: { firstName: string; relationship: Relationship } }): Promise<{ family: Family; guardian: Guardian }>;
  getFamily(familyId: string): Promise<Family | null>;
  addConsent(familyId: string, c: { kind?: ConsentKind; version: string; method?: Consent["method"]; guardianId?: string }): Promise<Consent>;
  withdrawConsent(familyId: string, consentId: string): Promise<boolean>;
  upsertChild(child: Omit<Child, "childRef"> & { childRef?: string }): Promise<Child>;
  listChildren(familyId: string): Promise<Child[]>;
  syncProgress(familyId: string, childRef: string, snap: ProgressSnapshot): Promise<void>;
  getProgress(familyId: string, childRef: string): Promise<ProgressSnapshot | null>;

  // Parent rights: export everything, delete everything (answer within 10 days).
  exportFamily(familyId: string): Promise<FamilyExport | null>;
  deleteFamily(familyId: string): Promise<boolean>;

  /** Daily clean-up: chat ~90 days, photos ~30 days, reviewed flags ~30 days after review. */
  runRetention(now?: Date): Promise<RetentionReport>;
}

// ---------------------------------------------------------------- shared checks
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CHILD_REF_RE = /^[A-Za-z0-9_-]{8,64}$/;

export function assertFamilyId(id: string): void {
  if (typeof id !== "string" || !UUID_RE.test(id)) throw new StorageError("bad_family_id");
}
export function assertChildRef(ref: string): void {
  if (typeof ref !== "string" || !CHILD_REF_RE.test(ref)) throw new StorageError("bad_child_ref");
}
/** First names / nicknames: short, one line, no digits/@ (keeps phone numbers and emails out). */
export function cleanName(name: string, max: number, allowDigits = false): string {
  const n = String(name ?? "").replace(/\s+/g, " ").trim();
  if (!n || n.length > max || /[@\n\r]/.test(n) || (!allowDigits && /\d/.test(n))) throw new StorageError("bad_name");
  return n;
}
export function newChildRef(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export class StorageError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "StorageError";
  }
}

/** Old flag lines from server/safety.ts have no `route`: derive it with the R3 rule. */
export function routeOf(f: { route?: FlagRoute; alertParent?: boolean; involvesHome?: boolean }): FlagRoute {
  if (f.route === "parent" || f.route === "reviewer") return f.route;
  return f.alertParent && !f.involvesHome ? "parent" : "reviewer";
}
