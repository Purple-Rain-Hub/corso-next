'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { CartItemWithService, CartItemInput } from '@/lib/types'

interface CartContextType {
  cartItems: CartItemWithService[]
  loading: boolean
  isAuthenticated: boolean
  addToCart: (item: CartItemInput) => Promise<void>
  removeFromCart: (id: number) => Promise<void>
  refreshCart: () => Promise<void>
  checkout: (customerInfo?: { name: string; email: string }) => Promise<any>
  getTotalPrice: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItemWithService[]>([])
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading } = useAuth() // 🔗 Integrazione con autenticazione
  const router = useRouter()

  const isAuthenticated = !!user && !authLoading //!! converte in booleano

  // 🔄 Carica il carrello quando l'utente è autenticato
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart()
    } else if (!authLoading) {
      // Se non è autenticato e l'auth non sta caricando, pulisci il carrello locale
      setCartItems([])
    }
  }, [isAuthenticated, authLoading])

  // 🔒 Gestione errori di autenticazione
  const handleAuthError = (error: any) => {
    console.error('Errore di autenticazione:', error)
    setCartItems([]) // Pulisci carrello locale
    router.push('/auth/login') // Reindirizza al login
  }

  const refreshCart = async () => {
    if (!isAuthenticated) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/cart')
      
      if (response.status === 401) {
        handleAuthError('Non autenticato')
        return
      }
      
      if (response.ok) {
        const items = await response.json()
        setCartItems(items.map((item: any) => ({
          ...item,
          bookingDate: new  Date(item.bookingDate) // Necessario per trasformare la stringa in data
        })))
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Errore nel caricamento del carrello')
      }
    } catch (error) {
      console.error('Errore nel caricamento del carrello:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (item: CartItemInput) => {
    if (!isAuthenticated) {
      handleAuthError('Devi essere autenticato per aggiungere al carrello')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          bookingDate: item.bookingDate.toISOString().split('T')[0] //converte la data in stringa
        }),
      })

      if (response.status === 401) {
        handleAuthError('Sessione scaduta')
        return
      }

      if (response.ok) {
        await refreshCart()
      } else {
        const errorData = await response.json().catch(() => ({})) //catch gestisce l'errore se la risposta non è valida
        throw new Error(errorData.error || 'Errore nell\'aggiunta al carrello')
      }
    } catch (error) {
      console.error('Errore nell\'aggiunta al carrello:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (id: number) => {
    if (!isAuthenticated) {
      handleAuthError('Devi essere autenticato per rimuovere dal carrello')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/cart?id=${id}`, {
        method: 'DELETE',
      })

      if (response.status === 401) {
        handleAuthError('Sessione scaduta')
        return
      }

      if (response.ok) {
        await refreshCart()
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Errore nella rimozione dal carrello')
      }
    } catch (error) {
      console.error('Errore nella rimozione dal carrello:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const checkout = async (customerInfo?: { name: string; email: string }) => {
    if (!isAuthenticated) {
      handleAuthError('Devi essere autenticato per effettuare il checkout')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerInfo
        }),
      })

      if (response.status === 401) {
        handleAuthError('Sessione scaduta durante il checkout')
        return
      }

      if (response.ok) {
        const result = await response.json()
        setCartItems([]) // Svuota il carrello locale
        return result
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Errore nel checkout')
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
    isAuthenticated,
    addToCart,
    removeFromCart,
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