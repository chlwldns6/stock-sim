import { NextRequest, NextResponse } from 'next/server';
import { getPerfHistory, savePerfPoint } from '@/lib/db';

export async function GET() {
  const data = await getPerfHistory();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const { player, totalValue } = await req.json();
    await savePerfPoint(player, totalValue);
    const check = await getPerfHistory();
    return NextResponse.json({ success: true, totalRows: check.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
