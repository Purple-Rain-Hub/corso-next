import { NextRequest } from 'next/server'
import { getAuthenticatedUser, createSuccessResponse, createErrorResponse } from '@/lib/auth/serverAuth'
import { hasPermission } from '@/lib/auth/roles'
import { prisma } from '@/lib/prisma'

// PATCH /api/admin/bookings/[id] - Aggiorna status prenotazione
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verifica autenticazione e permessi
    const user = await getAuthenticatedUser()
    if (!user) {
      return createErrorResponse('Utente non autenticato', 'UNAUTHORIZED', 401)
    }

    if (!hasPermission(user.role, 'write_bookings')) {
      return createErrorResponse('Permessi insufficienti', 'FORBIDDEN', 403)
    }

    const resolvedParams = await params // perche' params è una promise
    const bookingId = parseInt(resolvedParams.id)

    if (isNaN(bookingId)) {
      return createErrorResponse('ID prenotazione non valido', 'INVALID_ID', 400)
    }

    // Ottieni dati dal body
    const body = await req.json()
    const { status } = body

    // Valida status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return createErrorResponse('Status non valido', 'VALIDATION_ERROR', 400)
    }

    // Verifica che la prenotazione esista
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!existingBooking) {
      return createErrorResponse('Prenotazione non trovata', 'NOT_FOUND', 404)
    }

    // Aggiorna la prenotazione
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        service: true
      }
    })

    // Log di sicurezza
    console.log(`[SECURITY] Prenotazione ${bookingId} aggiornata da ${user.email} (${user.role}) - Status: ${status}`)

    return createSuccessResponse(updatedBooking, 'Status prenotazione aggiornato con successo')
  } catch (error) {
    console.error('Error updating booking:', error)
    return createErrorResponse('Errore nell\'aggiornamento della prenotazione', 'UPDATE_ERROR', 500)
  }
} 