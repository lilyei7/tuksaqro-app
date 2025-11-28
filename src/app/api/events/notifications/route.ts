import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { registerNotificationConnection } from '@/lib/sse-events'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log(`[SSE NOTIFICATIONS] User ${session?.user?.id} session check`)

    if (!session || !session.user?.id) {
      console.warn('❌ Unauthorized SSE notifications connection')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

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
        console.log(`✅ [SSE NOTIFICATIONS] Stream started for user ${userId}`)
        // Registrar esta conexión
        const cleanup = registerNotificationConnection(userId, controller)

        // Enviar mensaje de conexión exitosa
        controller.enqueue(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`)

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
          console.log(`🔴 [SSE NOTIFICATIONS] Stream closed for user ${userId}`)
          clearInterval(heartbeat)
          cleanup()
        }
      },
    })

    return new NextResponse(stream, { headers })
  } catch (error) {
    console.error('Error en SSE notificaciones:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
