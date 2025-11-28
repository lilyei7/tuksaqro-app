"use client"

import { useState, useEffect } from "react"
import HeroCarousel from "./HeroCarousel"

interface HeroSectionProps {
  children?: React.ReactNode
}

export default function HeroSection({ children }: HeroSectionProps) {
  const [heroImages, setHeroImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        // Agregar timestamp para evitar cache
        const response = await fetch(`/api/hero-images?t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        if (response.ok) {
          const data = await response.json()
          setHeroImages(data.heroImages || [])
        } else {
          console.error('Error fetching hero images:', response.status)
        }
      } catch (error) {
        console.error('Error fetching hero images:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeroImages()
  }, [])

  if (isLoading) {
    return (
      <section className="relative overflow-hidden text-white">
        <div className="relative h-96 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Cargando...</p>
          </div>
        </div>

        {/* Elementos decorativos para mayor impacto visual */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Decorative elements */}
        <div className="absolute -top-24 right-0 -z-10">
          <div className="h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
        </div>
        <div className="absolute -bottom-32 left-0 -z-10">
          <div className="h-72 w-72 rounded-full bg-green-400/20 blur-3xl" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
            {children}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden text-white">
      <HeroCarousel images={heroImages} />

      {/* Elementos decorativos para mayor impacto visual */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Decorative elements */}
      <div className="absolute -top-24 right-0 -z-10">
        <div className="h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
      </div>
      <div className="absolute -bottom-32 left-0 -z-10">
        <div className="h-72 w-72 rounded-full bg-green-400/20 blur-3xl" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          {children}
        </div>
      </div>
    </section>
  )
}