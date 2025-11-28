import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const userId = (session.user as any).id;

    // Obtener estadísticas del propietario
    const [
      propertiesCount,
      activeOffersCount,
      upcomingAppointmentsCount,
      contractsCount,
      totalValue
    ] = await Promise.all([
      // Contar propiedades activas del propietario
      prisma.property.count({
        where: {
          ownerId: userId,
          status: { in: ["AVAILABLE", "PENDING"] }
        }
      }),

      // Contar ofertas activas en propiedades del propietario
      prisma.offer.count({
        where: {
          property: {
            ownerId: userId
          },
          status: { in: ["PENDING", "COUNTER_OFFER"] }
        }
      }),

      // Contar citas próximas (próximos 7 días)
      prisma.appointment.count({
        where: {
          property: {
            ownerId: userId
          },
          date: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
          },
          status: "CONFIRMED"
        }
      }),

      // Contar contratos activos (por ahora 0, necesita implementación)
      Promise.resolve(0),

      // Calcular valor total de propiedades
      prisma.property.aggregate({
        where: {
          ownerId: userId,
          status: { in: ["AVAILABLE", "PENDING"] }
        },
        _sum: {
          price: true
        }
      })
    ]);

    const stats = {
      properties: propertiesCount,
      activeOffers: activeOffersCount,
      upcomingAppointments: upcomingAppointmentsCount,
      contracts: contractsCount,
      totalValue: totalValue._sum.price || 0
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Error obteniendo estadísticas del propietario:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}