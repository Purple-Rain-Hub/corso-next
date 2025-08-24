'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/app/components/ui/ToastProvider'
import type { ServiceWithCounts } from '@/lib/types'

interface EditServiceModalProps {
  isOpen: boolean
  service: ServiceWithCounts | null
  onClose: () => void
  onUpdate: (serviceId: number, data: {
    name: string
    description: string
    price: number
    duration: number
  }) => Promise<void>
}

export default function EditServiceModal({ isOpen, service, onClose, onUpdate }: EditServiceModalProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: ''
  })

  // Aggiorna il form quando cambia il servizio
  useEffect(() => {
    if (service) {
      setForm({
        name: service.name,
        description: service.description,
        price: service.price.toString(),
        duration: service.duration.toString()
      })
    }
  }, [service])

  const handleFormChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!service) return

    // Validazione base
    if (!form.name.trim() || !form.description.trim() || !form.price || !form.duration) {
      showToast('error', 'Tutti i campi sono obbligatori')
      return
    }

    const price = parseFloat(form.price)
    const duration = parseInt(form.duration)

    if (isNaN(price) || price <= 0) {
      showToast('error', 'Il prezzo deve essere un numero maggiore di zero')
      return
    }

    if (isNaN(duration) || duration <= 0) {
      showToast('error', 'La durata deve essere un numero maggiore di zero')
      return
    }

    try {
      setLoading(true)
      await onUpdate(service.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        price: price,
        duration: duration
      })
      onClose()
    } catch (error) {
      console.error('Error updating service:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !service) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header della modale */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Modifica Servizio
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome Servizio *
            </label>
            <input
              type="text"
              id="edit-name"
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
              placeholder="Nome del servizio"
            />
          </div>

          {/* Descrizione */}
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione *
            </label>
            <textarea
              id="edit-description"
              value={form.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 resize-none"
              placeholder="Descrizione del servizio"
            />
          </div>

          {/* Prezzo e Durata in due colonne */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-2">
                Prezzo (€) *
              </label>
                              <input
                  type="number"
                  id="edit-price"
                  value={form.price}
                  onChange={(e) => handleFormChange('price', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
                  placeholder="0.00"
                />
            </div>

            <div>
              <label htmlFor="edit-duration" className="block text-sm font-medium text-gray-700 mb-2">
                Durata (min) *
              </label>
                              <input
                  type="number"
                  id="edit-duration"
                  value={form.duration}
                  onChange={(e) => handleFormChange('duration', e.target.value)}
                  min="1"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
                  placeholder="60"
                />
            </div>
          </div>
        </div>

        {/* Footer con pulsanti */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{loading ? 'Salvando...' : 'Salva Modifiche'}</span>
          </button>
        </div>
      </div>


    </div>
  )
} 