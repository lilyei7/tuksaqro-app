import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { calculateAllAgentsKPIs } from "@/lib/kpi/calculator"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userRole = (session.user as any)?.role

    // Solo administradores pueden calcular KPIs
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores pueden ejecutar esta acción" }, { status: 403 })
    }

    console.log(`Admin ${session.user.email} iniciando cálculo de KPIs...`)

    const startTime = Date.now()
    await calculateAllAgentsKPIs()
    const endTime = Date.now()

    const duration = (endTime - startTime) / 1000

    console.log(`Cálculo de KPIs completado en ${duration} segundos`)

    return NextResponse.json({
      success: true,
      message: "KPIs calculados exitosamente",
      duration: `${duration.toFixed(2)} segundos`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Error calculando KPIs:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    )
  }
}