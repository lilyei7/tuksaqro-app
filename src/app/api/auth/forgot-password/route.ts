import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/db"
import crypto from "crypto"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      )
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({
        message: "Si el email existe, se ha enviado un enlace de recuperación"
      })
    }

    // Generar token seguro
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Guardar token en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiresAt: resetTokenExpiry
      }
    })

    // Configurar transporte de email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    // URL de reset
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    // Enviar email
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@inmobiliaria.com",
        to: email,
        subject: "Recupera tu contraseña - Tuksaqro",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Recupera tu contraseña</h2>
            <p>Hola ${user.name || 'Usuario'},</p>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Restablecer contraseña
              </a>
            </div>
            <p><strong>Este enlace expirará en 1 hora.</strong></p>
            <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Este es un email automático, por favor no respondas a este mensaje.
            </p>
          </div>
        `
      })
    } catch (emailError) {
      console.error("Error sending email:", emailError)
      // No fallamos la petición si el email falla, por seguridad
    }

    return NextResponse.json({
      message: "Si el email existe, se ha enviado un enlace de recuperación"
    })

  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}