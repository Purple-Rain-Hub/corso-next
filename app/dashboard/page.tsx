'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { useToast } from '@/app/components/ui/ToastProvider'

export default function Dashboard() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  // 🔍 GESTIONE ERRORI DAI PARAMETRI URL
  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError === 'access_denied') {
      showToast(
        'error', 
        'Non hai i permessi necessari per accedere alla sezione amministrativa.',
        5000
      )
      
      // Rimuovi il parametro error dall'URL
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header della Dashboard */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Ciao, {user?.user_metadata?.full_name || 'Utente'}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Benvenuto nella tua dashboard personale
          </p>
        </div>

        {/* Cards delle Informazioni Principali */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card Profilo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Il Tuo Profilo</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nome Completo</p>
                <p className="mt-1 text-sm text-gray-900">{user?.user_metadata?.full_name || 'Non specificato'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Membro dal</p>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('it-IT') : 'Non disponibile'}
                </p>
              </div>
            </div>
          </div>

          {/* Card Azioni Rapide */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Azioni Rapide</h3>
            <div className="space-y-3">
              <a
                href="/prodotti"
                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                🛍️ Sfoglia Prodotti
              </a>
              <a
                href="/prenotazioni"
                className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
              >
                📅 Le Tue Prenotazioni
              </a>
              <a
                href="/carrello"
                className="block w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
              >
                🛒 Carrello
              </a>
            </div>
          </div>

          {/* Card Statistiche */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Le Tue Statistiche</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Prenotazioni Totali</span>
                <span className="text-sm font-medium text-gray-900">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Ordini Completati</span>
                <span className="text-sm font-medium text-gray-900">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Ultimo Accesso</span>
                <span className="text-sm font-medium text-gray-900">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('it-IT') : 'Primo accesso'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Area Principale */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Attività Recente</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna attività recente</h3>
              <p className="text-gray-500">
                Le tue prenotazioni e ordini recenti appariranno qui.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 