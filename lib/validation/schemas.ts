// 🐾 Tipi di animali consentiti
export type PetType = 
  | 'Cane' 
  | 'Gatto' 
  | 'Coniglio' 
  | 'Uccello' 
  | 'Criceto' 
  | 'Pesce' 
  | 'Tartaruga' 
  | 'Furetto' 
  | 'Altro'

// 🛒 Tipo per elementi del carrello
export interface CartItemInput {
  serviceId: number
  petName: string
  petType: PetType
  bookingDate: Date
  bookingTime: string
  customerName?: string
  customerEmail?: string
}

// 📋 Tipo per prenotazioni dirette
export interface BookingInput {
  customerName: string
  customerEmail: string
  petName: string
  petType: PetType
  serviceId: number
  bookingDate: Date
  bookingTime: string
  notes?: string
}

// 💳 Tipo per informazioni cliente
export interface CustomerInfo {
  name: string
  email: string
}

// 🛍️ Tipo per checkout completo
export interface CheckoutInput {
  customerInfo?: CustomerInfo
}

// 🔍 Tipo per query parametri (GET requests)
export interface QueryParams {
  id: number
} 