// Applies supabase/migrations/0001_init.sql to an in-memory Postgres (PGlite) with a small
// Supabase stand-in, then checks Row-Level Security from the point of view of two parents,
// the reviewer, an anonymous visitor and the server. Test-only; no network, no account.
//
// Run (from a scratch folder that has @electric-sql/pglite installed):
//   node /path/to/zaki/app/supabase/tests/run-pglite.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const { PGlite } = await import(process.env.PGLITE_MODULE ?? "@electric-sql/pglite");
const db = new PGlite();
process.on("uncaughtException", (e) => { console.error("FAILED:", e.message, e.query ?? ""); process.exit(1); });
process.on("unhandledRejection", (e) => { console.error("FAILED:", e?.message, e?.query ?? ""); process.exit(1); });

const read = (p) => fs.readFileSync(path.join(here, p), "utf8");
await db.exec(read("supabase-shim.sql"));
await db.exec(read("../migrations/0001_init.sql"));

let passed = 0;
const ok = (name) => { passed++; console.log("  ok -", name); };

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";
const REVIEWER = "33333333-3333-4333-8333-333333333333";

/** Run fn inside a transaction as a given role/user, then roll back nothing (we commit). */
async function as(role, userId, fn) {
  return db.transaction(async (tx) => {
    await tx.exec(`set local role ${role}`);
    await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [userId ?? ""]);
    return fn(tx);
  });
}
async function denied(p, name) {
  try { await p; } catch (e) { ok(name + " (" + String(e.message).slice(0, 60) + ")"); return; }
  assert.fail("expected an error: " + name);
}

// ---- setup: two families created by their own parents through the RPC ----
const famA = (await as("authenticated", USER_A, (t) => t.query(`select public.zaki_create_family('Rana','mother','LB','ar') as id`))).rows[0].id;
const famB = (await as("authenticated", USER_B, (t) => t.query(`select public.zaki_create_family('Omar','father','QA','en') as id`))).rows[0].id;
ok("parents create their own family via zaki_create_family");

const childA = (await as("authenticated", USER_A, (t) => t.query(
  `insert into public.children (family_id, nickname, grade, lang, avatar) values ($1,'Ali',3,'ar','lion') returning id, child_ref`, [famA]))).rows[0];
const childB = (await as("authenticated", USER_B, (t) => t.query(
  `insert into public.children (family_id, nickname, grade, lang, avatar) values ($1,'Sara',2,'en','fox') returning id, child_ref`, [famB]))).rows[0];
assert.match(childA.child_ref, /^[a-f0-9]{32}$/);
ok("children get a random child_ref automatically");

// ---- family isolation ----
const seenByA = await as("authenticated", USER_A, (t) => t.query(`select id from public.children`));
assert.deepEqual(seenByA.rows.map((r) => r.id), [childA.id]);
ok("parent A sees only child A");
const famsSeenByA = await as("authenticated", USER_A, (t) => t.query(`select id from public.families`));
assert.deepEqual(famsSeenByA.rows.map((r) => r.id), [famA]);
ok("parent A sees only family A");

await denied(as("authenticated", USER_A, (t) => t.query(
  `insert into public.children (family_id, nickname, grade) values ($1,'X',1)`, [famB])), "parent A cannot add a child to family B");
await denied(as("authenticated", USER_A, (t) => t.query(
  `insert into public.attempts (family_id, child_id, client_key, kind, score, total, day, finished_at) values ($1,$2,'k','test',1,2,current_date,now())`, [famA, childB.id])),
  "parent A cannot attach a row to child B under family A");
const upd = await as("authenticated", USER_A, (t) => t.query(`update public.children set grade = 6 where id = $1`, [childB.id]));
assert.equal(upd.affectedRows ?? 0, 0);
ok("parent A cannot change child B (0 rows)");
await denied(as("authenticated", USER_A, (t) => t.query(`delete from public.families where id = $1`, [famB])), "parents cannot delete family rows directly (only via zaki_delete_family)");
await denied(as("authenticated", USER_A, (t) => t.query(`select public.zaki_delete_family($1)`, [famB])), "parent A cannot delete family B via function");
await denied(as("authenticated", USER_A, (t) => t.query(`select public.zaki_export_family($1)`, [famB])), "parent A cannot export family B");

// ---- data rules ----
await denied(as("authenticated", USER_A, (t) => t.query(
  `insert into public.guardians (family_id, first_name, relationship) values ($1,'Rana 0501234567','mother')`, [famA])), "guardian name cannot hold a phone number");
await denied(as("authenticated", USER_A, (t) => t.query(
  `insert into public.children (family_id, nickname, grade) values ($1,'Ali',9)`, [famA])), "grade must be 1-6");
await denied(as("service_role", null, (t) => t.query(
  `insert into public.lesson_packs (family_id, pack_key, subject, topic, grade, lang, source, library_key, pack) values ($1,'p1','math','Fractions',3,'en','photo','math|fractions|3|en','{}')`, [famA])),
  "photo packs can never point at the shared library");

await denied(as("authenticated", USER_A, (t) => t.query(
  `insert into public.guardians (family_id, user_id, first_name, relationship) values ($1,$2,'Mona','other')`, [famA, USER_B])), "parent cannot link another login to their family");
await as("authenticated", USER_A, (t) => t.query(`insert into public.guardians (family_id, first_name, relationship) values ($1,'Karim','father')`, [famA]));
ok("parent can add a second grown-up (first name + relationship only)");
await as("authenticated", USER_A, (t) => t.query(`insert into public.consents (family_id, version) values ($1,'2026-10-v1')`, [famA]));
await denied(as("authenticated", USER_A, (t) => t.query(`update public.consents set version = 'forged' where family_id = $1`, [famA])), "consent history cannot be rewritten");
await as("authenticated", USER_A, (t) => t.query(`update public.consents set withdrawn_at = now() where family_id = $1`, [famA]));
ok("parent can withdraw consent");

// ---- anon (the public key, not signed in) sees nothing ----
await denied(as("anon", null, (t) => t.query(`select * from public.children`)), "anon cannot read children");
await denied(as("anon", null, (t) => t.query(`select * from public.library`)), "anon cannot read the library");
await denied(as("anon", null, (t) => t.query(`select public.zaki_create_family('A','mother')`)), "anon cannot call functions");

// ---- library: read for signed-in, write server only ----
await as("service_role", null, (t) => t.query(
  `insert into public.library (key, subject, topic_norm, grade, lang, pack) values ('math|fractions|3|en','math','fractions',3,'en','{"id":"x"}')`));
const lib = await as("authenticated", USER_B, (t) => t.query(`select key from public.library`));
assert.equal(lib.rows.length, 1);
ok("signed-in family can read the library");
await denied(as("authenticated", USER_B, (t) => t.query(
  `insert into public.library (key, subject, topic_norm, grade, lang, pack) values ('math|x|3|en','math','x',3,'en','{}')`)), "family cannot write the library");

// ---- flags: reviewer only; parents never see reviewer-route flags ----
await as("service_role", null, async (t) => {
  await t.query(`insert into public.reviewers (user_id, label) values ($1,'reviewer-1')`, [REVIEWER]);
  await t.query(`insert into public.flags (family_id, child_ref, category, route, involves_home, excerpt) values ($1,$2,'disclosure_harm','reviewer',true,'[home] ...')`, [famA, childA.child_ref]);
  await t.query(`insert into public.flags (family_id, child_ref, category, route, involves_home, alert_level, excerpt) values ($1,$2,'violence_fear','parent',false,'calm','scared of ...')`, [famA, childA.child_ref]);
});
await denied(as("authenticated", USER_A, (t) => t.query(`select excerpt from public.flags`).then((r) => { if (r.rows.length) throw new Error("leak"); throw new Error("no rows"); })),
  "parent cannot read the flags table directly");
const alerts = await as("authenticated", USER_A, (t) => t.query(`select * from public.zaki_my_parent_alerts()`));
assert.equal(alerts.rows.length, 1);
assert.equal(alerts.rows[0].category, "violence_fear");
assert.equal("excerpt" in alerts.rows[0], false);
ok("parent alert list shows only the parent-route flag, without the child's words");
const rq = await as("authenticated", REVIEWER, (t) => t.query(`select * from public.zaki_reviewer_queue('pending_review')`));
assert.equal(rq.rows.length, 2);
ok("reviewer sees both flags via the logged queue");
const rd = await as("authenticated", REVIEWER, (t) => t.query(`select count(*)::int as n from public.flags`));
assert.equal(rd.rows[0].n, 2);
ok("reviewer RLS read on flags works");
const rc = await as("authenticated", REVIEWER, (t) => t.query(`select count(*)::int as n from public.children`));
assert.equal(rc.rows[0].n, 0);
ok("reviewer sees no children / family data");
await denied(as("authenticated", USER_A, (t) => t.query(`select * from public.zaki_reviewer_queue(null)`)), "parent cannot open the reviewer queue");
await denied(as("authenticated", REVIEWER, (t) => t.query(`update public.flags set status = 'closed'`)), "reviewer cannot edit flags directly");
await denied(as("authenticated", USER_A, (t) => t.query(`insert into public.flags (category, route, excerpt) values ('other','parent','x')`)), "families cannot write flags");
const fid = (await as("service_role", null, (t) => t.query(`select id from public.flags where route = 'parent'`))).rows[0].id;
const rv = await as("authenticated", REVIEWER, (t) => t.query(`select (public.zaki_review_flag($1, 'reviewed', 'spoke with parent', false)).status as s`, [fid]));
assert.equal(rv.rows[0].s, "reviewed");
await as("service_role", null, (t) => t.query(`update public.flags set status = 'pending_review', reviewed_at = null where id = $1`, [fid]));
ok("reviewer reviews a flag through the logged function");
const logged = await as("service_role", null, (t) => t.query(`select count(*)::int as n from public.audit_log where action = 'flags_viewed'`));
assert.equal(logged.rows[0].n, 1);
ok("reviewer view was written to the audit log");

// ---- budget: server only, atomic ----
await denied(as("authenticated", USER_A, (t) => t.query(`select public.zaki_budget_add(current_date,'tutor',1)`)), "family cannot touch the budget");
await as("service_role", null, async (t) => {
  await t.query(`select public.zaki_budget_add(current_date,'tutor',0.25)`);
  const r = await t.query(`select public.zaki_budget_add(current_date,'lesson',0.5) as total`);
  assert.equal(Number(r.rows[0].total), 0.75);
  const turns = [];
  for (let i = 0; i < 3; i++) turns.push((await t.query(`select public.zaki_take_child_turn(current_date,'abc12345',2) as ok`)).rows[0].ok);
  assert.deepEqual(turns, [true, true, false]);
});
ok("budget adds up and the per-child turn cap stops at the limit");

// ---- export + delete ----
const exp = await as("authenticated", USER_A, (t) => t.query(`select public.zaki_export_family($1) as j`, [famA]));
const j = exp.rows[0].j;
assert.equal(j.children.length, 1);
assert.equal(j.parent_alerts.length, 1);
assert.equal(JSON.stringify(j).includes("[home]"), false, "export must not contain reviewer-route words");
assert.equal(JSON.stringify(j).includes(USER_A), false, "export hides login ids");
ok("parent export holds own data, not reviewer-route flag text");
const gone = await as("authenticated", USER_A, (t) => t.query(`select public.zaki_delete_family($1) as ok`, [famA]));
assert.equal(gone.rows[0].ok, true);
const left = await as("service_role", null, (t) => t.query(
  `select (select count(*) from public.children where family_id = $1)::int as c, (select count(*) from public.flags where family_id is null)::int as orphan_flags`, [famA]));
assert.equal(left.rows[0].c, 0);
assert.equal(left.rows[0].orphan_flags, 2);
ok("delete removes all family rows; flags survive without the family link (open referrals)");

// ---- retention ----
await as("service_role", null, async (t) => {
  await t.query(`insert into public.chat_messages (family_id, child_id, role, text, created_at) values ($1,$2,'child','old',now()-interval '100 days'),($1,$2,'child','new',now())`, [famB, childB.id]);
  await t.query(`update public.flags set status='reviewed', reviewed_at = now()-interval '40 days' where category='violence_fear'`);
  await t.query(`update public.flags set status='referred', reviewed_at = now()-interval '40 days' where category='disclosure_harm'`);
  const r = (await t.query(`select public.zaki_run_retention() as r`)).rows[0].r;
  assert.equal(r.chat, 1);
  assert.equal(r.flags, 1);
  const f = await t.query(`select status from public.flags`);
  assert.deepEqual(f.rows.map((x) => x.status), ["referred"]);
});
ok("retention removes old chat + reviewed flags, keeps open referrals");

// ---- RLS really is on everywhere ----
const noRls = await db.query(`select relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity`);
assert.deepEqual(noRls.rows, []);
ok("every public table has Row-Level Security turned on");

console.log(`\nPGlite: ${passed} checks passed`);
