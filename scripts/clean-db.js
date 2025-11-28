const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanDatabase() {
  try {
    console.log('🧹 Iniciando limpieza de base de datos...\n')

    // Obtener ID del admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' } // Ajusta el email del admin
    })

    if (!admin) {
      console.log('⚠️  Admin no encontrado. Creando admin...')
      const newAdmin = await prisma.user.create({
        data: {
          name: 'Admin',
          email: 'admin@example.com',
          password: '$2b$10$...', // Esto será actualizado en el siguiente paso
          role: 'ADMIN',
          emailVerified: new Date()
        }
      })
      console.log('✅ Admin creado:', newAdmin.email)
    } else {
      console.log('✅ Admin encontrado:', admin.email)
    }

    // Eliminar todos los registros menos el admin
    console.log('\n📋 Eliminando datos...')

    // Eliminar propiedades
    const propertiesDeleted = await prisma.property.deleteMany({})
    console.log(`✅ Propiedades eliminadas: ${propertiesDeleted.count}`)

    // Eliminar documentos
    const documentsDeleted = await prisma.document.deleteMany({})
    console.log(`✅ Documentos eliminados: ${documentsDeleted.count}`)

    // Eliminar notificaciones
    const notificationsDeleted = await prisma.notification.deleteMany({})
    console.log(`✅ Notificaciones eliminadas: ${notificationsDeleted.count}`)

    // Eliminar citas
    const appointmentsDeleted = await prisma.appointment.deleteMany({})
    console.log(`✅ Citas eliminadas: ${appointmentsDeleted.count}`)

    // Eliminar ofertas
    const offersDeleted = await prisma.offer.deleteMany({})
    console.log(`✅ Ofertas eliminadas: ${offersDeleted.count}`)

    // Eliminar usuarios (excepto admin)
    const usersDeleted = await prisma.user.deleteMany({
      where: {
        role: { not: 'ADMIN' }
      }
    })
    console.log(`✅ Usuarios eliminados: ${usersDeleted.count}`)

    console.log('\n🎉 Base de datos limpiada correctamente!')
    console.log('✅ Solo quedan: Admin')

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabase()
