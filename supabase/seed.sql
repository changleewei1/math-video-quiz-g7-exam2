-- 初始資料：段考 scope、單元、技能標籤、範例學生
-- 執行前請先套用 migrations。可於 Supabase SQL Editor 手動執行。

-- 段考範圍（固定 UUID 方便 .env 對應）
insert into public.exam_scopes (
  id, subject, grade, term, exam_no, title, description, is_active
) values (
  'a0000001-0000-4000-8000-000000000001',
  '數學',
  7,
  2,
  2,
  '國一數學第二次段考',
  '比與比例；平面座標與二元一次方程式圖形',
  true
) on conflict (id) do nothing;

insert into public.scope_units (id, exam_scope_id, unit_code, unit_title, sort_order) values
  ('a0000001-0000-4000-8000-000000000002', 'a0000001-0000-4000-8000-000000000001', 'U-RATIO', '比與比例', 1),
  ('a0000001-0000-4000-8000-000000000003', 'a0000001-0000-4000-8000-000000000001', 'U-COORD', '平面座標與二元一次方程式圖形', 2)
on conflict (id) do nothing;

-- 範例學生（請改為實際學號）
insert into public.students (student_code, name, grade, class_name, is_active) values
  ('demo001', '示範同學', 7, '701', true)
on conflict (student_code) do nothing;

-- skill_tags（3-1 比例式）
insert into public.skill_tags (code, name, unit, category) values
  ('R01', '比與比值', '3-1 比例式', 'ratio'),
  ('R02', '比例式定義', '3-1 比例式', 'ratio'),
  ('R03', '內外項', '3-1 比例式', 'ratio'),
  ('R04', '交叉相乘', '3-1 比例式', 'ratio'),
  ('R05', '比例應用', '3-1 比例式', 'ratio'),
  ('R06', '比例尺', '3-1 比例式', 'ratio'),
  ('R07', '配方比例', '3-1 比例式', 'ratio')
on conflict (code) do nothing;

-- 3-2 正比與反比
insert into public.skill_tags (code, name, unit, category) values
  ('P01', '正比定義', '3-2 正比與反比', 'proportion'),
  ('P02', '反比定義', '3-2 正比與反比', 'proportion'),
  ('P03', '判斷正反比', '3-2 正比與反比', 'proportion'),
  ('P04', '求正比常數', '3-2 正比與反比', 'proportion'),
  ('P05', '求反比常數', '3-2 正比與反比', 'proportion'),
  ('P06', '正反比求值', '3-2 正比與反比', 'proportion'),
  ('P07', '正比應用', '3-2 正比與反比', 'proportion'),
  ('P08', '反比應用', '3-2 正比與反比', 'proportion'),
  ('P09', '混合判斷', '3-2 正比與反比', 'proportion')
on conflict (code) do nothing;

-- 2-2 二元一次方程式的圖形
insert into public.skill_tags (code, name, unit, category) values
  ('C01', '直線概念', '2-2 二元一次方程式的圖形', 'coord'),
  ('C02', '點與解', '2-2 二元一次方程式的圖形', 'coord'),
  ('C03', '截距', '2-2 二元一次方程式的圖形', 'coord'),
  ('C04', '截距畫圖', '2-2 二元一次方程式的圖形', 'coord'),
  ('C05', '代點畫圖', '2-2 二元一次方程式的圖形', 'coord'),
  ('C06', '由圖求式', '2-2 二元一次方程式的圖形', 'coord'),
  ('C07', '聯立與交點', '2-2 二元一次方程式的圖形', 'coord')
on conflict (code) do nothing;
