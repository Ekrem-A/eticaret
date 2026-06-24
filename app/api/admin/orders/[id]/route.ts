import { validateAdminRequest } from '@/lib/adminAuth'
import { OrderStatus, PaymentStatus } from '@/types/database'

interface OrderPatchPayload {
  status?: OrderStatus
  payment_status?: PaymentStatus
  notes?: string | null
}

const validOrderStatuses: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
]

const validPaymentStatuses: PaymentStatus[] = ['pending', 'completed', 'failed']

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unknown error'
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
    const payload = (await request.json()) as OrderPatchPayload

    const updateData: {
      status?: OrderStatus
      payment_status?: PaymentStatus
      notes?: string | null
      updated_at: string
    } = {
      updated_at: new Date().toISOString(),
    }

    if (payload.status) {
      if (!validOrderStatuses.includes(payload.status)) {
        return Response.json(
          { success: false, error: 'Invalid order status' },
          { status: 400 }
        )
      }
      updateData.status = payload.status
    }

    if (payload.payment_status) {
      if (!validPaymentStatuses.includes(payload.payment_status)) {
        return Response.json(
          { success: false, error: 'Invalid payment status' },
          { status: 400 }
        )
      }
      updateData.payment_status = payload.payment_status
    }

    if (typeof payload.notes === 'string') {
      updateData.notes = payload.notes.trim()
    }

    if (payload.notes === null) {
      updateData.notes = null
    }

    if (Object.keys(updateData).length === 1) {
      return Response.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data, error } = await auth.supabase
      .from('orders')
      .update(updateData)
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
