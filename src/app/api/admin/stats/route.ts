import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data - en producción esto vendría de la base de datos
    const stats = {
      stats: {
        totalUsers: 1,
        totalProperties: 0,
        totalOffers: 0,
        pendingOffers: 0,
        newUsersLast30Days: 1,
        newPropertiesLast30Days: 0,
        newOffersLast30Days: 0
      },
      recent: {
        users: [
          {
            id: '1',
            name: 'Admin',
            email: 'admin@inmobiliaria.com',
            role: 'ADMIN',
            createdAt: new Date().toISOString(),
            emailVerified: true
          }
        ],
        properties: [],
        offers: []
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}