import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { UserRole } from '@/lib/generated/prisma'
import { isAdmin, hasPermission, Permission, validateRole } from './roles'
import { prisma } from '@/lib/prisma'

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

// Interfaccia per l'utente autenticato
export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
  fullName?: string
  isActive?: boolean
  lastLoginAt?: Date
}

// 🔄 SINCRONIZZAZIONE: Crea o aggiorna utente in Prisma
export async function syncUserToPrisma(supabaseUser: any): Promise<AuthenticatedUser> {
  const role = validateRole(supabaseUser.user_metadata?.role)
  
  try {
    const user = await prisma.user.upsert({
      where: { id: supabaseUser.id },
      update: {
        email: supabaseUser.email || '',
        fullName: supabaseUser.user_metadata?.full_name,
        lastLoginAt: supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : undefined,
        updatedAt: new Date()
      },
      create: {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        fullName: supabaseUser.user_metadata?.full_name,
        role: role,
        isActive: true,
        lastLoginAt: supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : undefined
      }
    })

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName || undefined,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt || undefined
    }
  } catch (error) {
    console.error('[SYNC] Errore sincronizzazione utente:', error)
    
    // Fallback ai metadata Supabase se il database non è disponibile
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role: role,
      fullName: supabaseUser.user_metadata?.full_name,
      isActive: true,
      lastLoginAt: supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : undefined
    }
  }
}

// 🔄 SINCRONIZZAZIONE: Aggiorna metadata Supabase da Prisma
export async function syncRoleToSupabase(userId: string, role: UserRole): Promise<boolean> {
  try {
    const supabase = await createSupabaseAdminClient()
    
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        role: role
      }
    })

    if (error) {
      console.error('[SYNC] Errore aggiornamento metadata Supabase:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[SYNC] Errore sincronizzazione verso Supabase:', error)
    return false
  }
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

// 🔄 APPROCCIO IBRIDO: Ottieni utente con fallback intelligente
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // STEP 1: Prova a ottenere dati dal database Prisma (fonte primaria)
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          role: true,
          fullName: true,
          isActive: true,
          lastLoginAt: true
        }
      })

      if (dbUser && dbUser.isActive) {
        // Database Prisma è la fonte di verità
        const authenticatedUser: AuthenticatedUser = {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          fullName: dbUser.fullName || undefined,
          isActive: dbUser.isActive,
          lastLoginAt: dbUser.lastLoginAt || undefined
        }

        // STEP 2: Sincronizza metadata Supabase se diversi (background)
        const metadataRole = validateRole(user.user_metadata?.role)
        if (metadataRole !== dbUser.role) {
          // Sync asincrono in background
          syncRoleToSupabase(user.id, dbUser.role).catch(console.error)
        }

        return authenticatedUser
      }
    } catch (dbError) {
      console.warn('[AUTH] Database non disponibile, usando fallback metadata:', dbError)
    }

    // STEP 3: Fallback ai metadata Supabase
    const role = validateRole(user.user_metadata?.role)
    const fallbackUser: AuthenticatedUser = {
      id: user.id,
      email: user.email || '',
      role: role,
      fullName: user.user_metadata?.full_name,
      isActive: true,
      lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined
    }

    // STEP 4: Tenta sincronizzazione verso Prisma (background)
    syncUserToPrisma(user).catch(console.error)

    return fallbackUser

  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
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
  if (user.isActive === false) {
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