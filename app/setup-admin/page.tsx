'use client'

import { useState, useEffect } from 'react'
import { UserRole } from '@/lib/auth/types'
import { ROLE_LABELS } from '@/lib/auth/roles'
import { useAdminAuth } from '@/lib/auth/useAdminAuth'
import { useToast } from '@/app/components/ui/ToastProvider'

interface User {
  id: string
  email: string
  role: UserRole
  fullName?: string
  isActive: boolean
  createdAt: string
}

export default function SetupAdminPage() {
  const { user } = useAdminAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [assigningRole, setAssigningRole] = useState<string | null>(null)

  // Carica utenti
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/setup/assign-role')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error('Errore nel caricamento degli utenti:', error)
      showToast('error', 'Errore nel caricamento degli utenti')
    } finally {
      setLoading(false)
    }
  }

  // Assegna ruolo
  const assignRole = async (email: string, role: UserRole) => {
    try {
      setAssigningRole(email)
      
      const response = await fetch('/api/admin/setup/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role })
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', 'Ruolo assegnato con successo!')
        fetchUsers() // Ricarica la lista
        
        // Se stiamo modificando l'utente corrente, suggeriamo di ricaricare
        if (user?.email === email) {
          showToast('info', 'Hai modificato il tuo ruolo. Ricarica la pagina per vedere le modifiche.', 8000)
        }
      } else {
        showToast('error', `Errore: ${data.error}`)
      }
    } catch (error) {
      console.error('Error assigning role:', error)
      showToast('error', 'Errore nell\'assegnazione del ruolo')
    } finally {
      setAssigningRole(null)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 mb-6">
            <div className="flex">
              <div className="text-yellow-400 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="text-lg font-medium text-yellow-800">
                  Pagina di Setup (Solo per Testing)
                </h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Questa pagina permette di assegnare ruoli admin agli utenti. 
                  <strong> Rimuovere in produzione!</strong>
                </p>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Setup Ruoli Admin
          </h1>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Caricamento utenti...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Istruzioni */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Come testare il sistema admin:</h3>
                <ol className="list-decimal list-inside text-blue-800 text-sm space-y-1">
                  <li>Assegna il ruolo "ADMIN" o "SUPER_ADMIN" al tuo account</li>
                  <li>Vai su <a href="/admin" className="underline font-medium">/admin</a> per accedere al pannello</li>
                  <li>Testa le funzionalità di gestione servizi e prenotazioni</li>
                </ol>
              </div>

              {/* Lista utenti */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Utenti Registrati ({users.length})
                </h2>
                
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Nessun utente registrato</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Registra prima un account dal sito
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Utente
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Ruolo Attuale
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Registrato
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Azioni
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((u) => (
                          <tr key={u.id} className={u.email === user?.email ? 'bg-blue-50' : ''}>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {u.email}
                                  {u.email === user?.email && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      Tu
                                    </span>
                                  )}
                                </div>
                                {u.fullName && (
                                  <div className="text-sm text-gray-500">{u.fullName}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                u.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-800' :
                                u.role === UserRole.ADMIN ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {ROLE_LABELS[u.role]}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(u.createdAt).toLocaleDateString('it-IT')}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end space-x-2">
                                {Object.values(UserRole).map((role) => (
                                  <button
                                    key={role}
                                    onClick={() => assignRole(u.email, role)}
                                    disabled={u.role === role || assigningRole === u.email}
                                    className={`px-3 py-1 text-xs rounded transition-colors ${
                                      u.role === role 
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : role === UserRole.SUPER_ADMIN
                                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                          : role === UserRole.ADMIN
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                                    }`}
                                  >
                                    {assigningRole === u.email ? 'Assegnando...' : ROLE_LABELS[role]}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Link utili */}
              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-900 mb-3">Link Utili</h3>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/admin"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    🏛️ Pannello Admin
                  </a>
                  <a
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    👤 Dashboard Utente
                  </a>
                  <a
                    href="/"
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    🏠 Homepage
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 