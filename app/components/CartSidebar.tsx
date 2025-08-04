// Sidebar del carrello - gestisce visualizzazione e checkout degli elementi
'use client'

import { useCart } from '@/lib/context/CartContext'
import { useToast } from './ui/ToastProvider'

// Icone semplici con SVG
const Icons = {
  Euro: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  ),
  Pet: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  ShoppingCart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H21" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

interface CartSidebarProps {
  onClose: () => void
}

export default function CartSidebar({ onClose }: CartSidebarProps) {
  const { cartItems, removeFromCart, getTotalPrice, getItemCount, checkout } = useCart()
  const { showToast } = useToast()

  // Utility per formattazione orari e date
  const formatTime = (time: string) => {
    return time ? time.substring(0, 5) : '' //per togliere i secondi dall'orario
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('it-IT') //per formattare la data in italiano
  }

  // Gestione checkout con feedback utente
  const handleCheckout = async () => {
    try {
      const result = await checkout()
      showToast('success', `Prenotazioni confermate! Totale: ${cartItems.length} servizi`, 4000)
      onClose()
    } catch (error) {
      showToast('error', 'Errore nella conferma delle prenotazioni')
    }
  }

  const handleRemoveItem = async (id: number) => {
    try {
      await removeFromCart(id)
      showToast('success', 'Elemento rimosso dal carrello')
    } catch (error) {
      showToast('error', 'Errore nella rimozione dal carrello')
    }
  }

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
            <Icons.ShoppingCart />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Il Tuo Carrello</h3>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.ShoppingCart />
            </div>
            <p className="text-gray-500 mb-2">Il carrello è vuoto</p>
            <p className="text-sm text-gray-400">Aggiungi alcuni servizi per iniziare</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900 flex-1">{item.service.name}</h4>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-colors"
                      title="Rimuovi dal carrello"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Icons.Pet />
                      <span>{item.petName} ({item.petType})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.Calendar />
                      <span>{formatDate(item.bookingDate)} alle {formatTime(item.bookingTime)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-green-600 font-semibold">
                    <Icons.Euro />
                    <span>{item.service.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-gray-900">Totale:</span>
                <div className="flex items-center gap-1 text-2xl font-bold text-green-600">
                  <Icons.Euro />
                  <span>{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Icons.Check />
                Conferma Prenotazioni
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 