"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar.css'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CalendarIcon,
  Clock,
  MapPin,
  User,
  Building,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Settings,
  AlertCircle
} from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"

const locales = {
  'es': es,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface Appointment {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
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
}

interface AvailabilityEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    type: string
    status: string
  }
}

type CalendarEvent = Appointment | AvailabilityEvent

const statusColors = {
  PENDING: '#f59e0b', // amber
  CONFIRMED: '#10b981', // emerald
  CANCELLED: '#ef4444', // red
  COMPLETED: '#6b7280', // gray
}

const statusLabels = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
}

export default function AgentCalendarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [view, setView] = useState<any>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [availability, setAvailability] = useState({
    monday: { start: '09:00', end: '18:00', available: true },
    tuesday: { start: '09:00', end: '18:00', available: true },
    wednesday: { start: '09:00', end: '18:00', available: true },
    thursday: { start: '09:00', end: '18:00', available: true },
    friday: { start: '09:00', end: '18:00', available: true },
    saturday: { start: '09:00', end: '14:00', available: false },
    sunday: { start: '09:00', end: '14:00', available: false },
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session || (session.user as any)?.role !== "AGENT") {
      router.push("/auth/login")
      return
    }

    fetchAppointments()
  }, [session, status])

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/appointments?agentId=' + (session?.user as any)?.id)
      if (response.ok) {
        const data = await response.json()
        const formattedAppointments = data.appointments.map((apt: any) => ({
          id: apt.id,
          title: `${apt.client.name} - ${apt.property.title}`,
          start: new Date(apt.date),
          end: new Date(new Date(apt.date).getTime() + (apt.duration * 60000)),
          resource: apt
        }))
        setAppointments(formattedAppointments)
      } else {
        toast.error('Error al cargar citas')
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Error al cargar citas')
    } finally {
      setIsLoading(false)
    }
  }

  const eventStyleGetter = (event: Appointment) => {
    const backgroundColor = statusColors[event.resource.status as keyof typeof statusColors] || '#6b7280'

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        padding: '2px 6px'
      }
    }
  }

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    if ('type' in event.resource && event.resource.type === 'availability') {
      return (
        <div className="text-xs font-medium text-green-700">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Disponible
          </div>
        </div>
      )
    }

    const appointment = event as Appointment
    return (
      <div className="text-xs font-medium truncate">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {format(appointment.start, 'HH:mm')}
        </div>
        <div className="truncate">{appointment.resource.client.name}</div>
        <div className="truncate text-xs opacity-80">{appointment.resource.property.title}</div>
      </div>
    )
  }

  const handleSelectEvent = (event: CalendarEvent) => {
    if ('type' in event.resource && event.resource.type === 'availability') {
      // No mostrar modal para eventos de disponibilidad
      return
    }
    setSelectedAppointment(event as Appointment)
  }

  const handleNavigate = (date: Date) => {
    setCurrentDate(date)
  }

  const handleViewChange = (newView: any) => {
    if (['month', 'week', 'day'].includes(newView)) {
      setView(newView)
    }
  }

  const CustomToolbar = ({ label, onNavigate }: any) => (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('PREV')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <h2 className="text-xl font-semibold text-gray-900">{label}</h2>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('NEXT')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('TODAY')}
        >
          Hoy
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('month')}
          >
            Mes
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('week')}
          >
            Semana
          </Button>
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('day')}
          >
            Día
          </Button>
        </div>
      </div>
    </div>
  )

  const getAvailabilityBlocks = () => {
    const blocks = []
    const today = new Date()

    // Solo mostrar disponibilidad para los próximos 30 días
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      const dayName = format(date, 'EEEE').toLowerCase()
      const dayAvailability = availability[dayName as keyof typeof availability]

      if (dayAvailability.available) {
        const [startHour, startMinute] = dayAvailability.start.split(':').map(Number)
        const [endHour, endMinute] = dayAvailability.end.split(':').map(Number)

        const startDateTime = new Date(date)
        startDateTime.setHours(startHour, startMinute, 0, 0)

        const endDateTime = new Date(date)
        endDateTime.setHours(endHour, endMinute, 0, 0)

        blocks.push({
          id: `availability-${i}`,
          title: 'Disponible',
          start: startDateTime,
          end: endDateTime,
          resource: {
            type: 'availability',
            status: 'AVAILABLE'
          }
        })
      }
    }

    return blocks
  }

  const allEvents = [...appointments, ...getAvailabilityBlocks()]

  const availabilityStyleGetter = (event: any) => {
    if (event.resource.type === 'availability') {
      return {
        style: {
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '2px dashed #22c55e',
          borderRadius: '4px',
          opacity: 0.7,
          color: '#16a34a',
          display: 'block',
          fontSize: '11px',
          padding: '2px 6px'
        }
      }
    }

    return eventStyleGetter(event)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    )
  }

  if (!session || (session.user as any)?.role !== "AGENT") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Calendario de Citas</h1>
            <p className="text-gray-600 mt-1">
              Gestiona tus citas y disponibilidad como asesor
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/disponibilidad')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurar Disponibilidad
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Información de disponibilidad */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-green-500" />
              Tu Disponibilidad Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(availability).map(([day, config]) => (
                <div key={day} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 capitalize">
                    {day === 'monday' ? 'Lunes' :
                     day === 'tuesday' ? 'Martes' :
                     day === 'wednesday' ? 'Miércoles' :
                     day === 'thursday' ? 'Jueves' :
                     day === 'friday' ? 'Viernes' :
                     day === 'saturday' ? 'Sábado' : 'Domingo'}
                  </div>
                  <div className={`text-sm mt-1 ${config.available ? 'text-green-600' : 'text-gray-400'}`}>
                    {config.available ? `${config.start} - ${config.end}` : 'No disponible'}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Las áreas verdes punteadas en el calendario muestran tus horarios de disponibilidad.
                Las citas confirmadas aparecen en colores sólidos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Leyenda de estados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leyenda de Estados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.3)', border: '2px dashed #22c55e' }} />
                <span className="text-sm font-medium">Disponible</span>
              </div>
              {Object.entries(statusLabels).map(([status, label]) => (
                <div key={status} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: statusColors[status as keyof typeof statusColors] }}
                  />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendario */}
        <Card>
          <CardContent className="p-0">
            <div style={{ height: '700px' }}>
              <Calendar
                localizer={localizer}
                events={allEvents as any}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                view={view}
                onView={handleViewChange}
                date={currentDate}
                onNavigate={handleNavigate}
                onSelectEvent={handleSelectEvent as any}
                eventPropGetter={availabilityStyleGetter as any}
                components={{
                  event: EventComponent as any,
                  toolbar: CustomToolbar
                }}
                messages={{
                  next: "Siguiente",
                  previous: "Anterior",
                  today: "Hoy",
                  month: "Mes",
                  week: "Semana",
                  day: "Día",
                  agenda: "Agenda",
                  date: "Fecha",
                  time: "Hora",
                  event: "Evento",
                  noEventsInRange: "No hay citas en este período.",
                  showMore: (total) => `+ Ver ${total} más`,
                }}
                culture="es"
              />
            </div>
          </CardContent>
        </Card>

        {/* Modal de detalles de cita */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Detalles de la Cita</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAppointment(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                {/* Información básica */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha y Hora</label>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">
                        {format(selectedAppointment.start, "dd/MM/yyyy 'a las' HH:mm")}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duración</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{selectedAppointment.resource.duration} minutos</span>
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <div className="mt-1">
                    <Badge
                      style={{
                        backgroundColor: statusColors[selectedAppointment.resource.status as keyof typeof statusColors]
                      }}
                      className="text-white"
                    >
                      {statusLabels[selectedAppointment.resource.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </div>

                {/* Cliente */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Cliente</label>
                  <div className="flex items-center gap-3 mt-1 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{selectedAppointment.resource.client.name}</div>
                      <div className="text-sm text-gray-500">{selectedAppointment.resource.client.email}</div>
                      {selectedAppointment.resource.client.phone && (
                        <div className="text-sm text-gray-500">{selectedAppointment.resource.client.phone}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Propiedad */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Propiedad</label>
                  <div className="flex items-start gap-3 mt-1 p-3 bg-green-50 rounded-lg">
                    <Building className="w-5 h-5 text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{selectedAppointment.resource.property.title}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        {selectedAppointment.resource.property.address}, {selectedAppointment.resource.property.city}, {selectedAppointment.resource.property.state}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Tipo: {selectedAppointment.resource.property.type}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notas */}
                {selectedAppointment.resource.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notas</label>
                    <div className="mt-1 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedAppointment.resource.notes}</p>
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-3 pt-4 border-t">
                  <Link href={`/citas/${selectedAppointment.id}`}>
                    <Button>
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles Completos
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAppointment(null)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}