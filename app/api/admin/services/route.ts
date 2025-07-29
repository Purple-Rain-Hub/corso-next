import { NextRequest } from 'next/server'
import { withAdminAuth, createSuccessResponse, createErrorResponse } from '@/lib/auth/serverAuth'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

// GET /api/admin/services - Lista tutti i servizi
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    
    const skip = (page - 1) * limit

    // Filtri di ricerca
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    // Carica servizi con conteggio prenotazioni
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              bookings: true
            }
          }
        }
      }),
      prisma.service.count({ where })
    ])

    return createSuccessResponse({
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return createErrorResponse('Errore nel caricamento dei servizi', 'FETCH_ERROR', 500)
  } finally {
    await prisma.$disconnect()
  }
}, 'read_services')

// POST /api/admin/services - Crea nuovo servizio
export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { name, description, price, duration } = body

    // Validazione
    if (!name || !description || !price || !duration) {
      return createErrorResponse('Tutti i campi sono obbligatori', 'VALIDATION_ERROR', 400)
    }

    if (price <= 0 || duration <= 0) {
      return createErrorResponse('Prezzo e durata devono essere maggiori di zero', 'VALIDATION_ERROR', 400)
    }

    // Verifica se esiste già un servizio con lo stesso nome
    const existingService = await prisma.service.findFirst({
      where: { name }
    })

    if (existingService) {
      return createErrorResponse('Esiste già un servizio con questo nome', 'DUPLICATE_ERROR', 400)
    }

    // Crea il servizio
    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration)
      }
    })

    return createSuccessResponse(service, 'Servizio creato con successo')
  } catch (error) {
    console.error('Error creating service:', error)
    return createErrorResponse('Errore nella creazione del servizio', 'CREATE_ERROR', 500)
  } finally {
    await prisma.$disconnect()
  }
}, 'write_services') 