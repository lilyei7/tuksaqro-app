import { Home, Search, Calendar, FileText, Shield, Users, Calculator, ClipboardList, DollarSign, Star, Clock, Rocket, Sparkles, Target, Check, Timer, Facebook, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FeaturedPropertiesSection from "./FeaturedPropertiesSection"
import HeroSection from "./HeroSection"
import PropertiesMapSection from "./PropertiesMapSection"
import InstagramReelModal from "./InstagramReelModal"
import SimuladorInversionModal from "./SimuladorInversionModal"
import Link from "next/link"
import { prisma } from "@/lib/prisma/db"

const features = [
  {
    icon: Search,
    title: "Búsqueda Inteligente",
    description: "Encuentra la propiedad perfecta con nuestros filtros avanzados y búsqueda por ubicación."
  },
  {
    icon: Calendar,
    title: "Agenda Citas",
    description: "Programa visitas a propiedades de manera fácil y rápida con nuestro sistema de citas."
  },
  {
    icon: FileText,
    title: "Documentos Seguros",
    description: "Gestiona todos tus documentos de manera segura con almacenamiento encriptado."
  },
  {
    icon: Users,
    title: "Múltiples Roles",
    description: "Plataforma diseñada para clientes, propietarios, asesores y administradores."
  },
  {
    icon: Shield,
    title: "Seguridad Total",
    description: "Tus datos están protegidos con los más altos estándares de seguridad."
  },
  {
    icon: Home,
    title: "Gestión Completa",
    description: "Desde la búsqueda hasta la firma del contrato, todo en un solo lugar."
  }
]

// Helper function to safely serialize properties
function serializeProperty(prop: any) {
  return {
    id: prop.id,
    title: prop.title,
    price: prop.price,
    currency: prop.currency,
    type: prop.type,
    operation: prop.operation,
    status: prop.status,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    area: prop.area,
    address: prop.address,
    city: prop.city,
    state: prop.state,
    latitude: prop.latitude,
    longitude: prop.longitude,
    description: prop.description,
    createdAt: prop.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: prop.updatedAt?.toISOString() || new Date().toISOString(),
    isActive: prop.isActive,
    features: prop.features ? JSON.parse(prop.features) : [],
    images: prop.images ? JSON.parse(prop.images) : [],
    owner: prop.owner ? {
      id: prop.owner.id,
      name: prop.owner.name,
      email: prop.owner.email,
      phone: prop.owner.phone,
      avatar: prop.owner.avatar,
      role: prop.owner.role,
    } : null,
  }
}

export default async function HomePage() {
  // Fetch featured properties (6 for the grid)
  const featuredProperties = await prisma.property.findMany({
    where: {
      isActive: true,
      status: "AVAILABLE"
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 6,
  })

  // Fetch ALL properties for the map (with coordinates)
  const allProperties = await prisma.property.findMany({
    where: {
      isActive: true,
      status: "AVAILABLE",
      latitude: { not: null },
      longitude: { not: null }
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
  })

  // Serialize properties to ensure client-side compatibility
  const formattedFeaturedProperties = featuredProperties.map(serializeProperty)
  const formattedAllProperties = allProperties.map(serializeProperty)

  return (
    <div className="min-h-screen">
      {/* Instagram Reel Modal - Aparece al cargar la página */}
      <InstagramReelModal />

      {/* Hero Section with Carousel */}
      <HeroSection>
        {/* Contenido vacío - solo mostrar las imágenes del carrusel sin texto */}
      </HeroSection>

      {/* Featured Properties Section - Movido hasta arriba */}
      <FeaturedPropertiesSection properties={formattedFeaturedProperties} />

      {/* Social Media Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Síguenos en Redes Sociales
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Mantente actualizado con las últimas propiedades, consejos y noticias del mercado inmobiliario
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 flex-wrap">
            <a 
              href="https://www.facebook.com/profile.php?id=100069641511304"
              target="_blank"
              rel="noopener noreferrer"
              className="group transform transition-all duration-300 hover:scale-110"
            >
              <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-300 border border-gray-200 hover:border-blue-400">
                <Facebook className="w-6 h-6 text-blue-600 group-hover:text-blue-700" />
                <span className="font-semibold text-gray-900 group-hover:text-blue-600">Facebook</span>
              </div>
            </a>

            <a 
              href="https://www.instagram.com/tu_ksa_qro/"
              target="_blank"
              rel="noopener noreferrer"
              className="group transform transition-all duration-300 hover:scale-110"
            >
              <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-lg shadow-lg hover:shadow-xl hover:bg-pink-50 transition-all duration-300 border border-gray-200 hover:border-pink-400">
                <Instagram className="w-6 h-6 text-pink-600 group-hover:text-pink-700" />
                <span className="font-semibold text-gray-900 group-hover:text-pink-600">Instagram</span>
              </div>
            </a>
          </div>

          <p className="text-center mt-8 text-gray-600 text-sm">
            Comparte tus experiencias con nosotros usando <span className="font-semibold">#TuKSA</span>
          </p>
        </div>
      </section>

      {/* Properties Map Section - Mapa grande con todas las propiedades */}
      <PropertiesMapSection properties={formattedAllProperties} />

      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              ¿Por qué elegir nuestra plataforma?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Ofrecemos una experiencia completa e innovadora para todos los involucrados 
              en el proceso inmobiliario.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={feature.title} className="transform transition-all duration-300 hover:scale-105">
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      
      {/* Testimonials Section - Prueba Social */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Historias de Éxito Reales
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Miles de familias ya encontraron su hogar perfecto con nosotros
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {[
              {
                name: "María González",
                role: "Compradora",
                location: "CDMX",
                image: "data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 150 150' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='75' cy='75' r='75' fill='%23e5e7eb'/%3E%3Ccircle cx='75' cy='60' r='25' fill='%23d1d5db'/%3E%3Cpath d='M45 110 Q75 90 105 110' fill='%23d1d5db'/%3E%3C/svg%3E",
                quote: "Encontré mi departamento ideal en solo 3 días. El asesor me acompañó en todo el proceso y me ahorré $50,000 negociando.",
                rating: 5,
                property: "Departamento en Polanco",
                savings: "$50,000 ahorrados"
              },
              {
                name: "Carlos Rodríguez",
                role: "Propietario",
                location: "Guadalajara",
                image: "data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 150 150' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='75' cy='75' r='75' fill='%23e5e7eb'/%3E%3Ccircle cx='75' cy='60' r='25' fill='%23d1d5db'/%3E%3Cpath d='M45 110 Q75 90 105 110' fill='%23d1d5db'/%3E%3C/svg%3E",
                quote: "Vendí mi casa en una semana a precio premium. La plataforma es increíblemente fácil de usar.",
                rating: 5,
                property: "Casa familiar",
                savings: "Precio 15% superior"
              },
              {
                name: "Ana López",
                role: "Inversionista",
                location: "Monterrey",
                image: "data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 150 150' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='75' cy='75' r='75' fill='%23e5e7eb'/%3E%3Ccircle cx='75' cy='60' r='25' fill='%23d1d5db'/%3E%3Cpath d='M45 110 Q75 90 105 110' fill='%23d1d5db'/%3E%3C/svg%3E",
                quote: "He invertido en 12 propiedades usando esta plataforma. ROI del 8.5% anual. Servicio excepcional.",
                rating: 5,
                property: "Portafolio de inversión",
                savings: "$2.3M en ganancias"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 border-2 border-blue-200"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role} • {testimonial.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-700 mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{testimonial.property}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                        {testimonial.savings}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to action después de testimonios */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">¿Listo para ser el próximo caso de éxito?</p>
            <Link href="/auth/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Comenzar Mi Búsqueda
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition - Principio de Reciprocidad */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Herramientas Gratuitas para tu Compra
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Te ayudamos a tomar la mejor decisión con herramientas profesionales completamente gratis
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 justify-center items-center max-w-4xl mx-auto">
            {[
              {
                icon: Calculator,
                title: "Calculadora Hipotecaria",
                description: "Calcula tu mensualidad, intereses y capacidad de pago en segundos",
                benefits: ["Sin registro requerido", "Resultados instantáneos", "Comparador de bancos"],
                cta: "Calcular Ahora",
                popular: true
              },
              {
                icon: DollarSign,
                title: "Simulador de Inversión",
                description: "Descubre el potencial de retorno de tu inversión inmobiliaria",
                benefits: ["Proyecciones a 10 años", "Análisis de riesgo", "Comparativas de mercado"],
                cta: "Simular Inversión",
                popular: false
              }
            ].map((tool, index) => (
              <Card key={index} className={`relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${tool.popular ? 'ring-2 ring-blue-500 scale-105' : ''} w-full max-w-md`}>
                {tool.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Más Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="text-4xl mb-4 flex justify-center">
                    <tool.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {tool.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  {tool.title === "Simulador de Inversión" ? (
                    <SimuladorInversionModal>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        {tool.cta}
                      </Button>
                    </SimuladorInversionModal>
                  ) : (
                    <Link href="https://socasesores.com/simulador-credito-hipotecario/?q=3HTSR" target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        {tool.cta}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Datos 100% seguros</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Usado por 15,000+ personas</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <span>Actualizado diariamente</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 py-24 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Urgencia final */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 border border-white/30 text-white text-sm font-medium mb-6">
              <Rocket className="w-4 h-4 mr-2" />
              Oferta especial: Primer mes de asesoría GRATIS
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ¿Listo para encontrar tu hogar perfecto?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-green-100">
              Únete hoy a <strong className="text-white">15,000+ familias felices</strong> que ya encontraron 
              su hogar ideal. <span className="text-orange-300 font-semibold">Asesoría gratuita por 30 días</span>.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100 font-semibold px-8 py-4 text-lg shadow-2xl transform hover:scale-105 transition-all duration-200">
                  <Target className="w-5 h-5 mr-2" />
                  Comenzar Ahora - ¡Gratis!
                </Button>
              </Link>
              <Link href="/propiedades">
                <Button size="lg" className="bg-white/10 border-2 border-white text-white hover:bg-white hover:text-green-700 backdrop-blur-sm px-8 py-4 text-lg font-semibold">
                  Ver Propiedades Disponibles
                </Button>
              </Link>
            </div>
            
            {/* Garantía final */}
            <div className="mt-8 text-center">
              <p className="text-green-200 text-sm">
                <Check className="w-4 h-4 inline mr-1" />
                Sin compromiso • 
                <Check className="w-4 h-4 inline mx-1" />
                Cancelación gratuita • 
                <Check className="w-4 h-4 inline mx-1" />
                Soporte 24/7
              </p>
              <p className="text-white/80 text-xs mt-2">
                Miles de familias ya transformaron sus vidas. Tú puedes ser el próximo.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}