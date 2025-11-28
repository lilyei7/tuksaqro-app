import { prisma } from "@/lib/prisma/db"

export type NotificationType = 
  | "PASSWORD_CHANGED"
  | "NEW_PROPERTY"
  | "NEW_OFFER"
  | "OFFER_ACCEPTED"
  | "OFFER_REJECTED"
  | "NEW_APPOINTMENT"
  | "APPOINTMENT_CONFIRMED"
  | "APPOINTMENT_CANCELLED"
  | "CONTRACT_READY"
  | "DOCUMENT_UPLOADED"
  | "SYSTEM_ALERT"
  | "PROPERTY_UPDATED"
  | "PROPERTY_REMOVED"
  | "USER_REGISTERED"
  | "USER_VERIFIED"

export interface NotificationPayload {
  userId: string
  type: NotificationType
  title: string
  message: string
  contractId?: string
  writingId?: string
  relatedId?: string
}

// Mensajes predefinidos para cada tipo de notificación
const notificationTemplates: Record<NotificationType, (data: any) => { title: string; message: string }> = {
  PASSWORD_CHANGED: () => ({
    title: "Contraseña Actualizada",
    message: "Tu contraseña ha sido cambiada exitosamente. Si no fuiste tú, contacta a soporte.",
  }),
  NEW_PROPERTY: (data) => ({
    title: `Nueva Propiedad: ${data.propertyTitle || "Sin título"}`,
    message: `Se ha publicado una nueva propiedad que coincide con tus criterios de búsqueda.`,
  }),
  NEW_OFFER: (data) => ({
    title: `Nueva Oferta Recibida`,
    message: `Has recibido una nueva oferta de $${data.amount?.toLocaleString() || "0"} en la propiedad ${data.propertyTitle || "sin título"}.`,
  }),
  OFFER_ACCEPTED: (data) => ({
    title: "Oferta Aceptada",
    message: `¡Felicidades! Tu oferta de $${data.amount?.toLocaleString() || "0"} ha sido aceptada.`,
  }),
  OFFER_REJECTED: (data) => ({
    title: "Oferta Rechazada",
    message: `Lamentablemente, tu oferta de $${data.amount?.toLocaleString() || "0"} ha sido rechazada.`,
  }),
  NEW_APPOINTMENT: (data) => ({
    title: `Nueva Cita Programada`,
    message: `Tienes una cita programada para ${data.date || "una fecha"} en ${data.propertyTitle || "una propiedad"}.`,
  }),
  APPOINTMENT_CONFIRMED: (data) => ({
    title: "Cita Confirmada",
    message: `Tu cita del ${data.date || "una fecha"} ha sido confirmada.`,
  }),
  APPOINTMENT_CANCELLED: (data) => ({
    title: "Cita Cancelada",
    message: `Tu cita del ${data.date || "una fecha"} ha sido cancelada.`,
  }),
  CONTRACT_READY: (data) => ({
    title: "Contrato Listo para Revisar",
    message: `El contrato de la propiedad ${data.propertyTitle || "sin título"} está listo para que lo revises.`,
  }),
  DOCUMENT_UPLOADED: (data) => ({
    title: "Documento Cargado",
    message: `Se ha cargado un nuevo documento: ${data.documentName || "sin nombre"}.`,
  }),
  SYSTEM_ALERT: (data) => ({
    title: data.title || "Alerta del Sistema",
    message: data.message || "Tienes un mensaje importante del sistema.",
  }),
  PROPERTY_UPDATED: (data) => ({
    title: `Propiedad Actualizada`,
    message: `La propiedad ${data.propertyTitle || "sin título"} ha sido actualizada con nueva información.`,
  }),
  PROPERTY_REMOVED: (data) => ({
    title: `Propiedad Removida`,
    message: `La propiedad ${data.propertyTitle || "sin título"} ha sido removida del sistema.`,
  }),
  USER_REGISTERED: (data) => ({
    title: "Nuevo Usuario Registrado",
    message: `El usuario ${data.userName || "nuevo"} se ha registrado en el sistema.`,
  }),
  USER_VERIFIED: (data) => ({
    title: "Email Verificado",
    message: `Tu email ha sido verificado correctamente. Tu cuenta ahora tiene acceso completo.`,
  }),
}

/**
 * Crear una notificación en la base de datos
 */
export async function createNotification(payload: NotificationPayload) {
  try {
    const template = notificationTemplates[payload.type]
    const { title, message } = template(payload) || payload

    const notification = await prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        title: title || payload.title,
        message: message || payload.message,
        contractId: payload.contractId,
        writingId: payload.writingId,
        isRead: false,
      },
    })

    console.log(`[Notification] ${payload.type} created for user ${payload.userId}`)
    return notification
  } catch (error) {
    console.error("[Notification Error]", error)
    throw error
  }
}

/**
 * Crear notificaciones para múltiples usuarios
 */
export async function createNotificationsForUsers(userIds: string[], payload: Omit<NotificationPayload, "userId">) {
  try {
    const results = await Promise.all(
      userIds.map((userId) =>
        createNotification({
          ...payload,
          userId,
        })
      )
    )
    return results
  } catch (error) {
    console.error("[Notification Batch Error]", error)
    throw error
  }
}

/**
 * Notificación: Contraseña cambiada
 */
export async function notifyPasswordChanged(userId: string) {
  return createNotification({
    userId,
    type: "PASSWORD_CHANGED",
    title: "Contraseña Actualizada",
    message: "Tu contraseña ha sido cambiada exitosamente.",
  })
}

/**
 * Notificación: Nueva propiedad publicada
 */
export async function notifyNewProperty(adminId: string, propertyTitle: string, propertyId: string) {
  return createNotification({
    userId: adminId,
    type: "NEW_PROPERTY",
    title: `Nueva Propiedad: ${propertyTitle}`,
    message: `Se ha publicado una nueva propiedad: ${propertyTitle}`,
    relatedId: propertyId,
  })
}

/**
 * Notificación: Nueva oferta recibida
 */
export async function notifyNewOffer(propertyOwnerId: string, offerAmount: number, propertyTitle: string, offerId: string) {
  return createNotification({
    userId: propertyOwnerId,
    type: "NEW_OFFER",
    title: `Nueva Oferta: $${offerAmount.toLocaleString()}`,
    message: `Has recibido una nueva oferta de $${offerAmount.toLocaleString()} en ${propertyTitle}`,
    relatedId: offerId,
  })
}

/**
 * Notificación: Oferta aceptada
 */
export async function notifyOfferAccepted(buyerId: string, offerAmount: number, propertyTitle: string, offerId: string) {
  return createNotification({
    userId: buyerId,
    type: "OFFER_ACCEPTED",
    title: "¡Oferta Aceptada!",
    message: `¡Felicidades! Tu oferta de $${offerAmount.toLocaleString()} en ${propertyTitle} ha sido aceptada.`,
    relatedId: offerId,
  })
}

/**
 * Notificación: Oferta rechazada
 */
export async function notifyOfferRejected(buyerId: string, offerAmount: number, propertyTitle: string, offerId: string) {
  return createNotification({
    userId: buyerId,
    type: "OFFER_REJECTED",
    title: "Oferta Rechazada",
    message: `Tu oferta de $${offerAmount.toLocaleString()} en ${propertyTitle} ha sido rechazada.`,
    relatedId: offerId,
  })
}

/**
 * Notificación: Nueva cita programada
 */
export async function notifyNewAppointment(userId: string, appointmentDate: Date, propertyTitle: string, appointmentId: string) {
  const dateStr = appointmentDate.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return createNotification({
    userId,
    type: "NEW_APPOINTMENT",
    title: `Nueva Cita Programada`,
    message: `Tienes una cita el ${dateStr} para ver ${propertyTitle}`,
    relatedId: appointmentId,
  })
}

/**
 * Notificación: Cita confirmada
 */
export async function notifyAppointmentConfirmed(userId: string, appointmentDate: Date, propertyTitle: string, appointmentId: string) {
  const dateStr = appointmentDate.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return createNotification({
    userId,
    type: "APPOINTMENT_CONFIRMED",
    title: "Cita Confirmada",
    message: `Tu cita del ${dateStr} para ${propertyTitle} ha sido confirmada.`,
    relatedId: appointmentId,
  })
}

/**
 * Notificación: Cita cancelada
 */
export async function notifyAppointmentCancelled(userId: string, appointmentDate: Date, propertyTitle: string, appointmentId: string) {
  const dateStr = appointmentDate.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return createNotification({
    userId,
    type: "APPOINTMENT_CANCELLED",
    title: "Cita Cancelada",
    message: `Tu cita del ${dateStr} para ${propertyTitle} ha sido cancelada.`,
    relatedId: appointmentId,
  })
}

/**
 * Notificación: Contrato listo
 */
export async function notifyContractReady(userId: string, propertyTitle: string, contractId: string) {
  return createNotification({
    userId,
    type: "CONTRACT_READY",
    title: "Contrato Listo para Revisar",
    message: `El contrato para ${propertyTitle} está listo para que lo revises.`,
    contractId,
  })
}

/**
 * Notificación: Documento cargado
 */
export async function notifyDocumentUploaded(userId: string, documentName: string, documentId: string) {
  return createNotification({
    userId,
    type: "DOCUMENT_UPLOADED",
    title: "Documento Cargado",
    message: `Se ha cargado un nuevo documento: ${documentName}`,
    relatedId: documentId,
  })
}

/**
 * Notificación: Usuario registrado (para admin)
 */
export async function notifyNewUserRegistered(adminId: string, userName: string, userEmail: string, userId: string) {
  return createNotification({
    userId: adminId,
    type: "USER_REGISTERED",
    title: "Nuevo Usuario Registrado",
    message: `${userName} (${userEmail}) se ha registrado en el sistema.`,
    relatedId: userId,
  })
}

/**
 * Notificación: Email verificado
 */
export async function notifyUserEmailVerified(userId: string) {
  return createNotification({
    userId,
    type: "USER_VERIFIED",
    title: "Email Verificado",
    message: "Tu email ha sido verificado correctamente. Tu cuenta ahora tiene acceso completo.",
  })
}

/**
 * Obtener notificaciones de un usuario
 */
export async function getUserNotifications(userId: string, limit = 50) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

/**
 * Obtener conteo de notificaciones
 */
export async function getNotificationCounts(userId: string) {
  const [unread, total, read] = await Promise.all([
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
    prisma.notification.count({
      where: { userId },
    }),
    prisma.notification.count({
      where: { userId, isRead: true },
    }),
  ])

  return { unread, total, read }
}

/**
 * Marcar notificación como leída
 */
export async function markNotificationAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })
}

/**
 * Eliminar notificación
 */
export async function deleteNotification(notificationId: string) {
  return prisma.notification.delete({
    where: { id: notificationId },
  })
}

/**
 * Limpiar notificaciones antiguas (más de 30 días)
 */
export async function cleanupOldNotifications(daysOld = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  return prisma.notification.deleteMany({
    where: {
      AND: [
        { isRead: true },
        { createdAt: { lt: cutoffDate } },
      ],
    },
  })
}
