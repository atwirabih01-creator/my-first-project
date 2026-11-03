// DEMO MODE lessons (no server / no AI key): the server's bundled sample packs
// (server/samples: plain data, no secrets), one per subject, English + Arabic.
import { getSamplePack } from '../../server/samples';
import { SUBJECT_LABELS } from './curriculum';
import { shufflePack } from '../../server/shuffle';
import type { Lang, LessonPack, Source, Subject } from './types';

/** Bundled sample pack for a subject (deep copy so the bundled data never changes). */
export function getDemoPack(subject: Subject, lang: Lang, grade: number): { pack: LessonPack; sources: Source[] } {
  const pack = shufflePack(getSamplePack(subject, lang));
  const title = lang === 'ar' ? `مصدر تجريبي: درس نموذجي في ${SUBJECT_LABELS[subject].ar}` : `Sample source (demo): ${SUBJECT_LABELS[subject].en} sample lesson`;
  return { pack: { ...pack, grade }, sources: [{ title }] };
}
