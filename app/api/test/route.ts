'use server'

import { supabase } from '@/lib/supabase'

export async function testDatabaseConnection() {
  try {
    // Kategorileri test et
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5)

    if (catError) throw catError

    console.log('✓ Categories:', categories?.length || 0)

    // Ürünleri test et
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .limit(5)

    if (prodError) throw prodError

    console.log('✓ Products:', products?.length || 0)

    return {
      success: true,
      categories: categories?.length || 0,
      products: products?.length || 0,
    }
  } catch (error: any) {
    console.error('Database test error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}
