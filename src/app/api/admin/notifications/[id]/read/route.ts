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

    if (!existingNotification || existingNotification.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Notification not found or unauthorized" },
        { status: 404 }
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
    console.error("[API Error]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
