import { z } from 'zod'

// 🔐 Schema per il login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email richiesta')
    .email('Formato email non valido'),
  password: z
    .string()
    .min(1, 'Password richiesta')
    .max(20, 'Password non può superare i 20 caratteri')
})

// 📝 Schema per il signup
export const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Il nome deve essere di almeno 2 caratteri')
    .max(50, 'Il nome non può superare i 50 caratteri')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Il nome può contenere solo lettere, spazi, apostrofi e trattini')
    .transform(val => val.trim()), // Rimuove spazi iniziali e finali automaticamente
  email: z
    .string()
    .min(1, 'Email richiesta')
    .email('Formato email non valido'),
  password: z
    .string()
    .min(6, 'La password deve essere di almeno 6 caratteri')
    .max(20, 'Password non può superare i 20 caratteri'),
  confirmPassword: z
    .string()
    .min(1, 'Conferma password richiesta')
    .max(20, 'Password non può superare i 20 caratteri')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Le password non coincidono',
  path: ['confirmPassword'] // Specifica quale campo mostra l'errore
})

// 📤 Tipi TypeScript derivati dagli schemi (per un uso più semplice)
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>

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