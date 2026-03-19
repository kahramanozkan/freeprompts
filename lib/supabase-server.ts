import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Server-side Supabase client for use in Server Components, API Routes, and SSR.
 * This client does NOT depend on `window` or `localStorage` and is safe to use
 * in Node.js environments (e.g., Netlify Functions, Next.js Server Components).
 *
 * Uses lazy initialization to ensure env vars are available at access time.
 */

let _supabaseServer: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseServer() {
  if (_supabaseServer) return _supabaseServer

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars missing, using dummy client')
    return createClient<Database>('https://dummy.supabase.co', 'dummy-key')
  }

  _supabaseServer = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  return _supabaseServer
}

// Backward compatibility — lazy getter
export const supabaseServer = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabaseServer(), prop, receiver)
  }
})
