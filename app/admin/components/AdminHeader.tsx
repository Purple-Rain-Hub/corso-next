'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { useAdminAuth } from '@/lib/auth/useAdminAuth'
import { ROLE_LABELS } from '@/lib/auth/roles'

export function AdminHeader() {
  const { signOut } = useAuth()
  const { user } = useAdminAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Breadcrumb/Title */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pannello Amministrativo
            </h2>
            <p className="text-sm text-gray-600">
              Gestisci il tuo business PetShop
            </p>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications (placeholder) */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="text-lg">🔔</span>
              {/* Badge for notifications */}
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {/* Avatar placeholder */}
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {user?.fullName || 'Amministratore'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role ? ROLE_LABELS[user.role] : 'Admin'}
                  </p>
                </div>

                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.fullName || 'Amministratore'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu items */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      router.push('/dashboard')
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <span className="mr-3">👤</span>
                    Il Mio Profilo
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      router.push('/admin/impostazioni')
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <span className="mr-3">⚙️</span>
                    Impostazioni
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      handleSignOut()
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <span className="mr-3">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
} 