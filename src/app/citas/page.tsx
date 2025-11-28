"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, Eye, MessageSquare, ChevronLeft } from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"
import { AppointmentMessages } from "@/components/appointments/AppointmentMessages"

interface Appointment {
  id: string
  date: string
  duration: number
  notes?: string
  status: string
  client: {
    id: string
    name: string
    email: string
    phone?: string
  }
  agent?: {
    id: string
    name: string
    email: string
    phone?: string
  }
  property: {
    id: string
    title: string
    address: string
    city: string
    state: string
    images: string[]
    type: string
  }
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500",
  CONFIRMED: "bg-green-500",
  CANCELLED: "bg-red-500",
  COMPLETED: "bg-blue-500",
}

const statusIcons: Record<string, any> = {
  PENDING: AlertCircle,
  CONFIRMED: CheckCircle,
  CANCELLED: XCircle,
  COMPLETED: CheckCircle,
}

export default function CitasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming")
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    if (status === "authenticated") {
      fetchAppointments()
    }
  }, [status, filter])

  const fetchAppointments = async () => {
    try {
      const userId = (session?.user as any)?.id
      const userRole = (session?.user as any)?.role
      
      if (!userId || !userRole) {
        console.error("Usuario no autenticado")
        return
      }
      
      let endpoint = "/api/appointments?"
      if (userRole === "CLIENT") {
        endpoint += `clientId=${userId}`
      } else if (userRole === "AGENT" || userRole === "ADMIN") {
        endpoint += `agentId=${userId}`
      }

      if (filter === "upcoming") {
        endpoint += "&upcoming=true"
      }

      const response = await fetch(endpoint)
      
      if (!response.ok) throw new Error("Error al cargar citas")
      
      const data = await response.json()
      let filteredAppointments = data.appointments

      if (filter === "past") {
        const now = new Date()
        filteredAppointments = filteredAppointments.filter(
          (apt: Appointment) => new Date(apt.date) < now
        )
      }

      setAppointments(filteredAppointments)
    } catch (error) {
      toast.error("Error al cargar las citas")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta cita?")) return

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al cancelar la cita")
      }

      toast.success("Cita cancelada exitosamente")
      fetchAppointments()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cancelar la cita")
    }
  }

  const handleConfirmAppointment = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CONFIRMED" }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al confirmar la cita")
      }

      toast.success("Cita confirmada exitosamente")
      fetchAppointments()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al confirmar la cita")
    }
  }

  const handleCompleteAppointment = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "COMPLETED" }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al completar la cita")
      }

      toast.success("Cita completada exitosamente")
      fetchAppointments()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al completar la cita")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
      </div>
    )
  }

  const userRole = (session?.user as any)?.role
  
  // Si hay una cita seleccionada, mostrar vista detallada
  if (selectedAppointmentId) {
    const selectedAppointment = appointments.find(apt => apt.id === selectedAppointmentId)
    
    if (selectedAppointment) {
      const appointmentDate = new Date(selectedAppointment.date)
      const isPast = appointmentDate < new Date()

      return (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6">
            <div className="container mx-auto px-4 flex items-center gap-4">
              <button
                onClick={() => setSelectedAppointmentId(null)}
                className="hover:bg-green-700 p-2 rounded-lg transition"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Detalles de la Cita</h1>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información de la cita */}
              <div className="lg:col-span-2 space-y-6">
                {/* Propiedad */}
                <Card>
                  <CardHeader>
                    <CardTitle>Propiedad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      {selectedAppointment.property.images?.[0] && (
                        <img
                          src={selectedAppointment.property.images[0]}
                          alt={selectedAppointment.property.title}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">
                          {selectedAppointment.property.title}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {selectedAppointment.property.address}, {selectedAppointment.property.city}
                          </div>
                          <Link href={`/propiedades/${selectedAppointment.property.id}`}>
                            <Button size="sm" variant="outline" className="mt-2">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Propiedad
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detalles de la Cita */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Información de la Cita</CardTitle>
                      <Badge className={`${statusColors[selectedAppointment.status]} text-white`}>
                        {statusLabels[selectedAppointment.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Fecha</p>
                        <p className="font-semibold flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {appointmentDate.toLocaleDateString('es-MX', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Hora</p>
                        <p className="font-semibold flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {appointmentDate.toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} ({selectedAppointment.duration} min)
                        </p>
                      </div>
                    </div>

                    {selectedAppointment.notes && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">{selectedAppointment.notes}</p>
                      </div>
                    )}

                    {/* Contactos */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Cliente</p>
                        <p className="font-semibold">{selectedAppointment.client.name}</p>
                        <p className="text-xs text-gray-600">{selectedAppointment.client.email}</p>
                        {selectedAppointment.client.phone && (
                          <p className="text-xs text-gray-600">{selectedAppointment.client.phone}</p>
                        )}
                      </div>

                      {selectedAppointment.agent && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Agente</p>
                          <p className="font-semibold">{selectedAppointment.agent.name}</p>
                          <p className="text-xs text-gray-600">{selectedAppointment.agent.email}</p>
                          {selectedAppointment.agent.phone && (
                            <p className="text-xs text-gray-600">{selectedAppointment.agent.phone}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 pt-4 border-t flex-wrap">
                      {!isPast && selectedAppointment.status === "PENDING" && userRole === "AGENT" && (
                        <Button
                          onClick={() => handleConfirmAppointment(selectedAppointment.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          ✓ Confirmar
                        </Button>
                      )}

                      {!isPast && selectedAppointment.status !== "CANCELLED" && selectedAppointment.status !== "COMPLETED" && (
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelAppointment(selectedAppointment.id)}
                        >
                          × Cancelar
                        </Button>
                      )}

                      {selectedAppointment.status === "CONFIRMED" && isPast && userRole === "AGENT" && (
                        <Button
                          variant="outline"
                          onClick={() => handleCompleteAppointment(selectedAppointment.id)}
                        >
                          ✓ Marcar Completada
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Panel de Mensajes */}
              <div className="lg:col-span-1">
                <AppointmentMessages
                  appointmentId={selectedAppointment.id}
                  appointmentStatus={selectedAppointment.status}
                />
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  // Vista de lista de citas
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Mis Citas</h1>
          <p className="text-lg opacity-90">
            {userRole === "CLIENT" ? "Gestiona tus visitas a propiedades" : "Administra tus citas con clientes"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upcoming" className="mb-6" onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="upcoming">Próximas</TabsTrigger>
            <TabsTrigger value="past">Pasadas</TabsTrigger>
            <TabsTrigger value="all">Todas</TabsTrigger>
          </TabsList>
        </Tabs>

        {appointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tienes citas</h3>
              <p className="text-gray-600 mb-6">
                {userRole === "CLIENT"
                  ? "Explora propiedades y agenda tu primera visita"
                  : "Las citas aparecerán aquí cuando los clientes las agenden"}
              </p>
              {userRole === "CLIENT" && (
                <Link href="/propiedades">
                  <Button>Ver propiedades</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((appointment) => {
              const StatusIcon = statusIcons[appointment.status]
              const appointmentDate = new Date(appointment.date)
              const isPast = appointmentDate < new Date()

              return (
                <Card key={appointment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    {appointment.property.images?.[0] ? (
                      <img
                        src={appointment.property.images[0]}
                        alt={appointment.property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className={`${statusColors[appointment.status]} text-white`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusLabels[appointment.status]}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {appointment.property.title}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{appointment.property.address}, {appointment.property.city}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{appointmentDate.toLocaleDateString('es-MX', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>{appointmentDate.toLocaleTimeString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} ({appointment.duration} min)</span>
                      </div>
                    </div>

                    {userRole !== "CLIENT" && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium text-gray-700">Cliente:</p>
                        <p className="text-sm text-gray-600">{appointment.client.name}</p>
                        <p className="text-xs text-gray-500">{appointment.client.email}</p>
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedAppointmentId(appointment.id)}
                        className="flex-1 bg-brand-blue hover:bg-brand-blue/90"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>

                      {!isPast && appointment.status === "PENDING" && userRole === "AGENT" && (
                        <Button
                          size="sm"
                          onClick={() => handleConfirmAppointment(appointment.id)}
                          className="flex-1"
                        >
                          Confirmar
                        </Button>
                      )}

                      {!isPast && appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Cancelar
                        </Button>
                      )}

                      {appointment.status === "CONFIRMED" && isPast && userRole === "AGENT" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompleteAppointment(appointment.id)}
                        >
                          Completar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}