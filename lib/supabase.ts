import { createClient } from '@supabase/supabase-js'

// Supabase URL ve Key'ler environment variables'dan alınıyor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
let browserSupabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  if (!browserSupabaseClient) {
    browserSupabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }

  return browserSupabaseClient
}

// Client-side Supabase client (lazy init to avoid build-time crashes)
export const supabase: any = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const client = getSupabaseClient() as unknown as Record<string, unknown>
    const value = client[prop as keyof typeof client]

    if (typeof value === 'function') {
      return (value as Function).bind(client)
    }

    return value
  },
})

// Server-side Supabase client (admin operations için)
export const getSupabaseAdmin = () => {
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }
  
  return createClient(supabaseUrl, serviceRoleKey)
}
