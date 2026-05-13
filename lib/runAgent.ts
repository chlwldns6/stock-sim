import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchStockPrices } from '@/lib/yahoo';
import { getPortfolio, getHoldings, executeTrade } from '@/lib/db';
import { getDeadlineContext } from '@/lib/deadline';
import { isKoreanHoliday } from '@/lib/holidays';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

let agentRunning = false;

export async function runAgent(): Promise<Record<string, unknown>> {
  if (isKoreanHoliday(new Date())) {
    return { action: 'HOLD', reason: '오늘은 공휴일(KRX 휴장일)입니다.' };
  }

  if (agentRunning) {
    return { action: 'HOLD', reason: 'AI 에이전트가 이미 실행 중입니다.' };
  }
  agentRunning = true;

  try {
    const [stocks, portfolio, holdings] = await Promise.all([
      fetchStockPrices(),
      getPortfolio('ai'),
      getHoldings('ai'),
    ]);

    if (!portfolio) return { action: 'HOLD', reason: 'AI 포트폴리오를 찾을 수 없습니다.' };

    const validStocks = stocks.filter(s => s.price > 0);
    const holdingTickers = holdings.map(h => h.ticker);
    const totalAsset = portfolio.cash + holdings.reduce((sum, h) => {
      const s = validStocks.find(st => st.ticker === h.ticker);
      return sum + (s ? s.price * h.qty : h.avg_price * h.qty);
    }, 0);

    const initialCapital = portfolio.initial_capital ?? 10000000;
    const deadlineCtx = getDeadlineContext();
    const returnPct = ((totalAsset - initialCapital) / initialCapital * 100).toFixed(2);
    const minCash = Math.round(initialCapital * 0.2);
    const minCashFmt = minCash >= 10000 ? `${(minCash / 10000).toLocaleString()}만원` : `${minCash.toLocaleString()}원`;

    const holdingText = holdings.length === 0
      ? '없음'
      : holdings.map(h => {
          const s = validStocks.find(st => st.ticker === h.ticker);
          const pnl = s ? ((s.price - h.avg_price) / h.avg_price * 100).toFixed(2) : '0';
          const evalAmt = s ? (s.price * h.qty).toLocaleString() : '?';
          return `${h.name}(${h.ticker}) ${h.qty}주 | 평균매수가 ${h.avg_price.toLocaleString()}원 | 현재수익률 ${pnl}% | 평가금액 ${evalAmt}원`;
        }).join('\n');

    const buyableCandidates = validStocks
      .filter(s => !holdingTickers.includes(s.ticker))
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 15)
      .map(s => {
        const maxQty = Math.floor(portfolio.cash / s.price);
        return `${s.name}(${s.ticker}): ${s.price.toLocaleString()}원 ${s.changePercent > 0 ? '+' : ''}${s.changePercent}% | 현금 전액 투입 시 최대 ${maxQty}주`;
      })
      .join('\n');

    const sellCandidates = holdings.length === 0 ? '없음' : holdings.map(h => {
      const s = validStocks.find(st => st.ticker === h.ticker);
      if (!s) return null;
      const pnl = ((s.price - h.avg_price) / h.avg_price * 100).toFixed(2);
      return `${s.name}(${s.ticker}): 오늘 ${s.changePercent > 0 ? '+' : ''}${s.changePercent}% | 보유 수익률 ${pnl}% | ${h.qty}주 보유`;
    }).filter(Boolean).join('\n');

    const prompt = `당신은 공격적 모멘텀 트레이더 AI입니다. 리스크를 감수하며 주간 실적 평가에서 최고 수익률을 달성해야 합니다.

【미션】
매주 일요일 23:00에 실적이 평가됩니다. 그 시점의 총 자산(현금 + 보유 주식 평가액)이 클수록 승리합니다.
나 그리고 단타봇과 경쟁 중입니다. 반드시 이겨야 합니다.

【마감 현황】
${deadlineCtx}

【현재 수익률: ${returnPct}%】
- 수익률이 낮다면 지금 당장 적극적으로 투자해야 합니다.
- 마감이 가까울수록 손실 포지션 정리 후 유망 종목 집중 투자.
- 마감 직전(일요일)에는 전량 현금화 또는 수익 확정 고려.

【핵심 성격】
- 기회가 보이면 반드시 행동합니다. 관망은 패배입니다.
- 상승 모멘텀이 있는 종목에 집중 투자합니다.
- 손실은 빠르게 손절해 복구 기회를 만듭니다.

【매수 규칙】
- 오늘 +0.5% 이상 오른 종목 → 매수 고려 (모멘텀 추종)
- 현금 ${minCashFmt} 이상, 보유 3개 미만일 때 매수 가능
- 매수 수량(qty)은 완전히 자유입니다. 1주도 되고, 전량 매수도 됩니다.
  → 이익을 극대화할 수 있다고 판단되면 현금 전부를 투입해도 됩니다.
  → 신중하게 소량만 사도 됩니다. 판단은 당신의 몫입니다.
  → 단, qty는 현금으로 살 수 있는 최대 수량을 초과할 수 없습니다. (각 종목 후보에 표시됨)
- 마감이 3일 이내라면 검증된 대형주 위주로 집중

【매도 규칙 (우선순위 최고)】
- 보유 수익률 +3% 이상 → 즉시 익절 (수익 확정)
- 보유 수익률 -2% 이하 → 즉시 손절 (더 큰 손실 방지)
- 오늘 -1% 이하인 보유 종목 → 손절 적극 검토
- 매도는 전량 또는 원하는 수량 자유롭게

【HOLD 조건 (매우 엄격)】
- 현금 ${minCashFmt} 미만이고 손절/익절 대상도 없을 때만
- 그 외에는 반드시 행동

반드시 JSON 형식으로만 답하세요.

형식:
{"action":"BUY","ticker":"005930.KS","name":"삼성전자","qty":15,"reason":"마감 D-N, 이유..."}
{"action":"SELL","ticker":"005930.KS","name":"삼성전자","qty":10,"reason":"마감 D-N, 이유..."}
{"action":"HOLD","reason":"마감 D-N, 이유..."}

【현재 상황】
총 자산: ${totalAsset.toLocaleString()}원 (초기 대비 ${returnPct}%)
초기 자본: ${initialCapital.toLocaleString()}원
보유 현금: ${portfolio.cash.toLocaleString()}원 (현금 비중 ${((portfolio.cash / totalAsset) * 100).toFixed(1)}%)
보유 종목: ${holdings.length}개 (최대 3개)

[보유 종목 수익률 확인]
${holdingText}

[매수 후보 TOP15]
${buyableCandidates}

[매도 후보]
${sellCandidates}

JSON만 답하세요.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
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
      return { action: 'HOLD', reason: '보유하지 않은 종목 매도 시도 — 관망합니다.' };
    }

    let qty = Math.floor(decision.qty ?? 1);
    if (decision.action === 'BUY') {
      const maxQty = Math.floor(portfolio.cash / stock.price);
      qty = Math.min(qty, maxQty);
      if (qty < 1) return { action: 'HOLD', reason: '현금 부족으로 매수 불가' };
    }

    if (decision.action === 'SELL') {
      const holding = holdings.find(h => h.ticker === stock.ticker);
      if (!holding) return { action: 'HOLD', reason: '보유 종목 없음' };
      qty = Math.min(qty, holding.qty);
      if (qty < 1) return { action: 'HOLD', reason: '매도 수량 오류' };
    }

    await executeTrade({
      player: 'ai',
      action: decision.action,
      ticker: stock.ticker,
      name: stock.name,
      qty,
      price: stock.price,
      reason: decision.reason,
    });

    return { ...decision, qty, price: stock.price };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { action: 'HOLD', reason: `AI 내부 오류: ${msg}` };
  } finally {
    agentRunning = false;
  }
}
