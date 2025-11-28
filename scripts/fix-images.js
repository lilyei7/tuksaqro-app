const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// URLs válidas de Unsplash para propiedades inmobiliarias
const validImageUrls = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop", // Casa moderna
  "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800&h=600&fit=crop", // Interior casa
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop", // Living room
  "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop", // Casa suburbana
  "https://images.unsplash.com/photo-1512917774080-9b274b5e798a?w=800&h=600&fit=crop", // Cocina moderna
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop", // Arquitectura moderna
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop", // Casa con jardín
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop", // Interior moderno
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop", // Sala de estar
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop", // Cocina
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop", // Casa moderna exterior
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop", // Living room alternativo
  "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop", // Dormitorio
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop", // Baño moderno
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop", // Fachada casa
  "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800&h=600&fit=crop", // Comedor
  "https://images.unsplash.com/photo-1600585154363-67eb8e497f40?w=800&h=600&fit=crop", // Terraza
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&h=600&fit=crop", // Estudio
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop", // Piscina
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop"  // Sala adicional
];

async function updatePropertyImages() {
  try {
    console.log("🔄 Actualizando URLs de imágenes de propiedades...");

    // Obtener todas las propiedades
    const properties = await prisma.property.findMany({
      select: { id: true, title: true, images: true }
    });

    console.log(`📊 Encontradas ${properties.length} propiedades`);

    // Actualizar cada propiedad con URLs válidas
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const imageIndex = i % validImageUrls.length;
      const newImages = [validImageUrls[imageIndex]];

      await prisma.property.update({
        where: { id: property.id },
        data: { images: JSON.stringify(newImages) }
      });

      console.log(`✅ Actualizada: ${property.title} - Nueva imagen: ${newImages[0]}`);
    }

    console.log("🎉 ¡Todas las imágenes han sido actualizadas exitosamente!");

  } catch (error) {
    console.error("❌ Error actualizando imágenes:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePropertyImages();