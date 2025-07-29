'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAdminAuth } from '@/lib/auth/useAdminAuth'

// Tipi per le statistiche
interface DashboardStats {
  totalServices: number
  totalBookings: number
  pendingBookings: number
  completedBookings: number
  totalRevenue: number
  recentBookings: Array<{
    id: number
    customerName: string
    serviceName: string
    bookingDate: string
    status: string
  }>
}

// Componente per le card statistiche
function StatCard({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = 'positive' 
}: {
  title: string
  value: string | number
  icon: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
}) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${changeColors[changeType]} mt-1`}>
              {change}
            </p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}

// Componente per le azioni rapide
function QuickAction({ 
  title, 
  description, 
  href, 
  icon,
  color = 'blue'
}: {
  title: string
  description: string
  href: string
  icon: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
    green: 'bg-green-50 hover:bg-green-100 text-green-700',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700',
    orange: 'bg-orange-50 hover:bg-orange-100 text-orange-700'
  }

  return (
    <Link
      href={href}
      className={`block p-4 rounded-lg border border-gray-200 transition-colors ${colorClasses[color]}`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm opacity-75">{description}</p>
        </div>
      </div>
    </Link>
  )
}

export default function AdminDashboard() {
  const { user, hasPermission } = useAdminAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Carica le statistiche
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simuliamo il caricamento delle statistiche
        // In futuro, questa sarà una chiamata API reale
        await new Promise(resolve => setTimeout(resolve, 1000))
        //TODO: rimuovere mockStats e sostituirlo con una chiamata API reale
        const mockStats: DashboardStats = {
          totalServices: 6,
          totalBookings: 47,
          pendingBookings: 8,
          completedBookings: 32,
          totalRevenue: 2350.50,
          recentBookings: [
            {
              id: 1,
              customerName: 'Mario Rossi',
              serviceName: 'Toelettatura Completa',
              bookingDate: '2024-07-28',
              status: 'pending'
            },
            {
              id: 2,
              customerName: 'Anna Verdi',
              serviceName: 'Visita Veterinaria',
              bookingDate: '2024-07-27',
              status: 'confirmed'
            },
            {
              id: 3,
              customerName: 'Luigi Bianchi',
              serviceName: 'Taglio Pelo',
              bookingDate: '2024-07-26',
              status: 'completed'
            }
          ]
        }
        
        setStats(mockStats)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento statistiche...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Benvenuto, {user?.fullName || 'Amministratore'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Ecco una panoramica del tuo business PetShop
        </p>
      </div>

      {/* Statistiche principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Servizi Totali"
          value={stats?.totalServices || 0}
          icon="🏥"
          change="+2 questo mese"
          changeType="positive"
        />
        <StatCard
          title="Prenotazioni Totali"
          value={stats?.totalBookings || 0}
          icon="📅"
          change="+12% vs mese scorso"
          changeType="positive"
        />
        <StatCard
          title="Prenotazioni Pending"
          value={stats?.pendingBookings || 0}
          icon="⏳"
          change="Da confermare"
          changeType="neutral"
        />
        <StatCard
          title="Fatturato"
          value={`€${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon="💰"
          change="+8.5% vs mese scorso"
          changeType="positive"
        />
      </div>

      {/* Azioni rapide */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {hasPermission('write_services') && (
            <QuickAction
              title="Nuovo Servizio"
              description="Aggiungi un nuovo servizio"
              href="/admin/servizi/nuovo"
              icon="➕"
              color="green"
            />
          )}
          
          {hasPermission('read_bookings') && (
            <QuickAction
              title="Gestisci Prenotazioni"
              description="Visualizza e gestisci prenotazioni"
              href="/admin/prenotazioni"
              icon="📋"
              color="blue"
            />
          )}
          
          {hasPermission('read_users') && (
            <QuickAction
              title="Gestione Utenti"
              description="Amministra gli utenti"
              href="/admin/utenti"
              icon="👥"
              color="purple"
            />
          )}
          
          {hasPermission('system_settings') && (
            <QuickAction
              title="Impostazioni"
              description="Configura il sistema"
              href="/admin/impostazioni"
              icon="⚙️"
              color="orange"
            />
          )}
        </div>
      </div>

      {/* Prenotazioni recenti */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Prenotazioni Recenti</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servizio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.serviceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.bookingDate).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status === 'pending' ? 'In Attesa' :
                         booking.status === 'confirmed' ? 'Confermata' :
                         booking.status === 'completed' ? 'Completata' : booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-3 bg-gray-50 text-right">
            <Link 
              href="/admin/prenotazioni"
              className="text-sm text-blue-600 hover:text-blue-900"
            >
              Visualizza tutte le prenotazioni →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 