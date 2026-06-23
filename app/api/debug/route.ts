import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test: Kategorileri getir
    const { data: categories, error: catError, count: catCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact' })

    if (catError) {
      return Response.json({ error: `Categories error: ${catError.message}` }, { status: 500 })
    }

    // Test: Ürünleri getir
    const { data: products, error: prodError, count: prodCount } = await supabase
      .from('products')
      .select('*', { count: 'exact' })

    if (prodError) {
      return Response.json({ error: `Products error: ${prodError.message}` }, { status: 500 })
    }

    return Response.json({
      success: true,
      categories: {
        count: catCount || 0,
        data: categories?.slice(0, 3),
      },
      products: {
        count: prodCount || 0,
        data: products?.slice(0, 3),
      },
    })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
