const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? '✓' : '✗');
console.log('Supabase Anon Key:', supabaseAnonKey ? '✓' : '✗');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    // Count all prompts
    const { count, error } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Count error:', error);
    } else {
      console.log('Total prompts in database:', count);
    }

    // Get latest 8 prompts (without user join)
    const { data, error: err } = await supabase
      .from('prompts')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(8);
    
    if (err) {
      console.error('Latest error:', err);
    } else {
      console.log('Latest prompts:', data);
    }

    // Test prompts with user join
    const { data: dataWithUser, error: err2 } = await supabase
      .from('prompts')
      .select('id, title, user:users(id, name)')
      .order('created_at', { ascending: false })
      .limit(2);
    
    if (err2) {
      console.error('Join error:', err2);
    } else {
      console.log('Prompts with user join:', dataWithUser);
    }
  } catch (e) {
    console.error('Exception:', e);
  }
}

test();