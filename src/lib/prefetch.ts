import { ReactNode } from 'react'

/**
 * Hook personalizado para prefetching de rutas
 * Usa router.prefetch para cargar rutas de forma anticipada
 */
export function usePrefetch(router: any) {
  const prefetchRoutes = (routes: string[]) => {
    routes.forEach(route => {
      router.prefetch(route)
    })
  }

  return { prefetchRoutes }
}

/**
 * Rutas prioritarias para prefetch
 * Se cargan cuando el usuario monta la página
 */
export const PRIORITY_ROUTES = [
  '/propiedades',
  '/mis-propiedades',
  '/perfil',
  '/citas',
]

/**
 * Rutas secundarias para prefetch
 * Se cargan después de un pequeño delay
 */
export const SECONDARY_ROUTES = [
  '/dashboard',
  '/documentos',
  '/auth/login',
  '/auth/register',
]
