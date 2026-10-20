// Picks the storage back end automatically:
//   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set  -> supabaseStore (online, private, EU)
//   otherwise                                      -> fileStore (today's local JSON files)
// ZAKI_STORAGE=file forces the local files even when Supabase is configured (e.g. tests).
// SUPABASE_ANON_KEY is not used by the server; it is kept for a later signed-in parent area.
import { createFileStore } from "./fileStore";
import { createSupabaseStore } from "./supabaseStore";
import type { StorageKind, ZakiStore } from "./types";

export * from "./types";
export { createFileStore } from "./fileStore";
export { createSupabaseStore, PHOTO_BUCKET, photoPath } from "./supabaseStore";

type Env = Record<string, string | undefined>;

export function storageKind(env: Env = process.env): StorageKind {
  if (env.ZAKI_STORAGE === "file") return "file";
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) return "supabase";
  return "file";
}

/** Refuse obvious leaks: the service key must never be an EXPO_PUBLIC_ (app-bundled) value. */
export function assertNoPublicServiceKey(env: Env = process.env): void {
  for (const k of Object.keys(env)) {
    if (/^EXPO_PUBLIC_.*SERVICE/i.test(k) && env[k]) {
      throw new Error(`${k} would ship a secret inside the app. Remove it; use SUPABASE_SERVICE_ROLE_KEY (server only).`);
    }
  }
}

let current: ZakiStore | null = null;

export function getStore(): ZakiStore {
  if (current) return current;
  assertNoPublicServiceKey();
  if (storageKind() === "supabase") {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    current = createSupabaseStore(async () => (await import("./supabaseClient")).createServerSupabase(url, key));
  } else {
    current = createFileStore();
  }
  return current;
}

/** Tests only: swap in a store (or null to re-pick from env on the next getStore()). */
export function __setStoreForTests(store: ZakiStore | null): void {
  current = store;
}
