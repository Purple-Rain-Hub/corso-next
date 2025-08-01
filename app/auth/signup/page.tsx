'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import Link from 'next/link'
import { signupSchema, type SignupInput } from '@/lib/validation/schemas'

export default function SignUpPage() {
  const [formData, setFormData] = useState<SignupInput>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<SignupInput>>({})
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()

  // Validazione real-time per campo singolo
  const validateField = (field: keyof SignupInput, value: string) => {
    // Per confirmPassword dobbiamo validare entrambi i campi password
    if (field === 'confirmPassword') {
      const result = signupSchema.pick({ password: true, confirmPassword: true }).safeParse({ 
        password: formData.password,
        confirmPassword: value 
      })
      
      if (!result.success) {
        const fieldError = result.error.issues.find(issue => 
          issue.path.includes('confirmPassword')
        )
        setErrors(prev => ({ ...prev, confirmPassword: fieldError?.message || '' }))
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }))
      }
    } else {
      const result = signupSchema.pick({ [field]: true }).safeParse({ [field]: value })
      
      if (!result.success) {
        const fieldError = result.error.issues.find(issue => issue.path[0] === field)
        setErrors(prev => ({ ...prev, [field]: fieldError?.message || '' }))
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }))
      }
    }
  }

  const handleChange = (field: keyof SignupInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validazione completa del form con Zod
    const result = signupSchema.safeParse(formData)
    
    if (!result.success) {
      const fieldErrors: Partial<SignupInput> = {}
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof SignupInput
        if (issue.path.includes('confirmPassword')) {
          fieldErrors.confirmPassword = issue.message
        } else {
          fieldErrors[field] = issue.message
        }
      })
      setErrors(fieldErrors)
      setLoading(false)
      return
    }

    try {
      // result.data contiene i dati validati e trasformati (es. fullName con trim)
      await signUp(result.data.email, result.data.password, result.data.fullName)
      setSuccess(true)
    } catch (error: any) {
      setErrors({ email: error.message || 'Errore durante la registrazione' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Registrazione completata!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Controlla la tua email per confermare l'account
            </p>
            <Link 
              href="/auth/login"
              className="mt-4 inline-block text-blue-600 hover:text-blue-500"
            >
              Torna al login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crea il tuo account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Unisciti alla famiglia PetShop
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nome Completo *
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none ${
                  errors.fullName 
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Mario Rossi"
                maxLength={50}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Solo lettere, spazi, apostrofi e trattini
              </p>
            </div>
            
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
                placeholder="Minimo 6 caratteri"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Conferma Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none ${
                  errors.confirmPassword 
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Ripeti la password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Hai già un account?{' '}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Accedi
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
} 