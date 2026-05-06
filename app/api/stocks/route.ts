import { NextResponse } from 'next/server';
import { fetchStockPrices } from '@/lib/yahoo';

export async function GET() {
  try {
    const stocks = await fetchStockPrices();
    return NextResponse.json(stocks);
  } catch (e) {
    return NextResponse.json({ error: '주식 가격 조회 실패' }, { status: 500 });
  }
}
