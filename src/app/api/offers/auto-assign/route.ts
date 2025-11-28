import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/db"
import { auth } from "@/lib/auth"

/**
 * API para crear ofertas en propiedades
 * POST /api/offers/auto-assign
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
      amount,
      currency = "MXN",
      conditions = ""
    } = body

    if (!propertyId || !clientId || !amount) {
      return NextResponse.json(
        { error: "propertyId, clientId y amount son requeridos" },
        { status: 400 }
      )
    }

    // 1. Obtener la propiedad
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        ownerId: true,
        price: true
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      )
    }

    // 2. Obtener el cliente que hace la oferta
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    // 3. Crear la oferta
    const offer = await prisma.offer.create({
      data: {
        propertyId,
        clientId,
        amount: parseFloat(amount.toString()),
        currency,
        conditions: conditions || `Oferta del cliente ${client.name}`,
        status: "PENDING"
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            price: true
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

    console.log(`✅ Oferta creada:`, offer)

    return NextResponse.json({
      success: true,
      message: `Oferta creada exitosamente`,
      offer,
      client: {
        id: client.id,
        name: client.name,
        email: client.email
      },
      propertyDetails: {
        title: property.title,
        originalPrice: property.price,
        offerPrice: offer.amount,
        discount: ((property.price - offer.amount) / property.price * 100).toFixed(2) + "%"
      }
    })
  } catch (error) {
    console.error("Error en auto-assign de ofertas:", error)
    return NextResponse.json(
      { error: "Error asignando oferta" },
      { status: 500 }
    )
  }
}
