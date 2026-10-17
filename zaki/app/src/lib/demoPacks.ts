// DEMO MODE lessons (no server / no AI key): the server's bundled sample packs
// (server/samples: plain data, no secrets), one per subject, English + Arabic.
import { SAMPLE_PACKS } from '../../server/samples';
import type { Lang, LessonPack, Source, Subject } from './types';

const SUBJECT_TITLE: Record<Subject, Record<Lang, string>> = {
  math: { en: 'Math', ar: 'الرياضيات' },
  science: { en: 'Science', ar: 'العلوم' },
  english: { en: 'English', ar: 'اللغة الإنجليزية' },
  arabic: { en: 'Arabic', ar: 'اللغة العربية' },
  social: { en: 'Social studies', ar: 'الدراسات الاجتماعية' },
};

/** Bundled sample pack for a subject (deep copy so the bundled data never changes). */
export function getDemoPack(subject: Subject, lang: Lang, grade: number): { pack: LessonPack; sources: Source[] } {
  const bySubject = SAMPLE_PACKS[subject] ?? SAMPLE_PACKS.math;
  const base = bySubject[lang] ?? bySubject.en;
  const pack = JSON.parse(JSON.stringify(base)) as LessonPack;
  const title = lang === 'ar' ? `مصدر تجريبي: درس نموذجي في ${SUBJECT_TITLE[subject].ar}` : `Sample source (demo): ${SUBJECT_TITLE[subject].en} sample lesson`;
  return { pack: { ...pack, grade }, sources: [{ title }] };
}
