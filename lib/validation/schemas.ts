import { z } from 'zod'

// 🧹 Funzione di sanitizzazione per prevenire XSS
function sanitizeString(str: string): string {
  return str
    .trim() // Rimuovi spazi
    .replace(/[<>]/g, '') // Rimuovi caratteri HTML pericolosi
    .replace(/javascript:/gi, '') // Rimuovi javascript:
    .replace(/on\w+=/gi, '') // Rimuovi event handlers (onclick, onload, etc.)
    .slice(0, 255) // Limita lunghezza massima
}

// 🐾 Tipi di animali consentiti
const ALLOWED_PET_TYPES = [
  'Cane', 'Gatto', 'Coniglio', 'Uccello', 'Criceto', 
  'Pesce', 'Tartaruga', 'Furetto', 'Altro'
] as const

// ⏰ Regex per formato orario HH:MM
const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/

// 📧 Schema per validazione email robusta
const emailSchema = z
  .string()
  .email('Formato email non valido')
  .min(5, 'Email troppo corta')
  .max(100, 'Email troppo lunga')
  .transform(sanitizeString)

// 📝 Schema per nomi (persone e animali)
const nameSchema = z
  .string()
  .min(1, 'Nome richiesto')
  .max(50, 'Nome troppo lungo (max 50 caratteri)')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome contiene caratteri non validi')
  .transform(sanitizeString)

// 📅 Schema per data di prenotazione (deve essere nel futuro)
const bookingDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido (YYYY-MM-DD)')
  .refine((date) => {
    const bookingDate = new Date(date)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return bookingDate >= tomorrow
  }, 'La data di prenotazione deve essere almeno domani')
  .transform((date) => new Date(date))

// ⏰ Schema per orario di prenotazione
const bookingTimeSchema = z
  .string()
  .regex(TIME_REGEX, 'Formato orario non valido (HH:MM)')
  .refine((time) => {
    const [hours, minutes] = time.split(':').map(Number)
    // Orari di lavoro: 08:00 - 18:00
    return hours >= 8 && hours <= 18
  }, 'Orario non disponibile (orari di lavoro: 08:00 - 18:00)')

// 🐾 Schema per tipo di animale
const petTypeSchema = z
  .enum(ALLOWED_PET_TYPES)
  .refine((value) => ALLOWED_PET_TYPES.includes(value), {
    message: `Tipo di animale non valido. Tipi consentiti: ${ALLOWED_PET_TYPES.join(', ')}`
  })

// 🔢 Schema per ID servizio
const serviceIdSchema = z
  .number()
  .int('ID servizio deve essere un numero intero')
  .positive('ID servizio deve essere positivo')

// 📝 Schema per note opzionali
const notesSchema = z
  .string()
  .max(500, 'Note troppo lunghe (max 500 caratteri)')
  .transform(sanitizeString)
  .optional()

// 🛒 Schema per elementi del carrello
export const cartItemSchema = z.object({
  serviceId: serviceIdSchema,
  petName: nameSchema,
  petType: petTypeSchema,
  bookingDate: bookingDateSchema,
  bookingTime: bookingTimeSchema,
  customerName: nameSchema.optional(),
  customerEmail: emailSchema.optional()
})

// 📋 Schema per prenotazioni dirette
export const bookingSchema = z.object({
  customerName: nameSchema,
  customerEmail: emailSchema,
  petName: nameSchema,
  petType: petTypeSchema,
  serviceId: serviceIdSchema,
  bookingDate: bookingDateSchema,
  bookingTime: bookingTimeSchema,
  notes: notesSchema
})

// 💳 Schema per informazioni cliente nel checkout
export const customerInfoSchema = z.object({
  name: nameSchema,
  email: emailSchema
})

// 🛍️ Schema per checkout completo
export const checkoutSchema = z.object({
  customerInfo: customerInfoSchema.optional()
})

// 🔍 Schema per query parametri (GET requests) (usato nella DELETE dal carrello)
export const queryParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID deve essere un numero')
    .transform(Number)
    .refine((id) => id > 0, 'ID deve essere positivo')
})

// 📊 Tipi TypeScript derivati dagli schemi
export type CartItemInput = z.infer<typeof cartItemSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type CustomerInfo = z.infer<typeof customerInfoSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type QueryParams = z.infer<typeof queryParamsSchema>

// 🚨 Funzione helper per gestire errori di validazione
export function formatValidationError(error: z.ZodError): string {
  const errors = error.issues.map((err: any) => {
    const field = err.path.join('.')
    return `${field}: ${err.message}`
  })
  
  return `Errori di validazione: ${errors.join(', ')}`
}

// ✅ Funzione helper per validazione sicura
export function validateInput<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: formatValidationError(error) }
    }
    return { success: false, error: 'Errore di validazione sconosciuto' }
  }
} 