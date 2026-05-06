import { NextResponse } from 'next/server';
import { resetGame } from '@/lib/db';

export async function POST() {
  try {
    await resetGame();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
