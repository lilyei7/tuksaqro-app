import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando base de datos...');
  
  // Crear un usuario admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@tuksaqro.com',
      emailVerified: new Date(),
      role: 'ADMIN',
      phone: '+52 55 1234 5678',
      password: '$2a$10$Ag8L6SYjbqbzXL5VvXoUJu8uNJpkrIp7rvXN5zcQgEz.C0M0gBWL6' // admin123
    }
  });
  
  console.log('✓ Usuario admin creado:', admin.email);
  console.log('Database initialized successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
