const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) envVars[key.trim()] = valueParts.join('=').trim();
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  console.log('Testing stats table...');
  const { data, error } = await supabase.from('stats').select('metric, value');
  if (error) {
    console.error('Stats error:', error);
  } else {
    console.log('Stats rows:', data);
  }

  console.log('\nTesting prompts count...');
  const { count, error: err } = await supabase.from('prompts').select('*', { count: 'exact', head: true });
  if (err) console.error('Count error:', err);
  else console.log('Prompts count:', count);

  console.log('\nTesting lists count...');
  const { count: listCount, error: listErr } = await supabase.from('lists').select('*', { count: 'exact', head: true });
  if (listErr) console.error('List count error:', listErr);
  else console.log('Lists count:', listCount);
}

test().catch(console.error);