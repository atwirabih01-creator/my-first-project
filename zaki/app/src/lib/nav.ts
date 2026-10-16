import { router } from 'expo-router';

/** Open the lesson loop for a subject + topic. mode "test" jumps straight to the test. */
export function openLesson(item: { subject: string; topic: string }, mode: 'full' | 'test' = 'full') {
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
