import { demoMode, isClassifierCall, mockClaude, textMsg } from "./helpers";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { recordUsage } from "../budget";
import { buildExam } from "../exam";
import { examBreakdown, mixExamQuestions } from "../examMix";
import { getSamplePack } from "../samples";

const lessons = [
  { lessonKey: "math:fractions", pack: getSamplePack("math", "en") },
  { lessonKey: "science:water", pack: getSamplePack("science", "en") },
  { lessonKey: "social:maps", pack: getSamplePack("social", "en") },
];

describe("exam builder (mix, no AI)", () => {
  afterEach(() => demoMode());

  it("balanced per lesson, unique ids, right answers kept after shuffling", () => {
    const qs = mixExamQuestions(lessons, 15);
    assert.equal(qs.length, 15);
    const per = qs.reduce<Record<string, number>>((a, q) => ((a[q.lessonKey] = (a[q.lessonKey] ?? 0) + 1), a), {});
    assert.deepEqual(Object.values(per).sort(), [5, 5, 5]);
    assert.equal(new Set(qs.map((q) => q.id)).size, 15);
    const all = lessons.flatMap((l) => [...l.pack.test, ...l.pack.retestPool, ...l.pack.checks]);
    for (const q of qs) {
      const orig = all.find((o) => o.q === q.q)!;
      assert.equal(q.choices[q.answerIndex], orig.choices[orig.answerIndex]);
    }
    assert.equal(new Set(qs.map((q) => q.q)).size, 15, "no duplicate questions");
  });

  it("caps at what the lessons have; breakdown per lesson", () => {
    const one = mixExamQuestions([lessons[0]], 30);
    const p = lessons[0].pack;
    assert.ok(one.length <= p.test.length + p.retestPool.length + p.checks.length);
    const answers = one.map((q, i) => (i % 2 === 0 ? q.answerIndex : -1));
    const b = examBreakdown(one, answers);
    assert.equal(b["math:fractions"].total, one.length);
    assert.equal(b["math:fractions"].correct, Math.ceil(one.length / 2));
  });

  it("demo mode: mix only, no AI", async () => {
    demoMode();
    const r = await buildExam({ subject: "math", lang: "en", grade: 3, count: 10, lessons });
    assert.equal(r.demo, true);
    assert.equal(r.added, 0);
    assert.equal(r.questions.length, 10);
  });

  it("AI mode: adds NEW questions; a math question with a wrong key is dropped by verify.ts", async () => {
    mockClaude((p) =>
      isClassifierCall(p)
        ? textMsg('{"category":"none","involvesHome":false}')
        : textMsg(
            JSON.stringify({
              questions: [
                { lessonIndex: 0, q: "What is 1/4 + 2/4?", choices: ["3/4", "3/8", "1/2"], answerIndex: 0, hint1: "Same bottom number.", hint2: "Add the tops.", similarExample: "1/5 + 2/5 = 3/5", kind: "math", mathExpr: "1/4 + 2/4" },
                { lessonIndex: 0, q: "What is 1/3 + 1/3?", choices: ["2/3", "2/6", "1/3"], answerIndex: 1, hint1: "h", hint2: "h", similarExample: "e", kind: "math", mathExpr: "1/3 + 1/3" },
                { lessonIndex: 1, q: "Rain falling from clouds is called?", choices: ["Precipitation", "Evaporation", "Melting"], answerIndex: 0, hint1: "It falls.", hint2: "Starts with P.", similarExample: "Snow falling is also this.", kind: "text" },
              ],
            }),
          ),
    );
    const r = await buildExam({ subject: "math", lang: "en", grade: 3, count: 12, lessons });
    assert.equal(r.added, 2, "the wrong-key math question was removed");
    assert.equal(r.questions.length, 12);
    const added = r.questions.find((q) => q.q === "What is 1/4 + 2/4?")!;
    assert.equal(added.choices[added.answerIndex], "3/4");
    assert.ok(!r.questions.some((q) => q.q === "What is 1/3 + 1/3?"));
  });

  it("over budget: mix only, flagged budgetReached", async () => {
    mockClaude(() => textMsg("{}"));
    recordUsage("claude-sonnet-5-5", { input_tokens: 600_000 }, "lesson");
    const r = await buildExam({ subject: "math", lang: "en", grade: 3, count: 10, lessons });
    assert.equal(r.budgetReached, true);
    assert.equal(r.questions.length, 10);
  });
});
