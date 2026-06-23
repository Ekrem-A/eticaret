// User Types
export interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  role: 'user' | 'admin'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Category Types
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

// Product Types
export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  category_id: string
  image_url: string | null
  images: string[]
  sku: string | null
  rating: number
  reviews_count: number
  featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// Cart Item Types
export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'completed' | 'failed'

export interface Order {
  id: string
  user_id: string
  order_number: string
  total_amount: number
  shipping_cost: number
  tax: number
  status: OrderStatus
  payment_method: string | null
  payment_status: PaymentStatus
  shipping_address: ShippingAddress | null
  notes: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface ShippingAddress {
  full_name: string
  phone: string
  address: string
  city: string
  postal_code: string
  country: string
}

// Order Item Types
export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  created_at: string
  product?: Product
}

// Review Types
export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  user?: User
}

// Coupon Types
export type DiscountType = 'percentage' | 'fixed'

export interface Coupon {
  id: string
  code: string
  discount_type: DiscountType
  discount_value: number
  expiry_date: string | null
  max_uses: number | null
  current_uses: number
  is_active: boolean
  created_at: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}
