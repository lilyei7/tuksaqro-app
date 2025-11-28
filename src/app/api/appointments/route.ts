import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/db"

const appointmentSchema = z.object({
  date: z.string().datetime(),
  duration: z.number().int().min(15).max(240).default(60),
  notes: z.string().optional(),
  propertyId: z.string(),
  clientId: z.string(),
  agentId: z.string().optional(),
})

// GET - Obtener citas
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const clientId = searchParams.get("clientId")
    const agentId = searchParams.get("agentId")
    const propertyId = searchParams.get("propertyId")
    const status = searchParams.get("status")
    const upcoming = searchParams.get("upcoming") === "true"
    
    const where: any = {}

    if (clientId) where.clientId = clientId
    if (agentId) where.agentId = agentId
    if (propertyId) where.propertyId = propertyId
    if (status) where.status = status

    if (upcoming) {
      where.date = { gte: new Date() }
      where.status = { in: ["PENDING", "CONFIRMED"] }
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
        }
      },
      orderBy: {
        date: "asc"
      }
    })

    // Parsear JSON de imágenes
    const formattedAppointments = appointments.map((apt: any) => ({
      ...apt,
      property: {
        ...apt.property,
        images: apt.property.images ? JSON.parse(apt.property.images) : [],
      }
    }))

    return NextResponse.json({
      appointments: formattedAppointments
    }, { status: 200 })

  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      { error: "Error al obtener citas" },
      { status: 500 }
    )
  }
}

// POST - Crear nueva cita
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = appointmentSchema.parse(body)

    // Verificar que la propiedad existe
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
      include: { owner: true }
    })

    if (!property) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      )
    }

    // Si no se especifica agente, usar el propietario si es agente
    let agentId = data.agentId
    if (!agentId && (property.owner.role === "AGENT" || property.owner.role === "ADMIN")) {
      agentId = property.ownerId
    }

    // Verificar conflictos de horario
    const appointmentDate = new Date(data.date)
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        agentId: agentId || undefined,
        date: appointmentDate,
        status: { in: ["PENDING", "CONFIRMED"] }
      }
    })

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "Ya existe una cita en ese horario" },
        { status: 400 }
      )
    }

    // Crear cita
    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        duration: data.duration,
        notes: data.notes,
        propertyId: data.propertyId,
        clientId: data.clientId,
        agentId,
        status: "PENDING",
      },
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
          }
        }
      }
    })

    // Parsear JSON de imágenes
    const formattedAppointment = {
      ...appointment,
      property: {
        ...appointment.property,
        images: appointment.property.images ? JSON.parse(appointment.property.images) : [],
      }
    }

    return NextResponse.json({
      message: "Cita creada exitosamente",
      appointment: formattedAppointment
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating appointment:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    // Manejar errores específicos de Prisma
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint failed")) {
        return NextResponse.json(
          { error: "Usuario, propiedad o agente no encontrado" },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: "Error al crear la cita", details: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}