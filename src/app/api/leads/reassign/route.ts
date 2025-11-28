import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { reassignLead } from "@/lib/leads/assignment"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role

    // Solo administradores pueden reasignar leads
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Solo administradores pueden reasignar leads" },
        { status: 403 }
      )
    }

    const { leadId, newAgentId } = await request.json()

    if (!leadId || !newAgentId) {
      return NextResponse.json(
        { error: "leadId y newAgentId son requeridos" },
        { status: 400 }
      )
    }

    const success = await reassignLead(leadId, newAgentId)

    if (!success) {
      return NextResponse.json(
        { error: "Error reasignando el lead" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Lead reasignado exitosamente"
    })

  } catch (error) {
    console.error("Error reasignando lead:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}