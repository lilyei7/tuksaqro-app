import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { agentId } = params
    const userRole = (session.user as any)?.role

    // Solo ADMIN puede ver KPIs de cualquier agente, los agentes solo los suyos
    if (userRole !== "ADMIN" && session.user.id !== agentId) {
      return NextResponse.json({ error: "No tienes permisos para ver estas métricas" }, { status: 403 })
    }

    // Verificar que el usuario existe y es un agente
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
      select: { id: true, role: true, name: true, email: true }
    })

    if (!agent || agent.role !== "AGENT") {
      return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 })
    }

    // Obtener el último snapshot de KPIs
    const latestKPIs = await prisma.kPISnapshot.findFirst({
      where: {
        userId: agentId,
        role: "AGENT"
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Si no hay snapshots, calcular métricas en tiempo real
    if (!latestKPIs) {
      const realTimeMetrics = await calculateRealTimeKPIs(agentId)

      return NextResponse.json({
        agent: {
          id: agent.id,
          name: agent.name,
          email: agent.email
        },
        kpis: realTimeMetrics,
        lastUpdated: new Date().toISOString(),
        source: "real-time"
      })
    }

    // Calcular métricas adicionales si es necesario
    const enhancedKPIs = await enhanceKPIsWithRealTimeData(latestKPIs, agentId)

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email
      },
      kpis: enhancedKPIs,
      lastUpdated: latestKPIs.date.toISOString(),
      source: "snapshot"
    })

  } catch (error) {
    console.error("Error obteniendo KPIs del agente:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

async function calculateRealTimeKPIs(agentId: string) {
  // Propiedades activas bajo gestión del agente (basado en contratos activos)
  const activeProperties = await prisma.contract.count({
    where: {
      agentId: agentId,
      status: {
        in: ["SIGNED", "COMPLETED"]
      }
    }
  })

  // Citas totales del agente
  const appointmentsTotal = await prisma.appointment.count({
    where: {
      agentId: agentId
    }
  })

  // Citas completadas
  const appointmentsCompleted = await prisma.appointment.count({
    where: {
      agentId: agentId,
      status: "COMPLETED"
    }
  })

  // Ofertas creadas por el agente (basado en contratos relacionados)
  const offersCreated = await prisma.contract.count({
    where: {
      agentId: agentId
    }
  })

  // Ofertas aceptadas (contratos firmados)
  const offersAccepted = await prisma.contract.count({
    where: {
      agentId: agentId,
      status: {
        in: ["SIGNED", "COMPLETED"]
      }
    }
  })

  // Contratos firmados
  const contractsSigned = await prisma.contract.count({
    where: {
      agentId: agentId,
      status: "SIGNED"
    }
  })

  // Contratos cerrados (completados)
  const contractsClosed = await prisma.contract.count({
    where: {
      agentId: agentId,
      status: "COMPLETED"
    }
  })

  // Valor total de ventas (simplificado - contratos completados)
  // TODO: Calcular basado en precio de propiedad relacionada
  const totalSalesValue = contractsClosed * 250000 // Valor promedio estimado

  // Comisión ganada (asumiendo 3% de comisión)
  const commissionEarned = totalSalesValue * 0.03

  // Tasas de conversión
  const conversionRate = appointmentsTotal > 0 ? (contractsSigned / appointmentsTotal) * 100 : 0
  const closureRate = contractsSigned > 0 ? (contractsClosed / contractsSigned) * 100 : 0

  // Precio promedio de venta
  const avgSalePrice = contractsClosed > 0 ? totalSalesValue / contractsClosed : 0

  return {
    activeProperties,
    appointmentsTotal,
    appointmentsCompleted,
    offersCreated,
    offersAccepted,
    contractsSigned,
    contractsClosed,
    totalSalesValue,
    commissionEarned,
    conversionRate: Math.round(conversionRate * 100) / 100,
    closureRate: Math.round(closureRate * 100) / 100,
    avgSalePrice: Math.round(avgSalePrice * 100) / 100,
    avgDaysToClose: 0 // TODO: Calcular basado en fechas de contratos
  }
}

async function enhanceKPIsWithRealTimeData(snapshot: any, agentId: string) {
  // Para datos que cambian frecuentemente, podemos actualizar con datos en tiempo real
  const realTimeData = await calculateRealTimeKPIs(agentId)

  return {
    ...snapshot,
    // Mantener datos históricos pero actualizar contadores en tiempo real
    activeProperties: realTimeData.activeProperties,
    appointmentsTotal: Math.max(snapshot.appointmentsTotal, realTimeData.appointmentsTotal),
    appointmentsCompleted: Math.max(snapshot.appointmentsCompleted, realTimeData.appointmentsCompleted),
    offersCreated: Math.max(snapshot.offersCreated, realTimeData.offersCreated),
    offersAccepted: Math.max(snapshot.offersAccepted, realTimeData.offersAccepted),
    contractsSigned: Math.max(snapshot.contractsSigned, realTimeData.contractsSigned),
    contractsClosed: Math.max(snapshot.contractsClosed, realTimeData.contractsClosed),
    totalSalesValue: Math.max(snapshot.totalSalesValue, realTimeData.totalSalesValue),
    commissionEarned: Math.max(snapshot.commissionEarned, realTimeData.commissionEarned),
    conversionRate: realTimeData.conversionRate,
    closureRate: realTimeData.closureRate,
    avgSalePrice: realTimeData.avgSalePrice
  }
}