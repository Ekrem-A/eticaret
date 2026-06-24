import { User } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createPaytrIframeTokenHash, getPaytrConfig, toKurus } from '@/lib/paytr'

interface CartItemPayload {
  product_id: string
  quantity: number
}

interface ShippingAddressPayload {
  full_name: string
  phone: string
  address: string
  city: string
  postal_code: string
  country: string
}

interface CreatePaytrTokenRequest {
  items: CartItemPayload[]
  shipping_address: ShippingAddressPayload
  notes?: string | null
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unknown error'
}

function buildBaseUrl(request: Request) {
  const explicit = process.env.NEXT_PUBLIC_APP_URL
  if (explicit) {
    return explicit.replace(/\/$/, '')
  }

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

function createMerchantOid() {
  const now = new Date()
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`
  const randomPart = Math.random().toString(36).slice(2, 10).toUpperCase()
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

function isAuthResult(
  value: Awaited<ReturnType<typeof getUserFromRequest>>
): value is { user: User; supabase: ReturnType<typeof getSupabaseAdmin> } {
  return 'user' in value && 'supabase' in value
}

export async function POST(request: Request) {
  try {
    const auth = await getUserFromRequest(request)
    if (!isAuthResult(auth)) {
      return Response.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const { user, supabase } = auth
    const payload = (await request.json()) as CreatePaytrTokenRequest

    if (!payload.items?.length) {
      return Response.json({ success: false, error: 'Sepet bos' }, { status: 400 })
    }

    const invalidItem = payload.items.find((item) => !item.product_id || item.quantity <= 0)
    if (invalidItem) {
      return Response.json({ success: false, error: 'Gecersiz urun satiri' }, { status: 400 })
    }

    const productIds = [...new Set(payload.items.map((item) => item.product_id))]
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock, is_active')
      .in('id', productIds)

    if (productsError) {
      throw productsError
    }

    const productMap = new Map((products ?? []).map((item) => [item.id, item]))

    for (const item of payload.items) {
      const product = productMap.get(item.product_id)
      if (!product || !product.is_active) {
        return Response.json({ success: false, error: 'Bazi urunler artik mevcut degil' }, { status: 400 })
      }
      if (item.quantity > (product.stock ?? 0)) {
        return Response.json({ success: false, error: 'Stok yetersiz' }, { status: 400 })
      }
    }

    const subtotal = payload.items.reduce((total, item) => {
      const product = productMap.get(item.product_id)
      return total + Number(product?.price ?? 0) * item.quantity
    }, 0)

    const shippingCost = subtotal >= 1200 ? 0 : 79.9
    const tax = subtotal * 0.2
    const totalAmount = subtotal + shippingCost + tax
    const paymentAmount = toKurus(totalAmount)

    const merchantOid = createMerchantOid()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: merchantOid,
        total_amount: totalAmount,
        shipping_cost: shippingCost,
        tax,
        status: 'pending',
        payment_method: 'paytr',
        payment_status: 'pending',
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

    const { error: orderItemsError } = await supabase.from('order_items').insert(orderItems)
    if (orderItemsError) {
      throw orderItemsError
    }

    const basket = payload.items.map((item) => {
      const product = productMap.get(item.product_id)
      return [product?.name ?? 'Urun', String(toKurus(Number(product?.price ?? 0))), item.quantity]
    })

    const userIp = (request.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim()
    const baseUrl = buildBaseUrl(request)
    const { merchantId, merchantKey, merchantSalt } = getPaytrConfig()

    const tokenHash = createPaytrIframeTokenHash({
      merchantId,
      userIp,
      merchantOid,
      email: user.email ?? 'customer@example.com',
      paymentAmount,
      paymentType: 'card',
      installmentCount: 0,
      currency: 'TL',
      testMode: process.env.PAYTR_TEST_MODE === '1' ? '1' : '0',
      non3d: '0',
      merchantSalt,
      merchantKey,
    })

    const tokenRequestBody = new URLSearchParams({
      merchant_id: merchantId,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email: user.email ?? 'customer@example.com',
      payment_amount: String(paymentAmount),
      payment_type: 'card',
      installment_count: '0',
      currency: 'TL',
      test_mode: process.env.PAYTR_TEST_MODE === '1' ? '1' : '0',
      non_3d: '0',
      merchant_ok_url: `${baseUrl}/orders?payment=success`,
      merchant_fail_url: `${baseUrl}/checkout?payment=failed`,
      user_name: payload.shipping_address.full_name,
      user_address: payload.shipping_address.address,
      user_phone: payload.shipping_address.phone,
      user_basket: Buffer.from(JSON.stringify(basket)).toString('base64'),
      debug_on: process.env.PAYTR_DEBUG_ON === '1' ? '1' : '0',
      timeout_limit: '30',
      lang: 'tr',
      no_installment: '0',
      max_installment: '0',
      paytr_token: tokenHash,
    })

    const tokenResponse = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestBody.toString(),
    })

    const tokenResult = (await tokenResponse.json()) as {
      status: 'success' | 'failed'
      token?: string
      reason?: string
    }

    if (tokenResult.status !== 'success' || !tokenResult.token) {
      return Response.json(
        {
          success: false,
          error: tokenResult.reason ?? 'PAYTR token olusturulamadi',
        },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      data: {
        merchantOid,
        orderId: order.id,
        iframeUrl: `https://www.paytr.com/odeme/guvenli/${tokenResult.token}`,
      },
    })
  } catch (error: unknown) {
    return Response.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}
