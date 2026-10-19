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
  it("Lebanon: trusted adult first; 112 danger line on every screen; home -> 1564 + himaya with the 112 fallback; fear -> 112 + 1564, no police wording", () => {
    const home = getChildHelpRoutes("LB", "home", NOW);
    assert.equal(home[0].id, "trusted_adult");
    const himaya = home.find((r) => r.id === "lb_himaya")!;
    assert.equal(himaya.number, "03 414 964");
    assert.match(himaya.fallback!.en, /If nobody answers, or you are in danger now, call 112/);
    assert.ok(home.some((r) => r.number === "112"));
    assert.ok(home.some((r) => r.number === "1564"));
    const fearRoutes = getChildHelpRoutes("LB", "fear", NOW);
    assert.deepEqual(fearRoutes.map((r) => r.number), [null, "112", "1564"]);
    for (const r of fearRoutes) assert.ok(!/police/i.test(r.text.en) && !/الشرطة/.test(r.text.ar));
    for (const kind of ["home", "self_harm", "fear", "general"] as const) {
      const routes = getChildHelpRoutes("LB", kind, NOW);
      assert.equal(routes[0].id, "trusted_adult");
      assert.ok(routes.some((r) => r.number === "112"), kind);
    }
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
  it("rate-limits per client (only trusts X-Forwarded-For with TRUST_PROXY=1)", () => {
    const before = process.env.TRUST_PROXY;
    process.env.TRUST_PROXY = "1";
    __resetRateLimitsForTests();
    const r = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4" } });
    for (let i = 0; i < 20; i++) rateLimit(r, "parent", 0);
    assert.throws(() => rateLimit(r, "parent", 0), (e: HttpError) => e.status === 429);
    rateLimit(new Request("http://x", { headers: { "x-forwarded-for": "5.6.7.8" } }), "parent", 0);
    rateLimit(r, "parent", 61_000); // new window
    if (before === undefined) delete process.env.TRUST_PROXY;
    else process.env.TRUST_PROXY = before;
  });
  it("a spoofed X-Forwarded-For does not reset the limit when TRUST_PROXY is unset", () => {
    const before = process.env.TRUST_PROXY;
    delete process.env.TRUST_PROXY;
    __resetRateLimitsForTests();
    for (let i = 0; i < 20; i++) rateLimit(new Request("http://x", { headers: { "x-forwarded-for": `9.9.9.${i}` } }), "parent", 0);
    assert.throws(
      () => rateLimit(new Request("http://x", { headers: { "x-forwarded-for": "1.1.1.1" } }), "parent", 0),
      (e: HttpError) => e.status === 429,
    );
    if (before !== undefined) process.env.TRUST_PROXY = before;
  });
  it("ZAKI_RATE_LIMIT_OFF=1 skips limiting outside production only", () => {
    const penv = process.env as Record<string, string | undefined>;
    const env = { off: penv.ZAKI_RATE_LIMIT_OFF, node: penv.NODE_ENV };
    __resetRateLimitsForTests();
    penv.ZAKI_RATE_LIMIT_OFF = "1";
    penv.NODE_ENV = "test";
    for (let i = 0; i < 50; i++) rateLimit(new Request("http://x"), "parent", 0);
    penv.NODE_ENV = "production";
    __resetRateLimitsForTests();
    for (let i = 0; i < 20; i++) rateLimit(new Request("http://x"), "parent", 0);
    assert.throws(() => rateLimit(new Request("http://x"), "parent", 0), (e: HttpError) => e.status === 429);
    if (env.off === undefined) delete penv.ZAKI_RATE_LIMIT_OFF;
    else penv.ZAKI_RATE_LIMIT_OFF = env.off;
    if (env.node === undefined) delete penv.NODE_ENV;
    else penv.NODE_ENV = env.node;
  });
  it("childRef must be a random id, never a name with spaces", () => {
    assert.equal(asChildRef("kid_123456"), "kid_123456");
    assert.equal(asChildRef(undefined), undefined);
    assert.throws(() => asChildRef("Ali Hassan"));
  });
});
