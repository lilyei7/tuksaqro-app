import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/db"

const verifySchema = z.object({
  email: z.string().email("Email inválido"),
  code: z.string().length(6, "El código debe tener 6 dígitos"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, code } = verifySchema.parse(body)

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "La cuenta ya está verificada" },
        { status: 400 }
      )
    }

    if (!user.verificationCode || !user.verificationExpiresAt) {
      return NextResponse.json(
        { error: "No hay código de verificación pendiente" },
        { status: 400 }
      )
    }

    if (user.verificationExpiresAt < new Date()) {
      return NextResponse.json(
        { error: "El código de verificación ha expirado" },
        { status: 400 }
      )
    }

    if (user.verificationCode !== code) {
      return NextResponse.json(
        { error: "Código de verificación incorrecto" },
        { status: 400 }
      )
    }

    // Verificar usuario
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        verificationCode: null,
        verificationExpiresAt: null,
      }
    })

    return NextResponse.json({
      message: "Cuenta verificada exitosamente"
    }, { status: 200 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error verifying user:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}