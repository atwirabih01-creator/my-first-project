// Storage interface tests, run against fileStore (local JSON files in a temp folder).
// Run: node --import tsx --test server/storage/__tests__/*.test.ts
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";

import { createFileStore, type ProgressSnapshot, type ZakiStore } from "../index";

let dir: string;
let store: ZakiStore;
const fresh = () => createFileStore({ dataDir: dir });

const snap = (over: Partial<ProgressSnapshot> = {}): ProgressSnapshot => ({
  plan: [{ id: "p1", subject: "math", topic: "Fractions", kind: "lesson", addedAt: "2026-10-01T10:00:00.000Z", packKey: "math|fractions" }],
  tests: [{ lessonKey: "math|fractions", date: "2026-10-02", at: "2026-10-02T15:00:00.000Z", score: 8, total: 10, passed: true, seconds: 300, attempt: 1 }],
  sessions: [{ date: "2026-10-02", minutes: 20, at: "2026-10-02T14:40:00.000Z" }],
  exams: [],
  examResults: [],
  packs: [
    { packKey: "math|fractions", subject: "math", topic: "Fractions", grade: 3, lang: "en", source: "typed", libraryKey: "math|fractions|3|en", pack: { id: "x" }, sources: [] },
    { packKey: "science|page", subject: "science", topic: "Page", grade: 3, lang: "en", source: "photo", libraryKey: "science|page|3|en", pack: { id: "y" }, sources: [] },
  ],
  chat: [
    { at: new Date(Date.now() - 100 * 86_400_000).toISOString(), role: "child", text: "old question" },
    { at: new Date().toISOString(), role: "child", text: "new question" },
  ],
  state: { stars: 12 },
  ...over,
});

describe("storage: fileStore", () => {
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "zaki-store-"));
    store = fresh();
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  it("is the file back end", () => assert.equal(store.kind, "file"));

  it("families: create, consent, withdraw; first names only", async () => {
    const { family, guardian } = await store.createFamily({ country: "LB", reportLang: "ar", guardian: { firstName: " Rana ", relationship: "mother" } });
    assert.equal(guardian.firstName, "Rana");
    assert.equal((await store.getFamily(family.id))?.country, "LB");
    await assert.rejects(store.createFamily({ guardian: { firstName: "Rana 0501234567", relationship: "mother" } }), /bad_name/);
    await assert.rejects(store.createFamily({ guardian: { firstName: "rana@mail.com", relationship: "mother" } }), /bad_name/);
    const c = await store.addConsent(family.id, { version: "2026-10-v1", kind: "ai_processing" });
    assert.equal(await store.withdrawConsent(family.id, c.id), true);
    assert.equal(await store.withdrawConsent(family.id, c.id), false, "already withdrawn");
    // survives a restart (new store object reading the same folder)
    assert.equal((await fresh().getFamily(family.id))?.reportLang, "ar");
  });

  it("rejects ids that could escape the data folder", async () => {
    await assert.rejects(store.getFamily("../../etc/passwd"), /bad_family_id/);
    await assert.rejects(store.deleteFamily("../x"), /bad_family_id/);
  });

  it("children get a random childRef; grade must be 1-6", async () => {
    const { family } = await store.createFamily({ guardian: { firstName: "Omar", relationship: "father" } });
    const child = await store.upsertChild({ familyId: family.id, nickname: "Ali", grade: 3, lang: "ar", avatar: "lion", dailyLimitMin: 30 });
    assert.match(child.childRef, /^[a-f0-9]{32}$/);
    await assert.rejects(store.upsertChild({ familyId: family.id, nickname: "Ali", grade: 9, lang: "ar", avatar: "lion", dailyLimitMin: 30 }), /bad_grade/);
    assert.equal((await store.listChildren(family.id)).length, 1);
  });

  it("progress sync round-trips; photo packs lose any library key", async () => {
    const { family } = await store.createFamily({ guardian: { firstName: "Omar", relationship: "father" } });
    const child = await store.upsertChild({ familyId: family.id, nickname: "Sara", grade: 2, lang: "en", avatar: "fox", dailyLimitMin: 30 });
    await store.syncProgress(family.id, child.childRef, snap());
    const back = await fresh().getProgress(family.id, child.childRef);
    assert.equal(back?.tests[0].score, 8);
    assert.equal(back?.state.stars, 12);
    assert.equal(back?.packs?.find((p) => p.source === "photo")?.libraryKey, undefined);
    assert.equal(back?.packs?.find((p) => p.source === "typed")?.libraryKey, "math|fractions|3|en");
    await assert.rejects(store.syncProgress(family.id, "nochild123", snap()), /child_not_found/);
  });

  it("flags: no names; reviewer route never reaches the parent alert list", async () => {
    const { family } = await store.createFamily({ guardian: { firstName: "Omar", relationship: "father" } });
    const home = await store.addFlag({ category: "disclosure_harm", route: "reviewer", involvesHome: true, speaker: "child", layers: ["keyword"], childRef: "abc12345", familyId: family.id, excerpt: "x".repeat(500) });
    assert.equal(home.excerpt.length, 200, "excerpt capped");
    await store.addFlag({ category: "violence_fear", route: "parent", involvesHome: false, alertLevel: "calm", speaker: "child", layers: [], childRef: "abc12345", familyId: family.id, excerpt: "scared" });
    const alerts = await store.parentAlerts(family.id);
    assert.equal(alerts.length, 1);
    assert.equal(alerts[0].category, "violence_fear");
    assert.equal("excerpt" in alerts[0], false);
    assert.equal((await store.listFlags({ status: "pending_review" })).length, 2);

    const reviewed = await store.reviewFlag(home.id, { status: "reviewed", reviewerNote: "ok", sharedWithParent: true });
    assert.equal(reviewed?.status, "reviewed");
    assert.equal((await store.parentAlerts(family.id)).length, 2, "reviewer chose to share");
    assert.equal(await store.reviewFlag("nope", { status: "closed" }), null);
  });

  it("reads old flag lines written by server/safety.ts (no route field)", async () => {
    const line = { id: "old-1", ts: "2026-10-10T00:00:00.000Z", category: "self_harm", involvesHome: false, alertParent: true, speaker: "child", lang: "en", layers: ["keyword"], excerpt: "...", status: "pending_review" };
    const line2 = { ...line, id: "old-2", involvesHome: true, alertParent: false };
    fs.writeFileSync(path.join(dir, "flags.jsonl"), JSON.stringify(line) + "\n" + JSON.stringify(line2) + "\n");
    const flags = await fresh().listFlags();
    assert.deepEqual(flags.map((f) => f.route), ["parent", "reviewer"]);
  });

  it("library: same file format as server/library.ts", async () => {
    const entry = { key: "math|fractions|3|en", pack: { id: "p", subject: "math", grade: 3, lang: "en" } as never, sources: [], verify: { checked: 3, removed: 0 }, savedAt: "2026-10-01T00:00:00.000Z" };
    await store.libraryPut(entry);
    assert.deepEqual(await fresh().libraryGet(entry.key), entry);
    assert.equal(await store.libraryGet("math|nothing|3|en"), null);
    assert.equal(fs.readdirSync(path.join(dir, "library")).length, 1);
  });

  it("budget: adds up per day, child turn cap, same file as server/budget.ts", async () => {
    assert.equal(await store.budgetAdd("2026-10-20", "tutor", 0.25), 0.25);
    assert.equal(await store.budgetAdd("2026-10-20", "lesson", 0.5), 0.75);
    const day = await fresh().budgetGet("2026-10-20");
    assert.deepEqual(day, { date: "2026-10-20", spentUsd: 0.75, byPurpose: { lesson: 0.5, tutor: 0.25, safety: 0 } });
    assert.equal((await store.budgetGet("2026-10-21")).spentUsd, 0, "new day starts at zero");
    const turns = [];
    const s2 = fresh();
    for (let i = 0; i < 3; i++) turns.push(await s2.childTurnTake("2026-10-22", "abc12345", 2));
    assert.deepEqual(turns, [true, true, false]);
    const saved = JSON.parse(fs.readFileSync(path.join(dir, "budget.json"), "utf8"));
    assert.deepEqual(Object.keys(saved).sort(), ["byPurpose", "childTurns", "date", "spentUsd"]);
    await assert.rejects(store.budgetAdd("2026-10-20", "tutor", -1), /bad_budget_entry/);
  });

  it("export holds everything for the family; delete removes it but keeps flags unlinked", async () => {
    const { family } = await store.createFamily({ guardian: { firstName: "Omar", relationship: "father" } });
    const child = await store.upsertChild({ familyId: family.id, nickname: "Sara", grade: 2, lang: "en", avatar: "fox", dailyLimitMin: 30 });
    await store.syncProgress(family.id, child.childRef, snap());
    await store.addFlag({ category: "disclosure_harm", route: "reviewer", involvesHome: true, speaker: "child", layers: [], childRef: child.childRef, familyId: family.id, excerpt: "[home words]" });
    const exp = await store.exportFamily(family.id);
    const text = JSON.stringify(exp);
    assert.ok(text.includes("Sara") && text.includes("Fractions"));
    assert.equal(text.includes("[home words]"), false, "reviewer-route words never in the parent export");

    assert.equal(await store.deleteFamily(family.id), true);
    assert.equal(await fresh().getFamily(family.id), null);
    assert.equal(await store.exportFamily(family.id), null);
    assert.equal(fs.existsSync(path.join(dir, "families", `${family.id}.json`)), false);
    const flags = await fresh().listFlags();
    assert.equal(flags.length, 1, "open safety flag is kept");
    assert.equal(flags[0].familyId, undefined, "but no longer linked to the family");
    assert.equal(await store.deleteFamily(family.id), false);
  });

  it("retention: chat older than ~90 days and reviewed flags older than ~30 days go; referrals stay", async () => {
    const { family } = await store.createFamily({ guardian: { firstName: "Omar", relationship: "father" } });
    const child = await store.upsertChild({ familyId: family.id, nickname: "Sara", grade: 2, lang: "en", avatar: "fox", dailyLimitMin: 30 });
    await store.syncProgress(family.id, child.childRef, snap());
    const a = await store.addFlag({ category: "violence_fear", route: "parent", involvesHome: false, speaker: "child", layers: [], excerpt: "a" });
    const b = await store.addFlag({ category: "disclosure_harm", route: "reviewer", involvesHome: true, speaker: "child", layers: [], excerpt: "b" });
    await store.addFlag({ category: "self_harm", route: "reviewer", involvesHome: false, speaker: "child", layers: [], excerpt: "c" });
    await store.reviewFlag(a.id, { status: "reviewed" });
    await store.reviewFlag(b.id, { status: "referred" });

    const later = new Date(Date.now() + 31 * 86_400_000);
    const report = await fresh().runRetention(later);
    assert.equal(report.flags, 1);
    assert.ok(report.chat >= 1);
    const left = await fresh().listFlags();
    assert.deepEqual(left.map((f) => f.status).sort(), ["pending_review", "referred"]);
    const prog = await fresh().getProgress(family.id, child.childRef);
    assert.ok(prog?.chat?.every((m) => m.text !== "old question"));
  });

  it("memory-only mode (no disk) still works", async () => {
    const mem = createFileStore({ dataDir: null, flagFile: null });
    const { family } = await mem.createFamily({ guardian: { firstName: "Mona", relationship: "guardian" } });
    assert.ok(await mem.getFamily(family.id));
    await mem.addFlag({ category: "other", route: "reviewer", involvesHome: false, speaker: "child", layers: [], excerpt: "x" });
    assert.equal((await mem.listFlags()).length, 1);
    assert.equal(await mem.budgetAdd("2026-10-20", "safety", 0.1), 0.1);
  });
});
