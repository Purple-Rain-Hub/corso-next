import { NextRequest } from 'next/server'
import { getAuthenticatedUser, createSuccessResponse, createErrorResponse } from '@/lib/auth/serverAuth'

// GET /api/admin/user-profile - Ottieni profilo utente corrente
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return createErrorResponse('Utente non autenticato', 'UNAUTHORIZED', 401)
    }

    // Restituisci i dati dell'utente (già viene dal sistema ibrido)
    return createSuccessResponse({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt
    })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return createErrorResponse('Errore interno del server', 'INTERNAL_ERROR', 500)
  }
} 