"use client"

import { Button } from "@/components/ui/button"
import PropertyCard from "@/components/properties/PropertyCard"
import Link from "next/link"

interface FeaturedPropertiesSectionProps {
  properties: any[]
}

// Colores del logo TU KSAQRO
const logoColors = [
  { gradient: "from-blue-500 to-blue-600", text: "text-white", border: "border-blue-400" },           // Azul - TU
  { gradient: "from-yellow-500 to-yellow-600", text: "text-gray-900", border: "border-yellow-400" }, // Amarillo - KSA
  { gradient: "from-orange-500 to-orange-600", text: "text-white", border: "border-orange-400" },     // Naranja - QRO
  { gradient: "from-red-500 to-red-600", text: "text-white", border: "border-red-400" },             // Rojo - REAL ESTATE
]

export default function FeaturedPropertiesSection({ properties }: FeaturedPropertiesSectionProps) {
  if (properties.length === 0) return null

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl bg-gradient-to-r from-blue-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
              Propiedades Destacadas
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Descubre las mejores propiedades disponibles en este momento
            </p>
          </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="transform transition-all duration-300 hover:scale-105 group"
            >
              <div className="relative">
                <PropertyCard property={property} />
                <div className={`absolute top-0 right-0 w-1 h-12 bg-gradient-to-b ${logoColors[index % 4].gradient} rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/propiedades">
            <Button 
              size="lg" 
              className={`px-8 bg-gradient-to-r ${logoColors[0].gradient} text-white hover:shadow-lg transition-all transform hover:scale-105`}
            >
              Ver todas las propiedades
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}