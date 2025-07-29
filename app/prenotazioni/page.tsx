'use client'

import { useState, useEffect, useMemo } from 'react'
import { useCart } from '@/lib/context/CartContext'
import { useToast } from '@/app/components/ui/ToastProvider'
import { Service } from '@/lib/types'
import ServiceCard from '../components/ServiceCard'
import CartSidebar from '../components/CartSidebar'
import BookingForm from '../components/BookingForm'

// Icone semplici con SVG
const Icons = {
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
  const [loadError, setLoadError] = useState(false)

  const { getItemCount } = useCart()
  const { showToast } = useToast()

  // Carica servizi dal database
  useEffect(() => {
    async function loadServices() {
      try {
        const response = await fetch('/api/services')
        if (response.ok) {
          const data = await response.json()
          setServices(data)
          setLoadError(false)
        } else {
          setLoadError(true)
          showToast('error', 'Errore nel caricamento dei servizi. Riprova più tardi.')
        }
      } catch (error) {
        console.error('Errore nel caricamento dei servizi:', error)
        setLoadError(true)
        showToast('error', 'Impossibile caricare i servizi. Controlla la connessione.')
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

  const handleBookingFormClose = () => {
    setShowBookingForm(false)
    setSelectedService(null)
  }

  const numero_servizi_premium = useMemo(() => {
    return services.filter((service) => service.price > 20).length
  }, [services])

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
              <h2 className="text-2xl font-bold text-gray-900">Servizi Disponibili ({numero_servizi_premium})</h2>
            </div>
            
            {services.length === 0 && !loadError ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.Pet />
                </div>
                <p className="text-gray-500 text-lg">Nessun servizio disponibile al momento</p>
              </div>
            ) : loadError ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-500 text-lg mb-4">Errore nel caricamento dei servizi</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Ricarica la pagina
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {services.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onSelect={handleServiceSelect}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Carrello Sidebar migliorato */}
          {showCart && (
            <CartSidebar onClose={() => setShowCart(false)} />
          )}
        </div>
      </div>

      {/* Modal Form Prenotazione migliorato */}
      {showBookingForm && selectedService && (
        <BookingForm 
          service={selectedService}
          onClose={handleBookingFormClose}
        />
      )}
    </div>
  )
} 