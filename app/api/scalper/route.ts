export const maxDuration = 60;

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchStockPrices } from '@/lib/yahoo';
import { getPortfolio, getHoldings, executeTrade } from '@/lib/db';
import { getDeadlineContext } from '@/lib/deadline';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST() {
  try {
    const [stocks, portfolio, holdings] = await Promise.all([
      fetchStockPrices(),
      getPortfolio('scalper'),
      getHoldings('scalper'),
    ]);

    if (!portfolio) return NextResponse.json({ error: 'scalper 포트폴리오 없음' }, { status: 400 });

    const validStocks = stocks.filter(s => s.price > 0);
    const holdingTickers = holdings.map(h => h.ticker);
    const totalAsset = portfolio.cash + holdings.reduce((sum, h) => {
      const s = validStocks.find(st => st.ticker === h.ticker);
      return sum + (s ? s.price * h.qty : h.avg_price * h.qty);
    }, 0);

    const deadlineCtx = getDeadlineContext();
    const returnPct = ((totalAsset - 10000000) / 10000000 * 100).toFixed(2);

    // 보유 종목 상세
    const holdingText = holdings.length === 0
      ? '없음'
      : holdings.map(h => {
          const s = validStocks.find(st => st.ticker === h.ticker);
          const pnl = s ? ((s.price - h.avg_price) / h.avg_price * 100).toFixed(2) : '0';
          const evalAmt = s ? (s.price * h.qty).toLocaleString() : '?';
          return `${h.name}(${h.ticker}) ${h.qty}주 | 평균매수가 ${h.avg_price.toLocaleString()}원 | 현재수익률 ${pnl}% | 평가금액 ${evalAmt}원`;
        }).join('\n');

    // 매수 후보: 상승률 TOP20 + 하락률 TOP5 (반등 노림) — 최대 매수 가능 수량 표시
    const risingStocks = validStocks
      .filter(s => !holdingTickers.includes(s.ticker))
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 20)
      .map(s => {
        const maxQty = Math.floor(portfolio.cash / s.price);
        return `${s.name}(${s.ticker}): ${s.price.toLocaleString()}원 ${s.changePercent > 0 ? '+' : ''}${s.changePercent}% | 전액 투입 시 최대 ${maxQty}주`;
      });

    const reboundStocks = validStocks
      .filter(s => !holdingTickers.includes(s.ticker))
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 5)
      .map(s => {
        const maxQty = Math.floor(portfolio.cash / s.price);
        return `[반등노림] ${s.name}(${s.ticker}): ${s.price.toLocaleString()}원 ${s.changePercent}% | 전액 투입 시 최대 ${maxQty}주`;
      });

    const buyableCandidates = [...risingStocks, ...reboundStocks].join('\n');

    // 보유 종목 현황
    const sellCandidates = holdings.length === 0 ? '없음' : holdings.map(h => {
      const s = validStocks.find(st => st.ticker === h.ticker);
      if (!s) return null;
      const pnl = ((s.price - h.avg_price) / h.avg_price * 100).toFixed(2);
      return `${s.name}(${s.ticker}): 오늘 ${s.changePercent > 0 ? '+' : ''}${s.changePercent}% | 보유수익률 ${pnl}% | ${h.qty}주`;
    }).filter(Boolean).join('\n');

    const prompt = `당신은 극단적 단타 스캘퍼 AI입니다. 매주 일요일 23:00 실적 평가에서 최고 수익률을 달성해야 합니다.

【미션】
나, AI 에이전트와 경쟁 중입니다. 매주 일요일 23:00에 총 자산으로 승패가 결정됩니다.
단타 매매로 빠르게 수익을 누적해 경쟁자들을 압도하세요.

【마감 현황】
${deadlineCtx}

【현재 수익률: ${returnPct}%】
- 수익률이 낮으면 지금 즉시 공격적으로 움직여야 합니다.
- 마감일(일요일)이 가까울수록 확실한 수익 확정에 집중.
- 마감 당일에는 손실 종목 전량 손절 후 남은 현금으로 마지막 베팅.

【캐릭터】
- 겁이 없고 충동적입니다. 작은 수익도 즉시 챙깁니다.
- 현금을 놀리는 것을 참을 수 없습니다. 항상 투자 기회를 찾습니다.
- 하락장에서도 반등을 노립니다.

【매수 전략】
- 오늘 +0.1% 이상 오른 종목 → 즉시 매수 고려
- 오늘 -2% 이하 하락 종목 → 반등 노리고 매수 가능
- 현금 100만원 이상, 보유 4개 미만일 때 매수
- 매수 수량(qty)은 완전히 자유입니다. 1주도 되고, 현금 전부를 투입해 전량 매수도 됩니다.
  → 확신이 있으면 올인, 신중하게 소량만 사도 됩니다. 판단은 당신의 몫입니다.
  → 단, qty는 현금으로 살 수 있는 최대 수량을 초과할 수 없습니다. (각 종목 후보에 표시됨)
- 마감 임박 시 가장 모멘텀 강한 1~2종목에 집중 올인

【매도 전략 (초고속)】
- 보유수익률 +2% → 즉시 익절 전량 (탐욕 금지)
- 보유수익률 -1.5% → 즉시 손절 전량 (미련 금지)
- 오늘 -0.5% 이하 보유 종목 → 손절 적극 검토
- 매도 수량도 자유입니다. 전량 매도 또는 원하는 수량만 매도 가능
- 마감 당일 23:00 전에는 모든 포지션 정리 고려

【HOLD 조건 (극히 드문 경우)】
- 현금 100만원 미만 AND 모든 종목 수익률 -1.5%~+2% 사이일 때만

반드시 JSON 형식으로만 답하세요.

형식:
{"action":"BUY","ticker":"005930.KS","name":"삼성전자","qty":25,"reason":"마감 D-N, 이유..."}
{"action":"SELL","ticker":"005930.KS","name":"삼성전자","qty":25,"reason":"마감 D-N, 이유..."}
{"action":"HOLD","reason":"마감 D-N, 이유..."}

【현재 상황】
총 자산: ${totalAsset.toLocaleString()}원 (초기 대비 ${returnPct}%)
보유 현금: ${portfolio.cash.toLocaleString()}원 (현금 비중 ${((portfolio.cash / totalAsset) * 100).toFixed(1)}%)
보유 종목: ${holdings.length}개 (최대 4개)

[보유 종목 수익률]
${holdingText}

[매수 후보 (상승 TOP20 + 반등후보 5개)]
${buyableCandidates}

[매도 후보]
${sellCandidates}

JSON만 답하세요.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ action: 'HOLD', reason: 'AI 응답에서 JSON을 찾지 못했습니다.' });
    }

    let decision: any;
    try {
      decision = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ action: 'HOLD', reason: 'AI 응답 파싱 실패' });
    }

    if (decision.action === 'HOLD') {
      return NextResponse.json(decision);
    }

    const stock = validStocks.find(s => s.ticker === decision.ticker);
    if (!stock) {
      return NextResponse.json({ action: 'HOLD', reason: `${decision.ticker} 종목을 찾을 수 없습니다.` });
    }

    if (decision.action === 'SELL' && !holdingTickers.includes(stock.ticker)) {
      return NextResponse.json({ action: 'HOLD', reason: '보유하지 않은 종목 매도 시도' });
    }

    // 수량: 현금/보유 초과 방지만, 최소값 강제 없음
    let qty = Math.floor(decision.qty ?? 1);
    if (decision.action === 'BUY') {
      const maxQty = Math.floor(portfolio.cash / stock.price);
      qty = Math.min(qty, maxQty);
      if (qty < 1) return NextResponse.json({ action: 'HOLD', reason: '현금 부족' });
    }

    if (decision.action === 'SELL') {
      const holding = holdings.find(h => h.ticker === stock.ticker);
      if (!holding) return NextResponse.json({ action: 'HOLD', reason: '보유 종목 없음' });
      qty = Math.min(qty, holding.qty);
      if (qty < 1) return NextResponse.json({ action: 'HOLD', reason: '매도 수량 오류' });
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

    return NextResponse.json({ ...decision, qty, price: stock.price });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
