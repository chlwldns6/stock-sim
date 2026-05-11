import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  const results: Record<string, string> = {};

  // 컬럼 존재 여부를 직접 insert 테스트로 확인 후 추가
  // Supabase에서 exec_sql RPC 없이 컬럼 추가하는 방법:
  // information_schema 조회로 컬럼 존재 확인
  const { data: cols } = await supabase
    .from('information_schema.columns' as any)
    .select('column_name')
    .eq('table_name', 'trades')
    .in('column_name', ['avg_price', 'realized_pnl']);

  const existingCols = (cols ?? []).map((c: any) => c.column_name);
  results.existing_columns = existingCols.join(', ') || 'none';
  results.note = '컬럼 추가는 Supabase SQL Editor에서 아래 SQL을 직접 실행하세요.';
  results.sql = 'ALTER TABLE trades ADD COLUMN IF NOT EXISTS avg_price integer; ALTER TABLE trades ADD COLUMN IF NOT EXISTS realized_pnl integer;';

  return NextResponse.json(results);
}
