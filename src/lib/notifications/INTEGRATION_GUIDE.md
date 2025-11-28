/**
 * GUÍA DE INTEGRACIÓN DE NOTIFICACIONES
 * 
 * Este archivo muestra cómo integrar las notificaciones del sistema
 * en los diferentes endpoints y servicios de la aplicación.
 */

// ============================================================================
// 1. CAMBIO DE CONTRASEÑA
// ============================================================================
// Archivo: src/app/api/auth/reset-password/route.ts
// 
// Agregar al final del endpoint POST:
/*
import { notifyPasswordChanged } from "@/lib/notifications/notificationService"

// Después de actualizar la contraseña:
await notifyPasswordChanged(user.id)
*/

// ============================================================================
// 2. NUEVO USUARIO REGISTRADO
// ============================================================================
// Archivo: src/app/api/auth/register/route.ts
//
// Agregar después de crear el usuario:
/*
import { notifyNewUserRegistered } from "@/lib/notifications/notificationService"

const adminId = "admin-user-id" // Obtener del config
await notifyNewUserRegistered(adminId, user.name || email, email, user.id)
*/

// ============================================================================
// 3. NUEVA PROPIEDAD PUBLICADA
// ============================================================================
// Archivo: src/app/api/admin/properties/route.ts (POST)
//
// Agregar después de crear la propiedad:
/*
import { notifyNewProperty } from "@/lib/notifications/notificationService"

const adminId = session.user.id
await notifyNewProperty(adminId, property.title, property.id)
*/

// ============================================================================
// 4. NUEVA OFERTA RECIBIDA
// ============================================================================
// Archivo: src/app/api/offers/route.ts (POST)
//
// Agregar después de crear la oferta:
/*
import { notifyNewOffer } from "@/lib/notifications/notificationService"

const property = await prisma.property.findUnique({ where: { id: offer.propertyId } })
const owner = property?.ownerId

if (owner) {
  await notifyNewOffer(owner, offer.amount, property.title, offer.id)
}
*/

// ============================================================================
// 5. OFERTA ACEPTADA
// ============================================================================
// Archivo: src/app/api/offers/[id]/accept/route.ts (POST)
//
// Agregar después de aceptar la oferta:
/*
import { notifyOfferAccepted } from "@/lib/notifications/notificationService"

const offer = await prisma.offer.findUnique({ 
  where: { id: offerId },
  include: { property: true }
})

if (offer) {
  await notifyOfferAccepted(offer.buyerId, offer.amount, offer.property.title, offer.id)
}
*/

// ============================================================================
// 6. OFERTA RECHAZADA
// ============================================================================
// Archivo: src/app/api/offers/[id]/reject/route.ts (POST)
//
// Agregar después de rechazar la oferta:
/*
import { notifyOfferRejected } from "@/lib/notifications/notificationService"

const offer = await prisma.offer.findUnique({ 
  where: { id: offerId },
  include: { property: true }
})

if (offer) {
  await notifyOfferRejected(offer.buyerId, offer.amount, offer.property.title, offer.id)
}
*/

// ============================================================================
// 7. NUEVA CITA PROGRAMADA
// ============================================================================
// Archivo: src/app/api/appointments/route.ts (POST)
//
// Agregar después de crear la cita:
/*
import { notifyNewAppointment } from "@/lib/notifications/notificationService"

const appointment = await prisma.appointment.create({...})
const property = await prisma.property.findUnique({ where: { id: appointment.propertyId } })

if (property) {
  await notifyNewAppointment(appointment.userId, appointment.date, property.title, appointment.id)
}
*/

// ============================================================================
// 8. CITA CONFIRMADA
// ============================================================================
// Archivo: src/app/api/appointments/[id]/confirm/route.ts (POST)
//
// Agregar después de confirmar la cita:
/*
import { notifyAppointmentConfirmed } from "@/lib/notifications/notificationService"

const appointment = await prisma.appointment.findUnique({ 
  where: { id: appointmentId },
  include: { property: true }
})

if (appointment) {
  await notifyAppointmentConfirmed(
    appointment.userId,
    appointment.date,
    appointment.property.title,
    appointment.id
  )
}
*/

// ============================================================================
// 9. CITA CANCELADA
// ============================================================================
// Archivo: src/app/api/appointments/[id]/cancel/route.ts (POST)
//
// Agregar después de cancelar la cita:
/*
import { notifyAppointmentCancelled } from "@/lib/notifications/notificationService"

const appointment = await prisma.appointment.findUnique({ 
  where: { id: appointmentId },
  include: { property: true }
})

if (appointment) {
  await notifyAppointmentCancelled(
    appointment.userId,
    appointment.date,
    appointment.property.title,
    appointment.id
  )
}
*/

// ============================================================================
// 10. CONTRATO LISTO
// ============================================================================
// Archivo: src/app/api/contracts/route.ts (POST) o update
//
// Agregar cuando el contrato está listo para revisar:
/*
import { notifyContractReady } from "@/lib/notifications/notificationService"

const contract = await prisma.contract.create({...})
const property = await prisma.property.findUnique({ where: { id: contract.propertyId } })

if (property) {
  await notifyContractReady(contract.buyerId, property.title, contract.id)
  // También notificar al vendedor:
  await notifyContractReady(property.ownerId, property.title, contract.id)
}
*/

// ============================================================================
// 11. DOCUMENTO CARGADO
// ============================================================================
// Archivo: src/app/api/documents/route.ts (POST)
//
// Agregar después de cargar el documento:
/*
import { notifyDocumentUploaded } from "@/lib/notifications/notificationService"

const document = await prisma.document.create({...})
const users = [document.userId, ...]  // IDs de usuarios que deben notificarse

for (const userId of users) {
  await notifyDocumentUploaded(userId, document.name, document.id)
}
*/

// ============================================================================
// EJEMPLO COMPLETO: Integración en reset-password
// ============================================================================
/*
// File: src/app/api/auth/reset-password/route.ts

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

    const user = await prisma.user.findUnique({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
      },
    })

    // ⭐ AGREGAR NOTIFICACIÓN
    await notifyPasswordChanged(updatedUser.id)

    return NextResponse.json({
      success: true,
      message: "Contraseña restablecida exitosamente",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Error al restablecer contraseña" },
      { status: 500 }
    )
  }
}
*/

// ============================================================================
// USO AVANZADO: Notificaciones para múltiples usuarios
// ============================================================================
/*
import { createNotificationsForUsers } from "@/lib/notifications/notificationService"

// Cuando una propiedad se publica y múltiples usuarios deben ser notificados:
const interestedUsers = await prisma.user.findMany({
  where: {
    role: "CLIENT",
    preferences: {
      contains: property.type
    }
  },
  select: { id: true }
})

const userIds = interestedUsers.map(u => u.id)

await createNotificationsForUsers(userIds, {
  type: "NEW_PROPERTY",
  title: `Nueva Propiedad: ${property.title}`,
  message: `Se ha publicado una nueva propiedad que coincide con tus preferencias: ${property.title}`,
  relatedId: property.id
})
*/

// ============================================================================
// NOTAS IMPORTANTES:
// ============================================================================
/*
1. ALWAYS import from: @/lib/notifications/notificationService
2. Database modelo 'Notification' debe existir en schema.prisma
3. El usuario debe estar autenticado en la sesión para que funcione
4. Las notificaciones se guardan automáticamente en la BD
5. El sistema de notificaciones es async, no bloquea la respuesta
6. Para notificaciones sin usuario específico, usar tipo SYSTEM_ALERT
7. Todos los tipos de notificación tienen templates predefinidos
8. Usar relatedId para relacionar notificaciones con datos (propiedades, ofertas, etc)
*/

export {}
