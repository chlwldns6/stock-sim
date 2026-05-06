import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const { data: existing } = await supabase
      .from('portfolios').select('player').eq('player', 'scalper').single();

    if (!existing) {
      await supabase.from('portfolios').insert({ player: 'scalper', cash: 10000000, initial_capital: 10000000 });
    }

    return NextResponse.json({ success: true, created: !existing });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
