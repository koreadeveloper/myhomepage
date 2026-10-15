-- sia.kr 방문자 통계 테이블
-- Supabase 대시보드 → SQL Editor에서 실행

create table if not exists site_visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,
  path text,
  referrer text,
  ip_address text,
  country text,
  country_code text,
  city text,
  device text,
  browser text
);

-- 이미 테이블을 만든 경우: 아래 한 줄만 실행하면 됩니다
alter table site_visits add column if not exists ip_address text;

alter table site_visits enable row level security;

-- 누구나 방문 기록을 INSERT 가능 (방문자 추적)
drop policy if exists "anon insert site_visits" on site_visits;
create policy "anon insert site_visits" on site_visits
  for insert to anon with check (true);

-- 통계 페이지(/stats)에서 읽기 허용 — 집계 데이터만 저장되므로 공개
drop policy if exists "anon read site_visits" on site_visits;
create policy "anon read site_visits" on site_visits
  for select to anon using (true);

create index if not exists site_visits_created_at_idx
  on site_visits (created_at desc);
