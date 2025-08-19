# 🐕 PetShop - Sistema di Prenotazioni Completo

Un'applicazione moderna per la gestione di un PetShop con sistema di prenotazioni, autenticazione e dashboard amministrativa.

## ✨ Cosa Fa Questa App

- **🏠 Home Page**: Landing page accattivante con servizi e statistiche
- **🔐 Autenticazione**: Login, registrazione e gestione password con Supabase
- **📅 Prenotazioni**: Sistema completo per prenotare servizi PetShop
- **🛒 Carrello**: Raccogli più prenotazioni prima di confermarle
- **👨‍💼 Dashboard Admin**: Gestisci servizi, prenotazioni e utenti
- **🔒 Ruoli e Permessi**: Sistema di sicurezza con Customer, Admin e Super Admin

## 🚀 Setup Completo

### 1. Prerequisiti
- Node.js (versione 18 o superiore)
- Un account Supabase gratuito

### 2. Installa le Dipendenze
```bash
npm install
```

### 3. Configura Supabase
1. Crea un progetto su [https://app.supabase.com](https://app.supabase.com)
2. Ottieni Project URL e Anon Key dalle impostazioni API
3. Configura le variabili d'ambiente in `.env.local`:

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tua-anon-key-molto-lunga
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Configura l'Autenticazione
Nel dashboard Supabase, vai su **Authentication** > **Settings**:
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: 
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/reset-password`

### 5. Prepara il Database
```bash
# Genera il client Prisma
npx prisma generate

# Crea il database e applica lo schema
npx prisma db push

# Popola con dati di esempio
npx tsx prisma/seed.ts
```

### 6. Avvia l'App
```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser!

## 🏗 Struttura del Progetto

```
corso-next/
├── app/                    # App Next.js con App Router
│   ├── admin/             # Dashboard amministrativa
│   ├── auth/              # Pagine di autenticazione
│   ├── api/               # API REST endpoints
│   ├── components/        # Componenti riutilizzabili
│   ├── dashboard/         # Dashboard utente
│   ├── prenotazioni/      # Sistema prenotazioni
│   └── carrello/          # Gestione carrello
├── lib/                   # Librerie e utility
│   ├── auth/              # Sistema autenticazione e ruoli
│   ├── database/          # Configurazione database
│   └── context/           # React Context providers
├── prisma/                # Schema database e migrazioni
└── public/                # Asset statici
```

## 🎯 Funzionalità Principali

### Per i Clienti
- ✅ Visualizza servizi disponibili
- ✅ Prenota servizi per i propri animali
- ✅ Gestisci prenotazioni esistenti
- ✅ Carrello per prenotazioni multiple

### Per gli Admin
- ✅ Dashboard con statistiche
- ✅ Gestione servizi (CRUD)
- ✅ Gestione prenotazioni
- ✅ Gestione utenti e ruoli

## 🛠 Tecnologie Utilizzate

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (per sviluppo)
- **Autenticazione**: Supabase con sistema ruoli personalizzato
- **Validazione**: Zod per schemi e validazione

## 📊 Schema del Database

Il sistema utilizza **Prisma ORM** con **SQLite** e 3 tabelle principali:

### 1. **Service** (Servizi)
```sql
- id: Identificativo unico
- name: Nome del servizio (es. "Toelettatura Completa")
- description: Descrizione dettagliata
- price: Prezzo in euro
- duration: Durata in minuti
- createdAt/updatedAt: Timestamp di creazione e aggiornamento
```

### 2. **Booking** (Prenotazioni)
```sql
- id: Identificativo unico
- userId: ID utente Supabase (per autenticazione)
- customerName: Nome del cliente
- customerEmail: Email del cliente
- petName: Nome dell'animale
- petType: Tipo di animale (cane, gatto, ecc.)
- serviceId: Riferimento al servizio prenotato
- bookingDate: Data della prenotazione
- bookingTime: Orario della prenotazione
- status: Stato (pending, confirmed, completed, cancelled)
- notes: Note aggiuntive opzionali
```

### 3. **CartItem** (Elementi Carrello)
```sql
- id: Identificativo unico
- userId: ID utente Supabase (per autenticazione)
- serviceId: Riferimento al servizio
- petName: Nome dell'animale
- petType: Tipo di animale
- bookingDate: Data desiderata
- bookingTime: Orario desiderato
- customerName/customerEmail: Info cliente
- notes: Note aggiuntive
```

## 🔄 Come Funziona Prisma

### 1. **Schema Definition**
Il file `prisma/schema.prisma` definisce:
- **Datasource**: Configurazione del database (SQLite)
- **Generator**: Genera il client TypeScript
- **Models**: Struttura delle tabelle con relazioni

### 2. **Generazione del Client**
```bash
npx prisma generate
```
Genera il client TypeScript che fornisce:
- Autocompletamento completo
- Tipizzazione sicura
- Validazione runtime

### 3. **Operazioni Database**
```typescript
// Esempio: Creare una prenotazione
const booking = await prisma.booking.create({
  data: {
    customerName: "Mario Rossi",
    petName: "Fido",
    serviceId: 1,
    // ... altri campi
  },
  include: {
    service: true // Include i dati del servizio correlato
  }
})
```

## 🚀 API Endpoints

### Servizi
- `GET /api/services` - Ottieni tutti i servizi disponibili

### Prenotazioni
- `GET /api/bookings` - Ottieni prenotazioni utente
- `POST /api/bookings` - Crea nuova prenotazione

### Carrello
- `GET /api/cart` - Ottieni carrello utente
- `POST /api/cart` - Aggiungi al carrello
- `DELETE /api/cart` - Rimuovi dal carrello
- `POST /api/cart/checkout` - Conferma prenotazioni

### Admin
- `GET /api/admin/services` - Gestione servizi (Admin)
- `GET /api/admin/bookings` - Gestione prenotazioni (Admin)
- `GET /api/admin/users` - Gestione utenti (Super Admin)

## 🔐 Sistema di Ruoli

- **Customer**: Prenota servizi
- **Admin**: Gestisce servizi e prenotazioni
- **Super Admin**: Accesso completo al sistema

### Permessi per Ruolo
```typescript
// Customer
- read_services (visualizza servizi)

// Admin  
- read_services, write_services, delete_services
- read_bookings, write_bookings, delete_bookings
- admin_dashboard

// Super Admin
- Tutti i permessi Admin +
- read_users, write_users, delete_users
- system_settings
```

## 🔧 Comandi Utili

```bash
# Sviluppo
npm run dev          # Avvia server sviluppo
npm run build        # Build produzione
npm run lint         # Controlla codice

# Database
npx prisma studio    # Interfaccia grafica database
npx prisma db push   # Applica schema
npx prisma generate  # Genera client
npx tsx prisma/seed.ts # Popola con dati di esempio
```

## 🎨 Personalizzazione

L'app è progettata per essere facilmente personalizzabile:
- **Colori**: Modifica `tailwind.config.js`
- **Servizi**: Aggiungi nuovi servizi tramite admin
- **Ruoli**: Estendi il sistema di permessi in `lib/auth/roles.ts`

## 🤝 Contribuire

1. Fai fork del progetto
2. Crea un branch per la tua feature
3. Committa le modifiche
4. Pusha al branch
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è per scopi educativi e dimostrativi.

---

**Buon coding! 🚀**
