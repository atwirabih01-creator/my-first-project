-- =====================================================================================
-- Zaki: family secret keys (family identity, decision (a)). Run AFTER 0001 and 0002.
-- =====================================================================================
-- Plain summary: when a family gives consent in the app, Zaki's server creates the family and
-- hands the phone a long random secret key. The server keeps ONLY a hash of that key here.
-- Every family route (sync, export, delete) must present the key; the server checks the hash
-- before it touches that family's rows with the service role.
-- Nobody but the server (service role) can read this table: RLS is on and there are no
-- policies, so parents and reviewers can't see it. Deleting a family deletes its key.
-- =====================================================================================
create table if not exists public.family_keys (
  family_id   uuid primary key references public.families (id) on delete cascade,
  key_hash    text not null check (key_hash ~ '^[0-9a-f]{64}$'),
  created_at  timestamptz not null default now(),
  rotated_at  timestamptz
);
comment on table public.family_keys is 'SHA-256 of each family''s server-issued secret key. Service role only. Never the key itself.';
alter table public.family_keys enable row level security;
-- No policies on purpose: only the service role (which bypasses RLS) may read or write it.
revoke all on public.family_keys from anon, authenticated;
grant select, insert, update, delete on public.family_keys to service_role;
