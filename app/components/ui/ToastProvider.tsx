// Provider per gestione notifiche toast - gestisce stato e visualizzazione messaggi
'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import Toast from './Toast'

interface ToastType {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: 'success' | 'error' | 'info', message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastType[]>([])

  // Gestione aggiunta toast con ID univoco
  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string, duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastType = { id, type, message, duration }
    
    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-0 right-0 z-50 space-y-2 p-4">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            style={{ 
              transform: `translateY(${index * 80}px)`, // Posizionamento staggered dei toast
              transition: 'transform 0.3s ease-in-out'
            }}
          >
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => removeToast(toast.id)}
              duration={toast.duration}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
} 