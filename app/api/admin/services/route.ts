import { NextRequest } from 'next/server'
import { withAdminAuth, createSuccessResponse, createErrorResponse } from '@/lib/auth/serverAuth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/services - Lista tutti i servizi
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url) //recupera i parametri dall'URL
    const page = parseInt(searchParams.get('page') || '1') //recupera il numero di pagina dall'URL
    const limit = parseInt(searchParams.get('limit') || '10') //recupera il numero di elementi per pagina dall'URL
    const search = searchParams.get('search') || '' //recupera la ricerca dall'URL
    
    const skip = (page - 1) * limit

    // Filtri di ricerca
    const where = search ? {
      OR: [ //OR è un array di oggetti, ogni oggetto è un filtro
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    // Carica servizi con conteggio prenotazioni
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where, //filtra per nome o descrizione
        skip, //salta i primi elementi per arrivare alla pagina corrente
        take: limit, //prende gli elementi della pagina corrente
        orderBy: { createdAt: 'desc' }, //ordina per data di creazione decrescente
        include: {
          _count: {
            select: {
              bookings: true
            }
          }
        }
      }),
      prisma.service.count({ where }) //conta il numero di servizi che corrispondono al filtro
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
  }
}, 'write_services') 