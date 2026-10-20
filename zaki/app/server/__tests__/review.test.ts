import { demoMode, mockClaude, textMsg } from "./helpers";
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { __clearFlagsForTests, moderate } from "../safety";
import { anonymiseFlagsFor, checkReviewerCode, flagsForParent, listFlagsForReviewer, updateFlagReview } from "../review";
import { GET as listRoute } from "../../src/app/api/review/flags+api";
import { POST as updateRoute } from "../../src/app/api/review/flags/[id]+api";
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

describe("safety reviewer inbox (via the storage layer)", () => {
  beforeEach(async () => {
    demoMode(); // fresh in-memory store
    __clearFlagsForTests();
    delete process.env.ZAKI_REVIEWER_CODE;
    await seedFlags();
  });
  afterEach(() => {
    delete process.env.ZAKI_REVIEWER_CODE;
    demoMode();
  });

  it("reviewer sees every flag with route, childRef and a scrubbed excerpt (no names)", async () => {
    const flags = await listFlagsForReviewer();
    const home = flags.find((f) => f.childRef === HOME)!;
    const out = flags.find((f) => f.childRef === OUT)!;
    assert.equal(home.route, "reviewer");
    assert.equal(out.route, "parent");
    assert.equal(home.status, "new");
    assert.ok(home.excerpt.length > 0 && home.excerpt.length <= 200);
  });

  it("parent-facing view NEVER contains reviewer-route flags, and never an excerpt", async () => {
    const forParent = await flagsForParent([HOME, OUT]);
    assert.equal(forParent.length, 1);
    assert.deepEqual(Object.keys(forParent[0]).sort(), ["category", "ts"]);
    assert.equal((await flagsForParent([HOME])).length, 0);
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
    const up = await updateRoute(req(`/api/review/flags/${id}`, { method: "POST", code: "2468", body: JSON.stringify({ status: "referred", note: "Spoke with school counsellor." }) }), { id });
    assert.equal(up.status, 200);
    const after = (await listFlagsForReviewer()).find((f) => f.id === id)!;
    assert.equal(after.status, "referred");
    assert.equal(after.note, "Spoke with school counsellor.");
    assert.equal((await updateRoute(req(`/api/review/flags/${id}`, { method: "POST", code: "2468", body: JSON.stringify({ status: "deleted" }) }), { id })).status, 400);
    await assert.rejects(updateFlagReview("00000000-0000-0000-0000-000000000000", "seen"), /not found/);
    assert.equal((await updateRoute(req(`/api/review/flags/${id}`, { method: "POST", body: JSON.stringify({ status: "seen" }) }), { id })).status, 401);
  });

  it("family deletion: flags kept for open referrals but with no link to the child", async () => {
    assert.equal(await anonymiseFlagsFor([HOME, OUT]), 2);
    const flags = await listFlagsForReviewer();
    assert.equal(flags.length, 2, "the safety record is kept");
    assert.ok(flags.every((f) => f.childRef === undefined));
    assert.equal((await flagsForParent([HOME, OUT])).length, 0);
  });
});
