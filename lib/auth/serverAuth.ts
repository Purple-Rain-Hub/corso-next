import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { UserRole } from '@/lib/auth/types'
import type { Permission } from '@/lib/auth/types'
import { isAdmin, hasPermission, validateRole } from './roles'

// Configurazione Supabase server-side
async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Interfaccia per l'utente autenticato (semplificata)
export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
  fullName?: string
  isActive: boolean
  lastLoginAt?: Date
}

// Crea client Supabase admin
async function createSupabaseAdminClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// 🎯 SEMPLIFICATO: Ottieni utente direttamente da Supabase
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Estrai dati direttamente dai metadata Supabase
    const role = validateRole(user.user_metadata?.role)
    const isActive = user.user_metadata?.isActive !== false // Default true se non specificato

    return {
      id: user.id,
      email: user.email || '',
      role: role,
      fullName: user.user_metadata?.full_name,
      isActive: isActive,
      lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined
    }

  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

// 🔄 UTILITY: Aggiorna metadata Supabase (per isActive, role, etc.)
export async function updateUserMetadata(userId: string, metadata: Partial<{
  role: UserRole
  isActive: boolean
  full_name: string
}>): Promise<boolean> {
  try {
    const supabase = await createSupabaseAdminClient()
    
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: metadata
    })

    if (error) {
      console.error('[UPDATE] Errore aggiornamento metadata:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[UPDATE] Errore aggiornamento metadata:', error)
    return false
  }
}

// Verifica se l'utente è amministratore
export async function verifyAdminAccess(requiredPermission?: Permission): Promise<{
  user: AuthenticatedUser | null
  hasAccess: boolean
  error?: string
}> {
  const user = await getAuthenticatedUser()

  if (!user) {
    return {
      user: null,
      hasAccess: false,
      error: 'Utente non autenticato'
    }
  }

  // Controllo se l'utente è attivo
  if (!user.isActive) {
    return {
      user,
      hasAccess: false,
      error: 'Account disattivato'
    }
  }

  if (!isAdmin(user.role)) {
    return {
      user,
      hasAccess: false,
      error: 'Permessi amministratore richiesti'
    }
  }

  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return {
      user,
      hasAccess: false,
      error: `Permesso '${requiredPermission}' richiesto`
    }
  }

  return {
    user,
    hasAccess: true
  }
}

// Decorator per proteggere handler API
export function withAdminAuth(
  handler: (req: NextRequest, context: { user: AuthenticatedUser }) => Promise<NextResponse>,
  requiredPermission?: Permission
) {
  return async (req: NextRequest, routeContext?: any) => {
    try {
      const { user, hasAccess, error } = await verifyAdminAccess(requiredPermission)

      if (!hasAccess || !user) {
        return NextResponse.json(
          { 
            error: error || 'Accesso negato',
            code: 'UNAUTHORIZED',
            timestamp: new Date().toISOString()
          },
          { status: 403 }
        )
      }

      // Passa l'utente al handler
      return await handler(req, { user })
    } catch (error) {
      console.error('Error in admin auth middleware:', error)
      return NextResponse.json(
        { 
          error: 'Errore interno del server',
          code: 'INTERNAL_ERROR',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }
  }
}

// Utility per creare risposte di errore standardizzate
export function createErrorResponse(message: string, code: string, status: number = 400) {
  return NextResponse.json(
    {
      error: message,
      code,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

// Utility per creare risposte di successo standardizzate
export function createSuccessResponse<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  })
} 