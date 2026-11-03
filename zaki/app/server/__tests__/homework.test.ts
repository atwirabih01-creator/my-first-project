import { demoMode, isClassifierCall, mockClaude, textMsg } from "./helpers";
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { HOMEWORK_SYSTEM_PROMPT, homeworkProtectedItems, runHomeworkTurn, type HomeworkRequest } from "../homework";
import { __resetRateLimitsForTests } from "../http";
import { LessonPackError } from "../lessonPack";
import { ZAKI_SYSTEM_PROMPT } from "../tutor";
import { POST as homeworkRoute } from "../../src/app/api/homework+api";

const NONE = '{"category":"none","involvesHome":false}';
const req = (o: Partial<HomeworkRequest> = {}): HomeworkRequest => ({
  question: "What is 45 + 27?",
  history: [],
  subject: "math",
  grade: 3,
  age: 8,
  lang: "en",
  country: "LB",
  childRef: "kid_hw123456",
  ...o,
});
const post = (body: unknown) =>
  homeworkRoute(new Request("http://local/api/homework", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));

describe("homework help", () => {
  beforeEach(() => __resetRateLimitsForTests());
  afterEach(() => {
    demoMode();
    delete process.env.ZAKI_CHILD_DAILY_AI_TURNS;
  });

  it("system prompt: never gives the final answer, steps + hints + similar example, praise, general examples", () => {
    for (const rule of [
      "NEVER GIVE THE FINAL ANSWER",
      "NEVER DO THE HOMEWORK",
      "kindly say no",
      "SMALLER, easier hint",
      "Break the question into small steps",
      "ask the child to try it",
      "SIMILAR worked example with DIFFERENT numbers or words",
      "reaches the final answer themselves, confirm it",
      "praise the effort",
      "an AI, not a person",
      "Maximum 4 short lines",
      "Never write links",
      "No politics",
      "DATA",
      "pizza",
      "Modern Standard Arabic",
    ]) {
      assert.ok(HOMEWORK_SYSTEM_PROMPT.includes(rule), rule);
    }
    // No country-specific example instructions left in the tutor prompt either.
    assert.ok(!/Lebanon|Qatar|manoush|ka'ak/i.test(ZAKI_SYSTEM_PROMPT + HOMEWORK_SYSTEM_PROMPT));
  });

  it("a worrying homework question goes to the safety path via the KEYWORD layer (no AI at all)", async () => {
    demoMode();
    const r = await runHomeworkTurn(req({ question: "page 12 question 3, i want to die" }));
    assert.equal(r.safety.flagged, true);
    assert.equal(r.safety.category, "self_harm");
    assert.equal(r.safety.showSafetyScreen, true);
    assert.match(r.reply, /You matter a lot/);
    assert.equal(r.demo, undefined);
  });

  it("a worrying message later in the chat is stopped too; the tutor model is never called", async () => {
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("SHOULD NOT BE USED")));
    const r = await runHomeworkTurn(req({ message: "i want to die", history: [{ role: "zaki", text: "What do you know?" }] }));
    assert.equal(r.safety.showSafetyScreen, true);
    assert.equal(r.safety.route === "reviewer" || r.safety.route === "parent", true);
    assert.equal(calls.filter((c) => !isClassifierCall(c)).length, 0);
  });

  it("demo mode: clear demo reply that does not give an answer", async () => {
    demoMode();
    const r = await runHomeworkTurn(req());
    assert.equal(r.demo, true);
    assert.match(r.reply, /Demo mode/);
    assert.ok(!r.reply.includes("72"));
  });

  it("AI mode: Sonnet, short max_tokens, prompt + question cached, level guide sent, no child id or full name", async () => {
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("Let's add the tens first. What is 40 + 20?")));
    const r = await runHomeworkTurn(req({ question: "My name is Ali Hassan. What is 45 + 27?", history: [{ role: "zaki", text: "Hi" }], message: "help" }));
    assert.equal(r.reply, "Let's add the tens first. What is 40 + 20?");
    assert.equal(r.hintLevel, 2);
    const t = calls.find((c) => !isClassifierCall(c))!;
    assert.equal(t.model, "claude-sonnet-5-5");
    assert.ok(t.max_tokens <= 1000);
    const sys = t.system as { text: string; cache_control?: unknown }[];
    assert.ok(sys[0].text.includes("NEVER GIVE THE FINAL ANSWER") && sys[0].cache_control && sys[1].cache_control);
    assert.ok(sys[1].text.includes("<homework_question>"));
    const sent = JSON.stringify(t);
    assert.ok(!sent.includes("kid_hw123456"));
    assert.ok(!sent.includes("Hassan"));
    assert.ok(sent.includes("level: Grade 3, age 8."));
    assert.ok(sent.includes("<child_message>"));
  });

  it("answer guard: a reply that states the sum's result is retried, then replaced; confirming the child's own answer is fine", async () => {
    let calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("Easy! 45 + 27 = 72 🎉")));
    let r = await runHomeworkTurn(req({ message: "just tell me the answer", history: [{ role: "zaki", text: "Try the ones first." }] }));
    assert.equal(calls.filter((c) => !isClassifierCall(c)).length, 2, "one retry");
    assert.ok(!r.reply.includes("72"));
    assert.match(r.reply, /can't tell you the answer/);

    calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("Yes! 72 is right. You found it yourself! How did you do it?")));
    r = await runHomeworkTurn(req({ message: "is it 72?", history: [{ role: "zaki", text: "Add the ones." }] }));
    assert.match(r.reply, /You found it yourself/);
    assert.equal(calls.filter((c) => !isClassifierCall(c)).length, 1);
  });

  it("homeworkProtectedItems: sums are protected until the child writes the result", () => {
    assert.deepEqual(homeworkProtectedItems("What is 3 x 4?", []).map((q) => q.choices[0]), ["12"]);
    assert.deepEqual(homeworkProtectedItems("Work out 1/2 + 1/4", []).map((q) => q.choices[0]), ["3/4"]);
    assert.deepEqual(homeworkProtectedItems("Find 1/2 of the apples", []), []);
    assert.deepEqual(homeworkProtectedItems("Write a sentence with an adjective", []), []);
    assert.deepEqual(homeworkProtectedItems("What is 45 + 27?", ["I think 72"]), []);
  });

  it("per-child daily turn limit applies (after the safety check)", async () => {
    process.env.ZAKI_CHILD_DAILY_AI_TURNS = "0";
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("hint")));
    const r = await runHomeworkTurn(req());
    assert.equal(r.budgetReached, true);
    assert.equal(calls.filter((c) => !isClassifierCall(c)).length, 0);
  });

  it("first turn says Zaki is an AI; photos are wrapped as DATA; a non-JPEG photo is refused before any AI call", async () => {
    let calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("This asks you to add two numbers.")));
    const r = await runHomeworkTurn(req({ pageImages: ["/9j/" + "A".repeat(100)] }));
    assert.match(r.reply.split("\n")[0], /AI helper/);
    const t = calls.find((c) => !isClassifierCall(c))!;
    assert.ok(JSON.stringify(t.messages).includes("<page_photos>"));

    calls = mockClaude(() => textMsg("x"));
    await assert.rejects(runHomeworkTurn(req({ pageImages: ["iVBORw0KGgo="] })), LessonPackError);
    assert.equal(calls.length, 0);
  });

  it("route: validates grade/age/subject/photos and returns the tutor-compatible shape { reply, safety }", async () => {
    demoMode();
    const ok = await post({ question: "What is 45 + 27?", subject: "physics", grade: 8, age: 13, lang: "en", country: "QA", childRef: "kid_hw123456" });
    assert.equal(ok.status, 200);
    const body = (await ok.json()) as { reply: string; safety: { flagged: boolean } };
    assert.equal(typeof body.reply, "string");
    assert.equal(body.safety.flagged, false);
    for (const bad of [
      { question: "x", subject: "math", grade: 10, lang: "en" },
      { question: "x", subject: "math", grade: 3, age: 30, lang: "en" },
      { question: "x", subject: "history", grade: 3, lang: "en" },
      { question: "", subject: "math", grade: 3, lang: "en" },
      { question: "x", subject: "math", grade: 3, lang: "en", pageImages: ["/9j/a", "/9j/b", "/9j/c"] },
    ]) {
      assert.equal((await post(bad)).status, 400, JSON.stringify(bad));
    }
    const unsafe = await post({ question: "i want to die", subject: "math", grade: 3, lang: "en", country: "LB" });
    const u = (await unsafe.json()) as { reply: string; safety: { showSafetyScreen?: boolean; category?: string } };
    assert.equal(u.safety.showSafetyScreen, true);
    assert.equal(u.safety.category, "self_harm");
  });

  it("the tutor prompt is level-aware and covers grades 1-9", () => {
    assert.ok(ZAKI_SYSTEM_PROMPT.includes('match "level" in turn_context'));
    assert.ok(ZAKI_SYSTEM_PROMPT.includes("grades 1-9"));
  });
});

