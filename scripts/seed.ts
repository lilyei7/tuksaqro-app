import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedDatabase() {
  try {
    console.log('🌱 Creando agentes de prueba...')

    // Crear agentes de prueba
    const agents = [
      {
        name: 'María González',
        email: 'maria.gonzalez@inmobiliaria.com',
        password: 'password123',
        phone: '+56912345678',
        role: 'AGENT' as const,
      },
      {
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@inmobiliaria.com',
        password: 'password123',
        phone: '+56987654321',
        role: 'AGENT' as const,
      },
      {
        name: 'Ana López',
        email: 'ana.lopez@inmobiliaria.com',
        password: 'password123',
        phone: '+56911223344',
        role: 'AGENT' as const,
      }
    ]

    for (const agent of agents) {
      // Verificar si ya existe
      const existingAgent = await prisma.user.findUnique({
        where: { email: agent.email }
      })

      if (!existingAgent) {
        const hashedPassword = await bcrypt.hash(agent.password, 12)

        await prisma.user.create({
          data: {
            ...agent,
            password: hashedPassword,
            emailVerified: new Date(),
          }
        })
        console.log(`✅ Agente ${agent.name} creado`)
      } else {
        console.log(`⚠️ Agente ${agent.name} ya existe`)
      }
    }

    // Crear un administrador
    const adminEmail = 'admin@inmobiliaria.com'
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash('admin123', 12)
      await prisma.user.create({
        data: {
          name: 'Administrador',
          email: adminEmail,
          password: adminPassword,
          role: 'ADMIN',
          emailVerified: new Date(),
        }
      })
      console.log('✅ Administrador creado')
    } else {
      console.log('⚠️ Administrador ya existe')
    }

    console.log('🎉 Base de datos poblada exitosamente!')
    console.log('Agentes de prueba:')
    console.log('- maria.gonzalez@inmobiliaria.com / password123')
    console.log('- carlos.rodriguez@inmobiliaria.com / password123')
    console.log('- ana.lopez@inmobiliaria.com / password123')
    console.log('Administrador:')
    console.log('- admin@inmobiliaria.com / admin123')

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()