import React, { createContext, useContext, useEffect, useState } from 'react'
import { Product } from '../services/api'

export interface CartItem {
  product: Product
  selectedVariant?: string
  quantity: number
}

interface CartContextValue {
  cartItems: CartItem[]
  addToCart: (product: Product, selectedVariant?: string, quantity?: number) => void
  updateQuantity: (productId: number, variant: string | undefined, delta: number) => void
  removeItem: (productId: number, variant: string | undefined) => void
  clearCart: () => void
  cartCount: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem('pl_cart')
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('pl_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product: Product, selectedVariant?: string, quantity = 1) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((it) => it.product.id === product.id && it.selectedVariant === selectedVariant)
      if (idx > -1) {
        const copy = [...prev]
        copy[idx].quantity += quantity
        return copy
      }
      return [...prev, { product, selectedVariant, quantity }]
    })
    setIsOpen(true)
  }

  const updateQuantity = (productId: number, variant: string | undefined, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.selectedVariant === variant) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) }
          }
          return item
        })
        .filter((i) => i.quantity > 0)
    )
  }

  const removeItem = (productId: number, variant: string | undefined) => {
    setCartItems((prev) => prev.filter((i) => !(i.product.id === productId && i.selectedVariant === variant)))
  }

  const clearCart = () => setCartItems([])

  const cartCount = cartItems.reduce((s, it) => s + it.quantity, 0)

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, updateQuantity, removeItem, clearCart, cartCount, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false) }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export default CartProvider
