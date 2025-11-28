"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface AppointmentBookingProps {
  propertyId: string
  agentId?: string
}

export function AppointmentBooking({ propertyId, agentId }: AppointmentBookingProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>("")
  const [duration, setDuration] = useState<string>("60")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const handleBookAppointment = async () => {
    if (!session) {
      toast.error("Debes iniciar sesión para agendar una cita")
      router.push("/auth/login")
      return
    }

    if (!date || !time) {
      toast.error("Por favor selecciona una fecha y hora")
      return
    }

    setLoading(true)

    try {
      // Combinar fecha y hora
      const [hours, minutes] = time.split(":").map(Number)
      const appointmentDate = new Date(date)
      appointmentDate.setHours(hours, minutes, 0, 0)

      // Verificar que la fecha no sea en el pasado
      if (appointmentDate < new Date()) {
        toast.error("No puedes agendar una cita en el pasado")
        setLoading(false)
        return
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId,
          agentId,
          date: appointmentDate.toISOString(),
          duration: parseInt(duration),
          notes: notes.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al agendar la cita")
      }

      toast.success("¡Cita agendada exitosamente!")
      setOpen(false)
      
      // Resetear el formulario
      setDate(undefined)
      setTime("")
      setDuration("60")
      setNotes("")
      
      // Redirigir a la página de citas
      router.push("/citas")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al agendar la cita")
    } finally {
      setLoading(false)
    }
  }

  // Generar opciones de tiempo cada 30 minutos desde las 9am hasta las 6pm
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break // Terminar a las 6pm
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        const displayTime = format(new Date(2024, 0, 1, hour, minute), "h:mm a")
        slots.push({ value: timeString, label: displayTime })
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Desactivar días pasados y domingos
  const disabledDays = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today || date.getDay() === 0 // Desactivar domingos
  }

  const userRole = (session?.user as any)?.role

  // Los clientes no pueden agendar sus propias propiedades
  if (userRole === "OWNER" || userRole === "AGENT") {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Agendar Visita
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Visita</DialogTitle>
          <DialogDescription>
            Selecciona la fecha y hora para visitar esta propiedad
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Fecha de la visita</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={disabledDays}
              locale={es}
              className="rounded-md border"
            />
          </div>

          {date && (
            <>
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Selecciona una hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duración</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1.5 horas</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="¿Hay algo específico que te gustaría ver o preguntar?"
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleBookAppointment} disabled={loading || !date || !time}>
            {loading ? "Agendando..." : "Confirmar Cita"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}