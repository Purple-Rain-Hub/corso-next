'use client'

import { useState } from 'react'
import { useToast } from '@/app/components/ui/ToastProvider'

interface CreateServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: {
    name: string
    description: string
    price: number
    duration: number
  }) => Promise<void>
}

export default function CreateServiceModal({ isOpen, onClose, onCreate }: CreateServiceModalProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: ''
  })

  const handleFormChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
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
      await onCreate({
        name: form.name.trim(),
        description: form.description.trim(),
        price: price,
        duration: duration
      })
      
      // Reset del form dopo la creazione
      setForm({
        name: '',
        description: '',
        price: '',
        duration: ''
      })
      onClose()
    } catch (error) {
      console.error('Error creating service:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    // Reset del form quando si chiude la modale
    setForm({
      name: '',
      description: '',
      price: '',
      duration: ''
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header della modale */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Nuovo Servizio
          </h2>
          <button
            onClick={handleClose}
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
            <label htmlFor="create-name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome Servizio *
            </label>
            <input
              type="text"
              id="create-name"
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Es. Toelettatura completa"
            />
          </div>

          {/* Descrizione */}
          <div>
            <label htmlFor="create-description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione *
            </label>
            <textarea
              id="create-description"
              value={form.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descrivi il servizio in dettaglio..."
            />
          </div>

          {/* Prezzo e Durata in due colonne */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="create-price" className="block text-sm font-medium text-gray-700 mb-2">
                Prezzo (€) *
              </label>
              <input
                type="number"
                id="create-price"
                value={form.price}
                onChange={(e) => handleFormChange('price', e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="create-duration" className="block text-sm font-medium text-gray-700 mb-2">
                Durata (min) *
              </label>
              <input
                type="number"
                id="create-duration"
                value={form.duration}
                onChange={(e) => handleFormChange('duration', e.target.value)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="60"
              />
            </div>
          </div>
        </div>

        {/* Footer con pulsanti */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{loading ? 'Creando...' : 'Crea Servizio'}</span>
          </button>
        </div>
      </div>
    </div>
  )
} 