"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Clock,
  Save,
  ChevronLeft,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { toast } from "react-hot-toast"

interface Availability {
  monday: { start: string; end: string; available: boolean }
  tuesday: { start: string; end: string; available: boolean }
  wednesday: { start: string; end: string; available: boolean }
  thursday: { start: string; end: string; available: boolean }
  friday: { start: string; end: string; available: boolean }
  saturday: { start: string; end: string; available: boolean }
  sunday: { start: string; end: string; available: boolean }
}

const dayLabels = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
}

const timeOptions = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00'
]

export default function AvailabilitySettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [availability, setAvailability] = useState<Availability>({
    monday: { start: '09:00', end: '18:00', available: true },
    tuesday: { start: '09:00', end: '18:00', available: true },
    wednesday: { start: '09:00', end: '18:00', available: true },
    thursday: { start: '09:00', end: '18:00', available: true },
    friday: { start: '09:00', end: '18:00', available: true },
    saturday: { start: '09:00', end: '14:00', available: false },
    sunday: { start: '09:00', end: '14:00', available: false },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session || (session.user as any)?.role !== "AGENT") {
      router.push("/auth/login")
      return
    }

    fetchAvailability()
  }, [session, status])

  const fetchAvailability = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/agent/availability')
      if (response.ok) {
        const data = await response.json()
        if (data.availability) {
          setAvailability(data.availability)
        }
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Validar que las horas sean coherentes
      for (const [day, config] of Object.entries(availability)) {
        if (config.available) {
          const startTime = config.start
          const endTime = config.end

          if (startTime >= endTime) {
            toast.error(`La hora de fin debe ser posterior a la hora de inicio para ${dayLabels[day as keyof typeof dayLabels]}`)
            return
          }
        }
      }

      const response = await fetch('/api/agent/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ availability }),
      })

      if (response.ok) {
        toast.success('Disponibilidad guardada correctamente')
      } else {
        toast.error('Error al guardar la disponibilidad')
      }
    } catch (error) {
      console.error('Error saving availability:', error)
      toast.error('Error al guardar la disponibilidad')
    } finally {
      setIsSaving(false)
    }
  }

  const updateDayAvailability = (day: keyof Availability, field: string, value: any) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const copyToAllDays = () => {
    const mondayConfig = availability.monday
    setAvailability({
      monday: mondayConfig,
      tuesday: { ...mondayConfig },
      wednesday: { ...mondayConfig },
      thursday: { ...mondayConfig },
      friday: { ...mondayConfig },
      saturday: { ...mondayConfig },
      sunday: { ...mondayConfig },
    })
    toast.success('Configuración copiada a todos los días')
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  if (!session || (session.user as any)?.role !== "AGENT") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurar Disponibilidad</h1>
            <p className="text-gray-600 mt-1">
              Establece tus horarios de trabajo para que los clientes sepan cuándo estás disponible
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={copyToAllDays}
            >
              Copiar Lunes a Todos
            </Button>
            <Link href="/dashboard/calendario">
              <Button variant="outline">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Ver Calendario
              </Button>
            </Link>
          </div>
        </div>

        {/* Información importante */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Información Importante</h3>
                <p className="text-sm text-blue-800">
                  Tu disponibilidad se mostrará en el calendario como áreas verdes punteadas.
                  Los clientes solo podrán agendar citas dentro de tus horarios disponibles.
                  Recuerda guardar los cambios después de modificar tu configuración.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración por día */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horarios de Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(availability).map(([day, config]) => (
              <div key={day} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {dayLabels[day as keyof typeof dayLabels]}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${day}-available`} className="text-sm">
                      Disponible
                    </Label>
                    <input
                      type="checkbox"
                      id={`${day}-available`}
                      checked={config.available}
                      onChange={(e) => updateDayAvailability(day as keyof Availability, 'available', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </div>
                </div>

                {config.available ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`${day}-start`} className="text-sm font-medium">
                        Hora de Inicio
                      </Label>
                      <Select
                        value={config.start}
                        onValueChange={(value) => updateDayAvailability(day as keyof Availability, 'start', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(time => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`${day}-end`} className="text-sm font-medium">
                        Hora de Fin
                      </Label>
                      <Select
                        value={config.end}
                        onValueChange={(value) => updateDayAvailability(day as keyof Availability, 'end', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(time => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No disponible este día
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Vista previa */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa de Disponibilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(availability).map(([day, config]) => (
                <div key={day} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 capitalize">
                    {dayLabels[day as keyof typeof dayLabels]}
                  </div>
                  <div className={`text-sm mt-1 ${config.available ? 'text-green-600' : 'text-gray-400'}`}>
                    {config.available ? `${config.start} - ${config.end}` : 'No disponible'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Botón de guardar */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Disponibilidad
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}