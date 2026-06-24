'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useProducts } from '@/lib/hooks/useProducts'
import { ProductCard } from '@/components/client/ProductCard'

function ProductsContent() {
  const searchParams = useSearchParams()
  const [sort, setSort] = useState<'price-asc' | 'price-desc' | 'newest'>('newest')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const categoryId = searchParams.get('category') || undefined

  const { products, categories, loading, error, total } = useProducts({
    categoryId,
    search,
    sort,
    page,
    perPage: 12,
  })

  const totalPages = Math.ceil(total / 12)

  const handleSortChange = (value: string) => {
    if (value === 'price-asc' || value === 'price-desc' || value === 'newest') {
      setSort(value)
      setPage(1)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ürünler</h1>
          <p className="text-gray-600">{total} ürün bulundu</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-8">
          {/* Sidebar - Filters */}
          <div className="md:col-span-1">
            <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:sticky md:top-4">
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Ara
                </label>
                <input
                  type="text"
                  placeholder="Ürün adı..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Kategoriler
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-1 md:block md:space-y-2">
                  <Link
                    href="/products"
                    className={`shrink-0 rounded px-3 py-2 text-sm md:block ${
                      !categoryId
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Tüm Ürünler
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?category=${category.id}`}
                      className={`shrink-0 rounded px-3 py-2 text-sm md:block ${
                        categoryId === category.id
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Sıralama
                </label>
                <select
                  value={sort}
                  onChange={(e) => {
                    handleSortChange(e.target.value)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                  <option value="newest">En Yeni</option>
                  <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                  <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-200 rounded-lg h-64 animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Ürün bulunamadı</p>
              </div>
            ) : (
              <>
                {/* Products */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`min-w-10 rounded px-3 py-2 ${
                            page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 py-6 sm:py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      }
    >
      <ProductsContent />
    </Suspense>
  )
}
