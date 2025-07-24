import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    
    return NextResponse.json(services)
  } catch (error) {
    console.error('Errore nel recupero dei servizi:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero dei servizi' },
      { status: 500 }
    )
  }
} 