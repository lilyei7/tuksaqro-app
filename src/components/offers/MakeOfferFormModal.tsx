"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, User, Mail, Phone, Check, Loader2, TrendingDown, LogIn } from "lucide-react"
import { useAutoAssignment } from "@/hooks/useAutoAssignment"

interface MakeOfferFormModalProps {
  propertyId: string
  propertyTitle: string
  originalPrice: number
  trigger: React.ReactNode
  onSuccess?: () => void
}

export function MakeOfferFormModal({
  propertyId,
  propertyTitle,
  originalPrice,
  trigger,
  onSuccess
}: MakeOfferFormModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    offerPrice: "",
    terms: "",
    notes: ""
  })

  const { data: session } = useSession()
  const router = useRouter()
  const { assignOffer, isLoading, error } = useAutoAssignment()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculateDiscount = () => {
    if (!formData.offerPrice) return 0
    const discount = originalPrice - parseFloat(formData.offerPrice)
    return ((discount / originalPrice) * 100).toFixed(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage("")

    try {
      if (!session?.user?.id) {
        setSuccessMessage("❌ Debes estar autenticado para hacer una oferta")
        return
      }

      const result = await assignOffer({
        propertyId,
        clientId: session.user.id,
        amount: parseFloat(formData.offerPrice),
        currency: "MXN",
        conditions: formData.terms || "Condiciones estándar"
      })

      if (result?.success) {
        setSuccessMessage(
          `✅ ¡Oferta registrada! Tu oferta ha sido creada. Nos contactaremos contigo pronto.`
        )
        
        setTimeout(() => {
          setOpen(false)
          setFormData({
            name: "",
            email: "",
            phone: "",
            offerPrice: "",
            terms: "",
            notes: ""
          })
          onSuccess?.()
        }, 2000)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const discount = calculateDiscount()

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
              <LogIn className="w-5 h-5 text-green-600" />
              Inicia Sesión para Hacer Oferta
            </DialogTitle>
            <DialogDescription>
              {propertyTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <p className="text-gray-600">
              Para hacer una oferta en esta propiedad, necesitas tener una cuenta activa.
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
          <p className="text-xs text-gray-500 text-center">
            Al registrarte, podrás hacer ofertas y gestionar tus propiedades favoritas.
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>
        {trigger}
      </div>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Hacer Oferta
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
            {/* Precio original */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-600 font-medium mb-1">Precio de lista</p>
              <p className="text-2xl font-bold text-blue-700">
                ${originalPrice.toLocaleString("es-MX")}
              </p>
            </div>

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

            {/* Precio de la oferta */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Tu Oferta *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 font-medium">$</span>
                <Input
                  name="offerPrice"
                  type="number"
                  value={formData.offerPrice}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                  disabled={isSubmitting}
                  className="pl-8"
                />
              </div>
              {discount && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  {discount}% menos que el precio de lista
                </p>
              )}
            </div>

            {/* Términos de pago */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Términos de pago
              </label>
              <select
                name="terms"
                value={formData.terms}
                onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Selecciona los términos...</option>
                <option value="cash">Pago en efectivo</option>
                <option value="financing">Con financiamiento</option>
                <option value="installments">Plazos</option>
                <option value="subject_to_inspection">Sujeto a inspección</option>
              </select>
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
                placeholder="Cuéntanos más sobre tu oferta..."
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
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Enviar Oferta
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Un asesor disponible revisará tu oferta inmediatamente
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
