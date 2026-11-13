// SCHOOL PROGRAM GUIDE (founder request, round 7): a short note for the lesson writer, the
// tutor and homework help, so Zaki teaches in the ORDER, METHOD, NOTATION and TERMS of the
// child's school program (French, British, American, IB, or the national program of the
// school's country). It never changes the examples: they stay general and international
// (promptRules.GENERAL_EXAMPLES_RULE), and country names never appear in lesson content
// (server/regionalWords.ts still checks every lesson and reply).
// No program, or "other" = today's behaviour: no guide at all (empty string).
// Kept short on purpose: it is sent with every lesson request and every chat turn.

import type { SchoolCountry, SchoolProgram } from "./types";

/** English names, used ONLY inside the prompt (to say which national program). */
const COUNTRY_NAMES: Record<Exclude<SchoolCountry, "OTHER">, string> = {
  LB: "Lebanon",
  IQ: "Iraq",
  SY: "Syria",
  JO: "Jordan",
  PS: "Palestine",
  EG: "Egypt",
  SA: "Saudi Arabia",
  AE: "the United Arab Emirates",
  QA: "Qatar",
  KW: "Kuwait",
  BH: "Bahrain",
  OM: "Oman",
};

/** Always sent with a guide: photos of the child's own lesson win. */
export const PHOTOS_OVERRIDE_RULE = "Uploaded photos of the child's lesson override the program guide.";

const KEEP_GENERAL =
  "The program changes only METHOD, ORDER, NOTATION and TERMS: examples stay general and international, and never write a country, city or program name in the lesson.";

export type ProgramGuideFor = "lesson" | "chat";

function body(program: Exclude<SchoolProgram, "other">, schoolCountry: SchoolCountry | undefined, forWhat: ProgramGuideFor): string {
  const lesson = forWhat === "lesson";
  switch (program) {
    case "french":
      return (
        "French program (school years CP=1, CE1=2, CE2=3, CM1=4, CM2=5, 6e=6, 5e=7, 4e=8, 3e=9). " +
        `Decimal comma (3,5) and a space for thousands (12 500)${lesson ? " in texts and choices (mathExpr still uses a dot)" : ""}. ` +
        "Written division the French way (division posée). Use the French school terms for the topic, said in the lesson language."
      );
    case "british":
      return (
        "British program (Year N = grade N-1, e.g. Year 4 = grade 3; say \"Year\" if you name the school year). " +
        "Column addition and subtraction, short division with the bus-stop method, \"times tables\". " +
        "Money in pence/£ only if the child's photos use it; otherwise just \"coins\"."
      );
    case "american":
      return "American program: the usual US order of topics for this grade, decimal point (3.5), long division with the standard algorithm, US school terms (e.g. \"regrouping\").";
    case "ib":
      return "IB program: inquiry style, concept first. Start from a question the child can wonder about, let the child notice the idea, then name the concept and link it to real life.";
    case "national": {
      const name = schoolCountry && schoolCountry !== "OTHER" ? COUNTRY_NAMES[schoolCountry] : "the child's country";
      return (
        `National program of ${name}: follow the usual order and methods of its school books for this grade. ` +
        "Arabic lessons: the usual Arabic school terms (e.g. البسط، المقام، ناتج الجمع). " +
        `Digits 0-9; Eastern Arabic digits (٣٤٥) ONLY if the uploaded page uses them${lesson ? " (never in mathExpr or pictures)" : ""}.`
      );
    }
  }
}

/**
 * The program guide for a prompt, or "" when there is nothing to adapt (no program, or
 * "other": the general international approach, exactly as before).
 */
export function programGuide(program: SchoolProgram | undefined, schoolCountry: SchoolCountry | undefined, forWhat: ProgramGuideFor = "lesson"): string {
  if (!program || program === "other") return "";
  return `${body(program, schoolCountry, forWhat)} ${KEEP_GENERAL} ${PHOTOS_OVERRIDE_RULE}`;
}

/** French program: numbers are written with a decimal comma (the math checks read it). */
export function usesDecimalComma(program: SchoolProgram | undefined): boolean {
  return program === "french";
}
