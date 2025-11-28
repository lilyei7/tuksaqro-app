import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/db"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    console.log('[METRICS API] Called with params:', params)

    const session = await auth()
    console.log('[METRICS API] Session:', session ? 'Found' : 'Not found')

    if (!session || session.user.role !== 'ADMIN') {
      console.log('[METRICS API] Unauthorized - session:', !!session, 'role:', session?.user?.role)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = params.userId
    console.log('[METRICS API] userId:', userId)

    if (!userId) {
      console.log('[METRICS API] No userId provided')
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 })
    }

    // Obtener información básica del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        isBanned: true,
        _count: {
          select: {
            properties: true,
            clientAppointments: true,
            agentAppointments: true,
            documents: true,
            offers: true,
            clientContracts: true,
            agentContracts: true,
            sentMessages: true,
            propertyViews: true,
            assignedLeads: true,
            digitalSignatures: true,
            buyerWritings: true,
            sellerWritings: true,
            agentWritings: true,
            writingActivities: true,
            notifications: true,
            contractTemplates: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Obtener métricas detalladas
    const [
      properties,
      recentAppointments,
      recentOffers,
      recentContracts,
      leadsAssigned,
      propertyViews,
      monthlyStats,
      kpis
    ] = await Promise.all([
      // Propiedades del usuario
      prisma.property.findMany({
        where: { ownerId: userId },
        select: {
          id: true,
          title: true,
          status: true,
          price: true,
          type: true,
          createdAt: true,
          _count: {
            select: {
              appointments: true,
              offers: true,
              views: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Citas recientes (como cliente y agente)
      prisma.appointment.findMany({
        where: {
          OR: [
            { clientId: userId },
            { agentId: userId }
          ]
        },
        select: {
          id: true,
          date: true,
          status: true,
          property: {
            select: { title: true, price: true }
          },
          client: {
            select: { name: true, email: true }
          },
          agent: {
            select: { name: true, email: true }
          }
        },
        orderBy: { date: 'desc' },
        take: 10
      }),

      // Ofertas recientes
      prisma.offer.findMany({
        where: { clientId: userId },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          property: {
            select: { title: true, price: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Contratos recientes
      prisma.contract.findMany({
        where: {
          OR: [
            { clientId: userId },
            { agentId: userId }
          ]
        },
        select: {
          id: true,
          title: true,
          status: true,
          signedAt: true,
          createdAt: true,
          client: {
            select: { name: true, email: true }
          },
          agent: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Leads asignados (solo para agentes)
      user.role === 'AGENT' ? prisma.user.findMany({
        where: { assignedAgentId: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          assignedAt: true,
          _count: {
            select: {
              offers: true,
              clientAppointments: true,
              clientContracts: true
            }
          }
        },
        orderBy: { assignedAt: 'desc' },
        take: 20
      }) : Promise.resolve([]),

      // Vistas de propiedades
      prisma.propertyView.findMany({
        where: { userId: userId },
        select: {
          id: true,
          viewedAt: true,
          property: {
            select: { title: true, price: true, type: true }
          }
        },
        orderBy: { viewedAt: 'desc' },
        take: 20
      }),

      // Estadísticas mensuales (últimos 6 meses)
      prisma.$queryRaw`
        SELECT
          strftime('%Y-%m', a.date) as month,
          COUNT(*) as appointments,
          SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_appointments
        FROM appointments a
        WHERE (a.clientId = ${userId} OR a.agentId = ${userId})
          AND a.date >= date('now', '-6 months')
        GROUP BY strftime('%Y-%m', a.date)
        ORDER BY month DESC
      `.catch(() => []),

      // KPIs calculados (simplificados)
      user.role === 'AGENT' ? prisma.$queryRaw`
        SELECT
          COUNT(DISTINCT l.id) as total_leads,
          COUNT(DISTINCT CASE WHEN l.assignedAgentId = ${userId} THEN l.id END) as assigned_leads,
          COUNT(DISTINCT o.id) as total_offers,
          COUNT(DISTINCT CASE WHEN o.status = 'ACCEPTED' THEN o.id END) as accepted_offers,
          COUNT(DISTINCT c.id) as total_contracts,
          COUNT(DISTINCT CASE WHEN c.status = 'COMPLETED' THEN c.id END) as completed_contracts,
          AVG(p.price) as avg_property_price
        FROM users u
        LEFT JOIN users l ON l.assignedAgentId = u.id
        LEFT JOIN offers o ON o.clientId = l.id
        LEFT JOIN contracts c ON c.clientId = l.id OR c.agentId = u.id
        LEFT JOIN properties p ON p.ownerId = l.id
        WHERE u.id = ${userId}
      `.catch(() => [{
        total_leads: 0,
        assigned_leads: 0,
        total_offers: 0,
        accepted_offers: 0,
        total_contracts: 0,
        completed_contracts: 0,
        avg_property_price: 0
      }]) : Promise.resolve([{
        total_leads: 0,
        assigned_leads: 0,
        total_offers: 0,
        accepted_offers: 0,
        total_contracts: 0,
        completed_contracts: 0,
        avg_property_price: 0
      }])
    ])

    // Calcular métricas adicionales
    const totalRevenue = await prisma.$queryRaw`
      SELECT
        COALESCE(SUM(o.amount), 0) as offers_revenue,
        0 as commission_revenue
      FROM users u
      LEFT JOIN offers o ON o.clientId = u.id
      WHERE u.id = ${userId} AND o.status = 'ACCEPTED'
    `.catch(() => ({ offers_revenue: 0, commission_revenue: 0 }))

    // Formatear respuesta
    const metrics = {
      user: {
        ...user,
        roleLabel: {
          'CLIENT': 'Cliente',
          'OWNER': 'Propietario',
          'AGENT': 'Agente',
          'ADMIN': 'Administrador',
          'PARTNER': 'Socio'
        }[user.role] || user.role
      },
      summary: {
        totalProperties: user._count.properties,
        totalAppointments: user._count.clientAppointments + user._count.agentAppointments,
        totalDocuments: user._count.documents,
        totalOffers: user._count.offers,
        totalContracts: user._count.clientContracts + user._count.agentContracts,
        totalMessages: user._count.sentMessages,
        totalPropertyViews: user._count.propertyViews,
        totalAssignedLeads: user._count.assignedLeads,
        totalSignatures: user._count.digitalSignatures,
        totalWritings: user._count.buyerWritings + user._count.sellerWritings + user._count.agentWritings,
        totalNotifications: user._count.notifications,
        totalContractTemplates: user._count.contractTemplates,
      },
      recentActivity: {
        properties,
        appointments: recentAppointments,
        offers: recentOffers,
        contracts: recentContracts,
        leadsAssigned,
        propertyViews
      },
      performance: {
        monthlyStats: Array.isArray(monthlyStats) ? monthlyStats : [],
        kpis: Array.isArray(kpis) ? (kpis[0] || {}) : kpis,
        revenue: Array.isArray(totalRevenue) ? totalRevenue[0] || { offers_revenue: 0, commission_revenue: 0 } : totalRevenue
      },
      calculatedMetrics: {
        conversionRate: user._count.offers > 0 ?
          ((user._count.clientContracts + user._count.agentContracts) / user._count.offers * 100).toFixed(2) : 0,
        appointmentCompletionRate: (user._count.clientAppointments + user._count.agentAppointments) > 0 ?
          ((recentAppointments.filter(a => a.status === 'COMPLETED').length /
            (user._count.clientAppointments + user._count.agentAppointments)) * 100).toFixed(2) : 0,
        avgResponseTime: 'N/A', // Requeriría más datos de mensajes/timeline
        customerSatisfaction: 'N/A' // Requeriría sistema de ratings
      }
    }

    // Función para convertir BigInt a number/string
    const serializeBigInt = (obj: any): any => {
      if (obj === null || obj === undefined) return obj
      if (typeof obj === 'bigint') return Number(obj)
      if (Array.isArray(obj)) return obj.map(serializeBigInt)
      if (typeof obj === 'object') {
        const result: any = {}
        for (const key in obj) {
          result[key] = serializeBigInt(obj[key])
        }
        return result
      }
      return obj
    }

    // Serializar la respuesta para manejar BigInt
    const serializedMetrics = serializeBigInt(metrics)

    return NextResponse.json(serializedMetrics)
  } catch (error) {
    console.error("Error obteniendo métricas de usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}