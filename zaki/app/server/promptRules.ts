// Prompt text shared by every AI prompt that writes for (or about) children: lesson packs,
// the tutor, homework help, parent "Ask Zaki" and exams. Change the wording here only.

import { levelGuide } from "../src/lib/curriculum";

/** Examples and language: general, international, no local foods/places/slang. */
export const GENERAL_EXAMPLES_RULE =
  "Use simple, widely known, international everyday examples (pizza, apples, cake, a ball, a bus, a garden, a classroom, a football match). " +
  "Do NOT use country- or region-specific foods, places, currencies, slang or dialect words. " +
  "No examples about war, violence, politics or religion. " +
  "Arabic output: clear Modern Standard Arabic suitable for children (no dialect), with Western digits (0-9).";

/** Topic above or below the child's grade: still teach it, at the child's level. */
export const LEVEL_MISMATCH_RULE =
  "If the topic is clearly above or below the child's grade, still teach it, but at the child's level: " +
  "for a harder topic, start from what a child of this grade already knows and build up in small steps; " +
  "for an easier topic, keep it quick and add a little challenge.";

/** One line for a prompt: the expected level for this child. */
export function levelLine(grade: number, age?: number): string {
  return levelGuide(grade, age);
}
