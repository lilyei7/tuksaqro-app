"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

/**
 * Componente que prefetcha rutas críticas
 * Mejora el tiempo de navegación entre páginas
 */
export default function PrefetchProvider() {
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    // Prefetch rutas públicas importantes
    const publicRoutes = [
      '/propiedades',
      '/auth/login',
      '/auth/register',
    ]

    publicRoutes.forEach(route => {
      router.prefetch(route)
    })

    // Si está autenticado, prefetch rutas privadas
    if (session) {
      const privateRoutes = [
        '/perfil',
        '/citas',
        '/mis-propiedades',
        '/dashboard',
        '/documentos',
      ]

      privateRoutes.forEach(route => {
        router.prefetch(route)
      })
    }
  }, [router, session])

  return null
}
