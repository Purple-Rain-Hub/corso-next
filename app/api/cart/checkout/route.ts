import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Converti carrello in prenotazioni
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, customerInfo } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID sessione richiesto' },
        { status: 400 }
      )
    }

    // Ottieni tutti gli elementi del carrello
    const cartItems = await prisma.cartItem.findMany({
      where: { sessionId },
      include: { service: true }
    })

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Carrello vuoto' },
        { status: 400 }
      )
    }

    // Crea le prenotazioni
    const bookings = await Promise.all(
      cartItems.map(item => 
        prisma.booking.create({
          data: {
            customerName: customerInfo?.name || item.customerName || 'Cliente',
            customerEmail: customerInfo?.email || item.customerEmail || 'email@example.com',
            petName: item.petName,
            petType: item.petType,
            serviceId: item.serviceId,
            bookingDate: item.bookingDate,
            bookingTime: item.bookingTime,
            status: 'confirmed'
          },
          include: {
            service: true
          }
        })
      )
    )

    // Svuota il carrello
    await prisma.cartItem.deleteMany({
      where: { sessionId }
    })

    return NextResponse.json({
      message: 'Prenotazioni create con successo',
      bookings
    })
  } catch (error) {
    console.error('Errore nel checkout:', error)
    return NextResponse.json(
      { error: 'Errore nel checkout' },
      { status: 500 }
    )
  }
} 