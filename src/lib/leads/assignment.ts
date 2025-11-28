import { prisma } from "@/lib/prisma/db"

/**
 * Asigna automáticamente un asesor a un lead (cliente) basado en la carga de trabajo actual
 */
export async function assignAgentToLead(clientId: string): Promise<string | null> {
  try {
    // Verificar si el cliente ya tiene un asesor asignado
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: {
        assignedAgentId: true,
        role: true
      }
    })

    if (!client || client.role !== "CLIENT") {
      throw new Error("Cliente no encontrado o no es un cliente válido")
    }

    if (client.assignedAgentId) {
      // Ya tiene asesor asignado
      return client.assignedAgentId
    }

    // Encontrar el asesor con menos leads asignados
    const agentsWithLeadCount = await prisma.user.findMany({
      where: {
        role: "AGENT",
        // Solo agentes activos (podríamos agregar un campo isActive en el futuro)
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            assignedLeads: true
          }
        }
      }
    })

    if (agentsWithLeadCount.length === 0) {
      console.warn("No hay agentes disponibles para asignar leads")
      return null
    }

    // Encontrar el agente con menos leads
    const agentWithLeastLeads = agentsWithLeadCount.reduce((prev: typeof agentsWithLeadCount[0], current: typeof agentsWithLeadCount[0]) => {
      return prev._count.assignedLeads <= current._count.assignedLeads ? prev : current
    })

    // Asignar el asesor al cliente
    await prisma.user.update({
      where: { id: clientId },
      data: {
        assignedAgentId: agentWithLeastLeads.id,
        assignedAt: new Date()
      }
    })

    console.log(`Lead ${clientId} asignado al agente ${agentWithLeastLeads.name} (${agentWithLeastLeads.id})`)
    return agentWithLeastLeads.id

  } catch (error) {
    console.error("Error asignando agente a lead:", error)
    return null
  }
}

/**
 * Obtiene todos los leads asignados a un asesor
 */
export async function getAgentLeads(agentId: string) {
  try {
    const leads = await prisma.user.findMany({
      where: {
        assignedAgentId: agentId,
        role: "CLIENT"
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        assignedAt: true,
        createdAt: true,
        // Información adicional sobre actividad reciente
        clientAppointments: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED"]
            }
          },
          select: {
            id: true,
            date: true,
            status: true,
            property: {
              select: {
                id: true,
                title: true,
                price: true
              }
            }
          },
          orderBy: {
            date: 'asc'
          },
          take: 3 // Últimas 3 citas pendientes
        },
        offers: {
          select: {
            id: true,
            amount: true,
            status: true,
            property: {
              select: {
                title: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 2 // Últimas 2 ofertas
        },
        clientContracts: {
          select: {
            id: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Último contrato
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })

    return leads
  } catch (error) {
    console.error("Error obteniendo leads del agente:", error)
    return []
  }
}

/**
 * Reasigna un lead a otro asesor
 */
export async function reassignLead(leadId: string, newAgentId: string): Promise<boolean> {
  try {
    // Verificar que el nuevo agente existe y es un agente
    const newAgent = await prisma.user.findUnique({
      where: { id: newAgentId },
      select: { role: true, name: true }
    })

    if (!newAgent || newAgent.role !== "AGENT") {
      throw new Error("Nuevo agente no encontrado o no es válido")
    }

    // Reasignar el lead
    await prisma.user.update({
      where: { id: leadId },
      data: {
        assignedAgentId: newAgentId,
        assignedAt: new Date()
      }
    })

    console.log(`Lead ${leadId} reasignado al agente ${newAgent.name}`)
    return true

  } catch (error) {
    console.error("Error reasignando lead:", error)
    return false
  }
}

/**
 * Obtiene estadísticas de leads para un asesor
 */
export async function getAgentLeadStats(agentId: string) {
  try {
    const [
      totalLeads,
      activeLeads, // Leads con citas pendientes o recientes
      convertedLeads, // Leads que han hecho contratos
      recentActivity // Actividad en las últimas 24 horas
    ] = await Promise.all([
      // Total de leads asignados
      prisma.user.count({
        where: {
          assignedAgentId: agentId,
          role: "CLIENT"
        }
      }),

      // Leads activos (con citas pendientes en los últimos 30 días)
      prisma.user.count({
        where: {
          assignedAgentId: agentId,
          role: "CLIENT",
          clientAppointments: {
            some: {
              status: { in: ["PENDING", "CONFIRMED"] },
              date: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 días
              }
            }
          }
        }
      }),

      // Leads convertidos (con contratos completados)
      prisma.user.count({
        where: {
          assignedAgentId: agentId,
          role: "CLIENT",
          clientContracts: {
            some: {
              status: "COMPLETED"
            }
          }
        }
      }),

      // Actividad reciente (citas, ofertas, contratos en las últimas 24h)
      prisma.user.count({
        where: {
          assignedAgentId: agentId,
          role: "CLIENT",
          OR: [
            {
              clientAppointments: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                  }
                }
              }
            },
            {
              offers: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                  }
                }
              }
            },
            {
              clientContracts: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                  }
                }
              }
            }
          ]
        }
      })
    ])

    return {
      totalLeads,
      activeLeads,
      convertedLeads,
      recentActivity,
      conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0
    }

  } catch (error) {
    console.error("Error obteniendo estadísticas de leads:", error)
    return {
      totalLeads: 0,
      activeLeads: 0,
      convertedLeads: 0,
      recentActivity: 0,
      conversionRate: 0
    }
  }
}