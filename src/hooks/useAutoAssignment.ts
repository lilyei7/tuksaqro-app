import { useState } from "react"

interface AssignmentResponse {
  success: boolean
  message: string
  appointmentId?: string
  offerId?: string
  assignedTo?: {
    id: string
    name: string
    email: string
    phone: string
  }
  agentStats?: {
    totalAppointments?: number
    totalOffers?: number
    allAgents: number
  }
}

/**
 * Hook para asignar automáticamente citas y ofertas
 */
export function useAutoAssignment() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const assignAppointment = async (data: {
    propertyId: string
    clientId: string
    preferredDate?: string
    duration?: number
    notes?: string
  }): Promise<AssignmentResponse | null> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/appointments/auto-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error asignando cita")
      }

      const result = await response.json()
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido"
      setError(message)
      console.error("Error en assignAppointment:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const assignOffer = async (data: {
    propertyId: string
    clientId: string
    amount: number
    currency?: string
    conditions?: string
  }): Promise<AssignmentResponse | null> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/offers/auto-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error asignando oferta")
      }

      const result = await response.json()
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido"
      setError(message)
      console.error("Error en assignOffer:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    assignAppointment,
    assignOffer,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}
