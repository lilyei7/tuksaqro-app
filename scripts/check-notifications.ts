import { prisma } from "@/lib/prisma/db"

async function checkNotifications() {
  try {
    // Obtener el ID del admin
    const adminUser = await prisma.user.findFirst({
      where: { email: "admin@inmobiliaria.com" },
    })

    if (!adminUser) {
      console.error("❌ No se encontró el usuario admin")
      return
    }

    console.log(`👤 Usuario: ${adminUser.email} (${adminUser.id})`)
    console.log("─".repeat(80))

    // Contar notificaciones
    const notifications = await prisma.notification.findMany({
      where: { userId: adminUser.id },
      orderBy: { createdAt: "desc" },
    })

    console.log(`📊 Total de notificaciones: ${notifications.length}`)
    console.log("─".repeat(80))

    if (notifications.length === 0) {
      console.log("⚠️  No hay notificaciones para este usuario")
      return
    }

    // Mostrar primeras 10
    console.log("📋 Últimas 10 notificaciones:")
    notifications.slice(0, 10).forEach((n, i) => {
      const status = n.isRead ? "✅ Leída" : "🆕 Sin leer"
      console.log(`${i + 1}. [${status}] ${n.title}`)
      console.log(`   ID: ${n.id}`)
      console.log(`   Tipo: ${n.type}`)
      console.log(`   Fecha: ${n.createdAt.toLocaleString("es-ES")}`)
    })

    console.log("─".repeat(80))
    const unread = notifications.filter((n) => !n.isRead).length
    const read = notifications.filter((n) => n.isRead).length
    console.log(`📊 Sin leer: ${unread} | Leídas: ${read}`)
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkNotifications()
