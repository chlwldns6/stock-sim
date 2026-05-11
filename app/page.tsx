'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface Stock {
  ticker: string; name: string; sector: string;
  price: number; change: number; changePercent: number;
}

const SECTORS = ['전체','반도체','IT','자동차','바이오','에너지','금융','소비재','통신','건설','철강','방산','중견','저가주'];

interface Holding { ticker: string; name: string; qty: number; avg_price: number; }
interface Portfolio { cash: number; initial_capital: number; }
interface Trade {
  id: string; player: string; action: string; ticker: string;
  name: string; qty: number; price: number; avg_price?: number;
  reason: string | null; realized_pnl?: number; executed_at: string;
}
interface PlayerState { portfolio: Portfolio | null; holdings: Holding[]; }
interface ChartPoint { date: string; price: number; }
interface StockQuote { open: number | null; high: number | null; low: number | null; volume: number | null; prevClose: number | null; }

// 한국 공휴일 목록 (KST YYYY-MM-DD)
const KRX_HOLIDAYS = new Set([
  '2025-01-01','2025-01-28','2025-01-29','2025-01-30',
  '2025-03-01','2025-05-05','2025-05-06','2025-05-15',
  '2025-06-06','2025-08-15','2025-10-03','2025-10-06',
  '2025-10-07','2025-10-08','2025-10-09','2025-12-25','2025-12-31',
  '2026-01-01','2026-02-16','2026-02-17','2026-02-18',
  '2026-03-01','2026-05-05','2026-05-25','2026-06-06',
  '2026-08-15','2026-09-24','2026-09-25','2026-09-26',
  '2026-10-03','2026-10-09','2026-12-25','2026-12-31',
]);

function isKoreanHoliday(date: Date): boolean {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(kst.getUTCDate()).padStart(2, '0');
  return KRX_HOLIDAYS.has(`${y}-${m}-${d}`);
}

// 한국 주식시장 개장 여부 (평일 + 공휴일 제외, 09:00~15:30 KST)
function isMarketOpen(): boolean {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const day = kst.getUTCDay(); // 0=일, 6=토
  if (day === 0 || day === 6) return false;
  if (isKoreanHoliday(now)) return false;
  const h = kst.getUTCHours();
  const m = kst.getUTCMinutes();
  const minutes = h * 60 + m;
  return minutes >= 9 * 60 && minutes < 15 * 60 + 30;
}

function getMarketStatus(): { open: boolean; label: string; nextOpen: string } {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const day = kst.getUTCDay();
  const h = kst.getUTCHours();
  const m = kst.getUTCMinutes();
  const minutes = h * 60 + m;
  const holiday = isKoreanHoliday(now);
  const open = day !== 0 && day !== 6 && !holiday && minutes >= 9 * 60 && minutes < 15 * 60 + 30;

  let nextOpen = '';
  if (!open) {
    if (holiday) nextOpen = '공휴일 휴장';
    else if (day === 0) nextOpen = '내일(월) 09:00';
    else if (day === 6) nextOpen = '월요일 09:00';
    else if (minutes < 9 * 60) nextOpen = '오늘 09:00';
    else nextOpen = '내일 09:00';
  }
  return { open, label: open ? '장중' : '장외', nextOpen };
}

function calcTotalValue(portfolio: Portfolio | null, holdings: Holding[], stocks: Stock[]) {
  if (!portfolio) return 0;
  return portfolio.cash + holdings.reduce((sum, h) => {
    const s = stocks.find(st => st.ticker === h.ticker);
    return sum + (s ? s.price * h.qty : h.avg_price * h.qty);
  }, 0);
}
function calcReturnPct(total: number, initCap: number) { return ((total - initCap) / initCap) * 100; }
function fmtPrice(n: number) { return n.toLocaleString('ko-KR') + '원'; }
function fmtPct(n: number) { return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`; }

// ─── 사용자 보유 종목 카드 ───────────────────────────────────────────────────
function HoldingCard({ holding, stock, onBuy, onSell, onSellAll }: {
  holding: Holding; stock: Stock | undefined;
  onBuy: (ticker: string, qty: number) => Promise<void>;
  onSell: (ticker: string, qty: number) => Promise<void>;
  onSellAll: (ticker: string) => Promise<void>;
}) {
  const [chartPoints, setChartPoints] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [mode, setMode] = useState<'buy' | 'sell' | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setChartLoading(true);
    fetch(`/api/chart?ticker=${holding.ticker}`)
      .then(r => r.json()).then(d => setChartPoints(d.points ?? []))
      .catch(() => setChartPoints([])).finally(() => setChartLoading(false));
  }, [holding.ticker]);

  const currentPrice = stock?.price ?? holding.avg_price;
  const pnl = ((currentPrice - holding.avg_price) / holding.avg_price) * 100;
  const pnlAmt = (currentPrice - holding.avg_price) * holding.qty;
  const isProfit = pnl >= 0;

  async function handleOrder() {
    if (!mode) return;
    setBusy(true); setMsg('');
    try {
      if (mode === 'buy') { await onBuy(holding.ticker, qty); setMsg(`${qty}주 추가 매수 완료`); }
      else { await onSell(holding.ticker, qty); setMsg(`${qty}주 매도 완료`); }
      setMode(null);
    } catch { setMsg('주문 실패'); } finally { setBusy(false); }
  }

  return (
    <div style={{ backgroundColor: '#1a1d27', border: `1px solid ${isProfit ? '#10b98133' : '#ef444433'}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{holding.name}</div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{holding.ticker}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: isProfit ? '#10b981' : '#ef4444', fontFamily: 'monospace' }}>{fmtPct(pnl)}</div>
          <div style={{ fontSize: '12px', color: isProfit ? '#10b98199' : '#ef444499', fontFamily: 'monospace' }}>{pnlAmt >= 0 ? '+' : ''}{fmtPrice(Math.round(pnlAmt))}</div>
        </div>
      </div>
      <div style={{ height: '80px' }}>
        {chartLoading ? <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '12px' }}>로딩 중...</div>
          : chartPoints.length < 2 ? <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '12px' }}>데이터 없음</div>
          : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartPoints} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <XAxis dataKey="date" hide /><YAxis domain={['auto', 'auto']} hide />
                <Tooltip contentStyle={{ backgroundColor: '#0f1117', border: '1px solid #2d3148', borderRadius: '6px', fontSize: '11px' }} formatter={(v: any) => [fmtPrice(v), '종가']} />
                <ReferenceLine y={holding.avg_price} stroke="#64748b" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="price" stroke={isProfit ? '#10b981' : '#ef4444'} dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px' }}>
        {[['보유수량', `${holding.qty}주`], ['평균매수가', holding.avg_price.toLocaleString()], ['현재가', currentPrice.toLocaleString()]].map(([label, val]) => (
          <div key={label} style={{ backgroundColor: '#0f1117', borderRadius: '6px', padding: '6px 8px' }}>
            <div style={{ color: '#64748b', marginBottom: '2px' }}>{label}</div>
            <div style={{ fontFamily: 'monospace' }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', backgroundColor: '#0f1117', borderRadius: '6px', fontSize: '12px' }}>
        <span style={{ color: '#64748b' }}>평가금액</span>
        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{fmtPrice(currentPrice * holding.qty)}</span>
      </div>
      {!mode ? (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => { setMode('buy'); setQty(1); setMsg(''); }} style={{ flex: 1, padding: '8px', backgroundColor: '#052e16', color: '#10b981', border: '1px solid #10b98133', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>+ 추가매수</button>
          <button onClick={() => { setMode('sell'); setQty(1); setMsg(''); }} style={{ flex: 1, padding: '8px', backgroundColor: '#2d0a0a', color: '#ef4444', border: '1px solid #ef444433', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>매도</button>
          <button onClick={async () => { setBusy(true); try { await onSellAll(holding.ticker); setMsg('전량 매도 완료'); } catch { setMsg('실패'); } finally { setBusy(false); } }} disabled={busy} style={{ padding: '8px 10px', backgroundColor: '#7f1d1d', color: '#fca5a5', border: '1px solid #ef444466', borderRadius: '6px', cursor: busy ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 'bold' }}>전량</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '12px', color: mode === 'buy' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{mode === 'buy' ? '추가 매수' : '매도'} 수량</div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input type="number" min={1} max={mode === 'sell' ? holding.qty : undefined} value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} style={{ flex: 1, padding: '7px 10px', backgroundColor: '#0f1117', border: `1px solid ${mode === 'buy' ? '#10b98133' : '#ef444433'}`, borderRadius: '6px', color: '#e2e8f0', fontSize: '13px', textAlign: 'right' }} />
            <span style={{ fontSize: '12px', color: '#64748b' }}>주</span>
            <button onClick={handleOrder} disabled={busy} style={{ padding: '7px 14px', backgroundColor: mode === 'buy' ? '#10b981' : '#ef4444', color: '#000', border: 'none', borderRadius: '6px', cursor: busy ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '13px' }}>{busy ? '처리 중' : '확인'}</button>
            <button onClick={() => { setMode(null); setMsg(''); }} style={{ padding: '7px 10px', backgroundColor: '#1a1d27', color: '#64748b', border: '1px solid #2d3148', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>취소</button>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{mode === 'buy' ? `주문금액: ${fmtPrice(currentPrice * qty)}` : `잔여: ${Math.max(0, holding.qty - qty)}주`}</div>
        </div>
      )}
      {msg && <div style={{ fontSize: '12px', color: msg.includes('실패') ? '#ef4444' : '#10b981', padding: '4px 8px', backgroundColor: msg.includes('실패') ? '#2d0a0a' : '#052e16', borderRadius: '4px' }}>{msg}</div>}
    </div>
  );
}

// ─── 읽기 전용 보유 종목 카드 (AI·단타봇 공용) ──────────────────────────────
function BotHoldingCard({ holding, stock, accentColor, badge }: {
  holding: Holding; stock: Stock | undefined; accentColor: string; badge: string;
}) {
  const [chartPoints, setChartPoints] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    setChartLoading(true);
    fetch(`/api/chart?ticker=${holding.ticker}`)
      .then(r => r.json()).then(d => setChartPoints(d.points ?? []))
      .catch(() => setChartPoints([])).finally(() => setChartLoading(false));
  }, [holding.ticker]);

  const currentPrice = stock?.price ?? holding.avg_price;
  const pnl = ((currentPrice - holding.avg_price) / holding.avg_price) * 100;
  const pnlAmt = (currentPrice - holding.avg_price) * holding.qty;
  const isProfit = pnl >= 0;

  return (
    <div style={{ backgroundColor: '#1a1d27', border: `1px solid ${accentColor}33`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: accentColor }}>{badge}</span>
            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{holding.name}</span>
          </div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{holding.ticker}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: isProfit ? '#10b981' : '#ef4444', fontFamily: 'monospace' }}>{fmtPct(pnl)}</div>
          <div style={{ fontSize: '12px', color: isProfit ? '#10b98199' : '#ef444499', fontFamily: 'monospace' }}>{pnlAmt >= 0 ? '+' : ''}{fmtPrice(Math.round(pnlAmt))}</div>
        </div>
      </div>
      <div style={{ height: '80px' }}>
        {chartLoading ? <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '12px' }}>로딩 중...</div>
          : chartPoints.length < 2 ? <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '12px' }}>데이터 없음</div>
          : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartPoints} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <XAxis dataKey="date" hide /><YAxis domain={['auto', 'auto']} hide />
                <Tooltip contentStyle={{ backgroundColor: '#0f1117', border: '1px solid #2d3148', borderRadius: '6px', fontSize: '11px' }} formatter={(v: any) => [fmtPrice(v), '종가']} />
                <ReferenceLine y={holding.avg_price} stroke="#64748b" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="price" stroke={isProfit ? '#10b981' : '#ef4444'} dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px' }}>
        {[['보유수량', `${holding.qty}주`], ['평균매수가', holding.avg_price.toLocaleString()], ['현재가', currentPrice.toLocaleString()]].map(([label, val]) => (
          <div key={label} style={{ backgroundColor: '#0f1117', borderRadius: '6px', padding: '6px 8px' }}>
            <div style={{ color: '#64748b', marginBottom: '2px' }}>{label}</div>
            <div style={{ fontFamily: 'monospace' }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', backgroundColor: '#0f1117', borderRadius: '6px', fontSize: '12px' }}>
        <span style={{ color: '#64748b' }}>평가금액</span>
        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{fmtPrice(currentPrice * holding.qty)}</span>
      </div>
      <div style={{ padding: '6px 10px', backgroundColor: '#0f1117', border: `1px solid ${accentColor}22`, borderRadius: '6px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
        {badge} 자동 관리 중인 종목
      </div>
    </div>
  );
}

// ─── 포트폴리오 요약 바 ───────────────────────────────────────────────────────
function PortfolioSummary({ holdings, stocks, accentColor, trades }: {
  holdings: Holding[]; stocks: Stock[]; accentColor: string; trades?: Trade[];
}) {
  const stockValue = holdings.reduce((sum, h) => {
    const s = stocks.find(st => st.ticker === h.ticker);
    return sum + (s ? s.price * h.qty : h.avg_price * h.qty);
  }, 0);
  const costBasis = holdings.reduce((sum, h) => sum + h.avg_price * h.qty, 0);
  const unrealizedPnl = stockValue - costBasis;
  const unrealizedPct = costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;
  const realizedTotal = trades
    ? trades.filter(t => t.action === 'SELL' && t.realized_pnl != null).reduce((s, t) => s + (t.realized_pnl ?? 0), 0)
    : null;

  const items = [
    { label: '평가금액 합계', value: fmtPrice(stockValue), color: '#e2e8f0' },
    { label: '매수금액 합계', value: fmtPrice(costBasis), color: '#94a3b8' },
    { label: '미실현 손익', value: `${unrealizedPnl >= 0 ? '+' : ''}${fmtPrice(Math.round(unrealizedPnl))}`, color: unrealizedPnl >= 0 ? '#10b981' : '#ef4444' },
    { label: '평균 수익률', value: fmtPct(unrealizedPct), color: unrealizedPct >= 0 ? '#10b981' : '#ef4444' },
  ];
  if (realizedTotal !== null) {
    items.push({ label: '실현손익 누계', value: `${realizedTotal >= 0 ? '+' : ''}${fmtPrice(realizedTotal)}`, color: realizedTotal >= 0 ? '#10b981' : '#ef4444' });
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: '10px', marginBottom: '16px' }}>
      {items.map((item, i) => (
        <div key={i} style={{ backgroundColor: '#0f1117', borderRadius: '8px', padding: '10px 12px', borderLeft: `3px solid ${accentColor}` }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{item.label}</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace', color: item.color }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── 거래 기록 목록 ───────────────────────────────────────────────────────────
function TradeList({ trades }: { trades: Trade[] }) {
  const playerMeta: Record<string, { icon: string; color: string; label: string }> = {
    user:    { icon: '🙋', color: '#8b5cf6', label: '나' },
    ai:      { icon: '🤖', color: '#f59e0b', label: 'AI' },
    scalper: { icon: '⚡', color: '#ef4444', label: '단타봇' },
  };

  if (trades.length === 0) {
    return <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '40px' }}>거래 내역이 없습니다.</div>;
  }

  return (
    <div>
      {trades.map(t => {
        const meta = playerMeta[t.player] ?? { icon: '?', color: '#64748b', label: t.player };
        return (
          <div key={t.id} style={{ padding: '10px 0', borderBottom: '1px solid #2d3148', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '40px' }}>
              <span style={{ fontSize: '16px' }}>{meta.icon}</span>
              <span style={{ fontSize: '10px', color: meta.color, fontWeight: 'bold' }}>{meta.label}</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ color: t.action === 'BUY' ? '#10b981' : '#ef4444', fontSize: '12px', fontWeight: 'bold', padding: '1px 6px', backgroundColor: t.action === 'BUY' ? '#052e16' : '#2d0a0a', borderRadius: '4px' }}>
                  {t.action === 'BUY' ? '매수' : '매도'}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{t.name}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8' }}>{t.qty}주 × {t.price.toLocaleString()}원</span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748b', marginLeft: 'auto' }}>{fmtPrice(t.qty * t.price)}</span>
              </div>
              {t.action === 'SELL' && t.realized_pnl != null && (
                <div style={{ fontSize: '12px', color: t.realized_pnl >= 0 ? '#10b981' : '#ef4444', fontFamily: 'monospace', marginBottom: '2px' }}>
                  실현손익: {t.realized_pnl >= 0 ? '+' : ''}{fmtPrice(t.realized_pnl)}
                  {t.avg_price != null && <span style={{ color: '#475569', fontSize: '11px' }}> (매수평균 {t.avg_price.toLocaleString()}원)</span>}
                </div>
              )}
              {t.reason && <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>{t.reason}</div>}
              <div style={{ fontSize: '10px', color: '#475569' }}>{new Date(t.executed_at).toLocaleString('ko-KR')}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────
export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [ai, setAi] = useState<PlayerState>({ portfolio: null, holdings: [] });
  const [user, setUser] = useState<PlayerState>({ portfolio: null, holdings: [] });
  const [scalper, setScalper] = useState<PlayerState>({ portfolio: null, holdings: [] });
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const [selectedTicker, setSelectedTicker] = useState('');
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL'>('BUY');
  const [qty, setQty] = useState(1);
  const [tradeMsg, setTradeMsg] = useState('');
  const [selectedSector, setSelectedSector] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [pendingCapitals, setPendingCapitals] = useState({ user: 10000000, ai: 10000000, scalper: 10000000 });

  const [agentRunning, setAgentRunning] = useState(false);
  const [scalperRunning, setScalperRunning] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [marketStatus, setMarketStatus] = useState(getMarketStatus());
  const [lastAiRun, setLastAiRun] = useState<{ time: string; result: string } | null>(null);
  const [lastScalperRun, setLastScalperRun] = useState<{ time: string; result: string } | null>(null);

  const autoTimerAi = useRef<NodeJS.Timeout | null>(null);
  const autoTimerScalper = useRef<NodeJS.Timeout | null>(null);
  const marketWatchTimer = useRef<NodeJS.Timeout | null>(null);
  const wasMarketOpen = useRef(false);

  // 탭: market | portfolio | ai_portfolio | scalper_portfolio | trades
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio' | 'ai_portfolio' | 'scalper_portfolio' | 'trades'>('market');
  // 거래기록 서브탭
  const [tradeFilter, setTradeFilter] = useState<'all' | 'user' | 'ai' | 'scalper'>('all');

  const fetchAll = useCallback(async () => {
    try {
      const [sR, aiPR, aiHR, uPR, uHR, scPR, scHR, tR, perfR] = await Promise.all([
        fetch('/api/stocks'),
        fetch('/api/portfolio?player=ai'),
        fetch('/api/holdings?player=ai'),
        fetch('/api/portfolio?player=user'),
        fetch('/api/holdings?player=user'),
        fetch('/api/portfolio?player=scalper'),
        fetch('/api/holdings?player=scalper'),
        fetch('/api/trades'),
        fetch('/api/perf'),
      ]);
      const [stockData, aiPort, aiHold, uPort, uHold, scPort, scHold, tradeData, perfData] = await Promise.all([
        sR.json(), aiPR.json(), aiHR.json(), uPR.json(), uHR.json(),
        scPR.json(), scHR.json(), tR.json(), perfR.json(),
      ]);

      if (Array.isArray(stockData)) setStocks(stockData);
      setAi({ portfolio: aiPort, holdings: aiHold });
      setUser({ portfolio: uPort, holdings: uHold });

      // 포트폴리오가 없는 상태(DB 초기화 등)면 금액 선택 모달 자동 표시
      if (!uPort || uPort.error) {
        setPendingCapitals({ user: 10000000, ai: 10000000, scalper: 10000000 });
        setShowResetModal(true);
      }
      setScalper({ portfolio: scPort?.cash !== undefined ? scPort : null, holdings: Array.isArray(scHold) ? scHold : [] });
      if (Array.isArray(tradeData)) setAllTrades(tradeData);
      setLastUpdated(new Date().toLocaleTimeString('ko-KR'));

      // perf insert 먼저 수행
      if (Array.isArray(stockData)) {
        const aiTotal = calcTotalValue(aiPort, aiHold, stockData);
        const uTotal = calcTotalValue(uPort, uHold, stockData);
        const scTotal = calcTotalValue(scPort, Array.isArray(scHold) ? scHold : [], stockData);
        await Promise.all([
          fetch('/api/perf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ player: 'ai', totalValue: aiTotal }) }),
          fetch('/api/perf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ player: 'user', totalValue: uTotal }) }),
          fetch('/api/perf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ player: 'scalper', totalValue: scTotal }) }),
        ]);
      }

      // insert 후 최신 데이터로 차트 갱신
      const freshPerfRes = await fetch('/api/perf');
      const freshPerf = await freshPerfRes.json();
      if (Array.isArray(freshPerf) && freshPerf.length > 0) {
        // 5분 단위 버킷으로 묶어 3자가 같은 시점에 표시되도록 함
        const bucket = (iso: string) => {
          const ms = new Date(iso).getTime();
          return Math.floor(ms / (5 * 60 * 1000)) * (5 * 60 * 1000);
        };
        const grouped: Record<number, any> = {};
        for (const p of freshPerf) {
          const key = bucket(p.recorded_at);
          if (!grouped[key]) {
            grouped[key] = {
              time: new Date(key).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            };
          }
          if (p.player === 'ai') grouped[key]['AI'] = parseFloat(Number(p.return_pct).toFixed(2));
          if (p.player === 'user') grouped[key]['나'] = parseFloat(Number(p.return_pct).toFixed(2));
          if (p.player === 'scalper') grouped[key]['단타봇'] = parseFloat(Number(p.return_pct).toFixed(2));
        }
        setChartData(Object.values(grouped).sort((a: any, b: any) => a.time > b.time ? 1 : -1).slice(-40));
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchAll(); const t = setInterval(fetchAll, 30000); return () => clearInterval(t); }, [fetchAll]);

  // 30분마다 페이지 자동 새로고침
  useEffect(() => {
    const t = setInterval(() => window.location.reload(), 30 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // 장 시간 자동 실행 — 항상 활성화, 토글 없음
  useEffect(() => {
    const runAi = async () => {
      try {
        const res = await fetch('/api/agent', { method: 'POST' });
        const data = await res.json();
        const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        const result = data.action === 'BUY' ? `매수 ${data.name} ${data.qty}주`
          : data.action === 'SELL' ? `매도 ${data.name} ${data.qty}주`
          : `관망`;
        setLastAiRun({ time, result });
        await fetchAll();
      } catch {}
    };

    const runScalperBot = async () => {
      try {
        const res = await fetch('/api/scalper', { method: 'POST' });
        const data = await res.json();
        const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        const result = data.action === 'BUY' ? `매수 ${data.name} ${data.qty}주`
          : data.action === 'SELL' ? `매도 ${data.name} ${data.qty}주`
          : `관망`;
        setLastScalperRun({ time, result });
        await fetchAll();
      } catch {}
    };

    const startAgents = () => {
      if (!autoTimerAi.current) {
        autoTimerAi.current = setInterval(async () => {
          if (!isMarketOpen()) return;
          await runAi();
        }, 15 * 60 * 1000);
      }
      if (!autoTimerScalper.current) {
        autoTimerScalper.current = setInterval(async () => {
          if (!isMarketOpen()) return;
          await runScalperBot();
        }, 2 * 60 * 1000);
      }
    };

    const stopAgents = () => {
      if (autoTimerAi.current) { clearInterval(autoTimerAi.current); autoTimerAi.current = null; }
      if (autoTimerScalper.current) { clearInterval(autoTimerScalper.current); autoTimerScalper.current = null; }
    };

    wasMarketOpen.current = isMarketOpen();
    if (wasMarketOpen.current) {
      runAi();
      runScalperBot();
      startAgents();
    }

    marketWatchTimer.current = setInterval(async () => {
      const nowOpen = isMarketOpen();
      setMarketStatus(getMarketStatus());

      if (nowOpen && !wasMarketOpen.current) {
        wasMarketOpen.current = true;
        runAi();
        runScalperBot();
        startAgents();
      }

      if (!nowOpen && wasMarketOpen.current) {
        wasMarketOpen.current = false;
        stopAgents();
      }
    }, 60 * 1000);

    return () => {
      stopAgents();
      if (marketWatchTimer.current) clearInterval(marketWatchTimer.current);
    };
  }, [fetchAll]);

  async function runAgent() {
    setAgentRunning(true);
    try {
      const res = await fetch('/api/agent', { method: 'POST' });
      const data = await res.json();
      await fetchAll();
      alert(data.action === 'HOLD' ? `AI 관망\n${data.reason}` : `AI ${data.action === 'BUY' ? '매수' : '매도'}: ${data.name} ${data.qty}주\n${data.reason}`);
    } catch { alert('AI 실행 오류'); } finally { setAgentRunning(false); }
  }

  async function runScalper() {
    setScalperRunning(true);
    try {
      const res = await fetch('/api/scalper', { method: 'POST' });
      const data = await res.json();
      await fetchAll();
      alert(data.action === 'HOLD' ? `단타봇 관망\n${data.reason}` : `단타봇 ${data.action === 'BUY' ? '매수' : '매도'}: ${data.name} ${data.qty}주\n${data.reason}`);
    } catch { alert('단타봇 실행 오류'); } finally { setScalperRunning(false); }
  }

  async function selectTicker(ticker: string) {
    setSelectedTicker(ticker);
    setTradeMsg('');
    setQuote(null);
    if (!ticker) return;
    setQuoteLoading(true);
    try {
      const res = await fetch(`/api/quote?ticker=${ticker}`);
      if (res.ok) setQuote(await res.json());
    } catch {}
    setQuoteLoading(false);
  }

  async function resetGame(capitals: { user: number; ai: number; scalper: number }) {
    try {
      await fetch('/api/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(capitals) });
      setChartData([]);
      setShowResetModal(false);
      await fetchAll();
    } catch { alert('초기화 오류'); }
  }

  async function submitTrade() {
    if (!selectedTicker) { setTradeMsg('종목을 선택해주세요.'); return; }
    const stock = stocks.find(s => s.ticker === selectedTicker);
    if (!stock) return;
    setLoading(true); setTradeMsg('');
    try {
      const res = await fetch('/api/trade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: tradeAction, ticker: stock.ticker, name: stock.name, qty, price: stock.price }) });
      const data = await res.json();
      if (!res.ok) setTradeMsg(`오류: ${data.error}`);
      else { setTradeMsg(`${tradeAction === 'BUY' ? '매수' : '매도'} 완료!`); await fetchAll(); }
    } catch { setTradeMsg('거래 오류'); } finally { setLoading(false); }
  }

  async function cardBuy(ticker: string, buyQty: number) {
    const stock = stocks.find(s => s.ticker === ticker);
    if (!stock) throw new Error('종목 없음');
    const res = await fetch('/api/trade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'BUY', ticker: stock.ticker, name: stock.name, qty: buyQty, price: stock.price }) });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
    await fetchAll();
  }
  async function cardSell(ticker: string, sellQty: number) {
    const stock = stocks.find(s => s.ticker === ticker);
    if (!stock) throw new Error('종목 없음');
    const res = await fetch('/api/trade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'SELL', ticker: stock.ticker, name: stock.name, qty: sellQty, price: stock.price }) });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
    await fetchAll();
  }
  async function cardSellAll(ticker: string) {
    const h = user.holdings.find(h => h.ticker === ticker);
    const stock = stocks.find(s => s.ticker === ticker);
    if (!h || !stock) throw new Error('보유 종목 없음');
    const res = await fetch('/api/trade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'SELL', ticker: stock.ticker, name: stock.name, qty: h.qty, price: stock.price }) });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
    await fetchAll();
  }

  // ─── 파생 수치 ───────────────────────────────────────────────────────────────
  const aiTotal = calcTotalValue(ai.portfolio, ai.holdings, stocks);
  const userTotal = calcTotalValue(user.portfolio, user.holdings, stocks);
  const scalperTotal = calcTotalValue(scalper.portfolio, scalper.holdings, stocks);
  const aiReturn = calcReturnPct(aiTotal, ai.portfolio?.initial_capital ?? 10000000);
  const userReturn = calcReturnPct(userTotal, user.portfolio?.initial_capital ?? 10000000);
  const scalperReturn = calcReturnPct(scalperTotal, scalper.portfolio?.initial_capital ?? 10000000);

  const rankings = [
    { label: '나', icon: '🙋', value: userReturn, color: '#8b5cf6', total: userTotal },
    { label: 'AI', icon: '🤖', value: aiReturn, color: '#f59e0b', total: aiTotal },
    { label: '단타봇', icon: '⚡', value: scalperReturn, color: '#ef4444', total: scalperTotal },
  ].sort((a, b) => b.value - a.value);

  const selectedStock = stocks.find(s => s.ticker === selectedTicker);
  const selectedHolding = user.holdings.find(h => h.ticker === selectedTicker);
  const filteredStocks = stocks.filter(s => {
    const sectorMatch = selectedSector === '전체' || s.sector === selectedSector;
    const searchMatch = searchQuery === '' || s.name.includes(searchQuery);
    return sectorMatch && searchMatch;
  });

  const filteredTrades = tradeFilter === 'all' ? allTrades : allTrades.filter(t => t.player === tradeFilter);

  const TAB = (active: boolean, accent = '#8b5cf6') => ({
    padding: '7px 16px', backgroundColor: active ? accent : 'transparent',
    color: active ? (accent === '#f59e0b' ? '#000' : '#fff') : '#64748b',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    fontWeight: active ? 'bold' : 'normal', fontSize: '13px',
  });



  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1117', color: '#e2e8f0', fontFamily: 'Arial, sans-serif' }}>

      {/* 초기화 모달 */}
      {showResetModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1a1d27', border: '1px solid #2d3148', borderRadius: '14px', padding: '28px', width: '420px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '4px' }}>🔄 게임 초기화</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '22px' }}>플레이어별 시작 금액을 선택하세요. 모든 거래·보유 내역이 초기화됩니다.</div>

            {/* 나 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>🙋 나</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {([1000000, 3000000, 5000000, 10000000] as const).map(v => (
                  <button key={v} onClick={() => setPendingCapitals(p => ({ ...p, user: v }))}
                    style={{ flex: 1, padding: '10px 0', backgroundColor: pendingCapitals.user === v ? '#8b5cf6' : '#0f1117', border: `2px solid ${pendingCapitals.user === v ? '#8b5cf6' : '#2d3148'}`, borderRadius: '8px', color: pendingCapitals.user === v ? '#fff' : '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: pendingCapitals.user === v ? 'bold' : 'normal' }}>
                    {v === 1000000 ? '100만' : v === 3000000 ? '300만' : v === 5000000 ? '500만' : '1000만'}
                  </button>
                ))}
              </div>
            </div>

            {/* AI */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>🤖 AI</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {([1000000, 3000000, 5000000, 10000000] as const).map(v => (
                  <button key={v} onClick={() => setPendingCapitals(p => ({ ...p, ai: v }))}
                    style={{ flex: 1, padding: '10px 0', backgroundColor: pendingCapitals.ai === v ? '#f59e0b' : '#0f1117', border: `2px solid ${pendingCapitals.ai === v ? '#f59e0b' : '#2d3148'}`, borderRadius: '8px', color: pendingCapitals.ai === v ? '#000' : '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: pendingCapitals.ai === v ? 'bold' : 'normal' }}>
                    {v === 1000000 ? '100만' : v === 3000000 ? '300만' : v === 5000000 ? '500만' : '1000만'}
                  </button>
                ))}
              </div>
            </div>

            {/* 단타봇 */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>⚡ 단타봇</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {([1000000, 3000000, 5000000, 10000000] as const).map(v => (
                  <button key={v} onClick={() => setPendingCapitals(p => ({ ...p, scalper: v }))}
                    style={{ flex: 1, padding: '10px 0', backgroundColor: pendingCapitals.scalper === v ? '#ef4444' : '#0f1117', border: `2px solid ${pendingCapitals.scalper === v ? '#ef4444' : '#2d3148'}`, borderRadius: '8px', color: pendingCapitals.scalper === v ? '#fff' : '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: pendingCapitals.scalper === v ? 'bold' : 'normal' }}>
                    {v === 1000000 ? '100만' : v === 3000000 ? '300만' : v === 5000000 ? '500만' : '1000만'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #2d3148', paddingTop: '16px', display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowResetModal(false)} style={{ flex: 1, padding: '11px', backgroundColor: '#0f1117', color: '#64748b', border: '1px solid #2d3148', borderRadius: '7px', cursor: 'pointer', fontSize: '13px' }}>취소</button>
              <button onClick={() => resetGame(pendingCapitals)} style={{ flex: 2, padding: '11px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>초기화 확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div style={{ backgroundColor: '#1a1d27', borderBottom: '1px solid #2d3148', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>📈 가상 주식 시뮬레이터</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>마지막 갱신: {lastUpdated}</span>
          <span style={{
            fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '4px',
            backgroundColor: marketStatus.open ? '#052e16' : '#1a1d27',
            color: marketStatus.open ? '#10b981' : '#475569',
            border: `1px solid ${marketStatus.open ? '#10b98144' : '#2d3148'}`,
          }}>
            {marketStatus.open ? '🟢 장중' : `🔴 장외${marketStatus.nextOpen ? ` · ${marketStatus.nextOpen} 개장` : ''}`}
          </span>
          <span style={{ fontSize: '11px', color: '#475569', padding: '2px 8px', border: '1px solid #2d3148', borderRadius: '4px' }}>가상 시뮬레이션</span>
          <button onClick={() => { setPendingCapitals({ user: 10000000, ai: 10000000, scalper: 10000000 }); setShowResetModal(true); }} style={{ padding: '4px 14px', backgroundColor: '#1a1d27', color: '#ef4444', border: '1px solid #ef444466', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🔄 초기화</button>
        </div>
      </div>

      {/* 티커 바 */}
      <div style={{ backgroundColor: '#131620', borderBottom: '1px solid #2d3148', padding: '8px 24px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {stocks.map(s => (
          <span key={s.ticker} style={{ display: 'inline-block', marginRight: '24px', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>{s.name}</span>{' '}
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{s.price.toLocaleString()}</span>{' '}
            <span style={{ color: s.changePercent >= 0 ? '#10b981' : '#ef4444' }}>{fmtPct(s.changePercent)}</span>
          </span>
        ))}
      </div>

      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>

        {/* ─── 왼쪽 사이드바 ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* 순위 */}
          <div style={{ backgroundColor: '#1a1d27', border: '1px solid #2d3148', borderRadius: '8px', padding: '14px' }}>
            <h2 style={{ margin: '0 0 10px', fontSize: '13px', color: '#94a3b8' }}>현재 순위</h2>
            {rankings.map((r, i) => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', backgroundColor: '#0f1117', borderRadius: '6px', marginBottom: i < 2 ? '6px' : 0 }}>
                <span style={{ color: r.color, fontWeight: 'bold', fontSize: '13px' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {r.icon} {r.label}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: r.value >= 0 ? '#10b981' : '#ef4444', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '13px' }}>{fmtPct(r.value)}</div>
                  <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: '10px' }}>{fmtPrice(r.total)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* AI 에이전트 카드 */}
          <div style={{ backgroundColor: '#1a1d27', border: '1px solid #f59e0b33', borderRadius: '8px', padding: '14px' }}>
            <h2 style={{ margin: '0 0 10px', fontSize: '13px', color: '#f59e0b' }}>🤖 AI 에이전트</h2>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '7px' }}>
                <div style={{ fontSize: '17px', fontWeight: 'bold', fontFamily: 'monospace' }}>{fmtPrice(aiTotal)}</div>
                <div style={{ color: aiReturn >= 0 ? '#10b981' : '#ef4444', fontSize: '13px', fontWeight: 'bold' }}>{fmtPct(aiReturn)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>💰 투자 가능</span>
                  <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{fmtPrice(ai.portfolio?.cash ?? 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>📊 투자 중</span>
                  <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{fmtPrice(aiTotal - (ai.portfolio?.cash ?? 0))}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2d3148', paddingTop: '4px', marginTop: '1px' }}>
                  <span style={{ color: '#64748b' }}>💵 평가 손익</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: (aiTotal - (ai.portfolio?.initial_capital ?? 10000000)) >= 0 ? '#10b981' : '#ef4444' }}>
                    {(aiTotal - (ai.portfolio?.initial_capital ?? 10000000)) >= 0 ? '+' : ''}{fmtPrice(aiTotal - (ai.portfolio?.initial_capital ?? 10000000))}
                  </span>
                </div>
              </div>
            </div>
            {ai.holdings.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                {ai.holdings.map(h => {
                  const s = stocks.find(st => st.ticker === h.ticker);
                  const pnl = s ? ((s.price - h.avg_price) / h.avg_price) * 100 : 0;
                  return (
                    <div key={h.ticker} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #2d3148' }}>
                      <span>{h.name} {h.qty}주</span>
                      <span style={{ color: pnl >= 0 ? '#10b981' : '#ef4444' }}>{fmtPct(pnl)}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={runAgent} disabled={agentRunning} style={{ width: '100%', padding: '7px', backgroundColor: agentRunning ? '#374151' : '#f59e0b', color: agentRunning ? '#9ca3af' : '#000', border: 'none', borderRadius: '6px', cursor: agentRunning ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              {agentRunning ? '판단 중...' : 'AI 판단 실행'}
            </button>
            {lastAiRun && (
              <div style={{ marginTop: '6px', fontSize: '11px', color: lastAiRun.result === '관망' ? '#475569' : '#10b981', padding: '4px 8px', backgroundColor: '#0f1117', borderRadius: '4px' }}>
                {lastAiRun.time} · {lastAiRun.result}
              </div>
            )}
            <button onClick={() => setActiveTab('ai_portfolio')} style={{ marginTop: '8px', width: '100%', padding: '7px', backgroundColor: '#1c1500', color: '#f59e0b', border: '1px solid #f59e0b33', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
              📊 AI 포트폴리오 보기
            </button>
          </div>

          {/* 단타봇 카드 */}
          <div style={{ backgroundColor: '#1a1d27', border: '1px solid #ef444433', borderRadius: '8px', padding: '14px' }}>
            <h2 style={{ margin: '0 0 10px', fontSize: '13px', color: '#ef4444' }}>⚡ 단타봇</h2>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '7px' }}>
                <div style={{ fontSize: '17px', fontWeight: 'bold', fontFamily: 'monospace' }}>{scalper.portfolio ? fmtPrice(scalperTotal) : '로딩 중...'}</div>
                <div style={{ color: scalperReturn >= 0 ? '#10b981' : '#ef4444', fontSize: '13px', fontWeight: 'bold' }}>{fmtPct(scalperReturn)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>💰 투자 가능</span>
                  <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{fmtPrice(scalper.portfolio?.cash ?? 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>📊 투자 중</span>
                  <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{fmtPrice(scalperTotal - (scalper.portfolio?.cash ?? 0))}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2d3148', paddingTop: '4px', marginTop: '1px' }}>
                  <span style={{ color: '#64748b' }}>💵 평가 손익</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: (scalperTotal - (scalper.portfolio?.initial_capital ?? 10000000)) >= 0 ? '#10b981' : '#ef4444' }}>
                    {(scalperTotal - (scalper.portfolio?.initial_capital ?? 10000000)) >= 0 ? '+' : ''}{fmtPrice(scalperTotal - (scalper.portfolio?.initial_capital ?? 10000000))}
                  </span>
                </div>
              </div>
            </div>
            {scalper.holdings.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                {scalper.holdings.map(h => {
                  const s = stocks.find(st => st.ticker === h.ticker);
                  const pnl = s ? ((s.price - h.avg_price) / h.avg_price) * 100 : 0;
                  return (
                    <div key={h.ticker} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #2d3148' }}>
                      <span>{h.name} {h.qty}주</span>
                      <span style={{ color: pnl >= 0 ? '#10b981' : '#ef4444' }}>{fmtPct(pnl)}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={runScalper} disabled={scalperRunning} style={{ width: '100%', padding: '7px', backgroundColor: scalperRunning ? '#374151' : '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: scalperRunning ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              {scalperRunning ? '매매 중...' : '단타봇 실행'}
            </button>
            {lastScalperRun && (
              <div style={{ marginTop: '6px', fontSize: '11px', color: lastScalperRun.result === '관망' ? '#475569' : '#10b981', padding: '4px 8px', backgroundColor: '#0f1117', borderRadius: '4px' }}>
                {lastScalperRun.time} · {lastScalperRun.result}
              </div>
            )}
            <button onClick={() => setActiveTab('scalper_portfolio')} style={{ marginTop: '8px', width: '100%', padding: '7px', backgroundColor: '#2d0a0a', color: '#ef4444', border: '1px solid #ef444433', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
              📊 단타봇 포트폴리오 보기
            </button>
          </div>

          {/* 나의 자산 카드 */}
          <div style={{ backgroundColor: '#1a1d27', border: '1px solid #8b5cf633', borderRadius: '8px', padding: '14px' }}>
            <h2 style={{ margin: '0 0 10px', fontSize: '13px', color: '#8b5cf6' }}>🙋 나의 자산</h2>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '7px' }}>
                <div style={{ fontSize: '17px', fontWeight: 'bold', fontFamily: 'monospace' }}>{fmtPrice(userTotal)}</div>
                <div style={{ color: userReturn >= 0 ? '#10b981' : '#ef4444', fontSize: '13px', fontWeight: 'bold' }}>{fmtPct(userReturn)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>💰 투자 가능</span>
                  <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{fmtPrice(user.portfolio?.cash ?? 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>📊 투자 중</span>
                  <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{fmtPrice(userTotal - (user.portfolio?.cash ?? 0))}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2d3148', paddingTop: '4px', marginTop: '1px' }}>
                  <span style={{ color: '#64748b' }}>💵 평가 손익</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: (userTotal - (user.portfolio?.initial_capital ?? 10000000)) >= 0 ? '#10b981' : '#ef4444' }}>
                    {(userTotal - (user.portfolio?.initial_capital ?? 10000000)) >= 0 ? '+' : ''}{fmtPrice(userTotal - (user.portfolio?.initial_capital ?? 10000000))}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={() => setActiveTab('portfolio')} style={{ width: '100%', padding: '7px', backgroundColor: '#1e1b4b', color: '#8b5cf6', border: '1px solid #8b5cf633', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
              📊 내 포트폴리오 보기
            </button>
          </div>
        </div>

        {/* ─── 오른쪽 메인 ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* 수익률 비교 차트 */}
          <div style={{ backgroundColor: '#1a1d27', border: '1px solid #2d3148', borderRadius: '8px', padding: '16px' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '14px', color: '#94a3b8' }}>3자 수익률 비교</h2>
            {chartData.length < 1 ? (
              <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', flexDirection: 'column', gap: '6px' }}>
                <span>데이터를 모으는 중...</span>
                <span style={{ fontSize: '11px' }}>5분마다 기록 · 2포인트 이상 쌓이면 차트 표시</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData}>
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2d3148', borderRadius: '6px' }} formatter={(v: any) => [`${v}%`]} />
                  <Legend />
                  <Line type="monotone" dataKey="AI" stroke="#f59e0b" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="나" stroke="#8b5cf6" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="단타봇" stroke="#ef4444" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 탭 패널 */}
          <div style={{ backgroundColor: '#1a1d27', border: '1px solid #2d3148', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: '4px', padding: '8px', borderBottom: '1px solid #2d3148', backgroundColor: '#131620', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('market')} style={TAB(activeTab === 'market')}>🏪 종목 탐색</button>
              <button onClick={() => setActiveTab('portfolio')} style={TAB(activeTab === 'portfolio')}>
                🙋 내 포트폴리오{user.holdings.length > 0 && <span style={{ marginLeft: '4px', backgroundColor: '#8b5cf6', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '10px' }}>{user.holdings.length}</span>}
              </button>
              <button onClick={() => setActiveTab('ai_portfolio')} style={TAB(activeTab === 'ai_portfolio', '#f59e0b')}>
                🤖 AI 포트폴리오{ai.holdings.length > 0 && <span style={{ marginLeft: '4px', backgroundColor: '#f59e0b', color: '#000', borderRadius: '10px', padding: '1px 6px', fontSize: '10px' }}>{ai.holdings.length}</span>}
              </button>
              <button onClick={() => setActiveTab('scalper_portfolio')} style={TAB(activeTab === 'scalper_portfolio', '#ef4444')}>
                ⚡ 단타봇 포트폴리오{scalper.holdings.length > 0 && <span style={{ marginLeft: '4px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '10px' }}>{scalper.holdings.length}</span>}
              </button>
              <button onClick={() => setActiveTab('trades')} style={TAB(activeTab === 'trades')}>📋 거래 기록</button>
            </div>

            <div style={{ padding: '16px' }}>

              {/* ── 종목 탐색 ── */}
              {activeTab === 'market' && (
                <>
                  <input type="text" placeholder="종목명 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', backgroundColor: '#0f1117', border: '1px solid #2d3148', borderRadius: '6px', color: '#e2e8f0', fontSize: '13px', marginBottom: '10px', boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {SECTORS.map(sec => (
                      <button key={sec} onClick={() => setSelectedSector(sec)} style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: selectedSector === sec ? '#8b5cf6' : '#2d3148', color: selectedSector === sec ? '#fff' : '#94a3b8', fontWeight: selectedSector === sec ? 'bold' : 'normal' }}>{sec}</button>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '8px', maxHeight: '360px', overflowY: 'auto', marginBottom: '14px' }}>
                    {filteredStocks.map(s => (
                      <div key={s.ticker} onClick={() => selectTicker(s.ticker)}
                        style={{ padding: '10px 12px', borderRadius: '8px', cursor: s.price === 0 ? 'default' : 'pointer', backgroundColor: selectedTicker === s.ticker ? '#2d1f5e' : '#0f1117', border: `1px solid ${selectedTicker === s.ticker ? '#8b5cf6' : '#2d3148'}`, opacity: s.price === 0 ? 0.4 : 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{s.name}</span>
                          <span style={{ fontSize: '10px', color: '#475569', backgroundColor: '#1a1d27', padding: '1px 6px', borderRadius: '10px' }}>{s.sector}</span>
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>{s.price === 0 ? <span style={{ color: '#475569', fontSize: '12px' }}>시세 없음</span> : `${s.price.toLocaleString()}원`}</div>
                        <div style={{ fontSize: '12px', color: s.changePercent >= 0 ? '#10b981' : '#ef4444' }}>{s.price > 0 ? `${fmtPct(s.changePercent)} (${s.change >= 0 ? '+' : ''}${s.change.toLocaleString()})` : '—'}</div>
                      </div>
                    ))}
                    {filteredStocks.length === 0 && <div style={{ color: '#475569', fontSize: '13px', padding: '20px', gridColumn: '1/-1', textAlign: 'center' }}>검색 결과 없음</div>}
                  </div>
                  {selectedStock && (
                    <div style={{ padding: '12px', backgroundColor: '#0f1117', borderRadius: '8px', border: '1px solid #2d3148' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{selectedStock.name}</span>
                          <span style={{ marginLeft: '8px', fontSize: '11px', color: '#475569' }}>{selectedStock.ticker}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold' }}>{fmtPrice(selectedStock.price)}</div>
                          <div style={{ fontSize: '12px', color: selectedStock.changePercent >= 0 ? '#10b981' : '#ef4444' }}>
                            {fmtPct(selectedStock.changePercent)} ({selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toLocaleString()}원)
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
                        {quoteLoading ? (
                          <div style={{ gridColumn: '1/-1', fontSize: '11px', color: '#475569', padding: '6px' }}>시세 상세 로딩 중...</div>
                        ) : quote ? (
                          <>
                            {[
                              ['시가', quote.open != null ? quote.open.toLocaleString() : '—'],
                              ['고가', quote.high != null ? quote.high.toLocaleString() : '—'],
                              ['저가', quote.low != null ? quote.low.toLocaleString() : '—'],
                              ['전일종가', quote.prevClose != null ? quote.prevClose.toLocaleString() : '—'],
                            ].map(([label, val]) => (
                              <div key={label} style={{ backgroundColor: '#1a1d27', borderRadius: '6px', padding: '5px 8px' }}>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>{label}</div>
                                <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>{val}</div>
                              </div>
                            ))}
                            {quote.volume != null && (
                              <div style={{ gridColumn: '1/-1', backgroundColor: '#1a1d27', borderRadius: '6px', padding: '5px 8px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '10px', color: '#64748b' }}>거래량</span>
                                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{quote.volume.toLocaleString()}주</span>
                              </div>
                            )}
                          </>
                        ) : null}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select value={tradeAction} onChange={e => setTradeAction(e.target.value as 'BUY' | 'SELL')}
                          style={{ padding: '8px', backgroundColor: tradeAction === 'BUY' ? '#052e16' : '#2d0a0a', border: `1px solid ${tradeAction === 'BUY' ? '#10b981' : '#ef4444'}`, borderRadius: '6px', color: tradeAction === 'BUY' ? '#10b981' : '#ef4444', fontSize: '13px' }}>
                          <option value="BUY">매수</option>
                          <option value="SELL">매도</option>
                        </select>
                        <input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                          style={{ width: '80px', padding: '8px', backgroundColor: '#1a1d27', border: '1px solid #2d3148', borderRadius: '6px', color: '#e2e8f0', fontSize: '13px', textAlign: 'right' }} />
                        <span style={{ fontSize: '12px', color: '#64748b' }}>주</span>
                        <span style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace', flex: 1 }}>= {fmtPrice(selectedStock.price * qty)}</span>
                        <button onClick={submitTrade} disabled={loading} style={{ padding: '8px 20px', backgroundColor: loading ? '#374151' : '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                          {loading ? '처리 중...' : '주문'}
                        </button>
                        {selectedHolding && tradeAction === 'SELL' && (
                          <button onClick={() => cardSellAll(selectedTicker)} disabled={loading} style={{ padding: '8px 14px', backgroundColor: '#7f1d1d', color: '#fca5a5', border: '1px solid #ef444466', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                            전량 ({selectedHolding.qty}주)
                          </button>
                        )}
                      </div>
                      {tradeAction === 'BUY' && user.portfolio && (
                        <div style={{ marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
                          잔여 현금: <span style={{ color: user.portfolio.cash >= selectedStock.price * qty ? '#10b981' : '#ef4444', fontFamily: 'monospace' }}>{fmtPrice(user.portfolio.cash - selectedStock.price * qty)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {tradeMsg && <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: tradeMsg.startsWith('오류') ? '#2d0a0a' : '#052e16', borderRadius: '6px', fontSize: '13px', color: tradeMsg.startsWith('오류') ? '#ef4444' : '#10b981' }}>{tradeMsg}</div>}
                </>
              )}

              {/* ── 내 포트폴리오 ── */}
              {activeTab === 'portfolio' && (
                <>
                  {user.holdings.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#475569' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                      <div style={{ marginBottom: '8px' }}>보유 종목이 없습니다</div>
                      <button onClick={() => setActiveTab('market')} style={{ padding: '8px 20px', backgroundColor: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>종목 탐색하기</button>
                    </div>
                  ) : (
                    <>
                      <PortfolioSummary holdings={user.holdings} stocks={stocks} accentColor="#8b5cf6" trades={allTrades.filter(t => t.player === 'user')} />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                        {user.holdings.map(h => <HoldingCard key={h.ticker} holding={h} stock={stocks.find(s => s.ticker === h.ticker)} onBuy={cardBuy} onSell={cardSell} onSellAll={cardSellAll} />)}
                      </div>
                    </>
                  )}
                  <div style={{ borderTop: '1px solid #2d3148', paddingTop: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#8b5cf6', fontWeight: 'bold', marginBottom: '10px' }}>🙋 내 거래 내역</div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <TradeList trades={allTrades.filter(t => t.player === 'user')} />
                    </div>
                  </div>
                </>
              )}

              {/* ── AI 포트폴리오 ── */}
              {activeTab === 'ai_portfolio' && (
                <>
                  {ai.holdings.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#475569' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖</div>
                      <div style={{ marginBottom: '12px' }}>AI가 현재 보유 종목이 없습니다</div>
                      <button onClick={runAgent} disabled={agentRunning} style={{ padding: '8px 20px', backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>{agentRunning ? '판단 중...' : 'AI 판단 실행'}</button>
                    </div>
                  ) : (
                    <>
                      <PortfolioSummary holdings={ai.holdings} stocks={stocks} accentColor="#f59e0b" trades={allTrades.filter(t => t.player === 'ai')} />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                        {ai.holdings.map(h => <BotHoldingCard key={h.ticker} holding={h} stock={stocks.find(s => s.ticker === h.ticker)} accentColor="#f59e0b" badge="🤖 AI" />)}
                      </div>
                    </>
                  )}
                  <div style={{ borderTop: '1px solid #2d3148', paddingTop: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 'bold', marginBottom: '10px' }}>🤖 AI 거래 내역</div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <TradeList trades={allTrades.filter(t => t.player === 'ai')} />
                    </div>
                  </div>
                </>
              )}

              {/* ── 단타봇 포트폴리오 ── */}
              {activeTab === 'scalper_portfolio' && (
                <>
                  {scalper.holdings.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#475569' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚡</div>
                      <div style={{ marginBottom: '12px' }}>단타봇이 현재 보유 종목이 없습니다</div>
                      <button onClick={runScalper} disabled={scalperRunning} style={{ padding: '8px 20px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>{scalperRunning ? '매매 중...' : '단타봇 실행'}</button>
                    </div>
                  ) : (
                    <>
                      <PortfolioSummary holdings={scalper.holdings} stocks={stocks} accentColor="#ef4444" trades={allTrades.filter(t => t.player === 'scalper')} />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                        {scalper.holdings.map(h => <BotHoldingCard key={h.ticker} holding={h} stock={stocks.find(s => s.ticker === h.ticker)} accentColor="#ef4444" badge="⚡ 단타봇" />)}
                      </div>
                    </>
                  )}
                  <div style={{ borderTop: '1px solid #2d3148', paddingTop: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 'bold', marginBottom: '10px' }}>⚡ 단타봇 거래 내역</div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <TradeList trades={allTrades.filter(t => t.player === 'scalper')} />
                    </div>
                  </div>
                </>
              )}

              {/* ── 거래 기록 ── */}
              {activeTab === 'trades' && (
                <>
                  {/* 서브탭 필터 */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', borderBottom: '1px solid #2d3148', paddingBottom: '10px' }}>
                    {([['all', '전체', '#64748b'], ['user', '🙋 나', '#8b5cf6'], ['ai', '🤖 AI', '#f59e0b'], ['scalper', '⚡ 단타봇', '#ef4444']] as const).map(([key, label, color]) => (
                      <button key={key} onClick={() => setTradeFilter(key)}
                        style={{ padding: '6px 16px', borderRadius: '20px', border: `1px solid ${tradeFilter === key ? color : '#2d3148'}`, backgroundColor: tradeFilter === key ? `${color}22` : 'transparent', color: tradeFilter === key ? color : '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: tradeFilter === key ? 'bold' : 'normal' }}>
                        {label}
                        <span style={{ marginLeft: '6px', fontSize: '11px', color: '#475569' }}>
                          {key === 'all' ? allTrades.length : allTrades.filter(t => t.player === key).length}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <TradeList trades={filteredTrades} />
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
