"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, User, Mail, Phone, Check, Loader2, LogIn } from "lucide-react"
import { useAutoAssignment } from "@/hooks/useAutoAssignment"
import { useRouter } from "next/navigation"

interface ScheduleAppointmentModalProps {
  propertyId: string
  propertyTitle: string
  trigger: React.ReactNode
  onSuccess?: () => void
}

export function ScheduleAppointmentModal({
  propertyId,
  propertyTitle,
  trigger,
  onSuccess
}: ScheduleAppointmentModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    notes: ""
  })

  const { data: session, status } = useSession()
  const router = useRouter()
  const { assignAppointment, isLoading, error } = useAutoAssignment()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage("")

    try {
      if (!session?.user?.id) {
        setSuccessMessage("❌ Debes estar autenticado para agendar una cita")
        return
      }

      const preferredDateTime = new Date(`${formData.date}T${formData.time}`)

      const result = await assignAppointment({
        propertyId,
        clientId: session.user.id,
        preferredDate: preferredDateTime.toISOString(),
        notes: formData.notes || `Solicitud de ${session.user.name || formData.name}`
      })

      if (result?.success) {
        setSuccessMessage(
          `✅ ¡Cita agendada! Se asignó a ${result.assignedTo?.name || "un asesor"}. Te contactarán pronto.`
        )
        
        setTimeout(() => {
          setOpen(false)
          setFormData({
            name: "",
            email: "",
            phone: "",
            date: new Date().toISOString().split("T")[0],
            time: "10:00",
            notes: ""
          })
          onSuccess?.()
        }, 2000)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Si no hay sesión, mostrar aviso de login
  if (!session?.user) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <div onClick={() => setOpen(true)}>
          {trigger}
        </div>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-blue-600" />
              Inicia Sesión para Agendar
            </DialogTitle>
            <DialogDescription>
              {propertyTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <p className="text-gray-600">
              Para agendar una visita a esta propiedad, necesitas tener una cuenta activa.
            </p>
            <Button
              onClick={() => router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.pathname))}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <LogIn className="w-5 h-5" />
              Iniciar Sesión
            </Button>
            <Button
              onClick={() => router.push("/auth/register?callbackUrl=" + encodeURIComponent(window.location.pathname))}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              Crear Cuenta
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Volver
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Agendar Visita
          </DialogTitle>
          <DialogDescription>
            {propertyTitle}
          </DialogDescription>
        </DialogHeader>

        {successMessage ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-center text-green-700 font-medium">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                <User className="w-4 h-4 inline mr-2" />
                Nombre completo *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Tu nombre"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                <Mail className="w-4 h-4 inline mr-2" />
                Email *
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                <Phone className="w-4 h-4 inline mr-2" />
                Teléfono
              </label>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 000-0000"
                disabled={isSubmitting}
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                <Calendar className="w-4 h-4 inline mr-2" />
                Fecha preferida *
              </label>
              <Input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Hora */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                <Clock className="w-4 h-4 inline mr-2" />
                Hora preferida *
              </label>
              <Input
                name="time"
                type="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Notas */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Notas adicionales
              </label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Cuéntanos qué te interesa de esta propiedad..."
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            {/* Mensajes */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Agendar Cita
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Nos asignaremos un asesor disponible automáticamente para contactarte
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
