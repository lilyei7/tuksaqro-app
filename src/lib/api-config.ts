/**
 * API Configuration - Detecta automáticamente el puerto y host
 * No necesita configuración manual - funciona en cualquier puerto
 */

export const getApiBaseUrl = (): string => {
  // Si estamos en el navegador (client-side)
  if (typeof window !== "undefined") {
    // Usa el protocolo, host y puerto actual del navegador
    const protocol = window.location.protocol // http: o https:
    const host = window.location.hostname // localhost, 127.0.0.1, etc
    const port = window.location.port // puerto actual (3000, 3001, etc)
    
    // Construye la URL base
    if (port) {
      return `${protocol}//${host}:${port}`
    } else {
      // Si no hay puerto explícito (443 para https, 80 para http)
      return `${protocol}//${host}`
    }
  }
  
  // Si estamos en servidor (server-side)
  // Usa variable de entorno o localhost por defecto
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
}

/**
 * Fetch wrapper que usa automáticamente el URL correcto
 */
export const apiFetch = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
  
  console.debug(`[API] ${options?.method || "GET"} ${url}`)
  
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })
}

/**
 * Helper para detectar si estamos en desarrollo
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === "development"
}

/**
 * Helper para imprimir info de depuración
 */
export const logApiInfo = (): void => {
  if (typeof window !== "undefined") {
    console.log(
      `%c[API Config] Detectado: ${getApiBaseUrl()}`,
      "color: #4f46e5; font-weight: bold"
    )
  }
}
