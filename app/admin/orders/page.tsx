'use client'

import { useEffect, useMemo, useState } from 'react'
import { Order, OrderStatus, PaymentStatus } from '@/types/database'
import { useAuth } from '@/lib/hooks/useAuth'

const orderStatuses: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
]

const paymentStatuses: PaymentStatus[] = ['pending', 'completed', 'failed']

function formatCurrency(value: number) {
  return value.toLocaleString('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  })
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('tr-TR')
}

export default function AdminOrdersPage() {
  const { session } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const headers = useMemo(() => {
    if (!session?.access_token) return undefined

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    }
  }, [session?.access_token])

  const loadOrders = async () => {
    if (!headers) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/orders?search=${encodeURIComponent(search)}`, {
        headers,
      })

      const result = (await response.json()) as {
        success: boolean
        data?: Order[]
        error?: string
      }

      if (!response.ok || !result.success) {
        setError(result.error ?? 'Siparisler yuklenemedi')
        return
      }

      setOrders(result.data ?? [])
    } catch {
      setError('Siparisler yuklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers, search])

  const updateOrder = async (
    orderId: string,
    payload: { status?: OrderStatus; payment_status?: PaymentStatus }
  ) => {
    if (!headers) return

    setUpdatingOrderId(orderId)
    setError('')

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      })

      const result = (await response.json()) as { success: boolean; error?: string }

      if (!response.ok || !result.success) {
        setError(result.error ?? 'Siparis guncellenemedi')
        return
      }

      await loadOrders()
    } catch {
      setError('Siparis guncellenemedi')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Siparis Yonetimi</h2>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Siparis no veya durum ara..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 sm:max-w-sm"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md border border-red-300 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-12 rounded bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Siparis bulunamadi.</p>
      ) : (
        <>
          <div className="space-y-4 md:hidden">
            {orders.map((order) => (
              <article key={order.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{order.order_number}</p>
                    <p className="mt-1 break-all text-xs text-slate-500">{order.user_id}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(order.total_amount)}
                  </p>
                </div>

                <p className="mt-3 text-sm text-slate-600">{formatDate(order.created_at)}</p>

                <div className="mt-4 grid gap-3">
                  <select
                    value={order.status}
                    disabled={updatingOrderId === order.id}
                    onChange={(event) =>
                      void updateOrder(order.id, {
                        status: event.target.value as OrderStatus,
                      })
                    }
                    className="rounded border border-slate-300 px-2 py-2"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <select
                    value={order.payment_status}
                    disabled={updatingOrderId === order.id}
                    onChange={(event) =>
                      void updateOrder(order.id, {
                        payment_status: event.target.value as PaymentStatus,
                      })
                    }
                    className="rounded border border-slate-300 px-2 py-2"
                  >
                    {paymentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-3">Siparis No</th>
                <th className="py-2 pr-3">Tutar</th>
                <th className="py-2 pr-3">Durum</th>
                <th className="py-2 pr-3">Odeme</th>
                <th className="py-2 pr-3">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">
                    <p className="font-medium text-slate-900">{order.order_number}</p>
                    <p className="text-xs text-slate-500">{order.user_id}</p>
                  </td>
                  <td className="py-2 pr-3">{formatCurrency(order.total_amount)}</td>
                  <td className="py-2 pr-3">
                    <select
                      value={order.status}
                      disabled={updatingOrderId === order.id}
                      onChange={(event) =>
                        void updateOrder(order.id, {
                          status: event.target.value as OrderStatus,
                        })
                      }
                      className="px-2 py-1 rounded border border-slate-300"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      value={order.payment_status}
                      disabled={updatingOrderId === order.id}
                      onChange={(event) =>
                        void updateOrder(order.id, {
                          payment_status: event.target.value as PaymentStatus,
                        })
                      }
                      className="px-2 py-1 rounded border border-slate-300"
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3 text-slate-600">{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
