import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/db';

export async function GET(req: NextRequest) {
  const player = req.nextUrl.searchParams.get('player') ?? 'user';
  const data = await getPortfolio(player);
  return NextResponse.json(data ?? { cash: 0 });
}
