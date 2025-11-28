"use client"

import { useState, useEffect, useMemo } from 'react'
import Map from './Map'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Home, DollarSign, Maximize } from "lucide-react"
import Link from "next/link"

interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  latitude?: number
  longitude?: number
  price: number
  currency: string
  type: string
  operation: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  images?: string[]
  status: string
  isActive: boolean
}

interface PropertiesMapSectionProps {
  properties: Property[]
}

export default function PropertiesMapSection({ properties }: PropertiesMapSectionProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: 19.4326, lng: -99.1332 }) // CDMX center

  // Filtrar solo propiedades con coordenadas usando useMemo para evitar re-renders infinitos
  const propertiesWithCoordinates = useMemo(() => {
    return properties.filter(prop =>
      prop.latitude && prop.longitude && prop.isActive && prop.status === 'AVAILABLE'
    )
  }, [properties])

  // Calcular el centro del mapa basado en las propiedades disponibles
  useEffect(() => {
    if (propertiesWithCoordinates.length > 0) {
      const avgLat = propertiesWithCoordinates.reduce((sum, prop) => sum + (prop.latitude || 0), 0) / propertiesWithCoordinates.length
      const avgLng = propertiesWithCoordinates.reduce((sum, prop) => sum + (prop.longitude || 0), 0) / propertiesWithCoordinates.length
      setMapCenter({ lat: avgLat, lng: avgLng })
    }
  }, [propertiesWithCoordinates])

  const handleMarkerClick = (property: Property) => {
    setSelectedProperty(property)
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency === 'MXN' ? 'MXN' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      HOUSE: "Casa",
      APARTMENT: "Departamento",
      CONDO: "Condominio",
      TOWNHOUSE: "Casa en condominio",
      COMMERCIAL: "Local comercial",
      LAND: "Terreno",
      OFFICE: "Oficina"
    }
    return labels[type] || type
  }

  const getOperationLabel = (operation: string) => {
    return operation === 'SALE' ? 'En Venta' : 'En Renta'
  }

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            <MapPin className="w-4 h-4 mr-2" />
            Ubicaciones Exactas
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
            Explora Todas Nuestras Propiedades
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Visualiza todas las propiedades disponibles en un mapa interactivo.
            Haz clic en los marcadores para ver detalles y encuentra la ubicación perfecta para ti.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>{propertiesWithCoordinates.length} propiedades disponibles</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-500" />
              <span>Ubicaciones verificadas</span>
            </div>
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-orange-500" />
              <span>Coordenadas GPS exactas</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-0">
                <div className="relative h-[600px] w-full rounded-lg overflow-hidden">
                  <Map
                    properties={propertiesWithCoordinates}
                    center={mapCenter}
                    zoom={11}
                    height="600px"
                    onMarkerClick={handleMarkerClick}
                    selectedProperty={selectedProperty}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Details Sidebar */}
          <div className="space-y-6">
            {selectedProperty ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">{selectedProperty.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {selectedProperty.address}, {selectedProperty.city}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Property Image */}
                  {selectedProperty.images && selectedProperty.images.length > 0 && (
                    <div className="relative h-48 w-full rounded-lg overflow-hidden">
                      <img
                        src={selectedProperty.images[0]}
                        alt={selectedProperty.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        {getOperationLabel(selectedProperty.operation)}
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(selectedProperty.price, selectedProperty.currency)}
                    </span>
                  </div>

                  {/* Property Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-gray-500" />
                      <span>{getPropertyTypeLabel(selectedProperty.type)}</span>
                    </div>
                    {selectedProperty.bedrooms && (
                      <div className="flex items-center gap-2">
                        <span>🛏️ {selectedProperty.bedrooms} rec</span>
                      </div>
                    )}
                    {selectedProperty.bathrooms && (
                      <div className="flex items-center gap-2">
                        <span>🚿 {selectedProperty.bathrooms} baños</span>
                      </div>
                    )}
                    {selectedProperty.area && (
                      <div className="flex items-center gap-2">
                        <Maximize className="w-4 h-4 text-gray-500" />
                        <span>{selectedProperty.area}m²</span>
                      </div>
                    )}
                  </div>

                  {/* Coordinates */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Coordenadas GPS:</div>
                    <div className="font-mono text-xs">
                      <div>Lat: {selectedProperty.latitude?.toFixed(6)}</div>
                      <div>Lng: {selectedProperty.longitude?.toFixed(6)}</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link href={`/propiedades/${selectedProperty.id}`}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:shadow-lg text-white transition-shadow">
                      Ver Detalles Completos
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-6">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Selecciona una Propiedad
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Haz clic en cualquier marcador del mapa para ver los detalles
                    completos de la propiedad y su ubicación exacta.
                  </p>
                  <div className="mt-4 text-xs text-gray-500">
                    {propertiesWithCoordinates.length} propiedades disponibles
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas del Mapa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Propiedades activas</span>
                  <span className="font-semibold text-blue-600">{propertiesWithCoordinates.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">En venta</span>
                  <span className="font-semibold text-green-600">
                    {propertiesWithCoordinates.filter(p => p.operation === 'SALE').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">En renta</span>
                  <span className="font-semibold text-orange-600">
                    {propertiesWithCoordinates.filter(p => p.operation === 'RENT').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Casas</span>
                  <span className="font-semibold text-purple-600">
                    {propertiesWithCoordinates.filter(p => p.type === 'HOUSE').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            ¿Te gusta alguna propiedad? ¡No esperes más!
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/propiedades">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 via-orange-500 to-red-600 hover:shadow-lg text-white px-8 py-3 transition-shadow font-semibold">
                Ver Todas las Propiedades
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Crear Cuenta Gratuita
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}