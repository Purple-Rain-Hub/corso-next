import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

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

    // 🔒 Crea la prenotazione associata all'utente autenticato
    const booking = await prisma.booking.create({
      data: {
        userId: user.id, // 🔗 Collego la prenotazione all'utente
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