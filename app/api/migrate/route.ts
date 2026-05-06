import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 한 번만 실행: trades 테이블에 realized_pnl, avg_price 컬럼 추가
export async function POST() {
  const results: Record<string, string> = {};

  // realized_pnl 컬럼 추가 시도 (이미 있으면 무시)
  const { error: e1 } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE trades ADD COLUMN IF NOT EXISTS realized_pnl integer;',
  });
  results.realized_pnl = e1 ? `error: ${e1.message}` : 'ok';

  // avg_price 컬럼 추가 시도
  const { error: e2 } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE trades ADD COLUMN IF NOT EXISTS avg_price integer;',
  });
  results.avg_price = e2 ? `error: ${e2.message}` : 'ok';

  return NextResponse.json(results);
}
