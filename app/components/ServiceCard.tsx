// Card per visualizzazione servizi - mostra dettagli e permette prenotazione
'use client'

import { Service } from '@/lib/types'

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
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

interface ServiceCardProps {
  service: Service
  onSelect: (service: Service) => void
  index?: number
}

export default function ServiceCard({ service, onSelect, index = 0 }: ServiceCardProps) {
  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:-translate-y-1 border border-gray-100"
      style={{animationDelay: `${index * 0.1}s`}} // Animazione staggered per le card
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
        onClick={() => onSelect(service)}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <Icons.Calendar />
        Prenota Servizio
      </button>
    </div>
  )
} 