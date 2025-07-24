# Sistema di Prenotazioni PetShop

## Panoramica

Questo progetto include un sistema completo di prenotazioni per servizi di un PetShop, implementato utilizzando **Prisma ORM** e **SQLite** come database. Il sistema permette di gestire servizi, prenotazioni e un carrello per raccogliere più prenotazioni prima di confermarle.

## 🛠 Tecnologie Utilizzate

### Database e ORM
- **SQLite**: Database leggero e file-based, perfetto per lo sviluppo
- **Prisma**: ORM moderno per TypeScript/JavaScript che semplifica l'accesso al database

### Frontend
- **Next.js 15**: Framework React con App Router
- **TypeScript**: Tipizzazione statica per JavaScript
- **Tailwind CSS**: Framework CSS per styling

### Architettura
- **API Routes**: Endpoint REST integrati in Next.js
- **React Context**: Gestione dello stato globale per il carrello
- **Server Components**: Componenti che vengono eseguiti sul server

## 📊 Schema del Database

Il database è strutturato con 3 tabelle principali:

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
- sessionId: ID di sessione per identificare il carrello dell'utente
- serviceId: Riferimento al servizio
- petName: Nome dell'animale
- petType: Tipo di animale
- bookingDate: Data desiderata
- bookingTime: Orario desiderato
- customerName/customerEmail: Info cliente (opzionali)
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
Genera il client TypeScript in `lib/generated/prisma` che fornisce:
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

## 🗂 Struttura del Progetto

```
├── prisma/
│   ├── schema.prisma          # Schema del database
│   └── seed.ts               # Script per popolare il database
├── lib/
│   ├── prisma.ts             # Client Prisma configurato
│   └── context/
│       └── CartContext.tsx   # Context per gestione carrello
├── app/
│   ├── api/
│   │   ├── services/         # API per servizi
│   │   ├── bookings/         # API per prenotazioni
│   │   └── cart/             # API per carrello
│   └── prenotazioni/
│       ├── page.tsx          # Pagina principale prenotazioni
│       └── gestione/
│           └── page.tsx      # Pagina gestione prenotazioni
└── dev.db                    # Database SQLite (generato automaticamente)
```

## 🚀 API Endpoints

### Servizi
- `GET /api/services` - Ottieni tutti i servizi disponibili

### Prenotazioni
- `GET /api/bookings` - Ottieni tutte le prenotazioni
- `POST /api/bookings` - Crea una nuova prenotazione

### Carrello
- `GET /api/cart?sessionId=xxx` - Ottieni elementi del carrello
- `POST /api/cart` - Aggiungi elemento al carrello
- `DELETE /api/cart?id=xxx` - Rimuovi elemento dal carrello
- `POST /api/cart/checkout` - Converti carrello in prenotazioni

## 💡 Funzionalità Principali

### 1. **Gestione Servizi**
- Visualizzazione servizi con prezzo e durata
- Selezione servizio per prenotazione

### 2. **Carrello Intelligente**
- Sessione persistente usando localStorage
- Aggiunta/rimozione elementi
- Calcolo totale automatico
- Context React per stato globale

### 3. **Prenotazioni**
- Form di prenotazione con validazione
- Stati diversi (pending, confirmed, ecc.)
- Visualizzazione completa in tabella
- Statistiche aggregate

### 4. **User Experience**
- Interface responsive con Tailwind CSS
- Modal per form di prenotazione
- Feedback visivo per operazioni
- Navigazione intuitiva

## 🛠 Comandi Utili

### Database
```bash
# Applica lo schema al database
npx prisma db push

# Popola il database con dati di esempio
npx tsx prisma/seed.ts

# Apri Prisma Studio per visualizzare i dati
npx prisma studio

# Reset completo del database
npx prisma migrate reset
```

### Sviluppo
```bash
# Avvia il server di sviluppo
npm run dev

# Build di produzione
npm run build
```

## 🎯 Vantaggi di Questa Implementazione

### Prisma ORM
- **Type Safety**: Tipizzazione completa end-to-end
- **Query Intuitive**: Sintassi simile al linguaggio naturale
- **Relazioni Automatiche**: Gestione automatica delle foreign key
- **Migrazioni**: Gestione evoluzione schema database

### SQLite
- **Semplicità**: Un singolo file per tutto il database
- **Velocità**: Ottime performance per applicazioni piccole/medie
- **Zero Configuration**: Nessun server database da configurare
- **Portabilità**: Facile backup e trasferimento

### Architettura
- **Modularità**: Ogni componente ha responsabilità chiare
- **Scalabilità**: Facile aggiungere nuove funzionalità
- **Manutenibilità**: Codice organizzato e documentato
- **Testing**: Struttura che facilita i test

## 🔧 Possibili Estensioni

1. **Calendario**: Visualizzazione calendario per le prenotazioni
2. **Notifiche**: Email di conferma e promemoria
3. **Pagamenti**: Integrazione con Stripe/PayPal
4. **Gestione Utenti**: Sistema di login per clienti
5. **Dashboard Admin**: Pannello per gestire servizi e prenotazioni
6. **Reportistica**: Statistiche avanzate sui servizi

## 📝 Note per Principianti

### Cos'è un ORM?
Un **Object-Relational Mapping** (ORM) è uno strumento che permette di interagire con un database usando codice nel linguaggio di programmazione invece di scrivere SQL direttamente.

### Perché SQLite?
- Perfetto per imparare e prototipare
- Non richiede installazione di server database
- Ideale per applicazioni con traffico leggero/medio

### Relazioni nel Database
Le relazioni definiscono come le tabelle sono connesse:
- **One-to-Many**: Un servizio può avere molte prenotazioni
- **Foreign Key**: `serviceId` in `Booking` punta a `id` in `Service`

Questo sistema fornisce una base solida per comprendere i concetti di database moderni e ORM! 