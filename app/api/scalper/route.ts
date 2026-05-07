export const maxDuration = 60;

import { NextResponse } from 'next/server';
import { runScalper } from '@/lib/runScalper';

export async function POST() {
  try {
    const result = await runScalper();
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
