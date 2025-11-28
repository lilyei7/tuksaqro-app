import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const type = searchParams.get('type')

    const skip = (page - 1) * limit

    // Build where clause - always filter by userId for security
    const where: any = {
      userId: session.user.id
    }
    if (unreadOnly) {
      where.isRead = false
    }
    if (type) {
      where.type = type
    }

    // Get notifications with pagination
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ])

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ids, action } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      )
    }

    // Validar que todas las notificaciones pertenezcan al usuario actual
    const notifications = await prisma.notification.findMany({
      where: {
        id: { in: ids },
        userId: session.user.id  // Asegurar que son del usuario actual
      }
    })

    if (notifications.length !== ids.length) {
      return NextResponse.json(
        { error: 'Algunas notificaciones no pertenecen a este usuario o no existen' },
        { status: 403 }
      )
    }

    if (action === 'markAsRead') {
      await prisma.notification.updateMany({
        where: {
          id: { in: ids },
          userId: session.user.id  // Doble validación
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })
    } else if (action === 'markAsUnread') {
      await prisma.notification.updateMany({
        where: {
          id: { in: ids },
          userId: session.user.id  // Doble validación
        },
        data: {
          isRead: false,
          readAt: null
        }
      })
    } else if (action === 'delete') {
      await prisma.notification.deleteMany({
        where: {
          id: { in: ids },
          userId: session.user.id  // Doble validación
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use: markAsRead, markAsUnread, or delete' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}