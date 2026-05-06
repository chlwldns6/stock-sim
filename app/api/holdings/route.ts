import { NextRequest, NextResponse } from 'next/server';
import { getHoldings } from '@/lib/db';

export async function GET(req: NextRequest) {
  const player = req.nextUrl.searchParams.get('player') ?? 'user';
  const data = await getHoldings(player);
  return NextResponse.json(data);
}
