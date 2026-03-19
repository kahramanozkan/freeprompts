import { supabaseServer } from './supabase-server'

/**
 * Server-side data fetching functions.
 * These use the server-safe Supabase client (no localStorage dependency).
 * Use these in Server Components and API routes.
 */

// Helper to extract readable error info from Supabase/Postgrest errors
function extractError(err: any): string {
  if (!err) return 'Unknown error'
  if (typeof err === 'string') return err
  return err.message || err.details || err.hint || JSON.stringify(err, Object.getOwnPropertyNames(err)) || 'Unknown error'
}

// Get latest prompts for homepage (server-side, lightweight)
export async function getLatestPromptsServer(limit: number = 8) {
  const { data, error } = await supabaseServer
    .from('prompts')
    .select('id, title, image, tags, likes, created_at, user_id')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Supabase prompts query failed: ${extractError(error)}`)
  return data
}

// Get latest lists for homepage (server-side, lightweight)
export async function getLatestListsServer(limit: number = 3) {
  const { data, error } = await supabaseServer
    .from('lists')
    .select('id, name, slug, image, prompt_ids, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Supabase lists query failed: ${extractError(error)}`)
  return data
}

// Get homepage stats (server-side)
export async function getHomepageStatsServer() {
  const { data, error } = await supabaseServer
    .from('stats')
    .select('metric, value')
    .order('metric')

  if (error) throw new Error(`Supabase stats query failed: ${extractError(error)}`)
  const result: Record<string, number> = {}
  data?.forEach(row => result[row.metric] = row.value)

  return {
    totalPrompts: result.total_prompts || 0,
    totalLists: result.total_lists || 0,
    totalViews: result.total_views || 0,
    totalLikes: result.total_likes || 0
  }
}

// Get variant counts for prompts (server-side)
export async function getVariantCountsServer(promptIds: string[]) {
  if (!promptIds.length) return {}

  const { data, error } = await supabaseServer
    .from('prompt_variants')
    .select('prompt_id')
    .in('prompt_id', promptIds)

  if (error) throw new Error(`Supabase variants query failed: ${extractError(error)}`)

  const counts: Record<string, number> = {}
  promptIds.forEach(id => counts[id] = 0)
  data?.forEach(row => {
    counts[row.prompt_id] = (counts[row.prompt_id] || 0) + 1
  })
  return counts
}

// Get user likes map (server-side)
export async function getUserLikesServer(userId: string, promptIds: string[]) {
  if (!userId || !promptIds.length) return {}

  const { data, error } = await supabaseServer
    .from('user_likes')
    .select('prompt_id')
    .eq('user_id', userId)
    .in('prompt_id', promptIds)

  if (error) throw new Error(`Supabase likes query failed: ${extractError(error)}`)

  const likesMap: Record<string, boolean> = {}
  promptIds.forEach(id => likesMap[id] = false)
  data?.forEach(row => {
    likesMap[row.prompt_id] = true
  })
  return likesMap
}
