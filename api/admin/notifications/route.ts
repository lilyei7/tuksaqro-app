import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const skip = (page - 1) * limit

    // Get all notifications for admin (admin can see all notifications)
    const where = unreadOnly ? { isRead: false } : {}

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
          },
          writing: {
            select: {
              id: true,
              status: true,
              property: {
                select: {
                  id: true,
                  title: true
                }
              }
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

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationIds, action } = await request.json()

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'notificationIds must be a non-empty array' },
        { status: 400 }
      )
    }

    if (action === 'markAsRead') {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds }
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      return NextResponse.json({ success: true })
    }

    if (action === 'markAsUnread') {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds }
        },
        data: {
          isRead: false,
          readAt: null
        }
      })

      return NextResponse.json({ success: true })
    }

    if (action === 'delete') {
      await prisma.notification.deleteMany({
        where: {
          id: { in: notificationIds }
        }
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action. Must be markAsRead, markAsUnread, or delete' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}