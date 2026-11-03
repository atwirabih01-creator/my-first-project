-- Grades 1-9 (was 1-6) and three new middle-school subjects (physics, chemistry, biology).
-- The child's age is NOT stored in the database (it stays on the family's phone).
alter domain public.zaki_subject drop constraint if exists zaki_subject_check;
alter domain public.zaki_subject add constraint zaki_subject_check
  check (value in ('math', 'science', 'physics', 'chemistry', 'biology', 'english', 'arabic', 'social'));

alter table public.children drop constraint if exists children_grade_check;
alter table public.children add constraint children_grade_check check (grade between 1 and 9);

alter table public.lesson_packs drop constraint if exists lesson_packs_grade_check;
alter table public.lesson_packs add constraint lesson_packs_grade_check check (grade between 1 and 9);

alter table public.library drop constraint if exists library_grade_check;
alter table public.library add constraint library_grade_check check (grade between 1 and 9);
