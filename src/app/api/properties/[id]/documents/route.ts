import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from "@/lib/prisma/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Buscar al usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const { documentType, documentUrl, uploaded } = await request.json()
    const propertyId = params.id

    // Verificar que la propiedad existe y pertenece al usuario
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        ownerId: user.id
      }
    })

    if (!property) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })
    }

    // Mapear los tipos de documento a los campos de la base de datos
    const documentFieldMap = {
      predial: {
        uploaded: 'predialUploaded',
        url: 'predialUrl'
      },
      ine: {
        uploaded: 'ineUploaded',
        url: 'ineUrl'
      },
      comprobante_domicilio: {
        uploaded: 'comprobanteDomicilioUploaded',
        url: 'comprobanteDomicilioUrl'
      }
    }

    const fieldMap = documentFieldMap[documentType as keyof typeof documentFieldMap]
    if (!fieldMap) {
      return NextResponse.json({ error: 'Tipo de documento inválido' }, { status: 400 })
    }

    // Actualizar el documento en la propiedad
    const updateData: any = {}
    updateData[fieldMap.uploaded] = uploaded
    if (documentUrl) {
      updateData[fieldMap.url] = documentUrl
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      property: updatedProperty
    })

  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}