"use client"

import { useState, useEffect } from "react"
import { Heart, Share2, ChevronLeft, ChevronRight, MapPin, Bed, Bath, Maximize2, FileText, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import SafeImage from "@/components/common/SafeImage"
import { MakeOfferModal } from "@/components/offers/MakeOfferModal"
import { ManageOffersModal } from "@/components/offers/ManageOffersModal"
import Link from "next/link"
import { generatePropertyTechnicalSheet } from "@/lib/pdfGenerator"
import { toast } from "react-hot-toast"

interface PropertyCardProps {
  property: {
    id: string
    title: string
    price: number
    currency: string
    type: string
    operation: string
    status: string
    bedrooms?: number
    bathrooms?: number
    area?: number
    address: string
    city: string
    state: string
    images?: string[]
    description?: string // Agregamos descripción opcional
    owner?: {
      name: string
      role: string
    }
  }
  onFavorite?: (id: string) => void
  onShare?: (id: string) => void
  currentUserRole?: string
  isOwner?: boolean
}

const typeLabels: Record<string, string> = {
  HOUSE: "Casa",
  APARTMENT: "Departamento",
  OFFICE: "Oficina",
  LAND: "Terreno",
  COMMERCIAL: "Local Comercial",
}

const statusLabels: Record<string, string> = {
  AVAILABLE: "Disponible",
  SOLD: "Vendida",
  RENTED: "Rentada",
  PENDING: "Pendiente",
}

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  SOLD: "bg-red-100 text-red-800",
  RENTED: "bg-brand-blue/10 text-brand-blue",
  PENDING: "bg-yellow-100 text-yellow-800",
}

const operationLabels: Record<string, string> = {
  SALE: "Venta",
  RENT: "Renta",
}

const operationColors: Record<string, string> = {
  SALE: "bg-blue-50 text-blue-700 border-2 border-blue-400",
  RENT: "bg-orange-50 text-orange-700 border-2 border-orange-400",
}

// Colores del logo TU KSAQRO - Azul, Amarillo, Naranja, Rojo
const logoColorClasses = [
  { bg: "bg-blue-500", text: "text-white", hover: "hover:bg-blue-600", border: "border-blue-400" },
  { bg: "bg-yellow-500", text: "text-gray-900", hover: "hover:bg-yellow-600", border: "border-yellow-400" },
  { bg: "bg-orange-500", text: "text-white", hover: "hover:bg-orange-600", border: "border-orange-400" },
  { bg: "bg-red-500", text: "text-white", hover: "hover:bg-red-600", border: "border-red-400" },
]

export default function PropertyCard({ property, onFavorite, onShare, currentUserRole, isOwner }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [colorIndex] = useState(() => Math.floor(Math.random() * logoColorClasses.length))
  
  // Ensure images is always an array
  const images = Array.isArray(property.images) ? property.images : []
  const currentColor = logoColorClasses[colorIndex]
  
  // Set isClient to true after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const mainImage = images[currentImageIndex] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3C/svg%3E"
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }
  
  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    onFavorite?.(property.id)
  }
  
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onShare?.(property.id)
  }

  const handleDownloadPDF = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      // Preparar los datos de la propiedad para el PDF (sin información de contacto)
      const propertyData = {
        id: property.id,
        title: property.title,
        description: property.description || property.title, // Usar descripción completa si está disponible
        price: property.price,
        location: `${property.address}, ${property.city}, ${property.state}`,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        area: property.area || 0,
        type: property.type,
        status: property.status,
        createdAt: new Date().toISOString(), // No tenemos fecha de creación, usamos fecha actual
        images: property.images || []
      }

      await generatePropertyTechnicalSheet(propertyData)
      toast.success('Ficha técnica descargada correctamente')
    } catch (error) {
      console.error('Error generando PDF:', error)
      toast.error('Error al generar la ficha técnica')
    }
  }

  const formattedPrice = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: property.currency || "MXN",
    minimumFractionDigits: 0,
  }).format(property.price)

  // If not yet hydrated, render a simplified version without interactive elements
  if (!isClient) {
    return (
      <div 
        className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col"
        suppressHydrationWarning
      >
        {/* Imagen Container - Clickable */}
        <Link href={`/propiedades/${property.id}`}>
          <div className="relative w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden cursor-pointer">
            <SafeImage
              src={images[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3C/svg%3E"}
              alt={property.title}
              width={400}
              height={300}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Badge de estado */}
            <div className="absolute top-3 right-3">
              <Badge className={`${statusColors[property.status as keyof typeof statusColors]} text-xs font-semibold`}>
                {statusLabels[property.status as keyof typeof statusLabels] || property.status}
              </Badge>
            </div>
            
            {/* Badge de tipo */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-[#4A90E2] text-white text-xs font-semibold shadow-lg">
                {typeLabels[property.type as keyof typeof typeLabels] || property.type}
              </Badge>
            </div>
            
            {/* Placeholder for image controls - same structure as full version */}
            {images.length > 1 && (
              <>
                {/* Hidden controls during hydration */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0">
                  <div className="bg-white/80 text-gray-800 rounded-full p-2">
                    <ChevronLeft size={20} />
                  </div>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0">
                  <div className="bg-white/80 text-gray-800 rounded-full p-2">
                    <ChevronRight size={20} />
                  </div>
                </div>
                
                {/* Placeholder for image indicators */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 opacity-0">
                  {images.map((_, index) => (
                    <div
                      key={`dot-${index}`}
                      className="h-2 rounded-full bg-white/50 w-2"
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Placeholder for action buttons - hidden during hydration */}
            <div className="absolute top-3 right-12 flex gap-2 opacity-0">
              <div className="bg-white/90 text-gray-800 rounded-full p-2">
                <Heart size={20} />
              </div>
              <div className="bg-white/90 text-gray-800 rounded-full p-2">
                <Share2 size={20} />
              </div>
            </div>
          </div>
        </Link>

        {/* Contenido - Clickable */}
        <Link href={`/propiedades/${property.id}`}>
          <div className="p-5 flex flex-col flex-grow cursor-pointer">
            {/* Precio */}
            <div className="mb-3">
              <p className="text-2xl font-bold text-gray-900">{formattedPrice}</p>
              <p className="text-xs text-gray-500">{property.currency}</p>
            </div>

            {/* Título */}
            <h3 
              className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors"
              suppressHydrationWarning
            >
              {property.title}
            </h3>

            {/* Ubicación */}
            <div className="flex items-start gap-2 mb-4 text-sm text-gray-600">
              <MapPin size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
              <span className="line-clamp-2">
                {property.address}, {property.city}, {property.state}
              </span>
            </div>

            {/* Características */}
            <div className="flex gap-4 mb-4 text-sm text-gray-700 flex-wrap">
              {property.bedrooms !== undefined && (
                <div className="flex items-center gap-1">
                  <Bed size={16} className="text-brand-blue" />
                  <span>{property.bedrooms} recám{property.bedrooms === 1 ? "ara" : "aras"}</span>
                </div>
              )}
              {property.bathrooms !== undefined && (
                <div className="flex items-center gap-1">
                  <Bath size={16} className="text-green-600" />
                  <span>{property.bathrooms} baño{property.bathrooms === 1 ? "" : "s"}</span>
                </div>
              )}
              {property.area !== undefined && (
                <div className="flex items-center gap-1">
                  <Maximize2 size={16} className="text-purple-600" />
                  <span>{property.area} m²</span>
                </div>
              )}
            </div>

            {/* Separador */}
            <div className="h-px bg-gray-200 my-3"></div>
          </div>
        </Link>

        {/* Botones de acción - No clickable */}
        <div className="px-5 pb-5">
          {/* Botón de oferta */}
          <div className="mb-3 space-y-2">
            <MakeOfferModal
              property={property}
              onOfferCreated={() => {
                // Opcional: callback cuando se crea una oferta
              }}
            />

            {/* Botón para gestionar ofertas (solo para propietarios/agentes) */}
            {(currentUserRole === "OWNER" || currentUserRole === "AGENT") && isOwner && (
              <ManageOffersModal
                propertyId={property.id}
                trigger={
                  <Button
                    className={`w-full ${logoColorClasses[2].bg} ${logoColorClasses[2].text} ${logoColorClasses[2].hover} transition-all`}
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Gestionar Ofertas
                  </Button>
                }
              />
            )}
          </div>

          {/* Propietario */}
          {property.owner && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Por: <span className="font-semibold text-gray-700">{property.owner.name}</span></span>
              <Badge variant="outline" className="text-xs">
                {property.owner.role}
              </Badge>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div 
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col"
      suppressHydrationWarning
    >
      {/* Imagen Container - Clickable */}
      <Link href={`/propiedades/${property.id}`}>
        <div className="relative w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden cursor-pointer">
          <SafeImage
            src={mainImage}
            alt={property.title}
            width={400}
            height={300}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Badge de estado */}
          <div className="absolute top-3 right-3">
            <Badge className={`${statusColors[property.status as keyof typeof statusColors]} text-xs font-semibold`}>
              {statusLabels[property.status as keyof typeof statusLabels] || property.status}
            </Badge>
          </div>
          
          {/* Badge de tipo */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-brand-blue text-white text-xs font-semibold">
              {typeLabels[property.type as keyof typeof typeLabels] || property.type}
            </Badge>
          </div>
          
          {/* Badge de operación */}
          <div className="absolute top-12 left-3">
            <Badge className={`${operationColors[property.operation as keyof typeof operationColors]} text-xs font-semibold`}>
              {operationLabels[property.operation as keyof typeof operationLabels] || property.operation}
            </Badge>
          </div>
          
          {/* Controles de imágenes */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              >
                <ChevronRight size={20} />
              </button>
              
              {/* Indicador de imágenes */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                  {images.map((_, index) => (
                    <div
                      key={`dot-${index}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex ? "bg-white w-6" : "bg-white/50 w-2"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Botones de acción */}
          <div className="absolute top-3 right-12 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleFavorite}
              className="bg-white/90 hover:bg-red-500 hover:text-white text-gray-800 rounded-full p-2 transition-all duration-300"
            >
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleShare}
              className="bg-white/90 hover:bg-brand-blue hover:text-white text-gray-800 rounded-full p-2 transition-all duration-300"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </Link>

      {/* Contenido - Clickable */}
      <Link href={`/propiedades/${property.id}`}>
        <div className="p-5 flex flex-col flex-grow cursor-pointer">
          {/* Precio */}
          <div className="mb-3">
            <p className="text-2xl font-bold text-gray-900">{formattedPrice}</p>
            <p className="text-xs text-gray-500">{property.currency}</p>
          </div>

          {/* Título */}
          <h3 
            className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors"
            suppressHydrationWarning
          >
            {property.title}
          </h3>

          {/* Ubicación */}
          <div className="flex items-start gap-2 mb-4 text-sm text-gray-600">
            <MapPin size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
            <span className="line-clamp-2">
              {property.address}, {property.city}, {property.state}
            </span>
          </div>

          {/* Características */}
          <div className="flex gap-4 mb-4 text-sm text-gray-700 flex-wrap">
            {property.bedrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bed size={16} className="text-brand-blue" />
                <span>{property.bedrooms} recám{property.bedrooms === 1 ? "ara" : "aras"}</span>
              </div>
            )}
            {property.bathrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bath size={16} className="text-green-600" />
                <span>{property.bathrooms} baño{property.bathrooms === 1 ? "" : "s"}</span>
              </div>
            )}
            {property.area !== undefined && (
              <div className="flex items-center gap-1">
                <Maximize2 size={16} className="text-purple-600" />
                <span>{property.area} m²</span>
              </div>
            )}
          </div>

          {/* Separador */}
          <div className="h-px bg-gray-200 my-3"></div>
        </div>
      </Link>

      {/* Botones de acción - No clickable */}
      <div className="px-5 pb-5">
        {/* Botón de oferta */}
        <div className="mb-3 space-y-2">
          <MakeOfferModal
            property={property}
            onOfferCreated={() => {
              // Opcional: callback cuando se crea una oferta
            }}
          />

          {/* Botón para gestionar ofertas (solo para propietarios/agentes) */}
          {(currentUserRole === "OWNER" || currentUserRole === "AGENT") && isOwner && (
            <ManageOffersModal
              propertyId={property.id}
              trigger={
                <Button
                  className={`w-full ${logoColorClasses[2].bg} ${logoColorClasses[2].text} ${logoColorClasses[2].hover} transition-all`}
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Gestionar Ofertas
                </Button>
              }
            />
          )}

          {/* Botón de descarga de ficha técnica PDF */}
          <Button
            className={`w-full ${currentColor.bg} ${currentColor.text} ${currentColor.hover} transition-all`}
            size="sm"
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Ficha Técnica
          </Button>
        </div>

        {/* Propietario */}
        <div className="flex items-center justify-between text-xs text-gray-500" suppressHydrationWarning>
          <span>Por: <span className="font-semibold text-gray-700">
            {property.owner?.name || 'Usuario desconocido'}
          </span></span>
          <Badge variant="outline" className="text-xs">
            {property.owner?.role || 'N/A'}
          </Badge>
        </div>
      </div>
    </div>
  )
}