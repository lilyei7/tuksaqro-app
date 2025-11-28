const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log("👤 Creando usuarios de prueba...");

    // Cliente de prueba
    const clientUser = await prisma.user.upsert({
      where: { email: "cliente@test.com" },
      update: {},
      create: {
        email: "cliente@test.com",
        password: await bcrypt.hash("password123", 10),
        name: "Juan Cliente",
        phone: "+1234567890",
        role: "CLIENT",
        emailVerified: new Date(),
      }
    });

    console.log("✅ Cliente creado:", clientUser.id, clientUser.name);

    // Agente de prueba
    const agentUser = await prisma.user.upsert({
      where: { email: "agente@test.com" },
      update: {},
      create: {
        email: "agente@test.com",
        password: await bcrypt.hash("password123", 10),
        name: "María Agente",
        phone: "+0987654321",
        role: "AGENT",
        emailVerified: new Date(),
      }
    });

    console.log("✅ Agente creado:", agentUser.id, agentUser.name);

    // Obtener primera propiedad
    const property = await prisma.property.findFirst();
    
    if (property) {
      console.log("📍 Propiedad encontrada:", property.title);

      // Crear una cita
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + 3);
      appointmentDate.setHours(14, 30, 0, 0);  // Cambié la hora para evitar conflictos

      const appointment = await prisma.appointment.create({
        data: {
          date: appointmentDate,
          duration: 60,
          status: "PENDING",
          notes: "Cita de prueba - Por favor confirmar",
          clientId: clientUser.id,
          agentId: agentUser.id,
          propertyId: property.id,
        }
      });

      console.log("📅 Cita creada:", appointment.id);
      console.log("   Fecha:", appointmentDate.toLocaleString('es-MX'));
      console.log("   Cliente:", clientUser.email);
      console.log("   Agente:", agentUser.email);
    }

    console.log("\n✅ ¡Usuarios y cita de prueba creados exitosamente!");
    console.log("\n📝 Credenciales de prueba:");
    console.log("   Cliente: cliente@test.com / password123");
    console.log("   Agente: agente@test.com / password123");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
