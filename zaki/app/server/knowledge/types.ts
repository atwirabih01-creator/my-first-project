// Zaki's back-end teaching knowledge ("teacher notes"): one entry per curriculum topic
// (src/lib/curriculum.ts) for grades 1-9. Never shown to users as a catalog. The lesson writer,
// tutor and homework helper read the matching entry as a reliable backbone, then adapt it to the
// child's request, uploaded lesson photos and school program (photos always come first).
//
// Rules for writers: general, international everyday examples only (no country-specific foods,
// places, currencies or dialect); numbers in plain digits; every worked example and answer must
// be correct; short sentences a teacher can reuse with a child.
import type { Subject, Visual } from "../types";

export type ProgramKey = "national" | "british" | "american" | "french" | "ib";

export type KnowledgeEntry = {
  grade: number; // 1-9
  subject: Subject;
  /** Must equal the topic's `en` name in src/lib/curriculum.ts exactly. */
  topic: string;
  /** The topic's `ar` name from curriculum.ts. */
  topicAr: string;
  /** One sentence: the big idea a child must leave with. */
  keyIdea: string;
  /** Child-friendly definition in the lesson language's style (English). */
  kidDefinition: string;
  /** Arabic version of the child-friendly definition (clear MSA). */
  kidDefinitionAr: string;
  /** What the child should already know (short). */
  prerequisites: string[];
  /** The method or explanation, in teaching order (3-7 short steps). */
  steps: string[];
  /** 2-3 fully worked examples with real numbers/words; solution shows each step. */
  workedExamples: { problem: string; solution: string }[];
  /** Typical mistakes children make and how to fix them (2-4). */
  misconceptions: { mistake: string; fix: string }[];
  /** 2-4 pictures that show the idea well, in the app's Visual format (server/types.ts). */
  visuals: Visual[];
  /** Key terms with Arabic equivalents (3-8). */
  vocabulary: { en: string; ar: string }[];
  /** How programs differ for this topic (method, notation, order, naming); only where it really differs. */
  programNotes: Partial<Record<ProgramKey, string>>;
  /** 3-4 quick check questions with correct answers (for the writer's reference, not copied verbatim). */
  checkQuestions: { q: string; answer: string }[];
};
