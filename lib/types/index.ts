// 🎯 AGGREGATORE BUSINESS - Tipi per componenti e logica business

// Import and re-export tipi database (Prisma)
import type { Service, Booking, CartItem } from '@/lib/generated/prisma'

export type {
  Service,
  Booking,
  CartItem,
}

// Tipi estesi con relazioni incluse (pattern efficiente!)
export type BookingWithService = Booking & {
  service: Service
}

export type CartItemWithService = CartItem & {
  service: Service
}

// Re-export tipi validazione
export type { 
  CartItemInput, 
  BookingInput, 
  CustomerInfo, 
  CheckoutInput, 
  QueryParams 
} from '@/lib/validation/schemas' 