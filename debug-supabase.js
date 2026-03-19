// Debug script for Supabase connection - CommonJS format
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🔍 Debug Script Starting...');

// Read .env.local file manually
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

console.log('Supabase URL:', supabaseUrl ? '✓ Configured' : '✗ Missing');
console.log('Supabase Anon Key:', supabaseAnonKey ? '✓ Configured' : '✗ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n🔗 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('prompts')
      .select('id, title')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return;
    }
    
    console.log('✅ Connection successful');
    console.log('Total prompts found:', data ? data.length : 0);
    if (data && data.length > 0) {
      console.log('Sample prompt:', data[0]);
    }
    
    // Test specific prompt ID from error
    const testId = 'a70d5189-0989-40cc-9b1a-45179faf9e49';
    console.log(`\n🔍 Testing specific prompt ID: ${testId}`);
    
    const { data: promptData, error: promptError } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', testId)
      .single();
    
    if (promptError) {
      console.error('❌ Specific prompt test failed:');
      console.error('Error code:', promptError.code);
      console.error('Error message:', promptError.message);
      console.error('Error details:', JSON.stringify(promptError, null, 2));
    } else {
      console.log('✅ Prompt found:', promptData ? 'Yes' : 'No');
      if (promptData) {
        console.log('Prompt title:', promptData.title);
        console.log('Prompt content length:', promptData.content ? promptData.content.length : 0);
      }
    }
    
    // Test a few random prompts
    console.log('\n🔍 Testing all prompts (first 5):');
    const { data: allPrompts, error: allError } = await supabase
      .from('prompts')
      .select('id, title, created_at')
      .limit(5);
      
    if (allError) {
      console.error('❌ All prompts test failed:', allError);
    } else {
      console.log('✅ First 5 prompts:', allPrompts);
    }
    
  } catch (err) {
    console.error('💥 Exception occurred:', err);
  }
}

testConnection().then(() => {
  console.log('\n🏁 Debug script completed');
}).catch(err => {
  console.error('💥 Script failed:', err);
});