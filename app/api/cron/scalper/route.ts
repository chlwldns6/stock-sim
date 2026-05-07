export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { runScalper } from '@/lib/runScalper';
import { isMarketOpen } from '@/lib/market';

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isMarketOpen()) {
    return NextResponse.json({ skipped: true, reason: '장외 시간' });
  }

  try {
    const result = await runScalper();
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
