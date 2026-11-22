import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClientInstance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClientInstance) return supabaseClientInstance

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://placeholder-project.supabase.co'

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'placeholder-anon-key'

  supabaseClientInstance = createClient(supabaseUrl, supabaseKey)

  return supabaseClientInstance
}

export const supabaseClient = getSupabaseClient()
