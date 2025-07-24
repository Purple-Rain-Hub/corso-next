'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// Tipi TypeScript
interface Service {
  id: number
  name: string
  description: string
  price: number
  duration: number
}

interface CartItem {
  id: number
  sessionId: string
  serviceId: number
  petName: string
  petType: string
  bookingDate: Date
  bookingTime: string
  customerName?: string
  customerEmail?: string
  service: Service
}

interface CartContextType {
  cartItems: CartItem[]
  loading: boolean
  sessionId: string
  addToCart: (item: Omit<CartItem, 'id' | 'sessionId' | 'service'>) => Promise<void>
  removeFromCart: (id: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  checkout: (customerInfo?: { name: string; email: string }) => Promise<any>
  getTotalPrice: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Genera un ID di sessione unico
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')

  // Inizializza sessionId dal localStorage o crea uno nuovo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedSessionId = localStorage.getItem('cart-session-id')
      if (!storedSessionId) {
        storedSessionId = generateSessionId()
        localStorage.setItem('cart-session-id', storedSessionId)
      }
      setSessionId(storedSessionId)
    }
  }, [])

  // Carica il carrello quando sessionId è disponibile
  useEffect(() => {
    if (sessionId) {
      refreshCart()
    }
  }, [sessionId])

  const refreshCart = async () => {
    if (!sessionId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/cart?sessionId=${sessionId}`)
      if (response.ok) {
        const items = await response.json()
        setCartItems(items.map((item: any) => ({
          ...item,
          bookingDate: new Date(item.bookingDate)
        })))
      }
    } catch (error) {
      console.error('Errore nel caricamento del carrello:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (item: Omit<CartItem, 'id' | 'sessionId' | 'service'>) => {
    setLoading(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          sessionId,
          bookingDate: item.bookingDate.toISOString()
        }),
      })

      if (response.ok) {
        await refreshCart()
      } else {
        throw new Error('Errore nell\'aggiunta al carrello')
      }
    } catch (error) {
      console.error('Errore nell\'aggiunta al carrello:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (id: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cart?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await refreshCart()
      } else {
        throw new Error('Errore nella rimozione dal carrello')
      }
    } catch (error) {
      console.error('Errore nella rimozione dal carrello:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    // Rimuovi tutti gli elementi uno per uno
    for (const item of cartItems) {
      await removeFromCart(item.id)
    }
  }

  const checkout = async (customerInfo?: { name: string; email: string }) => {
    setLoading(true)
    try {
      const response = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          customerInfo
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setCartItems([]) // Svuota il carrello locale
        return result
      } else {
        throw new Error('Errore nel checkout')
      }
    } catch (error) {
      console.error('Errore nel checkout:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.service.price, 0)
  }

  const getItemCount = () => {
    return cartItems.length
  }

  const value: CartContextType = {
    cartItems,
    loading,
    sessionId,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCart,
    checkout,
    getTotalPrice,
    getItemCount
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart deve essere usato all\'interno di un CartProvider')
  }
  return context
} 