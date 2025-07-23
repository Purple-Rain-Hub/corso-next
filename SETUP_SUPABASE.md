# 🚀 Configurazione PetShop con Supabase

Questa guida ti aiuterà a configurare il progetto PetShop con l'autenticazione Supabase.

## 📋 Prerequisiti

- Node.js (versione 18 o superiore)
- Un account Supabase gratuito

## 🔧 Setup Iniziale

### 1. Crea un Progetto Supabase

1. Vai su [https://app.supabase.com](https://app.supabase.com)
2. Clicca su "New Project"
3. Scegli un nome per il progetto (es. "petshop")
4. Imposta una password per il database
5. Seleziona una regione vicina a te (es. "West EU" per l'Europa)
6. Clicca "Create new project"

### 2. Ottieni le Credenziali

Una volta creato il progetto:

1. Vai nella sezione **Settings** > **API**
2. Copia i seguenti valori:
   - **Project URL** (sarà simile a `https://xyz.supabase.co`)
   - **Anon Public Key** (lunga stringa che inizia con "eyJ...")

### 3. Configura le Variabili d'Ambiente

Crea un file `.env.local` nella root del progetto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tua-anon-key-molto-lunga

# URL dell'app (per redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

⚠️ **IMPORTANTE**: Sostituisci `tuo-progetto-id` e `tua-anon-key-molto-lunga` con i valori reali ottenuti dal tuo dashboard Supabase.

### 4. Configura l'Autenticazione in Supabase

1. Nel dashboard Supabase, vai su **Authentication** > **Settings**
2. Nella sezione **Site URL**, aggiungi: `http://localhost:3000`
3. Nella sezione **Redirect URLs**, aggiungi:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/reset-password`

### 5. Avvia l'Applicazione

```bash
# Installa le dipendenze (se non già fatto)
npm install

# Avvia il server di sviluppo
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 🎯 Come Funziona l'Autenticazione

### Flusso di Registrazione:
1. L'utente compila il form di registrazione
2. Supabase invia un'email di conferma
3. L'utente clicca il link nell'email
4. Viene reindirizzato all'app con la sessione attiva

### Flusso di Login:
1. L'utente inserisce email e password
2. Supabase verifica le credenziali
3. Se valide, crea una sessione
4. L'utente viene reindirizzato alla dashboard

### Flusso Reset Password:
1. L'utente richiede il reset tramite email
2. Supabase invia un link di reset
3. L'utente clicca il link e imposta una nuova password

## 📁 Struttura del Codice di Autenticazione

```
lib/
├── auth/
│   └── context.tsx          # Context React per l'autenticazione
├── supabase/
│   ├── client.ts           # Client Supabase (browser)
│   └── server.ts           # Client Supabase (server)
app/
├── auth/
│   ├── callback/route.ts   # Gestisce i redirect dopo auth
│   ├── login/page.tsx      # Pagina di login
│   ├── signup/page.tsx     # Pagina di registrazione
│   ├── forgot-password/page.tsx # Reset password
│   └── verify-email/page.tsx    # Verifica email
├── dashboard/page.tsx      # Dashboard utente
├── layout.tsx             # Layout con AuthProvider
└── middleware.ts          # Middleware per proteggere route
```

## 🔐 Spiegazione dei Componenti

### AuthProvider (`lib/auth/context.tsx`)
- **Cosa fa**: Gestisce lo stato dell'utente in tutta l'app
- **Come funziona**: Usa React Context per condividere user, loading e funzioni di auth
- **Funzioni principali**: signUp, signIn, signOut, resetPassword

### Middleware (`middleware.ts`)
- **Cosa fa**: Protegge le route private e gestisce i redirect
- **Come funziona**: Si esegue prima di ogni richiesta
- **Protezioni**: 
  - `/dashboard` richiede autenticazione
  - Utenti autenticati vengono reindirizzati da login/signup

### Client Supabase
- **Browser** (`client.ts`): Per operazioni lato client
- **Server** (`server.ts`): Per operazioni lato server con cookie

## 🎨 Funzionalità dell'App

✅ **Completate**:
- Sistema di autenticazione completo
- Home page del negozio con prodotti
- Dashboard utente
- Middleware per proteggere route
- Pagine di login, signup, reset password
- Design responsive con Tailwind CSS

## 🔧 Troubleshooting

### Errore "Invalid API Key"
- Verifica che `NEXT_PUBLIC_SUPABASE_ANON_KEY` sia corretto
- Assicurati di non avere spazi extra nel file `.env.local`

### Email di conferma non arriva
- Controlla la cartella spam
- Verifica che il Site URL sia configurato correttamente in Supabase

### Redirect dopo login non funziona
- Verifica che gli URL di redirect siano configurati in Supabase
- Controlla che `NEXT_PUBLIC_SITE_URL` sia corretto

## 🚀 Prossimi Passi

Per estendere l'app potresti aggiungere:
- Carrello della spesa
- Sistema di pagamento
- Profilo utente modificabile
- Cronologia ordini
- Sistema di recensioni
- Database prodotti reale

## 📚 Risorse Utili

- [Documentazione Supabase](https://supabase.com/docs)
- [Documentazione Next.js](https://nextjs.org/docs)
- [Guida Supabase + Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) 