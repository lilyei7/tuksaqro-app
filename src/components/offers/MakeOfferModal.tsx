"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DollarSign, FileText, Loader } from "lucide-react"
import { toast } from "react-hot-toast"
import SafeImage from "@/components/common/SafeImage"

interface Property {
  id: string
  title: string
  price: number
  currency: string
  images?: string[]
  address: string
  city: string
  state: string
  status: string
}

interface MakeOfferModalProps {
  property: Property
  trigger?: React.ReactNode
  onOfferCreated?: () => void
}

export function MakeOfferModal({ property, trigger, onOfferCreated }: MakeOfferModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: property.price.toString(),
    currency: property.currency || "MXN",
    conditions: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Ingresa un monto válido")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: property.id,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          conditions: formData.conditions.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la oferta")
      }

      toast.success("¡Oferta enviada exitosamente!")
      setIsOpen(false)
      onOfferCreated?.()

      // Reset form
      setFormData({
        amount: property.price.toString(),
        currency: property.currency || "MXN",
        conditions: "",
      })
    } catch (error) {
      console.error("Error creating offer:", error)
      toast.error(error instanceof Error ? error.message : "Error al enviar la oferta")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, "")
    setFormData(prev => ({ ...prev, amount: cleanValue }))
  }

  const mainImage = property.images?.[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3C/svg%3E"

  const formattedPrice = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: property.currency || "MXN",
    minimumFractionDigits: 0,
  }).format(property.price)

  const isAvailable = property.status === "AVAILABLE"

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className="bg-brand-blue hover:bg-brand-blue/90 text-white"
            disabled={!isAvailable}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Hacer Oferta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Hacer Oferta
          </DialogTitle>
          <DialogDescription>
            Completa la información para hacer una oferta por esta propiedad
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la propiedad */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <SafeImage
                  src={mainImage}
                  alt={property.title}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {property.title}
                </h3>
                <p className="text-lg font-bold text-brand-blue mt-1">
                  {formattedPrice}
                </p>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {property.address}, {property.city}
                </p>
                <div className="mt-2">
                  <Badge
                    className={`${
                      isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    } text-xs`}
                  >
                    {isAvailable ? "Disponible" : "No disponible"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {!isAvailable && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                Esta propiedad ya no está disponible para ofertas.
              </p>
            </div>
          )}

          {isAvailable && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Monto de la oferta */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Monto de la oferta *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="amount"
                    type="text"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Precio de lista: {formattedPrice}
                </p>
              </div>

              {/* Condiciones adicionales */}
              <div className="space-y-2">
                <Label htmlFor="conditions" className="text-sm font-medium">
                  Condiciones adicionales (opcional)
                </Label>
                <Textarea
                  id="conditions"
                  placeholder="Ej: Pago inicial del 20%, financiamiento propio, fecha límite de respuesta..."
                  value={formData.conditions}
                  onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  Especifica cualquier condición especial para tu oferta
                </p>
              </div>

              {/* Información importante */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Información importante:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Tu oferta será enviada directamente al propietario</li>
                      <li>• Podrás modificar o cancelar la oferta mientras esté pendiente</li>
                      <li>• El propietario puede aceptar, rechazar o hacer una contraoferta</li>
                      <li>• Recibirás una notificación cuando haya una respuesta</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-brand-blue hover:bg-brand-blue/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Enviar Oferta
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}