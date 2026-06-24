import { validateAdminRequest } from '@/lib/adminAuth'

interface ProductUpdatePayload {
  name?: string
  slug?: string
  description?: string | null
  price?: number
  stock?: number
  category_id?: string
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

function sanitizePatch(payload: ProductUpdatePayload) {
  const updateData: Record<string, string | number | boolean | null> = {}

  if (typeof payload.name === 'string') updateData.name = payload.name.trim()
  if (typeof payload.slug === 'string') updateData.slug = payload.slug.trim()
  if (typeof payload.description === 'string') updateData.description = payload.description.trim()
  if (payload.description === null) updateData.description = null
  if (typeof payload.price !== 'undefined') updateData.price = Number(payload.price)
  if (typeof payload.stock !== 'undefined') updateData.stock = Number(payload.stock)
  if (typeof payload.category_id === 'string') updateData.category_id = payload.category_id
  if (typeof payload.image_url === 'string') updateData.image_url = payload.image_url.trim()
  if (payload.image_url === null) updateData.image_url = null
  if (typeof payload.sku === 'string') updateData.sku = payload.sku.trim()
  if (payload.sku === null) updateData.sku = null
  if (typeof payload.featured === 'boolean') updateData.featured = payload.featured
  if (typeof payload.is_active === 'boolean') updateData.is_active = payload.is_active

  return updateData
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await validateAdminRequest(request)

    if (!auth.ok) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status ?? 401 }
      )
    }

    const { id } = await params
    const payload = (await request.json()) as ProductUpdatePayload
    const updateData = sanitizePatch(payload)

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data, error } = await auth.supabase
      .from('products')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return Response.json({ success: true, data })
  } catch (error: unknown) {
    return Response.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await validateAdminRequest(request)

    if (!auth.ok) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status ?? 401 }
      )
    }

    const { id } = await params

    const { error } = await auth.supabase.from('products').delete().eq('id', id)

    if (error) {
      throw error
    }

    return Response.json({ success: true })
  } catch (error: unknown) {
    return Response.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
