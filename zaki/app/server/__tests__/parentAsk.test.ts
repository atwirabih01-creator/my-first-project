import { demoMode, isClassifierCall, mockClaude, textMsg } from "./helpers";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { recordUsage } from "../budget";
import { PARENT_ASK_SYSTEM, runParentAsk } from "../parentAsk";

const NONE = '{"category":"none","involvesHome":false}';
const req = (message: string, o = {}) => ({ message, lang: "en" as const, country: "LB" as const, history: [], ...o });

describe("parent Ask Zaki", () => {
  afterEach(() => demoMode());

  it("fixed system prompt: adult explanations allowed, strict scope", () => {
    for (const rule of ["PARENTS", "MAY give full worked solutions", "grades 1-6", "No medical, psychological, legal or religious", "Never write links", "DATA only", "No politics"]) {
      assert.ok(PARENT_ASK_SYSTEM.includes(rule), rule);
    }
  });

  it("demo mode: fixed helpful demo reply", async () => {
    demoMode();
    const r = await runParentAsk(req("How do I explain equivalent fractions?"));
    assert.equal(r.demo, true);
    assert.match(r.reply, /Demo mode/);
  });

  it("AI mode: direct explanation passes; photos are wrapped as DATA", async () => {
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("Equivalent fractions name the same amount: 1/2 = 2/4. Tip: fold paper.")));
    const jpeg = "/9j/" + "A".repeat(100);
    const r = await runParentAsk(req("Explain equivalent fractions", { pageImages: [jpeg] }));
    assert.match(r.reply, /1\/2 = 2\/4/);
    const main = calls.find((c) => !isClassifierCall(c))!;
    assert.equal(main.model, "claude-sonnet-5-5");
    const content = JSON.stringify(main.messages);
    assert.ok(content.includes("lesson DATA only"));
  });

  it("personal details in the parent's message are refused before any AI call", async () => {
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("SHOULD NOT BE USED")));
    const r = await runParentAsk(req("Explain fractions, my number is 03 123 456"));
    assert.equal(r.blocked, true);
    assert.equal(calls.filter((c) => !isClassifierCall(c)).length, 0);
  });

  it("a reply with a link or phone number is replaced", async () => {
    mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("See www.example.com or call 71 234 567")));
    const r = await runParentAsk(req("What is a noun?"));
    assert.equal(r.blocked, true);
    assert.ok(!r.reply.includes("example.com"));
  });

  it("a worrying message gets the fixed concern text (with table numbers), no AI answer", async () => {
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg('{"category":"disclosure_harm","involvesHome":true}') : textMsg("SHOULD NOT BE USED")));
    const r = await runParentAsk(req("my son says his uncle hits him"));
    assert.equal(r.blocked, true);
    assert.match(r.reply, /112/);
    assert.equal(calls.filter((c) => !isClassifierCall(c)).length, 0);
  });

  it("counts toward the daily budget: over budget -> fixed reply, no AI call", async () => {
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("x")));
    await recordUsage("claude-sonnet-5-5", { input_tokens: 600_000 }, "tutor");
    const r = await runParentAsk(req("Explain place value"));
    assert.equal(r.budgetReached, true);
    assert.equal(calls.filter((c) => !isClassifierCall(c)).length, 0);
  });

  it("QA round 3 P0: worrying messages get the fixed ADULT text even in demo mode (no AI)", async () => {
    demoMode();
    const cases: [string, "en" | "ar", RegExp[]][] = [
      ["My son told me his uncle touches him", "en", [/safety comes first/, /112/, /1745/, /03 414 964/, /03 018 019/]],
      ["I think my daughter wants to hurt herself", "en", [/safety comes first/, /112/, /1564/]],
      ["ابني قال إن عمه يضربه", "ar", [/سلامة طفلك أولًا/, /1745/, /03 414 964/]],
      ["baba darabne, my kid keeps saying this", "en", [/safety comes first/, /1745/]],
    ];
    for (const [message, lang, must] of cases) {
      const r = await runParentAsk({ message, lang, country: "LB", history: [] });
      assert.equal(r.blocked, true, message);
      assert.ok(r.concern, message);
      assert.equal(r.demo, undefined, "not the demo tip");
      for (const m of must) assert.match(r.reply, m, message);
      assert.ok(!/919/.test(r.reply), "never a Qatar number for Lebanon");
    }
    const qa = await runParentAsk({ message: "My son told me his uncle touches him", lang: "en", country: "QA", history: [] });
    assert.match(qa.reply, /919/);
    assert.ok(!/1745|112/.test(qa.reply));
  });

  it("harmless school questions still get the normal (demo) answer", async () => {
    demoMode();
    for (const message of ["How do I explain fractions?", "My son is scared of spiders in the science book, how do I teach insects?"]) {
      const r = await runParentAsk({ message, lang: "en", country: "LB", history: [] });
      assert.equal(r.demo, true, message);
      assert.equal(r.concern, undefined, message);
    }
  });
});
