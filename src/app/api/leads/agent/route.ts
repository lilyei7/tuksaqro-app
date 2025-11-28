import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAgentLeads, getAgentLeadStats } from "@/lib/leads/assignment"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role

    if (userRole !== "AGENT") {
      return NextResponse.json(
        { error: "No autorizado. Solo agentes pueden acceder a sus leads." },
        { status: 403 }
      )
    }

    const agentId = session.user.id

    // Obtener leads y estadísticas en paralelo
    const [leads, stats] = await Promise.all([
      getAgentLeads(agentId),
      getAgentLeadStats(agentId)
    ])

    return NextResponse.json({
      success: true,
      data: {
        leads,
        stats
      }
    })

  } catch (error) {
    console.error("Error obteniendo leads del agente:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}