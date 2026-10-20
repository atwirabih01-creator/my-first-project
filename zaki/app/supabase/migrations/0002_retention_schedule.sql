-- =====================================================================================
-- Zaki: daily clean-up job (retention). Run AFTER 0001_init.sql.
-- =====================================================================================
-- Plain summary: every night at 03:17 (UTC) the database deletes old chat text (~90 days),
-- reviewed safety flags (~30 days after review, never while a referral is open), and old
-- counters. Uses pg_cron, which is included in the free Supabase plan.
--
-- Page photos (storage bucket 'page-photos', ~30 days) are cleaned by Zaki's server through
-- the Storage API (server/storage: store.runRetention()), because deleting storage rows in
-- SQL would leave the files behind. Schedule that as a daily call too (e.g. an EAS Hosting
-- cron or a Claude scheduled task hitting the server's retention route).
-- =====================================================================================

create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;

-- Replace an older copy of the job if this file is run twice.
select cron.unschedule(jobid) from cron.job where jobname = 'zaki-retention';

select cron.schedule(
  'zaki-retention',
  '17 3 * * *',
  $$select public.zaki_run_retention(90, 30)$$
);
