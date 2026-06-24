import { getSupabaseAdmin } from '@/lib/supabase'

export interface AdminAuthResult {
  ok: boolean
  status?: number
  error?: string
  supabase: ReturnType<typeof getSupabaseAdmin>
  userId?: string
}

export async function validateAdminRequest(request: Request): Promise<AdminAuthResult> {
  const supabase = getSupabaseAdmin()
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      status: 401,
      error: 'Authorization token is required',
      supabase,
    }
  }

  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) {
    return {
      ok: false,
      status: 401,
      error: 'Invalid authorization token',
      supabase,
    }
  }

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return {
      ok: false,
      status: 401,
      error: 'Unauthorized',
      supabase,
    }
  }

  const roleFromMetadata =
    (data.user.user_metadata?.role as string | undefined) ||
    (data.user.app_metadata?.role as string | undefined)

  if (roleFromMetadata !== 'admin') {
    return {
      ok: false,
      status: 403,
      error: 'Admin access required',
      supabase,
    }
  }

  return {
    ok: true,
    supabase,
    userId: data.user.id,
  }
}
