import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import type { CheckoutInput } from '@/lib/types'

// POST: Converti carrello in prenotazioni (solo per utenti autenticati)
export async function POST(request: NextRequest) {
  try {
    // 🔒 CONTROLLO AUTENTICAZIONE
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Accesso non autorizzato. Devi essere autenticato per effettuare il checkout.' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validazione base del body
    const { customerInfo }: CheckoutInput = body

    // 🔒 OTTENGO SOLO GLI ELEMENTI DEL CARRELLO DELL'UTENTE AUTENTICATO
    const cartItems = await prisma.cartItem.findMany({
      where: { 
        userId: user.id
      },
      include: { service: true }
    })

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Il tuo carrello è vuoto. Aggiungi almeno un servizio prima del checkout.' },
        { status: 400 }
      )
    }

    // 🔒 VALIDAZIONE AGGIUNTIVA: Verifica che tutti gli elementi appartengano all'utente
    const invalidItems = cartItems.filter(item => item.userId !== user.id)
    if (invalidItems.length > 0) {
      return NextResponse.json(
        { error: 'Errore di sicurezza: elementi non validi nel carrello.' },
        { status: 403 }
      )
    }

    // 🔒 VALIDAZIONE CUSTOMER INFO
    const finalCustomerName = customerInfo?.name || user.email || 'Cliente'
    const finalCustomerEmail = customerInfo?.email || user.email
    
    if (!finalCustomerEmail) {
      return NextResponse.json(
        { error: 'Email del cliente richiesta per completare la prenotazione.' },
        { status: 400 }
      )
    }

    // 🔒 TRANSAZIONE ATOMICA per garantire consistenza
    const result = await prisma.$transaction(async (tx) => { //$transaction per garantire che tutte le operazioni siano eseguite o nessuna
      // Crea le prenotazioni con collegamento all'utente
    const bookings = await Promise.all(
      cartItems.map(item => 
          tx.booking.create({
          data: {
              userId: user.id, // 🔗 Collego la prenotazione all'utente
              customerName: finalCustomerName,
              customerEmail: finalCustomerEmail,
            petName: item.petName,
            petType: item.petType,
            serviceId: item.serviceId,
            bookingDate: item.bookingDate,
            bookingTime: item.bookingTime,
              status: 'confirmed',
              notes: item.notes || 'Prenotazione creata tramite checkout online'
          },
          include: {
            service: true
          }
        })
      )
    )

      // Svuota SOLO il carrello dell'utente autenticato
      await tx.cartItem.deleteMany({
        where: { 
          userId: user.id // Uso userId invece di sessionId
        }
      })

      return bookings
    })

    return NextResponse.json({
      message: `Checkout completato con successo! Create ${result.length} prenotazioni.`,
      bookings: result,
      userEmail: finalCustomerEmail
    })
    
  } catch (error) {
    console.error('Errore nel checkout:', error)
    return NextResponse.json(
      { error: 'Errore durante il checkout. Riprova tra qualche minuto.' },
      { status: 500 }
    )
  }
} 