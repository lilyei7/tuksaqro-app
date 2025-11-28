import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Coordenadas de ejemplo para diferentes ubicaciones en CDMX y área metropolitana
const sampleCoordinates = [
  // Polanco
  { latitude: 19.4330, longitude: -99.1930 },
  { latitude: 19.4315, longitude: -99.1915 },
  { latitude: 19.4350, longitude: -99.1950 },
  // Condesa
  { latitude: 19.4110, longitude: -99.1750 },
  { latitude: 19.4130, longitude: -99.1770 },
  { latitude: 19.4090, longitude: -99.1730 },
  // Roma Norte
  { latitude: 19.4190, longitude: -99.1650 },
  { latitude: 19.4210, longitude: -99.1670 },
  { latitude: 19.4170, longitude: -99.1630 },
  // Santa Fe
  { latitude: 19.3570, longitude: -99.2610 },
  { latitude: 19.3590, longitude: -99.2630 },
  { latitude: 19.3550, longitude: -99.2590 },
  // Coyoacán
  { latitude: 19.3460, longitude: -99.1620 },
  { latitude: 19.3480, longitude: -99.1640 },
  { latitude: 19.3440, longitude: -99.1600 },
  // Zona Centro
  { latitude: 19.4326, longitude: -99.1332 },
  { latitude: 19.4340, longitude: -99.1350 },
  { latitude: 19.4310, longitude: -99.1310 },
]

async function updatePropertiesWithCoordinates() {
  try {
    console.log('🗺️ Actualizando propiedades con coordenadas GPS...')

    // Obtener todas las propiedades existentes
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        address: true,
        city: true,
        latitude: true,
        longitude: true
      }
    })

    console.log(`📊 Encontradas ${properties.length} propiedades`)

    if (properties.length === 0) {
      console.log('⚠️ No hay propiedades para actualizar. Ejecuta el seed primero.')
      return
    }

    let updatedCount = 0

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i]
      const coordinates = sampleCoordinates[i % sampleCoordinates.length]

      // Solo actualizar si no tiene coordenadas
      if (!property.latitude || !property.longitude) {
        await prisma.property.update({
          where: { id: property.id },
          data: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          }
        })

        console.log(`✅ Actualizada: ${property.title} - Coordenadas: ${coordinates.latitude}, ${coordinates.longitude}`)
        updatedCount++
      } else {
        console.log(`⚠️ Ya tiene coordenadas: ${property.title}`)
      }
    }

    console.log(`🎉 Proceso completado! ${updatedCount} propiedades actualizadas con coordenadas GPS`)

  } catch (error) {
    console.error('❌ Error actualizando propiedades:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePropertiesWithCoordinates()