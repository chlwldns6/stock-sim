import { NextRequest, NextResponse } from 'next/server';
import { resetGame } from '@/lib/db';

const ALLOWED_CAPITALS = [1000000, 3000000, 5000000, 10000000];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const initialCapital = ALLOWED_CAPITALS.includes(body.initialCapital)
      ? body.initialCapital
      : 10000000;
    await resetGame(initialCapital);
    return NextResponse.json({ success: true, initialCapital });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
