// Shared lesson library: a pack built from a TYPED topic only (no photos) is saved once and
// reused for the next family asking for the same subject + topic + grade + language, at no
// AI cost. Packs built from page photos are NEVER stored here (they are private to a family).
// Storage goes through getStore(): files under server/data/library/ by default, or the online
// database's `library` table when Supabase is configured.
import { normalizeBase } from "./normalize";
import { shufflePack } from "./shuffle";
import { createFileStore, getStore, __setStoreForTests } from "./storage";
import type { Lang, LessonPack, Subject } from "./types";

export type LibraryEntry = {
  key: string;
  pack: LessonPack;
  sources: { title: string; url: string }[];
  verify: { checked: number; removed: number };
  savedAt: string;
};

/** "  Fractions!! " and "fractions" share a key; Arabic is normalized too. */
export function libraryKey(subject: Subject, topic: string, grade: number, lang: Lang): string {
  const t = normalizeBase(topic)
    .replace(/[^\p{L}\p{N} ]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${subject}|${t}|${grade}|${lang}`;
}

/** A cached pack for this key (answer positions re-shuffled), or null. Never throws. */
export async function getFromLibrary(key: string): Promise<LibraryEntry | null> {
  let entry: LibraryEntry | null = null;
  try {
    entry = await getStore().libraryGet(key);
  } catch {
    return null; // library unavailable: just build the pack
  }
  if (!entry || entry.key !== key || !entry.pack) return null;
  return { ...entry, pack: shufflePack(entry.pack) };
}

export async function saveToLibrary(key: string, value: Omit<LibraryEntry, "key" | "savedAt">): Promise<void> {
  try {
    await getStore().libraryPut({ key, ...JSON.parse(JSON.stringify(value)), savedAt: new Date().toISOString() });
  } catch {
    // saving to the library is best effort
  }
}

/** Tests only: a fresh file store whose library lives in `dir` (null = memory); everything else in memory. */
export function __resetLibraryForTests(dir: string | null = null): void {
  __setStoreForTests(createFileStore({ dataDir: null, flagFile: null, budgetFile: null, libraryDir: dir }));
}
