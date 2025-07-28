'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './context'
import { UserRole } from '@/lib/generated/prisma'
import { isAdmin, isSuperAdmin, hasPermission, Permission, validateRole } from './roles'
import { createClient } from '@/lib/supabase/client'

interface AdminUser {
  id: string
  email: string
  fullName?: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: Date
}

interface UseAdminAuthReturn {
  adminUser: AdminUser | null
  isAdmin: boolean
  isSuperAdmin: boolean
  isLoading: boolean
  error: string | null
  hasPermission: (permission: Permission) => boolean
  refreshAdminUser: () => Promise<void>
  clearError: () => void
}

export function useAdminAuth(): UseAdminAuthReturn {
  const { user, loading } = useAuth()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUserId, setLastUserId] = useState<string | null>(null)
  
  // Refs per evitare race conditions
  const fetchingRef = useRef(false)
  const mountedRef = useRef(true)
  
  const supabase = createClient()

  // 🔄 APPROCCIO IBRIDO: Ottieni dati utente con fallback intelligente
  const fetchAdminUser = useCallback(async (forceRefresh = false) => { //forceRefresh è un parametro opzionale che permette di forzare il refresh dell'utente
    // Prevenzione race conditions
    if (fetchingRef.current && !forceRefresh) { //se stiamo già facendo fetch dell'utente e non è forzato, non facciamo fetch nuovamente
      return
    }

    if (!user) { //se l'utente non è autenticato, non facciamo fetch dell'utente
      if (mountedRef.current) { //inoltre se il componente è montato, settiamo l'adminUser a null, l'errore a null e l'id dell'utente a null
        setAdminUser(null)
        setIsLoading(false)
        setError(null)
        setLastUserId(null)
      }
      return
    }

    // Skip se è lo stesso utente e non è forzato
    if (!forceRefresh && lastUserId === user.id && adminUser) {
      setIsLoading(false)
      return
    }

    fetchingRef.current = true
    setError(null)

    try {
      // STEP 1: Prova a ottenere dati dal database (API che usa Prisma)
      let userData: AdminUser | null = null
      
      try {
        const response = await fetch('/api/admin/user-profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            userData = {
              id: result.data.id,
              email: result.data.email,
              fullName: result.data.fullName,
              role: validateRole(result.data.role),
              isActive: result.data.isActive !== false, 
              lastLoginAt: result.data.lastLoginAt ? new Date(result.data.lastLoginAt) : undefined
            }
          }
        }
      } catch (apiError) {
        console.warn('[AUTH] API non disponibile, usando fallback metadata:', apiError)
      }

      // STEP 2: Fallback ai metadata Supabase
      if (!userData) {
        const role = validateRole(user.user_metadata?.role)
        userData = {
          id: user.id,
          email: user.email || '',
          fullName: user.user_metadata?.full_name,
          role,
          isActive: true,
          lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined
        }
      }

      // STEP 3: Verifica se l'account è attivo
      if (!userData.isActive) {
        throw new Error('Account disattivato. Contatta l\'amministratore.')
      }

      if (mountedRef.current) {
        setAdminUser(userData)
        setLastUserId(user.id)
        setError(null)
      }

    } catch (error: any) {
      console.error('[AUTH] Errore nel caricamento utente:', error)
      
      if (mountedRef.current) {
        setError(error.message || 'Errore nel caricamento dei permessi')
        
        // Non rimuovere l'utente per errori temporanei, ma per errori di sicurezza sì
        if (error.message?.includes('disattivato') || error.message?.includes('non autorizzato')) {
          setAdminUser(null)
          setLastUserId(null)
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
      fetchingRef.current = false
    }
  }, [user, adminUser, lastUserId, supabase])

  // Cleanup al dismount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Effetto principale per il caricamento
  useEffect(() => {
    if (!loading) {
      fetchAdminUser()
    }
  }, [loading, fetchAdminUser])

  // Refresh forzato
  const refreshAdminUser = useCallback(async () => {
    setIsLoading(true)
    await fetchAdminUser(true)
  }, [fetchAdminUser])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, []) //clearError viene montato solo una volta e non viene mai rimontato

  // 🔒 CONTROLLO PERMESSI con validazione aggiuntiva
  const checkPermission = useCallback((permission: Permission): boolean => {
    if (!adminUser || !adminUser.isActive) return false
    return hasPermission(adminUser.role, permission)
  }, [adminUser])

  return {
    adminUser,
    isAdmin: adminUser ? isAdmin(adminUser.role) && adminUser.isActive : false,
    isSuperAdmin: adminUser ? isSuperAdmin(adminUser.role) && adminUser.isActive : false,
    isLoading: loading || isLoading,
    error,
    hasPermission: checkPermission,
    refreshAdminUser,
    clearError
  }
} 