'use client'

import Link from 'next/link'
import { useAdminAuth } from '@/lib/auth/useAdminAuth'

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Benvenuto, {user?.fullName || 'Amministratore'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Gestisci il tuo business PetShop
        </p>
      </div>

      {/* Azioni rapide */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {hasPermission('read_services') && (
            <QuickAction
              title="Gestisci Servizi"
              description="Visualizza e gestisci servizi"
              href="/admin/servizi"
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
          
        </div>
      </div>
    </div>
  )
} 