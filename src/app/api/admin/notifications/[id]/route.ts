import { prisma } from "@/lib/prisma/db"
import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const notificationId = params.id

    // Verify the notification belongs to the user
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!existingNotification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    if (existingNotification.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this notification" },
        { status: 403 }
      )
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("[API Error PUT]", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const notificationId = params.id

    // Verify the notification belongs to the user BEFORE attempting delete
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!existingNotification) {
      // Notificación no existe, retornar 200 anyway (es idempotente)
      return NextResponse.json({ success: true })
    }

    if (existingNotification.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this notification" },
        { status: 403 }
      )
    }

    // Usar deleteMany para que sea seguro si se llama múltiples veces
    const result = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId: session.user.id
      },
    })

    // Retornar 200 siempre que sea exitoso o ya no exista
    return NextResponse.json({ success: true, deleted: result.count > 0 })
  } catch (error) {
    console.error("[API Error DELETE]", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }
}
