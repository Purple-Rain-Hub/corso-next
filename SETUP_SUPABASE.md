# 🚀 Setup Supabase per PetShop

Questa guida ti aiuterà con la **configurazione completa** di Supabase per il progetto PetShop.

## 📋 Prerequisiti

- ✅ Node.js (versione 18 o superiore)
- ✅ Account Supabase gratuito
- ✅ Progetto Next.js già clonato

## 🔧 Configurazione Base

### 1. Crea Progetto Supabase
1. Vai su [https://app.supabase.com](https://app.supabase.com)
2. Clicca "New Project"
3. Scegli un nome (es. "petshop-app")
4. Scegli una password forte per il database
5. Seleziona la regione più vicina
6. Clicca "Create new project"

### 2. Ottieni le Credenziali
1. Nel dashboard, vai su **Settings** > **API**
2. Copia:
   - **Project URL** (es. `https://xyz.supabase.co`)
   - **Anon Key** (chiave pubblica molto lunga)

### 3. Configura Variabili d'Ambiente
Crea un file `.env.local` nella root del progetto:

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tua-anon-key-molto-lunga
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🔐 Configurazione Autenticazione

### 1. Impostazioni Site URL
Nel dashboard Supabase, vai su **Authentication** > **Settings**:
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: 
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/reset-password`

### 2. Abilita Provider Email
In **Authentication** > **Providers**:
- ✅ **Email**: Abilitato (default)
- ✅ **Confirm email**: Abilitato per sicurezza

### 3. Configura Email Templates (Opzionale)
In **Authentication** > **Email Templates**:
- Personalizza i template di conferma email
- Personalizza i template di reset password

## 🗄️ Configurazione Database

### 1. Installa Dipendenze
```bash
npm install
```

### 2. Genera Client Prisma
```bash
npx prisma generate
```

### 3. Crea e Popola Database
```bash
# Applica lo schema
npx prisma db push

# Popola con dati di esempio
npx tsx prisma/seed.ts
```

### 4. Verifica Database
```bash
# Apri Prisma Studio per visualizzare i dati
npx prisma studio
```

## 🚀 Avvio e Test

### 1. Avvia l'App
```bash
npm run dev
```

### 2. Testa l'Autenticazione
1. Vai su [http://localhost:3000](http://localhost:3000)
2. Clicca "Accedi" o "Registrati"
3. Crea un account di test
4. Verifica che ricevi l'email di conferma

### 3. Testa le Funzionalità
1. **Registrazione**: Crea un nuovo account
2. **Login**: Accedi con l'account creato
3. **Prenotazioni**: Prova a prenotare un servizio
4. **Carrello**: Aggiungi elementi al carrello

## 🔒 Configurazione Ruoli (Opzionale)

### 1. Crea Utente Super Admin
Per impostare i ruoli, devi prima creare un Super Admin:

```bash
# Usa Prisma Studio o esegui questo comando
npx tsx -e "
import { PrismaClient } from './lib/prisma'
const prisma = new PrismaClient()

async function createSuperAdmin() {
  // Sostituisci con l'ID utente Supabase reale
  const userId = 'tuo-user-id-supabase'
  
  await prisma.userRole.upsert({
    where: { userId },
    update: { role: 'SUPER_ADMIN' },
    create: { userId, role: 'SUPER_ADMIN' }
  })
  
  console.log('Super Admin creato!')
}

createSuperAdmin()
"
```

### 2. Gestisci Ruoli via Dashboard
1. Accedi come Super Admin
2. Vai su `/admin/utenti`
3. Modifica i ruoli degli utenti

## 🐛 Troubleshooting

### Errore "Invalid API Key"
- Verifica che `NEXT_PUBLIC_SUPABASE_ANON_KEY` sia corretta
- Assicurati che il progetto Supabase sia attivo

### Errore "Site URL not allowed"
- Verifica che `NEXT_PUBLIC_SITE_URL` sia in Redirect URLs
- Controlla che sia `http://localhost:3000` per sviluppo

### Database non si connette
- Verifica che `DATABASE_URL` sia corretto
- Assicurati di aver eseguito `npx prisma generate`
- Controlla che il file `prisma/dev.db` esista

### Email non arrivano
- Verifica le impostazioni SMTP in Supabase
- Controlla la cartella spam
- Verifica che l'email sia confermata

## 📚 Risorse Utili

- [Documentazione Supabase](https://supabase.com/docs)
- [Guida Prisma](https://www.prisma.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**🎉 Setup completato! Ora puoi sviluppare la tua app PetShop!** 