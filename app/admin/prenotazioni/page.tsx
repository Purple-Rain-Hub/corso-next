'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/lib/auth/useAdminAuth'
import { useToast } from '@/app/components/ui/ToastProvider'
import type { BookingWithService } from '@/lib/types'

interface BookingsResponse {
  bookings: BookingWithService[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function BookingsPage() {
  const { hasPermission } = useAdminAuth()
  const { showToast } = useToast()
  const [bookings, setBookings] = useState<BookingWithService[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [updateLoading, setUpdateLoading] = useState<number | null>(null)

  // Carica prenotazioni
  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }) //se statusFilter non è all, aggiungi status: statusFilter
      })

      const response = await fetch(`/api/admin/bookings?${params}`)
      const data = await response.json()

      if (data.success) {
        setBookings(data.data.bookings)
        setPagination(data.data.pagination)
      } else {
        console.error('Error loading bookings:', data.error)
        showToast('error', `Errore nel caricamento delle prenotazioni: ${data.error}`)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      showToast('error', 'Errore nel caricamento delle prenotazioni')
    } finally {
      setLoading(false)
    }
  }

  // Aggiorna status prenotazione
  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      setUpdateLoading(bookingId)
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', 'Status prenotazione aggiornato con successo')
        // Ricarica la lista
        fetchBookings()
      } else {
        showToast('error', `Errore: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      showToast('error', 'Errore nell\'aggiornamento della prenotazione')
    } finally {
      setUpdateLoading(null)
    }
  }

  // Formatta data
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Formatta orario
  const formatTime = (timeString: string) => {
    return timeString
  }

  // Ottieni colore status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Ottieni testo status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In attesa'
      case 'confirmed':
        return 'Confermata'
      case 'completed':
        return 'Completata'
      case 'cancelled':
        return 'Annullata'
      default:
        return status
    }
  }

  // Carica dati all'avvio e quando cambiano i filtri
  useEffect(() => {
    fetchBookings()
  }, [page, statusFilter])

  // Verifica permessi
  if (!hasPermission('read_bookings')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accesso Negato</h1>
          <p className="text-gray-600">Non hai i permessi per visualizzare questa pagina.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Prenotazioni</h1>
          <p className="text-gray-600 mt-2">
            Gestisci tutte le prenotazioni degli utenti
          </p>
        </div>
      </div>

      {/* Filtri */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filtro Status */}
          <div className="sm:w-48">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="all">Tutti gli status</option>
              <option value="confirmed">Confermata</option>
              <option value="completed">Completata</option>
              <option value="cancelled">Annullata</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista Prenotazioni */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Caricamento prenotazioni...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Nessuna prenotazione trovata.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Animale
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servizio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data & Ora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.petName}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {booking.petType}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.service.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          €{booking.service.price} - {booking.service.duration}min
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(booking.bookingDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(booking.bookingTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              disabled={updateLoading === booking.id}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            >
                              {updateLoading === booking.id ? 'Aggiornando...' : 'Conferma'}
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              disabled={updateLoading === booking.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              Annulla
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              disabled={updateLoading === booking.id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              {updateLoading === booking.id ? 'Aggiornando...' : 'Completa'}
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              disabled={updateLoading === booking.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              Annulla
                            </button>
                          </div>
                        )}
                        {booking.status === 'completed' && (
                          <div className="flex space-x-2">
                            <span className="text-gray-500">Completata</span>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              disabled={updateLoading === booking.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              Annulla
                            </button>
                          </div>
                        )}
                        {booking.status === 'cancelled' && (
                          <div className="flex space-x-2">
                            <span className="text-gray-500">Annullata</span>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              disabled={updateLoading === booking.id}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            >
                              Ripristina
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginazione */}
      {pagination.pages > 1 && (
        <div className="flex justify-center">
          <nav className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Precedente
            </button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  pageNum === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.pages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Successiva
            </button>
          </nav>
        </div>
      )}

      {/* Statistiche */}
      {!loading && bookings.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiche</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => b.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-600">Confermate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {bookings.filter(b => b.status === 'cancelled').length}
              </div>
              <div className="text-sm text-gray-600">Annullate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 