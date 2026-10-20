// fileStore: today's behaviour. Everything lives in small JSON files on the server's disk
// (all under server/data, gitignored). Used when Supabase is not set up.
// File layout (same formats the existing code already writes, so nothing is lost on switch):
//   flags.jsonl          one flag per line (+ "review"/"unlink" lines appended later)
//   budget.json          { date, spentUsd, byPurpose, childTurns } (server/budget.ts format)
//   library/<hash>.json  one shared typed-topic pack per file (server/library.ts format)
//   families/<id>.json   one family: grown-ups, consents, children, synced progress
// If the disk is read-only (some hosting), writes are skipped and memory copies are used.
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  RETENTION,
  StorageError,
  assertChildRef,
  assertFamilyId,
  cleanName,
  newChildRef,
  routeOf,
  type BudgetDay,
  type Child,
  type Consent,
  type Family,
  type FamilyExport,
  type FlagInput,
  type FlagReview,
  type FlagStatus,
  type Guardian,
  type LibraryEntry,
  type ProgressSnapshot,
  type RetentionReport,
  type SpendPurpose,
  type StoredFlag,
  type ZakiStore,
} from "./types";

type FamilyFile = {
  family: Family;
  guardians: Guardian[];
  consents: Consent[];
  children: Record<string, { child: Child; progress: ProgressSnapshot | null }>;
};

type BudgetFile = { date: string; spentUsd: number; byPurpose: Record<SpendPurpose, number>; childTurns: Record<string, number> };

type FlagLine =
  | (Partial<StoredFlag> & { id: string; ts: string; alertParent?: boolean; type?: undefined })
  | { type: "review"; id: string; at: string; status: FlagStatus; reviewerNote?: string; sharedWithParent?: boolean }
  | { type: "unlink"; familyId: string; at: string };

export type FileStoreOptions = {
  /** Folder for all files. Default: ZAKI_DATA_DIR or <cwd>/server/data. null = memory only. */
  dataDir?: string | null;
  /** Flag log file. Default: ZAKI_FLAG_FILE or <dataDir>/flags.jsonl ("off" = memory only). */
  flagFile?: string | null;
  budgetFile?: string | null;
  libraryDir?: string | null;
};

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;
const zeroPurpose = (): Record<SpendPurpose, number> => ({ lesson: 0, tutor: 0, safety: 0 });

export function createFileStore(opts: FileStoreOptions = {}): ZakiStore {
  const dataDir =
    opts.dataDir !== undefined ? opts.dataDir : process.env.ZAKI_DATA_DIR || path.join(process.cwd(), "server", "data");
  const envFlag = process.env.ZAKI_FLAG_FILE;
  const flagFile =
    opts.flagFile !== undefined ? opts.flagFile : envFlag === "off" ? null : envFlag || (dataDir ? path.join(dataDir, "flags.jsonl") : null);
  const budgetFile =
    opts.budgetFile !== undefined ? opts.budgetFile : process.env.ZAKI_BUDGET_FILE || (dataDir ? path.join(dataDir, "budget.json") : null);
  const libraryDir =
    opts.libraryDir !== undefined ? opts.libraryDir : process.env.ZAKI_LIBRARY_DIR || (dataDir ? path.join(dataDir, "library") : null);
  const familiesDir = dataDir ? path.join(dataDir, "families") : null;

  // memory copies (used alone when there is no disk)
  const memFlags: FlagLine[] = [];
  const memLibrary = new Map<string, LibraryEntry>();
  const memFamilies = new Map<string, FamilyFile>();
  let memBudget: BudgetFile | null = null;

  // ------------------------------------------------------------ tiny file helpers
  function readJson<T>(file: string | null): T | null {
    if (!file) return null;
    try {
      return JSON.parse(fs.readFileSync(file, "utf8")) as T;
    } catch {
      return null;
    }
  }
  function writeJson(file: string | null, value: unknown): void {
    if (!file) return;
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(value));
      fs.renameSync(tmp, file); // atomic replace: a crash never leaves half a file
    } catch {
      // read-only hosting: memory copy only
    }
  }

  // ------------------------------------------------------------ flags
  function readFlagLines(): FlagLine[] {
    if (!flagFile) return memFlags;
    try {
      return fs
        .readFileSync(flagFile, "utf8")
        .split("\n")
        .filter((l) => l.trim())
        .flatMap((l) => {
          try {
            return [JSON.parse(l) as FlagLine];
          } catch {
            return [];
          }
        });
    } catch {
      return memFlags;
    }
  }
  function appendFlagLine(line: FlagLine): void {
    memFlags.push(line);
    if (!flagFile) return;
    try {
      fs.mkdirSync(path.dirname(flagFile), { recursive: true });
      fs.appendFileSync(flagFile, JSON.stringify(line) + "\n", "utf8");
    } catch {
      // memory only
    }
  }
  function rewriteFlagLines(lines: FlagLine[]): void {
    memFlags.length = 0;
    memFlags.push(...lines);
    if (!flagFile) return;
    try {
      const tmp = `${flagFile}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, lines.map((l) => JSON.stringify(l)).join("\n") + (lines.length ? "\n" : ""));
      fs.renameSync(tmp, flagFile);
    } catch {
      // memory only
    }
  }
  /** Folds review/unlink lines into the flags they refer to. */
  function currentFlags(): StoredFlag[] {
    const byId = new Map<string, StoredFlag>();
    for (const l of readFlagLines()) {
      if (l.type === "review") {
        const f = byId.get(l.id);
        if (f) {
          f.status = l.status;
          f.reviewerNote = l.reviewerNote;
          f.sharedWithParent = Boolean(l.sharedWithParent);
          f.reviewedAt = l.at;
        }
      } else if (l.type === "unlink") {
        for (const f of byId.values()) if (f.familyId === l.familyId) delete f.familyId;
      } else if (l.id) {
        byId.set(l.id, {
          id: l.id,
          ts: l.ts,
          category: (l.category ?? "other") as StoredFlag["category"],
          route: routeOf(l),
          involvesHome: Boolean(l.involvesHome),
          alertLevel: l.alertLevel,
          speaker: (l.speaker ?? "child") as StoredFlag["speaker"],
          lang: l.lang,
          country: l.country,
          layers: Array.isArray(l.layers) ? l.layers : [],
          childRef: l.childRef,
          familyId: l.familyId,
          excerpt: String(l.excerpt ?? "").slice(0, 200),
          status: (l.status as FlagStatus) ?? "pending_review",
          sharedWithParent: Boolean(l.sharedWithParent),
          reviewerNote: l.reviewerNote,
          reviewedAt: l.reviewedAt,
        });
      }
    }
    return [...byId.values()];
  }

  // ------------------------------------------------------------ families
  const familyFile = (id: string) => (familiesDir ? path.join(familiesDir, `${id}.json`) : null);
  function loadFamily(id: string): FamilyFile | null {
    assertFamilyId(id);
    const mem = memFamilies.get(id);
    if (mem) return mem;
    const f = readJson<FamilyFile>(familyFile(id));
    if (f) memFamilies.set(id, f);
    return f;
  }
  function saveFamily(f: FamilyFile): void {
    memFamilies.set(f.family.id, f);
    writeJson(familyFile(f.family.id), f);
  }
  function mustFamily(id: string): FamilyFile {
    const f = loadFamily(id);
    if (!f) throw new StorageError("family_not_found");
    return f;
  }

  // ------------------------------------------------------------ budget
  function loadBudget(day: string): BudgetFile {
    if (memBudget && memBudget.date === day) return memBudget;
    const saved = readJson<BudgetFile>(budgetFile);
    memBudget =
      saved && saved.date === day && typeof saved.spentUsd === "number"
        ? { date: day, spentUsd: saved.spentUsd, byPurpose: { ...zeroPurpose(), ...saved.byPurpose }, childTurns: saved.childTurns ?? {} }
        : { date: day, spentUsd: 0, byPurpose: zeroPurpose(), childTurns: {} };
    return memBudget;
  }

  const libFile = (key: string) =>
    libraryDir ? path.join(libraryDir, createHash("sha256").update(key).digest("hex").slice(0, 32) + ".json") : null;

  const store: ZakiStore = {
    kind: "file",

    async addFlag(input: FlagInput): Promise<StoredFlag> {
      const rec: StoredFlag = {
        ...clone(input),
        excerpt: String(input.excerpt ?? "").slice(0, 200),
        id: randomUUID(),
        ts: new Date().toISOString(),
        status: "pending_review",
        sharedWithParent: false,
      };
      appendFlagLine(rec);
      return clone(rec);
    },

    async listFlags(o) {
      const all = currentFlags();
      return o?.status ? all.filter((f) => f.status === o.status) : all;
    },

    async reviewFlag(id: string, review: FlagReview) {
      const f = currentFlags().find((x) => x.id === id);
      if (!f) return null;
      appendFlagLine({
        type: "review",
        id,
        at: new Date().toISOString(),
        status: review.status,
        reviewerNote: review.reviewerNote?.slice(0, 1000),
        sharedWithParent: Boolean(review.sharedWithParent),
      });
      return currentFlags().find((x) => x.id === id) ?? null;
    },

    async parentAlerts(familyId: string) {
      assertFamilyId(familyId);
      return currentFlags()
        .filter((f) => f.familyId === familyId && (f.route === "parent" || f.sharedWithParent))
        .map((f) => ({ id: f.id, ts: f.ts, category: f.category, status: f.status, childRef: f.childRef }));
    },

    async libraryGet(key: string) {
      const mem = memLibrary.get(key);
      if (mem) return clone(mem);
      const saved = readJson<LibraryEntry>(libFile(key));
      if (saved && saved.key === key && saved.pack) {
        memLibrary.set(key, saved);
        return clone(saved);
      }
      return null;
    },

    async libraryPut(entry: LibraryEntry) {
      const e = clone(entry);
      memLibrary.set(e.key, e);
      writeJson(libFile(e.key), e);
    },

    async budgetGet(day: string): Promise<BudgetDay> {
      const b = loadBudget(day);
      return { date: b.date, spentUsd: b.spentUsd, byPurpose: { ...b.byPurpose } };
    },

    async budgetAdd(day, purpose, usd) {
      if (!(usd >= 0)) throw new StorageError("bad_budget_entry");
      const b = loadBudget(day);
      b.spentUsd += usd;
      b.byPurpose[purpose] = (b.byPurpose[purpose] ?? 0) + usd;
      writeJson(budgetFile, b);
      return b.spentUsd;
    },

    async childTurnTake(day, childRef, limit) {
      const b = loadBudget(day);
      const used = b.childTurns[childRef] ?? 0;
      if (used >= limit) return false;
      b.childTurns[childRef] = used + 1;
      writeJson(budgetFile, b);
      return true;
    },

    async createFamily(input) {
      const now = new Date().toISOString();
      const family: Family = {
        id: randomUUID(),
        createdAt: now,
        country: input.country ?? null,
        reportLang: input.reportLang ?? "ar",
        settings: {},
      };
      const guardian: Guardian = {
        id: randomUUID(),
        familyId: family.id,
        firstName: cleanName(input.guardian.firstName, 40),
        relationship: input.guardian.relationship,
        createdAt: now,
      };
      saveFamily({ family, guardians: [guardian], consents: [], children: {} });
      return { family: clone(family), guardian: clone(guardian) };
    },

    async getFamily(familyId) {
      const f = loadFamily(familyId);
      return f ? clone(f.family) : null;
    },

    async addConsent(familyId, c) {
      const f = mustFamily(familyId);
      const consent: Consent = {
        id: randomUUID(),
        familyId,
        guardianId: c.guardianId,
        kind: c.kind ?? "main",
        version: String(c.version).slice(0, 40),
        method: c.method ?? "in_app_gate",
        givenAt: new Date().toISOString(),
      };
      f.consents.push(consent);
      saveFamily(f);
      return clone(consent);
    },

    async withdrawConsent(familyId, consentId) {
      const f = mustFamily(familyId);
      const c = f.consents.find((x) => x.id === consentId);
      if (!c || c.withdrawnAt) return false;
      c.withdrawnAt = new Date().toISOString();
      saveFamily(f);
      return true;
    },

    async upsertChild(input) {
      const f = mustFamily(input.familyId);
      const childRef = input.childRef ?? newChildRef();
      assertChildRef(childRef);
      if (!Number.isInteger(input.grade) || input.grade < 1 || input.grade > 6) throw new StorageError("bad_grade");
      const child: Child = {
        familyId: input.familyId,
        childRef,
        nickname: cleanName(input.nickname, 20, true),
        grade: input.grade,
        lang: input.lang,
        avatar: input.avatar,
        dailyLimitMin: input.dailyLimitMin,
      };
      f.children[childRef] = { child, progress: f.children[childRef]?.progress ?? null };
      saveFamily(f);
      return clone(child);
    },

    async listChildren(familyId) {
      const f = loadFamily(familyId);
      return f ? Object.values(f.children).map((c) => clone(c.child)) : [];
    },

    async syncProgress(familyId, childRef, snap) {
      assertChildRef(childRef);
      const f = mustFamily(familyId);
      const entry = f.children[childRef];
      if (!entry) throw new StorageError("child_not_found");
      const s = clone(snap);
      // Photo-built packs are private: they never carry a library key.
      if (s.packs) s.packs = s.packs.map((p) => (p.source === "photo" ? { ...p, libraryKey: undefined } : p));
      entry.progress = s;
      saveFamily(f);
    },

    async getProgress(familyId, childRef) {
      const f = loadFamily(familyId);
      return f?.children[childRef]?.progress ? clone(f.children[childRef].progress) : null;
    },

    async exportFamily(familyId): Promise<FamilyExport | null> {
      const f = loadFamily(familyId);
      if (!f) return null;
      const alerts = await store.parentAlerts(familyId);
      return {
        exportedAt: new Date().toISOString(),
        storage: "file",
        data: { ...clone(f), parentAlerts: alerts },
      };
    },

    async deleteFamily(familyId) {
      const f = loadFamily(familyId);
      if (!f) return false;
      memFamilies.delete(familyId);
      const file = familyFile(familyId);
      if (file) {
        try {
          fs.rmSync(file, { force: true });
        } catch {
          // nothing on disk
        }
      }
      // Flags keep only the random childRef (an open referral must not vanish).
      appendFlagLine({ type: "unlink", familyId, at: new Date().toISOString() });
      return true;
    },

    async runRetention(now = new Date()): Promise<RetentionReport> {
      const chatCutoff = now.getTime() - RETENTION.chatDays * 86_400_000;
      const flagCutoff = now.getTime() - RETENTION.reviewedFlagDays * 86_400_000;
      let chat = 0;
      // chat text in every family file
      const ids = new Set<string>(memFamilies.keys());
      if (familiesDir) {
        try {
          for (const n of fs.readdirSync(familiesDir)) if (n.endsWith(".json")) ids.add(n.slice(0, -5));
        } catch {
          // no folder yet
        }
      }
      for (const id of ids) {
        let f: FamilyFile | null = null;
        try {
          f = loadFamily(id);
        } catch {
          continue;
        }
        if (!f) continue;
        let changed = false;
        for (const c of Object.values(f.children)) {
          const list = c.progress?.chat;
          if (!list) continue;
          const kept = list.filter((m) => Date.parse(m.at) >= chatCutoff);
          if (kept.length !== list.length) {
            chat += list.length - kept.length;
            c.progress!.chat = kept;
            changed = true;
          }
        }
        if (changed) saveFamily(f);
      }
      // reviewed / closed flags older than the cutoff (never pending or referred)
      const flags = currentFlags();
      const drop = new Set(
        flags
          .filter((f) => (f.status === "reviewed" || f.status === "closed") && f.reviewedAt && Date.parse(f.reviewedAt) < flagCutoff)
          .map((f) => f.id),
      );
      if (drop.size) {
        // Rewrite the log with the folded current state so dropped flags leave no trace.
        rewriteFlagLines(flags.filter((f) => !drop.has(f.id)));
      }
      // fileStore never keeps page photos, so there is nothing to remove.
      return { chat, flags: drop.size, photos: 0, other: 0 };
    },
  };
  return store;
}
