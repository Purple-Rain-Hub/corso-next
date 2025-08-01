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
    .max(20, 'Il nome non può superare i 20 caratteri')
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

// 📝 Schema per la prenotazione
export const bookingSchema = z.object({
  customerName: z.string().min(1, 'Nome cliente richiesto').max(20, 'Nome cliente non può superare i 20 caratteri').regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Il nome può contenere solo lettere, spazi, apostrofi e trattini').transform(val => val.trim()),
  customerEmail: z.string().min(1, 'Email cliente richiesta').email('Formato email non valido'),
  petName: z.string().min(1, 'Nome animale richiesto').max(20, 'Nome animale non può superare i 20 caratteri').regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Il nome può contenere solo lettere, spazi, apostrofi e trattini').transform(val => val.trim()),
  petType: z.enum(['Cane', 'Gatto', 'Coniglio', 'Uccello', 'Criceto', 'Pesce', 'Tartaruga', 'Furetto', 'Altro']),
  bookingDate: z.date().refine(date => date >= new Date(), {
    message: 'La data deve essere odierna o futura'
  }),
  bookingTime: z.string()
    .regex(/^(08|09|10|11):(00|30)$|^1[4-7]:(00|30)$|^18:00$/, 
      'Orario non valido. Orari consentiti: 08:00-11:30, 14:00-18:00'),
  notes: z.string().optional()
})

// 📤 Tipi TypeScript derivati dagli schemi (per un uso più semplice)
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type BookingInput = z.infer<typeof bookingSchema>

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