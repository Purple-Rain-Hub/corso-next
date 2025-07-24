'use client'

import { useCart } from '@/lib/context/CartContext'
import Link from 'next/link'

export default function CarrelloPage() {
  const { cartItems, loading, removeFromCart, getTotalPrice } = useCart()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento carrello...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Il tuo Carrello</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Il tuo carrello è vuoto
            </h2>
            <p className="text-gray-600 mb-8">
              Aggiungi alcuni servizi per i tuoi amici pelosi!
            </p>
            <Link
              href="/prenotazioni"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Scopri i Servizi
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Lista dei prodotti nel carrello */}
            <div className="bg-white rounded-lg shadow-sm">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.service.name}
                      </h3>
                      <p className="text-gray-600 mt-1">{item.service.description}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        <p><strong>Animale:</strong> {item.petName} ({item.petType})</p>
                        <p><strong>Data:</strong> {item.bookingDate.toLocaleDateString('it-IT')}</p>
                        <p><strong>Orario:</strong> {item.bookingTime}</p>
                        <p><strong>Durata:</strong> {item.service.duration} minuti</p>
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-xl font-bold text-blue-600">
                        €{item.service.price.toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm transition-colors"
                      >
                        Rimuovi
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Riepilogo totale */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Totale:</span>
                <span className="text-blue-600">€{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="mt-6">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                  Procedi al Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 