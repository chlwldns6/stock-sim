import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface Portfolio {
  player: string;
  cash: number;
  initial_capital: number;
}

export interface Holding {
  player: string;
  ticker: string;
  name: string;
  qty: number;
  avg_price: number;
}

export interface Trade {
  id: string;
  player: string;
  action: string;
  ticker: string;
  name: string;
  qty: number;
  price: number;
  avg_price?: number;
  reason: string | null;
  realized_pnl?: number;
  executed_at: string;
}

export interface PerfPoint {
  player: string;
  total_value: number;
  return_pct: number;
  recorded_at: string;
}

export async function getPortfolio(player: string): Promise<Portfolio | null> {
  const { data } = await supabase
    .from('portfolios').select('*').eq('player', player).single();
  return data;
}

export async function getHoldings(player: string): Promise<Holding[]> {
  const { data } = await supabase
    .from('holdings').select('*').eq('player', player);
  return data ?? [];
}

export async function getRecentTrades(limit = 50): Promise<Trade[]> {
  const { data } = await supabase
    .from('trades').select('*').order('executed_at', { ascending: false }).limit(limit);
  return data ?? [];
}

export async function getTradesByPlayer(player: string, limit = 50): Promise<Trade[]> {
  const { data } = await supabase
    .from('trades').select('*').eq('player', player).order('executed_at', { ascending: false }).limit(limit);
  return data ?? [];
}

export async function getPerfHistory(): Promise<PerfPoint[]> {
  const { data } = await supabase
    .from('perf_history')
    .select('*')
    .order('recorded_at', { ascending: true })
    .limit(200);
  return data ?? [];
}

export async function savePerfPoint(player: string, totalValue: number) {
  const fourMinutesAgo = new Date(Date.now() - 4 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from('perf_history')
    .select('id')
    .eq('player', player)
    .gte('recorded_at', fourMinutesAgo)
    .limit(1);
  if (recent && recent.length > 0) return;

  const { data: portfolio } = await supabase
    .from('portfolios').select('initial_capital').eq('player', player).single();
  const initialCapital = portfolio?.initial_capital ?? 10000000;
  const returnPct = ((totalValue - initialCapital) / initialCapital) * 100;
  const { error } = await supabase.from('perf_history').insert({
    player,
    total_value: totalValue,
    return_pct: returnPct,
  });
  if (error) console.error('[perf insert error]', error);

  // 7일 이상 된 데이터 자동 삭제
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from('perf_history').delete().lt('recorded_at', sevenDaysAgo);
}

async function setPlayerCapital(player: string, capital: number) {
  const { data: existing } = await supabase.from('portfolios').select('player').eq('player', player).single();
  if (existing) {
    await supabase.from('portfolios').update({ cash: capital, initial_capital: capital }).eq('player', player);
  } else {
    await supabase.from('portfolios').insert({ player, cash: capital, initial_capital: capital });
  }
}

export async function resetGame(capitals: { user: number; ai: number; scalper: number } = { user: 10000000, ai: 10000000, scalper: 10000000 }) {
  await supabase.from('trades').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('holdings').delete().neq('player', '');
  await supabase.from('perf_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await setPlayerCapital('ai', capitals.ai);
  await setPlayerCapital('user', capitals.user);
  await setPlayerCapital('scalper', capitals.scalper);
}

export async function executeTrade(params: {
  player: string;
  action: 'BUY' | 'SELL';
  ticker: string;
  name: string;
  qty: number;
  price: number;
  reason?: string;
}) {
  const portfolio = await getPortfolio(params.player);
  if (!portfolio) throw new Error('포트폴리오를 찾을 수 없습니다.');

  const totalCost = params.price * params.qty;

  if (params.action === 'BUY') {
    if (portfolio.cash < totalCost) throw new Error('현금이 부족합니다.');

    await supabase.from('portfolios')
      .update({ cash: portfolio.cash - totalCost }).eq('player', params.player);

    const holdings = await getHoldings(params.player);
    const existing = holdings.find(h => h.ticker === params.ticker);

    if (existing) {
      const newQty = existing.qty + params.qty;
      const newAvg = Math.round(
        (existing.avg_price * existing.qty + params.price * params.qty) / newQty
      );
      await supabase.from('holdings')
        .update({ qty: newQty, avg_price: newAvg })
        .eq('player', params.player).eq('ticker', params.ticker);
    } else {
      await supabase.from('holdings').insert({
        player: params.player, ticker: params.ticker, name: params.name,
        qty: params.qty, avg_price: params.price,
      });
    }
  } else {
    const holdings = await getHoldings(params.player);
    const existing = holdings.find(h => h.ticker === params.ticker);
    if (!existing || existing.qty < params.qty) throw new Error('보유 수량이 부족합니다.');

    await supabase.from('portfolios')
      .update({ cash: portfolio.cash + totalCost }).eq('player', params.player);

    const newQty = existing.qty - params.qty;
    if (newQty === 0) {
      await supabase.from('holdings')
        .delete().eq('player', params.player).eq('ticker', params.ticker);
    } else {
      await supabase.from('holdings')
        .update({ qty: newQty }).eq('player', params.player).eq('ticker', params.ticker);
    }

    const realizedPnl = Math.round((params.price - existing.avg_price) * params.qty);
    const { error: sellErr } = await supabase.from('trades').insert({
      player: params.player, action: params.action, ticker: params.ticker,
      name: params.name, qty: params.qty, price: params.price,
      avg_price: existing.avg_price,
      reason: params.reason ?? null, realized_pnl: realizedPnl,
    });
    if (sellErr) {
      // avg_price/realized_pnl 컬럼 미존재 시 기본 필드로 재시도
      const { error: fallbackErr } = await supabase.from('trades').insert({
        player: params.player, action: params.action, ticker: params.ticker,
        name: params.name, qty: params.qty, price: params.price,
        reason: params.reason ?? null,
      });
      if (fallbackErr) console.error('[sell trade insert error]', fallbackErr.message);
    }
    return;
  }

  const { error: buyErr } = await supabase.from('trades').insert({
    player: params.player, action: params.action, ticker: params.ticker,
    name: params.name, qty: params.qty, price: params.price,
    reason: params.reason ?? null,
  });
  if (buyErr) console.error('[buy trade insert error]', buyErr.message);
}
