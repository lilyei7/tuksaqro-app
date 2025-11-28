import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/db"

const propertySchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  price: z.number().positive().optional(),
  currency: z.string().optional(),
  type: z.enum(["HOUSE", "APARTMENT", "LAND", "COMMERCIAL", "OFFICE"]).optional(),
  status: z.enum(["AVAILABLE", "SOLD", "RENTED", "PENDING"]).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  area: z.number().positive().optional(),
  landArea: z.number().positive().optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

// GET - Obtener propiedad por ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
          }
        },
        appointments: {
          where: {
            date: { gte: new Date() }
          },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            date: "asc"
          }
        },
        offers: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      )
    }

    // Parsear JSON strings
    const formattedProperty = {
      ...property,
      features: property.features ? JSON.parse(property.features) : [],
      images: property.images ? JSON.parse(property.images) : [],
    }

    return NextResponse.json(formattedProperty, { status: 200 })

  } catch (error) {
    console.error("Error fetching property:", error)
    return NextResponse.json(
      { error: "Error al obtener la propiedad" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar propiedad
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const data = propertySchema.parse(body)

    // Verificar que la propiedad existe
    const existingProperty = await prisma.property.findUnique({
      where: { id: params.id }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      )
    }

    // Verificar permisos (implementar con session)
    // Por ahora, asumimos que userId viene en el body
    if (body.userId && existingProperty.ownerId !== body.userId) {
      const user = await prisma.user.findUnique({
        where: { id: body.userId }
      })
      
      if (user?.role !== "ADMIN") {
        return NextResponse.json(
          { error: "No tiene permisos para editar esta propiedad" },
          { status: 403 }
        )
      }
    }

    // Actualizar propiedad
    const updateData: any = { ...data }
    if (data.features) updateData.features = JSON.stringify(data.features)
    if (data.images) updateData.images = JSON.stringify(data.images)

    const property = await prisma.property.update({
      where: { id: params.id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          }
        }
      }
    })

    // Parsear JSON strings para la respuesta
    const formattedProperty = {
      ...property,
      features: property.features ? JSON.parse(property.features) : [],
      images: property.images ? JSON.parse(property.images) : [],
    }

    return NextResponse.json({
      message: "Propiedad actualizada exitosamente",
      property: formattedProperty
    }, { status: 200 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating property:", error)
    return NextResponse.json(
      { error: "Error al actualizar la propiedad" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar propiedad (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    // Verificar que la propiedad existe
    const existingProperty = await prisma.property.findUnique({
      where: { id: params.id }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      )
    }

    // Verificar permisos
    if (userId && existingProperty.ownerId !== userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (user?.role !== "ADMIN") {
        return NextResponse.json(
          { error: "No tiene permisos para eliminar esta propiedad" },
          { status: 403 }
        )
      }
    }

    // Soft delete - marcar como inactiva
    await prisma.property.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({
      message: "Propiedad eliminada exitosamente"
    }, { status: 200 })

  } catch (error) {
    console.error("Error deleting property:", error)
    return NextResponse.json(
      { error: "Error al eliminar la propiedad" },
      { status: 500 }
    )
  }
}