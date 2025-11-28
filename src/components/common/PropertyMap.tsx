"use client"

import { useState } from 'react'
import Map from './Map'

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

interface PropertyMapProps {
  property: Property
  height?: string
  className?: string
}

export default function PropertyMap({ property, height = '400px', className = '' }: PropertyMapProps) {
  const [showMap, setShowMap] = useState(false)

  // Si no hay coordenadas, mostrar un mensaje para obtener ubicación
  if (!property.latitude || !property.longitude) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <div className="mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ubicación no disponible
          </h3>
          <p className="text-gray-600 mb-4">
            Esta propiedad aún no tiene coordenadas GPS configuradas.
          </p>
          <button
            onClick={() => setShowMap(!showMap)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {showMap ? 'Ocultar mapa general' : 'Ver mapa general de la zona'}
          </button>
        </div>

        {showMap && (
          <div className="mt-4">
            <Map
              center={{
                lat: 19.4326, // CDMX como centro por defecto
                lng: -99.1332
              }}
              zoom={10}
              height="300px"
              showMarkers={false}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ubicación de la Propiedad
        </h3>
        <p className="text-gray-600 text-sm">
          {property.address}, {property.city}, {property.state}
        </p>
      </div>

      <Map
        properties={[property]}
        center={{
          lat: property.latitude,
          lng: property.longitude
        }}
        zoom={16}
        height={height}
        selectedProperty={property}
      />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>Lat: {property.latitude.toFixed(6)}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>Lng: {property.longitude.toFixed(6)}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span>Precisión GPS</span>
        </div>
      </div>
    </div>
  )
}