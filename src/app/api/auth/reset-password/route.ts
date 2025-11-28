import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/db"
import bcrypt from "bcryptjs"
import { notifyPasswordChanged } from "@/lib/notifications/notificationService"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token y contraseña son requeridos" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Buscar usuario con token válido y no expirado
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiresAt: {
          gt: new Date() // Token no ha expirado
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 400 }
      )
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Actualizar contraseña y limpiar tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null
      }
    })

    // 🔔 Notificar al usuario que su contraseña ha sido cambiada
    try {
      await notifyPasswordChanged(user.id)
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError)
      // No bloquear la respuesta si la notificación falla
    }

    return NextResponse.json({
      message: "Contraseña restablecida exitosamente"
    })

  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}