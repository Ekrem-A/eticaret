import { getSupabaseAdmin } from '@/lib/supabase'
import { PaymentStatus } from '@/types/database'
import { User } from '@supabase/supabase-js'

interface OrderCartItem {
  product_id: string
  quantity: number
}

interface CreateOrderRequest {
  items: OrderCartItem[]
  payment_method: string
  shipping_address: {
    full_name: string
    phone: string
    address: string
    city: string
    postal_code: string
    country: string
  }
  notes?: string
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unknown error'
}

function createOrderNumber() {
  const now = new Date()
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `EKO-${datePart}-${randomPart}`
}

async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Authorization token is required', status: 401 as const }
  }

  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) {
    return { error: 'Invalid authorization token', status: 401 as const }
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return { error: 'Unauthorized', status: 401 as const }
  }

  return { user: data.user, supabase }
}

function isAuthenticatedResult(
  value: Awaited<ReturnType<typeof getUserFromRequest>>
): value is { user: User; supabase: ReturnType<typeof getSupabaseAdmin> } {
  return 'user' in value && 'supabase' in value
}

export async function GET(request: Request) {
  try {
    const auth = await getUserFromRequest(request)
    if (!isAuthenticatedResult(auth)) {
      return Response.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const { user, supabase } = auth
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return Response.json({
      success: true,
      data: data ?? [],
    })
  } catch (error: unknown) {
    return Response.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getUserFromRequest(request)
    if (!isAuthenticatedResult(auth)) {
      return Response.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const { user, supabase } = auth
    const payload = (await request.json()) as CreateOrderRequest

    if (!payload.items?.length) {
      return Response.json({ success: false, error: 'Cart is empty' }, { status: 400 })
    }

    const invalidItem = payload.items.find((item) => !item.product_id || item.quantity <= 0)
    if (invalidItem) {
      return Response.json({ success: false, error: 'Invalid cart items' }, { status: 400 })
    }

    const productIds = [...new Set(payload.items.map((item) => item.product_id))]
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, stock, is_active')
      .in('id', productIds)

    if (productsError) {
      throw productsError
    }

    const productMap = new Map((products ?? []).map((item) => [item.id, item]))

    for (const item of payload.items) {
      const product = productMap.get(item.product_id)
      if (!product || !product.is_active) {
        return Response.json({ success: false, error: 'A product is unavailable' }, { status: 400 })
      }

      if (item.quantity > (product.stock ?? 0)) {
        return Response.json(
          { success: false, error: 'Requested quantity exceeds stock' },
          { status: 400 }
        )
      }
    }

    const subtotal = payload.items.reduce((total, item) => {
      const product = productMap.get(item.product_id)
      return total + Number(product?.price ?? 0) * item.quantity
    }, 0)

    const shippingCost = subtotal >= 1200 ? 0 : 79.9
    const tax = subtotal * 0.2
    const totalAmount = subtotal + shippingCost + tax

    const paymentStatus: PaymentStatus = 'completed'

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: createOrderNumber(),
        total_amount: totalAmount,
        shipping_cost: shippingCost,
        tax,
        status: 'confirmed',
        payment_method: payload.payment_method,
        payment_status: paymentStatus,
        shipping_address: payload.shipping_address,
        notes: payload.notes ?? null,
      })
      .select('*')
      .single()

    if (orderError) {
      throw orderError
    }

    const orderItems = payload.items.map((item) => {
      const product = productMap.get(item.product_id)
      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: Number(product?.price ?? 0),
      }
    })

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      throw itemsError
    }

    for (const item of payload.items) {
      const product = productMap.get(item.product_id)
      const remainingStock = Math.max((product?.stock ?? 0) - item.quantity, 0)
      await supabase
        .from('products')
        .update({ stock: remainingStock, updated_at: new Date().toISOString() })
        .eq('id', item.product_id)
    }

    return Response.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.order_number,
        totalAmount,
      },
    })
  } catch (error: unknown) {
    return Response.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}
