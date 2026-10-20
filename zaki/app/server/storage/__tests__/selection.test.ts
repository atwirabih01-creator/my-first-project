// Back-end selection + supabaseStore mapping with a fake client (no network, no account).
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { assertNoPublicServiceKey, createSupabaseStore, storageKind } from "../index";
import type { QueryLike, SupabaseLike } from "../supabaseStore";

describe("storage: automatic selection", () => {
  it("uses local files when Supabase env vars are missing", () => {
    assert.equal(storageKind({}), "file");
    assert.equal(storageKind({ SUPABASE_URL: "https://x.supabase.co" }), "file", "URL alone is not enough");
    assert.equal(storageKind({ SUPABASE_ANON_KEY: "a", SUPABASE_URL: "https://x.supabase.co" }), "file", "anon key is never used by the server");
  });
  it("switches on with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY", () => {
    assert.equal(storageKind({ SUPABASE_URL: "https://x.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "k" }), "supabase");
  });
  it("ZAKI_STORAGE=file forces local files", () => {
    assert.equal(storageKind({ SUPABASE_URL: "https://x", SUPABASE_SERVICE_ROLE_KEY: "k", ZAKI_STORAGE: "file" }), "file");
  });
  it("refuses a service key under an EXPO_PUBLIC_ name (it would ship inside the app)", () => {
    assert.throws(() => assertNoPublicServiceKey({ EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: "k" }), /ship a secret/);
    assert.doesNotThrow(() => assertNoPublicServiceKey({ SUPABASE_SERVICE_ROLE_KEY: "k" }));
  });
});

/** Records every call; returns canned data per table/rpc. */
function fakeClient(responses: { tables?: Record<string, unknown>; rpc?: Record<string, unknown>; storage?: Record<string, { name: string }[]> } = {}) {
  const calls: { table?: string; rpc?: string; ops: [string, unknown[]][] }[] = [];
  const removed: string[][] = [];
  const builder = (table: string): QueryLike => {
    const rec = { table, ops: [] as [string, unknown[]][] };
    calls.push(rec);
    const q: any = {};
    for (const m of ["select", "insert", "upsert", "update", "delete", "eq", "in", "order", "maybeSingle"]) {
      q[m] = (...a: unknown[]) => {
        rec.ops.push([m, a]);
        return q;
      };
    }
    q.then = (ok: any, bad: any) => Promise.resolve({ data: responses.tables?.[table] ?? null, error: null }).then(ok, bad);
    return q as QueryLike;
  };
  const client: SupabaseLike = {
    from: builder,
    rpc: (fn, args) => {
      calls.push({ rpc: fn, ops: [["args", [args]]] });
      return Promise.resolve({ data: responses.rpc?.[fn] ?? null, error: null });
    },
    storage: {
      from: () => ({
        list: (prefix = "") => Promise.resolve({ data: responses.storage?.[prefix] ?? [], error: null }),
        remove: (paths) => {
          removed.push(paths);
          return Promise.resolve({ data: null, error: null });
        },
      }),
    },
  };
  return { client, calls, removed };
}

describe("storage: supabaseStore (fake client)", () => {
  const FAM = "11111111-1111-4111-8111-111111111111";

  it("photo packs are sent without a library key", async () => {
    const f = fakeClient({ tables: { children: { id: "c1" } } });
    const store = createSupabaseStore(async () => f.client);
    await store.syncProgress(FAM, "abc12345", {
      plan: [],
      tests: [],
      sessions: [],
      exams: [],
      examResults: [],
      state: {},
      packs: [{ packKey: "k", subject: "math", topic: "t", grade: 3, lang: "en", source: "photo", libraryKey: "math|t|3|en", pack: {}, sources: [] }],
    });
    const packCall = f.calls.find((c) => c.table === "lesson_packs")!;
    const rows = packCall.ops.find(([m]) => m === "upsert")![1][0] as { library_key: unknown; family_id: string }[];
    assert.equal(rows[0].library_key, null);
    assert.equal(rows[0].family_id, FAM);
  });

  it("every child lookup is scoped by family id", async () => {
    const f = fakeClient({ tables: { children: null } });
    const store = createSupabaseStore(async () => f.client);
    assert.equal(await store.getProgress(FAM, "abc12345"), null);
    const eqs = f.calls[0].ops.filter(([m]) => m === "eq").map(([, a]) => a[0]);
    assert.deepEqual(eqs, ["family_id", "child_ref"]);
  });

  it("budget, export, delete and retention use the database functions", async () => {
    const f = fakeClient({
      rpc: { zaki_budget_add: "0.75", zaki_take_child_turn: true, zaki_export_family: { family: {} }, zaki_delete_family: true, zaki_run_retention: { chat: 2, flags: 1, turns: 0, budget: 0, audit: 0 } },
      storage: { "": [{ name: "2026-08-01" }, { name: "2026-10-19" }, { name: "junk" }], "2026-08-01": [{ name: "a.jpg" }, { name: "b.jpg" }] },
    });
    const store = createSupabaseStore(async () => f.client);
    assert.equal(await store.budgetAdd("2026-10-20", "tutor", 0.5), 0.75);
    assert.equal(await store.childTurnTake("2026-10-20", "abc12345", 40), true);
    assert.equal((await store.exportFamily(FAM))?.storage, "supabase");
    assert.equal(await store.deleteFamily(FAM), true);
    const r = await store.runRetention(new Date("2026-10-20T00:00:00Z"));
    assert.deepEqual(r, { chat: 2, flags: 1, photos: 2, other: 0 });
    assert.deepEqual(f.removed, [["2026-08-01/a.jpg", "2026-08-01/b.jpg"]], "only photo folders older than 30 days");
    await assert.rejects(store.exportFamily("not-a-uuid"), /bad_family_id/);
  });

  it("parent alerts drop reviewer-route flags unless the reviewer shared them", async () => {
    const f = fakeClient({
      tables: {
        flags: [
          { id: "1", created_at: "t", category: "violence_fear", status: "pending_review", route: "parent", shared_with_parent: false },
          { id: "2", created_at: "t", category: "disclosure_harm", status: "pending_review", route: "reviewer", shared_with_parent: false },
          { id: "3", created_at: "t", category: "self_harm", status: "reviewed", route: "reviewer", shared_with_parent: true },
        ],
      },
    });
    const store = createSupabaseStore(async () => f.client);
    const alerts = await store.parentAlerts(FAM);
    assert.deepEqual(alerts.map((a) => a.id), ["1", "3"]);
  });
});
