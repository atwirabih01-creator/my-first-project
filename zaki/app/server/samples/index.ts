// Bundled sample packs for DEMO MODE (no ANTHROPIC_API_KEY). One per subject, en + ar.
// Subjects without their own sample (physics, chemistry, biology) fall back to the closest
// one (science), relabelled with the requested subject: never a crash.
import type { Lang, LessonPack, Subject } from "../types";
import { ARABIC_NUMBER_AR, ARABIC_NUMBER_EN } from "./arabic-number";
import { ENGLISH_ADJ_AR, ENGLISH_ADJ_EN } from "./english-adjectives";
import { MATH_FRACTIONS_AR, MATH_FRACTIONS_EN } from "./math-fractions";
import { SCIENCE_WATER_AR, SCIENCE_WATER_EN } from "./science-water-cycle";
import { SOCIAL_MAPS_AR, SOCIAL_MAPS_EN } from "./social-maps";

export const SAMPLE_PACKS: Partial<Record<Subject, Record<Lang, LessonPack>>> = {
  math: { en: MATH_FRACTIONS_EN, ar: MATH_FRACTIONS_AR },
  science: { en: SCIENCE_WATER_EN, ar: SCIENCE_WATER_AR },
  english: { en: ENGLISH_ADJ_EN, ar: ENGLISH_ADJ_AR },
  arabic: { en: ARABIC_NUMBER_EN, ar: ARABIC_NUMBER_AR },
  social: { en: SOCIAL_MAPS_EN, ar: SOCIAL_MAPS_AR },
};

/** Which bundled sample a subject without its own sample uses. */
const SAMPLE_FALLBACK: Partial<Record<Subject, Subject>> = { physics: "science", chemistry: "science", biology: "science" };

/** A deep copy so callers can't change the bundled data. Always returns a pack. */
export function getSamplePack(subject: Subject, lang: Lang): LessonPack {
  const own = SAMPLE_PACKS[subject];
  const bySubject = own ?? SAMPLE_PACKS[SAMPLE_FALLBACK[subject] ?? "science"] ?? SAMPLE_PACKS.math!;
  // JSON copy, not structuredClone: this also runs in the app (demo mode) on phones.
  const pack = JSON.parse(JSON.stringify(bySubject[lang] ?? bySubject.en)) as LessonPack;
  if (!own) {
    pack.subject = subject;
    pack.id = `${pack.id}_${subject}`;
  }
  return pack;
}

export function allSamplePacks(): LessonPack[] {
  return Object.values(SAMPLE_PACKS).flatMap((byLang) => (byLang ? Object.values(byLang) : []));
}
