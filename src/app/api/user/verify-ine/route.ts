import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/db'
import { broadcastToAllAdmins } from '@/lib/sse-events'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { frontSideUrl, backSideUrl, termsAccepted, dataAccepted } = body

    // Validar que se proporcionaron ambos lados
    if (!frontSideUrl || !backSideUrl) {
      return NextResponse.json(
        { error: 'Se requieren ambos lados del INE (frente y dorso)' },
        { status: 400 }
      )
    }

    // Validar que aceptó términos
    if (!termsAccepted || !dataAccepted) {
      return NextResponse.json(
        { error: 'Debes aceptar los términos y la política de privacidad' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un INE APROBADO (no permitir subir otro)
    const approvedDocument = await prisma.document.findFirst({
      where: {
        userId: session.user.id,
        type: 'ID',
        status: 'APPROVED'
      }
    })

    if (approvedDocument) {
      return NextResponse.json(
        { error: 'Tu INE ya ha sido verificado. No necesitas enviarlo de nuevo.' },
        { status: 400 }
      )
    }

    // Verificar si hay un INE PENDIENTE (no permitir múltiples pendientes)
    const pendingDocument = await prisma.document.findFirst({
      where: {
        userId: session.user.id,
        type: 'ID',
        status: 'PENDING'
      }
    })

    if (pendingDocument) {
      return NextResponse.json(
        { error: 'Ya has enviado un INE que está siendo revisado. Por favor espera a que sea procesado.' },
        { status: 400 }
      )
    }

    // ✅ RECHAZADOS: SÍ se permite re-enviar (usuario intenta de nuevo)

    // Crear un JSON con ambas imágenes y metadatos
    const ineData = {
      frontSideUrl,
      backSideUrl,
      submittedAt: new Date().toISOString(),
      status: 'pending' // pendiente de verificación por admin
    }

    // Obtener datos del usuario para la notificación al admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true }
    })

    // Guardar el documento del INE
    const ineJsonString = JSON.stringify(ineData)
    const document = await prisma.document.create({
      data: {
        userId: session.user.id,
        name: 'INE - Frente y Dorso',
        type: 'ID', // Tipo de documento: ID (INE/DNI)
        url: ineJsonString,
        size: ineJsonString.length,
        mimeType: 'application/json',
        status: 'PENDING',
      }
    })

    // Crear notificación al usuario
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'SYSTEM_ALERT',
        title: 'INE Enviado para Verificación',
        message: 'Tu INE ha sido recibido. Será verificado en las próximas 24 horas. Recibirás una notificación cuando se complete el proceso.',
        isRead: false,
      }
    })

    // Obtener todos los admins para notificarles
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    })

    // Crear notificaciones para todos los admins
    if (admins.length > 0) {
      await Promise.all(
        admins.map(admin =>
          prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'INE_SUBMITTED',
              title: `📄 Nuevo INE para Verificar`,
              message: `${user?.name || 'Un usuario'} (${user?.email}) ha enviado su INE para verificación. ${user?.phone ? `Teléfono: ${user.phone}` : ''}`,
              isRead: false,
            }
          })
        )
      )

      // 🔴 DISPARAR EVENTO SSE A TODOS LOS ADMINS
      await broadcastToAllAdmins({
        type: 'INE_SUBMITTED',
        title: `📄 Nuevo INE para Verificar`,
        message: `${user?.name || 'Un usuario'} (${user?.email}) ha enviado su INE para verificación.`,
        userId: session.user.id,
        userName: user?.name,
        userEmail: user?.email
      })
    }

    return NextResponse.json({
      message: 'INE enviado para verificación correctamente',
      document: {
        id: document.id,
        userId: document.userId,
        type: document.type,
        status: document.status,
      }
    })
  } catch (error) {
    console.error('Error verificando INE:', error)
    return NextResponse.json(
      { error: 'Error al verificar INE' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Primero verificar si existe uno APROBADO
    const approvedDocument = await prisma.document.findFirst({
      where: {
        userId: session.user.id,
        type: 'ID',
        status: 'APPROVED'
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })

    if (approvedDocument) {
      return NextResponse.json({
        document: {
          id: approvedDocument.id,
          type: approvedDocument.type,
          status: approvedDocument.status,
          uploadedAt: approvedDocument.uploadedAt,
          reviewedAt: approvedDocument.reviewedAt,
        },
        hasVerifiedINE: true,
        hasSubmittedINE: true,
      })
    }

    // Luego verificar si existe uno PENDIENTE
    const pendingDocument = await prisma.document.findFirst({
      where: {
        userId: session.user.id,
        type: 'ID',
        status: 'PENDING'
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })

    if (pendingDocument) {
      return NextResponse.json({
        document: {
          id: pendingDocument.id,
          type: pendingDocument.type,
          status: pendingDocument.status,
          uploadedAt: pendingDocument.uploadedAt,
          reviewedAt: pendingDocument.reviewedAt,
        },
        hasVerifiedINE: false,
        hasSubmittedINE: true,
      })
    }

    // Si está RECHAZADO, permitir re-envío (retornar null)
    // No retornamos nada de REJECTED, permitimos nuevo envío
    return NextResponse.json({
      document: null,
      hasVerifiedINE: false,
      hasSubmittedINE: false,
    })
  } catch (error) {
    console.error('Error obteniendo estado de INE:', error)
    return NextResponse.json(
      { error: 'Error al obtener estado de INE' },
      { status: 500 }
    )
  }
}
