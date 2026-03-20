import { createClient } from '@supabase/supabase-js';

describe('Public anon Supabase read', () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars not set, skipping test');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  test('anon can fetch prompts', async () => {
    const { data, error } = await supabase.from('prompts').select('id').limit(1);
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.length).toBeGreaterThan(0);
  });
});
