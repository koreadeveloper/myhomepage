-- sia.kr 방문자 통계 — Supabase 대시보드 → SQL Editor에서 실행
-- (기존에 일부만 실행했다면 전체를 다시 실행해도 안전합니다: if not exists/or replace 사용)

-- 1) 방문 기록 테이블
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
alter table site_visits add column if not exists ip_address text;

create index if not exists site_visits_created_at_idx
  on site_visits (created_at desc);

-- 2) 누구나 방문 기록 INSERT 가능
alter table site_visits enable row level security;

drop policy if exists "anon insert site_visits" on site_visits;
create policy "anon insert site_visits" on site_visits
  for insert to anon with check (true);

-- 3) IP 제외 공개 뷰 — /stats 페이지는 이 뷰만 읽습니다
drop policy if exists "anon read site_visits" on site_visits;

create or replace view site_visits_public as
  select id, created_at, session_id, path, referrer,
         country, country_code, city, device, browser
  from site_visits;

grant select on site_visits_public to anon;

-- 4) 비밀번호 보관용 비공개 테이블 (anon 읽기 불가)
create table if not exists app_secrets (
  key text primary key,
  value text not null
);
alter table app_secrets enable row level security;

-- ★ 여기에 원하는 비밀번호를 넣고 실행하세요
insert into app_secrets (key, value)
values ('stats_ip_password', 'CHANGE_ME')
on conflict (key) do nothing;

-- 5) 비밀번호 확인 후 IP만 반환하는 함수
create or replace function get_visit_ips(secret text)
returns table(id uuid, ip_address text)
language plpgsql security definer set search_path = public
as $$
declare stored text;
begin
  select value into stored from app_secrets where key = 'stats_ip_password';
  if stored is null or secret is null or secret <> stored then
    raise exception 'invalid password';
  end if;
  return query
    select v.id, v.ip_address
    from site_visits v
    order by v.created_at desc
    limit 200;
end;
$$;

grant execute on function get_visit_ips(text) to anon;

-- 6) 방명록 — 누구나 읽기/쓰기, 수정·삭제는 불가 (남발 방지는 앱에서 200자 제한)
create table if not exists guestbook (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nickname text not null check (char_length(nickname) between 1 and 20),
  message text not null check (char_length(message) between 1 and 200)
);
alter table guestbook enable row level security;

drop policy if exists "anon read guestbook" on guestbook;
create policy "anon read guestbook" on guestbook
  for select to anon using (true);

drop policy if exists "anon insert guestbook" on guestbook;
create policy "anon insert guestbook" on guestbook
  for insert to anon with check (true);

-- 7) 게임 플레이 로그 읽기 허용 — /stats 인기 게임 차트용
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'game_play_logs') then
    execute 'drop policy if exists "anon read game_play_logs" on game_play_logs';
    execute 'create policy "anon read game_play_logs" on game_play_logs for select to anon using (true)';
  end if;
end $$;
