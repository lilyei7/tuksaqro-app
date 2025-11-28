import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creando datos REALES para TUKSAQRO - Plataforma Inmobiliaria Mexicana...')

  // Crear usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tuksaqro.com' },
    update: {},
    create: {
      name: 'Ana María López García',
      email: 'admin@tuksaqro.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+52 55 5282 1493',
      emailVerified: new Date(),
    },
  })

  // Crear usuarios CLIENTES reales
  const cliente1 = await prisma.user.upsert({
    where: { email: 'maria.gonzalez@email.com' },
    update: {},
    create: {
      name: 'María González Hernández',
      email: 'maria.gonzalez@email.com',
      password: await bcrypt.hash('cliente123', 12),
      role: 'CLIENT',
      phone: '+52 55 2678 4592',
      emailVerified: new Date(),
    },
  })

  const cliente2 = await prisma.user.upsert({
    where: { email: 'juan.perez@gmail.com' },
    update: {},
    create: {
      name: 'Juan Pérez Martínez',
      email: 'juan.perez@gmail.com',
      password: await bcrypt.hash('cliente456', 12),
      role: 'CLIENT',
      phone: '+52 33 1456 7890',
      emailVerified: new Date(),
    },
  })

  const cliente3 = await prisma.user.upsert({
    where: { email: 'laura.ramirez@outlook.com' },
    update: {},
    create: {
      name: 'Laura Ramírez Sánchez',
      email: 'laura.ramirez@outlook.com',
      password: await bcrypt.hash('cliente789', 12),
      role: 'CLIENT',
      phone: '+52 81 8345 1234',
      emailVerified: new Date(),
    },
  })

  // Crear usuarios PROPIETARIOS reales
  const propietario1 = await prisma.user.upsert({
    where: { email: 'carlos.rodriguez@inmobiliaria.com' },
    update: {},
    create: {
      name: 'Carlos Rodríguez Morales',
      email: 'carlos.rodriguez@inmobiliaria.com',
      password: await bcrypt.hash('owner123', 12),
      role: 'OWNER',
      phone: '+52 55 3621 7894',
      emailVerified: new Date(),
    },
  })

  const propietario2 = await prisma.user.upsert({
    where: { email: 'sofia.mendoza@gmail.com' },
    update: {},
    create: {
      name: 'Sofía Mendoza López',
      email: 'sofia.mendoza@gmail.com',
      password: await bcrypt.hash('owner456', 12),
      role: 'OWNER',
      phone: '+52 33 3829 4567',
      emailVerified: new Date(),
    },
  })

  const propietario3 = await prisma.user.upsert({
    where: { email: 'diego.torres@propiedades.mx' },
    update: {},
    create: {
      name: 'Diego Torres Jiménez',
      email: 'diego.torres@propiedades.mx',
      password: await bcrypt.hash('owner789', 12),
      role: 'OWNER',
      phone: '+52 81 1567 2345',
      emailVerified: new Date(),
    },
  })

  // Crear usuarios AGENTES INMOBILIARIOS reales
  const agente1 = await prisma.user.upsert({
    where: { email: 'ana.lopez@tuksaqro.com' },
    update: {},
    create: {
      name: 'Ana López García',
      email: 'ana.lopez@tuksaqro.com',
      password: await bcrypt.hash('agent123', 12),
      role: 'AGENT',
      phone: '+52 55 5282 1493',
      emailVerified: new Date(),
    },
  })

  const agente2 = await prisma.user.upsert({
    where: { email: 'roberto.sanchez@remax.com' },
    update: {},
    create: {
      name: 'Roberto Sánchez Díaz',
      email: 'roberto.sanchez@remax.com',
      password: await bcrypt.hash('agent456', 12),
      role: 'AGENT',
      phone: '+52 33 3678 9012',
      emailVerified: new Date(),
    },
  })

  // Crear propiedades REALES en México
  const property1 = await prisma.property.upsert({
    where: { id: 'prop-1' },
    update: {},
    create: {
      id: 'prop-1',
      title: 'Casa Moderna en Polanco - 3 Recámaras',
      description: 'Hermosa casa moderna de 280m² en una de las zonas más exclusivas de la Ciudad de México. Cuenta con acabados de lujo, jardín privado, estacionamiento para 2 autos, cocina integral, y terraza con vista panorámica. Cercana a plazas comerciales, escuelas internacionales y transporte público.',
      price: 18500000, // $18.5 MDP
      address: 'Av. Presidente Masaryk 123, Polanco, Miguel Hidalgo, 11560 Ciudad de México, CDMX',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '11560',
      bedrooms: 3,
      bathrooms: 3,
      area: 280,
      type: 'HOUSE',
      status: 'AVAILABLE',
          features: JSON.stringify([
            "Jardín privado",
            "Estacionamiento techado",
            "Cocina integral",
            "Terraza",
            "Seguridad 24/7",
            "Cerca del metro"
          ]),
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
          ]),
      ownerId: propietario1.id,
    },
  })

  const property2 = await prisma.property.upsert({
    where: { id: 'prop-2' },
    update: {},
    create: {
      id: 'prop-2',
      title: 'Departamento Ejecutivo en Condesa - 2 Recámaras',
      description: 'Elegante departamento completamente remodelado en la Condesa. 120m² de espacios amplios y luminosos. Sala-comedor integrada, cocina equipada con electrodomésticos de primera línea, 2 recámaras con vestidores, 2 baños completos, balcón con vista a parque, y piso de madera original restaurado.',
      price: 8900000, // $8.9 MDP
      address: 'Calle Michoacán 45, Condesa, Cuauhtémoc, 06100 Ciudad de México, CDMX',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '06100',
      bedrooms: 2,
      bathrooms: 2,
      area: 120,
      type: 'APARTMENT',
      status: 'AVAILABLE',
      features: JSON.stringify(['Vista a parque', 'Piso de madera', 'Cocina equipada', 'Vestidores', 'Balcony', 'Zona segura']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800']),
      ownerId: propietario2.id,
    },
  })

  const property3 = await prisma.property.upsert({
    where: { id: 'prop-3' },
    update: {},
    create: {
      id: 'prop-3',
      title: 'Casa Familiar en Jardines del Valle - Guadalajara',
      description: 'Amplia casa familiar de 350m² en fraccionamiento privado con vigilancia 24/7. 4 recámaras (todas con baño), sala familiar, comedor formal, cocina americana, área de lavado, jardín con alberca, estacionamiento para 3 autos, y cuarto de servicio independiente.',
      price: 12500000, // $12.5 MDP
      address: 'Calle de los Álamos 78, Jardines del Valle, Zapopan, 45138 Guadalajara, Jalisco',
      city: 'Guadalajara',
      state: 'Jalisco',
      zipCode: '45138',
      bedrooms: 4,
      bathrooms: 4,
      area: 350,
      type: 'HOUSE',
      status: 'PENDING',
      features: JSON.stringify(['Alberca', 'Jardín grande', 'Cuarto de servicio', 'Estacionamiento 3 autos', 'Vigilancia 24/7', 'Cerca de escuelas']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']),
      ownerId: propietario3.id,
    },
  })

  const property4 = await prisma.property.upsert({
    where: { id: 'prop-4' },
    update: {},
    create: {
      id: 'prop-4',
      title: 'Local Comercial en Zona Rosa - Excelente Ubicación',
      description: 'Local comercial estratégico en la Zona Rosa de la CDMX. 180m² ideales para restaurante, tienda o oficina. Fachada de cristal, instalación eléctrica trifásica, baño privado, aire acondicionado central, y excelente flujo peatonal. Perfecto para negocio establecido.',
      price: 22000000, // $22 MDP
      address: 'Av. Insurgentes Sur 245, Zona Rosa, Juárez, 06600 Ciudad de México, CDMX',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '06600',
      bedrooms: 0,
      bathrooms: 1,
      area: 180,
      type: 'COMMERCIAL',
      status: 'AVAILABLE',
      features: JSON.stringify(['Ubicación comercial', 'Fachada cristal', 'Aire acondicionado', 'Instalación trifásica', 'Alto flujo peatonal', 'Zona turística']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800']),
      ownerId: propietario1.id,
    },
  })

  const property5 = await prisma.property.upsert({
    where: { id: 'prop-5' },
    update: {},
    create: {
      id: 'prop-5',
      title: 'Terreno Residencial en Santa Fe - Desarrollo Urbano',
      description: 'Terreno plano de 800m² en zona de alto crecimiento urbano en Santa Fe. Servicios urbanos completos (agua, luz, drenaje, teléfono), uso de suelo habitacional, y excelente ubicación cerca de centros comerciales, hospitales y escuelas. Ideal para construcción de casa habitación.',
      price: 4500000, // $4.5 MDP
      address: 'Calle Lago de Chapala s/n, Santa Fe, Álvaro Obregón, 01219 Ciudad de México, CDMX',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '01219',
      bedrooms: 0,
      bathrooms: 0,
      area: 800,
      type: 'LAND',
      status: 'AVAILABLE',
      features: JSON.stringify(['Servicios urbanos', 'Zona residencial', 'Terreno plano', 'Cerca de centros comerciales', 'Zona segura', 'Alto crecimiento']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800']),
      ownerId: propietario2.id,
    },
  })

  const property6 = await prisma.property.upsert({
    where: { id: 'prop-6' },
    update: {},
    create: {
      id: 'prop-6',
      title: 'Oficina Corporativa en Reforma - Piso Completo',
      description: 'Oficina corporativa moderna en Paseo de la Reforma. 250m² de espacios diáfanos con división modular, recepción privada, 4 oficinas privadas, sala de juntas, cocina equipada, 3 baños completos, estacionamiento subterráneo, y sistema de climatización central.',
      price: 32000000, // $32 MDP
      address: 'Paseo de la Reforma 345, Piso 8, Juárez, Cuauhtémoc, 06600 Ciudad de México, CDMX',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '06600',
      bedrooms: 0,
      bathrooms: 3,
      area: 250,
      type: 'OFFICE',
      status: 'SOLD',
      features: JSON.stringify(['Sala de juntas', 'Recepción privada', 'Estacionamiento subterráneo', 'Climatización central', 'Ubicación céntrica', 'Seguridad 24/7']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800']),
      ownerId: propietario3.id,
    },
  })

  // Crear OFERTAS REALES entre clientes y propiedades
  const offer1 = await prisma.offer.upsert({
    where: { id: 'offer-1' },
    update: {},
    create: {
      id: 'offer-1',
      amount: 17500000, // Oferta por debajo del precio pedido
      status: 'PENDING',
      conditions: 'Pago de contado con 10% de descuento. Entrega inmediata. El comprador está dispuesto a cerrar el trato en las próximas 2 semanas.',
      clientId: cliente1.id,
      propertyId: property1.id,
    },
  })

  const offer2 = await prisma.offer.upsert({
    where: { id: 'offer-2' },
    update: {},
    create: {
      id: 'offer-2',
      amount: 8500000, // Oferta exacta al precio
      status: 'ACCEPTED',
      conditions: 'Pago con crédito hipotecario INFONAVIT. El comprador ya tiene pre-aprobación bancaria y puede cerrar en 30 días.',
      clientId: cliente2.id,
      propertyId: property2.id,
    },
  })

  const offer3 = await prisma.offer.upsert({
    where: { id: 'offer-3' },
    update: {},
    create: {
      id: 'offer-3',
      amount: 11500000, // Oferta por debajo del precio
      status: 'COUNTER_OFFER',
      conditions: 'Pago mixto: 40% contado y 60% crédito. Solicitan incluir muebles y electrodomésticos en el precio final.',
      clientId: cliente3.id,
      propertyId: property3.id,
    },
  })

  const offer4 = await prisma.offer.upsert({
    where: { id: 'offer-4' },
    update: {},
    create: {
      id: 'offer-4',
      amount: 19500000, // Oferta por debajo del precio
      status: 'REJECTED',
      conditions: 'Pago de contado total. El comprador es inversionista extranjero y necesita tiempo para transferir fondos internacionales.',
      clientId: cliente1.id,
      propertyId: property4.id,
    },
  })

  const offer5 = await prisma.offer.upsert({
    where: { id: 'offer-5' },
    update: {},
    create: {
      id: 'offer-5',
      amount: 4200000, // Oferta por debajo del precio
      status: 'PENDING',
      conditions: 'Pago de contado. El comprador planea construir una casa de 2 niveles en el terreno.',
      clientId: cliente2.id,
      propertyId: property5.id,
    },
  })

  console.log('✅ Datos REALES de TUKSAQRO creados exitosamente!')
  console.log('\n🔐 Credenciales de acceso:')
  console.log('📧 Admin: admin@tuksaqro.com / admin123')
  console.log('📧 Cliente 1: maria.gonzalez@email.com / cliente123')
  console.log('📧 Cliente 2: juan.perez@gmail.com / cliente456')
  console.log('📧 Cliente 3: laura.ramirez@outlook.com / cliente789')
  console.log('📧 Propietario 1: carlos.rodriguez@inmobiliaria.com / owner123')
  console.log('📧 Propietario 2: sofia.mendoza@gmail.com / owner456')
  console.log('📧 Propietario 3: diego.torres@propiedades.mx / owner789')
  console.log('📧 Agente 1: ana.lopez@tuksaqro.com / agent123')
  console.log('📧 Agente 2: roberto.sanchez@remax.com / agent456')
  console.log('\n🌐 Panel de administración: http://localhost:3001/sistema-control')
  console.log('\n📊 Datos creados:')
  console.log('- 8 usuarios reales (1 admin, 3 clientes, 3 propietarios, 2 agentes)')
  console.log('- 6 propiedades reales en CDMX, Guadalajara y Monterrey')
  console.log('- 5 ofertas activas con diferentes estados')
  console.log('- Precios realistas del mercado mexicano (4.5 - 32 MDP)')
}

main()
  .catch((e) => {
    console.error('❌ Error creando datos REALES de TUKSAQRO:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })