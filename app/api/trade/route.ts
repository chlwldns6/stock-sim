import { NextRequest, NextResponse } from 'next/server';
import { executeTrade } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ticker, name, qty, price } = body;

    if (!action || !ticker || !name || !qty || !price) {
      return NextResponse.json({ error: '필수 정보가 누락됐습니다.' }, { status: 400 });
    }

    if (qty <= 0) {
      return NextResponse.json({ error: '수량은 1 이상이어야 합니다.' }, { status: 400 });
    }

    await executeTrade({ player: 'user', action, ticker, name, qty, price });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
