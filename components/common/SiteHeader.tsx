"use client"

import Link from 'next/link'
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useCartStore } from '@/lib/stores/cartStore'

const guestNavLinks = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/products', label: 'Urunler' },
  { href: '/cart', label: 'Sepet' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { user, isAdmin, signOut } = useAuth()
  const syncOwner = useCartStore((state) => state.syncOwner)
  const clearCart = useCartStore((state) => state.clearCart)
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const totalItems = useCartStore((state) => state.getTotalItems())

  useEffect(() => {
    syncOwner(user?.id ?? null)
  }, [syncOwner, user?.id])

  const userDisplayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Kullanici'

  const navLinks = useMemo(() => {
    const links = [...guestNavLinks]

    if (user) {
      links.push({ href: '/orders', label: 'Siparislerim' })
    }

    if (isAdmin) {
      links.push({ href: '/admin', label: 'Admin' })
    }

    return links
  }, [user, isAdmin])

  const linkClass = (href: string) => {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href))
    return `rounded-lg px-3 py-2 text-sm font-medium transition ${
      active
        ? 'bg-emerald-100 text-emerald-800'
        : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
    }`
  }

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/70 bg-white/85 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-300 to-transparent" />
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 py-3 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex items-start justify-between gap-3 md:flex-1 md:items-center">
            <Link
              href="/"
              className="group flex min-w-0 items-center gap-3"
              aria-label="EKO ana sayfa"
            >
              <span className="grid h-10 w-10 shrink-0 place-content-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 text-lg font-black text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,0.85)]">
              E
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">
                  EKO
                </p>
                <p className="text-base leading-tight font-semibold text-slate-900 transition group-hover:text-emerald-700 sm:text-lg">
                  Modern E-Ticaret
                </p>
              </div>
            </Link>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 md:hidden">
              <Link
                href="/cart"
                className="relative rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                Sepet
                {isClient && totalItems > 0 && (
                  <span className="ml-2 inline-grid min-w-5 place-content-center rounded-full bg-emerald-500 px-1.5 text-xs text-white">
                    {totalItems}
                  </span>
                )}
              </Link>
              {user ? (
                <button
                  onClick={async () => {
                    clearCart()
                    await signOut()
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cikis
                </button>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  Giris
                </Link>
              )}
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex md:flex-1 md:justify-center">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex md:flex-1 md:justify-end">
            <Link
              href="/cart"
              className="relative rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              Sepet
              {isClient && totalItems > 0 && (
                <span className="ml-2 inline-grid min-w-5 place-content-center rounded-full bg-emerald-500 px-1.5 text-xs text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <span className="hidden rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 lg:inline-block">
                  Merhaba, {userDisplayName}
                </span>
                <button
                  onClick={async () => {
                    clearCart()
                    await signOut()
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cikis
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  Giris Yap
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(20,184,166,1)] transition hover:from-emerald-600 hover:to-teal-600"
                >
                  Kayit Ol
                </Link>
              </>
            )}
          </div>
        </div>

        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${linkClass(item.href)} shrink-0 whitespace-nowrap`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
