// 🎯 AGGREGATORE BUSINESS - Tipi per componenti e logica business

// Re-export tipi database (Prisma)
export type {
  Service,
  Booking,
  CartItem,
} from '@/lib/generated/prisma'

// Re-export tipi validazione
export type { 
  CartItemInput, 
  BookingInput, 
  CustomerInfo, 
  CheckoutInput, 
  QueryParams 
} from '@/lib/validation/schemas' 