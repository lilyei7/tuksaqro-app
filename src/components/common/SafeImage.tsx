"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"

interface SafeImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  objectFit?: "contain" | "cover" | "fill" | "scale-down"
  fallbackSrc?: string
  priority?: boolean
}

export default function SafeImage({
  src,
  alt,
  width = 300,
  height = 300,
  className = "",
  objectFit = "cover",
  fallbackSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23e5e7eb' width='300' height='300'/%3E%3C/svg%3E",
  priority = false,
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [imageError, setImageError] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleError = useCallback(() => {
    setImageError(true)
    setImageSrc(fallbackSrc)
  }, [fallbackSrc])

  // Si es una URL local (base64 o data URL), usar img directo para evitar CORS
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          objectFit: objectFit,
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : 'auto',
        }}
      />
    )
  }

  // Para URLs de internet, usar componente seguro que maneja errores después de hidratación
  return (
    <div
      style={{
        position: 'relative',
        width: width || '100%',
        height: height || 'auto',
        overflow: 'hidden',
      }}
    >
      <Image
        src={isClient ? imageSrc : src}
        alt={alt}
        width={width || 300}
        height={height || 300}
        className={className}
        style={{
          objectFit: objectFit,
        }}
        onError={isClient ? handleError : undefined}
        loading="lazy"
        priority={priority}
      />
    </div>
  )
}
