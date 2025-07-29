'use client'

import { useState, useEffect } from 'react'
import { UserRole } from '@/lib/auth/types'
import type { Permission } from '@/lib/auth/types'
import { validateRole, hasPermission, isAdmin, isSuperAdmin } from './roles'
import { useAuth } from './context'

// Interfaccia per l'utente admin (semplificata)
export interface AdminUser {
  id: string
  email: string
  role: UserRole
  fullName?: string
  isActive: boolean
  lastLoginAt?: Date
}

// Interfaccia per il tipo di ritorno dell'hook
export interface UseAdminAuthReturn {
  isAuthenticated: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  hasPermission: (permission: Permission) => boolean
  user: AdminUser | null
  loading: boolean
  error: string | null
}

// Hook personalizzato per l'autenticazione admin
export function useAdminAuth(): UseAdminAuthReturn {
  const { user, loading: authLoading } = useAuth() // ✅ Riutilizzo useAuth come base
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ✅ Trasforma user base in adminUser quando user cambia
  useEffect(() => {
    if (!user) {
      setAdminUser(null)
      setError(null)
      return
    }

    try {
      // Trasforma User di Supabase in AdminUser con validazioni
      const role = validateRole(user.user_metadata?.role)
      const isActive = user.user_metadata?.isActive !== false

      const adminUserData: AdminUser = {
        id: user.id,
        email: user.email || '',
        role: role,
        fullName: user.user_metadata?.full_name,
        isActive: isActive,
        lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined
      }

      setAdminUser(adminUserData)
      setError(null)

    } catch (err) {
      console.error('Errore nella trasformazione dati admin:', err)
      setError('Errore nel caricamento dei dati amministratore')
      setAdminUser(null)
    }
  }, [user]) // ✅ Si aggiorna automaticamente quando user cambia

  // Funzioni di utilità
  const hasPermissionCheck = (permission: Permission): boolean => {
    if (!adminUser || !adminUser.isActive) return false
    return hasPermission(adminUser.role, permission)
  }

  // ✅ Oggetto tipizzato che implementa UseAdminAuthReturn
  const authState: UseAdminAuthReturn = {
    isAuthenticated: !!adminUser,
    isAdmin: adminUser ? isAdmin(adminUser.role) && adminUser.isActive : false,
    isSuperAdmin: adminUser ? isSuperAdmin(adminUser.role) && adminUser.isActive : false,
    hasPermission: hasPermissionCheck,
    user: adminUser,
    loading: authLoading, // ✅ Usa il loading di useAuth
    error
  }

  return authState
} 