import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/db"
import { auth } from "@/lib/auth"

const messageSchema = z.object({
  appointmentId: z.string(),
  content: z.string().min(1).max(1000),
})

// GET - Obtener mensajes de una cita
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const appointmentId = searchParams.get("appointmentId")

    if (!appointmentId) {
      return NextResponse.json(
        { error: "appointmentId es requerido" },
        { status: 400 }
      )
    }

    // Verificar que el usuario tenga acceso a esta cita
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { clientId: true, agentId: true }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      )
    }

    const userId = (session.user as any).id
    if (appointment.clientId !== userId && appointment.agentId !== userId) {
      return NextResponse.json(
        { error: "No tienes acceso a estos mensajes" },
        { status: 403 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { appointmentId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "asc" }
    })

    return NextResponse.json({
      messages
    }, { status: 200 })

  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Error al obtener mensajes" },
      { status: 500 }
    )
  }
}

// POST - Enviar mensaje
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const data = messageSchema.parse(body)

    // Verificar que la cita existe
    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      )
    }

    // Verificar que el usuario tiene acceso a la cita
    const userId = (session.user as any).id
    if (appointment.clientId !== userId && appointment.agentId !== userId) {
      return NextResponse.json(
        { error: "No tienes acceso a esta cita" },
        { status: 403 }
      )
    }

    // Crear mensaje
    const message = await prisma.message.create({
      data: {
        content: data.content,
        appointmentId: data.appointmentId,
        senderId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        }
      }
    })

    return NextResponse.json({
      message
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating message:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al enviar mensaje" },
      { status: 500 }
    )
  }
}
