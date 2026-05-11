export const maxDuration = 60;

import { NextResponse } from 'next/server';
import { runScalper } from '@/lib/runScalper';

export async function POST() {
  try {
    const result = await runScalper();
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ action: 'HOLD', reason: `서버 오류: ${msg}` });
  }
}
