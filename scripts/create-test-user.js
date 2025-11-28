const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log("👤 Creando usuario de prueba...");

    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: "happycustomerairbnb@gmail.com" }
    });

    if (existingUser) {
      console.log("✅ Usuario ya existe:", existingUser.id);
      return existingUser.id;
    }

    // Crear usuario
    const hashedPassword = await bcrypt.hash("javape79", 10);
    
    const user = await prisma.user.create({
      data: {
        email: "happycustomerairbnb@gmail.com",
        password: hashedPassword,
        name: "Happy Customer",
        phone: "+1234567890",
        role: "AGENT",
        emailVerified: new Date(),
      }
    });

    console.log("✅ Usuario creado exitosamente:", user.id);
    return user.id;

  } catch (error) {
    console.error("❌ Error creando usuario:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
