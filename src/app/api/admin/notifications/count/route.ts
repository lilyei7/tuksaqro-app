import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Filter by current user's ID
    const where = { userId: session.user.id }

    const [total, unread, read, pendingINECount] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, isRead: false } }),
      prisma.notification.count({ where: { ...where, isRead: true } }),
      // Contar cuántos INEs están pendientes de verificar
      prisma.document.count({
        where: {
          type: 'ID',
          status: 'PENDING'
        }
      })
    ])

    return NextResponse.json({
      total,
      unread,
      read,
      pendingINECount
    })

  } catch (error) {
    console.error('Error fetching notification counts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}