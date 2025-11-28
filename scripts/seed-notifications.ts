import { prisma } from "@/lib/prisma/db"

async function seedNotifications() {
  try {
    console.log("🌱 Creando notificaciones de prueba...")

    // Primero obtenemos el ID del admin
    const adminUser = await prisma.user.findFirst({
      where: { email: "admin@inmobiliaria.com" },
    })

    if (!adminUser) {
      console.error("❌ No se encontró el usuario admin")
      return
    }

    console.log(`✓ Usuario admin encontrado: ${adminUser.id}`)

    // Notificaciones de prueba
    const notifications = [
      {
        userId: adminUser.id,
        type: "PASSWORD_CHANGED",
        title: "Contraseña Actualizada",
        message: "Tu contraseña fue cambiada exitosamente el 25 de noviembre",
        isRead: false,
      },
      {
        userId: adminUser.id,
        type: "NEW_PROPERTY",
        title: "Nueva Propiedad Publicada",
        message: "Se publicó una nueva propiedad en el sistema",
        isRead: false,
      },
      {
        userId: adminUser.id,
        type: "NEW_OFFER",
        title: "Nueva Oferta Recibida",
        message: "Recibiste una nueva oferta por la propiedad en Providencia",
        isRead: false,
      },
      {
        userId: adminUser.id,
        type: "OFFER_ACCEPTED",
        title: "Oferta Aceptada",
        message: "Tu oferta fue aceptada por el propietario",
        isRead: true,
        readAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
      },
      {
        userId: adminUser.id,
        type: "NEW_APPOINTMENT",
        title: "Nueva Cita Programada",
        message: "Se programó una cita para ver la propiedad el 26 de noviembre",
        isRead: false,
      },
      {
        userId: adminUser.id,
        type: "APPOINTMENT_CONFIRMED",
        title: "Cita Confirmada",
        message: "La cita del 26 de noviembre ha sido confirmada",
        isRead: true,
        readAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // Hace 1 hora
      },
      {
        userId: adminUser.id,
        type: "CONTRACT_READY",
        title: "Contrato Listo",
        message: "El contrato está listo para firmar. Por favor revísalo.",
        isRead: false,
      },
      {
        userId: adminUser.id,
        type: "DOCUMENT_UPLOADED",
        title: "Documento Subido",
        message: "Se cargó un nuevo documento: Certificado de dominio",
        isRead: false,
      },
      {
        userId: adminUser.id,
        type: "SYSTEM_ALERT",
        title: "Alerta del Sistema",
        message: "Se detectó actividad inusual en tu cuenta",
        isRead: false,
      },
      {
        userId: adminUser.id,
        type: "PROPERTY_UPDATED",
        title: "Propiedad Actualizada",
        message: "La propiedad en Las Condes fue actualizada con nuevas fotos",
        isRead: true,
        readAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hace 1 día
      },
    ]

    // Crear las notificaciones
    const created = await prisma.notification.createMany({
      data: notifications,
    })

    console.log(`✅ Se crearon ${created.count} notificaciones de prueba`)

    // Mostrar resumen
    const unread = await prisma.notification.count({
      where: { userId: adminUser.id, isRead: false },
    })

    const read = await prisma.notification.count({
      where: { userId: adminUser.id, isRead: true },
    })

    console.log(`📊 Resumen:`)
    console.log(`   - Sin leer: ${unread}`)
    console.log(`   - Leídas: ${read}`)
    console.log(`   - Total: ${unread + read}`)
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

seedNotifications()
