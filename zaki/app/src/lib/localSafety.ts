// On-device safety word check. Works offline and in demo mode.
// It reuses the SERVER's normalizer + keyword lists (server/keywordScan.ts: pure code and
// data, no AI, no secrets) and the server's fixed texts (server/data/safetyMessages.ts), so
// the app and the server catch the same words and decide the same way (server/safety.ts):
// - self-harm, harm/secrets disclosure, help requests: the safety screen (unchanged);
// - fear that involves someone at home, a named outside person, "scared to go home", or a
//   request for help: the safety screen (unchanged);
// - the child's OWN fear or sadness with nobody named ("scared of the bombs"): NO screen,
//   one calm fixed line, a calm note for the parent;
// - sensitive subjects (war as a subject, politics, religion rulings, adult subjects): NO
//   screen, the fixed "not part of our lessons" line, a note for the parent.
// It is a safety net only; the server does the full moderation when online.
import { FIXED_MESSAGES } from '../../server/data/safetyMessages';
import { keywordCategory, keywordScan, type KeywordScan } from '../../server/keywordScan';
import type { HelpKind } from './helpRoutes';
import type { Lang } from './types';

export type LocalSafety =
  | { action: 'screen'; kind: HelpKind }
  | { action: 'calm'; category: 'sensitive_topic' | 'violence_fear' };

/**
 * Full decision for a child's text. `asTopic`: a typed LESSON TOPIC (a noun phrase) -- when only
 * war words raised fear ("the bombs of the war") it is a sensitive subject, not the child's fear.
 */
export function localSafetyDecision(raw: string, opts: { asTopic?: boolean } = {}): LocalSafety | null {
  if (!raw.trim()) return null;
  let scan: KeywordScan;
  try {
    scan = keywordScan(raw);
  } catch {
    return null;
  }
  const cat = keywordCategory(scan);
  if (cat === 'self_harm') return { action: 'screen', kind: 'self_harm' };
  if (cat === 'disclosure_harm') return { action: 'screen', kind: 'home' };
  if (cat === 'violence_fear') {
    if (opts.asTopic && scan.warOnlyFear) return { action: 'calm', category: 'sensitive_topic' };
    // Nobody at home, nobody outside named, no request for help: the child's own feelings.
    if (!scan.home && !scan.outside && !scan.helpSeeking) return { action: 'calm', category: 'violence_fear' };
    return { action: 'screen', kind: 'fear' };
  }
  if (cat === 'help_request') return { action: 'screen', kind: 'general' };
  if (cat === 'adult_topic' || cat === 'sensitive_topic') return { action: 'calm', category: 'sensitive_topic' };
  return null;
}

/** Returns the help-route kind when the SAFETY SCREEN must open, or null (nothing, or a calm case). */
export function localSafetyCheck(raw: string, opts: { asTopic?: boolean } = {}): HelpKind | null {
  const d = localSafetyDecision(raw, opts);
  return d?.action === 'screen' ? d.kind : null;
}

/** The fixed calm line for a calm case (same texts as the server). */
export function calmReply(category: 'sensitive_topic' | 'violence_fear', lang: Lang, where: 'lesson' | 'homework'): string {
  const key = category === 'violence_fear' ? 'fear_calm' : where === 'homework' ? 'sensitive_topic_homework' : 'sensitive_topic';
  return FIXED_MESSAGES[key][lang];
}

/** Maps a server safety category to a help-route kind. */
export function kindFromCategory(category?: string): HelpKind {
  const c = (category ?? '').toLowerCase();
  if (c.includes('self') || c.includes('suicid')) return 'self_harm';
  if (c.includes('abuse') || c.includes('disclosure') || c.includes('home') || c.includes('harm') || c.includes('sexual')) return 'home';
  if (c.includes('fear') || c.includes('war') || c.includes('violence') || c.includes('sad')) return 'fear';
  return 'general';
}
