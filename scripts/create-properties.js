const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const properties = [
  {
    title: "Penthouse Moderno en Polanco",
    description: "Espectacular penthouse con vista a la ciudad, 3 recámaras, 2 baños, terraza privada de 80m². Ubicado en la mejor zona de Polanco.",
    price: 3500000,
    currency: "MXN",
    type: "APARTMENT",
    status: "AVAILABLE",
    bedrooms: 3,
    bathrooms: 2,
    area: 280,
    address: "Avenida Paseo de la Reforma 505, Penthouse 2501",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "11580",
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"],
    features: ["Piscina", "Gimnasio", "Seguridad 24/7", "Estacionamiento"]
  },
  {
    title: "Casa Colonial en San Ángel",
    description: "Hermosa casa colonial restaurada en San Ángel. 4 recámaras, 3 baños, jardín interior, estancias amplias.",
    price: 2800000,
    currency: "MXN",
    type: "HOUSE",
    status: "AVAILABLE",
    bedrooms: 4,
    bathrooms: 3,
    area: 350,
    address: "Calle Arenal 12, San Ángel",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "01000",
    images: ["https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=800&h=600&fit=crop"],
    features: ["Chimenea", "Jardín", "Terraza", "Bodegas"]
  },
  {
    title: "Departamento Luxury en Lomas",
    description: "Departamento de lujo con acabados premium, 2 recámaras, 2 baños, balcón con vista panorámica.",
    price: 2200000,
    currency: "MXN",
    type: "APARTMENT",
    status: "AVAILABLE",
    bedrooms: 2,
    bathrooms: 2,
    area: 220,
    address: "Boulevard de las Lomas 456",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "11000",
    images: ["https://images.unsplash.com/photo-1545457529-cf21ec4e4b65?w=800&h=600&fit=crop"],
    features: ["Acabados Premium", "Cocina Integral", "Balcón", "Automatización"]
  },
  {
    title: "Terreno Comercial en Reforma",
    description: "Amplio terreno comercial en Paseo de la Reforma, ideal para proyecto de oficinas o comercio.",
    price: 5000000,
    currency: "MXN",
    type: "LAND",
    status: "AVAILABLE",
    area: 800,
    bedrooms: 0,
    bathrooms: 0,
    address: "Paseo de la Reforma 222",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "06500",
    images: ["https://images.unsplash.com/photo-1518552500797-3ee6fb4b4b21?w=800&h=600&fit=crop"],
    features: ["Esquina", "Acceso a Reforma", "Zona Premium"]
  },
  {
    title: "Oficina Moderna en Reforma",
    description: "Oficina de 150m² completamente amueblada, con vista a la ciudad, aire acondicionado centralizado.",
    price: 25000,
    currency: "MXN",
    type: "OFFICE",
    status: "AVAILABLE",
    area: 150,
    bedrooms: 0,
    bathrooms: 1,
    address: "Paseo de la Reforma 505, Piso 15",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "06500",
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop"],
    features: ["Amueblada", "Recepción", "Servicios Incluidos", "Estacionamiento"]
  },
  {
    title: "Local Comercial en Paseo Interlomas",
    description: "Local comercial de 120m² en zona comercial, excelente para restaurante o tienda boutique.",
    price: 2500,
    currency: "MXN",
    type: "COMMERCIAL",
    status: "AVAILABLE",
    area: 120,
    bedrooms: 0,
    bathrooms: 1,
    address: "Paseo Interlomas 100",
    city: "Huixquilucan",
    state: "Estado de México",
    zipCode: "52763",
    images: ["https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=600&fit=crop"],
    features: ["Zona Comercial", "Alto Tráfico", "Piso Nivelado"]
  },
  {
    title: "Villa Moderna en Bosques de las Lomas",
    description: "Espectacular villa moderna con 5 recámaras, amenidades de lujo, piscina infinita y vista panorámica.",
    price: 4200000,
    currency: "MXN",
    type: "HOUSE",
    status: "AVAILABLE",
    bedrooms: 5,
    bathrooms: 4,
    area: 450,
    address: "Villa Moderna 789",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "11560",
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"],
    features: ["Piscina Infinita", "Cine", "Spa", "Jardín Paisajista"]
  },
  {
    title: "Loft Industrial en Condesa",
    description: "Loft de lujo con acabados industriales, 2 recámaras, cocina abierta, techos altos de 4.5m.",
    price: 1800000,
    currency: "MXN",
    type: "APARTMENT",
    status: "AVAILABLE",
    bedrooms: 2,
    bathrooms: 2,
    area: 200,
    address: "Avenida Michoacán 50",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "06500",
    images: ["https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop"],
    features: ["Techos Altos", "Cocina Abierta", "Exposición Sur", "Terraza"]
  },
  {
    title: "Casa Minimalista en Santa Fe",
    description: "Casa minimalista contemporánea con 3 recámaras, design sofisticado, automatización inteligente.",
    price: 2600000,
    currency: "MXN",
    type: "HOUSE",
    status: "AVAILABLE",
    bedrooms: 3,
    bathrooms: 2,
    area: 280,
    address: "Santa Fe Residencial 234",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "01210",
    images: ["https://images.unsplash.com/photo-1520932066661-38e37baf266d?w=800&h=600&fit=crop"],
    features: ["Minimalista", "Automatización", "Energía Solar", "Piscina"]
  },
  {
    title: "Departamento Céntrico en Roma",
    description: "Acogedor departamento en zona céntrica de Roma, 1 recámara, 1 baño, ubicación perfecta.",
    price: 850000,
    currency: "MXN",
    type: "APARTMENT",
    status: "AVAILABLE",
    bedrooms: 1,
    bathrooms: 1,
    area: 65,
    address: "Calle Álvaro Obregón 150",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "06700",
    images: ["https://images.unsplash.com/photo-1572535967248-e58ecece4bac?w=800&h=600&fit=crop"],
    features: ["Ubicación Central", "Renovado", "Luminoso", "Aceptas Mascotas"]
  },
  {
    title: "Suite de Lujo en Zona Hotelera de Cancún",
    description: "Suite con vista al mar, 2 recámaras, 2 baños, acceso a playa, amenidades de resort.",
    price: 950000,
    currency: "MXN",
    type: "APARTMENT",
    status: "AVAILABLE",
    bedrooms: 2,
    bathrooms: 2,
    area: 150,
    address: "Zona Hotelera Boulevard Kukulcan",
    city: "Cancún",
    state: "Quintana Roo",
    zipCode: "77500",
    images: ["https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop"],
    features: ["Acceso a Playa", "Gimnasio", "Restaurante", "Seguridad 24/7"]
  },
  {
    title: "Casa Tropical en Playa del Carmen",
    description: "Hermosa casa estilo caribeño con 4 recámaras, terraza con vista, ubicada en gated community.",
    price: 1600000,
    currency: "MXN",
    type: "HOUSE",
    status: "AVAILABLE",
    bedrooms: 4,
    bathrooms: 3,
    area: 320,
    address: "Privada Marina 45",
    city: "Playa del Carmen",
    state: "Quintana Roo",
    zipCode: "77710",
    images: ["https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?w=800&h=600&fit=crop"],
    features: ["Acceso a Playa", "Piscina", "Jacuzzi", "Zona Privada"]
  },
  {
    title: "Penthouse en Torre Ejecutiva",
    description: "Penthouse ejecutivo con 3 recámaras, gym privado, terraza con vista a la ciudad, smart home.",
    price: 3800000,
    currency: "MXN",
    type: "APARTMENT",
    status: "AVAILABLE",
    bedrooms: 3,
    bathrooms: 3,
    area: 320,
    address: "Torre Ejecutiva 1000",
    city: "Monterrey",
    state: "Nuevo León",
    zipCode: "64000",
    images: ["https://images.unsplash.com/photo-1512917774080-9b274b5e798a?w=800&h=600&fit=crop"],
    features: ["Gym Privado", "Smart Home", "Valet Parking", "Terraza Panorámica"]
  },
  {
    title: "Casa Campestre en Tepoztlán",
    description: "Casa campestre con 3 recámaras, vista a la montaña, terreno de 5000m², tranquilidad garantizada.",
    price: 1400000,
    currency: "MXN",
    type: "HOUSE",
    status: "AVAILABLE",
    bedrooms: 3,
    bathrooms: 2,
    area: 200,
    address: "Camino a la Montaña 10",
    city: "Tepoztlán",
    state: "Morelos",
    zipCode: "62520",
    images: ["https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=600&fit=crop"],
    features: ["Terreno Grande", "Vista a Montaña", "Piscina", "Palapas"]
  },
  {
    title: "Departamento Boutique en Zona Financiera",
    description: "Departamento boutique en pleno corazón de la zona financiera, 2 recámaras, moderno y funcional.",
    price: 2400000,
    currency: "MXN",
    type: "APARTMENT",
    status: "AVAILABLE",
    bedrooms: 2,
    bathrooms: 2,
    area: 180,
    address: "Avenida Paseo de los Laureles 333",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "05000",
    images: ["https://images.unsplash.com/photo-1560440021-33f237b74c5d?w=800&h=600&fit=crop"],
    features: ["Zona Financiera", "Moderno", "Gimnasio", "Seguridad"]
  },
  {
    title: "Studio en Coyoacán",
    description: "Encantador studio en el corazón de Coyoacán, 1 recámara, cocina independiente, patio.",
    price: 750000,
    currency: "MXN",
    type: "APARTMENT",
    status: "AVAILABLE",
    bedrooms: 1,
    bathrooms: 1,
    area: 55,
    address: "Calle Fernández Leal 25",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "04000",
    images: ["https://images.unsplash.com/photo-1576540611051-0d4b3d6997a5?w=800&h=600&fit=crop"],
    features: ["Estilo Bohemio", "Patio", "Cercano a Tiendas", "Iluminado"]
  },
  {
    title: "Casona Restaurada en Cuernavaca",
    description: "Majestuosa casona colonial restaurada, 6 recámaras, jardines exuberantes, piscina.",
    price: 2900000,
    currency: "MXN",
    type: "HOUSE",
    status: "AVAILABLE",
    bedrooms: 6,
    bathrooms: 4,
    area: 420,
    address: "Paseo del Conquistador 789",
    city: "Cuernavaca",
    state: "Morelos",
    zipCode: "62000",
    images: ["https://images.unsplash.com/photo-1512207736139-f00e84e9b47e?w=800&h=600&fit=crop"],
    features: ["Casona Histórica", "Jardines Amplios", "Piscina", "Bodegas"]
  },
  {
    title: "Casa Tipo Mansión en Guadalajara",
    description: "Espectacular mansión con 5 recámaras, 4 baños, piscina, area de entretenimiento, terreno amplio.",
    price: 2100000,
    currency: "MXN",
    type: "HOUSE",
    status: "AVAILABLE",
    bedrooms: 5,
    bathrooms: 4,
    area: 380,
    address: "Avenida México 500",
    city: "Guadalajara",
    state: "Jalisco",
    zipCode: "44500",
    images: ["https://images.unsplash.com/photo-1572120471610-66e83c47f86d?w=800&h=600&fit=crop"],
    features: ["Mansión", "Área Social Amplia", "Piscina Climatizada", "Estacionamiento"]
  },
  {
    title: "Departamento Vista al Lago en Chapultepec",
    description: "Exclusivo departamento con vista al Lago de Chapultepec, 3 recámaras, acabados de lujo.",
    price: 3200000,
    currency: "MXN",
    type: "APARTMENT",
    status: "AVAILABLE",
    bedrooms: 3,
    bathrooms: 3,
    area: 280,
    address: "Chapultepec Heights Penthouse",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "11560",
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"],
    features: ["Vista Panorámica", "Terraza Privada", "Cine", "Barra"]
  },
  {
    title: "Casa Sustentable en Valle de Bravo",
    description: "Moderna casa ecológica con paneles solares, 3 recámaras, vista a montaña, área para yoga.",
    price: 1850000,
    currency: "MXN",
    type: "HOUSE",
    status: "AVAILABLE",
    bedrooms: 3,
    bathrooms: 2,
    area: 250,
    address: "Loma Verde 12",
    city: "Valle de Bravo",
    state: "Estado de México",
    zipCode: "51200",
    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop"],
    features: ["Paneles Solares", "Ecológica", "Vista Montaña", "Área Yoga"]
  }
];

async function main() {
  try {
    // Get the owner user (happycustomerairbnb@gmail.com)
    const owner = await prisma.user.findUnique({
      where: { email: "happycustomerairbnb@gmail.com" }
    });

    if (!owner) {
      console.error("❌ Usuario no encontrado: happycustomerairbnb@gmail.com");
      process.exit(1);
    }

    console.log(`✅ Usuario encontrado: ${owner.name} (${owner.email})`);
    console.log(`📍 Creando ${properties.length} propiedades...`);

    // Create all properties
    for (const prop of properties) {
      const created = await prisma.property.create({
        data: {
          title: prop.title,
          description: prop.description,
          price: prop.price,
          currency: prop.currency,
          type: prop.type,
          status: prop.status,
          bedrooms: prop.bedrooms || null,
          bathrooms: prop.bathrooms || null,
          area: prop.area || null,
          address: prop.address,
          city: prop.city,
          state: prop.state,
          zipCode: prop.zipCode || null,
          images: JSON.stringify(prop.images),
          features: JSON.stringify(prop.features),
          ownerId: owner.id
        }
      });
      console.log(`✨ Creada: ${created.title}`);
    }

    console.log(`\n✅ ¡${properties.length} propiedades creadas exitosamente!`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
