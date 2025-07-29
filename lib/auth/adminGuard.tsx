'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAdminAuth } from './useAdminAuth'
import type { Permission } from '@/lib/auth/types'

interface AdminGuardProps {
  children: React.ReactNode
  requiredPermission?: Permission
  fallbackUrl?: string
  loadingComponent?: React.ReactNode
  showAccessDenied?: boolean
}

// Componente di caricamento di default
const DefaultLoadingComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Verifica autorizzazioni...</p>
    </div>
  </div>
)

// Componente di errore migliorato
const ErrorComponent = ({ 
  error, 
  onRetry, 
  onRedirect 
}: { 
  error: string
  onRetry: () => void
  onRedirect: () => void 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto px-4">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Errore di Autenticazione</h1>
      <p className="text-gray-600 mb-8">{error}</p>
      <div className="space-y-3">
        <button 
          onClick={onRetry}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Riprova
        </button>
        <button 
          onClick={onRedirect}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Torna alla Dashboard
        </button>
      </div>
    </div>
  </div>
)

// Componente di accesso negato migliorato
const AccessDeniedComponent = ({ 
  requiredPermission,
  onRedirect 
}: { 
  requiredPermission?: Permission
  onRedirect: () => void 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto px-4">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Accesso Negato</h1>
      <p className="text-gray-600 mb-4">
        Non hai i permessi necessari per accedere a questa sezione.
      </p>
      {requiredPermission && (
        <p className="text-sm text-gray-500 mb-8">
          Permesso richiesto: <code className="bg-gray-100 px-2 py-1 rounded">{requiredPermission}</code>
        </p>
      )}
      <button 
        onClick={onRedirect}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Torna alla Dashboard
      </button>
    </div>
  </div>
)

export function AdminGuard({ 
  children, 
  requiredPermission,
  fallbackUrl = '/dashboard',
  loadingComponent,
  showAccessDenied = true
}: AdminGuardProps) {
  const { isAdmin, loading, hasPermission, error, isAuthenticated, user } = useAdminAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hasRedirected, setHasRedirected] = useState(false)

  // 🔍 GESTIONE ERRORI DAI PARAMETRI URL
  //todo: controllare se è necessario questo useEffect
  useEffect(() => { 
    const urlError = searchParams.get('error')
    if (urlError === 'access_denied') {
      // Errore dal middleware - accesso negato
      return // Mostra il componente di accesso negato
    }
  }, [searchParams])

  // 🔄 GESTIONE REDIRECT con logica robusta anti-race condition
  useEffect(() => {
    // Condizioni per redirect sicuro:
    // 1. Non in loading
    // 2. Utente autenticato (per evitare redirect durante il caricamento iniziale)
    // 3. User object processato (non null)
    // 4. Non è admin
    // 5. Non abbiamo già fatto redirect
    // 6. Nessun errore
    const shouldRedirect = !loading && 
                          isAuthenticated && 
                          user !== null && 
                          !isAdmin && 
                          !hasRedirected && 
                          !error
    
    if (shouldRedirect) {
      setHasRedirected(true)
      router.replace(fallbackUrl)
    }
  }, [isAdmin, loading, isAuthenticated, user, router, fallbackUrl, hasRedirected, error])

  // 🔄 RETRY AUTOMATICO per errori temporanei (ora ricarica la pagina)
  const handleRetry = () => {
    window.location.reload()
  }

  const handleRedirect = () => {
    router.push(fallbackUrl)
  }

  // Mostra loading durante la verifica
  if (loading) {
    return loadingComponent || <DefaultLoadingComponent />
  }

  // 🚨 GESTIONE ERRORI
  if (error) {
    return (
      <ErrorComponent 
        error={error}
        onRetry={handleRetry}
        onRedirect={handleRedirect}
      />
    )
  }

  // 🚫 ACCESSO NEGATO dal middleware o parametri URL
  if (searchParams.get('error') === 'access_denied') {
    if (!showAccessDenied) return null
    return (
      <AccessDeniedComponent 
        requiredPermission={requiredPermission}
        onRedirect={handleRedirect}
      />
    )
  }

  // Se l'utente è processato e non è admin, non mostrare nulla (il redirect è già attivo)
  if (isAuthenticated && user !== null && !isAdmin) {
    return null
  }

  // Se è richiesto un permesso specifico, verificalo
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (!showAccessDenied) return null
    return (
      <AccessDeniedComponent 
        requiredPermission={requiredPermission}
        onRedirect={handleRedirect}
      />
    )
  }

  // Se tutto è ok, mostra il contenuto
  return <>{children}</>
}
