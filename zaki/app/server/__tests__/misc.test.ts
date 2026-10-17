import "./helpers";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CheckAnswerError, checkAnswer } from "../checkAnswer";
import { getChildHelpRoutes, HELP_ROUTES_LAST_CHECKED } from "../help-routes";
import * as AppCopy from "../../src/lib/helpRoutes";
import { HttpError, __resetRateLimitsForTests, asChildRef, rateLimit, readJsonBody } from "../http";
import { getSamplePack } from "../samples";

const NOW = new Date("2026-10-17T10:00:00Z");

describe("help routes (fixed table)", () => {
  it("is the same table the app imports, checked 2026-10-16", () => {
    assert.equal(HELP_ROUTES_LAST_CHECKED, "2026-10-16");
    assert.equal(getChildHelpRoutes, AppCopy.getChildHelpRoutes);
  });
  it("Lebanon: trusted adult first; home -> himaya with the 112 fallback; fear -> 1564 and no police", () => {
    const home = getChildHelpRoutes("LB", "home", NOW);
    assert.equal(home[0].id, "trusted_adult");
    const himaya = home.find((r) => r.id === "lb_himaya")!;
    assert.equal(himaya.number, "03 414 964");
    assert.match(himaya.fallback!.en, /If nobody answers, or you are in danger now, call 112/);
    assert.ok(home.some((r) => r.number === "112"));
    const fear = getChildHelpRoutes("LB", "fear", NOW).map((r) => r.number);
    assert.deepEqual(fear, [null, "1564"]);
    assert.ok(!getChildHelpRoutes("LB", "general", NOW).some((r) => r.number === "919"));
  });
  it("Qatar: 919 (Aman); unknown country: trusted adult only; stale table: emergency only", () => {
    assert.deepEqual(getChildHelpRoutes("QA", "home", NOW).map((r) => r.number), [null, "919"]);
    assert.deepEqual(getChildHelpRoutes(undefined, "home", NOW).map((r) => r.id), ["trusted_adult"]);
    const stale = getChildHelpRoutes("LB", "fear", new Date("2027-01-01"));
    assert.deepEqual(stale.map((r) => r.number), [null, "112"]);
  });
});

describe("check-answer (deterministic)", () => {
  const pack = getSamplePack("math", "en");
  it("right / hint1 / hint2 / example", () => {
    assert.deepEqual(checkAnswer(pack, "c1", 0), { correct: true, feedbackKey: "right" });
    assert.deepEqual(checkAnswer(pack, "c1", "1/4"), { correct: true, feedbackKey: "right" });
    assert.equal(checkAnswer(pack, "c1", 1).feedbackKey, "hint1");
    assert.equal(checkAnswer(pack, "c1", 1, 2).feedbackKey, "hint2");
    assert.equal(checkAnswer(pack, "c1", 1, 3).feedbackKey, "example");
    assert.equal(checkAnswer(pack, "recap-0", 0).correct, true);
  });
  it("signs are compared exactly", () => {
    assert.equal(checkAnswer(pack, "c2", ">").correct, true);
    assert.equal(checkAnswer(pack, "c2", "<").correct, false);
  });
  it("unknown question is an error", () => {
    assert.throws(() => checkAnswer(pack, "nope", 0), CheckAnswerError);
  });
});

describe("http helpers", () => {
  it("caps body size and requires a JSON object", async () => {
    const big = new Request("http://x/api", { method: "POST", body: "x".repeat(5000) });
    await assert.rejects(readJsonBody(big, 4000), (e: HttpError) => e.status === 413);
    await assert.rejects(readJsonBody(new Request("http://x", { method: "POST", body: "[1]" }), 100), (e: HttpError) => e.status === 400);
    assert.deepEqual(await readJsonBody(new Request("http://x", { method: "POST", body: '{"a":1}' }), 100), { a: 1 });
  });
  it("rate-limits per client", () => {
    __resetRateLimitsForTests();
    const r = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4" } });
    for (let i = 0; i < 20; i++) rateLimit(r, "parent", 0);
    assert.throws(() => rateLimit(r, "parent", 0), (e: HttpError) => e.status === 429);
    rateLimit(new Request("http://x", { headers: { "x-forwarded-for": "5.6.7.8" } }), "parent", 0);
    rateLimit(r, "parent", 61_000); // new window
  });
  it("childRef must be a random id, never a name with spaces", () => {
    assert.equal(asChildRef("kid_123456"), "kid_123456");
    assert.equal(asChildRef(undefined), undefined);
    assert.throws(() => asChildRef("Ali Hassan"));
  });
});
