// Runs the SQL files in supabase/migrations on the founder's Supabase project, over HTTPS
// (Supabase Management API), so it works from a Claude cloud session.
// Needs two environment variables (never pasted in chat):
//   SUPABASE_URL           https://<project-ref>.supabase.co
//   SUPABASE_ACCESS_TOKEN  a personal access token (supabase.com > Account > Access Tokens).
//                          Temporary: delete it in Supabase after the migration has run.
// Usage:
//   node supabase/apply-migrations.mjs --dry-run            (show what would run)
//   node supabase/apply-migrations.mjs 0001_init.sql        (run one file)
//   node supabase/apply-migrations.mjs 0001_init.sql 0002_retention_schedule.sql
// Uses curl so the session's HTTPS proxy settings apply.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const files = args.filter((a) => !a.startsWith("--"));

const url = process.env.SUPABASE_URL ?? "";
const ref = /^https:\/\/([a-z0-9]{10,40})\.supabase\.co\/?$/.exec(url)?.[1];
if (!ref) {
  console.error("SUPABASE_URL is missing or not like https://<project-ref>.supabase.co");
  process.exit(1);
}
const list = files.length ? files : fs.readdirSync(path.join(here, "migrations")).filter((f) => f.endsWith(".sql")).sort();
console.log(`Project: ${ref}\nFiles: ${list.join(", ")}`);
if (dry) process.exit(0);

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("SUPABASE_ACCESS_TOKEN is missing (add it in the environment settings, not in chat).");
  process.exit(1);
}

for (const f of list) {
  const sql = fs.readFileSync(path.join(here, "migrations", path.basename(f)), "utf8");
  const res = spawnSync(
    "curl",
    [
      "-sS", "--fail-with-body", "-X", "POST",
      `https://api.supabase.com/v1/projects/${ref}/database/query`,
      "-H", "Content-Type: application/json",
      "-H", "@-", // header with the token comes from a file descriptor below, not the command line
      "--data-binary", JSON.stringify({ query: sql }),
    ],
    { input: `Authorization: Bearer ${token}\n`, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );
  if (res.status !== 0) {
    console.error(`FAILED ${f}: ${(res.stdout || res.stderr || "").slice(0, 2000)}`);
    process.exit(1);
  }
  console.log(`OK ${f}`);
}
