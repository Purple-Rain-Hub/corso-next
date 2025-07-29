import { NextRequest } from 'next/server'
import { getAuthenticatedUser, createSuccessResponse, createErrorResponse } from '@/lib/auth/serverAuth'
import { hasPermission } from '@/lib/auth/roles'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

interface RouteParams {
  params: { id: string }
}

// 🔒 PROTETTO: GET /api/admin/services/[id] - Ottieni singolo servizio
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // 🔒 VERIFICA AUTENTICAZIONE E AUTORIZZAZIONE
    const user = await getAuthenticatedUser()
    if (!user) {
      return createErrorResponse('Utente non autenticato', 'UNAUTHORIZED', 401)
    }

    if (!hasPermission(user.role, 'read_services')) {
      return createErrorResponse('Permessi insufficienti', 'FORBIDDEN', 403)
    }

    const serviceId = parseInt(params.id)

    if (isNaN(serviceId)) {
      return createErrorResponse('ID servizio non valido', 'INVALID_ID', 400)
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        _count: {
          select: {
            bookings: true
          }
        },
        bookings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            customerName: true,
            bookingDate: true,
            status: true
          }
        }
      }
    })

    if (!service) {
      return createErrorResponse('Servizio non trovato', 'NOT_FOUND', 404)
    }

    return createSuccessResponse(service)
  } catch (error) {
    console.error('Error fetching service:', error)
    return createErrorResponse('Errore nel caricamento del servizio', 'FETCH_ERROR', 500)
  } finally {
    await prisma.$disconnect()
  }
}

// 🔒 PROTETTO: PUT /api/admin/services/[id] - Aggiorna servizio  
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    // 🔒 VERIFICA AUTENTICAZIONE E AUTORIZZAZIONE
    const user = await getAuthenticatedUser()
    if (!user) {
      return createErrorResponse('Utente non autenticato', 'UNAUTHORIZED', 401)
    }

    if (!hasPermission(user.role, 'write_services')) {
      return createErrorResponse('Permessi insufficienti', 'FORBIDDEN', 403)
    }

    const serviceId = parseInt(params.id)

    if (isNaN(serviceId)) {
      return createErrorResponse('ID servizio non valido', 'INVALID_ID', 400)
    }

    const body = await req.json()
    const { name, description, price, duration } = body

    // Validazione
    if (!name || !description || !price || !duration) {
      return createErrorResponse('Tutti i campi sono obbligatori', 'VALIDATION_ERROR', 400)
    }

    if (price <= 0 || duration <= 0) {
      return createErrorResponse('Prezzo e durata devono essere maggiori di zero', 'VALIDATION_ERROR', 400)
    }

    // Verifica se il servizio esiste
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!existingService) {
      return createErrorResponse('Servizio non trovato', 'NOT_FOUND', 404)
    }

    // Verifica se esiste un altro servizio con lo stesso nome
    const duplicateService = await prisma.service.findFirst({
      where: { 
        name,
        id: { not: serviceId }
      }
    })

    if (duplicateService) {
      return createErrorResponse('Esiste già un servizio con questo nome', 'DUPLICATE_ERROR', 400)
    }

    // Aggiorna il servizio
    const service = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration)
      }
    })

    // Log di sicurezza
    console.log(`[SECURITY] Servizio ${serviceId} aggiornato da ${user.email} (${user.role})`)

    return createSuccessResponse(service, 'Servizio aggiornato con successo')
  } catch (error) {
    console.error('Error updating service:', error)
    return createErrorResponse('Errore nell\'aggiornamento del servizio', 'UPDATE_ERROR', 500)
  } finally {
    await prisma.$disconnect()
  }
}

// 🔒 PROTETTO: DELETE /api/admin/services/[id] - Elimina servizio
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // 🔒 VERIFICA AUTENTICAZIONE E AUTORIZZAZIONE
    const user = await getAuthenticatedUser()
    if (!user) {
      return createErrorResponse('Utente non autenticato', 'UNAUTHORIZED', 401)
    }

    if (!hasPermission(user.role, 'delete_services')) {
      return createErrorResponse('Permessi insufficienti', 'FORBIDDEN', 403)
    }

    const serviceId = parseInt(params.id)

    if (isNaN(serviceId)) {
      return createErrorResponse('ID servizio non valido', 'INVALID_ID', 400)
    }

    // Verifica se il servizio esiste
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        _count: {
          select: {
            bookings: true,
            cartItems: true
          }
        }
      }
    })

    if (!service) {
      return createErrorResponse('Servizio non trovato', 'NOT_FOUND', 404)
    }

    // Verifica se il servizio ha prenotazioni o elementi nel carrello
    if (service._count.bookings > 0 || service._count.cartItems > 0) {
      return createErrorResponse(
        'Non è possibile eliminare un servizio con prenotazioni esistenti o elementi nel carrello',
        'HAS_DEPENDENCIES',
        400
      )
    }

    // Elimina il servizio
    await prisma.service.delete({
      where: { id: serviceId }
    })

    // Log di sicurezza
    console.log(`[SECURITY] Servizio ${serviceId} eliminato da ${user.email} (${user.role})`)

    return createSuccessResponse(null, 'Servizio eliminato con successo')
  } catch (error) {
    console.error('Error deleting service:', error)
    return createErrorResponse('Errore nell\'eliminazione del servizio', 'DELETE_ERROR', 500)
  } finally {
    await prisma.$disconnect()
  }
} 