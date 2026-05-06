-- 지갑 테이블: AI와 사용자 각각의 보유 현금
create table portfolios (
  player text primary key,
  cash bigint default 10000000
);

-- 보유 주식 테이블
create table holdings (
  player text,
  ticker text,
  name text,
  qty integer,
  avg_price integer,
  primary key (player, ticker)
);

-- 거래 기록 테이블
create table trades (
  id uuid primary key default gen_random_uuid(),
  player text,
  action text,
  ticker text,
  name text,
  qty integer,
  price integer,
  reason text,
  executed_at timestamptz default now()
);

-- 수익률 히스토리 테이블 (차트용, 새로고침해도 유지)
create table perf_history (
  id uuid primary key default gen_random_uuid(),
  player text,
  total_value bigint,
  return_pct numeric(8,4),
  recorded_at timestamptz default now()
);

-- 초기 데이터
insert into portfolios (player, cash) values ('ai', 10000000);
insert into portfolios (player, cash) values ('user', 10000000);
