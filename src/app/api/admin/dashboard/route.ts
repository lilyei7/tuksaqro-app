import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    console.log('Admin dashboard - Session:', session)
    console.log('Admin dashboard - User role:', session?.user?.role)

    if (!session || session.user?.role !== "ADMIN") {
      console.log('Admin dashboard - Access denied')
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Estadísticas generales
    const [
      totalUsers,
      totalProperties,
      totalOffers,
      pendingOffers,
      recentUsers,
      recentProperties,
      recentOffers,
      userStats,
      propertyStats,
      offerStats
    ] = await Promise.all([
      // Totales
      prisma.user.count(),
      prisma.property.count(),
      prisma.offer.count(),

      // Ofertas pendientes
      prisma.offer.count({ where: { status: "PENDING" } }),

      // Usuarios recientes (últimos 7 días)
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          emailVerified: true
        }
      }),

      // Propiedades recientes
      prisma.property.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: { name: true, email: true }
          }
        }
      }),

      // Ofertas recientes
      prisma.offer.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          client: {
            select: { name: true, email: true }
          },
          property: {
            select: { title: true, price: true }
          }
        }
      }),

      // Estadísticas por tipo de usuario
      prisma.user.groupBy({
        by: ["role"],
        _count: { role: true }
      }),

      // Estadísticas de propiedades por estado
      prisma.property.groupBy({
        by: ["status"],
        _count: { status: true }
      }),

      // Estadísticas de ofertas por estado
      prisma.offer.groupBy({
        by: ["status"],
        _count: { status: true }
      })
    ])

    // Estadísticas de actividad reciente (últimos 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      newUsersLast30Days,
      newPropertiesLast30Days,
      newOffersLast30Days
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.property.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.offer.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProperties,
        totalOffers,
        pendingOffers,
        newUsersLast30Days,
        newPropertiesLast30Days,
        newOffersLast30Days
      },
      recent: {
        users: recentUsers,
        properties: recentProperties,
        offers: recentOffers
      },
      breakdowns: {
        users: userStats,
        properties: propertyStats,
        offers: offerStats
      }
    })

  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}