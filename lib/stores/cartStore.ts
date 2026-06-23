import { create } from 'zustand'
import { CartItem, Product } from '@/types/database'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product: Product, quantity: number) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.product_id === product.id)

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.product_id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        }
      }

      return {
        items: [
          ...state.items,
          {
            id: `temp-${Date.now()}`,
            user_id: '',
            product_id: product.id,
            quantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product,
          },
        ],
      }
    }),

  removeItem: (productId: string) =>
    set((state) => ({
      items: state.items.filter((item) => item.product_id !== productId),
    })),

  updateQuantity: (productId: string, quantity: number) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      ),
    })),

  clearCart: () => set({ items: [] }),

  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => total + (item.product?.price || 0) * item.quantity,
      0
    )
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0)
  },
}))
