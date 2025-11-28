import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUsers() {
  try {
    console.log('Creando usuarios de prueba...');

    // Datos de usuarios a crear
    const usersToCreate = [
      // CLIENTES (3)
      {
        name: 'María González',
        email: 'maria.gonzalez@email.com',
        phone: '+56912345678',
        role: 'CLIENT',
        password: 'cliente123',
        emailVerified: new Date()
      },
      {
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@email.com',
        phone: '+56987654321',
        role: 'CLIENT',
        password: 'cliente123',
        emailVerified: new Date()
      },
      {
        name: 'Ana López',
        email: 'ana.lopez@email.com',
        phone: '+56911223344',
        role: 'CLIENT',
        password: 'cliente123',
        emailVerified: new Date()
      },

      // OWNERS (3)
      {
        name: 'Roberto Martínez',
        email: 'roberto.martinez@email.com',
        phone: '+56944556677',
        role: 'OWNER',
        password: 'owner123',
        emailVerified: new Date()
      },
      {
        name: 'Patricia Silva',
        email: 'patricia.silva@email.com',
        phone: '+56977889900',
        role: 'OWNER',
        password: 'owner123',
        emailVerified: new Date()
      },
      {
        name: 'Miguel Torres',
        email: 'miguel.torres@email.com',
        phone: '+56900112233',
        role: 'OWNER',
        password: 'owner123',
        emailVerified: new Date()
      },

      // AGENTS (3)
      {
        name: 'Sofía Ramírez',
        email: 'sofia.ramirez@email.com',
        phone: '+56933445566',
        role: 'AGENT',
        password: 'agent123',
        emailVerified: new Date()
      },
      {
        name: 'Diego Herrera',
        email: 'diego.herrera@email.com',
        phone: '+56966778899',
        role: 'AGENT',
        password: 'agent123',
        emailVerified: new Date()
      },
      {
        name: 'Valentina Castro',
        email: 'valentina.castro@email.com',
        phone: '+56999001122',
        role: 'AGENT',
        password: 'agent123',
        emailVerified: new Date()
      },

      // PARTNERS (3)
      {
        name: 'Empresa Inmobiliaria ABC',
        email: 'contacto@abc-inmobiliaria.com',
        phone: '+56222334455',
        role: 'PARTNER',
        password: 'partner123',
        emailVerified: new Date()
      },
      {
        name: 'Constructora XYZ Ltda',
        email: 'ventas@constructora-xyz.com',
        phone: '+56224455667',
        role: 'PARTNER',
        password: 'partner123',
        emailVerified: new Date()
      },
      {
        name: 'Grupo Inmobiliario 123',
        email: 'info@grupo123.com',
        phone: '+56226677889',
        role: 'PARTNER',
        password: 'partner123',
        emailVerified: new Date()
      }
    ];

    // Verificar usuarios existentes
    const existingUsers = await prisma.user.findMany({
      select: { email: true, role: true }
    });

    const existingEmails = new Set(existingUsers.map(u => u.email));
    const roleCounts = existingUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    console.log('Usuarios existentes por rol:', roleCounts);

    // Filtrar usuarios que no existen aún
    const usersToCreateFiltered = usersToCreate.filter(user => !existingEmails.has(user.email));

    if (usersToCreateFiltered.length === 0) {
      console.log('Todos los usuarios ya existen.');
      return;
    }

    console.log(`Creando ${usersToCreateFiltered.length} usuarios...`);

    // Crear usuarios
    for (const userData of usersToCreateFiltered) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          password: hashedPassword,
          emailVerified: userData.emailVerified
        }
      });

      console.log(`✅ Usuario creado: ${user.name} (${user.role}) - ${user.email}`);
    }

    // Conteo final
    const finalUsers = await prisma.user.findMany({
      select: { role: true }
    });

    const finalRoleCounts = finalUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Resumen final de usuarios por rol:');
    Object.entries(finalRoleCounts).forEach(([role, count]) => {
      console.log(`${role}: ${count}`);
    });

    console.log('\n🎉 Proceso completado exitosamente!');

  } catch (error) {
    console.error('Error creando usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();