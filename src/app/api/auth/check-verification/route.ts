import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma/db"

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Buscar al usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { emailVerified: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      emailVerified: !!user.emailVerified
    })

  } catch (error) {
    console.error("Error verificando email:", error)

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}