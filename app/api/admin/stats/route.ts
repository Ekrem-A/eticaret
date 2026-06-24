import { validateAdminRequest } from '@/lib/adminAuth'

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

    const { supabase } = auth

    const [
      productsResult,
      categoriesResult,
      ordersResult,
      activeProductsResult,
      lowStockResult,
      revenueResult,
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .lte('stock', 5),
      supabase.from('orders').select('total_amount, payment_status'),
    ])

    const dbErrors = [
      productsResult.error,
      categoriesResult.error,
      ordersResult.error,
      activeProductsResult.error,
      lowStockResult.error,
      revenueResult.error,
    ].filter(Boolean)

    if (dbErrors.length > 0) {
      return Response.json(
        {
          success: false,
          error: 'Failed to load admin stats',
          details: dbErrors.map((item) => (item as { message: string }).message),
        },
        { status: 500 }
      )
    }

    const paidRevenue =
      revenueResult.data?.reduce((total, row) => {
        if (row.payment_status === 'completed') {
          return total + Number(row.total_amount ?? 0)
        }
        return total
      }, 0) ?? 0

    return Response.json({
      success: true,
      data: {
        products: productsResult.count ?? 0,
        activeProducts: activeProductsResult.count ?? 0,
        categories: categoriesResult.count ?? 0,
        orders: ordersResult.count ?? 0,
        lowStockProducts: lowStockResult.count ?? 0,
        paidRevenue,
      },
    })
  } catch (error: unknown) {
    return Response.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
