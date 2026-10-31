import type { StringKey } from './i18n';
import type { Subject } from './types';

/**
 * Each subject has its own emoji and colour, so a child can spot it at a glance.
 * `soft` is a background for dark text (C.text passes WCAG AA on all of them);
 * `accent` is for borders, icons and bars only (never for small text).
 */
export const SUBJECTS: { id: Subject; icon: string; key: StringKey; soft: string; accent: string }[] = [
  { id: 'math', icon: '🔢', key: 'subj_math', soft: '#FFEFD9', accent: '#E07B12' },
  { id: 'science', icon: '🔬', key: 'subj_science', soft: '#E1F5E7', accent: '#2E8B57' },
  { id: 'english', icon: '🔤', key: 'subj_english', soft: '#E5EDFF', accent: '#3D6FD9' },
  { id: 'arabic', icon: '📖', key: 'subj_arabic', soft: '#FDE6EE', accent: '#C2416E' },
  { id: 'social', icon: '🌍', key: 'subj_social', soft: '#DDF2F4', accent: '#1F7F8A' },
];

export const subjectInfo = (s: Subject) => SUBJECTS.find((x) => x.id === s) ?? SUBJECTS[0];
