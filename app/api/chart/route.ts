import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker');
  if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 });

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${ticker}&range=1mo&interval=1d&_=${Date.now()}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) return NextResponse.json({ points: [] });
    const json = await res.json();

    const sparkData = json?.[ticker];
    const timestamps: number[] = sparkData?.timestamp ?? [];
    const closes: (number | null)[] = sparkData?.close ?? [];

    const points = timestamps
      .map((ts, i) => ({
        date: new Date(ts * 1000).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
        price: closes[i] != null ? Math.round(closes[i]!) : null,
      }))
      .filter(p => p.price != null);

    return NextResponse.json({ points });
  } catch {
    return NextResponse.json({ points: [] });
  }
}
