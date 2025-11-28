import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/db"

const updateSchema = z.object({
  date: z.string().datetime().optional(),
  duration: z.number().int().min(15).max(240).optional(),
  notes: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
})

// GET - Obtener cita por ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
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
            price: true,
            currency: true,
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      )
    }

    // Parsear JSON de imágenes
    const formattedAppointment = {
      ...appointment,
      property: {
        ...appointment.property,
        images: appointment.property.images ? JSON.parse(appointment.property.images) : [],
      }
    }

    return NextResponse.json(formattedAppointment, { status: 200 })

  } catch (error) {
    console.error("Error fetching appointment:", error)
    return NextResponse.json(
      { error: "Error al obtener la cita" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar cita
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    // Verificar que la cita existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: params.id }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      )
    }

    // Si se cambia la fecha, verificar conflictos
    if (data.date) {
      const newDate = new Date(data.date)
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          id: { not: params.id },
          agentId: existingAppointment.agentId || undefined,
          date: newDate,
          status: { in: ["PENDING", "CONFIRMED"] }
        }
      })

      if (conflictingAppointment) {
        return NextResponse.json(
          { error: "Ya existe una cita en ese horario" },
          { status: 400 }
        )
      }
    }

    // Actualizar cita
    const updateData: any = {}
    if (data.date) updateData.date = new Date(data.date)
    if (data.duration) updateData.duration = data.duration
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.status) updateData.status = data.status

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
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
      message: "Cita actualizada exitosamente",
      appointment: formattedAppointment
    }, { status: 200 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating appointment:", error)
    return NextResponse.json(
      { error: "Error al actualizar la cita" },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar cita
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que la cita existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: params.id }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      )
    }

    // Cancelar (cambiar estado en lugar de eliminar)
    await prisma.appointment.update({
      where: { id: params.id },
      data: { status: "CANCELLED" }
    })

    return NextResponse.json({
      message: "Cita cancelada exitosamente"
    }, { status: 200 })

  } catch (error) {
    console.error("Error cancelling appointment:", error)
    return NextResponse.json(
      { error: "Error al cancelar la cita" },
      { status: 500 }
    )
  }
}