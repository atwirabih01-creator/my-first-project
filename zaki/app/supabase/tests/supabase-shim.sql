-- Test-only stand-in for the parts of Supabase that 0001_init.sql relies on.
-- NEVER run this on the real Supabase project (it already has all of this).
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
-- Same idea as Supabase's auth.uid(): the signed-in user id from the request's JWT.
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant execute on function auth.uid() to anon, authenticated, service_role;
