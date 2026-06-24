import { supabase } from '@/lib/supabase'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unknown error'
}

export async function GET() {
  try {
    // Kategorileri test et
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5)

    if (catError) throw catError

    // Ürünleri test et
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .limit(5)

    if (prodError) throw prodError

    return Response.json({
      success: true,
      categories: categories?.length || 0,
      products: products?.length || 0,
    })
  } catch (error: unknown) {
    console.error('Database test error:', error)
    return Response.json({
      success: false,
      error: getErrorMessage(error),
    }, { status: 500 })
  }
}
