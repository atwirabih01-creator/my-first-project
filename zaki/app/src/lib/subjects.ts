import type { StringKey } from './i18n';
import type { Subject } from './types';

export const SUBJECTS: { id: Subject; icon: string; key: StringKey }[] = [
  { id: 'math', icon: '🔢', key: 'subj_math' },
  { id: 'science', icon: '🔬', key: 'subj_science' },
  { id: 'english', icon: '🔤', key: 'subj_english' },
  { id: 'arabic', icon: '📖', key: 'subj_arabic' },
  { id: 'social', icon: '🌍', key: 'subj_social' },
];

export const subjectInfo = (s: Subject) => SUBJECTS.find((x) => x.id === s) ?? SUBJECTS[0];
