import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test Supabase connection with count
    const { data: countData, error: countError } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json({
        success: false,
        error: countError.message,
        details: countError,
        env: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
          supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing',
          nodeEnv: process.env.NODE_ENV,
        },
      }, { status: 500 });
    }

    // Get latest prompts (same query as homepage)
    const { data: promptsData, error: promptsError } = await supabase
      .from('prompts')
      .select('id, title, image, tags, likes, created_at, content, user_id')
      .order('created_at', { ascending: false })
      .limit(8);

    if (promptsError) {
      return NextResponse.json({
        success: false,
        error: promptsError.message,
        details: promptsError,
      }, { status: 500 });
    }

    // Get stats
    const { data: statsData, error: statsError } = await supabase
      .from('stats')
      .select('metric, value')
      .order('metric');

    let stats = { total_prompts: 0, total_lists: 0, total_views: 0, total_likes: 0 };
    if (!statsError && statsData) {
      statsData.forEach(row => {
        stats[row.metric as keyof typeof stats] = row.value;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        count: countData?.length || 0,
        prompts: promptsData,
        stats,
        statsError: statsError?.message,
      },
      env: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing',
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack,
    }, { status: 500 });
  }
}