import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma/db'
import { registerAdminConnection } from '@/lib/sse-events'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log(`[SSE ADMIN] Admin ${session?.user?.id} session check`)

    if (!session || !session.user?.id) {
      console.warn('❌ Unauthorized SSE admin connection')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar que es admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'ADMIN') {
      console.warn(`⚠️  [SSE ADMIN] User ${session.user.id} is not ADMIN (role: ${user?.role})`)
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const adminId = session.user.id
    console.log(`🟢 [SSE ADMIN] Admin ${adminId} connected`)

    // Configurar headers para SSE
    const headers = {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    }

    // Crear un stream de lectura
    const stream = new ReadableStream({
      start(controller) {
        console.log(`✅ [SSE ADMIN] Stream started for admin ${adminId}`)
        // Registrar esta conexión de admin
        const cleanup = registerAdminConnection(adminId, controller)

        // Enviar mensaje de conexión exitosa
        controller.enqueue(`data: ${JSON.stringify({ type: 'admin-connected', adminId })}\n\n`)

        // Configurar heartbeat para mantener viva la conexión
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(`: heartbeat\n\n`)
          } catch (error) {
            clearInterval(heartbeat)
          }
        }, 30000)

        // Cleanup cuando se cierre la conexión
        return () => {
          console.log(`🔴 [SSE ADMIN] Stream closed for admin ${adminId}`)
          clearInterval(heartbeat)
          cleanup()
        }
      },
    })

    return new NextResponse(stream, { headers })
  } catch (error) {
    console.error('Error en SSE admin notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
