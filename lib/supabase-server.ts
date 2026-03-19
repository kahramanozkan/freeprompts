import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Server-side Supabase client for use in Server Components, API Routes, and SSR.
 * This client does NOT depend on `window` or `localStorage` and is safe to use
 * in Node.js environments (e.g., Netlify Functions, Next.js Server Components).
 *
 * For client-side (browser) usage, use the client from `./supabase.ts` instead.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export function createServerSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client for build time
    return createClient<Database>('https://dummy.supabase.co', 'dummy-key')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

// Singleton for server-side usage (no localStorage dependency)
export const supabaseServer = createServerSupabaseClient()
