// Prompt text shared by every AI prompt that writes for (or about) children: lesson packs,
// the tutor, homework help, parent "Ask Zaki" and exams. Change the wording here only.

import { levelGuide } from "../src/lib/curriculum";

/** Examples and language: general, international, no local foods/places/slang. */
export const GENERAL_EXAMPLES_RULE =
  "Use simple, widely known, international everyday examples (pizza, apples, cake, a ball, a bus, a garden, a classroom, a football match). " +
  "Do NOT use country- or region-specific foods, places, currencies, slang or dialect words (no city or country names; for money say \"coins\"). " +
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

/**
 * LESSON STYLE (founder decision): every lesson reads like a friendly story-lesson, simple
 * and interesting, never a list of facts. Used by the lesson-pack writer.
 */
export const LESSON_STORY_STYLE = `LESSON STYLE: a friendly story-lesson, simple and interesting. NEVER a list of facts.
teachSteps: 5 to 8 steps, in this order. Every step has a "title" (a short kid-friendly heading, max 6 words, e.g. "What is a fraction?"), a "text" and an "example".
  a) Hook. Title like "Have you ever...?". Text: a relatable everyday question or situation ("Have you ever shared a pizza with a friend?"). Example: a tiny everyday scene.
  b) What is it? A clear, simple definition in child words (no jargon), then an example.
  c) How is it made / how does it work? Then an example.
  d) How do we use it? A real-life use, then an example.
  e) (optional, only if the topic needs it) ONE more idea built on the step before, then an example.
  f) Fun fact or easy trick, with an example.
  g) Wrap-up. Title like "Now you know!". Text: 2-3 short sentences starting "Now you know...". Example: one full worked example that uses everything.
Writing rules:
- Short sentences. Grades 1-4: at most about 12 words per sentence. Grades 5-9: at most about 18 words.
- ONE idea per step. Friendly second person ("you").
- Explain the idea BEFORE you name the technical word: "...we call this number the numerator", never the word first.
- Use concrete things a child can picture: pizza, apples, a chocolate bar, a ball, a bus, a garden, a classroom.
- No dense definitions (like "the top counts parts we take; the bottom counts all equal parts") unless a picture-able explanation comes first.
- Examples teach; they must NOT give away the answer to any check or test question (use different numbers or things).`;

/** The same style, briefly, for tutor re-explanations and homework hints. */
export const SHORT_STYLE_RULE =
  "When you explain or re-explain: tell it like a tiny friendly story, not a list of facts. Short sentences, one idea at a time, \"you\", " +
  "a concrete thing the child can picture (pizza, apples, a chocolate bar, a ball, a bus). Explain the idea first, then name the school word.";

/** Sensitive subjects: one calm fixed line, back to the lesson (or homework). */
export function sensitiveTopicRule(where: "lesson" | "homework"): string {
  const line =
    where === "homework"
      ? `"That's not part of our lessons. Let's get back to your homework! ✏️" (Arabic: "هذا ليس من دروسنا. هيّا نعود إلى واجبك! ✏️")`
      : `"That's not part of our lessons. Let's get back to our lesson! 📘" (Arabic: "هذا ليس من دروسنا. هيّا نعود إلى درسنا! 📘")`;
  return (
    "Politics, political parties, elections, armed groups, war as a subject, religious or sect rulings, and adult subjects are NOT part of the lessons. " +
    `If the child brings one up, do not discuss it, do not give an opinion and do not repeat its words: reply only ${line}`
  );
}

/**
 * VISUAL, INTERACTIVE LESSONS (founder decision, pack version 4): pictures the app draws
 * (`visual`) and quick "try it" questions (`tryIt`) on the teach steps. Our code re-checks
 * every picture (server/visuals.ts); a wrong one is dropped, so the lesson loses it.
 */
export const LESSON_VISUAL_RULES = `PICTURES AND "TRY IT" (every lesson must be visual and interactive for a child)
- Every teach step has "visual" and "tryIt": give a value or null.
- "visual" is a STRING holding ONE compact JSON object (or null). Our code parses and checks it; a wrong one is removed. Allowed objects (? = optional):
  {"type":"fraction","shape":"circle"|"bar","parts":2-12,"shaded":0..parts,"label"?:"3/4","interactive"?:true}   (label exactly "shaded/parts"; circle = pizza, bar = chocolate bar)
  {"type":"fractionCompare","a":{"parts":3,"shaded":1},"b":{"parts":6,"shaded":1},"shape":"circle"|"bar"}
  {"type":"objects","emoji":"🍎","count":1-20,"groups"?:n (divides count),"crossedOut"?:0..count,"label"?:"...","interactive"?:true}
  {"type":"equation","parts":["3","+","4","=","7"],"highlight"?:index}   (max 9 tokens, each max 6 chars; MUST be correct)
  {"type":"numberLine","from":0,"to":10,"step":1,"marks"?:[3,7],"jumps"?:[{"from":3,"to":7}]}   (at most 20 steps; marks and jumps inside)
  {"type":"sequence","items":[{"emoji":"☀️","label":"..."}, ...]}   (2-6 steps shown with arrows: processes, life cycles)
  {"type":"labeled","items":[{"emoji":"🌱","label":"..."}, ...]}   (2-6: parts of something, groups, a set of words)
  {"type":"bars","bars":[{"label":"...","value":0-100,"emoji"?:"🐱"}, ...]}   (2-6 bars)
  {"type":"clock","hour":1-12,"minute":0|5|...|55}
  {"type":"shape","shape":"triangle"|"square"|"rectangle"|"circle"|"pentagon"|"hexagon","sideLabels"?:["3 cm", ...]}
  {"type":"placeValue","number":1-999}
  {"type":"wordCard","word":"...","emoji":"🐶","meaning":"..."}
- At least 4 teach steps have a "visual" that SHOWS the idea with real, concrete numbers or things (not decoration). Examples: fractions: a pizza circle with 4 parts, 3 shaded, label "3/4"; then a bar; then fractionCompare. Addition: objects then an equation. Plants: labeled parts. Water cycle: sequence. Telling time: clock. Place value: placeValue. Vocabulary (English or Arabic lessons): wordCard.
- The picture shows EXACTLY the numbers named in that step's text or example (if the text says 1/2 and 1/4, the picture shows 1/2 and 1/4, never other fractions); otherwise it is removed. Labels in the lesson language, short (max 30 characters); numbers as plain digits 0-9. One emoji per emoji field; no flags, no weapons, no scary or religious symbols.
- Math lessons about fractions or counting: make ONE picture "interactive": true (a fraction the child colours by tapping, or objects the child taps to count).
  An interactive fraction: "shaded" is the TARGET the child colours, so 1 <= shaded < parts (never 0, never all), and that step's text or example says what to colour, e.g. "Colour 2 of the 6 parts." Interactive objects: count at least 2.
- At least 3 teach steps have a "tryIt": a quick, easy question about the idea of THAT step, just taught (2-4 short unique choices, answerIndex = the right one, "explain" = one short sentence that says why). No score. It must be different from every check, test and retest question (other numbers, other things) and must not give away their answers.
- Numbers in every step: always concrete ("3 of 4 slices"), never only abstract words.`;
