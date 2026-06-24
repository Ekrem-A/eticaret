'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Category, Product } from '@/types/database'

interface ProductFormData {
  name: string
  slug: string
  price: string
  stock: string
  category_id: string
  sku: string
  image_url: string
  description: string
  featured: boolean
  is_active: boolean
}

const emptyForm: ProductFormData = {
  name: '',
  slug: '',
  price: '',
  stock: '',
  category_id: '',
  sku: '',
  image_url: '',
  description: '',
  featured: false,
  is_active: true,
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function AdminProductsPage() {
  const { session } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormData>(emptyForm)

  const accessToken = session?.access_token

  const resetForm = () => {
    setSelectedProduct(null)
    setForm(emptyForm)
  }

  const headers = useMemo(() => {
    if (!accessToken) return undefined
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    }
  }, [accessToken])

  const loadProducts = async () => {
    if (!headers) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/products?search=${encodeURIComponent(search)}`, {
        headers,
      })
      const result = (await response.json()) as {
        success: boolean
        data?: Product[]
        error?: string
      }

      if (!response.ok || !result.success) {
        setError(result.error ?? 'Urunler yuklenemedi')
        return
      }

      setProducts(result.data ?? [])
    } catch {
      setError('Urunler yuklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const result = (await response.json()) as {
          success: boolean
          data?: Category[]
        }
        setCategories(result.data ?? [])
      } catch {
        setCategories([])
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers, search])

  const onEdit = (product: Product) => {
    setSelectedProduct(product)
    setForm({
      name: product.name,
      slug: product.slug,
      price: String(product.price),
      stock: String(product.stock),
      category_id: product.category_id,
      sku: product.sku ?? '',
      image_url: product.image_url ?? '',
      description: product.description ?? '',
      featured: product.featured,
      is_active: product.is_active,
    })
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!headers) return

    setSaving(true)
    setError('')

    const payload = {
      name: form.name,
      slug: form.slug,
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: form.category_id,
      sku: form.sku || null,
      image_url: form.image_url || null,
      description: form.description || null,
      featured: form.featured,
      is_active: form.is_active,
    }

    try {
      const response = await fetch(
        selectedProduct ? `/api/admin/products/${selectedProduct.id}` : '/api/admin/products',
        {
          method: selectedProduct ? 'PATCH' : 'POST',
          headers,
          body: JSON.stringify(payload),
        }
      )

      const result = (await response.json()) as { success: boolean; error?: string }

      if (!response.ok || !result.success) {
        setError(result.error ?? 'Kayit islemi basarisiz')
        return
      }

      resetForm()
      await loadProducts()
    } catch {
      setError('Kayit islemi basarisiz')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (productId: string) => {
    if (!headers) return
    const approved = window.confirm('Bu urunu silmek istediginize emin misiniz?')
    if (!approved) return

    setError('')

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers,
      })
      const result = (await response.json()) as { success: boolean; error?: string }

      if (!response.ok || !result.success) {
        setError(result.error ?? 'Silme islemi basarisiz')
        return
      }

      await loadProducts()
    } catch {
      setError('Silme islemi basarisiz')
    }
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <article className="lg:col-span-1 bg-white border border-slate-200 rounded-lg p-5 h-fit">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {selectedProduct ? 'Urun Duzenle' : 'Yeni Urun Ekle'}
        </h2>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            value={form.name}
            onChange={(event) => {
              const name = event.target.value
              setForm((prev) => ({
                ...prev,
                name,
                slug: selectedProduct ? prev.slug : slugify(name),
              }))
            }}
            placeholder="Urun adi"
            className="w-full px-3 py-2 rounded-md border border-slate-300"
            required
          />

          <input
            value={form.slug}
            onChange={(event) => setForm((prev) => ({ ...prev, slug: slugify(event.target.value) }))}
            placeholder="Slug"
            className="w-full px-3 py-2 rounded-md border border-slate-300"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.price}
              onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
              placeholder="Fiyat"
              type="number"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 rounded-md border border-slate-300"
              required
            />
            <input
              value={form.stock}
              onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
              placeholder="Stok"
              type="number"
              min="0"
              className="w-full px-3 py-2 rounded-md border border-slate-300"
              required
            />
          </div>

          <select
            value={form.category_id}
            onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))}
            className="w-full px-3 py-2 rounded-md border border-slate-300"
            required
          >
            <option value="">Kategori secin</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            value={form.sku}
            onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
            placeholder="SKU"
            className="w-full px-3 py-2 rounded-md border border-slate-300"
          />

          <input
            value={form.image_url}
            onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))}
            placeholder="Gorsel URL"
            className="w-full px-3 py-2 rounded-md border border-slate-300"
          />

          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Aciklama"
            className="w-full px-3 py-2 rounded-md border border-slate-300 min-h-24"
          />

          <div className="flex items-center gap-4">
            <label className="text-sm text-slate-700 flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))}
              />
              One Cikan
            </label>
            <label className="text-sm text-slate-700 flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
              />
              Aktif
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-slate-900 text-white disabled:opacity-60"
            >
              {saving ? 'Kaydediliyor...' : selectedProduct ? 'Guncelle' : 'Ekle'}
            </button>
            {selectedProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-md border border-slate-300 text-slate-700"
              >
                Iptal
              </button>
            )}
          </div>
        </form>
      </article>

      <article className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Urun Listesi</h2>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Urun ara..."
            className="px-3 py-2 rounded-md border border-slate-300 w-full max-w-sm"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md border border-red-300 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-12 rounded bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-2 pr-3">Urun</th>
                  <th className="py-2 pr-3">Fiyat</th>
                  <th className="py-2 pr-3">Stok</th>
                  <th className="py-2 pr-3">Durum</th>
                  <th className="py-2 pr-3">Islem</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">/{product.slug}</p>
                    </td>
                    <td className="py-2 pr-3">
                      {product.price.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </td>
                    <td className="py-2 pr-3">{product.stock}</td>
                    <td className="py-2 pr-3">
                      {product.is_active ? (
                        <span className="text-emerald-600 font-medium">Aktif</span>
                      ) : (
                        <span className="text-slate-500 font-medium">Pasif</span>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="px-2 py-1 rounded border border-slate-300 text-slate-700"
                        >
                          Duzenle
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="px-2 py-1 rounded border border-red-300 text-red-700"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 && (
              <p className="text-sm text-slate-500 py-8 text-center">Kayit bulunamadi.</p>
            )}
          </div>
        )}
      </article>
    </section>
  )
}
