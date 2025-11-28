import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/db"
import { validatePropertyOwnerDocuments } from "@/lib/document-validation"

// Schema de validación para crear/actualizar propiedades
const propertySchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres").optional(),
  price: z.number().positive("El precio debe ser mayor a 0"),
  currency: z.string().default("MXN"),
  type: z.enum(["HOUSE", "APARTMENT", "LAND", "COMMERCIAL", "OFFICE"]),
  operation: z.enum(["SALE", "RENT"]).default("SALE"),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  area: z.number().positive().optional(),
  landArea: z.number().positive().optional(),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  city: z.string().min(2, "La ciudad debe tener al menos 2 caracteres"),
  state: z.string().min(2, "El estado debe tener al menos 2 caracteres"),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
})

// GET - Obtener propiedades con filtros
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Parámetros de filtrado
    const type = searchParams.get("type")
    const operation = searchParams.get("operation")
    const city = searchParams.get("city")
    const state = searchParams.get("state")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const bedrooms = searchParams.get("bedrooms")
    const bathrooms = searchParams.get("bathrooms")
    const search = searchParams.get("search")
    const ownerId = searchParams.get("ownerId")
    const status = searchParams.get("status")
    
    // Paginación
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      isActive: true,
    }

    if (type) where.type = type
    if (city) where.city = { contains: city, mode: "insensitive" }
    if (state) where.state = { contains: state, mode: "insensitive" }
    if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) }
    if (bathrooms) where.bathrooms = { gte: parseInt(bathrooms) }
    if (ownerId) where.ownerId = ownerId
    if (status) where.status = status
    if (operation) where.operation = operation

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ]
    }

    // Obtener propiedades
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
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
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit,
      }),
      prisma.property.count({ where })
    ])

    // Formatear propiedades
    const formattedProperties = properties.map((prop: any) => ({
      ...prop,
      features: prop.features ? JSON.parse(prop.features) : [],
      images: prop.images ? JSON.parse(prop.images) : [],
      owner: prop.owner ? {
        id: prop.owner.id,
        name: prop.owner.name,
        email: prop.owner.email,
        phone: prop.owner.phone,
        avatar: prop.owner.avatar,
        role: prop.owner.role
      } : null
    }))

    return NextResponse.json({
      properties: formattedProperties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }, { status: 200 })

  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json(
      { error: "Error al obtener propiedades" },
      { status: 500 }
    )
  }
}

// POST - Crear nueva propiedad
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = propertySchema.parse(body)

    // Verificar que el usuario esté autenticado (implementar con session)
    // Por ahora, asumimos que ownerId viene en el body
    if (!body.ownerId) {
      return NextResponse.json(
        { error: "Debe estar autenticado para crear una propiedad" },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea OWNER o AGENT
    const user = await prisma.user.findUnique({
      where: { id: body.ownerId }
    })

    if (!user || (user.role !== "OWNER" && user.role !== "AGENT" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "No tiene permisos para crear propiedades" },
        { status: 403 }
      )
    }

    // Validar documentos requeridos si es propietario
    if (user.role === "OWNER") {
      const validation = await validatePropertyOwnerDocuments(body.ownerId)
      if (!validation.isValid) {
        return NextResponse.json(
          {
            error: validation.message,
            missingDocuments: validation.missingDocuments,
            requiresDocuments: true
          },
          { status: 400 }
        )
      }
    }

    // Crear propiedad
    const property = await prisma.property.create({
      data: {
        ...data,
        ownerId: body.ownerId,
        features: data.features ? JSON.stringify(data.features) : null,
        images: data.images ? JSON.stringify(data.images) : null,
      },
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

    // Formatear propiedad para la respuesta (Prisma automáticamente parsea campos JSON)
    const formattedProperty = {
      ...property,
      features: property.features || [],
      images: property.images || [],
    }

    return NextResponse.json({
      message: "Propiedad creada exitosamente",
      property: formattedProperty
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating property:", error)
    return NextResponse.json(
      { error: "Error al crear la propiedad" },
      { status: 500 }
    )
  }
}