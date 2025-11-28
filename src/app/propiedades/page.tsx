import PropertyCard from "@/components/properties/PropertyCard"
import { prisma } from "@/lib/prisma/db"

export default async function PropiedadesPage() {
  // Server-side fetch - usar Prisma directamente
  let properties: any[] = []
  let error: string | null = null

  try {
    properties = await prisma.property.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        type: true,
        operation: true,
        status: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        address: true,
        city: true,
        state: true,
        images: true,
        description: true,
        owner: {
          select: {
            name: true,
            role: true
          }
        }
      },
      take: 12
    })
  } catch (err) {
    error = `Error al cargar propiedades: ${err}`
    console.error("Error fetching properties:", err)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-3">Propiedades Disponibles</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Descubre las mejores propiedades del mercado inmobiliario. Encuentra tu hogar ideal con nosotros.
          </p>
          <div className="mt-6 flex gap-3 text-sm text-blue-100">
            <span className="flex items-center gap-1">📍 Ubicación premium</span>
            <span className="flex items-center gap-1">🏡 Propiedades verificadas</span>
            <span className="flex items-center gap-1">⭐ Precios competitivos</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        {properties.length > 0 ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {properties.length} {properties.length === 1 ? "Propiedad" : "Propiedades"} disponibles
              </h2>
              <p className="text-gray-600">Filtra y busca la propiedad perfecta para ti</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
              {properties.map((property: any) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Sin propiedades disponibles</h3>
              <p className="text-gray-600 mb-6">
                En este momento no hay propiedades disponibles. Por favor, intenta más tarde.
              </p>
              <a
                href="/"
                className="inline-block bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}