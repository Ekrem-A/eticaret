import Link from 'next/link'

const footerLinks = [
  { href: '/products', label: 'Urunler' },
  { href: '/login', label: 'Giris Yap' },
  { href: '/register', label: 'Kayit Ol' },
]

export function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-emerald-100 bg-slate-950 text-slate-300">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">EKO</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Dijital Magazaniz Icin Temiz ve Hizli Altyapi</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
            EKO ile urunlerinizi modern bir deneyimle sergileyin, siparislerinizi kolayca yonetin.
          </p>
        </div>

        <div className="md:justify-self-end">
          <h3 className="text-sm font-semibold text-white">Hizli Linkler</h3>
          <ul className="mt-3 space-y-2">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-slate-300 transition hover:text-emerald-300">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EKO. Tum haklari saklidir.</p>
          <p>Turkiye merkezli modern e-ticaret deneyimi</p>
        </div>
      </div>
    </footer>
  )
}
