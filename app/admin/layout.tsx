'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition ${
        active
          ? 'bg-slate-900 text-white'
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {label}
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { loading, user, isAdmin, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      router.replace('/')
    }
  }, [loading, user, isAdmin, router])

  if (loading || !user || !isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Yukleniyor...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-sm text-slate-600">Magaza yonetimi</p>
          </div>
          <button
            onClick={async () => {
              await signOut()
              router.push('/login')
            }}
            className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Cikis Yap
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <nav className="mb-6 flex items-center gap-2">
          <NavItem href="/admin" label="Genel Bakis" active={pathname === '/admin'} />
          <NavItem
            href="/admin/products"
            label="Urunler"
            active={pathname.startsWith('/admin/products')}
          />
          <NavItem
            href="/admin/orders"
            label="Siparisler"
            active={pathname.startsWith('/admin/orders')}
          />
        </nav>
        {children}
      </div>
    </main>
  )
}
