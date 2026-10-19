// Shared lesson library: a pack built from a TYPED topic only (no photos) is saved once and
// reused for the next family asking for the same subject + topic + grade + language, at no
// AI cost. Packs built from page photos are NEVER stored here (they are private to a family).
// Storage: server/data/library/<hash>.json (gitignored for now; later a database).
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { normalizeBase } from "./normalize";
import { shufflePack } from "./shuffle";
import type { Lang, LessonPack, Subject } from "./types";

export type LibraryEntry = {
  key: string;
  pack: LessonPack;
  sources: { title: string; url: string }[];
  verify: { checked: number; removed: number };
  savedAt: string;
};

const memory = new Map<string, LibraryEntry>();
let dirOverride: string | null | undefined;

function libDir(): string | null {
  if (dirOverride !== undefined) return dirOverride;
  return process.env.ZAKI_LIBRARY_DIR || path.join(process.cwd(), "server", "data", "library");
}

/** "  Fractions!! " and "fractions" share a key; Arabic is normalized too. */
export function libraryKey(subject: Subject, topic: string, grade: number, lang: Lang): string {
  const t = normalizeBase(topic)
    .replace(/[^\p{L}\p{N} ]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${subject}|${t}|${grade}|${lang}`;
}

const fileFor = (dir: string, key: string) => path.join(dir, createHash("sha256").update(key).digest("hex").slice(0, 32) + ".json");

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

/** A cached pack for this key (answer positions re-shuffled), or null. */
export function getFromLibrary(key: string): LibraryEntry | null {
  let entry = memory.get(key) ?? null;
  if (!entry) {
    const dir = libDir();
    if (dir) {
      try {
        const saved = JSON.parse(fs.readFileSync(fileFor(dir, key), "utf8")) as LibraryEntry;
        if (saved && saved.key === key && saved.pack) {
          entry = saved;
          memory.set(key, saved);
        }
      } catch {
        // not in the library
      }
    }
  }
  if (!entry) return null;
  const copy = clone(entry);
  return { ...copy, pack: shufflePack(copy.pack) };
}

export function saveToLibrary(key: string, value: Omit<LibraryEntry, "key" | "savedAt">): void {
  const entry: LibraryEntry = { key, ...clone(value), savedAt: new Date().toISOString() };
  memory.set(key, entry);
  const dir = libDir();
  if (!dir) return;
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fileFor(dir, key), JSON.stringify(entry));
  } catch {
    // read-only hosting: keep the in-memory copy
  }
}

/** Tests only. `dir: null` keeps the library in memory. */
export function __resetLibraryForTests(dir: string | null = null): void {
  memory.clear();
  dirOverride = dir;
}
