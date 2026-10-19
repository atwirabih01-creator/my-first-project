import { demoMode, fakeMessage, isClassifierCall, mockClaude, textMsg } from "./helpers";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { isTrustedUrl } from "../config/trustedSources";
import { LessonPackError, buildLessonPack, shufflePack, type LessonPackResponse } from "../lessonPack";
import { getSamplePack } from "../samples";

const req = { subject: "math" as const, topic: "Fractions", grade: 3, lang: "en" as const, country: "LB" as const };

describe("trusted sources", () => {
  it("allows only allow-listed hosts and paths", () => {
    assert.equal(isTrustedUrl("https://www.khanacademy.org/math/fractions"), true);
    assert.equal(isTrustedUrl("https://www.bbc.co.uk/bitesize/topics/x"), true);
    assert.equal(isTrustedUrl("https://www.bbc.co.uk/news/world"), false);
    assert.equal(isTrustedUrl("https://khanacademy.org.evil.com/"), false);
    assert.equal(isTrustedUrl("javascript:alert(1)"), false);
  });
});

describe("lesson pack builder", () => {
  afterEach(() => demoMode());

  it("demo mode returns a verified bundled sample (both languages, all subjects)", async () => {
    demoMode();
    for (const subject of ["math", "science", "english", "arabic", "social"] as const) {
      for (const lang of ["en", "ar"] as const) {
        const r = (await buildLessonPack({ ...req, subject, lang })) as LessonPackResponse;
        assert.equal(r.demo, true);
        assert.equal(r.pack.subject, subject);
        assert.equal(r.pack.lang, lang);
        assert.equal(r.verify.removed, 0);
      }
    }
  });

  it("AI mode: restricted web search, sources filtered, wrong math removed, images wrapped as data", async () => {
    const good = getSamplePack("math", "en");
    const raw = { ...good, pageText: "" } as Record<string, unknown> & typeof good;
    raw.test = structuredClone(good.test);
    raw.test.push({ ...structuredClone(good.test[1]), id: "t6", answerIndex: 1 }); // wrong key -> removed
    const calls = mockClaude((p) => {
      if (isClassifierCall(p)) return textMsg('{"category":"none","involvesHome":false}');
      if (p.tools?.length) {
        return fakeMessage([
          { type: "web_search_tool_result", tool_use_id: "s1", content: [
            { type: "web_search_result", url: "https://www.khanacademy.org/math/fractions", title: "Fractions", encrypted_content: "x", page_age: null },
            { type: "web_search_result", url: "https://random-blog.example.com/fractions", title: "Blog", encrypted_content: "x", page_age: null },
          ] },
          { type: "text", text: "A fraction is part of a whole.", citations: null },
        ]);
      }
      return textMsg(JSON.stringify(raw));
    });
    const jpeg = "/9j/" + "A".repeat(100);
    const r = (await buildLessonPack({ ...req, pageImages: [jpeg] })) as LessonPackResponse;
    assert.deepEqual(r.sources, [{ url: "https://www.khanacademy.org/math/fractions", title: "Fractions" }]);
    assert.equal(r.verify.removed, 1);
    assert.ok(!r.pack.test.some((q) => q.id === "t6"));
    const research = calls.find((c) => c.tools?.length)!;
    const tool = research.tools![0] as { type: string; allowed_domains: string[] };
    assert.equal(tool.type, "web_search_20250305");
    assert.ok(tool.allowed_domains.includes("khanacademy.org"));
    assert.ok(!JSON.stringify(research.messages).includes("image"), "no photos in the research call");
    const writer = calls.find((c) => (c.output_config as { format?: unknown })?.format && !isClassifierCall(c))!;
    const content = JSON.stringify(writer.messages);
    assert.ok(content.includes("<page_text_images>"));
    assert.ok(content.includes("lesson DATA"));
    assert.equal(writer.model, "claude-sonnet-5-5");
  });

  it("invalid JSON twice -> clear error", async () => {
    mockClaude((p) => (p.tools?.length ? textMsg("notes") : textMsg("not json")));
    await assert.rejects(buildLessonPack(req), LessonPackError);
  });

  it("rejects a non-JPEG image before any AI call", async () => {
    const calls = mockClaude(() => textMsg("x"));
    await assert.rejects(buildLessonPack({ ...req, pageImages: ["iVBORw0KGgo="] }), /JPEG/);
    assert.equal(calls.length, 0);
  });

  it("shuffle keeps the right answer attached", () => {
    const p = getSamplePack("science", "en");
    const s = shufflePack(p);
    s.test.forEach((q, i) => assert.equal(q.choices[q.answerIndex], p.test[i].choices[p.test[i].answerIndex]));
  });
});
