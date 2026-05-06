import { NextRequest, NextResponse } from 'next/server';
import { resetGame } from '@/lib/db';

const ALLOWED = [1000000, 3000000, 5000000, 10000000];
const parse = (v: unknown) => ALLOWED.includes(v as number) ? (v as number) : 10000000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const capitals = {
      user: parse(body.user),
      ai: parse(body.ai),
      scalper: parse(body.scalper),
    };
    await resetGame(capitals);
    return NextResponse.json({ success: true, capitals });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
