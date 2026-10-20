import { demoMode } from "./helpers";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { beforeEach, describe, it } from "node:test";
import { __clearFlagsForTests, moderate } from "../safety";
import { listFlagsForReviewer } from "../review";
import { createFileStore, getStore, __setStoreForTests, type ZakiStore } from "../storage";
import { POST as registerRoute } from "../../src/app/api/family/register+api";
import { POST as syncRoute } from "../../src/app/api/family/sync+api";
import { POST as exportRoute } from "../../src/app/api/family/export+api";
import { POST as consentRoute } from "../../src/app/api/family/consent+api";
import { POST as deleteRoute } from "../../src/app/api/delete-family+api";

const post = (route: (r: Request) => Promise<Response>, body: unknown) =>
  route(new Request("http://local/api", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));

async function register() {
  const res = await post(registerRoute, { guardians: [{ firstName: "Rami Haddad", relationship: "father" }, { firstName: "Lina", relationship: "mother" }], consentVersion: "2026-10-20.1", country: "LB", reportLang: "ar" });
  assert.equal(res.status, 200);
  return (await res.json()) as { familyId: string; familyKey: string; consentId: string };
}
const kid = (childRef: string) => ({ childRef, nickname: "Ali", grade: 3, lang: "ar", avatar: "lion", dailyLimitMin: 30 });

/** Wraps the store and records which methods were called (to prove the key is checked first). */
function spyStore(inner: ZakiStore): { store: ZakiStore; calls: string[] } {
  const calls: string[] = [];
  const store = new Proxy(inner, {
    get(t, p, r) {
      const v = Reflect.get(t, p, r);
      return typeof v === "function" ? (...a: unknown[]) => (calls.push(String(p)), (v as (...x: unknown[]) => unknown).apply(t, a)) : v;
    },
  });
  return { store, calls };
}

describe("family identity (server-issued secret key)", () => {
  beforeEach(() => {
    demoMode();
    __clearFlagsForTests();
  });

  it("register returns a long random key once; only its SHA-256 hash is stored", async () => {
    const r = await register();
    assert.ok(r.familyKey.length >= 40);
    const stored = await getStore().getFamilyKeyHash(r.familyId);
    assert.equal(stored, createHash("sha256").update(r.familyKey).digest("hex"));
    assert.notEqual(stored, r.familyKey);
    const fam = await getStore().getFamily(r.familyId);
    assert.ok(fam);
  });

  it("wrong or missing key: 401 and NO family data is read or written (only the key hash is checked)", async () => {
    const r = await register();
    const spy = spyStore(getStore());
    __setStoreForTests(spy.store);
    for (const route of [syncRoute, exportRoute, deleteRoute, consentRoute]) {
      const res = await post(route, { familyId: r.familyId, familyKey: "x".repeat(43), children: [kid("kid_aaaaaaaa")], action: "withdraw", consentId: r.consentId });
      assert.equal(res.status, 401);
      assert.equal((await post(route, { familyId: r.familyId })).status, 401);
    }
    assert.deepEqual([...new Set(spy.calls)], ["getFamilyKeyHash"]);
    __setStoreForTests(createFileStore({ dataDir: null, flagFile: null, budgetFile: null, libraryDir: null }));
  });

  it("sync -> export (no key hash in the export) -> consent withdraw/give", async () => {
    const r = await register();
    const sync = await post(syncRoute, { familyId: r.familyId, familyKey: r.familyKey, children: [kid("kid_bbbbbbbb")] });
    assert.equal(sync.status, 200);
    assert.equal((await getStore().listChildren(r.familyId)).length, 1);
    const exp = await post(exportRoute, { familyId: r.familyId, familyKey: r.familyKey });
    const text = await exp.text();
    assert.equal(exp.status, 200);
    assert.ok(text.includes("kid_bbbbbbbb"));
    assert.ok(!text.includes(createHash("sha256").update(r.familyKey).digest("hex")), "never exports the key hash");
    assert.ok(!text.includes("Haddad"), "first names only");
    assert.equal(((await (await post(consentRoute, { familyId: r.familyId, familyKey: r.familyKey, action: "withdraw", consentId: r.consentId })).json()) as { ok: boolean }).ok, true);
    const give = (await (await post(consentRoute, { familyId: r.familyId, familyKey: r.familyKey, action: "give", consentVersion: "v2" })).json()) as { consentId: string };
    assert.ok(give.consentId);
  });

  it("delete: family removed; its children's flags kept for the reviewer but unlinked", async () => {
    const r = await register();
    await post(syncRoute, { familyId: r.familyId, familyKey: r.familyKey, children: [kid("kid_cccccccc")] });
    await moderate("my dad hits me", { speaker: "child", lang: "en", country: "LB", childRef: "kid_cccccccc", localOnly: true });
    await moderate("my dad hits me", { speaker: "child", lang: "en", country: "LB", childRef: "kid_otherfam", localOnly: true });
    const res = await post(deleteRoute, { familyId: r.familyId, familyKey: r.familyKey });
    assert.equal(res.status, 200);
    assert.deepEqual(((await res.json()) as { deleted: unknown }).deleted, { children: 1, flagsUnlinked: 1 });
    assert.equal(await getStore().getFamily(r.familyId), null);
    const flags = await listFlagsForReviewer();
    assert.equal(flags.length, 2);
    assert.ok(!flags.some((f) => f.childRef === "kid_cccccccc"));
    assert.ok(flags.some((f) => f.childRef === "kid_otherfam"), "another family's flags are untouched");
    // the old key no longer works
    assert.equal((await post(exportRoute, { familyId: r.familyId, familyKey: r.familyKey })).status, 401);
  });

  it("works with no Supabase env (file store)", () => {
    __setStoreForTests(createFileStore({ dataDir: null, flagFile: null, budgetFile: null, libraryDir: null }));
    assert.equal(getStore().kind, "file");
    __setStoreForTests(createFileStore({ dataDir: null, flagFile: null, budgetFile: null, libraryDir: null }));
  });
});
