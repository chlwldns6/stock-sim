import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker');
  if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 });

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d&_=${Date.now()}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) return NextResponse.json({ error: 'fetch failed' }, { status: 502 });
    const json = await res.json();

    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) return NextResponse.json({ error: 'no data' }, { status: 404 });

    return NextResponse.json({
      open: meta.regularMarketOpen ? Math.round(meta.regularMarketOpen) : null,
      high: meta.regularMarketDayHigh ? Math.round(meta.regularMarketDayHigh) : null,
      low: meta.regularMarketDayLow ? Math.round(meta.regularMarketDayLow) : null,
      volume: meta.regularMarketVolume ?? null,
      prevClose: meta.chartPreviousClose ? Math.round(meta.chartPreviousClose) : null,
      marketCap: meta.marketCap ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
