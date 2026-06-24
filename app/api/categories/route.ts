import { getSupabaseAdmin } from '@/lib/supabase'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unknown error'
}

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
  } catch (error: unknown) {
    console.error('Categories API error:', error)
    return Response.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
