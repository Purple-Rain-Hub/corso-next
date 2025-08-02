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

export default function UtentiPage() {
  const { user } = useAdminAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [assigningRole, setAssigningRole] = useState<string | null>(null)

  // Carica utenti
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
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
      
      const response = await fetch('/api/admin/users', {
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestione Utenti
        </h1>
        <p className="text-gray-600 mt-2">
          Visualizza e gestisci gli utenti registrati nel sistema
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento utenti...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {/* Header della tabella */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Utenti Registrati ({users.length})
            </h2>
          </div>

          {/* Contenuto */}
          <div className="overflow-hidden">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">👥</div>
                <p className="text-gray-600 text-lg">Nessun utente registrato</p>
                <p className="text-sm text-gray-500 mt-2">
                  Gli utenti appariranno qui dopo essersi registrati
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ruolo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registrato
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className={u.email === user?.email ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {u.email}
                                {u.email === user?.email && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Tu
                                  </span>
                                )}
                              </div>
                            </div>
                            {u.fullName && (
                              <div className="text-sm text-gray-500">{u.fullName}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            u.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-800' :
                            u.role === UserRole.ADMIN ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ROLE_LABELS[u.role]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {u.isActive ? 'Attivo' : 'Inattivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString('it-IT')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
        </div>
      )}
    </div>
  )
} 