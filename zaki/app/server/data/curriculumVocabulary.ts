// School words that look like safety keywords but are normal curriculum vocabulary.
// Used ONLY when scanning lesson CONTENT (AI-written lesson packs, AI-written exam questions,
// text read from a textbook photo): keywordScan(text, { lessonContent: true }). A child's own
// chat message is NEVER scanned with this list, so detection of real messages is unchanged.
//
// Each phrase is removed from the text before the keyword scan (whole words, any case, a space
// or hyphen between words). Keep entries specific: a full school phrase, never a bare risky
// word on its own ("sex" alone stays blocked; "sex chromosomes" passes).
// Most look-alikes (limestone, supervision, نتحرك, "2b" in algebra) are handled by the lesson-
// content scan itself (no Arabizi/fuzzy skeleton matching), so they are not listed here.

export const CURRICULUM_SAFE_PHRASES: readonly string[] = [
  // Biology (grades 7-9): inheritance and reproduction in plants and animals.
  "sex chromosome",
  "sex chromosomes",
  "sex cell",
  "sex cells",
  "sex-linked",
  "sex determination",
  // Science: observing without a lens.
  "naked eye",
  "naked-eye",
  // Plants and gardens; "Wed" (Wednesday) normalizes to the same letters as "weed".
  "weed",
  "weeds",
  "wed",
];
