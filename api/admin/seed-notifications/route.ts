import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get some existing users
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, name: true, email: true }
    })

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No users found. Please create some users first.' },
        { status: 400 }
      )
    }

    // Create sample notifications
    const notifications = [
      {
        userId: users[0].id,
        type: 'USER_REGISTERED',
        title: 'Nuevo usuario registrado',
        message: `${users[0].name || users[0].email} se ha registrado en la plataforma`,
      },
      {
        userId: users[0].id,
        type: 'PROPERTY_UPDATED',
        title: 'Propiedad actualizada',
        message: 'La propiedad "Casa en Polanco" ha sido actualizada con nueva información',
      },
      {
        userId: users[0].id,
        type: 'CONTRACT_SIGNED',
        title: 'Contrato firmado',
        message: 'Se ha firmado un nuevo contrato de compraventa',
      },
      {
        userId: users[0].id,
        type: 'WRITING_STATUS',
        title: 'Actualización de escritura',
        message: 'El proceso de escritura para la propiedad "Departamento Centro" ha cambiado de estado',
      },
      {
        userId: users[0].id,
        type: 'KPI_ALERT',
        title: 'Alerta de KPIs',
        message: 'Los KPIs del mes muestran un aumento del 15% en ventas',
      },
    ]

    // Create notifications with some as read and some as unread
    const createdNotifications = []
    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i]
      const created = await prisma.notification.create({
        data: {
          ...notification,
          isRead: i % 2 === 0, // Alternate between read and unread
          readAt: i % 2 === 0 ? new Date() : null,
          createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Spread over last few days
        }
      })
      createdNotifications.push(created)
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdNotifications.length} sample notifications`,
      notifications: createdNotifications
    })

  } catch (error) {
    console.error('Error seeding notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}