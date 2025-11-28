import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDatabase() {
  try {
    console.log('🧹 Iniciando limpieza de base de datos...\n')

    // Obtener el admin
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!admin) {
      console.log('⚠️  No se encontró usuario admin')
      await prisma.$disconnect()
      return
    }

    console.log('✅ Admin encontrado:', admin.email)
    console.log('')

    // Eliminar en orden para evitar relaciones
    const notificationsDeleted = await prisma.notification.deleteMany({})
    console.log(`✅ Notificaciones eliminadas: ${notificationsDeleted.count}`)

    const documentsDeleted = await prisma.document.deleteMany({})
    console.log(`✅ Documentos eliminados: ${documentsDeleted.count}`)

    const appointmentsDeleted = await prisma.appointment.deleteMany({})
    console.log(`✅ Citas eliminadas: ${appointmentsDeleted.count}`)

    const offersDeleted = await prisma.offer.deleteMany({})
    console.log(`✅ Ofertas eliminadas: ${offersDeleted.count}`)

    const messagesDeleted = await prisma.message.deleteMany({})
    console.log(`✅ Mensajes eliminados: ${messagesDeleted.count}`)

    const propertiesDeleted = await prisma.property.deleteMany({})
    console.log(`✅ Propiedades eliminadas: ${propertiesDeleted.count}`)

    const usersDeleted = await prisma.user.deleteMany({
      where: {
        role: { not: 'ADMIN' }
      }
    })
    console.log(`✅ Usuarios eliminados: ${usersDeleted.count}`)

    console.log('\n🎉 Base de datos limpiada correctamente!')
    console.log(`✅ Admin guardado: ${admin.name} (${admin.email})`)

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabase()
