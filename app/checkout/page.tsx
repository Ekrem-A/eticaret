'use client'

import Link from 'next/link'
import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useCartStore } from '@/lib/stores/cartStore'

interface CheckoutForm {
  full_name: string
  phone: string
  address: string
  city: string
  postal_code: string
  country: string
  notes: string
  payment_method: string
}

function formatCurrency(value: number) {
  return value.toLocaleString('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  })
}

export default function CheckoutPage() {
  const router = useRouter()
  const { session, user } = useAuth()
  const { items, getTotalPrice, clearCart } = useCartStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [iframeUrl, setIframeUrl] = useState('')
  const [merchantOid, setMerchantOid] = useState('')
  const [form, setForm] = useState<CheckoutForm>({
    full_name: (user?.user_metadata?.full_name as string | undefined) ?? '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Turkiye',
    notes: '',
    payment_method: 'credit_card',
  })

  const subtotal = getTotalPrice()
  const shipping = useMemo(() => (subtotal >= 1200 ? 0 : 79.9), [subtotal])
  const tax = subtotal * 0.2
  const total = subtotal + shipping + tax

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!session?.access_token) {
      setError('Odemeye devam etmek icin tekrar giris yapin.')
      return
    }

    if (items.length === 0) {
      setError('Sepetiniz bos.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/paytr/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
          shipping_address: {
            full_name: form.full_name,
            phone: form.phone,
            address: form.address,
            city: form.city,
            postal_code: form.postal_code,
            country: form.country,
          },
          notes: form.notes || null,
        }),
      })

      const result = (await response.json()) as {
        success: boolean
        error?: string
        data?: { iframeUrl: string; merchantOid: string }
      }

      if (!response.ok || !result.success) {
        setError(result.error ?? 'Siparis olusturulamadi.')
        return
      }

      setIframeUrl(result.data?.iframeUrl ?? '')
      setMerchantOid(result.data?.merchantOid ?? '')
    } catch {
      setError('Siparis olusturulamadi.')
    } finally {
      setLoading(false)
    }
  }

  if (iframeUrl) {
    return (
      <main className="min-h-screen py-14">
        <div className="container mx-auto px-4">
          <section className="mx-auto max-w-4xl rounded-2xl border border-emerald-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(16,185,129,0.7)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">PAYTR Guvenli Odeme</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Odemenizi Tamamlayin</h1>
            <p className="mt-1 text-sm text-slate-600">
              Siparis kodu: <span className="font-semibold text-slate-900">{merchantOid}</span>
            </p>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <iframe
                src={iframeUrl}
                className="h-175 w-full"
                title="PAYTR Odeme"
                allow="payment"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  clearCart()
                  router.push('/orders')
                }}
                className="rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-white hover:bg-emerald-600"
              >
                Odeme Sonrasi Siparislerime Git
              </button>
              <button
                onClick={() => setIframeUrl('')}
                className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Forma Geri Don
              </button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">EKO Checkout</p>
          <h1 className="text-3xl font-bold text-slate-900">Odeme ve Teslimat</h1>
        </div>

        {items.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">Sepetiniz bos</h2>
            <p className="mt-2 text-slate-600">Odemeye gecmeden once sepetinize urun ekleyin.</p>
            <Link
              href="/products"
              className="mt-6 inline-block rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600"
            >
              Urunlere Don
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <form onSubmit={submitOrder} className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900">Teslimat Bilgileri</h2>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  required
                  placeholder="Ad Soyad"
                  value={form.full_name}
                  onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-4 py-2.5"
                />
                <input
                  required
                  placeholder="Telefon"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-4 py-2.5"
                />
                <input
                  required
                  placeholder="Sehir"
                  value={form.city}
                  onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-4 py-2.5"
                />
                <input
                  required
                  placeholder="Posta Kodu"
                  value={form.postal_code}
                  onChange={(event) => setForm((prev) => ({ ...prev, postal_code: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-4 py-2.5"
                />
                <input
                  required
                  placeholder="Ulke"
                  value={form.country}
                  onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 sm:col-span-2"
                />
                <textarea
                  required
                  placeholder="Acik Adres"
                  value={form.address}
                  onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 min-h-28 sm:col-span-2"
                />
              </div>

              <h3 className="mt-7 text-lg font-semibold text-slate-900">Odeme Yontemi</h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                  <input
                    type="radio"
                    checked={form.payment_method === 'credit_card'}
                    onChange={() => setForm((prev) => ({ ...prev, payment_method: 'credit_card' }))}
                  />
                  <span className="font-medium text-slate-800">Kredi Karti</span>
                </label>
                <label className="rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                  <input
                    type="radio"
                    checked={form.payment_method === 'bank_transfer'}
                    onChange={() => setForm((prev) => ({ ...prev, payment_method: 'bank_transfer' }))}
                  />
                  <span className="font-medium text-slate-800">Havale / EFT</span>
                </label>
              </div>

              <textarea
                placeholder="Siparis notu (opsiyonel)"
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-2.5 min-h-20"
              />

              {error && <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 px-6 py-3 font-semibold text-white hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60"
              >
                {loading ? 'Siparis olusturuluyor...' : 'Siparisi Tamamla'}
              </button>
            </form>

            <aside className="rounded-2xl border border-slate-200 bg-white p-6 h-fit">
              <h3 className="text-lg font-semibold text-slate-900">Toplam</h3>
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

              <ul className="mt-6 space-y-2 text-sm text-slate-600">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2">
                    <span className="line-clamp-1">{item.product?.name}</span>
                    <span className="font-medium">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
