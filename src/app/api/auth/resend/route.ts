import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/db"
import { sendVerificationEmail } from "@/lib/email"

const resendSchema = z.object({
  email: z.string().email("Email inválido"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = resendSchema.parse(body)

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

    // Generar nuevo código
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

    // Actualizar usuario
    await prisma.user.update({
      where: { email },
      data: {
        verificationCode,
        verificationExpiresAt,
      }
    })

    // Enviar email
    try {
      await sendVerificationEmail(email, verificationCode)
    } catch (emailError) {
      console.error("Error sending verification email:", emailError)
      return NextResponse.json(
        { error: "Error al enviar el email de verificación" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Código reenviado exitosamente"
    }, { status: 200 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error resending code:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}