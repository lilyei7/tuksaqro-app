import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/db"

// GET - Obtener todas las citas para el calendario del admin
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get("agentId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}

    if (agentId && agentId !== 'all') {
      where.agentId = agentId
    }

    // Filtro opcional por rango de fechas
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            state: true,
            images: true,
            type: true,
          }
        },
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json({
      appointments,
      total: appointments.length
    })

  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}