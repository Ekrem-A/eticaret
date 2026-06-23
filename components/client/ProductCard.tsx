'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types/database'
import { useCartStore } from '@/lib/stores/cartStore'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  const [showMessage, setShowMessage] = useState(false)

  const handleAddToCart = () => {
    addItem(product, 1)
    setShowMessage(true)
    setTimeout(() => setShowMessage(false), 2000)
  }

  const imageUrl = product.image_url || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22500%22 height=%22500%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22500%22 height=%22500%22/%3E%3C/svg%3E'
  const discountedPrice = product.price * 0.9 // 10% discount for demo

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.featured && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              ÖZEL
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400">
              {'★'.repeat(Math.round(product.rating))}
              {'☆'.repeat(5 - Math.round(product.rating))}
            </div>
            <span className="text-xs text-gray-500 ml-2">
              ({product.reviews_count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {product.price.toLocaleString('tr-TR', {
              style: 'currency',
              currency: 'TRY',
            })}
          </span>
          <span className="text-sm text-gray-500 line-through">
            {discountedPrice.toLocaleString('tr-TR', {
              style: 'currency',
              currency: 'TRY',
            })}
          </span>
        </div>

        {/* Stock */}
        <div className="mb-3">
          {product.stock > 0 ? (
            <span className="text-sm text-green-600 font-medium">
              Stokta ({product.stock})
            </span>
          ) : (
            <span className="text-sm text-red-600 font-medium">Stok Yok</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {product.stock === 0 ? 'Stok Yok' : 'Sepete Ekle'}
        </button>

        {/* Success Message */}
        {showMessage && (
          <p className="text-xs text-green-600 mt-2 text-center font-medium">
            ✓ Sepete eklendi
          </p>
        )}
      </div>
    </div>
  )
}
