import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/db"
import { auth } from "@/lib/auth"

/**
 * API para asignar automáticamente citas a asesores disponibles
 * Selecciona al asesor con mayor disponibilidad
 * POST /api/appointments/auto-assign
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      propertyId, 
      clientId,
      preferredDate,
      duration = 60,
      notes
    } = body

    if (!propertyId || !clientId) {
      return NextResponse.json(
        { error: "propertyId y clientId son requeridos" },
        { status: 400 }
      )
    }

    // 1. Obtener todos los asesores activos
    const agents = await prisma.user.findMany({
      where: {
        role: "AGENT",
        emailVerified: { not: null }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        _count: {
          select: { agentAppointments: true }
        }
      }
    })

    if (agents.length === 0) {
      return NextResponse.json(
        { error: "No hay asesores disponibles" },
        { status: 400 }
      )
    }

    // 2. Seleccionar asesor con menos citas (mayor disponibilidad)
    const selectedAgent = agents.reduce((prev, current) => {
      const prevCount = prev._count?.agentAppointments || 0
      const currentCount = current._count?.agentAppointments || 0
      return currentCount < prevCount ? current : prev
    })

    // 3. Crear la cita asignada al asesor
    const appointment = await prisma.appointment.create({
      data: {
        propertyId,
        clientId,
        agentId: selectedAgent.id,
        date: preferredDate ? new Date(preferredDate) : new Date(),
        duration: parseInt(duration.toString()) || 60,
        status: "PENDING",
        notes: notes || `Asignado automáticamente a ${selectedAgent.name}`
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true
          }
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // 4. Enviar notificación al asesor (aquí iría email)
    console.log(`✅ Cita asignada a ${selectedAgent.name}:`, appointment)

    return NextResponse.json({
      success: true,
      message: `Cita asignada a ${selectedAgent.name}`,
      appointment,
      assignedTo: {
        id: selectedAgent.id,
        name: selectedAgent.name,
        email: selectedAgent.email,
        phone: selectedAgent.phone
      },
      agentStats: {
        totalAppointments: selectedAgent._count?.agentAppointments || 0,
        allAgents: agents.length
      }
    })
  } catch (error) {
    console.error("Error en auto-assign:", error)
    return NextResponse.json(
      { error: "Error asignando cita" },
      { status: 500 }
    )
  }
}
