import { validateAdminRequest } from '@/lib/adminAuth'
import { Product } from '@/types/database'

interface ProductPayload {
  name: string
  slug: string
  description?: string | null
  price: number
  stock: number
  category_id: string
  image_url?: string | null
  sku?: string | null
  featured?: boolean
  is_active?: boolean
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unknown error'
}

function normalizePayload(payload: ProductPayload) {
  return {
    name: payload.name.trim(),
    slug: payload.slug.trim(),
    description: payload.description?.trim() || null,
    price: Number(payload.price),
    stock: Number(payload.stock),
    category_id: payload.category_id,
    image_url: payload.image_url?.trim() || null,
    sku: payload.sku?.trim() || null,
    featured: Boolean(payload.featured),
    is_active: payload.is_active ?? true,
  }
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
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,sku.ilike.%${search}%`)
    }

    const { data, error, count } = await query.range(from, to)

    if (error) {
      throw error
    }

    return Response.json({
      success: true,
      data: (data ?? []) as Product[],
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

export async function POST(request: Request) {
  try {
    const auth = await validateAdminRequest(request)

    if (!auth.ok) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status ?? 401 }
      )
    }

    const payload = (await request.json()) as ProductPayload

    if (!payload.name || !payload.slug || !payload.category_id) {
      return Response.json(
        {
          success: false,
          error: 'name, slug and category_id are required',
        },
        { status: 400 }
      )
    }

    const normalized = normalizePayload(payload)

    const { data, error } = await auth.supabase
      .from('products')
      .insert(normalized)
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return Response.json({
      success: true,
      data,
    })
  } catch (error: unknown) {
    return Response.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
