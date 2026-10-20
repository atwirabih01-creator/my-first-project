import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback } from 'react';

/** Open the lesson loop for a subject + topic. mode "test" jumps straight to the test. */
export function openLesson(item: { subject: string; topic: string }, mode: 'full' | 'test' | 'review' = 'full') {
  router.push({ pathname: '/lesson', params: { subject: item.subject, topic: item.topic, mode } });
}

export function formatDate(iso: string, lang: string): string {
  try {
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString(lang === 'ar' ? 'ar' : 'en', { weekday: 'long', day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}

/**
 * In-app "back": always go to a fixed, logical parent screen. Never uses browser
 * history, so it also works when the demo is opened as a file (file://), where the
 * browser's own history would leave the app.
 */
export function goTo(href: Href) {
  // replace() swaps the current screen and never calls history.back()/go(), unlike
  // back()/dismissTo(), which step through browser history (fatal on file://).
  router.replace(href);
}

// Where "I need help" should return to (the lesson the child was in), without history.
let helpReturn: Href | null = null;
let helpInTest = false;
/** inTest: the child is in a test/exam (no hints there), so help shows test-friendly text. */
export function setHelpReturn(href: Href | null, opts: { inTest?: boolean } = {}) {
  helpReturn = href;
  helpInTest = !!opts.inTest;
}
export function getHelpReturn(): Href | null {
  return helpReturn;
}
export function isHelpInTest(): boolean {
  return helpInTest;
}

/**
 * Remember where "I need help" / the safety screen should return to. Runs only when this
 * screen is FOCUSED (screens hidden in the stack still re-render and must not overwrite it).
 */
export function useHelpReturn(href: Href | null, inTest = false) {
  const key = JSON.stringify(href);
  useFocusEffect(
    useCallback(() => {
      setHelpReturn(key === 'null' ? null : (JSON.parse(key) as Href), { inTest });
    }, [key, inTest]),
  );
}
