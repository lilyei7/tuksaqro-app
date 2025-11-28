import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/db"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { isBanned: true, emailVerified: true }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    if (user.isBanned) {
      return NextResponse.json({
        error: "Usuario baneado",
        message: "Tu cuenta ha sido suspendida. Contacta al administrador para más información."
      }, { status: 403 })
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Error checking user status:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}