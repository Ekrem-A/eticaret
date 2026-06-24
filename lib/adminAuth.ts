import { getSupabaseAdmin } from '@/lib/supabase'
import { isAdminUser } from '@/lib/utils/admin'

export interface AdminAuthResult {
  ok: boolean
  status?: number
  error?: string
  supabase: ReturnType<typeof getSupabaseAdmin>
  userId?: string
}

export async function validateAdminRequest(request: Request): Promise<AdminAuthResult> {
  const supabase = getSupabaseAdmin()
  const adminEmailsRaw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS
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

  if (!isAdminUser(data.user, adminEmailsRaw)) {
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
