'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'

function formatCurrency(value: number) {
  return value.toLocaleString('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  })
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore()

  const subtotal = getTotalPrice()
  const shipping = useMemo(() => (subtotal >= 1200 ? 0 : 79.9), [subtotal])
  const tax = subtotal * 0.2
  const total = subtotal + shipping + tax

  return (
    <main className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">EKO Cart</p>
            <h1 className="text-3xl font-bold text-slate-900">Sepetim</h1>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Sepeti Temizle
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">Sepetiniz su anda bos</h2>
            <p className="mt-2 text-sm text-slate-600">Kesfetmeye devam edin ve favori urunlerinizi ekleyin.</p>
            <Link
              href="/products"
              className="mt-6 inline-block rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600"
            >
              Urunlere Don
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{item.product?.name ?? 'Urun'}</h2>
                      <p className="mt-1 text-sm text-slate-500">Birim fiyat: {formatCurrency(item.product?.price ?? 0)}</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">
                        Toplam: {formatCurrency((item.product?.price ?? 0) * item.quantity)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center font-semibold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="ml-3 rounded-lg border border-rose-200 px-3 py-1 text-rose-700 hover:bg-rose-50"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="rounded-2xl border border-slate-200 bg-white p-6 h-fit">
              <h3 className="text-lg font-semibold text-slate-900">Siparis Ozeti</h3>
              <dl className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <dt>Ara Toplam</dt>
                  <dd>{formatCurrency(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Kargo</dt>
                  <dd>{shipping === 0 ? 'Ucretsiz' : formatCurrency(shipping)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>KDV</dt>
                  <dd>{formatCurrency(tax)}</dd>
                </div>
                <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-base font-bold text-slate-900">
                  <dt>Genel Toplam</dt>
                  <dd>{formatCurrency(total)}</dd>
                </div>
              </dl>

              <Link
                href="/checkout"
                className="mt-6 block rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-3 text-center font-semibold text-white hover:from-emerald-600 hover:to-teal-600"
              >
                Odemeye Gec
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
