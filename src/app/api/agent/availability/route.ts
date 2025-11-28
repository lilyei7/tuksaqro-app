import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/db"

// GET - Obtener disponibilidad del agente
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "AGENT") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const agentId = session.user.id

    // Obtener toda la disponibilidad del agente
    const availabilityRecords = await prisma.agentAvailability.findMany({
      where: { agentId, active: true },
      orderBy: { dayOfWeek: 'asc' }
    })

    // Convertir a formato de objeto por día
    const availability: Record<string, { start: string; end: string; available: boolean }> = {}

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

    // Inicializar con valores por defecto
    dayNames.forEach((day, index) => {
      availability[day] = {
        start: '09:00',
        end: index < 5 ? '18:00' : '14:00', // Lunes-viernes hasta 18:00, fin de semana hasta 14:00
        available: index < 5 // Lunes-viernes disponible por defecto
      }
    })

    // Sobrescribir con datos de la base de datos
    availabilityRecords.forEach(record => {
      const dayName = dayNames[record.dayOfWeek]
      availability[dayName] = {
        start: record.startTime,
        end: record.endTime,
        available: record.active
      }
    })

    return NextResponse.json({ availability })

  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Guardar disponibilidad del agente
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "AGENT") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const agentId = session.user.id
    const { availability } = await req.json()

    // Validar la estructura de availability
    if (!availability || typeof availability !== 'object') {
      return NextResponse.json({ error: "Datos de disponibilidad inválidos" }, { status: 400 })
    }

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

    // Usar una transacción para actualizar toda la disponibilidad
    await prisma.$transaction(async (tx) => {
      // Primero, marcar todas las entradas existentes como inactivas
      await tx.agentAvailability.updateMany({
        where: { agentId },
        data: { active: false }
      })

      // Crear o actualizar cada día
      for (let i = 0; i < dayNames.length; i++) {
        const dayName = dayNames[i]
        const dayData = availability[dayName]

        if (dayData && dayData.available) {
          await tx.agentAvailability.upsert({
            where: {
              agentId_dayOfWeek: {
                agentId,
                dayOfWeek: i
              }
            },
            update: {
              startTime: dayData.start,
              endTime: dayData.end,
              active: true,
              updatedAt: new Date()
            },
            create: {
              agentId,
              dayOfWeek: i,
              startTime: dayData.start,
              endTime: dayData.end,
              active: true
            }
          })
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Disponibilidad actualizada correctamente"
    })

  } catch (error) {
    console.error("Error saving availability:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}