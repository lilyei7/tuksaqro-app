import { prisma } from "@/lib/prisma/db"

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      take: 20,
    })

    console.log("👥 Usuarios en el sistema:")
    console.log("─".repeat(80))
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email} (${user.role}) - ${user.name || "Sin nombre"}`)
    })
    console.log("─".repeat(80))
    console.log(`Total: ${users.length} usuarios`)
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()
