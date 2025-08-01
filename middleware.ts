import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { UserRole } from '@/lib/auth/types'

// 🔒 Funzione edge-compatible per verificare admin (manteniamo locale per performance edge)
function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN
}

// 🔒 Funzione edge-compatible per validare ruoli (manteniamo locale per edge runtime)
function validateRole(role: unknown): UserRole {
  if (typeof role === 'string' && Object.values(UserRole).includes(role as UserRole)) {
    return role as UserRole
  }
  return UserRole.CUSTOMER
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and supabase.auth.getUser()
  // Un semplice errore può rendere il client inaccessibile ai tuoi utenti

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 🔒 PROTEZIONE ROUTE ADMIN (controlli di base)
  // AdminGuard si occuperà dei permessi granulari e UX
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // Non autenticato, redirect al login
      const url = request.nextUrl.clone() //clone crea una nuova URL con i parametri dell'URL originale
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', request.nextUrl.pathname) //riporta utente dove voleva andare dopo il login
      return NextResponse.redirect(url)
    }

    // Validazione ruolo admin con controllo isActive
    const userRole = validateRole(user.user_metadata?.role)
    const isActive = user.user_metadata?.isActive !== false
    
    if (!isAdmin(userRole) || !isActive) {
      // Non è admin o account disattivato, redirect alla dashboard con messaggio di errore
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.searchParams.set('error', 'access_denied') //parametro per AdminGuard
      return NextResponse.redirect(url)
    }
  }

  // 🔒 PROTEZIONE API ADMIN
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    if (!user) {
      return NextResponse.json(
        { error: 'Autenticazione richiesta', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const userRole = validateRole(user.user_metadata?.role)
    const isActive = user.user_metadata?.isActive !== false
    
    if (!isAdmin(userRole) || !isActive) {
      return NextResponse.json(
        { error: 'Permessi amministratore richiesti', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }
  }

  // Proteggi le route che richiedono autenticazione
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    // Non è autenticato, redirect al login
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Proteggi le route di prenotazioni e carrello
  if ((request.nextUrl.pathname.startsWith('/prenotazioni') || 
       request.nextUrl.pathname.startsWith('/carrello')) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect gli utenti autenticati dalle pagine di auth alla dashboard
  if ((request.nextUrl.pathname.startsWith('/auth/login') || 
       request.nextUrl.pathname.startsWith('/auth/signup')) && user) {
    const url = request.nextUrl.clone()
    const redirectTo = url.searchParams.get('redirect') || '/dashboard'
    url.pathname = redirectTo
    url.searchParams.delete('redirect')
    return NextResponse.redirect(url)
  }

  // IMPORTANT: Devi restituire supabaseResponse altrimenti i cookie potrebbero non essere salvati!
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 