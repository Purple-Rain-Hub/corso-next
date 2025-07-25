'use client'

import { useAuth } from '@/lib/auth/context'
import { useCart } from '@/lib/context/CartContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const { user, loading, signOut } = useAuth()
  const { getItemCount } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Funzione per chiudere il menu mobile quando si clicca un link
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  // Funzione per determinare se un link è attivo
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  // Funzione per ottenere le classi CSS per i link
  const getLinkClasses = (path: string, baseClasses: string) => {
    if (isActive(path)) {
      return `${baseClasses} bg-blue-50 text-blue-600 cursor-default`
    }
    return `${baseClasses} text-gray-700 hover:text-blue-600 transition-colors`
  }

  // Funzione per gestire il click sui link attivi
  const handleLinkClick = (path: string, e: React.MouseEvent) => {
    if (isActive(path)) {
      e.preventDefault()
      return false
    }
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo e Nome del sito */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🐾</span>
              <span className="text-xl font-bold text-blue-600">PetShop</span>
            </Link>
          </div>

          {/* Menu Desktop - nascosto su mobile */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/"
              onClick={(e) => handleLinkClick('/', e)}
              className={getLinkClasses('/', "px-3 py-2 text-sm font-medium rounded-md")}
            >
              Home
            </Link>
            <Link 
              href="/prodotti"
              onClick={(e) => handleLinkClick('/prodotti', e)}
              className={getLinkClasses('/prodotti', "px-3 py-2 text-sm font-medium rounded-md")}
            >
              Prodotti
            </Link>
            <Link 
              href="/prenotazioni"
              onClick={(e) => handleLinkClick('/prenotazioni', e)}
              className={getLinkClasses('/prenotazioni', "px-3 py-2 text-sm font-medium rounded-md")}
            >
              Prenotazioni
            </Link>
            {user && (
              <Link 
                href="/dashboard"
                onClick={(e) => handleLinkClick('/dashboard', e)}
                className={getLinkClasses('/dashboard', "px-3 py-2 text-sm font-medium rounded-md")}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Sezione destra: Carrello e Autenticazione */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Carrello */}
            <Link 
              href="/carrello"
              onClick={(e) => handleLinkClick('/carrello', e)}
              className={`relative p-2 rounded-md ${
                isActive('/carrello')
                  ? 'bg-blue-50 text-blue-600 cursor-default'
                  : 'text-gray-600 hover:text-blue-600 transition-colors'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h12" />
              </svg>
              {/* Badge con numero di prodotti nel carrello */}
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {/* Stato di caricamento */}
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-500">Caricamento...</span>
              </div>
            ) : user ? (
              /* Utente autenticato */
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Ciao, <span className="font-medium">{user?.user_metadata?.full_name || 'Cliente'}</span>!
                </span>
                <button
                  onClick={signOut}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              /* Utente non autenticato */
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Accedi
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Registrati
                </Link>
              </div>
            )}
          </div>

          {/* Pulsante Menu Mobile - visibile solo su mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Mobile - visibile solo quando isMobileMenuOpen è true */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/"
                onClick={(e) => {
                  if (!isActive('/')) {
                    closeMobileMenu()
                  } else {
                    e.preventDefault()
                  }
                }}
                className={getLinkClasses('/', "block px-3 py-2 text-base font-medium rounded-md")}
              >
                Home
              </Link>
              <Link 
                href="/prodotti"
                onClick={(e) => {
                  if (!isActive('/prodotti')) {
                    closeMobileMenu()
                  } else {
                    e.preventDefault()
                  }
                }}
                className={getLinkClasses('/prodotti', "block px-3 py-2 text-base font-medium rounded-md")}
              >
                Prodotti
              </Link>
              <Link 
                href="/prenotazioni"
                onClick={(e) => {
                  if (!isActive('/prenotazioni')) {
                    closeMobileMenu()
                  } else {
                    e.preventDefault()
                  }
                }}
                className={getLinkClasses('/prenotazioni', "block px-3 py-2 text-base font-medium rounded-md")}
              >
                Prenotazioni
              </Link>
              {user && (
                <Link 
                  href="/dashboard"
                  onClick={(e) => {
                    if (!isActive('/dashboard')) {
                      closeMobileMenu()
                    } else {
                      e.preventDefault()
                    }
                  }}
                  className={getLinkClasses('/dashboard', "block px-3 py-2 text-base font-medium rounded-md")}
                >
                  Dashboard
                </Link>
              )}
              
              {/* Sezione Carrello e Auth nel menu mobile */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <Link 
                  href="/carrello"
                  onClick={(e) => {
                    if (!isActive('/carrello')) {
                      closeMobileMenu()
                    } else {
                      e.preventDefault()
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2 text-base font-medium rounded-md ${
                    isActive('/carrello') 
                      ? 'bg-blue-50 text-blue-600 cursor-default' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors'
                  }`}
                >
                  <span>Carrello</span>
                  {getItemCount() > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </Link>
                
                {loading ? (
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-500">Caricamento...</span>
                  </div>
                ) : user ? (
                  <div className="px-3 py-2 space-y-2">
                    <div className="text-sm text-gray-700">
                      Ciao, <span className="font-medium">{user?.user_metadata?.full_name || 'Cliente'}</span>!
                    </div>
                    <button
                      onClick={() => {
                        signOut()
                        closeMobileMenu()
                      }}
                      className="w-full text-left bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-2 space-y-2">
                    <Link
                      href="/auth/login"
                      onClick={closeMobileMenu}
                      className="block text-center text-gray-700 hover:text-gray-900 border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Accedi
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={closeMobileMenu}
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Registrati
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 