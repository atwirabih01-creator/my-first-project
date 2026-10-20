import { demoMode, mockClaude, textMsg } from "./helpers";
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { __clearFlagsForTests, moderate } from "../safety";
import { __resetReviewForTests, anonymiseFlagsFor, checkReviewerCode, flagsForParent, listFlagsForReviewer, updateFlagReview } from "../review";
import { GET as listRoute } from "../../src/app/api/review/flags+api";
import { POST as updateRoute } from "../../src/app/api/review/flags/[id]+api";
import { POST as deleteFamilyRoute } from "../../src/app/api/delete-family+api";
import { POST as parentMessageRoute } from "../../src/app/api/parent-message+api";

const HOME = "kid_home_123";
const OUT = "kid_out_4567";

async function seedFlags() {
  // Possible home involvement -> reviewer route (never shown to parents).
  await moderate("my dad hits me every day", { speaker: "child", lang: "en", country: "LB", childRef: HOME, localOnly: true });
  // Self-harm with nobody at home named -> parent route.
  await moderate("I want to die", { speaker: "child", lang: "en", country: "LB", childRef: OUT, localOnly: true });
}

const req = (url: string, init: RequestInit & { code?: string } = {}) =>
  new Request(`http://local${url}`, { ...init, headers: { "content-type": "application/json", ...(init.code ? { "x-reviewer-code": init.code } : {}) } });

describe("safety reviewer inbox", () => {
  beforeEach(async () => {
    demoMode();
    __clearFlagsForTests();
    __resetReviewForTests();
    delete process.env.ZAKI_REVIEWER_CODE;
    await seedFlags();
  });
  afterEach(() => {
    delete process.env.ZAKI_REVIEWER_CODE;
    demoMode();
  });

  it("reviewer sees every flag with route, childRef and a scrubbed excerpt (no names)", () => {
    const flags = listFlagsForReviewer();
    const home = flags.find((f) => f.childRef === HOME)!;
    const out = flags.find((f) => f.childRef === OUT)!;
    assert.equal(home.route, "reviewer");
    assert.equal(out.route, "parent");
    assert.equal(home.status, "new");
    assert.ok(home.excerpt.length > 0 && home.excerpt.length <= 160);
  });

  it("parent-facing view NEVER contains reviewer-route flags, and never an excerpt", () => {
    const forParent = flagsForParent([HOME, OUT]);
    assert.equal(forParent.length, 1);
    assert.deepEqual(Object.keys(forParent[0]).sort(), ["category", "ts"]);
    assert.equal(flagsForParent([HOME]).length, 0);
  });

  it("parent endpoints don't expose reviewer flags (WhatsApp REPORT)", async () => {
    const res = await parentMessageRoute(req("/api/parent-message", { method: "POST", body: JSON.stringify({ text: "REPORT", lang: "en", country: "LB" }) }));
    const text = await res.text();
    assert.ok(!/dad hits|kid_home|disclosure/i.test(text));
  });

  it("reviewer code: demo code 2468 only in demo; env code when set; 503 with AI on and no code", () => {
    assert.doesNotThrow(() => checkReviewerCode(req("/x", { code: "2468" })));
    assert.throws(() => checkReviewerCode(req("/x", { code: "1111" })), /wrong reviewer code/);
    process.env.ZAKI_REVIEWER_CODE = "very-secret-code";
    assert.throws(() => checkReviewerCode(req("/x", { code: "2468" })), /wrong reviewer code/);
    assert.doesNotThrow(() => checkReviewerCode(req("/x", { code: "very-secret-code" })));
    delete process.env.ZAKI_REVIEWER_CODE;
    mockClaude(() => textMsg("{}")); // AI on, no code configured
    assert.throws(() => checkReviewerCode(req("/x", { code: "2468" })), /not set/);
  });

  it("routes: list needs the code; status + note can be updated; bad status/unknown id refused", async () => {
    assert.equal((await listRoute(req("/api/review/flags"))).status, 401);
    const ok = await listRoute(req("/api/review/flags", { code: "2468" }));
    assert.equal(ok.status, 200);
    const { flags } = (await ok.json()) as { flags: { id: string }[] };
    assert.equal(flags.length, 2);
    const id = flags[0].id;
    const up = await updateRoute(req(`/api/review/flags/${id}`, { method: "POST", code: "2468", body: JSON.stringify({ status: "resolved", note: "Spoke with school counsellor." }) }), { id });
    assert.equal(up.status, 200);
    assert.equal(listFlagsForReviewer().find((f) => f.id === id)!.status, "resolved");
    assert.equal((await updateRoute(req(`/api/review/flags/${id}`, { method: "POST", code: "2468", body: JSON.stringify({ status: "deleted" }) }), { id })).status, 400);
    assert.throws(() => updateFlagReview("00000000-0000-0000-0000-000000000000", "seen"), /not found/);
    assert.equal((await updateRoute(req(`/api/review/flags/${id}`, { method: "POST", body: JSON.stringify({ status: "seen" }) }), { id })).status, 401);
  });

  it("family deletion: flags kept only anonymised (no childRef, no excerpt)", async () => {
    const res = await deleteFamilyRoute(req("/api/delete-family", { method: "POST", body: JSON.stringify({ childRefs: [HOME, OUT] }) }));
    assert.equal(res.status, 200);
    const body = (await res.json()) as { deleted: { flagsAnonymised: number } };
    assert.equal(body.deleted.flagsAnonymised, 2);
    const flags = listFlagsForReviewer();
    assert.equal(flags.length, 2, "the safety record is kept");
    assert.ok(flags.every((f) => f.childRef === undefined && /removed/.test(f.excerpt)));
    assert.equal(flagsForParent([HOME, OUT]).length, 0);
    assert.equal(anonymiseFlagsFor([HOME]), 0);
    assert.equal((await deleteFamilyRoute(req("/api/delete-family", { method: "POST", body: JSON.stringify({ childRefs: ["Ali Hassan"] }) }))).status, 400);
  });
});
