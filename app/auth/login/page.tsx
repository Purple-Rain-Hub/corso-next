'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginSchema, type LoginInput } from '@/lib/validation/schemas'

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<LoginInput>>({}) //partial rende i campi di LoginInput opzionali
  const { signIn } = useAuth()
  const router = useRouter()

  // Validazione real-time per campo singolo
  const validateField = (field: keyof LoginInput, value: string) => {
    const result = loginSchema.pick({ [field]: true }).safeParse({ [field]: value })
    
    if (!result.success) {
      const fieldError = result.error.issues.find(issue => issue.path[0] === field)
      setErrors(prev => ({ ...prev, [field]: fieldError?.message || '' }))
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleChange = (field: keyof LoginInput) => (e: React.ChangeEvent<HTMLInputElement>) => { //usato currying
    const value = e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Validazione real-time solo se l'utente ha già interagito con il campo
    if (formData[field] !== '') {
      validateField(field, value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Validazione completa del form
    const result = loginSchema.safeParse(formData)
    
    if (!result.success) {
      const fieldErrors: Partial<LoginInput> = {}
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof LoginInput
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      setLoading(false)
      return
    }

    try {
      await signIn(result.data.email, result.data.password)
      router.push('/dashboard')
    } catch (error: any) {
      setErrors({ email: error.message || 'Errore durante il login' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Accedi al tuo account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entra nel mondo di PetShop
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none ${
                  errors.email 
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="la-tua-email@esempio.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange('password')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none ${
                  errors.password 
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="La tua password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Password dimenticata?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Non hai un account?{' '}
              <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Registrati
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
} 