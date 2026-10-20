import { demoMode, fakeMessage, isClassifierCall, mockClaude, textMsg } from "./helpers";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { callClaude } from "../ai";
import {
  BudgetExceededError,
  __resetBudgetForTests,
  budgetStatus,
  canSpend,
  estimateCostUsd,
  recordUsage,
  takeChildTurn,
} from "../budget";
import { buildLessonPack } from "../lessonPack";
import { getSamplePack } from "../samples";
import { runTutorTurn, type TutorRequest } from "../tutor";

const NONE = '{"category":"none","involvesHome":false}';
const tutorReq = (o: Partial<TutorRequest> = {}): TutorRequest => {
  const pack = getSamplePack("math", "en");
  return { packId: pack.id, pack, step: "chat", history: [{ role: "zaki", text: "Hi! I'm Zaki, an AI helper." }], message: "what is a fraction", lang: "en", grade: 3, country: "LB", childRef: "kid_123456", ...o };
};
/** Pretend $X was already spent today. */
const spend = (usd: number) => recordUsage("claude-sonnet-5-5", { input_tokens: Math.round((usd / 2) * 1_000_000) }, "tutor");

describe("daily AI budget", () => {
  afterEach(() => {
    demoMode();
    delete process.env.ZAKI_DAILY_BUDGET_USD;
    delete process.env.ZAKI_CHILD_DAILY_AI_TURNS;
  });

  it("estimates cost from token usage x prices (Sonnet, Haiku, cache read, web search)", () => {
    assert.equal(estimateCostUsd("claude-sonnet-5-5", { input_tokens: 1_000_000 }), 2);
    assert.equal(estimateCostUsd("claude-sonnet-5-5", { output_tokens: 1_000_000 }), 10);
    assert.equal(estimateCostUsd("claude-sonnet-5-5", { cache_read_input_tokens: 1_000_000 }), 0.1);
    assert.equal(estimateCostUsd("claude-haiku-5-5", { input_tokens: 1_000_000, output_tokens: 1_000_000 }), 0.6);
    assert.equal(estimateCostUsd("claude-sonnet-5-5", { server_tool_use: { web_search_requests: 3 } }), 0.03);
    assert.equal(estimateCostUsd("claude-sonnet-5-5", null), 0);
  });

  it("default limit is $1.00; env overrides; health status reports used/remaining", async () => {
    __resetBudgetForTests(null);
    assert.equal((await budgetStatus()).limitUsd, 1);
    process.env.ZAKI_DAILY_BUDGET_USD = "2.5";
    await spend(0.5);
    const s = await budgetStatus();
    assert.equal(s.limitUsd, 2.5);
    assert.equal(s.spentUsd, 0.5);
    assert.equal(s.remainingUsd, 2);
    assert.equal(s.reached, false);
  });

  it("over budget: teaching calls refused; safety classifier may use the 10% reserve, then stops", async () => {
    mockClaude(() => textMsg("ok"));
    await spend(1.0);
    assert.equal(await canSpend("tutor"), false);
    assert.equal(await canSpend("lesson"), false);
    assert.equal(await canSpend("safety"), true);
    await assert.rejects(callClaude({ model: "claude-sonnet-5-5", max_tokens: 10, messages: [] }, { purpose: "tutor" }), BudgetExceededError);
    await callClaude({ model: "claude-haiku-5-5", max_tokens: 10, messages: [] }, { purpose: "safety" });
    await spend(0.2);
    assert.equal(await canSpend("safety"), false);
  });

  it("tutor over budget: friendly fixed reply, no tutor model call", async () => {
    const calls = mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("SHOULD NOT BE USED")));
    await spend(1.0);
    const r = await runTutorTurn(tutorReq());
    assert.equal(r.budgetReached, true);
    assert.match(r.reply, /flashcards/);
    assert.equal(calls.filter((c) => !isClassifierCall(c)).length, 0);
  });

  it("keyword safety ALWAYS runs, even with the whole budget and reserve used up", async () => {
    mockClaude(() => textMsg(NONE));
    await spend(5);
    const r = await runTutorTurn(tutorReq({ message: "baba darabne" }));
    assert.equal(r.safety.showSafetyScreen, true);
    assert.match(r.reply, /Thank you for telling me/);
  });

  it("per-child daily AI turns (ZAKI_CHILD_DAILY_AI_TURNS)", async () => {
    process.env.ZAKI_CHILD_DAILY_AI_TURNS = "2";
    mockClaude((p) => (isClassifierCall(p) ? textMsg(NONE) : textMsg("A fraction is part of a whole.")));
    assert.equal((await runTutorTurn(tutorReq())).budgetReached, undefined);
    assert.equal((await runTutorTurn(tutorReq())).budgetReached, undefined);
    const third = await runTutorTurn(tutorReq());
    assert.equal(third.budgetReached, true);
    // another child still has turns
    assert.equal((await runTutorTurn(tutorReq({ childRef: "kid_other1" }))).budgetReached, undefined);
    assert.equal(await takeChildTurn("kid_123456"), false);
  });

  it("lesson pack over budget returns { budgetReached: true } without calling AI", async () => {
    const calls = mockClaude(() => textMsg("{}"));
    await spend(1.0);
    const r = await buildLessonPack({ subject: "math", topic: "Decimals", grade: 4, lang: "en", country: "LB" });
    assert.deepEqual(r, { budgetReached: true });
    assert.equal(calls.length, 0);
  });

  it("records real spend from replies and keeps a daily total in a JSON file", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "zaki-budget-"));
    const file = path.join(dir, "budget.json");
    mockClaude(() => fakeMessage([{ type: "text", text: "hi", citations: null }]));
    __resetBudgetForTests(file);
    await recordUsage("claude-haiku-5-5", { input_tokens: 1_000_000 }, "safety");
    const saved = JSON.parse(fs.readFileSync(file, "utf8"));
    assert.equal(saved.spentUsd, 0.1);
    __resetBudgetForTests(file); // simulate a server restart: total is reloaded
    assert.equal((await budgetStatus()).spentUsd, 0.1);
    __resetBudgetForTests(null);
  });
});
