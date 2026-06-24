'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

interface AdminStats {
  products: number
  activeProducts: number
  categories: number
  orders: number
  lowStockProducts: number
  paidRevenue: number
}

function formatCurrency(value: number) {
  return value.toLocaleString('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  })
}

export default function AdminDashboardPage() {
  const { session } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.access_token) {
        setLoading(false)
        return
      }

      setError('')
      setLoading(true)

      try {
        const response = await fetch('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        const result = (await response.json()) as {
          success: boolean
          data?: AdminStats
          error?: string
        }

        if (!response.ok || !result.success || !result.data) {
          setError(result.error ?? 'Istatistikler yuklenemedi')
          return
        }

        setStats(result.data)
      } catch {
        setError('Istatistikler yuklenemedi')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [session?.access_token])

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Genel Bakis</h2>
        <Link
          href="/admin/products"
          className="px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800"
        >
          Urunleri Yonet
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-md border border-red-300 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 rounded-lg bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm text-slate-600">Toplam Urun</p>
            <p className="text-2xl font-bold text-slate-900">{stats?.products ?? 0}</p>
          </article>
          <article className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm text-slate-600">Aktif Urun</p>
            <p className="text-2xl font-bold text-slate-900">{stats?.activeProducts ?? 0}</p>
          </article>
          <article className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm text-slate-600">Kategori</p>
            <p className="text-2xl font-bold text-slate-900">{stats?.categories ?? 0}</p>
          </article>
          <article className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm text-slate-600">Siparis</p>
            <p className="text-2xl font-bold text-slate-900">{stats?.orders ?? 0}</p>
          </article>
          <article className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm text-slate-600">Dusuk Stok</p>
            <p className="text-2xl font-bold text-amber-600">{stats?.lowStockProducts ?? 0}</p>
          </article>
          <article className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm text-slate-600">Odenen Ciro</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(stats?.paidRevenue ?? 0)}
            </p>
          </article>
        </div>
      )}
    </section>
  )
}
