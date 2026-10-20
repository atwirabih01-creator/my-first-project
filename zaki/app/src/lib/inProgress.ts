// Keeps an unfinished test/exam in memory while the child visits "I need help" (or the
// safety screen), so coming back resumes the same question instead of starting over.
const store = new Map<string, unknown>();

export function saveInProgress(key: string, data: unknown): void {
  store.set(key, data);
}
export function loadInProgress<T>(key: string): T | null {
  return (store.get(key) as T | undefined) ?? null;
}
export function clearInProgress(key: string): void {
  store.delete(key);
}
