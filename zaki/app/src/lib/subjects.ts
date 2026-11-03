import { subjectsForGrade } from './curriculum';
import type { StringKey } from './i18n';
import type { Subject } from './types';

export type SubjectInfo = { id: Subject; icon: string; key: StringKey; soft: string; accent: string };

/**
 * Each subject has its own emoji and colour, so a child can spot it at a glance.
 * `soft` is a background for dark text (C.text passes WCAG AA on all of them);
 * `accent` is for borders, icons and bars only (never for small text).
 * Physics, chemistry and biology are only offered from grade 7 (see subjectsForGrade).
 */
export const SUBJECTS: SubjectInfo[] = [
  { id: 'math', icon: '🔢', key: 'subj_math', soft: '#FFEFD9', accent: '#E07B12' },
  { id: 'science', icon: '🔬', key: 'subj_science', soft: '#E1F5E7', accent: '#2E8B57' },
  { id: 'physics', icon: '⚛️', key: 'subj_physics', soft: '#E6E8FF', accent: '#5457C9' },
  { id: 'chemistry', icon: '🧪', key: 'subj_chemistry', soft: '#F4E6FA', accent: '#9645B8' },
  { id: 'biology', icon: '🧬', key: 'subj_biology', soft: '#ECF6DA', accent: '#5F8F1F' },
  { id: 'english', icon: '🔤', key: 'subj_english', soft: '#E5EDFF', accent: '#3D6FD9' },
  { id: 'arabic', icon: '📖', key: 'subj_arabic', soft: '#FDE6EE', accent: '#C2416E' },
  { id: 'social', icon: '🌍', key: 'subj_social', soft: '#DDF2F4', accent: '#1F7F8A' },
];

export const subjectInfo = (s: Subject) => SUBJECTS.find((x) => x.id === s) ?? SUBJECTS[0];

/** The subjects a child in this grade can pick (same order as SUBJECTS). */
export const subjectsForChild = (grade: number): SubjectInfo[] => {
  const allowed = subjectsForGrade(grade);
  return SUBJECTS.filter((s) => allowed.includes(s.id));
};
