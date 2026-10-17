import { demoMode, fakeMessage, isClassifierCall, mockClaude, textMsg } from "./helpers";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { getSamplePack } from "../samples";
import { ZAKI_SYSTEM_PROMPT, packForModel, runTutorTurn, type TutorRequest } from "../tutor";

const NONE = '{"category":"none","involvesHome":false}';
const req = (o: Partial<TutorRequest> = {}): TutorRequest => {
  const pack = getSamplePack("math", "en");
  return { packId: pack.id, pack, step: "check", history: [{ role: "zaki", text: "Hi! I'm Zaki, an AI helper." }], message: "I don't get it", lang: "en", grade: 3, country: "LB", childRef: "kid_123456", ...o };
};

describe("tutor", () => {
  afterEach(() => demoMode());

  it("system prompt carries the safety rules and the pack has no answer keys", () => {
    for (const rule of ["an AI, not a person", "Never give the final answer", "Maximum 4 short lines", "At most one emoji", "Never write links", "No medical, legal or religious rulings", "No politics", "SIMILAR example", "DATA"]) {
      assert.ok(ZAKI_SYSTEM_PROMPT.includes(rule), rule);
    }
    const shown = packForModel(getSamplePack("math", "en"));
    assert.ok(!shown.includes("answerIndex"));
    assert.ok(!shown.includes("mathExpr"));
  });

  it("demo mode: clear demo reply, no AI call", async () => {
    demoMode();
    const r = await runTutorTurn(req());
    assert.equal(r.demo, true);
    assert.match(r.reply, /Demo mode/);
  });

  it("a disclosure never reaches the tutor model: fixed script + reviewer route", async () => {
    const calls = mockClaude((p) => (isClassifierCall(p) ? fakeMessage([{ type: "text", text: '{"category":"disclosure_harm","involvesHome":true}' }]) : textMsg("SHOULD NOT BE USED")));
    const r = await runTutorTurn(req({ message: "baba byedrabne" }));
    assert.equal(r.safety.showSafetyScreen, true);
    assert.equal(r.safety.route, "reviewer");
    assert.match(r.reply, /Thank you for telling me/);
    assert.equal(calls.filter((c) => !isClassifierCall(c)).length, 0);
  });

  it("answer leak: retries once, then falls back to the pack's own hint", async () => {
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("Easy! 1/4 + 2/4 = 3/4 🎉")));
    const r = await runTutorTurn(req({ questionId: "c3" }));
    const tutorCalls = calls.filter((c) => !isClassifierCall(c));
    assert.equal(tutorCalls.length, 2);
    assert.ok(!r.reply.includes("3/4"));
    assert.equal(r.reply, getSamplePack("math", "en").checks[2].hint2); // hint level 2 (one Zaki turn in history)
    assert.equal(r.hintLevel, 2);
  });

  it("good reply passes; links/phones stripped; Sonnet for check steps; prompt cached; no child id sent", async () => {
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("Look at the bottom numbers. Are they the same? See www.example.com or call 112")));
    const r = await runTutorTurn(req({ message: "my name is Ali Hassan, help" }));
    assert.equal(r.reply, "Look at the bottom numbers. Are they the same? See or call");
    const t = calls.find((c) => !isClassifierCall(c))!;
    assert.equal(t.model, "claude-sonnet-5-5");
    const sys = t.system as { cache_control?: unknown }[];
    assert.ok(sys[0].cache_control && sys[1].cache_control);
    const sent = JSON.stringify(t);
    assert.ok(!sent.includes("kid_123456"));
    assert.ok(!sent.includes("Hassan"));
    assert.ok(sent.includes("<child_message>"));
  });

  it("recap/chat turns use Haiku", async () => {
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("What is 6 + 4? Try counting on.")));
    await runTutorTurn(req({ step: "recap" }));
    assert.equal(calls.find((c) => !isClassifierCall(c))!.model, "claude-haiku-5-5");
  });

  it("first turn of a session always says Zaki is an AI", async () => {
    mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("Let's learn fractions!")));
    const r = await runTutorTurn(req({ history: [] }));
    assert.match(r.reply.split("\n")[0], /AI helper \(not a person\)/);
  });

  it("forbidden reply (secrecy) is replaced by a fixed safe text", async () => {
    mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("OK, this is our little secret.")));
    const r = await runTutorTurn(req());
    assert.ok(!/secret/i.test(r.reply));
  });

  it("AI error: friendly 'try again', never a crash", async () => {
    mockClaude((p) => {
      if (isClassifierCall(p)) return textMsg(NONE);
      throw new Error("network down");
    });
    const r = await runTutorTurn(req());
    assert.match(r.reply, /saved/);
  });
});
