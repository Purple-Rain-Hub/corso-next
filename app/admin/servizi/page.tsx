'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAdminAuth } from '@/lib/auth/useAdminAuth'
import { useToast } from '@/app/components/ui/ToastProvider'
import EditServiceModal from './components/EditServiceModal'
import type { ServiceWithCounts } from '@/lib/types'

interface ServicesResponse {
  services: ServiceWithCounts[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function ServicesPage() {
  const { hasPermission } = useAdminAuth()
  const { showToast } = useToast()
  const [services, setServices] = useState<ServiceWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)
  
  // Stati per la modale di modifica
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceWithCounts | null>(null)

  // Carica servizi
  const fetchServices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search })
      })

      const response = await fetch(`/api/admin/services?${params}`)
      const data = await response.json()

      if (data.success) {
        setServices(data.data.services)
        setPagination(data.data.pagination)
      } else {
        console.error('Error loading services:', data.error)
        showToast('error', `Errore nel caricamento dei servizi: ${data.error}`)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      showToast('error', 'Errore nel caricamento dei servizi')
    } finally {
      setLoading(false)
    }
  }

  // Elimina servizio
  const deleteService = async (serviceId: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo servizio?')) {
      return
    }

    try {
      setDeleteLoading(serviceId)
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', 'Servizio eliminato con successo')
        // Ricarica la lista
        fetchServices()
      } else {
        showToast('error', `Errore: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      showToast('error', 'Errore nell\'eliminazione del servizio')
    } finally {
      setDeleteLoading(null)
    }
  }

  // Funzioni per la modifica
  const openEditModal = (service: ServiceWithCounts) => {
    setEditingService(service)
    setEditModalOpen(true)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setEditingService(null)
  }

  const updateService = async (serviceId: number, data: {
    name: string
    description: string
    price: number
    duration: number
  }) => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const responseData = await response.json()

      if (responseData.success) {
        showToast('success', 'Servizio aggiornato con successo')
        // Ricarica la lista
        fetchServices()
      } else {
        showToast('error', `Errore: ${responseData.error}`)
        throw new Error(responseData.error)
      }
    } catch (error) {
      console.error('Error updating service:', error)
      showToast('error', 'Errore nell\'aggiornamento del servizio')
      throw error
    }
  }

  // Effect per caricare servizi
  useEffect(() => {
    fetchServices()
  }, [page, search])

  // Effect per ricerca con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1)
      } else {
        fetchServices()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Servizi</h1>
          <p className="text-gray-600">Amministra i servizi del tuo PetShop</p>
        </div>
        
        {hasPermission('write_services') && (
          //<Link
           // href="/admin/servizi/nuovo"
            //className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          //>
            <div
            className="bg-gray-400 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 opacity-50 cursor-not-allowed"
            title="Funzionalità temporaneamente disabilitata"
          >
            <span>➕</span>
            <span>Nuovo Servizio</span>
            </div>
          //</Link>
        )}
      </div>

      {/* Filtri e Ricerca */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Cerca servizi
            </label>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome o descrizione del servizio..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('')
                setPage(1)
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancella Filtri
            </button>
          </div>
        </div>
      </div>

      {/* Tabella Servizi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento servizi...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun servizio trovato</h3>
            <p className="text-gray-600 mb-4">
              {search ? 'Prova a modificare i filtri di ricerca' : 'Inizia creando il tuo primo servizio'}
            </p>
            {hasPermission('write_services') && !search && (
              <div
                className="inline-flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg opacity-50 cursor-not-allowed"
                title="Funzionalità temporaneamente disabilitata"
              >
                <span className="mr-2">➕</span>
                Crea Primo Servizio
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servizio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prezzo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durata
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prenotazioni
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creato
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">{service.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">€{service.price.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{service.duration} min</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {service._count.bookings} prenotazioni
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {new Date(service.createdAt).toLocaleDateString('it-IT')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* TODO: aggiungere la route per la visualizzazione del servizio */}
                          <Link
                            href={`/admin/servizi/${service.id}`} 
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            Visualizza
                          </Link>
                          {hasPermission('write_services') && (
                            <button
                              onClick={() => openEditModal(service)}
                              className="text-yellow-600 hover:text-yellow-900 transition-colors"
                            >
                              Modifica
                            </button>
                          )}
                          
                          {hasPermission('delete_services') && (
                            <button
                              onClick={() => deleteService(service.id)}
                              disabled={deleteLoading === service.id}
                              className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                            >
                              {deleteLoading === service.id ? 'Eliminando...' : 'Elimina'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginazione */}
            {pagination.pages > 1 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span> di{' '}
                    <span className="font-medium">{pagination.total}</span> risultati
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Precedente
                    </button>
                    
                    <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                      {page}
                    </span>
                    
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= pagination.pages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Successiva
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modale di Modifica */}
      <EditServiceModal
        isOpen={editModalOpen}
        service={editingService}
        onClose={closeEditModal}
        onUpdate={updateService}
      />
    </div>
  )
} 