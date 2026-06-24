import { validateAdminRequest } from '@/lib/adminAuth'
import { Order } from '@/types/database'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unknown error'
}

export async function GET(request: Request) {
  try {
    const auth = await validateAdminRequest(request)

    if (!auth.ok) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status ?? 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = Number(searchParams.get('page') ?? '1')
    const perPage = Number(searchParams.get('perPage') ?? '20')

    const from = (page - 1) * perPage
    const to = from + perPage - 1

    let query = auth.supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,status.ilike.%${search}%`)
    }

    const { data, error, count } = await query.range(from, to)

    if (error) {
      throw error
    }

    return Response.json({
      success: true,
      data: (data ?? []) as Order[],
      total: count ?? 0,
      page,
      perPage,
    })
  } catch (error: unknown) {
    return Response.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
