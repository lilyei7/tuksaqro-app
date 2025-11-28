import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/db'
import { broadcastINEStatusUpdate, broadcastNotification } from '@/lib/sse-events'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = params
    const { status, notes } = await request.json()

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    // Obtener el documento primero
    const doc = await prisma.document.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!doc) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    // Si se aprobó, actualizar la propiedad o usuario para marcar como verificado
    if (status === 'APPROVED') {
      console.log(`✅ APPROVING document for user ${doc.userId}`)
      // Buscar si el usuario tiene propiedades con ineVerified false
      const properties = await prisma.property.findMany({
        where: {
          ownerId: doc.userId,
          ineVerified: false
        }
      })

      // Actualizar propiedades para marcar INE como verificado
      if (properties.length > 0) {
        await prisma.property.updateMany({
          where: {
            ownerId: doc.userId,
            ineVerified: false
          },
          data: {
            ineVerified: true,
            ineUploaded: true
          }
        })
      }

      // Crear notificación de aprobación
      await prisma.notification.create({
        data: {
          userId: doc.userId,
          type: 'VERIFICATION_APPROVED',
          title: '✅ Tu INE ha sido Verificado',
          message: 'Felicidades! Tu identidad ha sido verificada correctamente. Ahora puedes publicar propiedades sin restricciones.',
          isRead: false,
        }
      })

      // 🔴 DISPARAR EVENTO SSE DE APROBACIÓN
      console.log(`📡 Broadcasting APPROVED status to user ${doc.userId}`)
      broadcastINEStatusUpdate(doc.userId, {
        status: 'APPROVED',
        message: 'Tu INE ha sido aprobado exitosamente'
      })

      console.log(`📡 Broadcasting APPROVED notification to user ${doc.userId}`)
      broadcastNotification(doc.userId, {
        type: 'VERIFICATION_APPROVED',
        title: '✅ Tu INE ha sido Verificado',
        message: 'Felicidades! Tu identidad ha sido verificada correctamente.'
      })
    }

    // Si se rechazó
    if (status === 'REJECTED') {
      // Crear notificación de rechazo
      await prisma.notification.create({
        data: {
          userId: doc.userId,
          type: 'VERIFICATION_REJECTED',
          title: '❌ Tu INE Fue Rechazado',
          message: `Tu documento de identidad fue rechazado por la siguiente razón: ${notes}. Por favor, envía nuevamente tu INE con imágenes más claras.`,
          isRead: false,
        }
      })

      // 🔴 DISPARAR EVENTO SSE DE RECHAZO
      broadcastINEStatusUpdate(doc.userId, {
        status: 'REJECTED',
        message: `Tu INE fue rechazado: ${notes}`
      })

      broadcastNotification(doc.userId, {
        type: 'VERIFICATION_REJECTED',
        title: '❌ Tu INE Fue Rechazado',
        message: `Razón: ${notes}`
      })
    }

    // Actualizar documento con información de revisión
    const finalDoc = await prisma.document.update({
      where: { id },
      data: {
        status: status as any,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        notes: notes || null
      }
    })

    return NextResponse.json({
      message: `Documento ${status === 'APPROVED' ? 'aprobado' : 'rechazado'} correctamente`,
      document: finalDoc
    })
  } catch (error) {
    console.error('Error actualizando documento:', error)
    return NextResponse.json(
      { error: 'Error al actualizar documento' },
      { status: 500 }
    )
  }
}
