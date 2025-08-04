// Context per autenticazione Supabase - gestisce stato utente e operazioni auth
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Gestione stato autenticazione e listener per cambiamenti
  useEffect(() => {
    // Ottieni la sessione iniziale al mount del componente
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Ascolta i cambiamenti di autenticazione (login/logout)
    // Aggiorna automaticamente lo stato quando cambia la sessione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          full_name: fullName
        }
      }
    })

    if (error) {
      // Gestiamo specificamente l'errore di email già registrata
      if (error.message.includes('User already registered') || 
          error.message.includes('already been registered') ||
          error.message.includes('already registered') ||
          error.message.includes('Email rate limit exceeded') ||
          error.code === 'user_already_exists' ||
          error.code === 'email_address_not_authorized') {
        throw new Error('Questa email è già registrata. Prova ad accedere o usa "Password dimenticata?" se hai perso le credenziali.')
      }
      
      // Gestiamo altri errori comuni
      if (error.message.includes('Password should be at least')) {
        throw new Error('La password deve essere di almeno 6 caratteri')
      }
      
      if (error.message.includes('Invalid email')) {
        throw new Error('L\'indirizzo email non è valido')
      }
      
      if (error.message.includes('Password')) {
        throw new Error('La password non rispetta i requisiti di sicurezza')
      }
      
      // Per tutti gli altri errori, mostriamo un messaggio generico ma utile
      console.error('Errore durante la registrazione:', error)
      throw new Error('Errore durante la registrazione. Verifica i dati inseriti e riprova.')
    }

    // 🔧 RILEVAMENTO EMAIL GIÀ REGISTRATA
    // Supabase non restituisce errori espliciti per email duplicate ma 
    // restituisce un utente con identities vuoto quando l'email esiste già
    // Questo è un workaround per gestire il caso edge di Supabase
    if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
      throw new Error('Questa email è già registrata. Prova ad accedere o usa "Password dimenticata?" se hai perso le credenziali.')
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`
    })
    if (error) throw error
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signUp, 
        signIn, 
        signOut, 
        resetPassword 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 