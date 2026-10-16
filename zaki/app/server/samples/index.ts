// Bundled sample packs for DEMO MODE (no ANTHROPIC_API_KEY). One per subject, en + ar.
import type { Lang, LessonPack, Subject } from "../types";
import { ARABIC_NUMBER_AR, ARABIC_NUMBER_EN } from "./arabic-number";
import { ENGLISH_ADJ_AR, ENGLISH_ADJ_EN } from "./english-adjectives";
import { MATH_FRACTIONS_AR, MATH_FRACTIONS_EN } from "./math-fractions";
import { SCIENCE_WATER_AR, SCIENCE_WATER_EN } from "./science-water-cycle";
import { SOCIAL_MAPS_AR, SOCIAL_MAPS_EN } from "./social-maps";

export const SAMPLE_PACKS: Record<Subject, Record<Lang, LessonPack>> = {
  math: { en: MATH_FRACTIONS_EN, ar: MATH_FRACTIONS_AR },
  science: { en: SCIENCE_WATER_EN, ar: SCIENCE_WATER_AR },
  english: { en: ENGLISH_ADJ_EN, ar: ENGLISH_ADJ_AR },
  arabic: { en: ARABIC_NUMBER_EN, ar: ARABIC_NUMBER_AR },
  social: { en: SOCIAL_MAPS_EN, ar: SOCIAL_MAPS_AR },
};

/** A deep copy so callers can't change the bundled data. */
export function getSamplePack(subject: Subject, lang: Lang): LessonPack {
  return structuredClone(SAMPLE_PACKS[subject][lang]);
}

export function allSamplePacks(): LessonPack[] {
  return Object.values(SAMPLE_PACKS).flatMap((byLang) => Object.values(byLang));
}
