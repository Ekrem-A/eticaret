'use client'

import { useState, useEffect } from 'react'
import { Product, Category } from '@/types/database'
import axios from 'axios'

interface UseProductsOptions {
  categoryId?: string
  search?: string
  sort?: 'price-asc' | 'price-desc' | 'newest'
  page?: number
  perPage?: number
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch categories
        const catRes = await axios.get('/api/categories')
        setCategories(catRes.data.data || [])

        // Fetch products with filters
        const params = new URLSearchParams({
          ...(options.categoryId && { categoryId: options.categoryId }),
          ...(options.search && { search: options.search }),
          sort: options.sort || 'newest',
          page: String(options.page || 1),
          perPage: String(options.perPage || 12),
        })

        const prodRes = await axios.get(`/api/products?${params}`)
        setProducts(prodRes.data.data || [])
        setTotal(prodRes.data.total || 0)
      } catch (err: unknown) {
        console.error('Failed to fetch data:', err)
        if (axios.isAxiosError(err)) {
          setError(err.message || 'Failed to fetch data')
        } else {
          setError('Failed to fetch data')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [options.categoryId, options.search, options.sort, options.page, options.perPage])

  return {
    products,
    categories,
    loading,
    error,
    total,
  }
}
