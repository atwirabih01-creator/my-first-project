import { demoMode, isClassifierCall, mockClaude, textMsg } from "./helpers";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { __resetLibraryForTests, getFromLibrary, libraryKey } from "../library";
import { buildLessonPack, type LessonPackResponse } from "../lessonPack";
import { getSamplePack } from "../samples";

const req = { subject: "math" as const, topic: "Fractions", grade: 3, lang: "en" as const, country: "LB" as const };
const NONE = '{"category":"none","involvesHome":false}';
const goodPack = () => JSON.stringify({ ...getSamplePack("math", "en"), pageText: "" });

/** Fake Claude that can write a valid pack; counts the (non-classifier) AI calls. */
function fakeAi() {
  return mockClaude((p) => {
    if (isClassifierCall(p)) return textMsg(NONE);
    if (p.tools?.length) return textMsg("A fraction is part of a whole.");
    return textMsg(goodPack());
  });
}
const aiCalls = (calls: { model: string; output_config?: unknown }[]) => calls.filter((c) => !isClassifierCall(c as never)).length;

describe("shared lesson library", () => {
  afterEach(() => demoMode());

  it("normalizes the key (case, spaces, punctuation)", () => {
    assert.equal(libraryKey("math", "  Fractions!! ", 3, "en"), libraryKey("math", "fractions", 3, "en"));
    assert.notEqual(libraryKey("math", "fractions", 3, "en"), libraryKey("math", "fractions", 4, "en"));
    assert.notEqual(libraryKey("math", "fractions", 3, "en"), libraryKey("math", "fractions", 3, "ar"));
  });

  it("typed topic: built once with AI, then served from the library at no AI cost (re-shuffled)", async () => {
    const calls = fakeAi();
    const first = (await buildLessonPack(req)) as LessonPackResponse;
    const used = aiCalls(calls);
    assert.ok(used >= 1);
    assert.equal(first.fromLibrary, undefined);
    const second = (await buildLessonPack({ ...req, topic: " fractions " })) as LessonPackResponse;
    assert.equal(second.fromLibrary, true);
    assert.equal(aiCalls(calls), used, "no new AI calls");
    assert.deepEqual(second.pack.test.map((q) => q.id).sort(), first.pack.test.map((q) => q.id).sort());
    // Each served copy is shuffled independently and keeps the right answer text.
    for (const q of second.pack.test) {
      const orig = first.pack.test.find((x) => x.id === q.id)!;
      assert.equal(q.choices[q.answerIndex], orig.choices[orig.answerIndex]);
    }
  });

  it("packs built from page photos are NEVER stored or shared", async () => {
    const calls = fakeAi();
    const jpeg = "/9j/" + "A".repeat(100);
    await buildLessonPack({ ...req, pageImages: [jpeg] });
    assert.equal(getFromLibrary(libraryKey("math", "Fractions", 3, "en")), null);
    const before = aiCalls(calls);
    const typed = (await buildLessonPack(req)) as LessonPackResponse;
    assert.equal(typed.fromLibrary, undefined, "typed request after a photo request is built fresh");
    assert.ok(aiCalls(calls) > before);
    // a photo request never reads from the library either
    const photoAgain = (await buildLessonPack({ ...req, pageImages: [jpeg] })) as LessonPackResponse;
    assert.equal(photoAgain.fromLibrary, undefined);
  });

  it("persists to server/data/library-style files and survives a restart", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "zaki-lib-"));
    fakeAi();
    __resetLibraryForTests(dir);
    await buildLessonPack(req);
    assert.equal(fs.readdirSync(dir).filter((f) => f.endsWith(".json")).length, 1);
    __resetLibraryForTests(dir); // restart: memory cleared, files kept
    demoMode(); // even with no AI key, the library still answers
    __resetLibraryForTests(dir);
    const r = (await buildLessonPack(req)) as LessonPackResponse;
    assert.equal(r.fromLibrary, true);
    __resetLibraryForTests(null);
  });
});
