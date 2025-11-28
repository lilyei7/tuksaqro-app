"use client"

import { useState, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Home, Building, MapPin, DollarSign, Filter } from 'lucide-react'

const LIBRARIES: ("places")[] = ['places']

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

interface MapProps {
  properties?: Property[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  showMarkers?: boolean
  onMarkerClick?: (property: Property) => void
  selectedProperty?: Property | null
  className?: string
  showFilters?: boolean
}

// Colores para diferentes tipos de operaciones
const operationColors: Record<string, string> = {
  SALE: '#3B82F6', // Azul para venta
  RENT: '#F97316', // Naranja para renta
}

// Colores del logo TU KSAQRO para elementos de UI
const logoColors = [
  { bg: "bg-blue-600", hover: "hover:bg-blue-700", gradient: "from-blue-600 to-blue-700" },           // TU
  { bg: "bg-yellow-500", hover: "hover:bg-yellow-600", gradient: "from-yellow-500 to-yellow-600" },   // KSA
  { bg: "bg-orange-500", hover: "hover:bg-orange-600", gradient: "from-orange-500 to-orange-600" },   // QRO
  { bg: "bg-red-600", hover: "hover:bg-red-700", gradient: "from-red-600 to-red-700" },               // REAL ESTATE
]

// Colores para diferentes tipos de propiedades
const typeColors: Record<string, string> = {
  HOUSE: '#10B981', // Verde para casas
  APARTMENT: '#8B5CF6', // Violeta para apartamentos
  LAND: '#F59E0B', // Amarillo para terrenos
  COMMERCIAL: '#EF4444', // Rojo para comerciales
  OFFICE: '#6366F1', // Indigo para oficinas
}

// Función para obtener el color del marcador
const getMarkerColor = (property: Property, selected: boolean = false): string => {
  if (selected) return '#10B981' // Verde para seleccionado

  // Priorizar color por operación, luego por tipo
  if (property.operation && operationColors[property.operation]) {
    return operationColors[property.operation]
  }

  if (property.type && typeColors[property.type]) {
    return typeColors[property.type]
  }

  return '#6B7280' // Gris por defecto
}

// Función para crear el SVG del marcador
const createMarkerIcon = (color: string, selected: boolean = false) => {
  const size = selected ? 48 : 40
  const strokeWidth = selected ? 4 : 3

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="white" stroke-width="${strokeWidth}"/>
      <path d="${size/2} ${size/4} ${size * 0.8} ${size * 0.7} ${size/2} ${size * 0.9} ${size * 0.2} ${size * 0.7} Z" fill="white"/>
    </svg>
  `)}`
}

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

interface MapProps {
  properties?: Property[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  showMarkers?: boolean
  onMarkerClick?: (property: Property) => void
  selectedProperty?: Property | null
  className?: string
  showFilters?: boolean
}

const defaultCenter = {
  lat: 19.4326, // CDMX coordinates
  lng: -99.1332
}

const containerStyle = {
  width: '100%',
  height: '100%'
}

export default function Map({
  properties = [],
  center = defaultCenter,
  zoom = 12,
  height = '600px',
  showMarkers = true,
  onMarkerClick,
  selectedProperty,
  className = '',
  showFilters = true
}: MapProps) {
  const [selectedMarker, setSelectedMarker] = useState<Property | null>(null)
  const [filters, setFilters] = useState({
    SALE: true,
    RENT: true,
    HOUSE: true,
    APARTMENT: true,
    LAND: true,
    COMMERCIAL: true,
    OFFICE: true
  })
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    // Map loaded successfully
  }, [])

  const onUnmount = useCallback(() => {
    // Map unmounted
  }, [])

  const handleMarkerClick = (property: Property) => {
    setSelectedMarker(property)
    if (onMarkerClick) {
      onMarkerClick(property)
    }
  }

  const handleInfoWindowClose = () => {
    setSelectedMarker(null)
  }

  // Función para filtrar propiedades
  const filteredProperties = properties.filter(property => {
    const operationFilter = filters[property.operation as keyof typeof filters]
    const typeFilter = filters[property.type as keyof typeof filters]
    return operationFilter && typeFilter
  })

  // Función para alternar filtros
  const toggleFilter = (filterKey: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey as keyof typeof prev]
    }))
  }

  // Función para seleccionar todos los filtros de un tipo
  const selectAllOperationFilters = () => {
    setFilters(prev => ({
      ...prev,
      SALE: true,
      RENT: true
    }))
  }

  const selectAllTypeFilters = () => {
    setFilters(prev => ({
      ...prev,
      HOUSE: true,
      APARTMENT: true,
      LAND: true,
      COMMERCIAL: true,
      OFFICE: true
    }))
  }

  // Función para obtener estadísticas de propiedades filtradas
  const getFilteredStats = () => {
    const saleCount = filteredProperties.filter(p => p.operation === 'SALE').length
    const rentCount = filteredProperties.filter(p => p.operation === 'RENT').length
    return { saleCount, rentCount, totalCount: filteredProperties.length }
  }

  const stats = getFilteredStats()

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="text-red-500 mb-2">Error al cargar el mapa</div>
          <div className="text-sm text-gray-600">Verifica tu conexión a internet</div>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div  
      className={`${className} bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl border border-blue-200 w-full`} 
      style={{ height }}
    >
      {/* Header Principal del Mapa */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mapa Interactivo de Propiedades</h2>
              <p className="text-sm text-gray-600">Explora propiedades disponibles en tiempo real</p>
            </div>
          </div>

          {/* Estadísticas Destacadas */}
          <div className="flex items-center space-x-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white/50">
            <div className="text-center">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">VENTA</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.saleCount}</div>
            </div>

            <div className="w-px h-8 bg-gray-300"></div>

            <div className="text-center">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">RENTA</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats.rentCount}</div>
            </div>

            <div className="w-px h-8 bg-gray-300"></div>

            <div className="text-center">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">TOTAL</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{stats.totalCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Principal */}
      {showFilters && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-white/50 mx-4 mb-3 max-h-[180px] overflow-y-auto relative z-20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h3>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                  {Object.values(filters).filter(Boolean).length} activos
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllOperationFilters}
                  className="text-xs border-blue-200 hover:bg-blue-50 text-blue-600 font-medium"
                >
                  Todos Venta/Renta
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllTypeFilters}
                  className="text-xs border-orange-200 hover:bg-orange-50 text-orange-600 font-medium"
                >
                  Todos Tipos
                </Button>
                <Button
                  variant={showFilterPanel ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`flex items-center space-x-2 transition-all duration-200 ${
                    showFilterPanel
                      ? 'bg-gradient-to-r from-blue-600 to-orange-500 hover:shadow-lg text-white shadow-md'
                      : 'border-blue-200 hover:bg-blue-50 text-blue-600'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>{showFilterPanel ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
                </Button>
              </div>
            </div>

            {/* Panel de Filtros Expandible */}
            {showFilterPanel && (
              <div className="border-t border-gray-200 pt-4 mt-4 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Filtros por Operación */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Tipo de Operación</h4>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-md">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={filters.SALE}
                            onChange={() => toggleFilter('SALE')}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm"></div>
                          <span className="font-medium text-gray-900">Venta</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {filteredProperties.filter(p => p.operation === 'SALE').length}
                        </Badge>
                      </label>

                      <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200 hover:border-orange-300 cursor-pointer transition-all duration-200 hover:shadow-md">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={filters.RENT}
                            onChange={() => toggleFilter('RENT')}
                            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                          />
                          <div className="w-4 h-4 bg-orange-500 rounded-full shadow-sm"></div>
                          <span className="font-medium text-gray-900">Renta</span>
                        </div>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {filteredProperties.filter(p => p.operation === 'RENT').length}
                        </Badge>
                      </label>
                    </div>
                  </div>

                  {/* Filtros por Tipo de Propiedad */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Building className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Tipo de Propiedad</h4>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { key: 'HOUSE', label: 'Casas', color: 'bg-green-500', icon: Home, count: filteredProperties.filter(p => p.type === 'HOUSE').length },
                        { key: 'APARTMENT', label: 'Apartamentos', color: 'bg-purple-500', icon: Building, count: filteredProperties.filter(p => p.type === 'APARTMENT').length },
                        { key: 'LAND', label: 'Terrenos', color: 'bg-yellow-500', icon: MapPin, count: filteredProperties.filter(p => p.type === 'LAND').length },
                        { key: 'COMMERCIAL', label: 'Comerciales', color: 'bg-red-500', icon: DollarSign, count: filteredProperties.filter(p => p.type === 'COMMERCIAL').length },
                        { key: 'OFFICE', label: 'Oficinas', color: 'bg-indigo-500', icon: Building, count: filteredProperties.filter(p => p.type === 'OFFICE').length }
                      ].map(({ key, label, color, icon: Icon, count }) => (
                        <label key={key} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-all duration-200 hover:shadow-md">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={filters[key as keyof typeof filters]}
                              onChange={() => toggleFilter(key)}
                              className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
                            />
                            <div className={`w-4 h-4 ${color} rounded-full shadow-sm`}></div>
                            <Icon className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-900">{label}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {count}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center space-x-2 text-sm text-indigo-700">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>
                      <strong>💡 Tip:</strong> Los pines del mapa cambian de color según el tipo de operación y propiedad.
                      Haz clic en cualquier pin para ver detalles completos de la propiedad.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      {/* Contenedor del Mapa - PRINCIPAL */}
      <div className="px-4 pb-4" style={{ height: `calc(100% - ${showFilters && showFilterPanel ? '380px' : showFilters ? '180px' : '100px'})` }}>
        <div className="h-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              zoomControl: true,
              streetViewControl: true,
              mapTypeControl: true,
              fullscreenControl: true,
              gestureHandling: 'cooperative',
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            }}
          >
            {showMarkers && filteredProperties.map((property) => {
              // Solo mostrar marcadores si tienen coordenadas
              if (!property.latitude || !property.longitude) return null

              const isSelected = selectedMarker?.id === property.id || selectedProperty?.id === property.id
              const markerColor = getMarkerColor(property, isSelected)

              return (
                <Marker
                  key={property.id}
                  position={{
                    lat: property.latitude,
                    lng: property.longitude
                  }}
                  onClick={() => handleMarkerClick(property)}
                  icon={{
                    url: createMarkerIcon(markerColor, isSelected),
                    scaledSize: new google.maps.Size(isSelected ? 56 : 44, isSelected ? 56 : 44),
                    anchor: new google.maps.Point(isSelected ? 28 : 22, isSelected ? 56 : 44)
                  }}
                />
              )
            })}

            {(selectedMarker || selectedProperty) && (
              <InfoWindow
                position={{
                  lat: (selectedMarker || selectedProperty)!.latitude!,
                  lng: (selectedMarker || selectedProperty)!.longitude!
                }}
                onCloseClick={handleInfoWindowClose}
              >
                <div className="p-4 max-w-sm bg-white rounded-lg shadow-xl border border-gray-200 relative z-50">
                  {/* Header con imagen si existe */}
                  {((selectedMarker || selectedProperty)!.images?.length || 0) > 0 && (
                    <div className="mb-3 -m-4">
                      <img
                        src={(selectedMarker || selectedProperty)!.images![0]}
                        alt={(selectedMarker || selectedProperty)!.title}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Título y badges */}
                    <div>
                      <h3 className="font-bold text-gray-900 text-base mb-2 leading-tight">
                        {(selectedMarker || selectedProperty)!.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge
                          className={`text-xs font-medium ${
                            (selectedMarker || selectedProperty)!.operation === 'SALE'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-orange-100 text-orange-800 border-orange-200'
                          }`}
                        >
                          {(selectedMarker || selectedProperty)!.operation === 'SALE' ? '🏠 Venta' : '🏢 Renta'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {(() => {
                            const type = (selectedMarker || selectedProperty)!.type
                            const typeLabels: Record<string, string> = {
                              HOUSE: 'Casa',
                              APARTMENT: 'Apartamento',
                              LAND: 'Terreno',
                              COMMERCIAL: 'Comercial',
                              OFFICE: 'Oficina'
                            }
                            return typeLabels[type] || type
                          })()}
                        </Badge>
                      </div>
                    </div>

                    {/* Dirección */}
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 leading-tight">
                        {(selectedMarker || selectedProperty)!.address}, {(selectedMarker || selectedProperty)!.city}
                      </p>
                    </div>

                    {/* Precio y características */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xl font-bold text-blue-600">
                          ${(selectedMarker || selectedProperty)!.price.toLocaleString()} {(selectedMarker || selectedProperty)!.currency}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          {(selectedMarker || selectedProperty)!.bedrooms && (
                            <div className="flex items-center space-x-1">
                              <span className="text-lg">🛏️</span>
                              <span>{(selectedMarker || selectedProperty)!.bedrooms} hab</span>
                            </div>
                          )}
                          {(selectedMarker || selectedProperty)!.bathrooms && (
                            <div className="flex items-center space-x-1">
                              <span className="text-lg">🚿</span>
                              <span>{(selectedMarker || selectedProperty)!.bathrooms} baños</span>
                            </div>
                          )}
                        </div>
                        {(selectedMarker || selectedProperty)!.area && (
                          <div className="flex items-center space-x-1">
                            <span className="text-lg">📐</span>
                            <span>{(selectedMarker || selectedProperty)!.area} m²</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex space-x-2 pt-2 border-t border-gray-200">
                      <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500 hover:shadow-lg text-white text-xs">
                        Ver Detalles
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs border-gray-300 hover:bg-red-50 text-red-600">
                        📄 Compartir PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  )
}