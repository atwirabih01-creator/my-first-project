-- =====================================================================================
-- Zaki: online storage, first version (Supabase / Postgres 15+)
-- =====================================================================================
-- Plain summary: one family = one private box. Every table has Row-Level Security (RLS):
-- a signed-in parent can only see and change their own family's rows. The independent
-- safety reviewer can read safety flags and nothing else. The shared lesson library holds
-- only packs built from TYPED topics (never photos, never a family link). Zaki's own server
-- uses the service role key (it skips RLS) and is the only thing that writes the library,
-- the budget counters and the safety flags.
--
-- Data rules (ZAKI_PROJECT_PLAN.md 8.2, docs/research/08-safety-review-phase0.md):
--   * No surnames, no school, no location, no face photos, no phone numbers, no emails here.
--     Guardians: first name + relationship only. Children: nickname + random child_ref.
--   * Safety flags: category + short scrubbed excerpt, random child_ref only, never a name.
--     Flags routed to the reviewer (possible family involvement) are NEVER visible to parents.
--   * Retention: chat text ~90 days, page photos ~30 days (storage bucket), reviewed flags
--     ~30 days after review unless a referral is open. Scores and summaries: until deleted.
--   * Parents can export everything and delete everything (in-app, Apple 5.1.1(v)).
--
-- Assumes the Supabase built-ins: roles anon / authenticated / service_role, auth.uid().
-- Safe to re-run? No: this is a one-time migration. Later changes go in 0002_..., 0003_...
-- =====================================================================================

begin;

-- -------------------------------------------------------------------------------------
-- Small shared types (check constraints keep values tidy)
-- -------------------------------------------------------------------------------------
create domain public.zaki_lang as text check (value in ('en', 'ar'));
create domain public.zaki_country as text check (value in ('LB', 'QA'));
create domain public.zaki_subject as text check (value in ('math', 'science', 'english', 'arabic', 'social'));

-- -------------------------------------------------------------------------------------
-- Families and the grown-ups in them
-- -------------------------------------------------------------------------------------
create table public.families (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Set by the parent (drives help routes). Null = "not set": help screen shows only
  -- "tell a grown-up you trust". Never derived from location.
  country       public.zaki_country,
  report_lang   public.zaki_lang not null default 'ar',
  -- Free-form app settings that are not personal data (study time, paused, fonts...).
  settings      jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object')
);
comment on table public.families is 'One row per family. No address, no school, no location.';

create table public.guardians (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references public.families (id) on delete cascade,
  -- The Supabase login of this grown-up (optional: a guardian may consent on paper only).
  user_id       uuid unique,
  -- FIRST NAME ONLY (no surname). Short, single line.
  first_name    text not null check (char_length(first_name) between 1 and 40 and first_name !~ '[\n\r@0-9]'),
  relationship  text not null check (relationship in ('mother', 'father', 'guardian', 'other')),
  created_at    timestamptz not null default now()
);
comment on column public.guardians.first_name is 'First name only. Never a surname.';
create index guardians_family_idx on public.guardians (family_id);

create table public.consents (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references public.families (id) on delete cascade,
  guardian_id   uuid references public.guardians (id) on delete set null,
  -- e.g. 'main' (use of Zaki), 'ai_processing' (Apple 5.1.2(i)), 'extra_sharing'
  kind          text not null default 'main' check (kind in ('main', 'ai_processing', 'extra_sharing')),
  version       text not null check (char_length(version) between 1 and 40),
  method        text not null default 'in_app_gate' check (method in ('in_app_gate', 'paper', 'whatsapp')),
  given_at      timestamptz not null default now(),
  -- Withdrawal takes effect immediately (safety review 8.2-b (5)).
  withdrawn_at  timestamptz,
  check (withdrawn_at is null or withdrawn_at >= given_at)
);
create index consents_family_idx on public.consents (family_id);

-- -------------------------------------------------------------------------------------
-- Children
-- -------------------------------------------------------------------------------------
create table public.children (
  id              uuid primary key default gen_random_uuid(),
  family_id       uuid not null references public.families (id) on delete cascade,
  -- Random id the app and server use everywhere (API contract `childRef`). Never a name.
  child_ref       text not null unique default replace(gen_random_uuid()::text, '-', '')
                  check (child_ref ~ '^[A-Za-z0-9_-]{8,64}$'),
  -- Nickname or first name only. Stays in Zaki's database and app; never sent to any AI company.
  nickname        text not null check (char_length(nickname) between 1 and 20 and nickname !~ '[\n\r@]'),
  grade           smallint not null check (grade between 1 and 6),
  lang            public.zaki_lang not null default 'ar',
  avatar          text not null default 'star' check (avatar ~ '^[a-z]{2,16}$'),
  daily_limit_min smallint not null default 30 check (daily_limit_min between 5 and 240),
  -- Small non-personal progress bits the app keeps (stars, per-lesson records, best times).
  progress_state  jsonb not null default '{}'::jsonb check (jsonb_typeof(progress_state) = 'object'),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index children_family_idx on public.children (family_id);

-- -------------------------------------------------------------------------------------
-- Lessons in the grown-up's plan (ordered queue per subject; pass-to-unlock)
-- -------------------------------------------------------------------------------------
create table public.lessons (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references public.families (id) on delete cascade,
  child_id      uuid not null references public.children (id) on delete cascade,
  client_id     text not null check (char_length(client_id) between 1 and 80), -- PlanItem.id from the app
  subject       public.zaki_subject not null,
  topic         text not null check (char_length(topic) between 1 and 120),
  kind          text not null default 'lesson' check (kind in ('lesson', 'test')),
  position      integer not null default 0,                 -- order inside the subject queue
  status        text not null default 'new' check (status in ('new', 'learning', 'learned', 'mastered', 'pending')),
  unlocked      boolean not null default false,             -- grown-up unlocked early
  test_date     date,                                       -- for kind = 'test'
  pack_key      text,                                       -- links to lesson_packs.pack_key
  sessions      smallint,
  added_at      timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (child_id, client_id)
);
create index lessons_family_idx on public.lessons (family_id);
create index lessons_child_subject_idx on public.lessons (child_id, subject, position);

-- -------------------------------------------------------------------------------------
-- Lesson packs (private to a family). Photo-built packs are never shared.
-- -------------------------------------------------------------------------------------
create table public.lesson_packs (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references public.families (id) on delete cascade,
  child_id      uuid references public.children (id) on delete cascade,
  pack_key      text not null check (char_length(pack_key) between 1 and 200),
  subject       public.zaki_subject not null,
  topic         text not null check (char_length(topic) between 1 and 120),
  grade         smallint not null check (grade between 1 and 6),
  lang          public.zaki_lang not null,
  source        text not null check (source in ('typed', 'photo')),
  -- Only typed packs may point at the shared library. Photo packs: always null.
  library_key   text,
  pack          jsonb not null check (jsonb_typeof(pack) = 'object'),
  sources       jsonb not null default '[]'::jsonb check (jsonb_typeof(sources) = 'array'),
  demo          boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (family_id, pack_key),
  constraint photo_packs_never_shared check (source = 'typed' or library_key is null)
);
create index lesson_packs_child_idx on public.lesson_packs (child_id);

-- -------------------------------------------------------------------------------------
-- Exams the grown-up built (stored questions) and attempts (tests, retests, exams)
-- -------------------------------------------------------------------------------------
create table public.exams (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references public.families (id) on delete cascade,
  child_id      uuid not null references public.children (id) on delete cascade,
  client_id     text not null check (char_length(client_id) between 1 and 80),
  subject       public.zaki_subject not null,
  title         text not null check (char_length(title) between 1 and 120),
  exam_date     date not null,
  lesson_keys   text[] not null default '{}',
  lesson_topics jsonb not null default '{}'::jsonb,
  questions     jsonb not null default '[]'::jsonb check (jsonb_typeof(questions) = 'array'),
  added_by_ai   smallint not null default 0,
  created_at    timestamptz not null default now(),
  unique (child_id, client_id)
);
create index exams_family_idx on public.exams (family_id);

create table public.attempts (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references public.families (id) on delete cascade,
  child_id      uuid not null references public.children (id) on delete cascade,
  -- Idempotent sync key from the app (lessonKey|at or examId|at).
  client_key    text not null check (char_length(client_key) between 1 and 200),
  kind          text not null check (kind in ('test', 'exam')),
  lesson_key    text,
  exam_id       uuid references public.exams (id) on delete cascade,
  score         smallint not null check (score >= 0),
  total         smallint not null check (total >= 0 and score <= total),
  passed        boolean,
  practice      boolean not null default false,
  attempt_no    smallint not null default 1,
  seconds       integer not null default 0 check (seconds >= 0),
  -- Per-question results: [{ "id": "q1", "correct": true, "tries": 1 }]; exams also per lesson.
  per_question  jsonb not null default '[]'::jsonb,
  per_lesson    jsonb,
  day           date not null,
  finished_at   timestamptz not null,
  created_at    timestamptz not null default now(),
  unique (child_id, client_key)
);
create index attempts_child_day_idx on public.attempts (child_id, day desc);
create index attempts_family_idx on public.attempts (family_id);
create index attempts_exam_idx on public.attempts (exam_id) where exam_id is not null;

-- Study sessions (minutes used per day feed the daily limit and parent reports).
create table public.sessions (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references public.families (id) on delete cascade,
  child_id      uuid not null references public.children (id) on delete cascade,
  day           date not null,
  minutes       smallint not null check (minutes between 0 and 600),
  lesson_key    text,
  started_at    timestamptz not null,
  unique (child_id, started_at)
);
create index sessions_child_day_idx on public.sessions (child_id, day desc);
create index sessions_family_idx on public.sessions (family_id);

-- Chat text (child <-> Zaki) and child "this answer looks wrong" reports. PII-scrubbed by the
-- server before saving. Deleted after ~90 days (zaki_run_retention).
create table public.chat_messages (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references public.families (id) on delete cascade,
  child_id      uuid not null references public.children (id) on delete cascade,
  kind          text not null default 'chat' check (kind in ('chat', 'answer_report')),
  role          text not null check (role in ('child', 'zaki')),
  lesson_key    text,
  text          text not null check (char_length(text) <= 2000),
  created_at    timestamptz not null default now()
);
create index chat_messages_child_idx on public.chat_messages (child_id, created_at desc);
create index chat_messages_created_idx on public.chat_messages (created_at); -- retention sweep
create index chat_messages_family_idx on public.chat_messages (family_id);

-- -------------------------------------------------------------------------------------
-- Safety flags (independent reviewer). NO names: random child_ref + scrubbed excerpt only.
-- -------------------------------------------------------------------------------------
create table public.flags (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  -- Kept as "set null" so deleting a family never silently destroys an open referral.
  family_id          uuid references public.families (id) on delete set null,
  child_ref          text check (child_ref is null or child_ref ~ '^[A-Za-z0-9_-]{1,64}$'),
  category           text not null check (category in ('disclosure_harm', 'self_harm', 'sexual', 'violence_fear',
                       'personal_data', 'adult_topic', 'prompt_injection', 'off_topic', 'politics', 'other')),
  route              text not null check (route in ('reviewer', 'parent')),
  involves_home      boolean not null default false,
  alert_level        text check (alert_level in ('urgent', 'calm')),
  speaker            text not null default 'child' check (speaker in ('child', 'tutor', 'parent')),
  lang               public.zaki_lang,
  country            public.zaki_country,
  layers             text[] not null default '{}',
  excerpt            text not null check (char_length(excerpt) <= 200),
  status             text not null default 'pending_review'
                       check (status in ('pending_review', 'reviewed', 'referred', 'closed')),
  -- Reviewer decides whether a parent may see this (never automatic for route = 'reviewer').
  shared_with_parent boolean not null default false,
  reviewer_note      text check (reviewer_note is null or char_length(reviewer_note) <= 1000),
  reviewed_at        timestamptz,
  reviewed_by        uuid,
  -- Home-involvement rule (safety review R3): reviewer route can never be shared automatically.
  constraint reviewer_route_not_auto_shared check (route = 'parent' or shared_with_parent = false or reviewed_at is not null)
);
create index flags_status_idx on public.flags (status, created_at);
create index flags_family_idx on public.flags (family_id);
create index flags_reviewed_idx on public.flags (reviewed_at) where status in ('reviewed', 'closed');

-- People who may read flags (the named, independent reviewer and a backup). Managed by the
-- server / founder through the service role. Not a family table.
create table public.reviewers (
  user_id       uuid primary key,
  label         text not null check (char_length(label) between 1 and 40), -- e.g. 'reviewer-1' (no names needed)
  active        boolean not null default true,
  added_at      timestamptz not null default now()
);

-- -------------------------------------------------------------------------------------
-- Shared lesson library (typed topics only, no family link at all)
-- -------------------------------------------------------------------------------------
create table public.library (
  key           text primary key check (char_length(key) between 3 and 300), -- subject|normalized topic|grade|lang
  subject       public.zaki_subject not null,
  topic_norm    text not null,
  grade         smallint not null check (grade between 1 and 6),
  lang          public.zaki_lang not null,
  pack          jsonb not null check (jsonb_typeof(pack) = 'object'),
  sources       jsonb not null default '[]'::jsonb,
  verify        jsonb not null default '{"checked":0,"removed":0}'::jsonb,
  saved_at      timestamptz not null default now()
);
create index library_lookup_idx on public.library (subject, grade, lang);

-- -------------------------------------------------------------------------------------
-- Audit log (who did what; never message text). No foreign key so it outlives deletions.
-- -------------------------------------------------------------------------------------
create table public.audit_log (
  id            bigint generated always as identity primary key,
  at            timestamptz not null default now(),
  actor         text not null check (actor in ('server', 'family', 'reviewer', 'system')),
  actor_user    uuid,
  family_id     uuid,
  action        text not null check (char_length(action) between 1 and 60),
  detail        jsonb not null default '{}'::jsonb
);
create index audit_log_family_idx on public.audit_log (family_id, at desc);
create index audit_log_at_idx on public.audit_log (at);

-- -------------------------------------------------------------------------------------
-- Daily AI spending cap (server only)
-- -------------------------------------------------------------------------------------
create table public.budget_daily (
  day           date primary key,
  spent_usd     numeric(12, 6) not null default 0 check (spent_usd >= 0),
  by_purpose    jsonb not null default '{"lesson":0,"tutor":0,"safety":0}'::jsonb,
  updated_at    timestamptz not null default now()
);

create table public.child_turns_daily (
  day           date not null,
  child_ref     text not null,
  turns         integer not null default 0 check (turns >= 0),
  primary key (day, child_ref)
);

-- =====================================================================================
-- Helper functions (SECURITY DEFINER, fixed search_path; used inside RLS policies)
-- =====================================================================================
create or replace function public.zaki_my_family_ids()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select g.family_id from public.guardians g where g.user_id = auth.uid()
$$;

create or replace function public.zaki_is_reviewer()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.reviewers r where r.user_id = auth.uid() and r.active)
$$;

create or replace function public.zaki_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger families_touch before update on public.families for each row execute function public.zaki_touch_updated_at();
create trigger children_touch before update on public.children for each row execute function public.zaki_touch_updated_at();
create trigger lessons_touch before update on public.lessons for each row execute function public.zaki_touch_updated_at();

-- A child row and everything under it must belong to the same family (stops a parent from
-- attaching their rows to another family's child id).
create or replace function public.zaki_check_child_family()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.child_id is not null and not exists (
    select 1 from public.children c where c.id = new.child_id and c.family_id = new.family_id
  ) then
    raise exception 'child does not belong to this family' using errcode = '42501';
  end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['lessons', 'lesson_packs', 'exams', 'attempts', 'sessions', 'chat_messages'] loop
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.zaki_check_child_family()', t || '_child_family', t);
  end loop;
end $$;

-- =====================================================================================
-- Row-Level Security: ON for every table
-- =====================================================================================
alter table public.families          enable row level security;
alter table public.guardians         enable row level security;
alter table public.consents          enable row level security;
alter table public.children          enable row level security;
alter table public.lessons           enable row level security;
alter table public.lesson_packs      enable row level security;
alter table public.exams             enable row level security;
alter table public.attempts          enable row level security;
alter table public.sessions          enable row level security;
alter table public.chat_messages     enable row level security;
alter table public.flags             enable row level security;
alter table public.reviewers         enable row level security;
alter table public.library           enable row level security;
alter table public.audit_log         enable row level security;
alter table public.budget_daily      enable row level security;
alter table public.child_turns_daily enable row level security;

-- Families: read/update own; create and delete go through functions below (or the server).
create policy families_select_own on public.families for select to authenticated
  using (id in (select public.zaki_my_family_ids()));
create policy families_update_own on public.families for update to authenticated
  using (id in (select public.zaki_my_family_ids()))
  with check (id in (select public.zaki_my_family_ids()));

-- Family-owned tables: full read/write on own family rows only.
do $$
declare t text;
begin
  foreach t in array array['guardians', 'children', 'lessons', 'lesson_packs', 'exams', 'attempts', 'sessions', 'chat_messages'] loop
    execute format($f$
      create policy %1$I on public.%2$I for all to authenticated
        using (family_id in (select public.zaki_my_family_ids()))
        with check (family_id in (select public.zaki_my_family_ids()))
    $f$, t || '_own_family', t);
  end loop;
end $$;

-- Consents: a family may read its own and add new ones / record withdrawal, never delete
-- (the history is evidence of consent). Deleting the family removes them.
create policy consents_select_own on public.consents for select to authenticated
  using (family_id in (select public.zaki_my_family_ids()));
create policy consents_insert_own on public.consents for insert to authenticated
  with check (family_id in (select public.zaki_my_family_ids()));
create policy consents_update_own on public.consents for update to authenticated
  using (family_id in (select public.zaki_my_family_ids()))
  with check (family_id in (select public.zaki_my_family_ids()));

-- Flags: the reviewer may READ them (direct reads are allowed by RLS, but the reviewer screen
-- should use zaki_reviewer_queue() so every view is logged). Families have NO direct access:
-- they get a minimal, words-free alert list from zaki_my_parent_alerts() (route = 'parent' only).
create policy flags_reviewer_read on public.flags for select to authenticated
  using (public.zaki_is_reviewer());

-- Reviewers: a reviewer may see their own row (so the app knows it is a reviewer). Nothing else.
create policy reviewers_self on public.reviewers for select to authenticated
  using (user_id = auth.uid());

-- Library: readable by every signed-in family; writable only by the server (service role).
create policy library_read_signed_in on public.library for select to authenticated using (true);

-- Audit log: a family may read its own entries (transparency). Writes: functions/server only.
create policy audit_log_family_read on public.audit_log for select to authenticated
  using (family_id in (select public.zaki_my_family_ids()));

-- budget_daily, child_turns_daily: RLS on, NO policies => server (service role) only.

-- -------------------------------------------------------------------------------------
-- Grants (defence in depth on top of RLS). The anon key can do nothing at all.
-- -------------------------------------------------------------------------------------
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;
grant select, insert, update, delete on
  public.children, public.lessons, public.lesson_packs, public.exams,
  public.attempts, public.sessions, public.chat_messages
  to authenticated;
-- Guardians: a parent may add/rename grown-ups but never set or change a login (user_id);
-- linking a second parent's login goes through the server (invite), so nobody can pull a
-- stranger's account into a family or move themselves into another one.
grant select, delete on public.guardians to authenticated;
grant insert (family_id, first_name, relationship) on public.guardians to authenticated;
grant update (first_name, relationship) on public.guardians to authenticated;
-- Families: only the parent-editable fields.
grant select on public.families to authenticated;
grant update (country, report_lang, settings) on public.families to authenticated;
-- Consents are evidence: a parent may add one and record a withdrawal, never rewrite history.
grant select on public.consents to authenticated;
grant insert (family_id, guardian_id, kind, version, method) on public.consents to authenticated;
grant update (withdrawn_at) on public.consents to authenticated;
grant select on public.flags, public.reviewers, public.library, public.audit_log to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- =====================================================================================
-- Functions the app / server / reviewer call (RPC)
-- =====================================================================================

-- A signed-in parent creates their family and themselves as the first guardian.
create or replace function public.zaki_create_family(p_first_name text, p_relationship text,
  p_country text default null, p_report_lang text default 'ar')
returns uuid language plpgsql security definer set search_path = '' as $$
declare fid uuid;
begin
  if auth.uid() is null then raise exception 'sign in first' using errcode = '42501'; end if;
  if exists (select 1 from public.guardians where user_id = auth.uid()) then
    raise exception 'this login already belongs to a family' using errcode = '23505';
  end if;
  insert into public.families (country, report_lang) values (p_country, coalesce(p_report_lang, 'ar')) returning id into fid;
  insert into public.guardians (family_id, user_id, first_name, relationship) values (fid, auth.uid(), p_first_name, p_relationship);
  insert into public.audit_log (actor, actor_user, family_id, action) values ('family', auth.uid(), fid, 'family_created');
  return fid;
end $$;

-- Everything Zaki holds about one family, as one JSON document (parent "export my data").
-- Callable by the server (service role) or by a guardian of that family.
create or replace function public.zaki_export_family(p_family_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
  if auth.uid() is not null and p_family_id not in (select public.zaki_my_family_ids()) then
    raise exception 'not your family' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'exported_at', now(),
    'family',        (select to_jsonb(f) from public.families f where f.id = p_family_id),
    'guardians',     coalesce((select jsonb_agg(to_jsonb(g) - 'user_id') from public.guardians g where g.family_id = p_family_id), '[]'),
    'consents',      coalesce((select jsonb_agg(to_jsonb(c)) from public.consents c where c.family_id = p_family_id), '[]'),
    'children',      coalesce((select jsonb_agg(to_jsonb(c)) from public.children c where c.family_id = p_family_id), '[]'),
    'lessons',       coalesce((select jsonb_agg(to_jsonb(x)) from public.lessons x where x.family_id = p_family_id), '[]'),
    'lesson_packs',  coalesce((select jsonb_agg(to_jsonb(x)) from public.lesson_packs x where x.family_id = p_family_id), '[]'),
    'exams',         coalesce((select jsonb_agg(to_jsonb(x)) from public.exams x where x.family_id = p_family_id), '[]'),
    'attempts',      coalesce((select jsonb_agg(to_jsonb(x)) from public.attempts x where x.family_id = p_family_id), '[]'),
    'sessions',      coalesce((select jsonb_agg(to_jsonb(x)) from public.sessions x where x.family_id = p_family_id), '[]'),
    'chat_messages', coalesce((select jsonb_agg(to_jsonb(x)) from public.chat_messages x where x.family_id = p_family_id), '[]'),
    -- Parent-route alerts only, without the child's words or reviewer notes (safety review 8.2-new-1).
    'parent_alerts', coalesce((select jsonb_agg(jsonb_build_object('id', fl.id, 'created_at', fl.created_at, 'category', fl.category, 'status', fl.status))
                       from public.flags fl where fl.family_id = p_family_id and (fl.route = 'parent' or fl.shared_with_parent)), '[]')
  ) into result;
  if result -> 'family' is null or result -> 'family' = 'null'::jsonb then return null; end if;
  insert into public.audit_log (actor, actor_user, family_id, action)
    values (case when auth.uid() is null then 'server' else 'family' end, auth.uid(), p_family_id, 'family_exported');
  return result;
end $$;

-- Delete a family and everything under it (cascade). Safety flags keep only the random
-- child_ref (family link set to null) so an open referral is never lost (safety review 8.2-e (3)).
create or replace function public.zaki_delete_family(p_family_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  if auth.uid() is not null and p_family_id not in (select public.zaki_my_family_ids()) then
    raise exception 'not your family' using errcode = '42501';
  end if;
  delete from public.families where id = p_family_id;
  get diagnostics n = row_count;
  if n > 0 then
    insert into public.audit_log (actor, actor_user, family_id, action)
      values (case when auth.uid() is null then 'server' else 'family' end, auth.uid(), p_family_id, 'family_deleted');
  end if;
  return n > 0;
end $$;

-- Parent alerts: route = 'parent' (or reviewer chose to share). No excerpt, no reviewer note.
create or replace function public.zaki_my_parent_alerts()
returns table (id uuid, created_at timestamptz, child_ref text, category text, alert_level text, status text)
language sql stable security definer set search_path = '' as $$
  select f.id, f.created_at, f.child_ref, f.category, f.alert_level, f.status
  from public.flags f
  where f.family_id in (select public.zaki_my_family_ids())
    and (f.route = 'parent' or f.shared_with_parent)
  order by f.created_at desc
$$;

-- Reviewer queue: logs every view (safety review 8.2-f).
create or replace function public.zaki_reviewer_queue(p_status text default 'pending_review')
returns setof public.flags language plpgsql security definer set search_path = '' as $$
begin
  if not public.zaki_is_reviewer() then raise exception 'reviewers only' using errcode = '42501'; end if;
  insert into public.audit_log (actor, actor_user, action, detail)
    values ('reviewer', auth.uid(), 'flags_viewed', jsonb_build_object('status', p_status));
  return query select * from public.flags f where p_status is null or f.status = p_status order by f.created_at;
end $$;

create or replace function public.zaki_review_flag(p_flag_id uuid, p_status text, p_note text default null,
  p_share_with_parent boolean default false)
returns public.flags language plpgsql security definer set search_path = '' as $$
declare rec public.flags;
begin
  if not public.zaki_is_reviewer() then raise exception 'reviewers only' using errcode = '42501'; end if;
  update public.flags set status = p_status, reviewer_note = p_note, shared_with_parent = coalesce(p_share_with_parent, false),
         reviewed_at = now(), reviewed_by = auth.uid()
   where id = p_flag_id returning * into rec;
  if rec.id is null then return null; end if;
  insert into public.audit_log (actor, actor_user, family_id, action, detail)
    values ('reviewer', auth.uid(), rec.family_id, 'flag_reviewed', jsonb_build_object('flag_id', rec.id, 'status', p_status, 'shared', rec.shared_with_parent));
  return rec;
end $$;

-- Budget: atomic add (server only). Returns today's new total.
create or replace function public.zaki_budget_add(p_day date, p_purpose text, p_usd numeric)
returns numeric language plpgsql security definer set search_path = '' as $$
declare total numeric;
begin
  if p_purpose not in ('lesson', 'tutor', 'safety') or p_usd < 0 then raise exception 'bad budget entry'; end if;
  insert into public.budget_daily (day, spent_usd, by_purpose)
    values (p_day, p_usd, jsonb_build_object('lesson', 0, 'tutor', 0, 'safety', 0) || jsonb_build_object(p_purpose, p_usd))
  on conflict (day) do update
    set spent_usd = public.budget_daily.spent_usd + excluded.spent_usd,
        by_purpose = public.budget_daily.by_purpose || jsonb_build_object(p_purpose,
                       coalesce((public.budget_daily.by_purpose ->> p_purpose)::numeric, 0) + p_usd),
        updated_at = now()
  returning spent_usd into total;
  return total;
end $$;

-- One Ask-Zaki AI turn for a child; false (nothing counted) when the daily cap is reached.
create or replace function public.zaki_take_child_turn(p_day date, p_child_ref text, p_limit integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  insert into public.child_turns_daily (day, child_ref, turns) values (p_day, p_child_ref, 0)
    on conflict (day, child_ref) do nothing;
  update public.child_turns_daily set turns = turns + 1
   where day = p_day and child_ref = p_child_ref and turns < p_limit
   returning turns into n;
  return n is not null;
end $$;

-- Retention sweep (run daily; see supabase/README.md and 0002_retention_schedule.sql).
--   chat text: ~90 days; reviewed/closed flags: ~30 days after review, never while 'referred'
--   or 'pending_review'; per-child turn counters: 30 days; budget rows: 400 days;
--   audit log: 2 years. Page photos live in the 'page-photos' storage bucket and are removed
--   by the server job through the Storage API (deleting storage rows in SQL leaves the files).
create or replace function public.zaki_run_retention(p_chat_days integer default 90, p_flag_days integer default 30)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare c int; f int; t int; b int; a int;
begin
  delete from public.chat_messages where created_at < now() - make_interval(days => p_chat_days);
  get diagnostics c = row_count;
  delete from public.flags where status in ('reviewed', 'closed') and reviewed_at < now() - make_interval(days => p_flag_days);
  get diagnostics f = row_count;
  delete from public.child_turns_daily where day < current_date - 30;
  get diagnostics t = row_count;
  delete from public.budget_daily where day < current_date - 400;
  get diagnostics b = row_count;
  delete from public.audit_log where at < now() - interval '2 years';
  get diagnostics a = row_count;
  insert into public.audit_log (actor, action, detail)
    values ('system', 'retention_run', jsonb_build_object('chat', c, 'flags', f, 'turns', t, 'budget', b, 'audit', a));
  return jsonb_build_object('chat', c, 'flags', f, 'turns', t, 'budget', b, 'audit', a);
end $$;

-- Who may call what. Nothing for anon. Families: their own-family helpers. Server: everything.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.zaki_my_family_ids(), public.zaki_is_reviewer(),
  public.zaki_create_family(text, text, text, text), public.zaki_export_family(uuid),
  public.zaki_delete_family(uuid), public.zaki_my_parent_alerts(),
  public.zaki_reviewer_queue(text), public.zaki_review_flag(uuid, text, text, boolean)
  to authenticated;
grant execute on all functions in schema public to service_role;

-- =====================================================================================
-- Page-photo bucket (private, short-lived). Only on Supabase (storage schema exists).
-- No storage policies => only the server (service role) can read or write photos.
-- Lifecycle: the server retention job deletes objects older than 30 days via the Storage API.
-- By default Zaki does NOT keep photos at all (they are sent inline and dropped).
-- =====================================================================================
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      values ('page-photos', 'page-photos', false, 5242880, array['image/jpeg'])
      on conflict (id) do nothing;
  end if;
end $$;

commit;
