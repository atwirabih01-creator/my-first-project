// On-device safety word check. Works offline and in demo mode.
// It reuses the SERVER's normalizer + keyword lists (server/keywordScan.ts: pure code and
// data, no AI, no secrets), so the app and the server always catch the same words.
// It is a safety net only; the server does the full moderation when online.
import { keywordCategory, keywordScan } from '../../server/keywordScan';
import type { HelpKind } from './helpRoutes';

/** Returns the help-route kind to show, or null when nothing worrying was found. */
export function localSafetyCheck(raw: string): HelpKind | null {
  if (!raw.trim()) return null;
  let scan;
  try {
    scan = keywordScan(raw);
  } catch {
    return null;
  }
  const cat = keywordCategory(scan);
  if (cat === 'self_harm') return 'self_harm';
  if (cat === 'disclosure_harm') return 'home';
  if (cat === 'violence_fear') return 'fear';
  return null;
}

/** Maps a server safety category to a help-route kind. */
export function kindFromCategory(category?: string): HelpKind {
  const c = (category ?? '').toLowerCase();
  if (c.includes('self') || c.includes('suicid')) return 'self_harm';
  if (c.includes('abuse') || c.includes('disclosure') || c.includes('home') || c.includes('harm') || c.includes('sexual')) return 'home';
  if (c.includes('fear') || c.includes('war') || c.includes('violence') || c.includes('sad')) return 'fear';
  return 'general';
}
