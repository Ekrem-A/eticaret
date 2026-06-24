'use client'

import { useEffect, useState } from 'react'
import { Order } from '@/types/database'
import { useAuth } from '@/lib/hooks/useAuth'

function formatCurrency(value: number) {
  return value.toLocaleString('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  })
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('tr-TR')
}

export default function OrdersPage() {
  const { session } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrders = async () => {
      if (!session?.access_token) {
        setLoading(false)
        return
      }

      setError('')
      setLoading(true)

      try {
        const response = await fetch('/api/orders', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
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

    void loadOrders()
  }, [session?.access_token])

  return (
    <main className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Hesabim</p>
          <h1 className="text-3xl font-bold text-slate-900">Siparislerim</h1>
        </div>

        {error && <p className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-14 rounded-lg bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-900">Henuz siparisiniz bulunmuyor</h2>
            <p className="mt-2 text-slate-600">Urun ekleyip ilk siparisinizi kolayca olusturabilirsiniz.</p>
          </section>
        ) : (
          <>
            <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Siparis No</th>
                    <th className="px-4 py-3 text-left">Durum</th>
                    <th className="px-4 py-3 text-left">Odeme</th>
                    <th className="px-4 py-3 text-left">Toplam</th>
                    <th className="px-4 py-3 text-left">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">{order.order_number}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{order.payment_status}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(order.total_amount)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <div className="space-y-4 md:hidden">
              {orders.map((order) => (
                <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
                        Siparis No
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">{order.order_number}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {order.status}
                    </span>
                  </div>

                  <dl className="mt-4 space-y-3 text-sm text-slate-700">
                    <div className="flex items-center justify-between gap-3">
                      <dt>Odeme</dt>
                      <dd className="text-right font-medium text-slate-900">{order.payment_status}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt>Toplam</dt>
                      <dd className="text-right font-semibold text-slate-900">
                        {formatCurrency(order.total_amount)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt>Tarih</dt>
                      <dd className="text-right text-slate-600">{formatDate(order.created_at)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
