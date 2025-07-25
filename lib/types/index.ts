// 🎯 Tipi centralizzati per evitare duplicazioni
import type { 
  Service as PrismaService, 
  Booking as PrismaBooking, 
  CartItem as PrismaCartItem 
} from '@/lib/generated/prisma'

// Tipi del database (da Prisma) - ri-esportati
export type Service = PrismaService

// Tipi con relazioni incluse (per frontend)
export type CartItem = PrismaCartItem & {
  service: PrismaService
}

export type Booking = PrismaBooking & {
  service: PrismaService
}

// Tipi per la validazione degli input (da Zod)
export type { 
  CartItemInput, 
  BookingInput, 
  CustomerInfo, 
  CheckoutInput, 
  QueryParams 
} from '@/lib/validation/schemas' 