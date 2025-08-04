// Tipi e enum per sistema di ruoli e autorizzazioni
// Definizioni dei ruoli per compatibilità con middleware e edge runtime
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// Tipo per i permessi
export type Permission = 
  | 'read_services'
  | 'write_services'
  | 'delete_services'
  | 'read_bookings'
  | 'write_bookings'
  | 'delete_bookings'
  | 'read_users'
  | 'write_users'
  | 'delete_users'
  | 'admin_dashboard'
  | 'system_settings'

// Costanti per i ruoli
export const ROLES = UserRole

// Etichette leggibili per i ruoli
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'Cliente',
  [UserRole.ADMIN]: 'Amministratore',
  [UserRole.SUPER_ADMIN]: 'Super Amministratore'
}

// Descrizioni dettagliate dei ruoli
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'Può visualizzare servizi e effettuare prenotazioni',
  [UserRole.ADMIN]: 'Può gestire servizi, prenotazioni e accedere al pannello admin',
  [UserRole.SUPER_ADMIN]: 'Accesso completo al sistema, inclusa gestione utenti e impostazioni'
} 