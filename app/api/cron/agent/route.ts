export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/lib/runAgent';
import { isMarketOpen } from '@/lib/market';

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_KEY ?? process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isMarketOpen()) {
    return NextResponse.json({ skipped: true, reason: '장외 시간' });
  }

  const result = await runAgent();
  return NextResponse.json(result);
}
