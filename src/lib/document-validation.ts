import { prisma } from "@/lib/prisma/db"
import { createNotification } from "@/lib/notifications/notificationService"

/**
 * Valida que el propietario tenga los documentos requeridos antes de crear propiedades
 */
export async function validatePropertyOwnerDocuments(userId: string): Promise<{
  isValid: boolean
  missingDocuments: string[]
  message: string
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user || user.role !== "OWNER") {
      return {
        isValid: true, // No es propietario, no necesita validación
        missingDocuments: [],
        message: "Usuario no es propietario"
      }
    }

    // Verificar si tiene al menos una propiedad con INE verificado
    const propertyWithVerifiedINE = await prisma.property.findFirst({
      where: {
        ownerId: userId,
        ineVerified: true
      },
      select: { id: true }
    })

    if (!propertyWithVerifiedINE) {
      // Enviar notificación si no la tiene
      await createNotification({
        userId,
        type: "SYSTEM_ALERT",
        title: "Documentación Requerida",
        message: "Para publicar propiedades, necesitas verificar tu identidad. Por favor carga tu INE."
      })

      return {
        isValid: false,
        missingDocuments: ["INE"],
        message: "Necesitas subir y verificar tu INE para poder crear propiedades"
      }
    }

    return {
      isValid: true,
      missingDocuments: [],
      message: "Documentos válidos"
    }
  } catch (error) {
    console.error("[Document Validation Error]", error)
    return {
      isValid: true, // En caso de error, permitir el flujo
      missingDocuments: [],
      message: "Error al validar documentos"
    }
  }
}
