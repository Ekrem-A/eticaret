import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return Response.json({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    console.error('Categories API error:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
