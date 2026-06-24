"use client"

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Home() {
  const { user } = useAuth()
  const fullName = (user?.user_metadata?.full_name as string | undefined) || null

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700 py-14 text-white sm:py-18">
        <div className="absolute -left-24 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="container mx-auto px-4 text-center">
          {user && (
            <p className="mb-4 inline-flex max-w-full items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100 sm:px-4 sm:text-xs">
              Hos geldin {fullName ?? 'degerli musterimiz'}
            </p>
          )}
          <h1 className="mb-4 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            EKO ile Alisveris Deneyimini Yeniden Kesfet
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-base text-emerald-50/90 sm:text-lg md:text-xl">
            Ozenle secilmis urunler, hizli teslimat ve modern deneyim tek platformda.
          </p>
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/products"
              className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:px-8"
            >
              Urunleri Kesfet
            </Link>
            {user ? (
              <Link
                href="/orders"
                className="inline-block rounded-lg border border-white/40 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20 sm:px-8"
              >
                Siparislerime Git
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-block rounded-lg border border-white/40 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20 sm:px-8"
              >
                Ucretsiz Uye Ol
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-transparent">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">Neden EKO?</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {/* Feature 1 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-[0_20px_40px_-30px_rgba(2,6,23,0.5)] sm:p-8">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">Hızlı Kargo</h3>
              <p className="text-gray-600">
                Siparişleriniz hızlı ve güvenli bir şekilde teslim edilir
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-[0_20px_40px_-30px_rgba(2,6,23,0.5)] sm:p-8">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">Güvenli Ödeme</h3>
              <p className="text-gray-600">
                Tüm ödemeleriniz şifreli ve güvenli altyapıda işlenir
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-[0_20px_40px_-30px_rgba(2,6,23,0.5)] sm:p-8">
              <div className="text-4xl mb-4">↩️</div>
              <h3 className="text-xl font-semibold mb-2">Kolay İade</h3>
              <p className="text-gray-600">
                30 gün içinde iade ve değişim garantisi sunuyoruz
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold leading-tight">Bugun Alisverise Basla</h2>
          <p className="mx-auto mb-6 max-w-2xl text-slate-300">
            Binlerce urun ve kampanya ile EKO her zaman yaninda.
          </p>
          <Link
            href={user ? '/cart' : '/products'}
            className="inline-block rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600 sm:px-8"
          >
            {user ? 'Sepete Git' : 'Urunleri Gozat'}
          </Link>
        </div>
      </section>
    </main>
  )
}
