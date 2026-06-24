import { createPaytrCallbackHash, getPaytrConfig, toKurus } from '@/lib/paytr'
import { getSupabaseAdmin } from '@/lib/supabase'

function deny() {
  return new Response('PAYTR callback error', { status: 400 })
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const merchantOid = String(formData.get('merchant_oid') ?? '')
    const status = String(formData.get('status') ?? '')
    const totalAmount = String(formData.get('total_amount') ?? '')
    const receivedHash = String(formData.get('hash') ?? '')

    if (!merchantOid || !status || !totalAmount || !receivedHash) {
      return deny()
    }

    const { merchantKey, merchantSalt } = getPaytrConfig()
    const expectedHash = createPaytrCallbackHash({
      merchantOid,
      status,
      totalAmount,
      merchantSalt,
      merchantKey,
    })

    if (expectedHash !== receivedHash) {
      return deny()
    }

    const supabase = getSupabaseAdmin()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, total_amount')
      .eq('order_number', merchantOid)
      .single()

    if (orderError || !order) {
      return deny()
    }

    const expectedTotalAmount = String(toKurus(Number(order.total_amount ?? 0)))
    if (expectedTotalAmount !== totalAmount) {
      return deny()
    }

    if (status === 'success') {
      await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
    } else {
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
    }

    return new Response('OK')
  } catch {
    return deny()
  }
}
