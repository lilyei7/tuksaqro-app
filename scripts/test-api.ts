import { prisma } from "@/lib/prisma/db"

async function testAPI() {
  try {
    // Obtener el ID del admin
    const adminUser = await prisma.user.findFirst({
      where: { email: "admin@inmobiliaria.com" },
    })

    if (!adminUser) {
      console.error("❌ No se encontró el usuario admin")
      return
    }

    console.log(`✓ Admin encontrado: ${adminUser.id}`)

    // Simular la consulta que hace el API
    const notifications = await prisma.notification.findMany({
      where: {
        userId: adminUser.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: 0,
      take: 10
    })

    const total = await prisma.notification.count({
      where: { userId: adminUser.id }
    })

    console.log(`✓ Notificaciones encontradas: ${notifications.length}`)
    console.log(`✓ Total: ${total}`)

    // Simular la respuesta del API
    const response = {
      notifications,
      pagination: {
        page: 1,
        limit: 10,
        total,
        pages: Math.ceil(total / 10)
      }
    }

    console.log(`\n📊 Respuesta del API:`)
    console.log(JSON.stringify(response, null, 2))
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPI()
