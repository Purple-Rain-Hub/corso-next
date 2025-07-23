'use client'

import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Caricamento...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard PetShop
            </h1>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Benvenuto nel tuo account!
              </h2>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">ID Utente:</span>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{user?.id}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Ultimo accesso:</span>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('it-IT') : 'Mai'}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Account creato:</span>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('it-IT') : 'Sconosciuto'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex space-x-4">
                  <button 
                    onClick={() => router.push('/')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Torna al negozio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 