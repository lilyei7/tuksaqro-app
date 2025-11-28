import { prisma } from "@/lib/prisma/db"

export interface KPIMetrics {
  activeProperties: number
  appointmentsTotal: number
  appointmentsCompleted: number
  offersCreated: number
  offersAccepted: number
  contractsSigned: number
  contractsClosed: number
  totalSalesValue: number
  commissionEarned: number
  conversionRate: number
  closureRate: number
  avgSalePrice: number
  avgDaysToClose: number
}

/**
 * Calcula las métricas KPI para un agente específico
 */
export async function calculateAgentKPIs(agentId: string, date?: Date): Promise<KPIMetrics> {
  const targetDate = date || new Date()
  const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
  const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59)

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
      agentId: agentId,
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  })

  // Citas completadas del mes
  const appointmentsCompleted = await prisma.appointment.count({
    where: {
      agentId: agentId,
      status: "COMPLETED",
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  })

  // Ofertas creadas del mes (basado en contratos relacionados)
  const offersCreated = await prisma.contract.count({
    where: {
      agentId: agentId,
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  })

  // Ofertas aceptadas del mes (contratos firmados)
  const offersAccepted = await prisma.contract.count({
    where: {
      agentId: agentId,
      status: {
        in: ["SIGNED", "COMPLETED"]
      },
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  })

  // Contratos firmados del mes
  const contractsSigned = await prisma.contract.count({
    where: {
      agentId: agentId,
      status: "SIGNED",
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  })

  // Contratos cerrados del mes (completados)
  const contractsClosed = await prisma.contract.count({
    where: {
      agentId: agentId,
      status: "COMPLETED",
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  })

  // Valor total de ventas del mes (simplificado)
  // TODO: Calcular basado en precio de propiedad relacionada
  const totalSalesValue = contractsClosed * 250000 // Valor promedio estimado

  // Comisión ganada (asumiendo 3% de comisión)
  const commissionEarned = totalSalesValue * 0.03

  // Tasas de conversión
  const conversionRate = appointmentsTotal > 0 ? (contractsSigned / appointmentsTotal) * 100 : 0
  const closureRate = contractsSigned > 0 ? (contractsClosed / contractsSigned) * 100 : 0

  // Precio promedio de venta
  const avgSalePrice = contractsClosed > 0 ? totalSalesValue / contractsClosed : 0

  // Días promedio para cerrar (simplificado - fecha de creación a fecha de cierre)
  const avgDaysToClose = await calculateAverageDaysToClose(agentId, startOfMonth, endOfMonth)

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
    avgDaysToClose: Math.round(avgDaysToClose * 100) / 100
  }
}

/**
 * Calcula los días promedio para cerrar contratos
 */
async function calculateAverageDaysToClose(agentId: string, startDate: Date, endDate: Date): Promise<number> {
  const contracts = await prisma.contract.findMany({
    where: {
      agentId: agentId,
      status: "COMPLETED",
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      createdAt: true,
      updatedAt: true // Usamos updatedAt como aproximación de fecha de cierre
    }
  })

  if (contracts.length === 0) return 0

  const totalDays = contracts.reduce((sum: number, contract: any) => {
    const created = new Date(contract.createdAt)
    const closed = new Date(contract.closedAt!)
    const diffTime = Math.abs(closed.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return sum + diffDays
  }, 0)

  return totalDays / contracts.length
}

/**
 * Guarda un snapshot de KPIs para un agente en una fecha específica
 */
export async function saveKPISnapshot(agentId: string, date?: Date): Promise<void> {
  const targetDate = date || new Date()
  const dateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())

  try {
    const kpis = await calculateAgentKPIs(agentId, targetDate)

    await prisma.kPISnapshot.upsert({
      where: {
        date_role_userId: {
          date: dateOnly,
          role: "AGENT",
          userId: agentId
        }
      },
      update: kpis,
      create: {
        date: dateOnly,
        role: "AGENT",
        userId: agentId,
        ...kpis
      }
    })

    console.log(`KPI snapshot saved for agent ${agentId} on ${dateOnly.toISOString()}`)
  } catch (error) {
    console.error(`Error saving KPI snapshot for agent ${agentId}:`, error)
    throw error
  }
}

/**
 * Calcula y guarda snapshots de KPIs para todos los agentes activos
 */
export async function calculateAllAgentsKPIs(date?: Date): Promise<void> {
  try {
    const agents = await prisma.user.findMany({
      where: {
        role: "AGENT",
        // Opcional: filtrar agentes activos
        // isActive: true
      },
      select: {
        id: true,
        name: true
      }
    })

    console.log(`Calculating KPIs for ${agents.length} agents...`)

    for (const agent of agents) {
      try {
        await saveKPISnapshot(agent.id, date)
        console.log(`✓ KPIs calculated for agent: ${agent.name}`)
      } catch (error) {
        console.error(`✗ Error calculating KPIs for agent ${agent.name} (${agent.id}):`, error)
      }
    }

    console.log("KPI calculation completed for all agents")
  } catch (error) {
    console.error("Error calculating KPIs for all agents:", error)
    throw error
  }
}

/**
 * Obtiene el último snapshot de KPIs para un agente
 */
export async function getLatestAgentKPIs(agentId: string): Promise<KPIMetrics | null> {
  try {
    const snapshot = await prisma.kPISnapshot.findFirst({
      where: {
        userId: agentId,
        role: "AGENT"
      },
      orderBy: {
        date: 'desc'
      }
    })

    if (!snapshot) return null

    return {
      activeProperties: snapshot.activeProperties,
      appointmentsTotal: snapshot.appointmentsTotal,
      appointmentsCompleted: snapshot.appointmentsCompleted,
      offersCreated: snapshot.offersCreated,
      offersAccepted: snapshot.offersAccepted,
      contractsSigned: snapshot.contractsSigned,
      contractsClosed: snapshot.contractsClosed,
      totalSalesValue: snapshot.totalSalesValue,
      commissionEarned: snapshot.commissionEarned,
      conversionRate: snapshot.conversionRate,
      closureRate: snapshot.closureRate,
      avgSalePrice: snapshot.avgSalePrice,
      avgDaysToClose: snapshot.avgDaysToClose
    }
  } catch (error) {
    console.error(`Error getting latest KPIs for agent ${agentId}:`, error)
    return null
  }
}