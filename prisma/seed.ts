import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Cancella tutti i dati esistenti
  await prisma.cartItem.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.service.deleteMany()

  // Crea servizi di esempio per un pet shop
  const services = await prisma.service.createMany({
    data: [
      {
        name: "Toelettatura Completa",
        description: "Bagno, asciugatura, spazzolatura e taglio unghie per il tuo amico a 4 zampe",
        price: 35.00,
        duration: 90
      },
      {
        name: "Taglio Pelo",
        description: "Taglio e modellatura del pelo secondo le tue preferenze",
        price: 25.00,
        duration: 60
      },
      {
        name: "Visita Veterinaria",
        description: "Controllo generale della salute del tuo animale domestico",
        price: 50.00,
        duration: 30
      },
      {
        name: "Vaccinazione",
        description: "Somministrazione vaccini secondo il piano vaccinale",
        price: 40.00,
        duration: 20
      },
      {
        name: "Pulizia Dentale",
        description: "Pulizia professionale dei denti per l'igiene orale",
        price: 45.00,
        duration: 45
      },
      {
        name: "Educazione Base",
        description: "Sessione di addestramento base per cuccioli e cani adulti",
        price: 60.00,
        duration: 60
      }
    ]
  })

  console.log(`✅ Database popolato con ${services.count} servizi`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 