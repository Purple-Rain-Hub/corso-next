import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { UserRole } from '@/lib/auth/types'
import { withAdminAuth, createSuccessResponse, createErrorResponse, updateUserMetadata } from '@/lib/auth/serverAuth'
import { validateRole, canChangeRole, isValidRole } from '@/lib/auth/roles'

// GET: Ottieni lista utenti
export const GET = withAdminAuth(async (req: NextRequest, { user }) => {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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

    const { data: users, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      return createErrorResponse('Errore nel caricamento degli utenti', 'FETCH_ERROR', 500)
    }

    const formattedUsers = users.users.map(user => ({
      id: user.id,
      email: user.email,
      role: validateRole(user.user_metadata?.role),
      fullName: user.user_metadata?.full_name,
      isActive: user.user_metadata?.isActive !== false,
      createdAt: user.created_at
    }))

    return createSuccessResponse(formattedUsers)

  } catch (error) {
    console.error('Error fetching users:', error)
    return createErrorResponse('Errore interno del server', 'INTERNAL_ERROR', 500)
  }
}, 'read_users')

// POST: Assegna ruolo a un utente
export const POST = withAdminAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json()
    const { email, role } = body

    // Validazione input
    if (!email || !role) {
      return createErrorResponse('Email e ruolo sono obbligatori', 'VALIDATION_ERROR', 400)
    }

    if (!isValidRole(role)) {
      return createErrorResponse('Ruolo non valido', 'INVALID_ROLE', 400)
    }

    // 🔒 CONTROLLO PRELIMINARE: Verifica se l'utente corrente può modificare ruoli
    if (user.role !== UserRole.SUPER_ADMIN) {
      return createErrorResponse('Solo i Super Admin possono modificare i ruoli', 'PERMISSION_DENIED', 403)
    }

    // Crea client Supabase admin
    const cookieStore = await cookies()
    const supabase = createServerClient(
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

    // Trova l'utente per email
    const { data: users, error: findError } = await supabase.auth.admin.listUsers()
    
    if (findError) {
      return createErrorResponse('Errore nella ricerca dell\'utente', 'FIND_ERROR', 500)
    }

    const targetUser = users.users.find(u => u.email === email)
    
    if (!targetUser) {
      return createErrorResponse('Utente non trovato', 'USER_NOT_FOUND', 404)
    }

    // 🔒 SICUREZZA AGGIUNTIVA: Verifica se può modificare questo specifico utente
    const currentTargetRole = validateRole(targetUser.user_metadata?.role)
    const finalRoleValidation = canChangeRole(user.role, role, currentTargetRole)
    
    if (!finalRoleValidation.allowed) {
      return createErrorResponse(finalRoleValidation.reason!, 'PERMISSION_DENIED', 403)
    }

    // Aggiorna i metadata Supabase
    const updateSuccess = await updateUserMetadata(targetUser.id, { role })

    if (!updateSuccess) {
      return createErrorResponse('Errore nell\'aggiornamento del ruolo', 'UPDATE_ERROR', 500)
    }

    // Log di sicurezza
    console.log(`[SECURITY] Ruolo ${role} assegnato a ${email} da ${user.email} (${user.role})`)

    return createSuccessResponse({
      userId: targetUser.id,
      email: targetUser.email,
      role: role,
      updatedBy: user.email
    }, `Ruolo ${role} assegnato con successo a ${email}`)

  } catch (error) {
    console.error('Error assigning role:', error)
    return createErrorResponse('Errore interno del server', 'INTERNAL_ERROR', 500)
  }
}, 'system_settings') 