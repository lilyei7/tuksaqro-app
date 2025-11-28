import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Token es requerido" },
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

    return NextResponse.json({ valid: true })

  } catch (error) {
    console.error("Verify reset token error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}