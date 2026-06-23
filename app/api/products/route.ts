import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '12')

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    // Filter by category
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    // Search
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    // Sort
    switch (sort) {
      case 'price-asc':
        query = query.order('price', { ascending: true })
        break
      case 'price-desc':
        query = query.order('price', { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Pagination
    const from = (page - 1) * perPage
    const to = from + perPage - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return Response.json({
      success: true,
      data: data || [],
      total: count || 0,
    })
  } catch (error: any) {
    console.error('Products API error:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
