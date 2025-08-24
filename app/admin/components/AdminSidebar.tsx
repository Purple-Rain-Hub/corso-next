'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminAuth } from '@/lib/auth/useAdminAuth'

// Definizione dei link di navigazione
const navigationLinks = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: '📊',
    permission: 'admin_dashboard' as const
  },
  {
    name: 'Servizi',
    href: '/admin/servizi',
    icon: '🏥',
    permission: 'read_services' as const
  },
  {
    name: 'Prenotazioni',
    href: '/admin/prenotazioni',
    icon: '📅',
    permission: 'read_bookings' as const
  },
  {
    name: 'Utenti',
    href: '/admin/utenti',
    icon: '👥',
    permission: 'read_users' as const
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { hasPermission } = useAdminAuth()

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🏪</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <div className="px-3 space-y-1">
          {navigationLinks.map((link) => {
            // Verifica se l'utente ha il permesso per questo link
            if (!hasPermission(link.permission)) {
              return null
            }

            const isActive = pathname === link.href || 
              (link.href !== '/admin' && pathname.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-lg mr-3">{link.icon}</span>
                {link.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/dashboard"
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <span className="text-lg mr-3">↩️</span>
          Torna al Sito
        </Link>
      </div>
    </div>
  )
} 