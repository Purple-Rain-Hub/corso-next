// Pulsante flottante per accesso rapido alle prenotazioni - visibile solo per utenti autenticati
'use client'
//questo è il pulsante che si trova in basso a destra e che porta alla pagina delle prenotazioni

import { useAuth } from '@/lib/auth/context'
import Link from 'next/link'
import { useState } from 'react'

export default function FloatingBookingButton() {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(true)

  // Non mostrare il button se l'utente non è autenticato
  if (!user) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isVisible && (
        <Link
          href="/prenotazioni/gestione"
          className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center transform hover:scale-110 animate-pulse hover:animate-none"
          title="Gestisci le tue prenotazioni"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" 
            />
          </svg>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Le Mie Prenotazioni
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        </Link>
      )}
      
      {/* Pulsante per nascondere/mostrare */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute -top-2 -left-2 bg-gray-600 hover:bg-gray-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors"
        title={isVisible ? 'Nascondi' : 'Mostra'}
      >
        {isVisible ? '−' : '+'}
      </button>
    </div>
  )
} 