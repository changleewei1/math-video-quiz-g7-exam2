-- 測驗題目：支援題幹／選項以圖片呈現（與文字可並存或擇一）

alter table public.quiz_questions
  add column if not exists question_image_url text,
  add column if not exists choice_a_image_url text,
  add column if not exists choice_b_image_url text,
  add column if not exists choice_c_image_url text,
  add column if not exists choice_d_image_url text;

alter table public.quiz_questions alter column question_text drop not null;
alter table public.quiz_questions alter column choice_a drop not null;
alter table public.quiz_questions alter column choice_b drop not null;
alter table public.quiz_questions alter column choice_c drop not null;
alter table public.quiz_questions alter column choice_d drop not null;

update public.quiz_questions set question_text = coalesce(question_text, '');
update public.quiz_questions set choice_a = coalesce(choice_a, '');
update public.quiz_questions set choice_b = coalesce(choice_b, '');
update public.quiz_questions set choice_c = coalesce(choice_c, '');
update public.quiz_questions set choice_d = coalesce(choice_d, '');

alter table public.quiz_questions alter column question_text set default '';
alter table public.quiz_questions alter column choice_a set default '';
alter table public.quiz_questions alter column choice_b set default '';
alter table public.quiz_questions alter column choice_c set default '';
alter table public.quiz_questions alter column choice_d set default '';

-- 公開讀取、由後端以 service role 上傳
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quiz-assets',
  'quiz-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 匿名可讀取（題目圖片顯示在學生端）
drop policy if exists "Public read quiz-assets" on storage.objects;
create policy "Public read quiz-assets"
  on storage.objects for select
  to public
  using (bucket_id = 'quiz-assets');
