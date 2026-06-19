import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Admin-level Supabase client to bypass RLS policies.
 * Should ONLY be used in server-side contexts like API routes that require admin privileges.
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set in environment variables.
 */

let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (_supabaseAdmin) return _supabaseAdmin

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Fallback to anon key in dev if service role is not set, but it will respect RLS
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase admin env vars missing, using dummy client')
    return createClient<Database>('https://dummy.supabase.co', 'dummy-key')
  }

  _supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  return _supabaseAdmin
}

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabaseAdmin(), prop, receiver)
  }
})
