import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchStockPrices } from '@/lib/yahoo';
import { getPortfolio, getHoldings, executeTrade } from '@/lib/db';
import { getDeadlineContext } from '@/lib/deadline';
import { isKoreanHoliday } from '@/lib/holidays';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

let scalperRunning = false;

export async function runScalper(): Promise<Record<string, unknown>> {
  if (isKoreanHoliday(new Date())) {
    return { action: 'HOLD', reason: '오늘은 공휴일(KRX 휴장일)입니다.' };
  }

  if (scalperRunning) {
    return { action: 'HOLD', reason: '단타봇이 이미 실행 중입니다.' };
  }
  scalperRunning = true;

  try {
    const [stocks, portfolio, holdings] = await Promise.all([
      fetchStockPrices(),
      getPortfolio('scalper'),
      getHoldings('scalper'),
    ]);

    if (!portfolio) return { error: 'scalper 포트폴리오 없음' };

    const validStocks = stocks.filter(s => s.price > 0);
    const holdingTickers = holdings.map(h => h.ticker);
    const totalAsset = portfolio.cash + holdings.reduce((sum, h) => {
      const s = validStocks.find(st => st.ticker === h.ticker);
      return sum + (s ? s.price * h.qty : h.avg_price * h.qty);
    }, 0);

    const initialCapital = portfolio.initial_capital ?? 10000000;
    const deadlineCtx = getDeadlineContext();
    const returnPct = ((totalAsset - initialCapital) / initialCapital * 100).toFixed(2);
    const minCash = Math.round(initialCapital * 0.05);
    const minCashFmt = minCash >= 10000 ? `${(minCash / 10000).toLocaleString()}만원` : `${minCash.toLocaleString()}원`;
    const aiMinCashFmt = (() => { const v = Math.round(initialCapital * 0.2); return v >= 10000 ? `${(v / 10000).toLocaleString()}만원` : `${v.toLocaleString()}원`; })();

    const holdingText = holdings.length === 0
      ? '없음'
      : holdings.map(h => {
          const s = validStocks.find(st => st.ticker === h.ticker);
          const pnl = s ? ((s.price - h.avg_price) / h.avg_price * 100).toFixed(2) : '0';
          const evalAmt = s ? (s.price * h.qty).toLocaleString() : '?';
          return `${h.name}(${h.ticker}) ${h.qty}주 | 평균매수가 ${h.avg_price.toLocaleString()}원 | 현재수익률 ${pnl}% | 평가금액 ${evalAmt}원`;
        }).join('\n');

    const risingStocks = validStocks
      .filter(s => !holdingTickers.includes(s.ticker))
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 30)
      .map(s => {
        const maxQty = Math.floor(portfolio.cash / s.price);
        return `${s.name}(${s.ticker}): ${s.price.toLocaleString()}원 ${s.changePercent > 0 ? '+' : ''}${s.changePercent}% | 최대 ${maxQty}주`;
      });

    const reboundStocks = validStocks
      .filter(s => !holdingTickers.includes(s.ticker) && s.changePercent <= -2)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 10)
      .map(s => {
        const maxQty = Math.floor(portfolio.cash / s.price);
        return `[급락반등] ${s.name}(${s.ticker}): ${s.price.toLocaleString()}원 ${s.changePercent}% | 최대 ${maxQty}주`;
      });

    const buyableCandidates = [...risingStocks, ...reboundStocks].join('\n');

    const sellCandidates = holdings.length === 0 ? '없음' : holdings.map(h => {
      const s = validStocks.find(st => st.ticker === h.ticker);
      if (!s) return null;
      const pnl = ((s.price - h.avg_price) / h.avg_price * 100).toFixed(2);
      return `${s.name}(${s.ticker}): 오늘 ${s.changePercent > 0 ? '+' : ''}${s.changePercent}% | 보유수익률 ${pnl}% | ${h.qty}주`;
    }).filter(Boolean).join('\n');

    const prompt = `당신은 한국 주식시장 최강의 단타 스캘퍼입니다. AI 에이전트보다 훨씬 빠르고 공격적으로 움직입니다.

【미션】
매주 일요일 23:00 총 자산 평가. AI 에이전트를 반드시 압도해야 합니다.
AI 에이전트는 신중하고 느립니다. 당신은 그 반대입니다. 빠르게 치고 빠지는 것이 전략입니다.

【마감 현황】
${deadlineCtx}

【현재 수익률: ${returnPct}%】
- 수익률이 AI 에이전트보다 낮다면 지금 즉시 더 공격적으로 움직이세요.
- 마감 당일에는 포지션 전량 정리 후 가장 강한 종목에 마지막 올인.

【단타 스캘퍼 철학】
- 작은 수익을 빠르게 여러 번 챙기는 것이 큰 수익 한 번보다 낫습니다.
- 포지션에 감정적으로 집착하지 않습니다. 더 좋은 기회가 보이면 즉시 갈아탑니다.
- 현금이 50만원이라도 있으면 기회를 찾습니다. 현금은 기회비용입니다.
- 오르는 종목은 더 오릅니다. 모멘텀을 쫓으세요.
- 손실이 나기 시작하면 0.8%만 빠져도 즉시 탈출합니다. 미련은 금물.

【매수 전략 (AI 에이전트보다 훨씬 공격적)】
- 오늘 상승 중인 종목이면 무조건 매수 검토 (상승폭 무관)
- 오늘 -2% 이상 급락 종목 → 반등 노리고 적극 매수
- 현금 ${minCashFmt}만 있어도 매수 가능 (AI 에이전트는 ${aiMinCashFmt} 필요)
- 보유 5개까지 가능 (AI 에이전트는 3개)
- 수량은 자유. 확신이 있으면 전액 올인, 탐색 목적이면 소량도 가능
  → qty는 후보 목록의 최대 수량을 초과할 수 없음
- 보유 중인 종목이 수익 중이라도, 더 강한 모멘텀 종목이 있으면 갈아타는 것을 고려

【매도 전략 (빠르게, 더 빠르게)】
- 보유수익률 +1% → 즉시 익절 전량 (AI 에이전트는 +3%까지 기다림 — 당신은 더 빠름)
- 보유수익률 -0.8% → 즉시 손절 전량 (AI 에이전트는 -2%까지 버팀 — 당신은 더 빠름)
- 오늘 하락 중인 보유 종목 → 수익률과 무관하게 손절 적극 검토
- 더 강한 모멘텀 종목 발견 시 → 현 포지션 정리 후 갈아타기
- 수량 자유 (전량 또는 일부)

【HOLD 조건 (거의 없음)】
- 현금 ${minCashFmt} 미만 AND 보유 종목 수익률이 모두 -0.8%~+1% 사이일 때만
- 그 외 상황에서 HOLD는 기회 낭비입니다

반드시 JSON 형식으로만 답하세요.

형식:
{"action":"BUY","ticker":"005930.KS","name":"삼성전자","qty":25,"reason":"이유..."}
{"action":"SELL","ticker":"005930.KS","name":"삼성전자","qty":25,"reason":"이유..."}
{"action":"HOLD","reason":"이유..."}

【현재 상황】
총 자산: ${totalAsset.toLocaleString()}원 (초기 대비 ${returnPct}%)
초기 자본: ${initialCapital.toLocaleString()}원
보유 현금: ${portfolio.cash.toLocaleString()}원 (현금 비중 ${((portfolio.cash / totalAsset) * 100).toFixed(1)}%)
보유 종목: ${holdings.length}개 (최대 5개)

[보유 종목 수익률]
${holdingText}

[매수 후보 (상승 TOP30 + 급락반등 후보)]
${buyableCandidates}

[매도/갈아타기 검토 종목]
${sellCandidates}

JSON만 답하세요.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { action: 'HOLD', reason: 'AI 응답에서 JSON을 찾지 못했습니다.' };
    }

    let decision: any;
    try {
      decision = JSON.parse(jsonMatch[0]);
    } catch {
      return { action: 'HOLD', reason: 'AI 응답 파싱 실패' };
    }

    if (decision.action === 'HOLD') return decision;

    const stock = validStocks.find(s => s.ticker === decision.ticker);
    if (!stock) {
      return { action: 'HOLD', reason: `${decision.ticker} 종목을 찾을 수 없습니다.` };
    }

    if (decision.action === 'SELL' && !holdingTickers.includes(stock.ticker)) {
      return { action: 'HOLD', reason: '보유하지 않은 종목 매도 시도' };
    }

    let qty = Math.floor(decision.qty ?? 1);
    if (decision.action === 'BUY') {
      const maxQty = Math.floor(portfolio.cash / stock.price);
      qty = Math.min(qty, maxQty);
      if (qty < 1) return { action: 'HOLD', reason: '현금 부족' };
    }

    if (decision.action === 'SELL') {
      const holding = holdings.find(h => h.ticker === stock.ticker);
      if (!holding) return { action: 'HOLD', reason: '보유 종목 없음' };
      qty = Math.min(qty, holding.qty);
      if (qty < 1) return { action: 'HOLD', reason: '매도 수량 오류' };
    }

    await executeTrade({
      player: 'scalper',
      action: decision.action,
      ticker: stock.ticker,
      name: stock.name,
      qty,
      price: stock.price,
      reason: decision.reason,
    });

    return { ...decision, qty, price: stock.price };
  } finally {
    scalperRunning = false;
  }
}
