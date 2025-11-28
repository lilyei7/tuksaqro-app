import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    console.log('Properties API - Authentication passed')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const search = searchParams.get("search")

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    if (status && status !== "all") where.status = status
    if (type && type !== "all") where.type = type
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } }
      ]
    }

    console.log('Properties API - Filters:', where)
    console.log('Properties API - Executing Prisma queries')

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          type: true,
          status: true,
          address: true,
          city: true,
          state: true,
          bedrooms: true,
          bathrooms: true,
          area: true,
          images: true,
          createdAt: true,
          updatedAt: true,
          ownerId: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              offers: true,
              views: true
            }
          }
        }
      }),
      prisma.property.count({ where })
    ])

    console.log('Properties API - Query completed, properties found:', properties.length)

    // Obtener conteo de vistas para cada propiedad
    const propertyIds = properties.map(p => p.id)
    const viewCounts = await prisma.propertyView.groupBy({
      by: ['propertyId'],
      where: {
        propertyId: { in: propertyIds }
      },
      _count: {
        propertyId: true
      }
    })

    const viewCountMap: Record<string, number> = viewCounts.reduce((acc: Record<string, number>, vc: any) => {
      acc[vc.propertyId] = vc._count.propertyId
      return acc
    }, {})

    // Format properties to parse JSON strings
    const formattedProperties = properties.map((prop: any) => ({
      ...prop,
      images: prop.images ? JSON.parse(prop.images) : [],
      location: [prop.address, prop.city, prop.state].filter(Boolean).join(', '),
      _count: {
        ...prop._count,
        views: viewCountMap[prop.id] || 0
      }
    }))

    return NextResponse.json({
      properties: formattedProperties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}