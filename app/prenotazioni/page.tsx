'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/context/CartContext'

// Tipi TypeScript
interface Service {
  id: number
  name: string
  description: string
  price: number
  duration: number
}

// Icone semplici con SVG
const Icons = {
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
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
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

export default function PrenotazioniPage() {
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showCart, setShowCart] = useState(false)

  const { cartItems, addToCart, removeFromCart, getTotalPrice, getItemCount, checkout } = useCart()

  // Form data
  const [formData, setFormData] = useState({
    petName: '',
    petType: '',
    bookingDate: '',
    bookingTime: '',
    customerName: '',
    customerEmail: ''
  })

  // Carica servizi dal database
  useEffect(() => {
    async function loadServices() {
      try {
        const response = await fetch('/api/services')
        if (response.ok) {
          const data = await response.json()
          setServices(data)
        }
      } catch (error) {
        console.error('Errore nel caricamento dei servizi:', error)
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [])

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setShowBookingForm(true)
  }

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedService) return

    try {
      await addToCart({
        serviceId: selectedService.id,
        petName: formData.petName,
        petType: formData.petType,
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
      setShowBookingForm(false)
      setSelectedService(null)
      
      // Notifica di successo più elegante
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slide-in'
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Servizio aggiunto al carrello!
      `
      document.body.appendChild(notification)
      setTimeout(() => notification.remove(), 3000)
    } catch (error) {
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in'
      notification.textContent = 'Errore nell\'aggiunta al carrello'
      document.body.appendChild(notification)
      setTimeout(() => notification.remove(), 3000)
    }
  }

  const handleCheckout = async () => {
    try {
      const result = await checkout()
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slide-in'
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Prenotazioni confermate! Totale: ${cartItems.length} servizi
      `
      document.body.appendChild(notification)
      setTimeout(() => notification.remove(), 4000)
      setShowCart(false)
    } catch (error) {
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
      notification.textContent = 'Errore nella conferma delle prenotazioni'
      document.body.appendChild(notification)
      setTimeout(() => notification.remove(), 3000)
    }
  }

  const formatTime = (time: string) => {
    return time ? time.substring(0, 5) : ''
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('it-IT')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto animate-spin" style={{animationDelay: '0.3s', animationDirection: 'reverse'}}></div>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Icons.Sparkles />
            <p className="text-lg font-medium">Caricamento servizi...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header migliorato */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                <Icons.Pet />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PetShop Premium
                </h1>
                <p className="text-sm text-gray-600">Servizi di qualità per i tuoi amici a quattro zampe</p>
              </div>
            </div>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
            >
              <Icons.ShoppingCart />
              <span className="hidden sm:inline">Carrello</span>
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-7 w-7 flex items-center justify-center font-bold animate-pulse">
                  {getItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista Servizi migliorata */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <Icons.Sparkles />
              <h2 className="text-2xl font-bold text-gray-900">Servizi Disponibili</h2>
            </div>
            
            {services.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.Pet />
                </div>
                <p className="text-gray-500 text-lg">Nessun servizio disponibile al momento</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {services.map((service, index) => (
                  <div 
                    key={service.id} 
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:-translate-y-1 border border-gray-100"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                            <Icons.Pet />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{service.description}</p>
                      </div>
                      <div className="text-right ml-6">
                        <div className="flex items-center gap-1 text-2xl font-bold text-green-600 mb-2">
                          <Icons.Euro />
                          <span>{service.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                          <Icons.Clock />
                          <span>{service.duration} min</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleServiceSelect(service)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Icons.Calendar />
                      Prenota Servizio
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Carrello Sidebar migliorato */}
          {showCart && (
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
                              onClick={() => removeFromCart(item.id)}
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
          )}
        </div>
      </div>

      {/* Modal Form Prenotazione migliorato */}
      {showBookingForm && selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl transform animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                  <Icons.Pet />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Prenota Servizio</h3>
                  <p className="text-sm text-gray-600">{selectedService.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBookingForm(false)
                  setSelectedService(null)
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <Icons.X />
              </button>
            </div>
            
            <form onSubmit={handleAddToCart} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome del Pet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.petName}
                  onChange={(e) => setFormData({...formData, petName: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Es. Buddy"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo di Animale *
                </label>
                <select
                  required
                  value={formData.petType}
                  onChange={(e) => setFormData({...formData, petType: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Seleziona tipo</option>
                  <option value="Cane">🐕 Cane</option>
                  <option value="Gatto">🐱 Gatto</option>
                  <option value="Coniglio">🐰 Coniglio</option>
                  <option value="Uccello">🐦 Uccello</option>
                  <option value="Altro">🐾 Altro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data Prenotazione *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({...formData, bookingDate: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Orario *
                </label>
                <select
                  required
                  value={formData.bookingTime}
                  onChange={(e) => setFormData({...formData, bookingTime: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Seleziona orario</option>
                  <option value="09:00">🌅 09:00</option>
                  <option value="10:00">🌅 10:00</option>
                  <option value="11:00">🌅 11:00</option>
                  <option value="14:00">☀️ 14:00</option>
                  <option value="15:00">☀️ 15:00</option>
                  <option value="16:00">☀️ 16:00</option>
                  <option value="17:00">🌅 17:00</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Cliente
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="tua@email.com"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false)
                    setSelectedService(null)
                  }}
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
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
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
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
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