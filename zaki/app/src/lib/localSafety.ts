// On-device safety word check. Works offline and in demo mode.
// It is a SAFETY NET only (the server does the real moderation). It errs on the side
// of showing the calm help screen. Covers English, Arabic, and common Lebanese Arabizi.
import type { HelpKind } from './helpRoutes';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '') // Arabic diacritics + tatweel
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ');
}

const SELF_HARM = [
  'kill myself', 'want to die', 'wanna die', 'hurt myself', 'end my life', 'cut myself',
  'اقتل نفسي', 'اريد ان اموت', 'بدي موت', 'بدي اموت', 'اذي نفسي', 'انتحر',
  'bade mout', 'baddi mout', 'bdi mout', 'bade moot', '2otol 7ali', 'a2tol 7ali',
];
const HURT = [
  'hits me', 'hit me', 'beats me', 'beat me', 'hurts me', 'hurting me', 'touches me', 'touched me',
  'abuse', 'kicks me', 'slaps me', 'not safe', 'unsafe', "don't tell anyone", 'keep it secret',
  'يضربني', 'بيضربني', 'ضربني', 'يؤذيني', 'يوذيني', 'بيأذيني', 'يلمسني', 'لمسني', 'لست بامان', 'مش امن', 'مش آمن',
  'ydrobni', 'byedrobni', 'bi2tilni', 'darabni', 'by2zini',
];
const FEAR = [
  "i'm scared", 'i am scared', 'so scared', 'bomb', 'bombs', 'war', 'explosion',
  'خايف', 'خائف', 'قصف', 'حرب', 'انفجار', 'صواريخ',
  'khayef', 'khayfe', 'khayfeh', 'harb', 'asf',
];

function hasAny(text: string, words: string[]): boolean {
  return words.some((w) => {
    const nw = normalize(w);
    // Latin words: match on word boundaries so "warm" does not trigger "war".
    if (/^[a-z0-9' ]+$/.test(nw)) {
      const re = new RegExp(`(^|[^a-z])${nw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z])`);
      return re.test(text);
    }
    return text.includes(nw);
  });
}

/** Returns the help-route kind to show, or null when nothing worrying was found. */
export function localSafetyCheck(raw: string): HelpKind | null {
  const text = normalize(raw);
  if (!text.trim()) return null;
  if (hasAny(text, SELF_HARM)) return 'self_harm';
  if (hasAny(text, HURT)) return 'home';
  if (hasAny(text, FEAR)) return 'fear';
  return null;
}

/** Maps a server safety category to a help-route kind. */
export function kindFromCategory(category?: string): HelpKind {
  const c = (category ?? '').toLowerCase();
  if (c.includes('self') || c.includes('suicid')) return 'self_harm';
  if (c.includes('abuse') || c.includes('home') || c.includes('harm') || c.includes('violence') || c.includes('sexual')) return 'home';
  if (c.includes('fear') || c.includes('war') || c.includes('sad')) return 'fear';
  return 'general';
}
