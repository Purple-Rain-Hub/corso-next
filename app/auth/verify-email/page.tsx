import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verifica la tua email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ti abbiamo inviato un'email di conferma. Clicca sul link per attivare il tuo account.
          </p>
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Non hai ricevuto l'email? Controlla la cartella spam.
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
    </div>
  )
} 