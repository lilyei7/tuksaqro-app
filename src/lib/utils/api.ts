/**
 * Utilidades para detectar el entorno y construir URLs
 */

export const getBaseUrl = (): string => {
  // En el cliente
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // En el servidor
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // En desarrollo local - usar puerto 3000 (puerto por defecto de Next.js)
  return `http://localhost:3000`
}

export const getApiUrl = (path: string): string => {
  // Asegurar que la ruta comience con /
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  // Siempre usar URL absoluta para asegurar que las cookies se envíen correctamente
  const baseUrl = getBaseUrl()
  return `${baseUrl}${cleanPath}`
}