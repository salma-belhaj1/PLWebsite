import React from 'react'
import { describe, expect, it, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { CartProvider, useCart } from './CartContext'

const wrapper = ({ children }: { children: React.ReactNode }) => <CartProvider>{children}</CartProvider>

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds items, updates quantity, and clears cart', () => {
    const product = {
      id: 1,
      name: 'Gift Box',
      price: 25,
      image: '/gift.png',
      category: 'gifts',
      rating: 4.8,
      stock_quantity: 5,
      status: 'in_stock',
    } as any

    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(product, undefined, 2)
    })

    expect(result.current.cartCount).toBe(2)
    expect(result.current.cartItems[0].quantity).toBe(2)

    act(() => {
      result.current.updateQuantity(1, undefined, 1)
    })

    expect(result.current.cartCount).toBe(3)
    expect(result.current.cartItems[0].quantity).toBe(3)

    act(() => {
      result.current.clearCart()
    })

    expect(result.current.cartCount).toBe(0)
    expect(result.current.cartItems).toHaveLength(0)
  })
})
