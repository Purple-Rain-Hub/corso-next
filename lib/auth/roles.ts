// Utility per gestione ruoli e permessi - validazione e controllo accessi
import { UserRole, ROLE_LABELS, ROLE_DESCRIPTIONS } from './types'
import type { Permission } from './types'

// 🔒 VALIDAZIONE SICURA DEI RUOLI
// Previene injection di ruoli non validi e logging per sicurezza
export function validateRole(role: unknown): UserRole {
  // Validazione strict con whitelist - solo ruoli definiti nell'enum
  if (typeof role === 'string' && Object.values(UserRole).includes(role as UserRole)) {
    return role as UserRole
  }
  
  // Log tentativi di ruolo non valido per sicurezza
  // Aiuta a rilevare tentativi di manipolazione
  if (role !== undefined && role !== null) {
    console.warn(`[SECURITY] Tentativo di assegnazione ruolo non valido: ${role}`)
  }
  
  return UserRole.CUSTOMER
}

// Verifica se un ruolo è valido
// Type guard che restringe il tipo a UserRole se valido
export function isValidRole(role: unknown): role is UserRole { 
  return typeof role === 'string' && Object.values(UserRole).includes(role as UserRole)
} //role is UserRole rende la funzione di tipo boolean e "assegna" UserRole a role se true

// Funzioni di utilità per verificare i ruoli
export function isAdmin(role?: UserRole | null): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN
}

export function isSuperAdmin(role?: UserRole | null): boolean {
  return role === UserRole.SUPER_ADMIN
}

export function isCustomer(role?: UserRole | null): boolean {
  return role === UserRole.CUSTOMER
}

// Funzione per verificare se un utente ha un ruolo specifico
// Implementa gerarchia dei ruoli: SUPER_ADMIN > ADMIN > CUSTOMER
export function hasRole(userRole?: UserRole | null, requiredRole?: UserRole): boolean {
  if (!userRole || !requiredRole) return false
  
  // Super admin può accedere a tutto
  if (userRole === UserRole.SUPER_ADMIN) return true
  
  // Admin può accedere a funzioni customer
  if (userRole === UserRole.ADMIN && requiredRole === UserRole.CUSTOMER) return true
  
  // Stesso ruolo
  return userRole === requiredRole //perché le uniche casistiche di ruoli diversi ma true sono quelle sopra
}

// Gerarchia dei ruoli per confronti
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.CUSTOMER]: 0,
  [UserRole.ADMIN]: 1,
  [UserRole.SUPER_ADMIN]: 2
}

// Verifica se un ruolo ha almeno il livello richiesto
export function hasMinimumRole(userRole?: UserRole | null, minimumRole?: UserRole): boolean {
  if (!userRole || !minimumRole) return false
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole]
}

// Mappa dei permessi per ruolo
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = { //record è un oggetto con chiave UserRole e valore Permission[]
  [UserRole.CUSTOMER]: [
    'read_services'
  ],
  [UserRole.ADMIN]: [
    'read_services',
    'write_services',
    'delete_services',
    'read_bookings',
    'write_bookings',
    'delete_bookings',
    'admin_dashboard'
  ],
  [UserRole.SUPER_ADMIN]: [
    'read_services',
    'write_services',
    'delete_services',
    'read_bookings',
    'write_bookings',
    'delete_bookings',
    'read_users',
    'write_users',
    'delete_users',
    'admin_dashboard',
    'system_settings'
  ]
}

// Funzione per verificare se un utente ha un permesso specifico
export function hasPermission(userRole?: UserRole | null, permission?: Permission): boolean {
  if (!userRole || !permission) return false
  
  const permissions = ROLE_PERMISSIONS[userRole] || [] //ottiene i permessi del ruolo dell'utente, se non ci sono ritorna un array vuoto
  return permissions.includes(permission) //controlla se il permesso è presente nell'array dei permessi del ruolo
}

// 🔒 SICUREZZA: Verifica se una transizione di ruolo è permessa
export function canChangeRole(
  currentUserRole: UserRole, //currentUserRole è il ruolo dell'utente che sta cambiando il ruolo di un altro utente 
  targetRole: UserRole, //targetRole è il ruolo che l'utente vuole assegnare a un altro utente
  userToChangeRole: UserRole //userToChangeRole è il ruolo attuale dell'utente da modificare
): { allowed: boolean; reason?: string } {
  // Solo SUPER_ADMIN può modificare ruoli
  if (currentUserRole !== UserRole.SUPER_ADMIN) {
    return { allowed: false, reason: 'Solo i Super Admin possono modificare i ruoli' }
  }
  
  // SUPER_ADMIN non può modificare altri SUPER_ADMIN (per sicurezza)
  if (userToChangeRole === UserRole.SUPER_ADMIN && targetRole !== UserRole.SUPER_ADMIN) {
    return { allowed: false, reason: 'Non puoi modificare il ruolo di un altro Super Admin' }
  }
  
  // Validazione che il ruolo target sia valido
  if (!isValidRole(targetRole)) {
    return { allowed: false, reason: 'Ruolo target non valido' }
  }
  
  return { allowed: true }
}

// 🔄 Re-export delle costanti per convenienza (manteniamo solo queste)
export { ROLE_LABELS, ROLE_DESCRIPTIONS } //perché sono usati nel componente AdminSidebar nel frontend