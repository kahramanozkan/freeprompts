import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// These environment variables should be added to .env.local
// NEXT_PUBLIC_SUPABASE_URL=your-project-url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// For build time, create a dummy client if env vars are missing
let supabase: ReturnType<typeof createClient<Database>>

if (!supabaseUrl || !supabaseAnonKey) {
  // Create a dummy client that won't work but won't crash the build
  supabase = createClient<Database>('https://dummy.supabase.co', 'dummy-key')
} else {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      fetch: (...args) => fetch(...args),
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
}

export { supabase }