import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { bookingSchema, validateInput } from '@/lib/validation/schemas'
import type { BookingInput } from '@/lib/types'

// GET: Ottieni solo le prenotazioni dell'utente autenticato
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 🔒 SICUREZZA: Mostra solo le prenotazioni dell'utente autenticato
    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id // Solo le MIE prenotazioni
      },
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

// POST: Crea una nuova prenotazione per l'utente autenticato
export async function POST(request: NextRequest) {
  try {
    // 🔒 CONTROLLO AUTENTICAZIONE
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Accesso non autorizzato. Devi essere autenticato per creare una prenotazione.' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // 🛡️ VALIDAZIONE ROBUSTA CON ZOD
    const validation = validateInput(bookingSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const validatedData: BookingInput = validation.data

    // Verifica che il servizio esista
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Servizio non trovato' },
        { status: 404 }
      )
    }

    // 🔒 Controllo conflitti di prenotazione
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        serviceId: validatedData.serviceId,
        bookingDate: validatedData.bookingDate,
        bookingTime: validatedData.bookingTime
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Hai già una prenotazione per questo servizio in questa data e orario' },
        { status: 409 }
      )
    }

    // 🔒 Crea la prenotazione associata all'utente autenticato con dati validati
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        petName: validatedData.petName,
        petType: validatedData.petType,
        serviceId: validatedData.serviceId,
        bookingDate: validatedData.bookingDate,
        bookingTime: validatedData.bookingTime,
        notes: validatedData.notes || null
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