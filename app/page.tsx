'use client'

import { useAuth } from '@/lib/auth/context'
import Link from 'next/link'
import Image from 'next/image'

// Dati di esempio per i prodotti
const products = [
  {
    id: 1,
    name: "Crocchette Premium per Cani",
    price: 24.99,
    image: "/api/placeholder/300/200",
    category: "Cibo",
    description: "Crocchette di alta qualità per cani adulti"
  },
  {
    id: 2,
    name: "Giocattolo Kong Classic",
    price: 12.50,
    image: "/api/placeholder/300/200",
    category: "Giocattoli",
    description: "Resistente giocattolo per l'intrattenimento"
  },
  {
    id: 3,
    name: "Lettiera per Gatti Bentonite",
    price: 8.99,
    image: "/api/placeholder/300/200",
    category: "Igiene",
    description: "Lettiera agglomerante profumata"
  },
  {
    id: 4,
    name: "Guinzaglio Retrattile",
    price: 18.75,
    image: "/api/placeholder/300/200",
    category: "Accessori",
    description: "Guinzaglio retrattile fino a 5 metri"
  },
  {
    id: 5,
    name: "Cibo per Pesci Tropicali",
    price: 6.30,
    image: "/api/placeholder/300/200",
    category: "Cibo",
    description: "Alimento completo per pesci tropicali"
  },
  {
    id: 6,
    name: "Cuccia Ortopedica",
    price: 45.00,
    image: "/api/placeholder/300/200",
    category: "Accessori",
    description: "Cuccia memory foam per il comfort"
  }
]

export default function Home() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con Navigazione */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">🐾 PetShop</h1>
              <p className="ml-4 text-gray-600 hidden sm:block">
                Il tuo negozio di fiducia per gli amici a quattro zampe
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="text-gray-500">Caricamento...</div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Ciao, {user.email}!</span>
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    Accedi
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Registrati
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold sm:text-5xl">
              Tutto per i tuoi amici pelosi
            </h2>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Scopri la nostra selezione di prodotti di qualità per cani, gatti, pesci e piccoli animali. 
              Cibo, giocattoli, accessori e molto altro!
            </p>
            <div className="mt-10">
              <Link
                href="#prodotti"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Scopri i Prodotti
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione Prodotti */}
      <section id="prodotti" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-extrabold text-gray-900">
              I Nostri Prodotti
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              Selezione curata dei migliori prodotti per i tuoi animali
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-6xl">📦</span>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {product.name}
                    </h4>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {product.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {product.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      €{product.price}
                    </span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Aggiungi al Carrello
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                Spedizione Gratuita
              </h4>
              <p className="text-gray-600">
                Spedizione gratuita per ordini superiori a €50
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Qualità Garantita
              </h4>
              <p className="text-gray-600">
                Prodotti selezionati dai migliori marchi
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
