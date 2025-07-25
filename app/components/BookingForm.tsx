'use client'

import { useState } from 'react'
import { Service } from '@/lib/types'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/auth/context'
import { useToast } from './ui/ToastProvider'

// Icone semplici con SVG
const Icons = {
  Pet: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

interface BookingFormProps {
  service: Service
  onClose: () => void
  onSuccess?: () => void
}

export default function BookingForm({ service, onClose, onSuccess }: BookingFormProps) {
  const { addToCart, isAuthenticated } = useCart()
  const { showToast } = useToast()

  // Form data
  const [formData, setFormData] = useState({
    petName: '',
    petType: '',
    bookingDate: '',
    bookingTime: '',
    customerName: '',
    customerEmail: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 🔒 Controllo autenticazione con messaggio più chiaro
    if (!isAuthenticated) {
      showToast('error', 'Devi essere autenticato per aggiungere servizi al carrello. Effettua l\'accesso per continuare.')
      return
    }

    try {
      await addToCart({
        serviceId: service.id,
        petName: formData.petName,
        petType: formData.petType as any, // Il tipo viene validato dal backend
        bookingDate: new Date(formData.bookingDate),
        bookingTime: formData.bookingTime,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail
      })

      // Reset form
      setFormData({
        petName: '',
        petType: '',
        bookingDate: '',
        bookingTime: '',
        customerName: '',
        customerEmail: ''
      })

      showToast('success', 'Servizio aggiunto al carrello!')
      onClose()
      onSuccess?.()

    } catch (error) {
      showToast('error', 'Errore nell\'aggiunta al carrello')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl transform animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <Icons.Pet />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Prenota Servizio</h3>
              <p className="text-sm text-gray-600">{service.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <Icons.X />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome del Pet *
            </label>
            <input
              type="text"
              required
              maxLength={50}
              value={formData.petName}
              onChange={(e) => setFormData({...formData, petName: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
              placeholder="Es. Buddy"
            />
            <p className="text-xs text-gray-500 mt-1">
              📝 Max 50 caratteri - Solo lettere, spazi, apostrofi e trattini
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo di Animale *
            </label>
            <select
              required
              value={formData.petType}
              onChange={(e) => setFormData({...formData, petType: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
            >
              <option value="" className="text-gray-500">Seleziona tipo</option>
              <option value="Cane" className="text-gray-900">🐕 Cane</option>
              <option value="Gatto" className="text-gray-900">🐱 Gatto</option>
              <option value="Coniglio" className="text-gray-900">🐰 Coniglio</option>
              <option value="Uccello" className="text-gray-900">🐦 Uccello</option>
              <option value="Criceto" className="text-gray-900">🐹 Criceto</option>
              <option value="Pesce" className="text-gray-900">🐠 Pesce</option>
              <option value="Tartaruga" className="text-gray-900">🐢 Tartaruga</option>
              <option value="Furetto" className="text-gray-900">🦫 Furetto</option>
              <option value="Altro" className="text-gray-900">🐾 Altro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Data Prenotazione *
            </label>
            <input
              type="date"
              required
              min={(() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                return tomorrow.toISOString().split('T')[0]
              })()}
              value={formData.bookingDate}
              onChange={(e) => setFormData({...formData, bookingDate: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              ⚠️ Le prenotazioni devono essere effettuate con almeno un giorno di anticipo
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Orario *
            </label>
            <select
              required
              value={formData.bookingTime}
              onChange={(e) => setFormData({...formData, bookingTime: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
            >
              <option value="" className="text-gray-500">Seleziona orario</option>
              <option value="08:00" className="text-gray-900">🌅 08:00</option>
              <option value="08:30" className="text-gray-900">🌅 08:30</option>
              <option value="09:00" className="text-gray-900">🌅 09:00</option>
              <option value="09:30" className="text-gray-900">🌅 09:30</option>
              <option value="10:00" className="text-gray-900">🌅 10:00</option>
              <option value="10:30" className="text-gray-900">🌅 10:30</option>
              <option value="11:00" className="text-gray-900">🌅 11:00</option>
              <option value="11:30" className="text-gray-900">🌅 11:30</option>
              <option value="14:00" className="text-gray-900">☀️ 14:00</option>
              <option value="14:30" className="text-gray-900">☀️ 14:30</option>
              <option value="15:00" className="text-gray-900">☀️ 15:00</option>
              <option value="15:30" className="text-gray-900">☀️ 15:30</option>
              <option value="16:00" className="text-gray-900">☀️ 16:00</option>
              <option value="16:30" className="text-gray-900">☀️ 16:30</option>
              <option value="17:00" className="text-gray-900">🌅 17:00</option>
              <option value="17:30" className="text-gray-900">🌅 17:30</option>
              <option value="18:00" className="text-gray-900">🌅 18:00</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              🕐 Orari di apertura: 08:00 - 18:00 (pausa pranzo: 12:00 - 14:00)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome Cliente
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
              placeholder="Il tuo nome"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Cliente
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
              placeholder="tua@email.com"
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Aggiungi al Carrello
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
} 