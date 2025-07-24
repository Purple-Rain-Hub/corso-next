import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Ottieni elementi del carrello per una sessione
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID sessione richiesto' },
        { status: 400 }
      )
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        sessionId
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

// POST: Aggiungi elemento al carrello
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sessionId,
      serviceId,
      petName,
      petType,
      bookingDate,
      bookingTime,
      customerName,
      customerEmail
    } = body

    // Validazione base
    if (!sessionId || !serviceId || !petName || !petType || !bookingDate || !bookingTime) {
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

    // Aggiungi al carrello
    const cartItem = await prisma.cartItem.create({
      data: {
        sessionId,
        serviceId,
        petName,
        petType,
        bookingDate: new Date(bookingDate),
        bookingTime,
        customerName: customerName || null,
        customerEmail: customerEmail || null
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

// DELETE: Rimuovi elemento dal carrello
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID elemento richiesto' },
        { status: 400 }
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