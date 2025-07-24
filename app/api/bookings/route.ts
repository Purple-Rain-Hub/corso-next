import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Ottieni tutte le prenotazioni
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        service: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Errore nel recupero delle prenotazioni:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero delle prenotazioni' },
      { status: 500 }
    )
  }
}

// POST: Crea una nuova prenotazione
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      customerEmail,
      petName,
      petType,
      serviceId,
      bookingDate,
      bookingTime,
      notes
    } = body

    // Validazione base
    if (!customerName || !customerEmail || !petName || !petType || !serviceId || !bookingDate || !bookingTime) {
      return NextResponse.json(
        { error: 'Tutti i campi obbligatori devono essere compilati' },
        { status: 400 }
      )
    }

    // Verifica che il servizio esista
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Servizio non trovato' },
        { status: 404 }
      )
    }

    // Crea la prenotazione
    const booking = await prisma.booking.create({
      data: {
        customerName,
        customerEmail,
        petName,
        petType,
        serviceId,
        bookingDate: new Date(bookingDate),
        bookingTime,
        notes: notes || null
      },
      include: {
        service: true
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Errore nella creazione della prenotazione:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione della prenotazione' },
      { status: 500 }
    )
  }
} 