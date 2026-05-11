@AGENTS.md

# stock-sim

한국 주식 가상 투자 플랫폼. AI 에이전트(Gemini), 단타봇(scalper), 사용자(user) 세 플레이어가 초기 자본 1,000만 원으로 경쟁한다. 매주 일요일 23:00 총 자산 기준으로 순위를 평가한다.

## 스택

| 항목 | 값 |
|------|----|
| Next.js | **16.2.4** — 기존 지식과 다른 부분 있음. 코드 작성 전 `node_modules/next/dist/docs/` 확인 필수 |
| React | 19.2.4 |
| AI 모델 | **Gemini 2.0 Flash** (`@google/generative-ai`) — Anthropic SDK 아님 |
| DB | Supabase (service role key, RLS 미적용) |
| 시세 | Yahoo Finance `/v8/finance/spark` (배치 20종목, 150ms 간격, 120s TTL 캐시) |
| 스타일 | Tailwind CSS v4 |
| 차트 | Recharts v3 |
| 자동화 | GitHub Actions Cron — Vercel Cron 아님 |

## 파일 맵

```
lib/
  db.ts          — Supabase CRUD (getPortfolio, getHoldings, executeTrade, savePerfPoint, resetGame)
  yahoo.ts       — 시세 조회. STOCKS 배열 포함 (500+종목)
  runAgent.ts    — Gemini AI 에이전트 로직
  runScalper.ts  — 단타봇 로직
  market.ts      — 장 개장 여부 판단 (KST 기준)
  holidays.ts    — 한국 공휴일 목록
  deadline.ts    — 주간 마감까지 남은 시간 컨텍스트
  scheduler.ts   — 에이전트/단타봇 실행 스케줄러
app/api/
  agent/         — AI 에이전트 수동 트리거
  scalper/       — 단타봇 수동 트리거
  cron/          — GitHub Actions에서 호출하는 엔드포인트
  quote/         — 시세 조회
  portfolio/     — 포트폴리오 조회
  holdings/      — 보유 종목 조회
  trades/        — 거래 내역 조회
  trade/         — 사용자 수동 매매
  perf/          — 수익률 히스토리
  chart/         — 차트 데이터
  init/          — DB 초기화
  migrate/       — 스키마 마이그레이션
  reset/         — 게임 리셋
supabase/schema.sql — 기준 스키마 (실제 DB에는 컬럼이 추가된 상태)
```

## DB 스키마 (실제 상태)

`schema.sql`에는 없지만 실제 DB에 존재하는 컬럼:

- `portfolios.initial_capital` — 초기 자본금. `getPortfolio()`가 반환하는 `Portfolio` 타입에 포함됨
- `trades.avg_price` — 매도 시 평균매수가 기록용
- `trades.realized_pnl` — 실현손익 (매도 시만 insert)

스키마 변경 시 `schema.sql`과 `lib/db.ts`의 TypeScript 인터페이스를 동시에 수정한다.

## 플레이어 식별자

| 식별자 | 의미 |
|--------|------|
| `'ai'` | Gemini 에이전트 |
| `'user'` | 사람 (UI에서 수동 매매) |
| `'scalper'` | 단타봇 |

`player` 값은 이 세 가지만 존재한다. DB 함수는 player 문자열로 구분하므로 오타 주의.

## 시세 조회 규칙

- Yahoo Finance spark API: `https://query1.finance.yahoo.com/v8/finance/spark`
- 티커 형식: KOSPI는 `{코드}.KS`, KOSDAQ은 `{코드}.KQ`
- 배치 크기 20, 배치 간 sleep 150ms — Yahoo 과호출 방지
- 캐시 TTL 120초 (모듈 레벨 `stockCache` 변수, 서버리스 cold start 시 초기화)
- `price > 0` 필터: 시세 0인 종목은 유효하지 않은 것으로 처리

## 에이전트 실행 규칙

- `agentRunning` 플래그: 모듈 레벨 뮤텍스. cold start 시 초기화되므로 서버리스 환경에서는 완전하지 않음
- 한국 공휴일이면 즉시 HOLD 반환 (`isKoreanHoliday()`)
- Gemini 응답은 JSON 파싱. `jsonMatch[0]`으로 첫 JSON 블록만 추출
- AI 결정 검증 순서: ① ticker 유효성 ② 보유 종목 여부(SELL) ③ qty 상한 클램핑

## 수익률 히스토리 (`perf_history`)

- `savePerfPoint()`: 4분 이내 중복 저장 방지
- 7일 이상 된 데이터 자동 삭제 (save 호출 시마다 실행)
- 차트용이므로 과거 데이터 수동 삭제는 하지 않는다

## 놓치기 쉬운 제약

1. **Supabase 클라이언트는 `SUPABASE_SERVICE_ROLE_KEY`** 사용 — anon key가 아님. `lib/db.ts`에서 서버 전용으로만 import.
2. **`NEXT_PUBLIC_SUPABASE_URL`은 클라이언트에 노출**되지만 service role key는 절대 클라이언트 번들에 포함되면 안 됨.
3. **BUY 거래 insert에는 `realized_pnl`과 `avg_price` 없음** — SELL에만 기록.
4. **최대 보유 종목 3개** — 에이전트 프롬프트에 하드코딩됨. DB 레벨 제약은 없으므로 로직으로만 강제.
5. **최소 현금 20%** — `initialCapital * 0.2`. 에이전트 프롬프트 규칙이며 `executeTrade`는 강제하지 않음.
6. **GitHub Actions Cron으로 에이전트 실행** — Vercel Cron/vercel.json의 crons 배열 아님.
7. **장 시간 판단은 `lib/market.ts`** — KST 09:00~15:30. 이 함수 없이 시간 판단 로직 직접 작성 금지.

## 개발 명령

```bash
npm run dev    # node --use-system-ca 플래그 포함 (Windows CA 인증서 문제 우회)
npm run build
npm run start
```
