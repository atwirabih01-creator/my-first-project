-- New flag category: the child asked where to get help (helpline, who to call, "I need help now").
alter table public.flags drop constraint if exists flags_category_check;
alter table public.flags add constraint flags_category_check check (category in ('disclosure_harm', 'self_harm', 'sexual', 'violence_fear',
  'help_request', 'personal_data', 'adult_topic', 'prompt_injection', 'off_topic', 'politics', 'other'));
