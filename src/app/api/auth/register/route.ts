import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma/db"
import { sendVerificationEmail } from "@/lib/email"
import { assignAgentToLead } from "@/lib/leads/assignment"

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  phone: z.string().optional(),
  role: z.enum(["CLIENT", "OWNER", "AGENT"]).default("CLIENT"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, phone, role } = registerSchema.parse(body)

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya existe con este email" },
        { status: 400 }
      )
    }

    // Generar código de verificación de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario sin verificar
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        verificationCode,
        verificationExpiresAt,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    // Asignar automáticamente un agente si es un cliente
    if (role === "CLIENT") {
      try {
        await assignAgentToLead(user.id)
      } catch (assignmentError) {
        console.error("Error asignando agente al nuevo cliente:", assignmentError)
        // No fallar el registro si la asignación falla
      }
    }

    // Enviar email de verificación
    try {
      await sendVerificationEmail(email, verificationCode)
    } catch (emailError) {
      console.error("Error sending verification email:", emailError)
      // No fallar el registro si el email falla, pero loggear
    }

    return NextResponse.json({
      message: "Usuario creado exitosamente. Revisa tu email para el código de verificación.",
      user: { ...user, emailSent: true }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}