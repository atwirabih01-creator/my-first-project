-- Round 3 (founder decisions):
--  1. New flag category "sensitive_topic": politics, war as a subject, armed groups, religion /
--     sect rulings, adult subjects. The child gets one fixed "not part of our lessons" line, no
--     safety screen; the flag goes to the parent (category + time only) and the reviewer, or to
--     the reviewer only when someone at home is involved.
--  2. Lesson pack format version on the shared library (3 = story-lesson teach steps with a
--     title). The server does not serve entries saved with an older version; it rebuilds them.
alter table public.flags drop constraint if exists flags_category_check;
alter table public.flags add constraint flags_category_check check (category in ('disclosure_harm', 'self_harm', 'sexual', 'violence_fear',
  'help_request', 'personal_data', 'adult_topic', 'prompt_injection', 'off_topic', 'politics', 'sensitive_topic', 'other'));

alter table public.library add column if not exists pack_version smallint not null default 1;
