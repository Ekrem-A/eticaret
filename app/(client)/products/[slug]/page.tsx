'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Product } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/lib/stores/cartStore'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { addItem } = useCartStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [cartAdded, setCartAdded] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single()

        if (error) throw error
        setProduct(data)
      } catch (err: any) {
        console.error('Error fetching product:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity)
      setCartAdded(true)
      setTimeout(() => setCartAdded(false), 2000)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-4" />
            <div className="h-8 bg-gray-200 rounded mb-2" style={{ width: '60%' }} />
            <div className="h-4 bg-gray-200 rounded" style={{ width: '40%' }} />
          </div>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error || 'Ürün bulunamadı'}</p>
            <Link href="/products" className="text-blue-600 hover:underline">
              Ürünlere Geri Dön
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const imageUrl = product.image_url || '/images/placeholder.jpg'

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/products" className="text-blue-600 hover:underline">
            Ürünler
          </Link>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-md p-8">
          {/* Image */}
          <div>
            <div className="relative h-96 w-full bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Additional Images */}
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {product.images.map((img, idx) => (
                  <div key={idx} className="relative h-20 bg-gray-100 rounded">
                    <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {/* Badge */}
            {product.featured && (
              <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
                ÖZEL
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-lg">
                  {'★'.repeat(Math.round(product.rating))}
                  {'☆'.repeat(5 - Math.round(product.rating))}
                </div>
                <span className="text-gray-600 ml-3">
                  {product.rating.toFixed(1)} ({product.reviews_count} yorum)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {product.price.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Ürün Açıklaması</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* SKU */}
            {product.sku && (
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  <strong>SKU:</strong> {product.sku}
                </p>
              </div>
            )}

            {/* Stock */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <p className="text-green-600 font-medium">
                  ✓ Stokta ({product.stock} adet)
                </p>
              ) : (
                <p className="text-red-600 font-medium">✗ Stok Yok</p>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            {product.stock > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      min="1"
                      max={product.stock}
                      className="w-16 text-center border-0 focus:ring-0 outline-none"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Sepete Ekle
                  </button>
                </div>

                {cartAdded && (
                  <p className="text-green-600 text-sm mt-2 font-medium">
                    ✓ {quantity} adet sepete eklendi
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
