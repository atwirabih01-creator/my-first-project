// The ONLY file that loads @supabase/supabase-js. Server only.
// Needs: npx expo install @supabase/supabase-js
// Uses the SERVICE ROLE key (full access, skips Row-Level Security). It must never reach the
// phone app: no EXPO_PUBLIC_ prefix, never imported by screens (src/app outside src/app/api).
import { createClient } from "@supabase/supabase-js";

import type { SupabaseLike } from "./supabaseStore";

export function createServerSupabase(url: string, serviceRoleKey: string): SupabaseLike {
  if (typeof window !== "undefined" && typeof (globalThis as { document?: unknown }).document !== "undefined") {
    throw new Error("Supabase service client must only run on the server");
  }
  if (!/^https:\/\//.test(url)) throw new Error("SUPABASE_URL must start with https://");
  const client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { "x-client-info": "zaki-server" } },
  });
  return client as unknown as SupabaseLike;
}
