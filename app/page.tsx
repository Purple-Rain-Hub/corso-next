'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold sm:text-5xl">
              Tutto per il benessere dei tuoi amici pelosi
            </h2>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Scopri i nostri servizi professionali per cani, gatti e piccoli animali. 
              Toelettatura, visite veterinarie, addestramento e molto altro!
            </p>
            <div className="mt-10">
              <Link
                href="/prenotazioni"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Prenota un Servizio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione Servizi di Prenotazione */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-extrabold text-gray-900">
              Servizi per i tuoi Amici
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              Prenota facilmente i nostri servizi professionali
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center">
                <div className="text-5xl mb-4">🐕</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  Prenota un Servizio
                </h4>
                <p className="text-gray-600 mb-6">
                  Toelettatura, visite veterinarie, addestramento e molto altro. 
                  Aggiungi i servizi al carrello e prenota quando vuoi.
                </p>
                <Link
                  href="/prenotazioni"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                >
                  Prenota Ora
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center">
                <div className="text-5xl mb-4">📋</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  Gestisci Prenotazioni
                </h4>
                <p className="text-gray-600 mb-6">
                  Visualizza tutte le prenotazioni, controlla gli stati e 
                  monitora l'andamento dei servizi prenotati.
                </p>
                <Link
                  href="/prenotazioni/gestione"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                >
                  Vedi Prenotazioni
                </Link>
              </div>
            </div>
          </div>

          {/* Statistiche servizi */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-gray-600">Servizi Disponibili</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">✂️</div>
              <div className="text-sm text-gray-600">Toelettatura</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">🏥</div>
              <div className="text-sm text-gray-600">Cure Veterinarie</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-orange-600">🎓</div>
              <div className="text-sm text-gray-600">Addestramento</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione Benefici */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Servizio a Domicilio
              </h4>
              <p className="text-gray-600">
                Alcuni servizi disponibili direttamente a casa tua
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Qualità Garantita
              </h4>
              <p className="text-gray-600">
                Servizi professionali con personale qualificato
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Supporto Clienti
              </h4>
              <p className="text-gray-600">
                Assistenza dedicata per ogni esigenza
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h5 className="text-2xl font-bold mb-4">🐾 PetShop</h5>
            <p className="text-gray-400 mb-8">
              Il benessere dei tuoi animali è la nostra missione
            </p>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500 text-sm">
                © 2024 PetShop. Tutti i diritti riservati.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
