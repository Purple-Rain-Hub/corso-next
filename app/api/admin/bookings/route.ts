import { NextRequest } from 'next/server'
import { withAdminAuth, createSuccessResponse, createErrorResponse } from '@/lib/auth/serverAuth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/bookings - Lista tutte le prenotazioni
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {

    // Ottieni parametri dalla query
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''

    // Calcola offset per paginazione
    const skip = (page - 1) * limit

    // Costruisci filtri (senza ricerca testuale)
    const where: any = {}

    // Filtro per status
    if (status && status !== 'all') {
      where.status = status
    }

    const [bookings, total] = await Promise.all([ //.all per eseguire le due query in parallelo
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          service: true
        }
      }),
      prisma.booking.count({ where })
    ])

    return createSuccessResponse({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return createErrorResponse('Errore nel caricamento delle prenotazioni', 'FETCH_ERROR', 500)
  }
}) 