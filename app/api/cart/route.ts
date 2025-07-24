import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// GET: Ottieni elementi del carrello per l'utente autenticato
export async function GET(request: NextRequest) {
  try {
    // 🔒 CONTROLLO AUTENTICAZIONE
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Accesso non autorizzato. Devi essere autenticato per vedere il carrello.' },
        { status: 401 }
      )
    }

    // Uso userId invece di sessionId per chiarezza
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: user.id // Uso userId invece di sessionId
      },
      include: {
        service: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Errore nel recupero del carrello:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero del carrello' },
      { status: 500 }
    )
  }
}

// POST: Aggiungi elemento al carrello (solo per utenti autenticati)
export async function POST(request: NextRequest) {
  try {
    // 🔒 CONTROLLO AUTENTICAZIONE
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Accesso non autorizzato. Devi essere autenticato per aggiungere al carrello.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      serviceId,
      petName,
      petType,
      bookingDate,
      bookingTime,
      customerName,
      customerEmail
    } = body

    // Validazione base
    if (!serviceId || !petName || !petType || !bookingDate || !bookingTime) {
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

    // Aggiungi al carrello dell'utente autenticato
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: user.id, // Uso userId invece di sessionId
        serviceId,
        petName,
        petType,
        bookingDate: new Date(bookingDate),
        bookingTime,
        customerName: customerName || user.email || null,
        customerEmail: customerEmail || user.email || null
      },
      include: {
        service: true
      }
    })

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error('Errore nell\'aggiunta al carrello:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiunta al carrello' },
      { status: 500 }
    )
  }
}

// DELETE: Rimuovi elemento dal carrello (solo il proprietario)
export async function DELETE(request: NextRequest) {
  try {
    // 🔒 CONTROLLO AUTENTICAZIONE
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Accesso non autorizzato. Devi essere autenticato per rimuovere dal carrello.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID elemento richiesto' },
        { status: 400 }
      )
    }

    // 🔒 VERIFICA CHE L'ELEMENTO APPARTENGA ALL'UTENTE
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Elemento non trovato' },
        { status: 404 }
      )
    }

    if (cartItem.userId !== user.id) {
      return NextResponse.json(
        { error: 'Non puoi rimuovere elementi dal carrello di altri utenti' },
        { status: 403 }
      )
    }

    await prisma.cartItem.delete({
      where: {
        id: parseInt(id)
      }
    })

    return NextResponse.json({ message: 'Elemento rimosso dal carrello' })
  } catch (error) {
    console.error('Errore nella rimozione dal carrello:', error)
    return NextResponse.json(
      { error: 'Errore nella rimozione dal carrello' },
      { status: 500 }
    )
  }
} 