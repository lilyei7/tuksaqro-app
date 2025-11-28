import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    console.log('Offers API - Authentication passed')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    if (status && status !== "all") where.status = status
    if (search) {
      // Note: Simplified search since we removed relations from select
      // In a full implementation, you might want to do separate queries or include relations
      where.OR = [
        // For now, just search by amount or conditions if they contain the search term
        { conditions: { contains: search, mode: "insensitive" } }
      ]
    }

    console.log('Offers API - Filters:', where)
    console.log('Offers API - Executing Prisma queries')

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          status: true,
          conditions: true,
          createdAt: true,
          updatedAt: true,
          clientId: true,
          propertyId: true,
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          property: {
            select: {
              id: true,
              title: true,
              price: true,
              address: true,
              city: true,
              state: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma.offer.count({ where })
    ])

    console.log('Offers API - Query completed, offers found:', offers.length)

    return NextResponse.json({
      offers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching offers:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}