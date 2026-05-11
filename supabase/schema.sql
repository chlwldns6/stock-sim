-- 지갑 테이블
create table portfolios (
  player text primary key,
  cash bigint default 10000000,
  initial_capital integer not null default 10000000
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
  action text,                   -- 'BUY' 또는 'SELL'
  ticker text,
  name text,
  qty integer,
  price integer,
  avg_price integer,             -- SELL 시 평균매수가
  realized_pnl integer,         -- SELL 시 실현손익
  reason text,
  executed_at timestamptz default now()
);

-- 수익률 히스토리 테이블
create table perf_history (
  id uuid primary key default gen_random_uuid(),
  player text,
  total_value bigint,
  return_pct numeric(8,4),
  recorded_at timestamptz default now()
);

alter table perf_history disable row level security;

-- 초기 데이터 (ai, user, scalper 세 플레이어)
insert into portfolios (player, cash, initial_capital) values ('ai', 10000000, 10000000);
insert into portfolios (player, cash, initial_capital) values ('user', 10000000, 10000000);
insert into portfolios (player, cash, initial_capital) values ('scalper', 10000000, 10000000);
