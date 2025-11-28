"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// Colores del logo TU KSAQRO
const logoColors = [
  { bg: "bg-blue-600", hover: "hover:bg-blue-700", gradient: "from-blue-600 to-blue-700" },           // TU
  { bg: "bg-yellow-500", hover: "hover:bg-yellow-600", gradient: "from-yellow-500 to-yellow-600" },   // KSA
  { bg: "bg-orange-500", hover: "hover:bg-orange-600", gradient: "from-orange-500 to-orange-600" },   // QRO
  { bg: "bg-red-600", hover: "hover:bg-red-700", gradient: "from-red-600 to-red-700" },               // REAL ESTATE
]

interface HeroImage {
  id: string
  title?: string
  description?: string
  imageUrl: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Nuevos campos para overlay de texto
  overlayTitle?: string
  overlaySubtitle?: string
  overlayTitleColor?: string
  overlaySubtitleColor?: string
  overlayPosition?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  overlayBackgroundColor?: string
  overlayBackgroundOpacity?: number
}

interface HeroCarouselProps {
  images: HeroImage[]
}

export default function HeroCarousel({ images }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (images.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000) // Cambiar cada 5 segundos

    return () => clearInterval(interval)
  }, [images.length])

  if (images.length === 0) {
    return (
      <div className="relative h-96 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Bienvenido a Inmobiliaria Tuksaqro</h2>
          <p className="text-xl mb-6">Tu hogar ideal te está esperando</p>
          <p className="text-lg opacity-90">Las imágenes del hero se mostrarán aquí una vez que las actives en el panel de administración.</p>
        </div>
      </div>
    )
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="relative h-96 overflow-hidden">
      {/* Imágenes del carrusel */}
      {images.map((image, index) => (
        <div
          key={image.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image.imageUrl}
            alt={image.title || "Imagen del hero"}
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* Overlay de fondo personalizado */}
          {image.overlayBackgroundColor && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: image.overlayBackgroundColor,
                opacity: image.overlayBackgroundOpacity || 0.5
              }}
            />
          )}

          {/* Contenido de texto con overlay personalizado */}
          {(image.overlayTitle || image.overlaySubtitle) && (
            <div className={`absolute inset-0 flex ${
              image.overlayPosition?.includes('top') ? 'items-start pt-16' :
              image.overlayPosition?.includes('bottom') ? 'items-end pb-16' :
              'items-center'
            } ${
              image.overlayPosition?.includes('left') ? 'justify-start pl-16' :
              image.overlayPosition?.includes('right') ? 'justify-end pr-16' :
              'justify-center'
            }`}>
              <div className="text-center max-w-4xl px-4">
                {image.overlayTitle && (
                  <h2
                    className="text-4xl md:text-6xl font-bold mb-4 text-shadow-lg"
                    style={{ color: image.overlayTitleColor || '#ffffff' }}
                  >
                    {image.overlayTitle}
                  </h2>
                )}
                {image.overlaySubtitle && (
                  <p
                    className="text-xl md:text-2xl text-shadow"
                    style={{ color: image.overlaySubtitleColor || '#ffffff' }}
                  >
                    {image.overlaySubtitle}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Fallback: Contenido de texto original si no hay overlay personalizado */}
          {(!image.overlayTitle && !image.overlaySubtitle) && (image.title || image.description) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl px-4">
                {image.title && (
                  <h2 className="text-4xl md:text-6xl font-bold mb-4 text-shadow">
                    {image.title}
                  </h2>
                )}
                {image.description && (
                  <p className="text-xl md:text-2xl text-shadow">
                    {image.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Controles de navegación */}
      {images.length > 1 && (
        <>
          {/* Botones de navegación */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${logoColors[currentIndex % 4].bg} hover:shadow-lg text-white border-none transition-all`}
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${logoColors[currentIndex % 4].bg} hover:shadow-lg text-white border-none transition-all`}
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Indicadores */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}