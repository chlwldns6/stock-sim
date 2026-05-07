export const maxDuration = 60;

import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/runAgent';

export async function POST() {
  try {
    const result = await runAgent();
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
