"use client"

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Home() {
  const { user } = useAuth()
  const fullName = (user?.user_metadata?.full_name as string | undefined) || null

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white py-18">
        <div className="absolute -left-24 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="container mx-auto px-4 text-center">
          {user && (
            <p className="mb-4 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              Hos geldin {fullName ?? 'degerli musterimiz'}
            </p>
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            EKO ile Alisveris Deneyimini Yeniden Kesfet
          </h1>
          <p className="text-xl mb-6 text-emerald-50/90">
            Ozenle secilmis urunler, hizli teslimat ve modern deneyim tek platformda.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-emerald-700 hover:bg-emerald-50 transition"
            >
              Urunleri Kesfet
            </Link>
            {user ? (
              <Link
                href="/orders"
                className="inline-block rounded-lg border border-white/40 bg-white/10 px-8 py-3 font-semibold text-white hover:bg-white/20 transition"
              >
                Siparislerime Git
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-block rounded-lg border border-white/40 bg-white/10 px-8 py-3 font-semibold text-white hover:bg-white/20 transition"
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
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Neden EKO?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-[0_20px_40px_-30px_rgba(2,6,23,0.5)] text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">Hızlı Kargo</h3>
              <p className="text-gray-600">
                Siparişleriniz hızlı ve güvenli bir şekilde teslim edilir
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-[0_20px_40px_-30px_rgba(2,6,23,0.5)] text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">Güvenli Ödeme</h3>
              <p className="text-gray-600">
                Tüm ödemeleriniz şifreli ve güvenli altyapıda işlenir
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-[0_20px_40px_-30px_rgba(2,6,23,0.5)] text-center">
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
          <h2 className="text-3xl font-bold mb-4">Bugun Alisverise Basla</h2>
          <p className="mb-6 text-slate-300">
            Binlerce urun ve kampanya ile EKO her zaman yaninda.
          </p>
          <Link
            href={user ? '/cart' : '/products'}
            className="inline-block rounded-lg bg-emerald-500 px-8 py-3 font-semibold text-white hover:bg-emerald-600 transition"
          >
            {user ? 'Sepete Git' : 'Urunleri Gozat'}
          </Link>
        </div>
      </section>
    </main>
  )
}
