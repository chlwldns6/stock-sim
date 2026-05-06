import { NextRequest, NextResponse } from 'next/server';
import { getRecentTrades, getTradesByPlayer } from '@/lib/db';

export async function GET(req: NextRequest) {
  const player = req.nextUrl.searchParams.get('player');
  if (player) {
    const data = await getTradesByPlayer(player, 50);
    return NextResponse.json(data);
  }
  const data = await getRecentTrades(50);
  return NextResponse.json(data);
}
